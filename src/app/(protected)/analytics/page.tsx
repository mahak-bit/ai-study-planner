import { requireUser } from '@/lib/auth/session';
import { getAnalyticsOverview } from '@/lib/services/analytics.service';
import { ConsistencyGrid } from '@/components/analytics/consistency-grid';
import { StudyTimeChart } from '@/components/analytics/study-time-chart';
import { SubjectProgressBars } from '@/components/analytics/subject-progress-bars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Analytics — AI Study Planner' };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const overview = await getAnalyticsOverview(user.id, 30);

  const completionPct =
    overview.completionRate === null ? null : Math.round(overview.completionRate * 100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Your study activity over the last 30 days.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study time</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyTimeChart data={overview.studyTimeByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completion rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {completionPct === null ? (
              <p className="text-muted-foreground text-sm">
                Not enough completed or missed tasks yet to calculate a rate.
              </p>
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">{completionPct}%</p>
                <p className="text-muted-foreground text-sm">
                  {overview.completedCount} completed, {overview.missedCount} missed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsistencyGrid data={overview.studyTimeByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject progress</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectProgressBars subjects={overview.subjectProgress} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
