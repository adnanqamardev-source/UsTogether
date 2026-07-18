# Refactor Plan — UsTogether File Restructuring

## Overview

Reorganize the UsTogether codebase from a flat `components/` and `lib/` layout into a feature-directory architecture that groups files by domain (auth, couple, chat, quiz, achievements, photos), improving discoverability, enforcing separation of concerns, and scaling maintainability as the project grows.

The current structure mixes all feature components in a single flat directory and places both generic utilities and Firebase integrations together in `lib/`. The proposed structure introduces domain-based folders under `components/features/` and `components/shared/`, while splitting `lib/` into `lib/firebase/`, `lib/server/`, and `lib/shared/`. A compatibility layer preserves existing import paths so the app continues to work during migration.

## Types

No new types are required. Existing `global.d.ts` definitions (`UserProfile`, `Couple`, `Session`, `Achievement`, `MemoryPhoto`, `Milestone`, `QuizQuestion`, `Quiz`, `ChatMessage`, `PairingCode`, `PhotoUploadProgress`, `AchievementDefinition`, `StaticQuizQuestion`) remain the canonical source and will be re-exported from a shared barrel so that imports switch from `@/global.d` to `@/types`.

Re-export barrel `types/index.ts`:
```ts
export * from '@/global.d';
```

This lets any file do:
```ts
import type { UserProfile, Couple } from '@/types';
```
without changing type availability.

## Files

### New files to be created

Shared infrastructure and compatibility re-exports:
- `components/shared/ErrorBoundary.tsx` — move from `components/ErrorBoundary.tsx`
- `components/shared/Skeletons.tsx` — move from `components/Skeletons.tsx`
- `components/shared/BottomNav.tsx` — move from `components/BottomNav.tsx`
- `components/shared/ChatFAB.tsx` — move from `components/ChatFAB.tsx`
- `components/shared/LandingSections.tsx` — move from `components/LandingSections.tsx`
- `components/providers/AuthProvider.tsx` — moved from `components/AuthProvider.tsx`
- `components/providers/index.ts` — re-export `AuthProvider` and `useAuth`
- `components/auth/AuthWrapper.tsx` — move from `components/AuthWrapper.tsx`
- `components/features/quiz/QuizList.tsx` — move from `components/QuizList.tsx`
- `components/features/quiz/QuizCard.tsx` — move from `components/QuizCard.tsx`
- `components/features/quiz/QuizCardSkeleton.tsx` — move from `components/QuizCardSkeleton.tsx`
- `components/features/session/ActiveSession.tsx` — move from `components/ActiveSession.tsx`
- `components/features/chat/ChatDrawer.tsx` — move from `components/ChatDrawer.tsx`
- `components/features/couple/CoupleDashboard.tsx` — move from `components/CoupleDashboard.tsx`
- `components/features/couple/Dashboard.tsx` — move from `components/Dashboard.tsx`
- `components/features/couple/StreakCounter.tsx` — move from `components/StreakCounter.tsx`
- `components/features/achievements/AchievementsPanel.tsx` — move from `components/AchievementsPanel.tsx`
- `components/features/memories/MemoryBoard.tsx` — move from `components/MemoryBoard.tsx`
- `lib/firebase/index.ts` — re-export client `db`, `auth`, `storage`, hooks
- `lib/firebase/client.ts` — current `lib/firebase.ts`
- `lib/server/admin.ts` — move from `lib/admin.ts`
- `lib/server/api-auth.ts` — move from `lib/api-auth.ts`
- `lib/server/ratelimit.ts` — move from `lib/ratelimit.ts`
- `lib/shared/firestore-helpers.ts` — move from `lib/firestore-helpers.ts`
- `lib/shared/streak.ts` — move from `lib/streak.ts`
- `lib/shared/achievements.ts` — move from `lib/achievements.ts`
- `lib/shared/quiz-data.ts` — move from `lib/quiz-data.ts`
- `lib/shared/storage.ts` — move from `lib/storage.ts`
- `lib/shared/input-validation.ts` — move from `lib/input-validation.ts`
- `lib/shared/firestore-errors.ts` — move from `lib/firestore-errors.ts`

Backward-compatible entrypoint files (thin re-exports so no caller breaks):
- `components/AuthProvider.tsx` → `export { default } from '@/components/providers/AuthProvider'; export { useAuth } from '@/components/providers';`
- `components/AuthWrapper.tsx` → `export { default } from '@/components/auth/AuthWrapper';`
- `components/ErrorBoundary.tsx` → `export { default } from '@/components/shared/ErrorBoundary';`
- `components/Skeletons.tsx` → `export * from '@/components/shared/Skeletons';`
- `components/BottomNav.tsx` → `export { default } from '@/components/shared/BottomNav';`
- `components/ChatFAB.tsx` → `export { default } from '@/components/shared/ChatFAB';`
- `components/LandingSections.tsx` → `export { default } from '@/components/shared/LandingSections';`
- `components/CoupleDashboard.tsx` → `export { default } from '@/components/features/couple/CoupleDashboard';`
- `components/Dashboard.tsx` → `export { default } from '@/components/features/couple/Dashboard';`
- `components/StreakCounter.tsx` → `export { default } from '@/components/features/couple/StreakCounter';`
- `components/AchievementsPanel.tsx` → `export { default } from '@/components/features/achievements/AchievementsPanel';`
- `components/MemoryBoard.tsx` → `export { default } from '@/components/features/memories/MemoryBoard';`
- `components/ActiveSession.tsx` → `export { default } from '@/components/features/session/ActiveSession';`
- `components/ChatDrawer.tsx` → `export { default } from '@/components/features/chat/ChatDrawer';`
- `components/QuizList.tsx` → `export { default } from '@/components/features/quiz/QuizList';`
- `components/QuizCard.tsx` → `export { default } from '@/components/features/quiz/QuizCard';`
- `components/QuizCardSkeleton.tsx` → `export { default } from '@/components/features/quiz/QuizCardSkeleton';`
- `lib/firebase.ts` → `export * from '@/lib/firebase';`
- `lib/admin.ts` → `export * from '@/lib/server/admin';`
- `lib/api-auth.ts` → `export * from '@/lib/server/api-auth';`
- `lib/ratelimit.ts` → `export * from '@/lib/server/ratelimit';`
- `lib/firestore-helpers.ts` → `export * from '@/lib/shared/firestore-helpers';`
- `lib/streak.ts` → `export * from '@/lib/shared/streak';`
- `lib/achievements.ts` → `export * from '@/lib/shared/achievements';`
- `lib/quiz-data.ts` → `export * from '@/lib/shared/quiz-data';`
- `lib/storage.ts` → `export * from '@/lib/shared/storage';`
- `lib/input-validation.ts` → `export * from '@/lib/shared/input-validation';`
- `lib/firestore-errors.ts` → `export * from '@/lib/shared/firestore-errors';`

### Existing files to be modified

- `app/layout.tsx` — update `import Providers` to `@/app/providers` (already local, no change needed)
- `app/page.tsx` — update direct UI imports to the shared path if any (currently uses only `AuthWrapper` via old path, so no break)
- `app/dashboard/page.tsx` — update `import Dashboard` and `AuthWrapper` to new paths if desired (optional because re-exports preserve behavior)
- `app/stats/page.tsx` — update imports to prefer `@/lib/firebase` and `@/components/providers`
- `components/AuthProvider.tsx` — becomes a re-export barrel file
- `components/AuthWrapper.tsx` — becomes a re-export barrel file
- `components/CoupleDashboard.tsx` — becomes a re-export barrel file
- `components/Dashboard.tsx` — becomes a re-export barrel file
- `components/StreakCounter.tsx` — becomes a re-export barrel file
- `components/AchievementsPanel.tsx` — becomes a re-export barrel file
- `components/MemoryBoard.tsx` — becomes a re-export barrel file
- `components/ActiveSession.tsx` — becomes a re-export barrel file
- `components/ChatDrawer.tsx` — becomes a re-export barrel file
- `components/QuizList.tsx` — becomes a re-export barrel file
- `components/QuizCard.tsx` — becomes a re-export barrel file
- `components/QuizCardSkeleton.tsx` — becomes a re-export barrel file
- `components/ErrorBoundary.tsx` — becomes a re-export barrel file
- `components/Skeletons.tsx` — becomes a re-export barrel file
- `components/BottomNav.tsx` — becomes a re-export barrel file
- `components/ChatFAB.tsx` — becomes a re-export barrel file
- `components/LandingSections.tsx` — becomes a re-export barrel file
- `lib/firebase.ts` — becomes a re-export barrel file
- `lib/admin.ts` — becomes a re-export barrel file
- `lib/api-auth.ts` — becomes a re-export barrel file
- `lib/ratelimit.ts` — becomes a re-export barrel file
- `lib/firestore-helpers.ts` — becomes a re-export barrel file
- `lib/streak.ts` — becomes a re-export barrel file
- `lib/achievements.ts` — becomes a re-export barrel file
- `lib/quiz-data.ts` — becomes a re-export barrel file
- `lib/storage.ts` — becomes a re-export barrel file
- `lib/input-validation.ts` — becomes a re-export barrel file
- `lib/firestore-errors.ts` — becomes a re-export barrel file

Files to be deleted after re-export shims are created:
- None. Old paths stay valid via re-export barrels; old files become shims.

Configuration updates:
- `tsconfig.json` — no path changes required because all new paths resolve via same `@/` alias.

## Functions

No function logic changes. Every function is moved to its new location exactly as implemented. The only modifications are re-export wrappers in the original files.

## Classes

No class modifications. This task is purely file organization; no classes are created, modified, or removed.

## Dependencies

No package additions, removals, or upgrades.

## Testing

Validation strategy:
- Run `npm run typecheck` after moving files to ensure every import resolves.
- Run `npm run build` to confirm the Next.js app compiles.
- Run `npm run test` or targeted vitest suite to confirm no unchanged tests break.
- Run Playwright smoke tests for landing, dashboard, stats, and memory board pages via `npx playwright test`.
- Verify no runtime import failures in the browser console (`localhost:3000`).

## Implementation Order

Implement changes in this sequence to avoid regressions and enable incremental verification:

1. Create target directories `components/shared`, `components/providers`, `components/auth`, `components/features/{quiz,session,chat,couple,achievements,memories}`, `lib/firebase`, `lib/server`, `lib/shared`, `types`.
2. Move implementation files into new directories using `mv`, preserving contents.
3. Add `types/index.ts` re-export barrel from `global.d.ts`.
4. Update internal imports within moved files so they reference the new `@/components/...`, `@/lib/...`, and `@/types/...` paths.
5. Create re-export shim files in old locations to preserve compatibility.
6. Run typecheck, build, and test suites; fix any unresolved imports.
7. Update documentation references if needed.