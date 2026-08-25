import { tool } from 'ai';
import { format } from 'date-fns';
import { z } from 'zod';

import { listTasksInRange } from '@/lib/services/task.service';

export function createGetTodayTasksTool(userId: string) {
  return tool({
    description:
      "Get the student's scheduled study tasks for today, including their status (pending, completed, missed).",
    inputSchema: z.object({}),
    execute: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const tasks = await listTasksInRange(userId, today, today);
      return tasks.map((t) => ({
        title: t.title,
        subject: t.subject?.name ?? null,
        topic: t.topic?.name ?? null,
        durationMinutes: t.durationMinutes,
        priority: t.priority,
        status: t.status,
      }));
    },
  });
}
