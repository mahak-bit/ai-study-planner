import { z } from 'zod';

export const insightTypes = ['WEAK_TOPIC', 'EXAM_RISK', 'CONSISTENCY', 'GENERAL'] as const;

export const progressInsightSchema = z.object({
  type: z.enum(insightTypes),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  // Same caveat as generatedTaskSchema in studyPlan.schema.ts: the model can
  // only pick from IDs given in the prompt, but a wrong-tenant ID would
  // still satisfy this schema -- ownership is checked in progress.service.ts.
  relatedSubjectId: z.string().nullable().describe('A subjectId from the context, or null'),
  relatedTopicId: z.string().nullable().describe('A topicId from the context, or null'),
});

export const progressOutputSchema = z.object({
  summary: z.string().min(1).max(400),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  insights: z.array(progressInsightSchema).min(1).max(6),
});

export type ProgressInsight = z.infer<typeof progressInsightSchema>;
export type ProgressOutput = z.infer<typeof progressOutputSchema>;
