'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import {
  OnboardingIncompleteError,
  completeOnboarding as completeOnboardingService,
  saveExamsStep as saveExamsStepService,
  saveProfileStep as saveProfileStepService,
  saveSubjectsStep as saveSubjectsStepService,
} from '@/lib/services/onboarding.service';
import {
  examsStepSchema,
  profileStepSchema,
  subjectsStepSchema,
} from '@/lib/validations/onboarding.schema';

export type OnboardingActionResult = { success: true } | { success: false; error: string };

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export async function saveProfileStep(input: unknown): Promise<OnboardingActionResult> {
  const user = await requireUser();
  const parsed = profileStepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  await saveProfileStepService(user.id, parsed.data);
  revalidatePath('/onboarding');
  return { success: true };
}

export async function saveSubjectsStep(input: unknown): Promise<OnboardingActionResult> {
  const user = await requireUser();
  const parsed = subjectsStepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  await saveSubjectsStepService(user.id, parsed.data);
  revalidatePath('/onboarding');
  return { success: true };
}

export async function saveExamsStep(input: unknown): Promise<OnboardingActionResult> {
  const user = await requireUser();
  const parsed = examsStepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssueMessage(parsed.error) };
  }

  await saveExamsStepService(user.id, parsed.data);
  revalidatePath('/onboarding');
  return { success: true };
}

export async function completeOnboarding(): Promise<OnboardingActionResult> {
  const user = await requireUser();

  try {
    await completeOnboardingService(user.id);
  } catch (error) {
    if (error instanceof OnboardingIncompleteError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
