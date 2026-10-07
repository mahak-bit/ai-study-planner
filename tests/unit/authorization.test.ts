import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fake ownership-scoped tables. The mocked methods deliberately replicate
// real Prisma semantics (a `where.userId` that doesn't match returns
// nothing) so these tests fail if a service ever drops the userId filter --
// not just because the mock always returns null regardless of input.
const subjectsTable = [
  { id: 'subj-a', userId: 'user-a', name: 'Mathematics', color: '#6366f1', topics: [] },
];
const tasksTable = [{ id: 'task-a', userId: 'user-a', title: 'Practice integration' }];
const topicsTable = [{ id: 'topic-a', subjectId: 'subj-a', name: 'Integration' }];
const quizAttemptsTable = [{ id: 'quiz-a', userId: 'user-a', topicId: 'topic-a' }];

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    subject: {
      findFirst: vi.fn(({ where }: { where: { id: string; userId: string } }) =>
        Promise.resolve(
          subjectsTable.find((s) => s.id === where.id && s.userId === where.userId) ?? null
        )
      ),
      deleteMany: vi.fn(({ where }: { where: { id: string; userId: string } }) => {
        const match = subjectsTable.find((s) => s.id === where.id && s.userId === where.userId);
        return Promise.resolve({ count: match ? 1 : 0 });
      }),
    },
    topic: {
      // Topics are owned through their subject, so ownership is checked via
      // the nested `where.subject.userId` filter.
      findFirst: vi.fn(({ where }: { where: { id: string; subject: { userId: string } } }) => {
        const topic = topicsTable.find((t) => t.id === where.id);
        const subject = topic && subjectsTable.find((s) => s.id === topic.subjectId);
        return Promise.resolve(subject?.userId === where.subject.userId ? topic : null);
      }),
    },
    quizAttempt: {
      create: vi.fn(() => Promise.resolve({ id: 'quiz-new' })),
      deleteMany: vi.fn(({ where }: { where: { id: string; userId: string } }) => {
        const match = quizAttemptsTable.find((q) => q.id === where.id && q.userId === where.userId);
        return Promise.resolve({ count: match ? 1 : 0 });
      }),
    },
    studyTask: {
      deleteMany: vi.fn(({ where }: { where: { id: string; userId: string } }) => {
        const match = tasksTable.find((t) => t.id === where.id && t.userId === where.userId);
        return Promise.resolve({ count: match ? 1 : 0 });
      }),
    },
  },
}));

const { getSubjectDetail, deleteSubject, NotFoundError } =
  await import('@/lib/services/subject.service');
const { deleteTask } = await import('@/lib/services/task.service');
const { createQuizAttempt, deleteQuizAttempt } = await import('@/lib/services/quiz.service');
const { prisma } = await import('@/lib/db/prisma');

const quizInput = { topicId: 'topic-a', title: 'Practice set', score: 7, totalQuestions: 10 };

describe('cross-tenant authorization', () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a read of another user's subject", async () => {
    await expect(getSubjectDetail('user-b', 'subj-a')).rejects.toThrow(NotFoundError);
  });

  it('allows the owner to read their own subject', async () => {
    await expect(getSubjectDetail('user-a', 'subj-a')).resolves.toMatchObject({ id: 'subj-a' });
  });

  it("rejects deleting another user's subject", async () => {
    await expect(deleteSubject('user-b', 'subj-a')).rejects.toThrow(NotFoundError);
  });

  it('allows the owner to delete their own subject', async () => {
    await expect(deleteSubject('user-a', 'subj-a')).resolves.toBeUndefined();
  });

  it("rejects deleting another user's study task", async () => {
    await expect(deleteTask('user-b', 'task-a')).rejects.toThrow(NotFoundError);
  });

  it('allows the owner to delete their own study task', async () => {
    await expect(deleteTask('user-a', 'task-a')).resolves.toBeUndefined();
  });

  it("rejects logging a quiz score against another user's topic", async () => {
    await expect(createQuizAttempt('user-b', quizInput)).rejects.toThrow(NotFoundError);
    expect(prisma.quizAttempt.create).not.toHaveBeenCalled();
  });

  it('allows the owner to log a quiz score on their own topic', async () => {
    await expect(createQuizAttempt('user-a', quizInput)).resolves.toEqual({ subjectId: 'subj-a' });
    expect(prisma.quizAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user-a', topicId: 'topic-a' }),
    });
  });

  it("rejects deleting another user's quiz attempt", async () => {
    await expect(deleteQuizAttempt('user-b', 'quiz-a')).rejects.toThrow(NotFoundError);
  });

  it('allows the owner to delete their own quiz attempt', async () => {
    await expect(deleteQuizAttempt('user-a', 'quiz-a')).resolves.toBeUndefined();
  });
});
