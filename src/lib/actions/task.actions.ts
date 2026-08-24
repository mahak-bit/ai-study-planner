'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/session';
import { NotFoundError } from '@/lib/services/subject.service';
import * as taskService from '@/lib/services/task.service';
import { createTaskSchema, markMissedSchema } from '@/lib/validations/task.schema';

export type ActionResult = { success: true } | { success: false; error: string };

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input';
}

export async function createTask(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await taskService.createTask(user.id, parsed.data);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/planner');
  return { success: true };
}

export async function completeTask(taskId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await taskService.completeTask(user.id, taskId);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/planner');
  return { success: true };
}

export async function reopenTask(taskId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await taskService.reopenTask(user.id, taskId);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/planner');
  return { success: true };
}

export async function markTaskMissed(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = markMissedSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  try {
    await taskService.markTaskMissed(user.id, parsed.data);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/planner');
  return { success: true };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await taskService.deleteTask(user.id, taskId);
  } catch (error) {
    if (error instanceof NotFoundError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath('/planner');
  return { success: true };
}
