'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import * as quizService from '@/lib/services/quiz.service';
import { NotFoundError } from '@/lib/services/subject.service';
import { createQuizAttemptSchema } from '@/lib/validations/quiz.schema';

export type ActionResult = { success: true } | { success: false; error: string };

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export async function createQuizAttempt(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createQuizAttemptSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  let subjectId: string;
  try {
    ({ subjectId } = await quizService.createQuizAttempt(user.id, parsed.data));
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true };
}

export async function deleteQuizAttempt(
  subjectId: string,
  attemptId: string
): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await quizService.deleteQuizAttempt(user.id, attemptId);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  return { success: true };
}
