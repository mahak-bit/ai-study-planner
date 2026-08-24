import { z } from 'zod';

import { priorities } from '@/lib/validations/onboarding.schema';

export const createExamSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().trim().min(1, 'Exam title is required').max(150),
  examDate: z.string().min(1, 'Choose a date'),
  priority: z.enum(priorities),
  topicIds: z.array(z.string()),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

export const updateExamSchema = createExamSchema.extend({ id: z.string().min(1) });

export type UpdateExamInput = z.infer<typeof updateExamSchema>;
