import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Dashboard (authenticated, pre-pairing view)
 */
export class DashboardPage {
  readonly page: Page;
  readonly pairingCode: Locator;
  readonly partnerCodeInput: Locator;
  readonly connectButton: Locator;
  readonly logo: Locator;
  readonly logOutButton: Locator;
  readonly displayName: Locator;
  readonly errorMsg: Locator;
  readonly pairingSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pairingCode = page.locator('.font-mono.text-3xl, .font-mono.text-4xl').first();
    this.partnerCodeInput = page.locator('input[type="text"][placeholder*="PARTNER"]');
    this.connectButton = page.getByRole('button', { name: /connect/i });
    this.logo = page.locator('span.font-bold.text-xl').first();
    this.logOutButton = page.getByRole('button', { name: /log out/i });
    this.displayName = page.locator('.text-xs.text-indigo-300.font-bold');
    this.errorMsg = page.locator('.text-rose-400.text-xs');
    this.pairingSection = page.getByText('Connect with your Partner');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPairingView() {
    await expect(this.pairingSection).toBeVisible();
    await expect(this.partnerCodeInput).toBeVisible();
    await expect(this.connectButton).toBeVisible();
  }

  async expectPairingCodeVisible() {
    await expect(this.pairingCode).toBeVisible();
  }

  async enterPartnerCode(code: string) {
    await this.partnerCodeInput.fill(code);
  }

  async clickConnect() {
    await this.connectButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorMsg).toBeVisible();
    if (typeof message === 'string') {
      await expect(this.errorMsg).toContainText(message);
    } else {
      await expect(this.errorMsg).toHaveText(message);
    }
  }

  async expectNoError() {
    await expect(this.errorMsg).not.toBeVisible();
  }
}
