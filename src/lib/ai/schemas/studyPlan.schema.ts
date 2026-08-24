import { z } from 'zod';

/**
 * The model can only pick subjectId/topicId from the set we hand it in the
 * prompt (real IDs, since it can't invent ones that pass validation here),
 * but a hallucinated or wrong-tenant ID would still satisfy this schema —
 * ownership is checked separately in plan.service.ts before any DB write.
 */
export const generatedTaskSchema = z.object({
  subjectId: z.string().min(1).describe('Must be one of the subject IDs provided in the context'),
  topicId: z
    .string()
    .min(1)
    .nullable()
    .describe('One of the topic IDs provided for that subject, or null if not topic-specific'),
  title: z
    .string()
    .min(1)
    .max(150)
    .describe("Short, specific task title, e.g. 'Practice integration by parts'"),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .describe('Date within the requested planning window'),
  durationMinutes: z.number().int().min(15).max(180),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  rationale: z.string().min(1).max(200).describe('One sentence on why this task is scheduled here'),
});

export const studyPlanOutputSchema = z.object({
  summary: z.string().min(1).max(500).describe("A short overview of the plan's overall strategy"),
  tasks: z.array(generatedTaskSchema).min(1).max(60),
});

export type GeneratedTask = z.infer<typeof generatedTaskSchema>;
export type StudyPlanOutput = z.infer<typeof studyPlanOutputSchema>;
