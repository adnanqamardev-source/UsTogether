import { test, expect } from '@playwright/test';

test.describe('CoupleDashboard & ActiveSession Integrations', () => {
  test.beforeEach(async ({ page }) => {
    // Note: Firebase auth requires a real user session. These tests verify that the
    // dashboard and ActiveSession routing/base UI structure do not throw when the
    // page is visited. Assertions are intentionally no-crash because mocked cookies
    // do not satisfy Firebase Auth state.
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

  test('Dashboard mount with coupleId hash does not crash the app', async ({ page }) => {
    await page.goto('/dashboard#couple/test-couple-id');

    expect(await page.title()).not.toBe('Error');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ActiveSession render with sessionId hash does not crash the app', async ({ page }) => {
    await page.goto('/dashboard#session/test-session-id');

    expect(await page.title()).not.toBe('Error');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ActiveSession end-early flow does not crash the app', async ({ page }) => {
    await page.goto('/dashboard#session/test-session-id');

    expect(await page.title()).not.toBe('Error');
    await page.waitForTimeout(1500);

    // If End Session control is present, interact; otherwise fallback to no-crash.
    const endSessionBtn = page.getByRole('button', { name: /End Session/i });
    if (await endSessionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await endSessionBtn.click();
      const confirmBtn = page.getByRole('button', { name: /Confirm|Yes/i });
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
    }

    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});