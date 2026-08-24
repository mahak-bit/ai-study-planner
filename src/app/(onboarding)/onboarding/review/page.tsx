import Link from 'next/link';
import { format } from 'date-fns';

import { requireUser } from '@/lib/auth/session';
import { getOnboardingData } from '@/lib/services/onboarding.service';
import { CompleteOnboardingButton } from '@/components/onboarding/complete-onboarding-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata = { title: 'Review — AI Study Planner' };

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  HIGH_SCHOOL: 'High school',
  UNDERGRADUATE: 'Undergraduate',
  GRADUATE: 'Graduate',
  POSTGRADUATE: 'Postgraduate',
  COMPETITIVE_EXAM: 'Competitive exam prep',
  OTHER: 'Other',
};

export default async function OnboardingReviewPage() {
  const user = await requireUser();
  const { profile, subjects, exams } = await getOnboardingData(user.id);

  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const canComplete = subjects.some((s) => s.topics.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review your plan setup</CardTitle>
        <CardDescription>
          Make sure everything looks right before we build your plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Profile</h3>
            <Link
              href="/onboarding/profile"
              className="text-muted-foreground text-xs underline-offset-4 hover:underline"
            >
              Edit
            </Link>
          </div>
          {profile?.educationLevel ? (
            <p className="text-muted-foreground text-sm">
              {EDUCATION_LEVEL_LABELS[profile.educationLevel]} ·{' '}
              {(profile.preferredStudyTimes ?? []).join(', ').toLowerCase() ||
                'no preferred times set'}
            </p>
          ) : (
            <p className="text-destructive text-sm">Not filled in yet.</p>
          )}
        </section>

        <Separator />

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Subjects ({subjects.length}) &middot; {totalTopics} topic
              {totalTopics === 1 ? '' : 's'}
            </h3>
            <Link
              href="/onboarding/subjects"
              className="text-muted-foreground text-xs underline-offset-4 hover:underline"
            >
              Edit
            </Link>
          </div>
          {subjects.length === 0 ? (
            <p className="text-destructive text-sm">
              Add at least one subject with a topic before finishing setup.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {subjects.map((subject) => (
                <li key={subject.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-muted-foreground">
                    {subject.topics.length} topic{subject.topics.length === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator />

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Exams ({exams.length})</h3>
            <Link
              href="/onboarding/exams"
              className="text-muted-foreground text-xs underline-offset-4 hover:underline"
            >
              Edit
            </Link>
          </div>
          {exams.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No exams added — you can add these anytime.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {exams.map((exam) => (
                <li key={exam.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{exam.title}</span>
                  <span className="text-muted-foreground">{format(exam.examDate, 'PPP')}</span>
                  <Badge variant="secondary" className="text-xs">
                    {exam.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator />

        {canComplete ? (
          <CompleteOnboardingButton />
        ) : (
          <Button disabled className="w-full">
            Add a subject to finish setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
