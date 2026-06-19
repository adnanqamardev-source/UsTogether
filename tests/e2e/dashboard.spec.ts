import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows unauthenticated state by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
