import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the CoupleDashboard (authenticated, paired view)
 */
export class CoupleDashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly connectionStatus: Locator;
  readonly startQuizButton: Locator;
  readonly quizzesTab: Locator;
  readonly memoriesTab: Locator;
  readonly statsTab: Locator;
  readonly chatButton: Locator;
  readonly disconnectButton: Locator;
  readonly logOutButton: Locator;
  readonly liveSessionsSection: Locator;
  readonly featuredQuizzesSection: Locator;
  readonly fetchNewButton: Locator;
  readonly mobileMenuToggle: Locator;
  readonly streakCounter: Locator;
  readonly achievementsPanel: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('h1').first();
    this.connectionStatus = page.getByText('Connection Status');
    this.startQuizButton = page.getByRole('button', { name: /start quiz/i }).first();
    this.quizzesTab = page.getByRole('link', { name: /quizzes/i }).first();
    this.memoriesTab = page.getByRole('link', { name: /memories/i }).first();
    this.statsTab = page.getByRole('link', { name: /stats/i }).first();
    this.chatButton = page.getByRole('button', { name: /chat/i }).first();
    this.disconnectButton = page.getByRole('button', { name: /disconnect/i }).first();
    this.logOutButton = page.getByRole('button', { name: /log out/i }).first();
    this.liveSessionsSection = page.getByText('Live Sessions');
    this.featuredQuizzesSection = page.getByText('Featured Quizzes');
    this.fetchNewButton = page.getByRole('button', { name: /fetch new/i });
    this.mobileMenuToggle = page.getByRole('button', { name: /toggle menu/i });
    this.streakCounter = page.locator('[class*="streak"]').first();
    this.achievementsPanel = page.locator('[class*="achievement"]').first();
    this.logo = page.locator('span.font-bold').first();
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoWithHash(hash: string) {
    await this.page.goto(`/dashboard${hash}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectDashboardVisible() {
    await expect(this.page.locator('body')).not.toBeEmpty();
  }

  async expectConnectionStatus() {
    await expect(this.connectionStatus).toBeVisible();
  }

  async expectQuizListVisible() {
    await expect(this.featuredQuizzesSection).toBeVisible();
  }

  async expectNavigationVisible() {
    // Desktop nav
    await expect(this.quizzesTab).toBeVisible();
    await expect(this.memoriesTab).toBeVisible();
    await expect(this.chatButton).toBeVisible();
  }

  async openChat() {
    await this.chatButton.click();
  }

  async navigateToMemories() {
    await this.memoriesTab.click();
  }

  async navigateToStats() {
    await this.statsTab.click();
  }

  async navigateToQuizzes() {
    await this.quizzesTab.click();
  }

  async toggleMobileMenu() {
    await this.mobileMenuToggle.click();
  }

  async expectMobileMenuOpen() {
    await expect(this.page.getByRole('link', { name: /memories/i }).last()).toBeVisible();
  }
}
