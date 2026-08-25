import { GraduationCap } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="bg-muted/30 flex min-h-full flex-1 flex-col">
      <header className="bg-background border-b px-6 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 font-semibold">
          <GraduationCap className="text-primary size-5" />
          AI Study Planner
        </div>
      </header>
      <div className="bg-background border-b py-4">
        <OnboardingStepper />
      </div>
      <main id="main-content" className="flex flex-1 justify-center p-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
