'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { completeOnboarding } from '@/lib/actions/onboarding.actions';
import { Button } from '@/components/ui/button';

export function CompleteOnboardingButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    const result = await completeOnboarding();
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={isSubmitting}>
      {isSubmitting ? 'Setting up your plan…' : 'Finish setup'}
    </Button>
  );
}
