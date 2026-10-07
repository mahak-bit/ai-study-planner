import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/services/subject.service';
import type { CreateQuizAttemptInput } from '@/lib/validations/quiz.schema';

export function scorePercent(attempt: { score: number; totalQuestions: number }): number {
  return Math.round((attempt.score / attempt.totalQuestions) * 100);
}

export async function createQuizAttempt(userId: string, input: CreateQuizAttemptInput) {
  // Topics are owned through their subject; checking that path is what stops
  // a user logging a score against someone else's topic by guessing its id.
  const topic = await prisma.topic.findFirst({
    where: { id: input.topicId, subject: { userId } },
    select: { id: true, subjectId: true },
  });
  if (!topic) throw new NotFoundError('Topic not found');

  await prisma.quizAttempt.create({
    data: {
      userId,
      topicId: topic.id,
      title: input.title,
      score: input.score,
      totalQuestions: input.totalQuestions,
      timeTakenSeconds: input.timeTakenMinutes ? input.timeTakenMinutes * 60 : null,
    },
  });
  return { subjectId: topic.subjectId };
}

export async function deleteQuizAttempt(userId: string, attemptId: string) {
  const result = await prisma.quizAttempt.deleteMany({ where: { id: attemptId, userId } });
  if (result.count === 0) throw new NotFoundError('Quiz attempt not found');
}

// A topic counts as low-scoring when its most recent attempt came in under
// this. Uses the latest attempt rather than an average so a topic the
// student has since improved on stops being flagged.
export const LOW_QUIZ_SCORE_PERCENT = 60;

export async function listLowQuizScoreTopics(userId: string, limit = 10) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, topicId: { not: null } },
    include: { topic: { include: { subject: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const latestByTopic = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    if (attempt.topicId && !latestByTopic.has(attempt.topicId)) {
      latestByTopic.set(attempt.topicId, attempt);
    }
  }

  return [...latestByTopic.values()]
    .filter((attempt) => scorePercent(attempt) < LOW_QUIZ_SCORE_PERCENT)
    .sort((a, b) => scorePercent(a) - scorePercent(b))
    .slice(0, limit);
}
