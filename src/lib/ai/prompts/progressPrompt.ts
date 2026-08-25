import type { ProgressAgentInput } from '@/lib/ai/agents/progressAgent';

export function buildProgressSystemPrompt(): string {
  return `You are the progress analysis engine inside an AI study planner. You review a student's real study data and produce a small set of concrete, actionable insights -- never generic encouragement.

Rules:
1. Every insight must be grounded in the data you're given -- don't invent numbers or claims the data doesn't support.
2. Prefer specific, actionable insights ("You've missed 3 of your last 5 Physics sessions" beats "keep it up").
3. Use type=WEAK_TOPIC for a topic whose low confidence is a real risk, EXAM_RISK when an upcoming exam looks under-prepared given time remaining, CONSISTENCY for study-habit patterns (streaks, gaps, completion rate), and GENERAL for anything else worth surfacing.
4. Set relatedSubjectId/relatedTopicId when an insight is about a specific subject or topic (using the exact IDs given), otherwise use null. Never invent an ID.
5. riskLevel reflects overall trajectory toward upcoming exams: LOW (on track), MEDIUM (some gaps), HIGH (falling behind in a way that needs attention soon).
6. Return 2-6 insights. Quality over quantity -- don't pad with filler.`;
}

export function buildProgressUserPrompt(input: ProgressAgentInput): string {
  const weakTopicsBlock =
    input.weakTopics.length > 0
      ? input.weakTopics
          .map(
            (t) =>
              `  - topicId=${t.id} subjectId=${t.subjectId} "${t.name}" (${t.subjectName}), confidence=${t.confidenceLevel}/5`
          )
          .join('\n')
      : '  (no low-confidence topics)';

  const examsBlock =
    input.upcomingExams.length > 0
      ? input.upcomingExams
          .map(
            (e) =>
              `  - subjectId=${e.subjectId} "${e.title}" (${e.subjectName}) in ${e.daysAway} day(s), priority=${e.priority}`
          )
          .join('\n')
      : '  (no upcoming exams)';

  const subjectsBlock = input.subjects
    .map(
      (s) =>
        `  - subjectId=${s.id} "${s.name}": ${s.masteredCount}/${s.topicCount} topics mastered, avg confidence ${s.avgConfidence.toFixed(1)}/5`
    )
    .join('\n');

  return `Student snapshot as of ${input.today}:

Current study streak: ${input.streak} consecutive day(s).
Task completion rate over the last 30 days: ${input.completionRatePercent === null ? 'not enough data yet' : `${input.completionRatePercent}%`}.
Days with at least one completed session in the last 14 days: ${input.studiedDaysLast14}/14.

Subjects:
${subjectsBlock || '  (no subjects yet)'}

Low-confidence topics (confidence <= 2/5):
${weakTopicsBlock}

Upcoming exams:
${examsBlock}

Analyze this and produce insights now.`;
}
