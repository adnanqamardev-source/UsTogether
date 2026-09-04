import { test, expect } from '@playwright/test';

/**
 * @deprecated This test is now covered by landing.spec.ts and auth.spec.ts
 * Kept for backward compatibility
 */
test.describe('Landing Page (Legacy)', () => {
  test('renders tagline and sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('How well do you know each other?')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('does not show dashboard nav when unauthenticated', async ({ page }) => {
    await page.goto('/');
    // Dashboard nav has "Log Out" and quiz-related controls that are
    // only present when authenticated. The "Together" brand word appears
    // in both the nav AND the marketing copy, so we assert on elements
    // that are unique to the dashboard.
    await expect(page.getByRole('button', { name: /^log out$/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /^Memories$/ })).not.toBeVisible();
  });
});
