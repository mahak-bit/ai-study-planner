import { Flame } from 'lucide-react';

// A hand-built recreation of the real dashboard's visual language for the
// hero, not a screenshot -- stays crisp at any size, never goes stale, and
// matches the live theme automatically. Every element here mirrors a real,
// shipped feature (streak badge, task cards, weak-topic list, AI insight).
export function DashboardPreview() {
  return (
    <div className="border-border/60 bg-card w-full rounded-2xl border shadow-2xl shadow-black/5">
      <div className="border-border/60 flex items-center justify-between border-b px-5 py-3.5">
        <div>
          <p className="text-sm font-semibold">Welcome back, Alex</p>
          <p className="text-muted-foreground text-xs">Tuesday, August 25</p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
          <Flame className="size-3.5 text-orange-500" />
          6-day streak
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1.3fr_1fr]">
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Today&apos;s plan
          </p>
          {[
            {
              title: 'Practice integration by parts',
              subject: 'Mathematics',
              color: '#6366f1',
              mins: 60,
            },
            { title: 'Review thermodynamics laws', subject: 'Physics', color: '#06b6d4', mins: 45 },
            {
              title: 'Dynamic programming patterns',
              subject: 'Computer Science',
              color: '#f59e0b',
              mins: 75,
            },
          ].map((task) => (
            <div
              key={task.title}
              className="border-border/60 flex items-center gap-2.5 rounded-lg border p-2.5"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: task.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{task.title}</p>
                <p className="text-muted-foreground text-[11px]">
                  {task.subject} · {task.mins} min
                </p>
              </div>
            </div>
          ))}

          <div className="border-primary/15 bg-primary/[0.04] mt-3 rounded-lg border p-3">
            <p className="text-[11px] font-medium tracking-wide uppercase opacity-60">AI insight</p>
            <p className="mt-1 text-xs leading-relaxed">
              Integration is rated 2/5 confidence with your Calculus midterm 9 days away — worth
              extra sessions this week.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Upcoming exam
            </p>
            <div className="border-border/60 mt-2 rounded-lg border p-2.5">
              <p className="text-xs font-medium">Calculus Midterm</p>
              <p className="text-muted-foreground text-[11px]">Mathematics · in 9 days</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Weak topics
            </p>
            <div className="mt-2 space-y-1.5">
              {[
                { name: 'Integration', level: '2/5' },
                { name: 'Thermodynamics', level: '2/5' },
              ].map((topic) => (
                <div key={topic.name} className="flex items-center justify-between text-xs">
                  <span>{topic.name}</span>
                  <span className="border-border/60 rounded-full border px-1.5 py-0.5 text-[10px]">
                    {topic.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
