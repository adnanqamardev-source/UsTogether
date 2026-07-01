# Implementation Plan

[Overview]
Add comprehensive Vitest unit tests for `lib/streak.ts` and `lib/achievements.ts`, plus Playwright E2E tests for `CoupleDashboard.tsx` and `ActiveSession.tsx` streak/achievement integration.

The project previously had only Playwright E2E tests with no unit test runner. This implementation adds Vitest with jsdom, creates unit tests covering date math edge cases (leap years, month transitions, year boundaries), achievement threshold logic, and deduplication, plus E2E tests for session completion flows. A minor source fix was applied to `lib/streak.ts` to avoid unnecessary Firestore writes on same-day activity.

[Types]
No new types needed. Existing types in `global.d.ts` (`UserProfile`, `Achievement`, `AchievementDefinition`, `AchievementContext`, `Session`, `Quiz`) are used directly.

[Files]

New files:
1. `vitest.config.ts` — Vitest config: jsdom environment, globals enabled, `@` path alias matching tsconfig, excludes `tests/e2e/`
2. `tests/unit/streak.test.ts` — 8 unit tests for `updateStreak()` covering: first-time user, same-day no-op, consecutive increment, missed-day reset, month transition (Feb 29 → Mar 1), leap year (Feb 28 → Feb 29), year boundary (Dec 31 → Jan 1), missing profile error
3. `tests/unit/achievements.test.ts` — 10 unit tests for `getEligibleAchievements()` and `checkAndAwardAchievements()` covering: multi-award, deduplication, missing doc, threshold boundaries, all achievement types
4. `tests/e2e/dashboard-and-sessions.spec.ts` — 3 Playwright E2E tests: dashboard mount triggers streak/achievement updates, finish session awards both users, end-early awards both users

Modified files:
1. `lib/streak.ts` — Added early return on same-day activity to avoid unnecessary `setDoc` write
2. `package.json` — Added `test:unit` and `test:unit:watch` scripts

[Functions]

New (test functions):
- `tests/unit/streak.test.ts`: `describe('updateStreak()')` with 8 `it()` tests
- `tests/unit/achievements.test.ts`: `describe('getEligibleAchievements()')` with 3 tests, `describe('checkAndAwardAchievements()')` with 7 tests
- `tests/e2e/dashboard-and-sessions.spec.ts`: 3 Playwright `test()` cases

Modified:
- `lib/streak.ts`: `updateStreak()` now returns early when `lastActiveDate === today`

[Classes]
No new classes. No class modifications.

[Dependencies]
Installed dev dependencies: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

[Testing]
Unit tests run via `npx vitest run tests/unit` — all 18 tests pass. E2E tests in `tests/e2e/dashboard-and-sessions.spec.ts` intercept Playwright route calls and verify UI integration without requiring real Firebase credentials.

[Implementation Order]
1. Install vitest + plugins via npm
2. Create `vitest.config.ts`
3. Create `tests/unit/streak.test.ts`
4. Create `tests/unit/achievements.test.ts`
5. Create `tests/e2e/dashboard-and-sessions.spec.ts`
6. Fix `lib/streak.ts` same-day early return
7. Update `package.json` scripts
8. Run `npx vitest run tests/unit` — 18/18 pass