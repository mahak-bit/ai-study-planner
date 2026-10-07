import { tool } from 'ai';
import { z } from 'zod';

import { listWeakTopics } from '@/lib/services/analytics.service';
import { listLowQuizScoreTopics, scorePercent } from '@/lib/services/quiz.service';

export function createGetWeakTopicsTool(userId: string) {
  return tool({
    description:
      "Get the student's biggest risk areas: topics they rated lowest confidence on (2/5 or below), and topics whose most recent logged quiz score was under 60%. A low quiz score on a topic the student feels confident about is an especially important blind spot.",
    inputSchema: z.object({}),
    execute: async () => {
      const [lowConfidence, lowQuizScores] = await Promise.all([
        listWeakTopics(userId, 10),
        listLowQuizScoreTopics(userId, 10),
      ]);
      return {
        lowConfidenceTopics: lowConfidence.map((t) => ({
          name: t.name,
          subject: t.subject.name,
          difficulty: t.difficulty,
          confidenceLevel: t.confidenceLevel,
        })),
        lowQuizScoreTopics: lowQuizScores.map((attempt) => ({
          name: attempt.topic!.name,
          subject: attempt.topic!.subject.name,
          confidenceLevel: attempt.topic!.confidenceLevel,
          latestQuizPercent: scorePercent(attempt),
          latestQuizTitle: attempt.title,
          takenAt: attempt.createdAt.toISOString().slice(0, 10),
        })),
      };
    },
  });
}
