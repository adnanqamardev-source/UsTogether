# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Landing Page >> does not show dashboard nav when unauthenticated
- Location: tests\e2e\app.spec.ts:10:3

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByText('Together')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for getByText('Together')
    12 × locator resolved to <p class="text-lg md:text-xl text-indigo-200/80 max-w-2xl mx-auto font-light">Create personalized quizzes relevant to your jour…</p>
       - unexpected value "visible"

```

```yaml
- paragraph: Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Landing Page', () => {
  4  |   test('renders tagline and sign-in when unauthenticated', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page.getByText('How well do you know each other?')).toBeVisible();
  7  |     await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  8  |   });
  9  | 
  10 |   test('does not show dashboard nav when unauthenticated', async ({ page }) => {
  11 |     await page.goto('/');
> 12 |     await expect(page.getByText('Together')).not.toBeVisible();
     |                                                  ^ Error: expect(locator).not.toBeVisible() failed
  13 |   });
  14 | });
```