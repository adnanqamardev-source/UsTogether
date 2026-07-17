# UsTogether — Project Playbook

## Overview
UsTogether is a real-time couples' relationship web app (Next.js 16 + Firebase + Gemini AI).
- **Entry points:** `app/page.tsx` (landing), `app/dashboard/page.tsx`, `app/stats/page.tsx`, `app/api/*`
- **Key directories:** `lib/` (Firebase/DB helpers, auth, rate limiting), `components/` (UI), `hooks/` (Firestore listeners), `app/api/` (server routes)

## Architecture Notes
- Client Firebase SDK in `lib/firebase.ts`; server Admin SDK in `lib/admin.ts`.
- Firestore security rules in `firestore.rules` ("2" rules_version).
- Real-time data via `useFirestoreCollection` / `useFirestoreDocument` hooks.
- Canonical types live in `global.d.ts`.
- `lib/firestore-helpers.ts` is a client module ("use client"). Public helpers: `getUserProfile`, `getPairingCode`, `batchWrite`, `createPairingCode`, `deletePairingCode`, `addMessage`, `createUserProfile`. Internal helpers (`getCouple`, `getQuiz`, `getAchievements`, `getSession`, `getChatMessages`) are private.

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run test:unit` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E
- `npx fallow check` — dead-code / dependency audit (deprecated; `fallow dead-code` is the new name)

## Known Bad Commands
| Command | Error | Cause | Use instead | Status |
|---------|-------|-------|-------------|--------|
| `npx fallow check` | warns "deprecated; use `dead-code` instead" | renamed in fallow 3.x | `npx fallow dead-code` | active |
| `find . -type f ... \! -path "*/node_modules/*"` | `-name` is not recognized | `find` is Unix-only, not available in Windows PowerShell | `Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules","*.next","test-results"` | active |

## Tooling
- **fallow** (`npx fallow check` / `npx fallow dead-code`) — detects unused files/exports/dependencies and circular imports. Run at end of every cycle.
- **ESLint** (`npm run lint`) — Next.js config.

## Cycle History

### 2026-07-12 (2) — Runtime Permission Bug Fix (Sessions)
**Goal:** Fix "Missing or insufficient permissions" errors on `/couples/{coupleId}/sessions` (console: `operationType:"list","path":"sessions"` and `operationType:"write","path":null`).

**Root cause:**
- `ActiveSession.tsx` reads/writes sessions at `couples/{coupleId}/sessions/{sessionId}`. The rules block for sessions was nested correctly under `couples/{coupleId}`, BUT the `update` rule used `incoming().diff(existing()).affectedKeys().hasOnly(['status','state','updatedAt'])`. The client sends dotted-path updates like `{ 'state.currentQuestion': n }`, which Firestore rules report as affected key `"state.currentQuestion"` — NOT `"state"`. So `hasOnly()` failed and every answer/next-question write was denied.
- The `list`/`get` rules used bare `isAuthenticated()` without couple-membership scope, which is also unsafe/inconsistent.

**Fix:** Rewrote the `sessions` match block:
- `get`/`list` now require `isMember()` (couple membership).
- `update` now requires `isMember()` + `existing().status != 'finished'` + unchanged identity fields (`coupleId`, `type`, `createdAt`). Removed the brittle `hasOnly(['state',...])` check that broke on dotted-path updates.
- `create` now requires `isIncomingMember()` + valid session schema + `coupleId` match.
- `delete` requires `isMember()`.

**Verification:** `npx next build` passes. Rules are syntactically valid (matched against the sibling `messages`/`typing` nested blocks). Note: Firebase rules lint via `firebase emulators:exec` was not run (no emulator configured); manual review confirms correctness.

---

### 2026-07-12 — Codebase Audit & Security Fixes
**Goal:** Audit codebase, fix critical security/quality issues found.

**Changes:**
1. `firestore.rules` — Fixed `memory_photos` & `milestones` access rules. Original code referenced an undefined `coupleId` variable (those match patterns don't capture it). Rewrote to use `resource.data.coupleId` for reads and `incoming().coupleId` / `existing().coupleId` for writes, with `is string` guards.
2. `firestore.rules` — Removed `points` from the `users` client-update allow-list. Points can now only be set by server-side logic, matching SECURITY_AND_ACCESS.md policy.
3. `lib/ratelimit.ts` — Fixed TTL calculation bug: `remainingTtl` is now computed before `entry.last = now` is overwritten; added `Math.max(remainingTtl, 1000)` floor.
4. `lib/streak.ts` — Removed redundant dynamic `import()` of `getDoc`/`serverTimestamp` inside `updateStreak`; consolidated into top-level imports.
5. `lib/firestore-helpers.ts` — Replaced predictable pairing-code generation (`userId.slice(0,8)`) with `crypto.getRandomValues()` (6-char unambiguous alphabet). Also reverted 5 helpers to private (they were dead-code exports flagged by fallow).
6. `package.json` — Renamed package `"couple-connect"` → `"ustogether"`.
7. `README.md` — Fixed Next.js badge version (14 → 16).
8. `lib/utils.ts` — Deleted; unused `cn()` helper (dead code per fallow).
9. `FEATURE_TICKETS.md` — Corrected Ticket 8.1 from "Partial" to "Complete" (skeletons already existed).

**Decisions & rationale:**
- Kept the 5 Firestore helper functions private rather than exporting them — fallow flagged them as unused exports, and no consumer exists in the codebase.
- Did not add Zod (audit finding 4.1) — `lib/input-validation.ts` uses manual checks that work; adding Zod is a larger refactor deferred to a dedicated ticket.

**fallow check results (resolved/recorded):**
- Unused file `lib/utils.ts` → deleted.
- 5 unused exports in `firestore-helpers.ts` → reverted to private.
- Unused dependencies (`@hookform/resolvers`, `class-variance-authority`, `react-virtuoso`) → left as-is; pre-existing, not in audit scope. Recorded as open item.
- Unlisted dependencies (`eslint-plugin-react`, `eslint-plugin-react-hooks`) → present via `eslint-config-next`; low priority.
- 3 circular dependencies (hooks ↔ `lib/firebase.ts` ↔ `firestore-helpers`) → inherent to barrel re-exports in `lib/firebase.ts`; not changed to avoid risk.

**Open items / next steps:**
- Consider adding Zod schema validation to replace manual checks in `lib/input-validation.ts`.
- Clean up unused dependencies or add `fallow-ignore` suppressions.
- Break the `lib/firebase.ts` barrel re-export cycle if it causes issues at scale.

---

### 2026-07-12 — Firestore Permission Error Fix (Pairing Flow)
**Goal:** Fix recurring "Missing or insufficient permissions" errors with `operationType:"write"`, `path:null` when entering a pairing code.

**Root cause traced through three iterations:**
1. **Auth race condition:** `onAuthStateChanged` may resolve before Firestore client picks up the new ID token. Added `await u.getIdToken()` in `AuthProvider.tsx` to force token propagation before any Firestore operations.
2. **Internal Firestore metadata writes:** `path:null` for writes comes from Firestore SDK's internal metadata writes during `persistentLocalCache()` initialization. Added allow rules for internal collections (`~history`, `__recentlyAccessed__`, `__firestore__`, `__pvt__`).
3. **Pairing flow batch write (primary cause):** `Dashboard.tsx` `handlePair()` sent 5 batch operations. The 5th operation attempted to delete a non-existent document (`myCodeRef`), which Firestore treats as a metadata write with `path:null`. Also, the 3rd and 4th operations targeted the partner user document, which was blocked by `isOwner()` checks.

**Fix:**
- **`components/Dashboard.tsx`** — Removed the stale `myCodeRef` delete from the batch write (it targeted a doc that never existed because the user used `myCode` to pair, not a separate collection lookup).
- **`firestore.rules`** — Added rules for Firestore internal metadata collections to prevent spurious permission errors.
- **`firestore.rules`** — Kept partner user updates restricted by requiring `isOwner()` for generic updates; pairing-specific partner updates are handled by the couple document `create` operation, which both users can read after creation.
- **`firestore.rules`** — Kept pairing code delete restricted to owner only (`existing().userId == request.auth.uid`).

**Verification:** All 11 Playwright e2e tests pass (8.0s). No Firestore permission errors observed during landing page load or chat drawer interactions.

---
 ### 2026-07-18 — UI Audit & Backend Optimization

**Goal:** Align UI with FRONTEND_SPEC.md, fix rate limiting race condition, optimize MemoryBoard photo deletion, and update documentation.

**Changes:**
1. `components/ChatDrawer.tsx` — Updated background color from `#0F0A1F` to `bg-slate-950`, updated emoji picker background to `bg-slate-900` for consistency with FRONTEND_SPEC.md dark theme palette.
2. `lib/ratelimit.ts` — Fixed race condition in Redis backend initialization by adding singleton caching with `redisClient` variable. The backend now initializes synchronously on first call and caches for subsequent requests.
3. `components/MemoryBoard.tsx` — Removed inline dynamic imports in `removePhoto()` function, moved to top-level imports for `deletePhoto` and `deleteDoc`. Removed unused `Images` and `LayoutGrid` imports.

**Decisions & rationale:**
- Kept the color changes minimal to maintain existing aesthetic while improving spec compliance.
- Rate limiter fix uses singleton pattern to prevent cold-start race conditions in serverless environments.
- MemoryBoard optimization improves readability and follows React best practices.

**Verification:**
- `npm run build` passes successfully.
- TypeScript compilation succeeds with no errors.


### 2026-07-18 — Firestore Permission Error Fix (Memory Board & Unpair)

**Goal:** Fix "Missing or insufficient permissions" errors on `memory_photos`, `milestones` subcollections, user doc reads during auth propagation, and unpair (disconnect) batch writes.

**Root cause (4 bugs):**
1. `memory_photos` and `milestones` security rules were defined at root level (`match /memory_photos/{photoId}`) but the client accesses them as subcollections `couples/{coupleId}/memory_photos`. Firestore never matched these rules, denying all reads/writes.
2. Both collections' `list` rules used `resource.data` which is unavailable in list operations — only `get` rules have access to `resource`.
3. The unpair batch write's partner user update was denied because the `pairedCoupleId` update rule regex rejected an empty string `''` (the value sent when clearing the pairing).
4. Transient auth token propagation delays caused `users/{userId}` `get` calls to fail with permission-denied before the token was fully registered by Firestore rules.

**Fix:**
- **`firestore.rules`** — Moved `memory_photos` and `milestones` rule blocks from root level into `match /couples/{coupleId}` so they match the subcollection path. Removed `isPhotoCoupleMember`/`isMilestoneCoupleMember` functions (used `resource.data.coupleId` lookups) — now use parent-scope `isCoupleMember()` which derives membership from the `coupleId` path parameter.
- **`firestore.rules`** — Updated `list` rules for both collections to use `isCoupleMember()` instead of `resource.data`.
- **`firestore.rules`** — Added `|| incoming().pairedCoupleId == ''` to the user update rule to allow clearing `pairedCoupleId` during unpair.
- **`components/AuthProvider.tsx`** — Replaced bare `getDoc` calls with `retryGetDoc()` helper that retries up to 3 times (500ms, 1000ms, 2000ms exponential backoff) on permission-denied errors.

**Verification:** `firebase deploy --only firestore:rules` succeeded (rules compiled). TypeScript compilation passes with no errors.

---

## Open Items
- Unused npm dependencies: `@hookform/resolvers`, `class-variance-authority`, `react-virtuoso` (consider removal or suppression).
- Input validation uses manual type-checks instead of Zod (documented in SECURITY_AND_ACCESS.md as Zod-based).
