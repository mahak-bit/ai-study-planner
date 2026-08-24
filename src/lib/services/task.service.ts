import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/services/subject.service';
import type { CreateTaskInput, MarkMissedInput } from '@/lib/validations/task.schema';

const MANUAL_PLAN_WINDOW_DAYS = 60;

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

// Redistribution of the missed minutes onto other tasks is wired up in a
// later phase alongside the AI-enhanced path — see
// src/lib/services/scheduling/rebalance.ts for the (already tested)
// deterministic algorithm this will call.
export async function markTaskMissed(userId: string, input: MarkMissedInput) {
  const result = await prisma.studyTask.updateMany({
    where: { id: input.taskId, userId },
    data: {
      status: 'MISSED',
      missedReason: input.missedReason,
      missedNote: input.missedNote || null,
    },
  });
  if (result.count === 0) throw new NotFoundError('Task not found');
}

export async function deleteTask(userId: string, taskId: string) {
  const result = await prisma.studyTask.deleteMany({ where: { id: taskId, userId } });
  if (result.count === 0) throw new NotFoundError('Task not found');
}
