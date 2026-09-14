import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the StreakCounter component.
 * The StreakCounter is rendered inside CoupleDashboard when a user is paired.
 */
export class StreakCounterPage {
  readonly page: Page;
  readonly counter: Locator;
  readonly streakValue: Locator;
  readonly label: Locator;
  readonly flameIcon: Locator;
  readonly progressBar: Locator;
  readonly fireEmoji: Locator;

  constructor(page: Page) {
    this.page = page;
    this.counter = page.locator('[data-testid="streak-counter"]');
    this.streakValue = page.locator('[data-testid="streak-value"]');
    this.label = page.getByText('Day Streak');
    this.flameIcon = page.locator('[data-testid="streak-counter"] svg');
    this.progressBar = page.locator('[data-testid="streak-counter"] .rounded-full.bg-gradient-to-r');
    this.fireEmoji = page.getByText('🔥');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectVisible() {
    await expect(this.counter).toBeVisible({ timeout: 10000 });
  }

  async expectNotVisible() {
    await expect(this.counter).not.toBeVisible();
  }

  async getStreakValue(): Promise<number> {
    const text = await this.streakValue.innerText();
    return parseInt(text, 10);
  }

  async expectStreakValue(expected: number) {
    await expect(this.streakValue).toHaveText(String(expected));
  }

  async expectLabel() {
    await expect(this.label).toBeVisible();
  }

  async expectFireEmoji() {
    // Fire emoji appears after ignite animation (300ms delay)
    await expect(this.fireEmoji).toBeVisible({ timeout: 3000 });
  }

  async expectProgressBar() {
    await expect(this.progressBar).toBeVisible();
  }
}
