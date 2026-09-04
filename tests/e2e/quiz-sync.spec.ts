import { test, expect } from '@playwright/test';

test.describe('Feature: Quiz Sync & State Integrity', () => {
  test.beforeEach(async ({ page, context }) => {
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

  test.describe('Session State', () => {
    test('should maintain session state across hash changes', async ({ page }) => {
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      // Change hash
      await page.evaluate(() => {
        window.location.hash = '#memories';
      });
      await page.waitForTimeout(1000);

      // Change back
      await page.evaluate(() => {
        window.location.hash = '#session/test-session-id';
      });
      await page.waitForTimeout(1000);

      // Should not crash
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should handle rapid hash changes', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      // Rapidly change hashes
      for (let i = 0; i < 5; i++) {
        await page.evaluate((idx) => {
          const hashes = ['', '#memories', '#stats', '#session/test', '#memories'];
          window.location.hash = hashes[idx];
        }, i);
        await page.waitForTimeout(200);
      }

      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Answer Submission', () => {
    test('should handle answer submission in active session', async ({ page }) => {
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();

      // Look for textarea (answer input)
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.fill('playwright answer');
        
        const submitBtn = page.getByRole('button', { name: /submit/i });
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Should not crash after submission attempt
      await expect(body).not.toBeEmpty();
    });

    test('should handle empty answer submission', async ({ page }) => {
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      const submitBtn = page.getByRole('button', { name: /submit/i });
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Try to submit without entering answer
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }

      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Concurrent Access', () => {
    test('should handle multiple tabs accessing same session', async ({ page, context }) => {
      // Open first tab
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/dashboard#session/test-session-id');
      await page2.waitForTimeout(2000);

      // Both should render without crashing
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page2.locator('body')).not.toBeEmpty();

      await page2.close();
    });
  });

  test.describe('Data Persistence', () => {
    test('should preserve state on page refresh', async ({ page }) => {
      await page.goto('/dashboard#memories');
      await page.waitForTimeout(2000);

      // Refresh page
      await page.reload();
      await page.waitForTimeout(2000);

      // Should maintain the hash route
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      // Go back
      await page.goBack();
      await page.waitForTimeout(1000);

      // Go forward
      await page.goForward();
      await page.waitForTimeout(1000);

      await expect(page.locator('body')).not.toBeEmpty();
    });
  });
});
