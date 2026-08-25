import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import { resolveAuthRedirect } from '@/lib/auth/routeGuard';

// Next.js 16 renamed middleware.ts to proxy.ts (Node.js runtime only — no
// edge option). See auth.ts for why that lets us use one unified config.
export default auth((req) => {
  const { nextUrl } = req;

  const redirectTo = resolveAuthRedirect({
    pathname: nextUrl.pathname,
    isLoggedIn: !!req.auth?.user,
    onboardingCompleted: req.auth?.user?.onboardingCompleted ?? false,
  });

  if (redirectTo === '/login') {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
