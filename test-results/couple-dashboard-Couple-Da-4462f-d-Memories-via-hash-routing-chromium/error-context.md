# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: couple-dashboard.spec.ts >> Couple Dashboard UI >> should navigate between Quizzes and Memories via hash routing
- Location: tests\e2e\couple-dashboard.spec.ts:8:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Pick a quiz or game to challenge your partner.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Pick a quiz or game to challenge your partner.')

```

```yaml
- text: U
- heading "How well do you know each other?" [level=1]
- paragraph: Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
- button "Sign in to Connect"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Couple Dashboard UI', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should navigate between Quizzes and Memories via hash routing', async ({ page }) => {
> 9  |     await expect(page.getByText('Pick a quiz or game to challenge your partner.')).toBeVisible();
     |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  10 |     await page.getByRole('link', { name: 'Memories' }).click();
  11 |     await expect(page).toHaveURL(/.*#memories/);
  12 |     await expect(page.getByRole('heading', { name: 'Memory Board' }).first()).toBeVisible();
  13 |     await page.getByRole('link', { name: 'Quizzes' }).click();
  14 |     await expect(page).not.toHaveURL(/.*#memories/);
  15 |   });
  16 | 
  17 |   test('should open and close the Chat Drawer', async ({ page }) => {
  18 |     await page.getByRole('button', { name: 'Chat' }).click();
  19 |     await expect(page.getByText('Partner Chat')).toBeVisible();
  20 |     await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
  21 |     await page.locator('.fixed.inset-0.bg-black\\/60').click({ position: { x: 10, y: 10 } });
  22 |     await expect(page.getByText('Partner Chat')).not.toBeVisible();
  23 |   });
  24 | 
  25 |   test('should trigger unpair confirmation', async ({ page }) => {
  26 |     page.on('dialog', dialog => dialog.dismiss());
  27 |     await page.getByRole('button', { name: 'Disconnect' }).click();
  28 |   });
  29 | });
```