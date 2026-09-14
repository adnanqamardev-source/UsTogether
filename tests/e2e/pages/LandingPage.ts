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
    this.tagline = page.getByText('How well do you', { exact: false });
    this.signInButton = page.getByRole('button', { name: /Sign In/i });
    this.logo = page.getByText('UsTogether').first();
    this.logoText = page.getByText('UsTogether').first();
    this.featureCards = page.getByText('Live Battles');
    this.statCounters = page.getByText('Couples Playing');
    this.getStartedButton = page.getByRole('button', { name: /Get Started/i });
    this.footer = page.locator('footer');
    this.privacyLink = page.getByText('Privacy Policy');
    this.termsLink = page.getByText('Terms of Service');
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
