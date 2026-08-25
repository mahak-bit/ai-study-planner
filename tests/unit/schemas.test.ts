import { describe, expect, it } from 'vitest';

import { progressOutputSchema } from '@/lib/ai/schemas/progress.schema';
import { studyPlanOutputSchema } from '@/lib/ai/schemas/studyPlan.schema';

describe('studyPlanOutputSchema', () => {
  const validTask = {
    subjectId: 'subj-1',
    topicId: 'topic-1',
    title: 'Practice integration',
    scheduledDate: '2026-09-01',
    durationMinutes: 60,
    priority: 'MEDIUM',
    rationale: 'Exam in 5 days and confidence is low.',
  };

  it('accepts a well-formed plan', () => {
    const result = studyPlanOutputSchema.safeParse({
      summary: 'A balanced plan.',
      tasks: [validTask],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a plan with no tasks', () => {
    const result = studyPlanOutputSchema.safeParse({ summary: 'Empty plan', tasks: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a task with an invalid date format', () => {
    const result = studyPlanOutputSchema.safeParse({
      summary: 'Plan',
      tasks: [{ ...validTask, scheduledDate: '09/01/2026' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a task with an out-of-range duration', () => {
    const result = studyPlanOutputSchema.safeParse({
      summary: 'Plan',
      tasks: [{ ...validTask, durationMinutes: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a task with an invalid priority enum value', () => {
    const result = studyPlanOutputSchema.safeParse({
      summary: 'Plan',
      tasks: [{ ...validTask, priority: 'URGENT' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects completely malformed input', () => {
    expect(studyPlanOutputSchema.safeParse(null).success).toBe(false);
    expect(studyPlanOutputSchema.safeParse('not an object').success).toBe(false);
    expect(studyPlanOutputSchema.safeParse({ random: 'shape' }).success).toBe(false);
  });
});

describe('progressOutputSchema', () => {
  const validInsight = {
    type: 'WEAK_TOPIC',
    title: 'Low confidence in Integration',
    description: 'Confidence is 2/5 with an exam in 5 days.',
    relatedSubjectId: 'subj-1',
    relatedTopicId: 'topic-1',
  };

  it('accepts well-formed insights', () => {
    const result = progressOutputSchema.safeParse({
      summary: 'Overview',
      riskLevel: 'MEDIUM',
      insights: [validInsight],
    });
    expect(result.success).toBe(true);
  });

  it('accepts null related IDs for general insights', () => {
    const result = progressOutputSchema.safeParse({
      summary: 'Overview',
      riskLevel: 'LOW',
      insights: [{ ...validInsight, relatedSubjectId: null, relatedTopicId: null }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid riskLevel enum value', () => {
    const result = progressOutputSchema.safeParse({
      summary: 'Overview',
      riskLevel: 'EXTREME',
      insights: [validInsight],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid insight type', () => {
    const result = progressOutputSchema.safeParse({
      summary: 'Overview',
      riskLevel: 'LOW',
      insights: [{ ...validInsight, type: 'RANDOM_TYPE' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing related ID field entirely (undefined, not null)', () => {
    const withoutSubjectId: Record<string, unknown> = { ...validInsight };
    delete withoutSubjectId.relatedSubjectId;
    const result = progressOutputSchema.safeParse({
      summary: 'Overview',
      riskLevel: 'LOW',
      insights: [withoutSubjectId],
    });
    expect(result.success).toBe(false);
  });
});
