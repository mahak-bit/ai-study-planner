'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import * as subjectService from '@/lib/services/subject.service';
import {
  createSubjectSchema,
  createTopicSchema,
  updateSubjectSchema,
  updateTopicSchema,
} from '@/lib/validations/subject.schema';

export type ActionResult = { success: true } | { success: false; error: string };

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export async function createSubject(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await subjectService.createSubject(user.id, parsed.data);
  revalidatePath('/subjects');
  return { success: true };
}

export async function updateSubject(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await subjectService.updateSubject(user.id, parsed.data);
  } catch (error) {
    if (error instanceof subjectService.NotFoundError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  revalidatePath('/subjects');
  return { success: true };
}

export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await subjectService.deleteSubject(user.id, subjectId);
  } catch (error) {
    if (error instanceof subjectService.NotFoundError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  revalidatePath('/subjects');
  return { success: true };
}

export async function createTopic(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await subjectService.createTopic(user.id, parsed.data);
  } catch (error) {
    if (error instanceof subjectService.NotFoundError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  revalidatePath(`/subjects/${parsed.data.subjectId}`);
  revalidatePath('/subjects');
  return { success: true };
}

export async function updateTopic(subjectId: string, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await subjectService.updateTopic(user.id, parsed.data);
  } catch (error) {
    if (error instanceof subjectService.NotFoundError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath('/subjects');
  return { success: true };
}

export async function deleteTopic(subjectId: string, topicId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await subjectService.deleteTopic(user.id, topicId);
  } catch (error) {
    if (error instanceof subjectService.NotFoundError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath('/subjects');
  return { success: true };
}
