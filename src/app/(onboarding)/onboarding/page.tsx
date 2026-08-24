import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Onboarding — AI Study Planner' };

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            Phase 3 — Coming next
          </Badge>
          <CardTitle>Let&apos;s set up your study plan</CardTitle>
          <CardDescription>
            The full onboarding wizard (education level, subjects, exams, availability) is built in
            Phase 3. For now, this route proves the redirect from proxy.ts works correctly.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
