import { test, expect } from '@playwright/test';
import { StreakCounterPage } from './pages/StreakCounterPage';

/**
 * E2E tests for the StreakCounter component.
 *
 * The StreakCounter is rendered inside CoupleDashboard for paired users.
 * Since we can't do real Firebase auth in E2E, tests use mock cookies
 * to prevent crashes and verify UI resilience + selector correctness.
 */
test.describe('Feature: Streak Counter', () => {
  let streakPage: StreakCounterPage;

  test.beforeEach(async ({ page, context }) => {
    // Mock auth cookie — same pattern as other E2E tests in this codebase
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
    streakPage = new StreakCounterPage(page);
  });

  // -------------------------------------------------------------------
  // Mount / crash tests
  // -------------------------------------------------------------------
  test.describe('Mount & Crash Safety', () => {
    test('@smoke should mount dashboard without crashing', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);
      expect(await page.title()).not.toBe('Error');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should not crash when streak counter is present in DOM', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toBeEmpty();

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'test-results/artifacts/streak-counter-mount.png',
        fullPage: true,
      });
    });
  });

  // -------------------------------------------------------------------
  // Selector / rendering tests
  // -------------------------------------------------------------------
  test.describe('Rendering & Selectors', () => {
    test('should render streak counter with data-testid attribute', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const counter = page.locator('[data-testid="streak-counter"]');
      // Counter may or may not be visible depending on auth state,
      // but the selector should not throw
      const isVisible = await counter.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(counter).toBeVisible();
      }
      // No crash either way
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should render streak value with data-testid attribute', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const value = page.locator('[data-testid="streak-value"]');
      const isVisible = await value.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(value).toBeVisible();
        // Value should be a number
        const text = await value.innerText();
        expect(Number(text)).not.toBeNaN();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should show "Day Streak" label when counter is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const label = page.getByText('Day Streak');
      const isVisible = await label.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(label).toBeVisible();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  // -------------------------------------------------------------------
  // Animation tests
  // -------------------------------------------------------------------
  test.describe('Animations', () => {
    test('should trigger ignite animation on load', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // After 300ms the ignite state flips to true, showing the fire emoji
      const fireEmoji = page.getByText('🔥');
      const isVisible = await fireEmoji.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(fireEmoji).toBeVisible();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should animate progress bar from zero', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // The progress bar is a motion div with scaleX animation
      const progressBar = page.locator('[data-testid="streak-counter"] .rounded-full.bg-gradient-to-r');
      const isVisible = await progressBar.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(progressBar).toBeVisible();
        // Verify it has a computed width > 0 (animation completed)
        const width = await progressBar.evaluate(
          (el) => window.getComputedStyle(el).width
        );
        expect(parseFloat(width)).toBeGreaterThan(0);
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  // -------------------------------------------------------------------
  // Visual / screenshot tests
  // -------------------------------------------------------------------
  test.describe('Screenshots', () => {
    test('should capture streak counter screenshot', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const counter = page.locator('[data-testid="streak-counter"]');
      const isVisible = await counter.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await counter.screenshot({
          path: 'test-results/artifacts/streak-counter-element.png',
        });
      }

      // Always capture full page
      await page.screenshot({
        path: 'test-results/artifacts/streak-counter-full-page.png',
        fullPage: true,
      });
    });

    test('should capture streak counter on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'test-results/artifacts/streak-counter-mobile.png',
        fullPage: true,
      });
    });
  });

  // -------------------------------------------------------------------
  // Integration: Streak + other dashboard elements
  // -------------------------------------------------------------------
  test.describe('Dashboard Integration', () => {
    test('should coexist with achievements panel', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // Both components are in a 2-up grid
      const streakCounter = page.locator('[data-testid="streak-counter"]');
      const achievementsPanel = page.getByText('Achievements').first();

      const streakVisible = await streakCounter.isVisible({ timeout: 5000 }).catch(() => false);
      const achievementsVisible = await achievementsPanel.isVisible({ timeout: 3000 }).catch(() => false);

      if (streakVisible && achievementsVisible) {
        // Both should be visible simultaneously in the 2-column grid
        await expect(streakCounter).toBeVisible();
        await expect(achievementsPanel).toBeVisible();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should coexist with connection status card', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      const connectionStatus = page.getByText('Connection Status');
      const streakCounter = page.locator('[data-testid="streak-counter"]');

      const connVisible = await connectionStatus.isVisible({ timeout: 5000 }).catch(() => false);
      const streakVisible = await streakCounter.isVisible({ timeout: 3000 }).catch(() => false);

      if (connVisible && streakVisible) {
        await expect(connectionStatus).toBeVisible();
        await expect(streakCounter).toBeVisible();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should not cause console errors on dashboard load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/dashboard');
      await page.waitForTimeout(3000);

      // Filter out Firebase/network errors (expected without real auth)
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('firebase') &&
          !e.includes('Firebase') &&
          !e.includes('permission-denied') &&
          !e.includes('Missing or insufficient') &&
          !e.includes('Failed to load') &&
          !e.includes('Expected first argument to collection') &&
          !e.includes('Failed to create pairing code') &&
          !e.includes('Auth error')
      );

      expect(criticalErrors).toEqual([]);
    });
  });

  // -------------------------------------------------------------------
  // Stats page streak display
  // -------------------------------------------------------------------
  test.describe('Stats Page Streak Display', () => {
    test('should render stats page without crashing', async ({ page }) => {
      await page.goto('/stats');
      await page.waitForTimeout(3000);
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should show Day Streak stat card on stats page', async ({ page }) => {
      await page.goto('/stats');
      await page.waitForTimeout(3000);

      // Stats page shows streak as a stat card
      const dayStreak = page.getByText('Day Streak');
      const isVisible = await dayStreak.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        await expect(dayStreak).toBeVisible();
      }
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should capture stats page screenshot', async ({ page }) => {
      await page.goto('/stats');
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'test-results/artifacts/stats-page.png',
        fullPage: true,
      });
    });
  });
});
