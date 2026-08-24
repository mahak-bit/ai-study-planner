import { z } from 'zod';

export const educationLevels = [
  'HIGH_SCHOOL',
  'UNDERGRADUATE',
  'GRADUATE',
  'POSTGRADUATE',
  'COMPETITIVE_EXAM',
  'OTHER',
] as const;

export const studyTimePreferences = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] as const;

export const difficulties = ['EASY', 'MEDIUM', 'HARD'] as const;

export const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const weeklyAvailabilitySchema = z.object({
  mon: z.number().min(0).max(16),
  tue: z.number().min(0).max(16),
  wed: z.number().min(0).max(16),
  thu: z.number().min(0).max(16),
  fri: z.number().min(0).max(16),
  sat: z.number().min(0).max(16),
  sun: z.number().min(0).max(16),
});

export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;

export const defaultWeeklyAvailability: WeeklyAvailability = Object.fromEntries(
  weekdays.map((day) => [day, day === 'sat' || day === 'sun' ? 3 : 2])
) as WeeklyAvailability;

export const profileStepSchema = z.object({
  educationLevel: z.enum(educationLevels),
  goals: z.string().trim().max(1000).optional().or(z.literal('')),
  weeklyAvailabilityHours: weeklyAvailabilitySchema,
  preferredStudyTimes: z.array(z.enum(studyTimePreferences)).min(1, 'Pick at least one'),
  timezone: z.string().min(1),
});

export type ProfileStepInput = z.infer<typeof profileStepSchema>;

export const topicInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Topic name is required').max(100),
  difficulty: z.enum(difficulties),
  confidenceLevel: z.number().int().min(1).max(5),
  estimatedHours: z.number().min(0).max(500).optional(),
});

export type TopicInput = z.infer<typeof topicInputSchema>;

export const subjectInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  color: z.string().min(1),
  topics: z.array(topicInputSchema).min(1, 'Add at least one topic'),
});

export type SubjectInput = z.infer<typeof subjectInputSchema>;

export const subjectsStepSchema = z.object({
  subjects: z.array(subjectInputSchema).min(1, 'Add at least one subject'),
});

export type SubjectsStepInput = z.infer<typeof subjectsStepSchema>;

export const examInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Exam title is required').max(150),
  subjectId: z.string().min(1, 'Choose a subject'),
  examDate: z.string().min(1, 'Choose a date'),
  priority: z.enum(priorities),
  topicIds: z.array(z.string()),
});

export type ExamInput = z.infer<typeof examInputSchema>;

export const examsStepSchema = z.object({
  exams: z.array(examInputSchema),
});

export type ExamsStepInput = z.infer<typeof examsStepSchema>;

export const SUBJECT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#84cc16',
] as const;
