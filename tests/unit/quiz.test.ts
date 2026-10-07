import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQuizAttemptSchema } from '@/lib/validations/quiz.schema';

const findMany = vi.fn();
vi.mock('@/lib/db/prisma', () => ({ prisma: { quizAttempt: { findMany } } }));

const { listLowQuizScoreTopics, scorePercent } = await import('@/lib/services/quiz.service');

describe('createQuizAttemptSchema', () => {
  const valid = { topicId: 'topic-1', title: 'Practice set', score: 7, totalQuestions: 10 };

  it('accepts a well-formed attempt', () => {
    expect(createQuizAttemptSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an optional time taken', () => {
    expect(createQuizAttemptSchema.safeParse({ ...valid, timeTakenMinutes: 25 }).success).toBe(
      true
    );
  });

  it('rejects a score higher than the number of questions', () => {
    const result = createQuizAttemptSchema.safeParse({ ...valid, score: 11 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['score']);
  });

  it('rejects zero questions', () => {
    expect(createQuizAttemptSchema.safeParse({ ...valid, totalQuestions: 0 }).success).toBe(false);
  });

  it('rejects a fractional score', () => {
    expect(createQuizAttemptSchema.safeParse({ ...valid, score: 6.5 }).success).toBe(false);
  });

  it('rejects a missing topic', () => {
    expect(createQuizAttemptSchema.safeParse({ ...valid, topicId: '' }).success).toBe(false);
  });
});

describe('scorePercent', () => {
  it('rounds to a whole percentage', () => {
    expect(scorePercent({ score: 2, totalQuestions: 3 })).toBe(67);
    expect(scorePercent({ score: 10, totalQuestions: 10 })).toBe(100);
  });
});

describe('listLowQuizScoreTopics', () => {
  const topic = (id: string) => ({ id, name: id, subject: { name: 'Maths' } });
  const attempt = (topicId: string, score: number, day: number) => ({
    id: `${topicId}-${day}`,
    topicId,
    score,
    totalQuestions: 10,
    createdAt: new Date(2026, 9, day),
    topic: topic(topicId),
  });

  beforeEach(() => findMany.mockReset());

  it('judges each topic by its latest attempt, so improvement clears the flag', async () => {
    // findMany returns newest first, matching the real orderBy.
    findMany.mockResolvedValue([
      attempt('improved', 9, 5),
      attempt('struggling', 4, 4),
      attempt('improved', 2, 3),
      attempt('struggling', 8, 2),
    ]);
    const result = await listLowQuizScoreTopics('user-a');
    expect(result.map((a) => a.topicId)).toEqual(['struggling']);
  });

  it('only queries the requesting user and orders weakest first', async () => {
    findMany.mockResolvedValue([attempt('a', 5, 2), attempt('b', 1, 1)]);
    const result = await listLowQuizScoreTopics('user-a');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-a' }) })
    );
    expect(result.map((a) => a.topicId)).toEqual(['b', 'a']);
  });
});
