import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test('does not show quiz grid when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText('Featured Quizzes')).not.toBeVisible();
  });
});