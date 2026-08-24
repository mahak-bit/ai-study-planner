'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const STEPS = [
  { href: '/onboarding/profile', label: 'Profile' },
  { href: '/onboarding/subjects', label: 'Subjects' },
  { href: '/onboarding/exams', label: 'Exams' },
  { href: '/onboarding/review', label: 'Review' },
];

export function OnboardingStepper() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((step) => pathname.startsWith(step.href));

  return (
    <nav
      aria-label="Onboarding progress"
      className="flex items-center justify-center gap-2 sm:gap-4"
    >
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.href} className="flex items-center gap-2 sm:gap-4">
            <Link
              href={step.href}
              className="flex items-center gap-2"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isComplete && 'bg-primary/15 text-primary',
                  !isCurrent && !isComplete && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </Link>
            {index < STEPS.length - 1 && (
              <span aria-hidden className="bg-border h-px w-6 sm:w-10" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
