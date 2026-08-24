import { addDays, format } from 'date-fns';

import { AgentError } from '@/lib/ai/agentError';
import { runPlanningAgent, type PlanningAgentInput } from '@/lib/ai/agents/planningAgent';
import type { StudyPlanOutput } from '@/lib/ai/schemas/studyPlan.schema';
import { prisma } from '@/lib/db/prisma';

const ISO = 'yyyy-MM-dd';
const DEFAULT_WINDOW_DAYS = 7;

export class PlanGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanGenerationError';
  }
}

async function gatherContext(userId: string, periodStart: Date, periodEnd: Date) {
  const [profile, subjects, exams, existingTasks] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.subject.findMany({
      where: { userId },
      include: { topics: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.exam.findMany({
      where: { userId, examDate: { gte: periodStart, lte: addDays(periodEnd, 60) } },
      include: { topics: true },
      orderBy: { examDate: 'asc' },
    }),
    prisma.studyTask.findMany({
      where: {
        userId,
        scheduledDate: { gte: periodStart, lte: periodEnd },
        status: { in: ['PENDING', 'COMPLETED'] },
      },
      include: { plan: { select: { generatedBy: true } } },
    }),
  ]);

  return { profile, subjects, exams, existingTasks };
}

function buildCommittedMinutesByDate(
  existingTasks: Awaited<ReturnType<typeof gatherContext>>['existingTasks']
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const task of existingTasks) {
    // AI-generated PENDING tasks in this window get replaced by the new
    // plan, so they shouldn't count as "already committed" capacity.
    if (task.plan.generatedBy === 'AI' && task.status === 'PENDING') continue;

    const key = format(task.scheduledDate, ISO);
    result[key] = (result[key] ?? 0) + task.durationMinutes;
  }
  return result;
}

export async function generateAIStudyPlan(userId: string, windowDays = DEFAULT_WINDOW_DAYS) {
  const today = new Date();
  const periodStart = today;
  const periodEnd = addDays(today, windowDays - 1);

  const { profile, subjects, exams, existingTasks } = await gatherContext(
    userId,
    periodStart,
    periodEnd
  );

  const subjectsWithTopics = subjects.filter((s) => s.topics.length > 0);
  if (subjectsWithTopics.length === 0) {
    throw new PlanGenerationError('Add at least one subject with a topic before generating a plan');
  }

  const agentInput: PlanningAgentInput = {
    today: format(today, ISO),
    periodStart: format(periodStart, ISO),
    periodEnd: format(periodEnd, ISO),
    timezone: profile?.timezone ?? 'UTC',
    educationLevel: profile?.educationLevel ?? null,
    goals: profile?.goals ?? null,
    preferredStudyTimes: profile?.preferredStudyTimes ?? [],
    weeklyAvailabilityHours:
      (profile?.weeklyAvailabilityHours as Record<string, number> | null) ?? {},
    subjects: subjectsWithTopics.map((s) => ({
      id: s.id,
      name: s.name,
      topics: s.topics.map((t) => ({
        id: t.id,
        name: t.name,
        difficulty: t.difficulty,
        confidenceLevel: t.confidenceLevel,
        estimatedHours: t.estimatedHours,
        status: t.status,
      })),
    })),
    exams: exams.map((e) => ({
      id: e.id,
      title: e.title,
      subjectId: e.subjectId,
      examDate: format(e.examDate, ISO),
      priority: e.priority,
      topicIds: e.topics.map((t) => t.topicId),
    })),
    existingCommittedMinutesByDate: buildCommittedMinutesByDate(existingTasks),
  };

  const startedAt = Date.now();
  let agentResult: Awaited<ReturnType<typeof runPlanningAgent>>;
  try {
    agentResult = await runPlanningAgent(agentInput);
  } catch (error) {
    await logGeneration(userId, agentInput, null, error, Date.now() - startedAt);
    throw error;
  }

  const validTaskIds = {
    subjectIds: new Set(subjectsWithTopics.map((s) => s.id)),
    topicIds: new Set(subjectsWithTopics.flatMap((s) => s.topics.map((t) => t.id))),
  };

  // Structured output passed schema validation, but the model could still
  // reference an ID that doesn't belong to this user (or doesn't exist) --
  // never trust generated IDs for a write without checking them first.
  const validTasks = agentResult.output.tasks.filter((task) => {
    if (!validTaskIds.subjectIds.has(task.subjectId)) return false;
    if (task.topicId && !validTaskIds.topicIds.has(task.topicId)) return false;
    if (task.scheduledDate < agentInput.periodStart || task.scheduledDate > agentInput.periodEnd) {
      return false;
    }
    return true;
  });

  if (validTasks.length === 0) {
    const error = new PlanGenerationError("The generated plan didn't reference any valid subjects");
    await logGeneration(userId, agentInput, agentResult, error, Date.now() - startedAt);
    throw error;
  }

  const plan = await prisma.$transaction(async (tx) => {
    await tx.studyPlan.updateMany({
      where: { userId, status: 'ACTIVE', generatedBy: 'AI' },
      data: { status: 'SUPERSEDED' },
    });

    await tx.studyTask.deleteMany({
      where: {
        userId,
        status: 'PENDING',
        scheduledDate: { gte: periodStart, lte: periodEnd },
        plan: { generatedBy: 'AI' },
      },
    });

    return tx.studyPlan.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        status: 'ACTIVE',
        generatedBy: 'AI',
        rawAIResponse: agentResult.output as unknown as object,
        tasks: {
          create: validTasks.map((task) => ({
            userId,
            subjectId: task.subjectId,
            topicId: task.topicId,
            title: task.title,
            scheduledDate: new Date(task.scheduledDate),
            durationMinutes: task.durationMinutes,
            priority: task.priority,
          })),
        },
      },
      include: { tasks: true },
    });
  });

  await logGeneration(userId, agentInput, agentResult, null, Date.now() - startedAt);

  return { plan, summary: agentResult.output.summary, taskCount: plan.tasks.length };
}

async function logGeneration(
  userId: string,
  input: PlanningAgentInput,
  agentResult: {
    output: StudyPlanOutput;
    model: string;
    promptTokens?: number;
    completionTokens?: number;
  } | null,
  error: unknown,
  latencyMs: number
) {
  await prisma.aIGenerationLog.create({
    data: {
      userId,
      agentName: 'PlanningAgent',
      input: input as unknown as object,
      output: agentResult ? (agentResult.output as unknown as object) : undefined,
      model: agentResult?.model ?? 'gpt-5.6-luna',
      promptTokens: agentResult?.promptTokens,
      completionTokens: agentResult?.completionTokens,
      latencyMs,
      success: !error,
      errorMessage: error
        ? error instanceof AgentError || error instanceof PlanGenerationError
          ? error.message
          : 'Unknown error'
        : undefined,
    },
  });
}
