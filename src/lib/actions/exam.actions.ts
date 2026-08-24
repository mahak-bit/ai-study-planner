'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import * as examService from '@/lib/services/exam.service';
import { NotFoundError } from '@/lib/services/subject.service';
import { createExamSchema, updateExamSchema } from '@/lib/validations/exam.schema';

export type ActionResult = { success: true } | { success: false; error: string };

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export async function createExam(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await examService.createExam(user.id, parsed.data);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath(`/subjects/${parsed.data.subjectId}`);
  revalidatePath('/planner');
  return { success: true };
}

export async function updateExam(subjectId: string, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await examService.updateExam(user.id, parsed.data);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath('/planner');
  return { success: true };
}

export async function deleteExam(subjectId: string, examId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await examService.deleteExam(user.id, examId);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath('/planner');
  return { success: true };
}
