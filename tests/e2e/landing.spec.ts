import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';

test.describe('Feature: Landing Page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.goto();
  });

  test.describe('Unauthenticated State (Auth Wrapper)', () => {
    // NOTE: AuthWrapper currently replaces children (LandingSections) with the
    // login screen for unauthenticated users. So unauthenticated visitors only
    // see the sign-in prompt, not the full landing page content.
    test('should display the main tagline', async ({ page }) => {
      await expect(landingPage.tagline).toBeVisible();
      await expect(landingPage.tagline).toContainText('How well do you know each other?');
    });

    test('should show sign-in button', async ({ page }) => {
      await expect(landingPage.signInButton).toBeVisible();
      await expect(landingPage.signInButton).toContainText('Sign in to Connect');
    });

    test('should show the Us logo mark', async ({ page }) => {
      // AuthWrapper renders the "U" logo block
      await expect(page.getByText('U', { exact: true }).first()).toBeVisible();
    });

    test('should show the value proposition paragraph', async ({ page }) => {
      await expect(
        page.getByText(/Create personalized quizzes relevant to your journey together/)
      ).toBeVisible();
    });

    test('should NOT show dashboard navigation when unauthenticated', async ({ page }) => {
      await expect(page.getByRole('link', { name: /^Quizzes$/ })).not.toBeVisible();
      await expect(page.getByRole('link', { name: /^Memories$/ })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /^Log Out$/ })).not.toBeVisible();
    });

    test('should NOT show quiz list when unauthenticated', async ({ page }) => {
      await expect(page.getByText('Featured Quizzes')).not.toBeVisible();
      await expect(page.getByRole('button', { name: /fetch new/i })).not.toBeVisible();
    });
  });

  test.describe('Landing Sections Visibility (Known Issue)', () => {
    // KNOWN ISSUE: The LandingSections content (feature cards, stat counters,
    // footer, "Get Started" button) is wrapped inside AuthWrapper. Because
    // AuthWrapper swaps children out for the login screen when unauthenticated,
    // this marketing content is never shown to logged-out visitors.
    test.fixme('feature cards should be visible to unauthenticated visitors', async ({ page }) => {
      await expect(page.getByText('Live Quiz Battles')).toBeVisible();
      await expect(page.getByText('Memory Timeline')).toBeVisible();
      await expect(page.getByText('Streak & Achievements')).toBeVisible();
    });

    test.fixme('stat counters should be visible to unauthenticated visitors', async ({ page }) => {
      await expect(page.getByText('Couples Playing')).toBeVisible();
      await expect(page.getByText('Quizzes Completed')).toBeVisible();
      await expect(page.getByText('Daily Streaks')).toBeVisible();
    });

    test.fixme('footer with legal links should be visible', async ({ page }) => {
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.getByText('Privacy')).toBeVisible();
      await expect(page.getByText('Terms')).toBeVisible();
      await expect(page.getByText('Contact')).toBeVisible();
    });

    test.fixme('Get Started button should be visible', async ({ page }) => {
      await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    });
  });

  test.describe('Visual & Layout', () => {
    test('should have correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/UsTogether/);
    });

    test('should have dark theme applied', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test('should render without console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const relevantErrors = errors.filter(
        (err) =>
          !err.includes('firebase') &&
          !err.includes('Firebase') &&
          !err.includes('auth/') &&
          !err.includes('enableMultiTabIndexedDbPersistence')
      );

      expect(relevantErrors).toEqual([]);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(landingPage.tagline).toBeVisible();
      await expect(landingPage.signInButton).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(landingPage.tagline).toBeVisible();
      await expect(landingPage.signInButton).toBeVisible();
    });
  });

  test.describe('Screenshots', () => {
    test('should capture full landing page screenshot', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'test-results/artifacts/landing-page-full.png',
        fullPage: true,
      });
    });

    test('should capture mobile landing page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'test-results/artifacts/landing-page-mobile.png',
        fullPage: true,
      });
    });
  });
});
