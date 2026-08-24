import { describe, expect, it } from 'vitest';

import { rebalanceMissedTask, type RebalanceParams } from '@/lib/services/scheduling/rebalance';

function baseParams(overrides: Partial<RebalanceParams> = {}): RebalanceParams {
  return {
    missedTask: {
      id: 'missed-1',
      scheduledDate: '2026-08-20',
      durationMinutes: 90,
      topicId: 'topic-integration',
    },
    pendingTasks: [],
    today: '2026-08-21',
    horizonEnd: '2026-09-10',
    topicConfidence: {},
    topicExamDates: {},
    currentLoadByDate: {},
    dailyCapMinutesByDate: {},
    ...overrides,
  };
}

describe('rebalanceMissedTask', () => {
  it('returns no updates and zero shortfall when the missed task had no duration', () => {
    const result = rebalanceMissedTask(
      baseParams({
        missedTask: { id: 'm', scheduledDate: '2026-08-20', durationMinutes: 0, topicId: null },
      })
    );
    expect(result).toEqual({ updates: [], unresolvedMinutes: 0 });
  });

  it('reports the full pool as unresolved when there are no candidate tasks', () => {
    const result = rebalanceMissedTask(baseParams({ pendingTasks: [] }));
    expect(result.updates).toEqual([]);
    expect(result.unresolvedMinutes).toBe(90);
  });

  it('ignores candidates outside the [today, horizonEnd] window', () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 'before', scheduledDate: '2026-08-19', durationMinutes: 30, topicId: null },
          { id: 'after', scheduledDate: '2026-09-11', durationMinutes: 30, topicId: null },
        ],
      })
    );
    expect(result.updates).toEqual([]);
    expect(result.unresolvedMinutes).toBe(90);
  });

  it('allocates the full pool to a single candidate with enough headroom', () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 't1', scheduledDate: '2026-08-22', durationMinutes: 30, topicId: null },
        ],
        dailyCapMinutesByDate: { '2026-08-22': 200 },
      })
    );
    expect(result.updates).toEqual([{ taskId: 't1', addedMinutes: 90 }]);
    expect(result.unresolvedMinutes).toBe(0);
  });

  it('prefers a task on the same topic as the missed task over other candidates', () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          {
            id: 'other-topic',
            scheduledDate: '2026-08-22',
            durationMinutes: 30,
            topicId: 'topic-other',
          },
          {
            id: 'same-topic',
            scheduledDate: '2026-08-25',
            durationMinutes: 30,
            topicId: 'topic-integration',
          },
        ],
        dailyCapMinutesByDate: { '2026-08-22': 200, '2026-08-25': 200 },
      })
    );
    // same-topic task should be allocated to first (and fully absorb what it can)
    const sameTopicUpdate = result.updates.find((u) => u.taskId === 'same-topic');
    expect(sameTopicUpdate?.addedMinutes).toBeGreaterThan(0);
  });

  it('prefers lower-confidence topics when no same-topic candidate exists', () => {
    const result = rebalanceMissedTask(
      baseParams({
        missedTask: { id: 'm', scheduledDate: '2026-08-20', durationMinutes: 30, topicId: null },
        pendingTasks: [
          {
            id: 'confident',
            scheduledDate: '2026-08-22',
            durationMinutes: 30,
            topicId: 'topic-confident',
          },
          { id: 'shaky', scheduledDate: '2026-08-23', durationMinutes: 30, topicId: 'topic-shaky' },
        ],
        topicConfidence: { 'topic-confident': 5, 'topic-shaky': 1 },
        dailyCapMinutesByDate: { '2026-08-22': 15, '2026-08-23': 200 },
      })
    );
    // Cap on 08-22 only allows 15 min there; the shaky (low-confidence) task
    // should be scored higher and absorb the remainder.
    const shakyUpdate = result.updates.find((u) => u.taskId === 'shaky');
    expect(shakyUpdate?.addedMinutes).toBeGreaterThan(0);
  });

  it('weights topics with a nearer upcoming exam more heavily', () => {
    const result = rebalanceMissedTask(
      baseParams({
        missedTask: { id: 'm', scheduledDate: '2026-08-20', durationMinutes: 30, topicId: null },
        pendingTasks: [
          {
            id: 'far-exam',
            scheduledDate: '2026-08-22',
            durationMinutes: 30,
            topicId: 'topic-far',
          },
          {
            id: 'near-exam',
            scheduledDate: '2026-08-23',
            durationMinutes: 30,
            topicId: 'topic-near',
          },
        ],
        topicExamDates: {
          'topic-far': ['2026-09-30'],
          'topic-near': ['2026-08-25'],
        },
        dailyCapMinutesByDate: { '2026-08-22': 200, '2026-08-23': 200 },
      })
    );
    const nearIndex = result.updates.findIndex((u) => u.taskId === 'near-exam');
    expect(nearIndex).toBeGreaterThanOrEqual(0);
    expect(result.updates[0]?.taskId).toBe('near-exam');
  });

  it("respects each day's cap and does not overload it", () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 't1', scheduledDate: '2026-08-22', durationMinutes: 30, topicId: null },
        ],
        currentLoadByDate: { '2026-08-22': 170 },
        dailyCapMinutesByDate: { '2026-08-22': 200 },
      })
    );
    // Only 30 minutes of headroom (200 cap - 170 already scheduled) even
    // though the pool is 90.
    expect(result.updates).toEqual([{ taskId: 't1', addedMinutes: 30 }]);
    expect(result.unresolvedMinutes).toBe(60);
  });

  it("spreads the pool across multiple candidates when one alone can't absorb it, without exceeding any day's cap", () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 't1', scheduledDate: '2026-08-22', durationMinutes: 30, topicId: null },
          { id: 't2', scheduledDate: '2026-08-23', durationMinutes: 30, topicId: null },
        ],
        dailyCapMinutesByDate: { '2026-08-22': 50, '2026-08-23': 200 },
      })
    );
    const t1 = result.updates.find((u) => u.taskId === 't1');
    const t2 = result.updates.find((u) => u.taskId === 't2');
    expect(t1?.addedMinutes).toBeLessThanOrEqual(50);
    expect((t1?.addedMinutes ?? 0) + (t2?.addedMinutes ?? 0)).toBe(90);
    expect(result.unresolvedMinutes).toBe(0);
  });

  it('reports a partial shortfall when total headroom across the horizon is less than the pool', () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 't1', scheduledDate: '2026-08-22', durationMinutes: 10, topicId: null },
          { id: 't2', scheduledDate: '2026-08-23', durationMinutes: 10, topicId: null },
        ],
        dailyCapMinutesByDate: { '2026-08-22': 20, '2026-08-23': 20 },
      })
    );
    const totalAllocated = result.updates.reduce((sum, u) => sum + u.addedMinutes, 0);
    expect(totalAllocated).toBe(40);
    expect(result.unresolvedMinutes).toBe(50);
  });

  it('treats a date missing from dailyCapMinutesByDate as having no cap', () => {
    const result = rebalanceMissedTask(
      baseParams({
        pendingTasks: [
          { id: 't1', scheduledDate: '2026-08-22', durationMinutes: 30, topicId: null },
        ],
        dailyCapMinutesByDate: {},
      })
    );
    expect(result.updates).toEqual([{ taskId: 't1', addedMinutes: 90 }]);
    expect(result.unresolvedMinutes).toBe(0);
  });
});
