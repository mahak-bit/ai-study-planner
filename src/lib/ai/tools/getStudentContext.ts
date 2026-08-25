import { tool } from 'ai';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { getStreak } from '@/lib/services/analytics.service';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';

// Bound to userId via closure, never taken as a model-supplied argument --
// the coach can only ever see the requesting student's own data.
export function createGetStudentContextTool(userId: string) {
  return tool({
    description:
      "Get the student's overall profile: education level, goals, weekly availability, subjects with mastery progress, and current study streak. Call this first to orient before answering.",
    inputSchema: z.object({}),
    execute: async () => {
      const [profile, subjects, streak] = await Promise.all([
        prisma.profile.findUnique({ where: { userId } }),
        listSubjectsWithProgress(userId),
        getStreak(userId),
      ]);

      return {
        educationLevel: profile?.educationLevel ?? null,
        goals: profile?.goals ?? null,
        weeklyAvailabilityHours: profile?.weeklyAvailabilityHours ?? {},
        preferredStudyTimes: profile?.preferredStudyTimes ?? [],
        currentStreakDays: streak,
        subjects: subjects.map((s) => ({
          name: s.name,
          topicCount: s.topicCount,
          masteredCount: s.masteredCount,
          avgConfidence: Math.round(s.avgConfidence * 10) / 10,
        })),
      };
    },
  });
}
