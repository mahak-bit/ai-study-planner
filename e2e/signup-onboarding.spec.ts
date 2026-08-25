import { expect, test } from '@playwright/test';

// The one critical happy-path flow: a brand-new student can sign up, get
// guided through onboarding, and land on a working dashboard. Deliberately
// does not touch AI-dependent features (plan generation, coach) -- those are
// covered by manual verification each phase, not this deterministic,
// secrets-free CI-safe flow.
test('a new user can sign up, complete onboarding, and reach the dashboard', async ({ page }) => {
  test.setTimeout(60_000);
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('E2E Test Student');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 15_000 });

  await page.getByRole('combobox', { name: 'Education level' }).click();
  await page.getByRole('option', { name: 'Undergraduate' }).click();
  await page.getByRole('checkbox', { name: 'Morning' }).click();
  for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
    await page.getByLabel(day, { exact: true }).fill('3');
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/onboarding\/subjects/, { timeout: 15_000 });
  await page.getByPlaceholder('Subject name (e.g. Mathematics)').fill('Mathematics');
  await page.getByPlaceholder('Topic name').fill('Integration');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/onboarding\/exams/, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Skip for now' }).click();

  await expect(page).toHaveURL(/\/onboarding\/review/, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Finish setup' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByText("Today's plan")).toBeVisible();
});
