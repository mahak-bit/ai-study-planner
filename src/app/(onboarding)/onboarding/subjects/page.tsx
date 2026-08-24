import { requireUser } from '@/lib/auth/session';
import { getOnboardingData } from '@/lib/services/onboarding.service';
import { SUBJECT_COLORS, type SubjectsStepInput } from '@/lib/validations/onboarding.schema';
import { SubjectsForm } from '@/components/onboarding/subjects-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Your subjects — AI Study Planner' };

export default async function OnboardingSubjectsPage() {
  const user = await requireUser();
  const { subjects } = await getOnboardingData(user.id);

  const defaultSubjects: SubjectsStepInput['subjects'] =
    subjects.length > 0
      ? subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          color: subject.color,
          topics: subject.topics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            difficulty: topic.difficulty,
            confidenceLevel: topic.confidenceLevel,
            estimatedHours: topic.estimatedHours ?? undefined,
          })),
        }))
      : [
          {
            name: '',
            color: SUBJECT_COLORS[0],
            topics: [{ name: '', difficulty: 'MEDIUM', confidenceLevel: 3 }],
          },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>What are you studying?</CardTitle>
        <CardDescription>
          Add each subject and the topics within it. Rate your confidence honestly — that&apos;s
          what drives how the plan prioritizes your time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubjectsForm defaultValues={{ subjects: defaultSubjects }} />
      </CardContent>
    </Card>
  );
}
