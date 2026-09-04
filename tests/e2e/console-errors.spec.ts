import { test, expect } from '@playwright/test';

test.describe('Console errors on ChatDrawer open and Streak load', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Firebase auth session
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

  test('no console errors while opening chat drawer and loading streak', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to dashboard which loads streak counter
    await page.goto('/dashboard#couple/test-couple-id');
    await page.waitForTimeout(3000);

    // Open chat drawer
    const chatButton = page.getByRole('button', { name: /Chat/i }).first();
    if (await chatButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chatButton.click();
      await page.waitForTimeout(2000);
    }

    // Close chat drawer if open
    const closeButton = page.getByRole('button', { name: /Close|×/i }).first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }

    // Filter out expected Firebase deprecation warnings and auth cancellation errors
    const relevantErrors = consoleErrors.filter(err => 
      !err.includes('enableMultiTabIndexedDbPersistence') &&
      !err.includes('auth/cancelled-popup-request')
    );

    // Assert no relevant console errors from chat or streak
    expect(relevantErrors).toEqual([]);
  });
});
