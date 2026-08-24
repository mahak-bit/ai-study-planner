import { addDays, format } from 'date-fns';

import { prisma } from '@/lib/db/prisma';
import { rebalanceMissedTask } from '@/lib/services/scheduling/rebalance';
import { NotFoundError } from '@/lib/services/subject.service';
import type { CreateTaskInput, MarkMissedInput } from '@/lib/validations/task.schema';

const MANUAL_PLAN_WINDOW_DAYS = 60;
const REBALANCE_HORIZON_DAYS = 14;
const ISO = 'yyyy-MM-dd';

async function getOrCreateActivePlan(userId: string) {
  const existing = await prisma.studyPlan.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) return existing;

  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + MANUAL_PLAN_WINDOW_DAYS);

  return prisma.studyPlan.create({
    data: { userId, periodStart, periodEnd, status: 'ACTIVE', generatedBy: 'MANUAL' },
  });
}

export async function listTasksInRange(userId: string, startDate: string, endDate: string) {
  return prisma.studyTask.findMany({
    where: {
      userId,
      scheduledDate: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    include: { subject: true, topic: true },
    orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const subject = await prisma.subject.findFirst({
    where: { id: input.subjectId, userId },
    select: { id: true },
  });
  if (!subject) throw new NotFoundError('Subject not found');

  if (input.topicId) {
    const topic = await prisma.topic.findFirst({
      where: { id: input.topicId, subjectId: input.subjectId },
      select: { id: true },
    });
    if (!topic) throw new NotFoundError('Topic not found');
  }

  const plan = await getOrCreateActivePlan(userId);

  return prisma.studyTask.create({
    data: {
      planId: plan.id,
      userId,
      subjectId: input.subjectId,
      topicId: input.topicId || null,
      title: input.title,
      scheduledDate: new Date(input.scheduledDate),
      durationMinutes: input.durationMinutes,
      priority: input.priority,
    },
  });
}

export async function completeTask(userId: string, taskId: string) {
  const result = await prisma.studyTask.updateMany({
    where: { id: taskId, userId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
  if (result.count === 0) throw new NotFoundError('Task not found');
}

export async function reopenTask(userId: string, taskId: string) {
  const result = await prisma.studyTask.updateMany({
    where: { id: taskId, userId },
    data: { status: 'PENDING', completedAt: null, missedReason: null, missedNote: null },
  });
  if (result.count === 0) throw new NotFoundError('Task not found');
}

export interface RebalanceSummary {
  redistributedMinutes: number;
  affectedTaskCount: number;
  unresolvedMinutes: number;
}

// Deterministic redistribution (src/lib/services/scheduling/rebalance.ts) --
// the graceful-degradation fallback that always works even when the
// AI-enhanced path (optimizeScheduleWithAI in plan.service.ts) isn't used.
export async function markTaskMissed(
  userId: string,
  input: MarkMissedInput
): Promise<RebalanceSummary> {
  const missedTask = await prisma.studyTask.findFirst({ where: { id: input.taskId, userId } });
  if (!missedTask) throw new NotFoundError('Task not found');

  const today = format(new Date(), ISO);
  const horizonEnd = format(addDays(new Date(), REBALANCE_HORIZON_DAYS), ISO);

  const [pendingTasks, profile, topics, examTopics] = await Promise.all([
    prisma.studyTask.findMany({
      where: {
        userId,
        status: 'PENDING',
        id: { not: missedTask.id },
        scheduledDate: { gte: new Date(today), lte: new Date(horizonEnd) },
      },
    }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.topic.findMany({
      where: { subject: { userId } },
      select: { id: true, confidenceLevel: true },
    }),
    prisma.examTopic.findMany({
      where: { exam: { userId } },
      select: { topicId: true, exam: { select: { examDate: true } } },
    }),
  ]);

  const topicConfidence: Record<string, number> = {};
  for (const t of topics) topicConfidence[t.id] = t.confidenceLevel;

  const topicExamDates: Record<string, string[]> = {};
  for (const et of examTopics) {
    const key = format(et.exam.examDate, ISO);
    (topicExamDates[et.topicId] ??= []).push(key);
  }

  const weeklyHours = (profile?.weeklyAvailabilityHours as Record<string, number> | null) ?? {};
  const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dailyCapMinutesByDate: Record<string, number> = {};
  const currentLoadByDate: Record<string, number> = {};
  for (const task of pendingTasks) {
    const key = format(task.scheduledDate, ISO);
    currentLoadByDate[key] = (currentLoadByDate[key] ?? 0) + task.durationMinutes;
  }
  for (let d = new Date(today); format(d, ISO) <= horizonEnd; d = addDays(d, 1)) {
    const key = format(d, ISO);
    const hours = weeklyHours[weekdayKeys[d.getDay()]];
    if (typeof hours === 'number') dailyCapMinutesByDate[key] = hours * 60;
  }

  const result = rebalanceMissedTask({
    missedTask: {
      id: missedTask.id,
      scheduledDate: format(missedTask.scheduledDate, ISO),
      durationMinutes: missedTask.durationMinutes,
      topicId: missedTask.topicId,
    },
    pendingTasks: pendingTasks.map((t) => ({
      id: t.id,
      scheduledDate: format(t.scheduledDate, ISO),
      durationMinutes: t.durationMinutes,
      topicId: t.topicId,
    })),
    today,
    horizonEnd,
    topicConfidence,
    topicExamDates,
    currentLoadByDate,
    dailyCapMinutesByDate,
  });

  await prisma.$transaction(async (tx) => {
    await tx.studyTask.update({
      where: { id: input.taskId },
      data: {
        status: 'MISSED',
        missedReason: input.missedReason,
        missedNote: input.missedNote || null,
      },
    });

    for (const update of result.updates) {
      await tx.studyTask.update({
        where: { id: update.taskId },
        data: { durationMinutes: { increment: update.addedMinutes } },
      });
    }

    if (result.unresolvedMinutes > 0) {
      await tx.recommendation.create({
        data: {
          userId,
          type: 'SCHEDULE_SHORTFALL',
          title: 'Some missed study time couldn’t be rescheduled',
          description: `"${missedTask.title}" was missed, and ${result.unresolvedMinutes} of its ${missedTask.durationMinutes} minutes couldn't fit into the next ${REBALANCE_HORIZON_DAYS} days without exceeding your daily availability. Consider adjusting your schedule or availability.`,
          status: 'ACTIVE',
          generatedBy: 'MANUAL',
        },
      });
    }
  });

  return {
    redistributedMinutes: missedTask.durationMinutes - result.unresolvedMinutes,
    affectedTaskCount: result.updates.length,
    unresolvedMinutes: result.unresolvedMinutes,
  };
}

export async function deleteTask(userId: string, taskId: string) {
  const result = await prisma.studyTask.deleteMany({ where: { id: taskId, userId } });
  if (result.count === 0) throw new NotFoundError('Task not found');
}
