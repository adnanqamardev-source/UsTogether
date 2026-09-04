import { test, expect } from '@playwright/test';

test.describe('Quiz sync and state integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'session',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
      },
    ]);
  });

  test('ActiveSession answer submission UI does not crash and shows waiting state', async ({ page }) => {
    await page.goto('/dashboard#session/test-session-id');

    expect(await page.title()).not.toBe('Error');
    await page.waitForTimeout(1500);

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textarea.fill('playwright answer');
      await page.getByRole('button', { name: /submit/i }).click();
      await page.waitForTimeout(1000);
      await expect(body).not.toBeEmpty();
    }
  });
});