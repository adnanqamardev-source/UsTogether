# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: console-errors.spec.ts >> Console errors on ChatDrawer open and Streak load >> no console errors while opening chat drawer and loading streak
- Location: tests\e2e\console-errors.spec.ts:18:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "404" [level=1] [ref=e5]
    - heading "This page could not be found." [level=2] [ref=e7]
  - button "Open Next.js Dev Tools" [ref=e13] [cursor=pointer]:
    - img [ref=e14]
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Console errors on ChatDrawer open and Streak load', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Mock Firebase auth session
  6  |     await page.context().addCookies([
  7  |       {
  8  |         name: 'session',
  9  |         value: 'mock-token',
  10 |         domain: 'localhost',
  11 |         path: '/',
  12 |         httpOnly: false,
  13 |         secure: false,
  14 |       },
  15 |     ]);
  16 |   });
  17 | 
  18 |   test('no console errors while opening chat drawer and loading streak', async ({ page }) => {
  19 |     const consoleErrors: string[] = [];
  20 |     page.on('console', (msg) => {
  21 |       if (msg.type() === 'error') {
  22 |         consoleErrors.push(msg.text());
  23 |       }
  24 |     });
  25 | 
  26 |     // Navigate to dashboard which loads streak counter
  27 |     await page.goto('/dashboard#couple/test-couple-id');
  28 |     await page.waitForTimeout(3000);
  29 | 
  30 |     // Open chat drawer
  31 |     const chatButton = page.getByRole('button', { name: /Chat/i }).first();
  32 |     if (await chatButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  33 |       await chatButton.click();
  34 |       await page.waitForTimeout(2000);
  35 |     }
  36 | 
  37 |     // Close chat drawer if open
  38 |     const closeButton = page.getByRole('button', { name: /Close|×/i }).first();
  39 |     if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  40 |       await closeButton.click();
  41 |       await page.waitForTimeout(1000);
  42 |     }
  43 | 
  44 |     // Filter out expected Firebase deprecation warnings and auth cancellation errors
  45 |     const relevantErrors = consoleErrors.filter(err => 
  46 |       !err.includes('enableMultiTabIndexedDbPersistence') &&
  47 |       !err.includes('auth/cancelled-popup-request')
  48 |     );
  49 | 
  50 |     // Assert no relevant console errors from chat or streak
> 51 |     expect(relevantErrors).toEqual([]);
     |                            ^ Error: expect(received).toEqual(expected) // deep equality
  52 |   });
  53 | });
  54 | 
```