import { NextResponse } from 'next/server';

import { AgentError } from '@/lib/ai/agentError';
import { checkAIRateLimit } from '@/lib/ai/rateLimit';
import { getCurrentUser } from '@/lib/auth/session';
import { generateAIStudyPlan, PlanGenerationError } from '@/lib/services/plan.service';

// AI calls can legitimately take a while; give this route more room than
// the platform default before it's killed mid-generation.
export const maxDuration = 60;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  try {
    const result = await generateAIStudyPlan(user.id);
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
      // AgentError messages are hand-written in the agent, never raw
      // provider output, so they're safe to show directly. Non-retryable
      // (e.g. a billing/quota problem) is a 400 -- retrying won't help
      // until the user acts; retryable failures are a 502.
      return NextResponse.json({ error: error.message }, { status: error.retryable ? 502 : 400 });
    }

    // Anything else (e.g. a DB transaction conflict from firing a second
    // generation before the first finished -- reproducible by reloading the
    // Planner mid-generation, which resets the client-side disabled guard)
    // still needs to degrade gracefully instead of surfacing a raw 500.
    console.error('Unexpected error generating AI study plan', error);
    return NextResponse.json(
      { error: 'Something went wrong generating the plan. Please try again.' },
      { status: 500 }
    );
  }
}
