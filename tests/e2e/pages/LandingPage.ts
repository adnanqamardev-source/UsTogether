import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Landing Page (unauthenticated view)
 */
export class LandingPage {
  readonly page: Page;
  readonly tagline: Locator;
  readonly signInButton: Locator;
  readonly logo: Locator;
  readonly logoText: Locator;
  readonly featureCards: Locator;
  readonly statCounters: Locator;
  readonly getStartedButton: Locator;
  readonly footer: Locator;
  readonly privacyLink: Locator;
  readonly termsLink: Locator;
  readonly contactLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tagline = page.getByText('How well do you know each other?');
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.logo = page.locator('span.font-bold.text-xl.text-white').first();
    this.logoText = page.getByText('UsTogether').first();
    this.featureCards = page.locator('.group.relative.rounded-\\[2rem\\]');
    this.statCounters = page.locator('.flex.items-center.gap-3.rounded-2xl');
    this.getStartedButton = page.getByRole('button', { name: /get started/i });
    this.footer = page.locator('footer');
    this.privacyLink = page.getByText('Privacy');
    this.termsLink = page.getByText('Terms');
    this.contactLink = page.getByText('Contact');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLandingVisible() {
    await expect(this.tagline).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectNotAuthenticated() {
    await expect(this.signInButton).toBeVisible();
    // Dashboard nav should not be visible
    await expect(this.page.getByText('Together')).not.toBeVisible();
  }

  async expectFeatureCardsVisible() {
    await expect(this.featureCards).toHaveCount(3);
  }

  async expectStatsVisible() {
    await expect(this.statCounters).toHaveCount(3);
  }

  async expectFooterVisible() {
    await expect(this.footer).toBeVisible();
    await expect(this.privacyLink).toBeVisible();
    await expect(this.termsLink).toBeVisible();
    await expect(this.contactLink).toBeVisible();
  }
}
