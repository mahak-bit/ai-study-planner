import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';

import { buildCoachSystemPrompt } from '@/lib/ai/coach/prompt';
import { chatModel } from '@/lib/ai/provider';
import { createGetStudentContextTool } from '@/lib/ai/tools/getStudentContext';
import { createGetTodayTasksTool } from '@/lib/ai/tools/getTodayTasks';
import { createGetUpcomingExamsTool } from '@/lib/ai/tools/getUpcomingExams';
import { createGetWeakTopicsTool } from '@/lib/ai/tools/getWeakTopics';

const MAX_AGENT_STEPS = 5;

/**
 * Multi-turn tool-calling chat, deliberately not forced into the single-shot
 * Agent<TInput,TOutput> shape used by PlanningAgent/ProgressAgent -- that
 * interface doesn't fit conversation state or streaming. Tools are bound to
 * userId here (never taken as a model-supplied argument), so every read is
 * automatically scoped to the requesting student.
 */
export async function runCoachTurn(params: {
  userId: string;
  messages: UIMessage[];
  onFinish?: Parameters<typeof streamText>[0]['onFinish'];
}) {
  return streamText({
    model: chatModel,
    system: buildCoachSystemPrompt(),
    messages: await convertToModelMessages(params.messages),
    tools: {
      getStudentContext: createGetStudentContextTool(params.userId),
      getUpcomingExams: createGetUpcomingExamsTool(params.userId),
      getWeakTopics: createGetWeakTopicsTool(params.userId),
      getTodayTasks: createGetTodayTasksTool(params.userId),
    },
    stopWhen: stepCountIs(MAX_AGENT_STEPS),
    onFinish: params.onFinish,
  });
}
