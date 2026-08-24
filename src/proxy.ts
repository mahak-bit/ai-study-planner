import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/planner', '/subjects', '/coach', '/analytics'];
const ONBOARDING_PREFIX = '/onboarding';

// Next.js 16 renamed middleware.ts to proxy.ts (Node.js runtime only — no
// edge option). See auth.ts for why that lets us use one unified config.
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const onboardingCompleted = req.auth?.user?.onboardingCompleted ?? false;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix));
  const isOnboarding = nextUrl.pathname.startsWith(ONBOARDING_PREFIX);

  if (!isLoggedIn && (isProtected || isOnboarding)) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && !onboardingCompleted && isProtected) {
    return NextResponse.redirect(new URL('/onboarding/profile', nextUrl));
  }

  if (isLoggedIn && onboardingCompleted && isOnboarding) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
