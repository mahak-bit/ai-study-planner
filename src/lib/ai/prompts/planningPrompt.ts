import type { PlanningAgentInput } from '@/lib/ai/agents/planningAgent';

export function buildPlanningSystemPrompt(): string {
  return `You are the planning engine inside an AI study planner. You generate a concrete, day-by-day study schedule for a single student, covering only the date range you're given.

Prioritization rules, in order of importance:
1. Topics required for an exam soon (fewer days away) get scheduled earlier and more often than topics with no imminent exam.
2. Low-confidence topics (confidenceLevel 1-2) get more total time than high-confidence topics (4-5), even if not exam-linked — they represent real risk.
3. Harder topics (difficulty HARD) benefit from shorter, more frequent sessions rather than one long session.
4. Never schedule more total minutes on a single day than that day's available capacity, accounting for minutes already committed that day (given to you explicitly).
5. Spread work across the window rather than front-loading or back-loading everything — avoid scheduling nothing for several days then cramming.
6. Prefer the student's preferred study times when choosing which days feel heavier vs. lighter, though you don't control time-of-day directly.
7. Topics already MASTERED should get little or no time unless an exam explicitly covers them.
8. Every task must reference a real subjectId (and topicId, when topic-specific) from the context you're given — never invent an ID.

Keep task titles short and concrete (what to actually do, not just the topic name). Give each task a one-sentence rationale tied to the rules above.`;
}

function formatAvailability(hours: PlanningAgentInput['weeklyAvailabilityHours']): string {
  return Object.entries(hours)
    .map(([day, h]) => `${day}: ${h}h`)
    .join(', ');
}

export function buildPlanningUserPrompt(input: PlanningAgentInput): string {
  const subjectsBlock = input.subjects
    .map((subject) => {
      const topicsBlock = subject.topics
        .map(
          (t) =>
            `    - topicId=${t.id} "${t.name}" difficulty=${t.difficulty} confidence=${t.confidenceLevel}/5 status=${t.status}${t.estimatedHours ? ` estimatedHours=${t.estimatedHours}` : ''}`
        )
        .join('\n');
      return `  subjectId=${subject.id} "${subject.name}"\n${topicsBlock || '    (no topics)'}`;
    })
    .join('\n');

  const examsBlock =
    input.exams.length > 0
      ? input.exams
          .map(
            (e) =>
              `  - "${e.title}" on ${e.examDate} (priority=${e.priority}), covers topicIds: [${e.topicIds.join(', ') || 'none specified'}]`
          )
          .join('\n')
      : '  (no upcoming exams in range)';

  const committedBlock =
    Object.keys(input.existingCommittedMinutesByDate).length > 0
      ? Object.entries(input.existingCommittedMinutesByDate)
          .map(([date, minutes]) => `  ${date}: ${minutes} min already committed`)
          .join('\n')
      : '  (nothing already scheduled)';

  return `Plan for the window ${input.periodStart} to ${input.periodEnd} (today is ${input.today}, student timezone ${input.timezone}).

Student profile:
- Education level: ${input.educationLevel ?? 'not specified'}
- Goals: ${input.goals ?? 'not specified'}
- Preferred study times: ${input.preferredStudyTimes.join(', ') || 'no preference'}
- Weekly available hours: ${formatAvailability(input.weeklyAvailabilityHours)}

Subjects and topics (use these exact IDs):
${subjectsBlock}

Upcoming exams:
${examsBlock}

Already committed time per day (respect this when budgeting each day's capacity):
${committedBlock}
${input.focusNote ? `\n${input.focusNote}\n` : ''}
Generate the schedule now.`;
}
