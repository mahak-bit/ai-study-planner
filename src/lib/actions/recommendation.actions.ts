'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import * as recommendationService from '@/lib/services/recommendation.service';
import { NotFoundError } from '@/lib/services/subject.service';

export type ActionResult = { success: true } | { success: false; error: string };

export async function dismissRecommendation(id: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await recommendationService.dismissRecommendation(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/dashboard');
  return { success: true };
}
