import { requireUser } from '@/lib/auth/session';
import { getOnboardingData } from '@/lib/services/onboarding.service';
import {
  defaultWeeklyAvailability,
  type WeeklyAvailability,
} from '@/lib/validations/onboarding.schema';
import { ProfileForm } from '@/components/onboarding/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Your profile — AI Study Planner' };

export default async function OnboardingProfilePage() {
  const user = await requireUser();
  const { profile } = await getOnboardingData(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about yourself</CardTitle>
        <CardDescription>
          This shapes how much work we schedule per day and when we suggest studying.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          defaultValues={{
            educationLevel: profile?.educationLevel ?? undefined,
            goals: profile?.goals ?? '',
            weeklyAvailabilityHours:
              (profile?.weeklyAvailabilityHours as WeeklyAvailability | null) ??
              defaultWeeklyAvailability,
            preferredStudyTimes: profile?.preferredStudyTimes ?? [],
            timezone: profile?.timezone ?? '',
          }}
        />
      </CardContent>
    </Card>
  );
}
