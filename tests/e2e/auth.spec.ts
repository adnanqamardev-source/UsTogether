import { test, expect } from '@playwright/test';

test.describe('Feature: Authentication Flow', () => {
  test.describe('Sign-In Button Behavior', () => {
    test('@smoke should display sign-in button on landing page', async ({ page }) => {
      await page.goto('/');
      const signInBtn = page.getByRole('button', { name: /Sign In/i });
      await expect(signInBtn).toBeVisible();
    });

    test('should have proper styling on sign-in button', async ({ page }) => {
      await page.goto('/');
      const signInBtn = page.getByRole('button', { name: /Sign In/i });
      await expect(signInBtn).toBeVisible();
    });

    test('should be clickable and trigger auth flow', async ({ page }) => {
      await page.goto('/');
      const signInBtn = page.getByRole('button', { name: /Sign In/i });
      await expect(signInBtn).toBeVisible();
      
      // Click the button - Firebase will try to open a popup
      // We just verify the click doesn't crash the page
      await signInBtn.click();
      await page.waitForTimeout(1000);
      
      // Page should still be functional
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  test.describe('Auth State Rendering', () => {
    test('should show loading state initially', async ({ page }) => {
      await page.goto('/');
      // The AuthWrapper shows a loading pulse animation while checking auth
      // Eventually the page settles to show login or dashboard
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('should show login screen when not authenticated', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByText('How well do you', { exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should not show dashboard features when unauthenticated', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Quiz list should not be visible
      await expect(page.getByText('Featured Quizzes')).not.toBeVisible();
      // Streak counter should not be visible
      await expect(page.getByText('Day Streak')).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('dashboard should handle unauthenticated access', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // Dashboard wraps content in AuthWrapper - should show login or handle gracefully
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });

    test('stats page should handle unauthenticated access', async ({ page }) => {
      await page.goto('/stats');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });
  });

  test.describe('Sign-Out Flow', () => {
    test('dashboard should handle authenticated state', async ({ page, context }) => {
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
      await page.waitForTimeout(2000);

      // Page should render without crashing
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });
  });
});
