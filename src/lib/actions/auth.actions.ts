'use server';

import { AuthError } from 'next-auth';

import { signIn, signOut } from '@/lib/auth/auth';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db/prisma';
import { loginSchema, registerSchema } from '@/lib/validations/auth.schema';

export type AuthActionResult = { success: true } | { success: false; error: string };

// The Credentials provider has no built-in signup flow — Auth.js only
// authenticates existing users, so account creation is a plain Server
// Action that writes the user directly, then signs them in.
export async function registerUser(input: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return loginUser({ email, password });
}

export async function loginUser(input: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    await signIn('credentials', { ...parsed.data, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid email or password' };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
