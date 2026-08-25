export const PROTECTED_PREFIXES = ['/dashboard', '/planner', '/subjects', '/coach', '/analytics'];
export const ONBOARDING_PREFIX = '/onboarding';

/**
 * Pure route-protection decision, extracted from proxy.ts so this
 * security-critical logic is unit-testable without mocking Next.js
 * middleware/Auth.js internals. Returns the path to redirect to, or null to
 * let the request through.
 */
export function resolveAuthRedirect(params: {
  pathname: string;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
}): string | null {
  const { pathname, isLoggedIn, onboardingCompleted } = params;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isOnboarding = pathname.startsWith(ONBOARDING_PREFIX);

  if (!isLoggedIn && (isProtected || isOnboarding)) {
    return '/login';
  }

  if (isLoggedIn && !onboardingCompleted && isProtected) {
    return '/onboarding/profile';
  }

  if (isLoggedIn && onboardingCompleted && isOnboarding) {
    return '/dashboard';
  }

  return null;
}
