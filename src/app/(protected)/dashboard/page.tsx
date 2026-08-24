import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Dashboard — AI Study Planner' };

export default function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary" className="mb-2 w-fit">
          Phase 2 — Auth guard verified
        </Badge>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          You&apos;re signed in and past the proxy route guard. The real dashboard (today&apos;s
          plan, progress, exams, AI insights) arrives in Phase 7.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
