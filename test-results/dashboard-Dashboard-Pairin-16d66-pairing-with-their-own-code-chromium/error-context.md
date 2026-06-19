# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Pairing Flow >> should prevent user from pairing with their own code
- Location: tests\e2e\dashboard.spec.ts:14:7

# Error details

```
TimeoutError: locator.innerText: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.font-mono.text-3xl')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e5]: U
    - heading "How well do you know each other?" [level=1] [ref=e6]
    - paragraph [ref=e7]: Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
    - button "Sign in to Connect" [ref=e8] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e14] [cursor=pointer]:
    - img [ref=e15]
  - alert [ref=e18]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard Pairing Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should render the pairing interface for unpaired users', async ({ page }) => {
  9  |     await expect(page.getByText('Connect with your Partner')).toBeVisible();
  10 |     await expect(page.getByText('Your Code')).toBeVisible();
  11 |     await expect(page.getByPlaceholder('ENTER PARTNER CODE')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should prevent user from pairing with their own code', async ({ page }) => {
> 15 |     const myCodeElement = await page.locator('.font-mono.text-3xl').innerText();
     |                                                                     ^ TimeoutError: locator.innerText: Timeout 15000ms exceeded.
  16 |     const input = page.getByPlaceholder('ENTER PARTNER CODE');
  17 |     await input.fill(myCodeElement);
  18 |     await page.getByRole('button', { name: 'Connect' }).click();
  19 |     await expect(page.getByText("You can't pair with yourself!")).toBeVisible();
  20 |   });
  21 | 
  22 |   test('button should show loading state during valid pairing attempt', async ({ page }) => {
  23 |     const input = page.getByPlaceholder('ENTER PARTNER CODE');
  24 |     await input.fill('VALID123');
  25 |     const connectBtn = page.getByRole('button', { name: 'Connect' });
  26 |     await connectBtn.click();
  27 |     await expect(page.getByRole('button', { name: 'Pairing...' })).toBeVisible();
  28 |   });
  29 | });
```