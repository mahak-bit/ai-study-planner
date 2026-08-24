import { requireUser } from '@/lib/auth/session';
import { getOnboardingData } from '@/lib/services/onboarding.service';
import type { ExamsStepInput } from '@/lib/validations/onboarding.schema';
import { ExamsForm } from '@/components/onboarding/exams-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata = { title: 'Your exams — AI Study Planner' };

export default async function OnboardingExamsPage() {
  const user = await requireUser();
  const { subjects, exams } = await getOnboardingData(user.id);

  const subjectOptions = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    topics: subject.topics.map((topic) => ({ id: topic.id, name: topic.name })),
  }));

  const defaultExams: ExamsStepInput['exams'] = exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    subjectId: exam.subjectId,
    examDate: exam.examDate.toISOString().slice(0, 10),
    priority: exam.priority,
    topicIds: exam.topics.map((t) => t.topicId),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Any exams coming up?</CardTitle>
        <CardDescription>
          Optional, but exam dates are what let the plan prioritize what matters most right now. You
          can always add these later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subjectOptions.length === 0 ? (
          <Alert>
            <AlertDescription>
              Add at least one subject on the previous step before adding exams.
            </AlertDescription>
          </Alert>
        ) : (
          <ExamsForm subjects={subjectOptions} defaultValues={{ exams: defaultExams }} />
        )}
      </CardContent>
    </Card>
  );
}
