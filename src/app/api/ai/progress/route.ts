import { NextResponse } from 'next/server';

import { AgentError } from '@/lib/ai/agentError';
import { checkAIRateLimit } from '@/lib/ai/rateLimit';
import { getCurrentUser } from '@/lib/auth/session';
import { generateAIInsights, ProgressGenerationError } from '@/lib/services/progress.service';

export const maxDuration = 60;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await checkAIRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many AI requests. Try again in about ${rateLimit.retryAfterMinutes} minutes.` },
      { status: 429 }
    );
  }

  try {
    const result = await generateAIInsights(user.id);
    return NextResponse.json({
      summary: result.summary,
      riskLevel: result.riskLevel,
      insightCount: result.recommendations.length,
    });
  } catch (error) {
    if (error instanceof ProgressGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof AgentError) {
      return NextResponse.json({ error: error.message }, { status: error.retryable ? 502 : 400 });
    }

    console.error('Unexpected error generating AI insights', error);
    return NextResponse.json(
      { error: 'Something went wrong generating insights. Please try again.' },
      { status: 500 }
    );
  }
}
