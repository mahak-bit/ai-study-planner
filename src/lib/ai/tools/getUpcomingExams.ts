import { tool } from 'ai';
import { differenceInCalendarDays, format } from 'date-fns';
import { z } from 'zod';

import { listUpcomingExams } from '@/lib/services/exam.service';

export function createGetUpcomingExamsTool(userId: string) {
  return tool({
    description: "Get the student's upcoming exams, soonest first, with days remaining.",
    inputSchema: z.object({}),
    execute: async () => {
      const exams = await listUpcomingExams(userId, 10);
      return exams.map((e) => ({
        title: e.title,
        subject: e.subject.name,
        examDate: format(e.examDate, 'yyyy-MM-dd'),
        daysAway: Math.max(0, differenceInCalendarDays(e.examDate, new Date())),
        priority: e.priority,
      }));
    },
  });
}
