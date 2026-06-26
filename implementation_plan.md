# Implementation Plan

[Overview]
Refactor the UsTogether codebase to centralize Firebase/Firestore logic, enforce strict TypeScript typing across all document schemas, introduce atomic batched writes for multi-document operations, and fix unsafe `any` types — all while preserving existing UI behavior and animation fidelity.

This plan addresses six architectural pillars: (1) Firestore helper abstraction in `lib/firebase.ts` to eliminate raw `getDoc`/`setDoc` calls from UI components, (2) comprehensive TypeScript interfaces for all Firestore documents in `global.d.ts`, (3) batched write atomicity for pairing/unpairing flows and streak updates, (4) custom React hooks (`useFirestoreDocument`, `useFirestoreCollection`) that manage their own state and lifecycle for real-time listeners, (5) `firestore.rules` updates to match the new types and explicitly allow achievements access, and (6) query limits on chat collections to prevent unbounded read billing. Presentational components like `StreakCounter.tsx` and `AchievementsPanel.tsx` remain unchanged except for prop type upgrades from `any` to concrete interfaces.

[Types]
Define 8 new TypeScript interfaces in `global.d.ts` to eliminate all `any` usage for Firestore data and provide auto-complete across the entire codebase.

Full type specifications:
- **`interface UserProfile`**: Fields — `email: string`, `displayName?: string`, `points: number`, `pairedCoupleId?: string`, `streak?: number`, `createdAt: number`, `updatedAt: number`. Validation: `email` ≤ 256 chars, `displayName` ≤ 100 chars, `points` ≥ 0, `pairedCoupleId` matches `^[a-zA-Z0-9_\-]+$` pattern.
- **`interface Couple`**: Fields — `user1Id: string`, `user2Id: string`, `coupleName?: string`, `status: 'pending' | 'active'`, `totalScore: number`, `createdAt: number`, `updatedAt: number`. Both userIds ≤ 128 chars, `totalScore` ≥ 0.
- **`interface QuizQuestion`**: Fields — `q: string`, `type: 'text' | 'multiple'`, `options?: string[]`.
- **`interface Quiz`**: Fields — `creatorId: string`, `title: string`, `description: string`, `questions: QuizQuestion[]`, `isPublic: boolean`, `createdAt: number`. Questions array ≤ 50 items.
- **`interface ChatMessage`**: Fields — `id: string`, `senderId: string`, `text: string`, `timestamp: Date`.
- **`interface Session`**: Fields — `coupleId: string`, `type: 'quiz' | 'minigame'`, `status: 'waiting' | 'playing' | 'finished'`, `state: Record<string, any>`, `quizTitle?: string`, `createdAt: number`, `updatedAt: number`.
- **`interface Achievement`**: Fields — `id: string`, `title: string`, `description: string`, `unlockedAt?: number`.
- **`interface PairingCode`**: Fields — `userId: string`, `createdAt: number`.

[Files]
Create 3 new files, modify 8 existing files.

New files to be created:
- **`lib/firestore-helpers.ts`**: Centralized Firestore helper functions. Exports typed CRUD helpers (`getUserProfile`, `getCouple`, `getQuiz`, `getPairingCode`), a `batchWrite` utility wrapping Firestore Batched Writes, a `createPairingCode` helper, a `deletePairingCode` helper, an `addMessage` helper, and a `createUserProfile` helper. Each function is fully typed using the interfaces from `global.d.ts` and uses `handleFirestoreError` from `lib/firestore-errors.ts`.
- **`hooks/useFirestoreDocument.ts`**: Custom React hook that wraps `onSnapshot` for a single document. Exposes `{ data: T | null, loading: boolean, error: Error | null }`. Accepts document path segments and an optional error callback. Automatically manages `useEffect` cleanup via returned unsubscribe. Signature: `useFirestoreDocument<T>(...path: string[]): { data: T | null, loading: boolean, error: Error | null }`.
- **`hooks/useFirestoreCollection.ts`**: Custom React hook that wraps `onSnapshot` for a collection query. Accepts collection path segments, an optional query constraints array (`where`, `orderBy`, `limit`), and an optional document transformer. Exposes `{ data: T[], loading: boolean, error: Error | null }`. Enforces a default `limit(50)` on collection queries to prevent unbounded reads. Automatically manages `useEffect` cleanup. Signature: `useFirestoreCollection<T>(path: string[], constraints?: QueryConstraint[], transform?: (doc: DocumentData) => T): { data: T[], loading: boolean, error: Error | null }`.

Existing files to be modified:
- **`global.d.ts`** — Add all 8 interfaces above alongside existing CSS module declarations.
- **`lib/firebase.ts`** — Add shared helper imports and re-export the new helper functions and hooks so components import from a single `@/lib/firebase` entry.
- **`firestore.rules`** — Add explicit `allow` rules for the `achievements` collection path (currently `/achievements/{userId}/items/{itemId}` has rules but may be missing explicit `list` permission for the user's own achievements). Ensure all rules match the type constraints (e.g., `points >= 0`, `status in ['pending', 'active']`). Add a rule for `userProfile.streak` if it becomes writable. Also add an `achievements` root-level access rule if needed for reading the user's own achievement list.
- **`components/AuthProvider.tsx`** — Replace `dbUser: any | null` with `dbUser: UserProfile | null`. Remove the side-effect `setDoc` call for user creation from the `onSnapshot` callback, replacing with a dedicated `createUserProfile` call via the helper layer. Replace the manual `onSnapshot` listener with `useFirestoreDocument<UserProfile>('users', u.uid)` but only for the auth state observation after user creation — actually keep the `onSnapshot` here since AuthProvider needs the interplay of auth state + Firestore user. Simply type it properly and use `createUserProfile` helper.
- **`components/Dashboard.tsx`** — Replace all five raw `getDoc`/`setDoc`/`updateDoc` calls inside `handlePair` with a single `batchWrite` call from the helpers. Remove the `useEffect` side-effect that writes pairing codes directly (replace with `createPairingCode` helper call). Remove `any` casts on state variables. Add proper typing for `dbUser` usage from `AuthContextType`.
- **`components/CoupleDashboard.tsx`** — Replace the three `onSnapshot` effects with `useFirestoreDocument` and `useFirestoreCollection` hooks. Batch the `handleUnpair` sequence (4+ writes) into one `batchWrite`. Replace `any` types on state variables (`couple: Couple | null`, `userProfile: UserProfile | null`, `achievements: Achievement[]`). Move state management into the hooks.
- **`components/ActiveSession.tsx`** — Replace `session: any` with `session: Session | null`, `quiz: any` with `quiz: Quiz | null`. Replace the two `onSnapshot` effects with `useFirestoreDocument`. Replace raw `updateDoc` calls with helper function.
- **`components/ChatDrawer.tsx`** — Align the inline `Message` interface with `ChatMessage` from `global.d.ts`. Replace raw `onSnapshot` with `useFirestoreCollection` (with a query constraint `orderBy('timestamp', 'asc')` and the default `limit(50)`). Replace raw `addDoc` with `addMessage` helper. Remove the manual `isTyping` state management if possible — the typing indicator can stay as local UI state, but the message fetching uses the hook.

Files NOT modified (no changes needed):
- `components/StreakCounter.tsx` — Presentational, receives typed props already.
- `components/AchievementsPanel.tsx` — Presentational, receives typed props already.
- `components/QuizList.tsx`, `components/QuizCard.tsx`, `components/QuizCardSkeleton.tsx` — Out of scope unless they use `any` for Firestore data.
- `components/MemoryBoard.tsx` — Out of scope unless it uses raw Firestore.

[Functions]
Create 12 new functions, modify 5 existing functions.

New functions:
1. **`lib/firestore-helpers.ts::getUserProfile(userId: string): Promise<UserProfile | null>`** — Wraps `getDoc(doc(db, 'users', userId))` with error handling.
2. **`lib/firestore-helpers.ts::getCouple(coupleId: string): Promise<Couple | null>`** — Wraps `getDoc(doc(db, 'couples', coupleId))` with error handling.
3. **`lib/firestore-helpers.ts::getQuiz(quizId: string): Promise<Quiz | null>`** — Wraps `getDoc(doc(db, 'quizzes', quizId))` with error handling.
4. **`lib/firestore-helpers.ts::getPairingCode(code: string): Promise<PairingCode | null>`** — Wraps `getDoc(doc(db, 'pairingCodes', code))` with error handling.
5. **`lib/firestore-helpers.ts::batchWrite(writes: BatchWriteOperation[]): Promise<void>`** — Accepts array of `{ type: 'set' | 'update' | 'delete', ref: DocumentReference, data?: any }`, creates a `writeBatch`, commits it. This is the atomicity backbone. Uses `handleFirestoreError` on failure.
6. **`lib/firestore-helpers.ts::createPairingCode(userId: string): Promise<string>`** — Generates code from UID substring (first 8 chars, uppercase), writes via `setDoc` with merge, returns code string.
7. **`lib/firestore-helpers.ts::deletePairingCode(code: string): Promise<void>`** — Wraps `deleteDoc(doc(db, 'pairingCodes', code))`, catches silently (code may have been deleted by partner).
8. **`lib/firestore-helpers.ts::addMessage(coupleId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void>`** — Wraps `addDoc` with `serverTimestamp` for the `timestamp` field.
9. **`lib/firestore-helpers.ts::createUserProfile(userId: string, data: { email: string; displayName?: string }): Promise<void>`** — Wraps `setDoc(doc(db, 'users', userId), {...})` with default fields (points: 0, createdAt: Date.now(), etc.).
10. **`hooks/useFirestoreDocument.ts::useFirestoreDocument<T>(...path: string[])`** — Custom hook using `useState<T | null>`, `useState<boolean>`, `useState<Error | null>` and `useEffect` with `onSnapshot`. Returns `{ data, loading, error }`. Cleans up listener on unmount or path change.
11. **`hooks/useFirestoreCollection.ts::useFirestoreCollection<T>(path: string[], constraints?: QueryConstraint[], transform?: (doc: DocumentData) => T)`** — Custom hook using `useState<T[]>`, `useState<boolean>`, `useState<Error | null>` and `useEffect` with `onSnapshot`. Returns `{ data, loading, error }`. Enforces `limit(50)` by default unless the caller overrides with a different `limit`. Cleans up listener on unmount or path change.
12. **`hooks/useFirestoreCollection.ts::defaultTransform<T>(id: string, data: DocumentData): T & { id: string }`** — Internal helper that merges document ID into data. Used as default `transform` parameter.

Modified functions:
1. **`AuthProvider.tsx::AuthProvider`** — Replace the inline `setDoc` for user creation with `createUserProfile` helper call. Type `dbUser` state as `UserProfile | null` instead of `any | null`. Type the `onSnapshot` callback data.
2. **`AuthContext` interface** — Update `dbUser` type from `any | null` to `UserProfile | null`.
3. **`Dashboard.tsx::handlePair`** — Replace 5 sequential raw writes with single `batchWrite` call (sets couple doc, updates both user profiles, deletes both pairing codes). Remove error throw re-wrapping. Use `getPairingCode` helper for the read. Remove `pairingCodes` creation from `useEffect` and replace with `createPairingCode` helper call.
4. **`CoupleDashboard.tsx::handleUnpair`** — Replace 4-5 sequential writes with single `batchWrite` (updates both users, deletes couple doc, deletes both pairing codes). Remove the three `onSnapshot` effects and replace with `useFirestoreDocument`/`useFirestoreCollection`.
5. **`ActiveSession.tsx::handleAnswer`** and **`nextQuestion`** / **`endSessionEarly`** — Replace raw `updateDoc` with a typed update helper. Replace two `onSnapshot` effects with `useFirestoreDocument`.

[Classes]
No class modifications required — the codebase uses functional components exclusively.

[Testing]
Existing Playwright e2e tests should pass without modification since this is a refactor that preserves all external behavior and Firestore data shapes.

Test files in `tests/e2e/` cover pairing flow, dashboard rendering, unpair flow, and chat drawer interaction. Run `npx playwright test` to validate. The atomic batch writes may resolve race conditions that the tests previously tolerated — this is an improvement, not a regression. If tests fail, inspect for timing-related selector issues rather than logic issues.

[Dependencies]
No package.json changes required for the core refactor. For runtime Zod validation of Gemini AI quiz data (enhancement #4), add `zod` as a dependency via `npm install zod` — but this is a follow-up enhancement, not required for this implementation phase. The current plan only covers internal Firestore data typing; Zod validation for external API responses should be tracked separately.

[Implementation Order]
Implement changes in the revised order with security rules and hooks prioritized early.

1. **Update `global.d.ts`** — Add all 8 interfaces (`UserProfile`, `Couple`, `Quiz`, `QuizQuestion`, `ChatMessage`, `Session`, `Achievement`, `PairingCode`).
2. **Update `firestore.rules`** — Ensure the `achievements` collection has explicit `allow read: if request.auth.uid == userId` at the document level and `allow list: if request.auth.uid == userId` at the collection level. Verify all schema constraints in rules match the new interfaces (especially `status` enum, `points >= 0`). Add `streak` field to `isValidUser` if not present.
3. **Create `lib/firestore-helpers.ts`** — All 10 helper functions with full TypeScript typing and error handling.
4. **Create `hooks/useFirestoreDocument.ts`** — Generic typed document listener hook.
5. **Create `hooks/useFirestoreCollection.ts`** — Generic typed collection listener hook with default `limit(50)`.
6. **Update `lib/firebase.ts`** — Re-export helpers and hooks so `@/lib/firebase` remains the single import.
7. **Refactor `AuthProvider.tsx`** — Replace `any` with `UserProfile`, use `createUserProfile` helper.
8. **Refactor `Dashboard.tsx`** — Batch `handlePair` writes, use typed helpers and `createPairingCode`, remove raw Firestore calls.
9. **Refactor `CoupleDashboard.tsx`** — Replace `onSnapshot` effects with hooks, batch `handleUnpair` writes, replace `any` types with concrete interfaces.
10. **Refactor `ActiveSession.tsx`** — Replace `any` types with `Session`/`Quiz`, replace `onSnapshot` with hooks, replace raw `updateDoc` with helpers.
11. **Refactor `ChatDrawer.tsx`** — Align inline `Message` with global `ChatMessage`, replace `onSnapshot` with `useFirestoreCollection` (with `orderBy('timestamp', 'asc')` and `limit(50)`), replace raw `addDoc` with `addMessage` helper.
12. **Run tests** — `npx playwright test` to verify no regressions.

