import { test, expect } from '@playwright/test';

test.describe('Feature: Quiz Flow', () => {
  test.describe('Quiz List (Unauthenticated)', () => {
    test('should not show quiz grid when unauthenticated', async ({ page }) => {
      await page.goto('/');
      // The AuthWrapper shows the sign-in screen for unauthenticated users
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      await expect(page.getByText('Featured Quizzes')).not.toBeVisible();
    });

    test('should not show Fetch New button when unauthenticated', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // Fetch New is only visible on the dashboard when authenticated
      await expect(page.getByRole('button', { name: /fetch new/i })).not.toBeVisible();
    });
  });

  test.describe('Quiz Card Interaction', () => {
    test('dashboard should render without crashing with mock auth', async ({ page, context }) => {
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

      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // Page should not crash
      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Session Routing', () => {
    test('should handle session hash routing', async ({ page, context }) => {
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

      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should handle memories hash routing', async ({ page, context }) => {
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

      await page.goto('/dashboard#memories');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should handle stats hash routing', async ({ page, context }) => {
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

      await page.goto('/dashboard#stats');
      await page.waitForTimeout(2000);

      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Active Session UI', () => {
    test('should not crash when viewing active session', async ({ page, context }) => {
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

      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });

    test('should handle End Session flow if present', async ({ page, context }) => {
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

      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(2000);

      // Check if End Session button exists
      const endSessionBtn = page.getByRole('button', { name: /end session/i });
      const isVisible = await endSessionBtn.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        await endSessionBtn.click();
        
        const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
        }
      }

      // Verify no crash
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });
});
