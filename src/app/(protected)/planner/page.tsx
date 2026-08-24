import Link from 'next/link';
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';
import { listTasksInRange } from '@/lib/services/task.service';
import { listUpcomingExams } from '@/lib/services/exam.service';
import { AddTaskDialog } from '@/components/planner/add-task-dialog';
import { GeneratePlanButton } from '@/components/planner/generate-plan-button';
import { TaskCard } from '@/components/planner/task-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Planner — AI Study Planner' };

const ISO = 'yyyy-MM-dd';

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string; subject?: string }>;
}) {
  const { date, view, subject: subjectFilter } = await searchParams;
  const user = await requireUser();

  const anchor = date ? new Date(`${date}T00:00:00`) : new Date();
  const isDayView = view === 'day';
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = isDayView ? [anchor] : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const rangeStart = isDayView ? anchor : weekStart;
  const rangeEnd = isDayView ? anchor : weekEnd;

  const [subjects, tasks, upcomingExams] = await Promise.all([
    listSubjectsWithProgress(user.id),
    listTasksInRange(user.id, format(rangeStart, ISO), format(rangeEnd, ISO)),
    listUpcomingExams(user.id),
  ]);

  const filteredTasks = subjectFilter ? tasks.filter((t) => t.subjectId === subjectFilter) : tasks;
  const subjectOptions = subjects.map((s) => ({ id: s.id, name: s.name, topics: s.topics }));

  function tasksForDay(day: Date) {
    return filteredTasks
      .filter((t) => isSameDay(t.scheduledDate, day))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  function buildHref(overrides: { date?: string; view?: string; subject?: string | null }) {
    const params = new URLSearchParams();
    params.set('date', overrides.date ?? format(anchor, ISO));
    params.set('view', overrides.view ?? (isDayView ? 'day' : 'week'));
    const nextSubject = overrides.subject === undefined ? subjectFilter : overrides.subject;
    if (nextSubject) params.set('subject', nextSubject);
    return `/planner?${params.toString()}`;
  }

  const prevHref = buildHref({
    date: format(isDayView ? addDays(anchor, -1) : subWeeks(weekStart, 1), ISO),
  });
  const nextHref = buildHref({
    date: format(isDayView ? addDays(anchor, 1) : addWeeks(weekStart, 1), ISO),
  });
  const todayHref = buildHref({ date: format(new Date(), ISO) });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Planner</h1>
            <p className="text-muted-foreground text-sm">
              {isDayView
                ? format(anchor, 'PPPP')
                : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border p-0.5 text-sm">
              <Link
                href={buildHref({ view: 'week' })}
                className={cn(
                  'rounded-md px-2.5 py-1',
                  !isDayView ? 'bg-muted font-medium' : 'text-muted-foreground'
                )}
              >
                Week
              </Link>
              <Link
                href={buildHref({ view: 'day' })}
                className={cn(
                  'rounded-md px-2.5 py-1',
                  isDayView ? 'bg-muted font-medium' : 'text-muted-foreground'
                )}
              >
                Day
              </Link>
            </div>
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={
                <Link href={prevHref} aria-label="Previous">
                  <ChevronLeft className="size-4" />
                </Link>
              }
            />
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={todayHref}>Today</Link>}
            />
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={
                <Link href={nextHref} aria-label="Next">
                  <ChevronRight className="size-4" />
                </Link>
              }
            />
            <AddTaskDialog
              subjects={subjectOptions}
              defaultDate={format(anchor, ISO)}
              trigger={
                <Button size="sm" disabled={subjects.length === 0}>
                  <Plus className="size-4" /> Add task
                </Button>
              }
            />
            {subjects.length > 0 && <GeneratePlanButton />}
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Link href={buildHref({ subject: null })}>
              <Badge variant={!subjectFilter ? 'default' : 'secondary'}>All</Badge>
            </Link>
            {subjects.map((s) => (
              <Link key={s.id} href={buildHref({ subject: s.id })}>
                <Badge variant={subjectFilter === s.id ? 'default' : 'secondary'}>{s.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {subjects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a subject first</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              You need at least one subject before you can schedule study tasks.
            </CardContent>
          </Card>
        ) : (
          <div className={cn('grid gap-3', !isDayView && 'md:grid-cols-2 xl:grid-cols-4')}>
            {days.map((day) => {
              const dayTasks = tasksForDay(day);
              return (
                <div key={day.toISOString()} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={isToday(day) ? 'text-primary' : ''}>
                      {format(day, 'EEE d')}
                    </span>
                    {isToday(day) && (
                      <Badge variant="secondary" className="text-[10px]">
                        Today
                      </Badge>
                    )}
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
                      Nothing scheduled
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingExams.length === 0 ? (
              <p className="text-muted-foreground text-sm">No exams scheduled.</p>
            ) : (
              upcomingExams.map((exam) => (
                <div key={exam.id} className="text-sm">
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {exam.subject.name} · {format(exam.examDate, 'PPP')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
