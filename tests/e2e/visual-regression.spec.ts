import { test, expect } from '@playwright/test';

test.describe('Feature: Visual Regression', () => {
  test.describe('Landing Page Screenshots', () => {
    test('should capture full landing page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/landing-desktop.png',
        fullPage: true,
      });
    });

    test('should capture landing page above the fold', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/landing-above-fold.png',
      });
    });

    test('should capture mobile landing page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/landing-mobile.png',
        fullPage: true,
      });
    });

    test('should capture tablet landing page', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/landing-tablet.png',
        fullPage: true,
      });
    });
  });

  test.describe('Dashboard Screenshots', () => {
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

    test('should capture dashboard page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/dashboard.png',
        fullPage: true,
      });
    });

    test('should capture dashboard with session hash', async ({ page }) => {
      await page.goto('/dashboard#session/test-session-id');
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/dashboard-session.png',
        fullPage: true,
      });
    });

    test('should capture dashboard with memories hash', async ({ page }) => {
      await page.goto('/dashboard#memories');
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/dashboard-memories.png',
        fullPage: true,
      });
    });

    test('should capture mobile dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/dashboard-mobile.png',
        fullPage: true,
      });
    });
  });

  test.describe('Stats Page Screenshots', () => {
    test('should capture stats page', async ({ page }) => {
      await page.goto('/stats');
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'test-results/artifacts/visual/stats.png',
        fullPage: true,
      });
    });
  });

  test.describe('Feature Cards', () => {
    test('should capture feature card hover state', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Hover over first feature card
      const firstCard = page.locator('.group.relative.rounded-\\[2rem\\]').first();
      if (await firstCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstCard.hover();
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: 'test-results/artifacts/visual/feature-card-hover.png',
        });
      }
    });
  });
});
