import { test, expect } from '@playwright/test';

test.describe('Feature: Console Errors & Performance', () => {
  test.describe('Console Error Monitoring', () => {
    test('landing page should have no critical console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Filter out expected Firebase/auth errors
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes('firebase') &&
          !err.includes('Firebase') &&
          !err.includes('auth/') &&
          !err.includes('Auth error') &&
          !err.includes('Expected first argument to collection') &&
          !err.includes('enableMultiTabIndexedDbPersistence') &&
          !err.includes('auth/cancelled-popup-request') &&
          !err.includes('Failed to load resource')
      );

      expect(criticalErrors).toEqual([]);
    });

    test('dashboard should have no critical console errors', async ({ page, context }) => {
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

      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const criticalErrors = errors.filter(
        (err) =>
          !err.includes('firebase') &&
          !err.includes('Firebase') &&
          !err.includes('auth/') &&
          !err.includes('Auth error') &&
          !err.includes('Expected first argument to collection') &&
          !err.includes('enableMultiTabIndexedDbPersistence') &&
          !err.includes('auth/cancelled-popup-request') &&
          !err.includes('Missing or insufficient permissions') &&
          !err.includes('Failed to load resource')
      );

      expect(criticalErrors).toEqual([]);
    });

    test('stats page should have no critical console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/stats');
      await page.waitForTimeout(2000);

      const criticalErrors = errors.filter(
        (err) =>
          !err.includes('firebase') &&
          !err.includes('Firebase') &&
          !err.includes('auth/') &&
          !err.includes('Auth error') &&
          !err.includes('Expected first argument to collection') &&
          !err.includes('enableMultiTabIndexedDbPersistence') &&
          !err.includes('Missing or insufficient permissions')
      );

      expect(criticalErrors).toEqual([]);
    });
  });

  test.describe('Page Load Performance', () => {
    // Performance baselines. These are intentionally generous because the
    // Next.js dev server (used locally) is much slower than a production build.
    // In CI with a production build these should be tightened.
    const DEV_SERVER_TIMEOUT = 30000;

    test('landing page should load within budget (dev server)', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(DEV_SERVER_TIMEOUT);
      // eslint-disable-next-line no-console
      console.log(`[perf] landing: ${loadTime}ms`);
    });

    test('dashboard should load within budget (dev server)', async ({ page, context }) => {
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

      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(DEV_SERVER_TIMEOUT);
      // eslint-disable-next-line no-console
      console.log(`[perf] dashboard: ${loadTime}ms`);
    });

    test('stats page should load within budget (dev server)', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/stats');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(DEV_SERVER_TIMEOUT);
      // eslint-disable-next-line no-console
      console.log(`[perf] stats: ${loadTime}ms`);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle offline scenario gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Capture the URL and page state while online
      expect(page.url()).toContain('/');

      // Simulate offline
      await page.context().setOffline(true);

      // Attempt to navigate to a new page while offline
      // The page will fail to load (blank body is acceptable/expected offline)
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});

      // Verify no test crash - the navigation error is handled
      // Restore online and verify page recovers
      await page.context().setOffline(false);

      // After restoring online, we should be able to navigate successfully
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByText('UsTogether', { exact: false })).toBeVisible();
    });
  });

  test.describe('Error Boundary', () => {
    test('should handle non-existent page gracefully', async ({ page }) => {
      // Navigate to a non-existent page
      await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(1000);

      // Should show 404 or error page, not crash
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });
});
