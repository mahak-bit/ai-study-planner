import Link from 'next/link';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/services/analytics.service';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';
import { RecommendationsCard } from '@/components/dashboard/recommendations-card';
import { TaskCard } from '@/components/planner/task-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Dashboard — AI Study Planner' };

export default async function DashboardPage() {
  const user = await requireUser();
  const [dashboard, subjects] = await Promise.all([
    getDashboardData(user.id),
    listSubjectsWithProgress(user.id),
  ]);

  const { todayTasks, weakTopics, upcomingExams, activeRecommendations, streak } = dashboard;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground text-sm">{format(new Date(), 'PPPP')}</p>
          </div>
          {streak > 0 && (
            <Badge variant="secondary" className="gap-1 text-sm">
              <Flame className="size-3.5 text-orange-500" />
              {streak}-day streak
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s plan</CardTitle>
            <Link href="/planner" className="text-primary text-sm hover:underline">
              Open planner
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Add a subject and generate a plan to see today&apos;s tasks here.
              </p>
            ) : todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing scheduled for today. Head to the planner to add a task or generate a plan.
              </p>
            ) : (
              todayTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </CardContent>
        </Card>

        <RecommendationsCard
          recommendations={activeRecommendations}
          hasSubjects={subjects.length > 0}
        />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weak topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakTopics.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No low-confidence topics right now — nice work.
              </p>
            ) : (
              weakTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{topic.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{topic.subject.name}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {topic.confidenceLevel}/5
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
