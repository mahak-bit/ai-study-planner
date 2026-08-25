import { APICallError, generateText, Output } from 'ai';

import { AgentError } from '@/lib/ai/agentError';
import {
  buildProgressSystemPrompt,
  buildProgressUserPrompt,
} from '@/lib/ai/prompts/progressPrompt';
import { planningModel } from '@/lib/ai/provider';
import { progressOutputSchema, type ProgressOutput } from '@/lib/ai/schemas/progress.schema';

export interface ProgressAgentInput {
  today: string;
  streak: number;
  completionRatePercent: number | null;
  studiedDaysLast14: number;
  subjects: Array<{
    id: string;
    name: string;
    topicCount: number;
    masteredCount: number;
    avgConfidence: number;
  }>;
  weakTopics: Array<{
    id: string;
    subjectId: string;
    name: string;
    subjectName: string;
    confidenceLevel: number;
  }>;
  upcomingExams: Array<{
    subjectId: string;
    title: string;
    subjectName: string;
    daysAway: number;
    priority: string;
  }>;
}

export interface ProgressAgentResult {
  output: ProgressOutput;
  model: string;
  promptTokens: number | undefined;
  completionTokens: number | undefined;
  latencyMs: number;
}

const MAX_ATTEMPTS = 2;

/**
 * Same single-shot structured-output shape as PlanningAgent: validate
 * against progressOutputSchema, retry once with the error appended, then
 * raise a typed AgentError so callers can degrade gracefully.
 */
export async function runProgressAgent(input: ProgressAgentInput): Promise<ProgressAgentResult> {
  const system = buildProgressSystemPrompt();
  const basePrompt = buildProgressUserPrompt(input);

  let lastErrorMessage: string | undefined;
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prompt = lastErrorMessage
      ? `${basePrompt}\n\nYour previous response was invalid: ${lastErrorMessage}\nRespond again, strictly matching the required schema and only using the IDs provided above.`
      : basePrompt;

    try {
      const result = await generateText({
        model: planningModel,
        system,
        prompt,
        output: Output.object({ schema: progressOutputSchema }),
      });

      return {
        output: result.output,
        model: result.response.modelId,
        promptTokens: result.usage.inputTokens,
        completionTokens: result.usage.outputTokens,
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);

      if (APICallError.isInstance(error) && error.statusCode === 429) {
        throw new AgentError(
          'The AI provider is rate-limited or out of quota right now. Wait a bit and try again.',
          false
        );
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new AgentError(`Insight generation failed after retry: ${lastErrorMessage}`, true);
      }
    }
  }

  throw new AgentError('Insight generation failed unexpectedly', true);
}
