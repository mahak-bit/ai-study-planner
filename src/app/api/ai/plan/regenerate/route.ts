import { NextResponse } from 'next/server';
import { z } from 'zod';

import { AgentError } from '@/lib/ai/agentError';
import { checkAIRateLimit } from '@/lib/ai/rateLimit';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { generateAIStudyPlan, PlanGenerationError } from '@/lib/services/plan.service';

// Matches the deterministic rebalance horizon in task.service.ts -- the AI
// regeneration should reconsider the same window the rule-based fallback did.
const REGENERATE_WINDOW_DAYS = 14;

const bodySchema = z.object({ missedTaskId: z.string().min(1) });

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const missedTask = await prisma.studyTask.findFirst({
    where: { id: parsed.data.missedTaskId, userId: user.id, status: 'MISSED' },
    include: { subject: true, topic: true },
  });
  if (!missedTask) {
    return NextResponse.json({ error: 'Missed task not found' }, { status: 404 });
  }

  const rateLimit = await checkAIRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many plan generations. Try again in about ${rateLimit.retryAfterMinutes} minutes.`,
      },
      { status: 429 }
    );
  }

  // Seeds the AI regeneration with the same context the deterministic
  // rebalance already acted on, so the model adjusts the existing baseline
  // rather than inventing a schedule from scratch.
  const focusNote = `Recently missed: "${missedTask.title}" (${missedTask.subject?.name ?? 'no subject'}${missedTask.topic ? ` — ${missedTask.topic.name}` : ''}), ${missedTask.durationMinutes} min${missedTask.missedReason ? `, reason: ${missedTask.missedReason.toLowerCase().replace('_', ' ')}` : ''}. A rule-based pass already redistributed some of this time across the next ${REGENERATE_WINDOW_DAYS} days -- refine that distribution with better judgment about exam urgency and topic confidence, rather than ignoring it.`;

  try {
    const result = await generateAIStudyPlan(user.id, REGENERATE_WINDOW_DAYS, focusNote);
    return NextResponse.json({
      summary: result.summary,
      taskCount: result.taskCount,
      planId: result.plan.id,
    });
  } catch (error) {
    if (error instanceof PlanGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof AgentError) {
      return NextResponse.json({ error: error.message }, { status: error.retryable ? 502 : 400 });
    }

    console.error('Unexpected error regenerating AI study plan', error);
    return NextResponse.json(
      { error: 'Something went wrong optimizing the plan. Please try again.' },
      { status: 500 }
    );
  }
}
