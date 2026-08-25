import { tool } from 'ai';
import { z } from 'zod';

import { listWeakTopics } from '@/lib/services/analytics.service';

export function createGetWeakTopicsTool(userId: string) {
  return tool({
    description:
      'Get the topics the student has rated lowest confidence on (2/5 or below) -- their biggest risk areas.',
    inputSchema: z.object({}),
    execute: async () => {
      const topics = await listWeakTopics(userId, 10);
      return topics.map((t) => ({
        name: t.name,
        subject: t.subject.name,
        difficulty: t.difficulty,
        confidenceLevel: t.confidenceLevel,
      }));
    },
  });
}
