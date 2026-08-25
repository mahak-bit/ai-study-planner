import { describe, expect, it } from 'vitest';

import { resolveAuthRedirect } from '@/lib/auth/routeGuard';

describe('resolveAuthRedirect', () => {
  it('sends an unauthenticated user to /login for a protected route', () => {
    expect(
      resolveAuthRedirect({ pathname: '/dashboard', isLoggedIn: false, onboardingCompleted: false })
    ).toBe('/login');
  });

  it('sends an unauthenticated user to /login for an onboarding route', () => {
    expect(
      resolveAuthRedirect({
        pathname: '/onboarding/profile',
        isLoggedIn: false,
        onboardingCompleted: false,
      })
    ).toBe('/login');
  });

  it('lets an unauthenticated user reach a public route', () => {
    expect(
      resolveAuthRedirect({ pathname: '/', isLoggedIn: false, onboardingCompleted: false })
    ).toBe(null);
    expect(
      resolveAuthRedirect({ pathname: '/login', isLoggedIn: false, onboardingCompleted: false })
    ).toBe(null);
  });

  it('sends a logged-in user who has not finished onboarding to /onboarding/profile from a protected route', () => {
    expect(
      resolveAuthRedirect({ pathname: '/planner', isLoggedIn: true, onboardingCompleted: false })
    ).toBe('/onboarding/profile');
  });

  it('lets a logged-in, onboarding-incomplete user stay on onboarding routes', () => {
    expect(
      resolveAuthRedirect({
        pathname: '/onboarding/subjects',
        isLoggedIn: true,
        onboardingCompleted: false,
      })
    ).toBe(null);
  });

  it('bounces a logged-in, onboarding-complete user away from onboarding routes', () => {
    expect(
      resolveAuthRedirect({
        pathname: '/onboarding/profile',
        isLoggedIn: true,
        onboardingCompleted: true,
      })
    ).toBe('/dashboard');
  });

  it('lets a fully set-up user through to protected routes', () => {
    for (const pathname of ['/dashboard', '/planner', '/subjects', '/analytics', '/coach']) {
      expect(resolveAuthRedirect({ pathname, isLoggedIn: true, onboardingCompleted: true })).toBe(
        null
      );
    }
  });

  it('never protects a route outside the protected/onboarding prefixes', () => {
    expect(
      resolveAuthRedirect({ pathname: '/pricing', isLoggedIn: false, onboardingCompleted: false })
    ).toBe(null);
  });
});
