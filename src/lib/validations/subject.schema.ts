import { z } from 'zod';

import { SUBJECT_COLORS, difficulties } from '@/lib/validations/onboarding.schema';

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  color: z.enum(SUBJECT_COLORS),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.extend({
  id: z.string().min(1),
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export const createTopicSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().trim().min(1, 'Topic name is required').max(100),
  difficulty: z.enum(difficulties),
  confidenceLevel: z.number().int().min(1).max(5),
  estimatedHours: z.number().min(0).max(500).optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = createTopicSchema
  .omit({ subjectId: true })
  .extend({ id: z.string().min(1) });

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
