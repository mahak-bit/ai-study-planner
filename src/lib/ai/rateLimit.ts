import { prisma } from '@/lib/db/prisma';

const WINDOW_MINUTES = 60;
const MAX_CALLS_PER_WINDOW = 5;

/**
 * Deliberately simple: a DB count instead of Upstash/Redis, since this
 * project doesn't otherwise need a Redis dependency. Fine at this scale —
 * swap for a proper rate limiter if usage ever justifies it (documented in
 * the README roadmap).
 */
export async function checkAIRateLimit(
  userId: string
): Promise<{ allowed: boolean; retryAfterMinutes?: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const recentCalls = await prisma.aIGenerationLog.count({
    where: { userId, createdAt: { gte: windowStart } },
  });

  if (recentCalls < MAX_CALLS_PER_WINDOW) {
    return { allowed: true };
  }

  return { allowed: false, retryAfterMinutes: WINDOW_MINUTES };
}
