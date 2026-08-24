import { auth } from '@/lib/auth/auth';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * For Server Actions and Route Handlers that require a signed-in user.
 * Throws rather than returning null so call sites can't accidentally
 * proceed with an unauthenticated request.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
