import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ai/provider', () => ({ planningModel: 'mock-model', chatModel: 'mock-model' }));

const generateTextMock = vi.hoisted(() => vi.fn());
vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, generateText: generateTextMock };
});

const { APICallError } = await import('ai');
const { AgentError } = await import('@/lib/ai/agentError');
const { runPlanningAgent } = await import('@/lib/ai/agents/planningAgent');
import type { PlanningAgentInput } from '@/lib/ai/agents/planningAgent';

const baseInput: PlanningAgentInput = {
  today: '2026-08-25',
  periodStart: '2026-08-25',
  periodEnd: '2026-08-31',
  timezone: 'UTC',
  educationLevel: 'UNDERGRADUATE',
  goals: null,
  preferredStudyTimes: [],
  weeklyAvailabilityHours: {},
  subjects: [{ id: 'subj-1', name: 'Mathematics', topics: [] }],
  exams: [],
  existingCommittedMinutesByDate: {},
};

const validOutput = {
  output: { summary: 'A plan', tasks: [] as never[] },
  response: { modelId: 'gemini-3.6-flash' },
  usage: { inputTokens: 10, outputTokens: 10 },
};

describe('runPlanningAgent: schema-validation retry and fallback contract', () => {
  afterEach(() => generateTextMock.mockReset());

  it('retries once when the model output fails schema validation, then succeeds', async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error('response did not match schema'))
      .mockResolvedValueOnce(validOutput);

    const result = await runPlanningAgent(baseInput);

    expect(result.output).toEqual(validOutput.output);
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it('degrades to a retryable AgentError instead of crashing when both attempts fail validation', async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error('malformed JSON'))
      .mockRejectedValueOnce(new Error('still malformed JSON'));

    await expect(runPlanningAgent(baseInput)).rejects.toMatchObject({
      name: 'AgentError',
      retryable: true,
    });
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it('raises a non-retryable AgentError on a 429 without burning a second attempt', async () => {
    generateTextMock.mockRejectedValueOnce(
      new APICallError({
        message: 'rate limited',
        url: 'https://example.com',
        requestBodyValues: {},
        statusCode: 429,
      })
    );

    let caught: unknown;
    try {
      await runPlanningAgent(baseInput);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AgentError);
    expect((caught as InstanceType<typeof AgentError>).retryable).toBe(false);
    expect(generateTextMock).toHaveBeenCalledTimes(1);
  });
});
