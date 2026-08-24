/**
 * Deterministic redistribution of a missed task's minutes across the
 * student's remaining pending tasks. Pure function, no DB access, so it can
 * be unit-tested directly — this is the graceful-degradation fallback that
 * always works even if the AI-enhanced path (a later phase) is unavailable.
 *
 * Strategy: greedily allocate the missed minutes to the highest-scoring
 * candidate tasks first, respecting each day's available headroom. A
 * candidate scores higher when it shares the missed task's topic, when its
 * topic has an upcoming exam, and when its topic confidence is low.
 */

export interface RebalanceCandidateTask {
  id: string;
  scheduledDate: string; // ISO yyyy-mm-dd
  durationMinutes: number;
  topicId: string | null;
}

export interface RebalanceMissedTask {
  id: string;
  scheduledDate: string;
  durationMinutes: number;
  topicId: string | null;
}

export interface RebalanceParams {
  missedTask: RebalanceMissedTask;
  /** Candidate tasks to potentially absorb extra minutes. Only PENDING tasks should be passed in. */
  pendingTasks: RebalanceCandidateTask[];
  /** Today's date (ISO yyyy-mm-dd) — candidates before this are never used. */
  today: string;
  /** End of the redistribution window (ISO yyyy-mm-dd) — the plan's periodEnd or nearest relevant exam, whichever is sooner. */
  horizonEnd: string;
  /** topicId -> confidence 1 (low) to 5 (high). Missing entries default to 3. */
  topicConfidence: Record<string, number>;
  /** topicId -> ISO exam dates that cover it, used to weight urgency. */
  topicExamDates: Record<string, string[]>;
  /** ISO date -> total minutes already scheduled that day (before this redistribution). */
  currentLoadByDate: Record<string, number>;
  /** ISO date -> max minutes the student is willing to study that day. */
  dailyCapMinutesByDate: Record<string, number>;
}

export interface RebalanceUpdate {
  taskId: string;
  addedMinutes: number;
}

export interface RebalanceResult {
  updates: RebalanceUpdate[];
  /** Minutes that could not be placed anywhere within the horizon — a real capacity shortfall, not a bug. */
  unresolvedMinutes: number;
}

const DEFAULT_CONFIDENCE = 3;
const EXAM_URGENCY_HORIZON_DAYS = 30;

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00Z').getTime();
  const to = new Date(toIso + 'T00:00:00Z').getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function examUrgencyScore(
  topicId: string | null,
  today: string,
  examDates: Record<string, string[]>
): number {
  if (!topicId) return 0;
  const dates = examDates[topicId];
  if (!dates || dates.length === 0) return 0;

  const nearestDays = Math.min(...dates.map((d) => daysBetween(today, d)).filter((d) => d >= 0));
  if (!Number.isFinite(nearestDays)) return 0;

  return Math.max(0, EXAM_URGENCY_HORIZON_DAYS - nearestDays);
}

function confidenceScore(topicId: string | null, confidence: Record<string, number>): number {
  if (!topicId) return 0;
  const level = confidence[topicId] ?? DEFAULT_CONFIDENCE;
  return (6 - level) * 2;
}

export function rebalanceMissedTask(params: RebalanceParams): RebalanceResult {
  const {
    missedTask,
    pendingTasks,
    today,
    horizonEnd,
    topicConfidence,
    topicExamDates,
    currentLoadByDate,
    dailyCapMinutesByDate,
  } = params;

  let pool = missedTask.durationMinutes;
  if (pool <= 0) return { updates: [], unresolvedMinutes: 0 };

  const candidates = pendingTasks.filter(
    (task) => task.scheduledDate >= today && task.scheduledDate <= horizonEnd
  );

  const scored = candidates
    .map((task) => {
      const sameTopic = missedTask.topicId !== null && task.topicId === missedTask.topicId;
      const score =
        (sameTopic ? 1000 : 0) +
        examUrgencyScore(task.topicId, today, topicExamDates) +
        confidenceScore(task.topicId, topicConfidence);
      return { task, score };
    })
    .sort((a, b) => b.score - a.score);

  const loadByDate = { ...currentLoadByDate };
  const updatesByTaskId = new Map<string, number>();

  for (const { task } of scored) {
    if (pool <= 0) break;

    const cap = dailyCapMinutesByDate[task.scheduledDate];
    // No configured cap for this date means "no limit" — don't block allocation on missing data.
    const headroom =
      cap === undefined ? pool : Math.max(0, cap - (loadByDate[task.scheduledDate] ?? 0));
    if (headroom <= 0) continue;

    const allocated = Math.min(pool, headroom);
    if (allocated <= 0) continue;

    updatesByTaskId.set(task.id, (updatesByTaskId.get(task.id) ?? 0) + allocated);
    loadByDate[task.scheduledDate] = (loadByDate[task.scheduledDate] ?? 0) + allocated;
    pool -= allocated;
  }

  const updates: RebalanceUpdate[] = Array.from(updatesByTaskId.entries()).map(
    ([taskId, addedMinutes]) => ({ taskId, addedMinutes })
  );

  return { updates, unresolvedMinutes: pool };
}
