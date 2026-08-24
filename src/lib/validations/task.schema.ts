import { z } from 'zod';

import { priorities } from '@/lib/validations/onboarding.schema';

export const createTaskSchema = z.object({
  subjectId: z.string().min(1, 'Choose a subject'),
  topicId: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(150),
  scheduledDate: z.string().min(1, 'Choose a date'),
  durationMinutes: z.number().int().min(5, 'At least 5 minutes').max(480),
  priority: z.enum(priorities),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const missedReasons = ['NO_TIME', 'TOO_HARD', 'FORGOT', 'LOW_PRIORITY', 'OTHER'] as const;

export const markMissedSchema = z.object({
  taskId: z.string().min(1),
  missedReason: z.enum(missedReasons).optional(),
  missedNote: z.string().trim().max(300).optional(),
});

export type MarkMissedInput = z.infer<typeof markMissedSchema>;
