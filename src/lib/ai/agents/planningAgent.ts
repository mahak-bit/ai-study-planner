import { APICallError, generateText, Output } from 'ai';

import { AgentError } from '@/lib/ai/agentError';
import {
  buildPlanningSystemPrompt,
  buildPlanningUserPrompt,
} from '@/lib/ai/prompts/planningPrompt';
import { planningModel } from '@/lib/ai/provider';
import { studyPlanOutputSchema, type StudyPlanOutput } from '@/lib/ai/schemas/studyPlan.schema';

export interface PlanningAgentInput {
  today: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  educationLevel: string | null;
  goals: string | null;
  preferredStudyTimes: string[];
  weeklyAvailabilityHours: Record<string, number>;
  subjects: Array<{
    id: string;
    name: string;
    topics: Array<{
      id: string;
      name: string;
      difficulty: string;
      confidenceLevel: number;
      estimatedHours: number | null;
      status: string;
    }>;
  }>;
  exams: Array<{
    id: string;
    title: string;
    subjectId: string;
    examDate: string;
    priority: string;
    topicIds: string[];
  }>;
  existingCommittedMinutesByDate: Record<string, number>;
}

export interface PlanningAgentResult {
  output: StudyPlanOutput;
  model: string;
  promptTokens: number | undefined;
  completionTokens: number | undefined;
  latencyMs: number;
}

const MAX_ATTEMPTS = 2;

/**
 * Single-shot structured-output agent: generates a schedule, validated
 * against studyPlanOutputSchema. On a validation failure, retries once with
 * the error appended to the prompt before giving up with a typed AgentError
 * — callers (plan.service.ts) map that to a graceful user-facing failure
 * rather than a crash.
 */
export async function runPlanningAgent(input: PlanningAgentInput): Promise<PlanningAgentResult> {
  const system = buildPlanningSystemPrompt();
  const basePrompt = buildPlanningUserPrompt(input);

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
        output: Output.object({ schema: studyPlanOutputSchema }),
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

      // A quota/rate-limit rejection will fail identically on every retry —
      // don't burn the retry budget on it, and give a message that's
      // actually actionable instead of "try again shortly".
      if (APICallError.isInstance(error) && error.statusCode === 429) {
        throw new AgentError(
          'The AI provider is rate-limited or out of quota right now. Wait a bit and try again.',
          false
        );
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new AgentError(`Plan generation failed after retry: ${lastErrorMessage}`, true);
      }
    }
  }

  throw new AgentError('Plan generation failed unexpectedly', true);
}
