import { expect, test } from '@playwright/test';

// Fast, deterministic, no DB writes -- exercises the proxy.ts route guard
// (backed by the unit-tested resolveAuthRedirect) against a real request.
test.describe('route protection', () => {
  test('redirects an unauthenticated visitor from a protected route to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
  });

  test('redirects an unauthenticated visitor from onboarding to /login', async ({ page }) => {
    await page.goto('/onboarding/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('lets an unauthenticated visitor reach the login and register pages', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();

    await page.goto('/register');
    await expect(page.getByText('Create your account')).toBeVisible();
  });
});
