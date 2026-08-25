import { differenceInCalendarDays, format } from 'date-fns';

import { AgentError } from '@/lib/ai/agentError';
import { runProgressAgent, type ProgressAgentInput } from '@/lib/ai/agents/progressAgent';
import type { ProgressOutput } from '@/lib/ai/schemas/progress.schema';
import { prisma } from '@/lib/db/prisma';
import { getAnalyticsOverview, getDashboardData } from '@/lib/services/analytics.service';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';

const ISO = 'yyyy-MM-dd';

export class ProgressGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressGenerationError';
  }
}

async function buildAgentInput(userId: string): Promise<{
  input: ProgressAgentInput;
  validSubjectIds: Set<string>;
  validTopicIds: Set<string>;
}> {
  const [dashboard, overview, subjects] = await Promise.all([
    getDashboardData(userId),
    getAnalyticsOverview(userId, 30),
    listSubjectsWithProgress(userId),
  ]);

  const studiedDaysLast14 = overview.studyTimeByDay.slice(-14).filter((d) => d.minutes > 0).length;

  const input: ProgressAgentInput = {
    today: format(new Date(), ISO),
    streak: dashboard.streak,
    completionRatePercent:
      overview.completionRate === null ? null : Math.round(overview.completionRate * 100),
    studiedDaysLast14,
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      topicCount: s.topicCount,
      masteredCount: s.masteredCount,
      avgConfidence: s.avgConfidence,
    })),
    weakTopics: dashboard.weakTopics.map((t) => ({
      id: t.id,
      subjectId: t.subjectId,
      name: t.name,
      subjectName: t.subject.name,
      confidenceLevel: t.confidenceLevel,
    })),
    upcomingExams: dashboard.upcomingExams.map((e) => ({
      subjectId: e.subjectId,
      title: e.title,
      subjectName: e.subject.name,
      daysAway: Math.max(0, differenceInCalendarDays(e.examDate, new Date())),
      priority: e.priority,
    })),
  };

  return {
    input,
    validSubjectIds: new Set(subjects.map((s) => s.id)),
    validTopicIds: new Set(subjects.flatMap((s) => s.topics.map((t) => t.id))),
  };
}

export async function generateAIInsights(userId: string) {
  const { input, validSubjectIds, validTopicIds } = await buildAgentInput(userId);

  if (input.subjects.length === 0) {
    throw new ProgressGenerationError('Add at least one subject before generating insights');
  }

  const startedAt = Date.now();
  let agentResult: Awaited<ReturnType<typeof runProgressAgent>>;
  try {
    agentResult = await runProgressAgent(input);
  } catch (error) {
    await logGeneration(userId, input, null, error, Date.now() - startedAt);
    throw error;
  }

  // Structured output passed schema validation, but a referenced subject/
  // topic ID could still belong to a different user or not exist -- never
  // trust generated IDs for a write without checking them first.
  const validInsights = agentResult.output.insights.filter((insight) => {
    if (insight.relatedSubjectId && !validSubjectIds.has(insight.relatedSubjectId)) return false;
    if (insight.relatedTopicId && !validTopicIds.has(insight.relatedTopicId)) return false;
    return true;
  });

  if (validInsights.length === 0) {
    const error = new ProgressGenerationError("The generated insights didn't reference valid data");
    await logGeneration(userId, input, agentResult, error, Date.now() - startedAt);
    throw error;
  }

  const recommendations = await prisma.$transaction(async (tx) => {
    // Supersede the previous AI-generated batch rather than piling up --
    // SCHEDULE_SHORTFALL recommendations (from the deterministic rebalance
    // in task.service.ts) are a different concern and left untouched.
    await tx.recommendation.updateMany({
      where: { userId, status: 'ACTIVE', generatedBy: 'AI', type: { not: 'SCHEDULE_SHORTFALL' } },
      data: { status: 'DISMISSED' },
    });

    return Promise.all(
      validInsights.map((insight) =>
        tx.recommendation.create({
          data: {
            userId,
            type: insight.type,
            title: insight.title,
            description: insight.description,
            status: 'ACTIVE',
            generatedBy: 'AI',
            metadata: {
              subjectId: insight.relatedSubjectId,
              topicId: insight.relatedTopicId,
            },
          },
        })
      )
    );
  });

  await logGeneration(userId, input, agentResult, null, Date.now() - startedAt);

  return {
    summary: agentResult.output.summary,
    riskLevel: agentResult.output.riskLevel,
    recommendations,
  };
}

async function logGeneration(
  userId: string,
  input: ProgressAgentInput,
  agentResult: {
    output: ProgressOutput;
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
      agentName: 'ProgressAgent',
      input: input as unknown as object,
      output: agentResult ? (agentResult.output as unknown as object) : undefined,
      model: agentResult?.model ?? 'gemini-3.6-flash',
      promptTokens: agentResult?.promptTokens,
      completionTokens: agentResult?.completionTokens,
      latencyMs,
      success: !error,
      errorMessage: error
        ? error instanceof AgentError || error instanceof ProgressGenerationError
          ? error.message
          : 'Unknown error'
        : undefined,
    },
  });
}
