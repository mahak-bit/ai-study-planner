import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fake ownership-scoped tables. The mocked methods deliberately replicate
// real Prisma semantics (a `where.userId` that doesn't match returns
// nothing) so these tests fail if a service ever drops the userId filter --
// not just because the mock always returns null regardless of input.
const subjectsTable = [{ id: 'subj-a', userId: 'user-a', name: 'Mathematics', color: '#6366f1' }];
const tasksTable = [{ id: 'task-a', userId: 'user-a', title: 'Practice integration' }];

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
});
