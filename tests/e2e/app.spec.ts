import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders tagline and sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('How well do you know each other?')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('does not show dashboard nav when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Together')).not.toBeVisible();
  });
});