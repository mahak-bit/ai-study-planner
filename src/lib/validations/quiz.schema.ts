import { z } from 'zod';

// Manual score logging only — the student took a quiz/practice test
// elsewhere and records how it went against one of their topics.
export const createQuizAttemptSchema = z
  .object({
    topicId: z.string().min(1, 'Choose a topic'),
    title: z.string().trim().min(1, 'Give this attempt a name').max(150),
    score: z.number('Enter your score').int().min(0, 'Score cannot be negative'),
    totalQuestions: z
      .number('Enter the number of questions')
      .int()
      .min(1, 'At least 1 question')
      .max(1000),
    timeTakenMinutes: z.number().int().min(1).max(600).optional(),
  })
  .refine((data) => data.score <= data.totalQuestions, {
    message: 'Score cannot be higher than the number of questions',
    path: ['score'],
  });

export type CreateQuizAttemptInput = z.infer<typeof createQuizAttemptSchema>;
