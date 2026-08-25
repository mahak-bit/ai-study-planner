import { NextResponse } from 'next/server';
import type { UIMessage } from 'ai';

import { runCoachTurn } from '@/lib/ai/coach/orchestrator';
import { checkAIRateLimit } from '@/lib/ai/rateLimit';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getOrCreateConversation, saveMessage } from '@/lib/services/coach.service';

export const maxDuration = 60;

const COACH_MAX_CALLS_PER_WINDOW = 20;

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await checkAIRateLimit(user.id, {
    agentName: 'CoachAgent',
    maxCalls: COACH_MAX_CALLS_PER_WINDOW,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many coach messages. Try again in about ${rateLimit.retryAfterMinutes} minutes.`,
      },
      { status: 429 }
    );
  }

  const { messages }: { messages: UIMessage[] } = await request.json();
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const conversation = await getOrCreateConversation(user.id);
  await saveMessage(conversation.id, 'USER', textOf(lastMessage));

  const startedAt = Date.now();
  const result = await runCoachTurn({
    userId: user.id,
    messages,
    onFinish: async ({ text, toolCalls, usage }) => {
      await saveMessage(
        conversation.id,
        'ASSISTANT',
        text,
        toolCalls.length > 0 ? toolCalls : undefined
      );
      await prisma.aIGenerationLog.create({
        data: {
          userId: user.id,
          agentName: 'CoachAgent',
          input: { messageCount: messages.length } as unknown as object,
          output: { text, toolCallCount: toolCalls.length } as unknown as object,
          model: 'gemini-3.6-flash',
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
          latencyMs: Date.now() - startedAt,
          success: true,
        },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
