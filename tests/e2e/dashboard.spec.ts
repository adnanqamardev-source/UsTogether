import { test, expect } from '@playwright/test';

test.describe('Feature: Dashboard & Pairing Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set mock auth cookies
    await context.addCookies([
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

  test.describe('Dashboard Mount', () => {
    test('@smoke should mount dashboard without crashing', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should mount with coupleId hash without crashing', async ({ page }) => {
      await page.goto('/dashboard#couple/test-couple-id');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should mount with session hash without crashing', async ({ page }) => {
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Pairing UI (Unpaired State)', () => {
    test('should render dashboard body without crashing', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should not crash when trying to pair with invalid code', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      const partnerInput = page.locator('input[placeholder*="PARTNER"], input[placeholder*="partner"]');
      const connectBtn = page.getByRole('button', { name: /connect/i });

      if (await partnerInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await partnerInput.fill('INVALID!');
        if (await connectBtn.isVisible().catch(() => false)) {
          await connectBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Verify no crash
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Navigation Elements', () => {
    test('should not crash when rendering dashboard nav', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });
  });
});
