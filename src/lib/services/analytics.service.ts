import { format, subDays } from 'date-fns';

import { prisma } from '@/lib/db/prisma';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';
import { listUpcomingExams } from '@/lib/services/exam.service';

const ISO = 'yyyy-MM-dd';

function computeStreak(completedDates: Date[]): number {
  const days = new Set(completedDates.map((d) => format(d, ISO)));
  let cursor = new Date();
  // Don't zero out the streak just because today's tasks aren't done yet --
  // only start counting backward from yesterday if today has nothing.
  if (!days.has(format(cursor, ISO))) cursor = subDays(cursor, 1);

  let streak = 0;
  while (days.has(format(cursor, ISO))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export async function getDashboardData(userId: string) {
  const todayStart = new Date(`${format(new Date(), ISO)}T00:00:00.000Z`);

  const [todayTasks, weakTopics, upcomingExams, activeRecommendations, completedTasks] =
    await Promise.all([
      prisma.studyTask.findMany({
        where: { userId, scheduledDate: todayStart, status: { in: ['PENDING', 'COMPLETED'] } },
        include: { subject: true, topic: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      }),
      prisma.topic.findMany({
        where: { subject: { userId }, confidenceLevel: { lte: 2 } },
        include: { subject: true },
        orderBy: { confidenceLevel: 'asc' },
        take: 5,
      }),
      listUpcomingExams(userId, 5),
      prisma.recommendation.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyTask.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { not: null } },
        select: { completedAt: true },
      }),
    ]);

  return {
    todayTasks,
    weakTopics,
    upcomingExams,
    activeRecommendations,
    streak: computeStreak(completedTasks.map((t) => t.completedAt!)),
  };
}

export interface AnalyticsOverview {
  studyTimeByDay: { date: string; minutes: number }[];
  completionRate: number | null;
  completedCount: number;
  missedCount: number;
  subjectProgress: Awaited<ReturnType<typeof listSubjectsWithProgress>>;
}

export async function getAnalyticsOverview(userId: string, days = 30): Promise<AnalyticsOverview> {
  const start = subDays(new Date(), days - 1);

  const [tasksInRange, subjectProgress] = await Promise.all([
    prisma.studyTask.findMany({
      where: { userId, scheduledDate: { gte: start }, status: { in: ['COMPLETED', 'MISSED'] } },
      select: { scheduledDate: true, durationMinutes: true, status: true },
    }),
    listSubjectsWithProgress(userId),
  ]);

  const studyTimeByDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    studyTimeByDay[format(subDays(new Date(), days - 1 - i), ISO)] = 0;
  }
  let completedCount = 0;
  let missedCount = 0;
  for (const task of tasksInRange) {
    if (task.status === 'COMPLETED') {
      completedCount++;
      const key = format(task.scheduledDate, ISO);
      if (key in studyTimeByDay) studyTimeByDay[key] += task.durationMinutes;
    } else {
      missedCount++;
    }
  }

  return {
    studyTimeByDay: Object.entries(studyTimeByDay).map(([date, minutes]) => ({ date, minutes })),
    completionRate:
      completedCount + missedCount > 0 ? completedCount / (completedCount + missedCount) : null,
    completedCount,
    missedCount,
    subjectProgress,
  };
}
