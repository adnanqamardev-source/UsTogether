# Implementation Plan

Fix Firestore security rules and client-side error handling to resolve "Missing or insufficient permissions" errors occurring when accessing `memory_photos`, `milestones` subcollections, user profile reads during auth propagation, and unpair (disconnect) batch writes.

The errors stem from four distinct defects: (1) `memory_photos` and (2) `milestones` security rules are defined at the root collection level (`match /memory_photos/{photoId}`) but the client accesses them as subcollections of `couples/{coupleId}` — Firestore never matches these rules, so every read/write is denied. (3) The `list` rules for both collections use `resource.data` which is unavailable in list operations. (4) The unpair batch write fails because the user update rule's regex for `pairedCoupleId` rejects an empty string. Additionally, transient auth token propagation failures cause noisy user-doc `get` errors that should be handled gracefully with a retry.

[Types]
No new types; existing type definitions in `global.d.ts` are sufficient.

The `Milestone` and `MemoryPhoto` interfaces are already correct and match both client usage and the new rule structures.

[Files]

**Modified files (2 total):**

1. **`firestore.rules`** — Move `memory_photos` and `milestones` rule blocks from root level to nested under `match /couples/{coupleId}`. Remove `resource.data` checks from `list` rules (use parent-scope `isCoupleMember()` instead). Allow empty string for `pairedCoupleId` in user update rule to support unpairing.

2. **`components/AuthProvider.tsx`** — Add a retry loop (with exponential backoff) around the initial `getDoc` call for the user profile, so that transient auth token propagation delays do not produce console errors or race-condition failures.

[Functions]

**firestore.rules changes:**
- Move the entire `match /memory_photos/{photoId}` block (lines 250-274) to be nested under `match /couples/{coupleId}` (after the `sessions` block, line 202).
- Move the entire `match /milestones/{milestoneId}` block (lines 290-312) to be nested under `match /couples/{coupleId}` (after the memory_photos block).
- Remove `isPhotoCoupleMember` function — no longer needed; use parent-scope `isCoupleMember()`.
- Remove `isMilestoneCoupleMember` function — no longer needed; use parent-scope `isCoupleMember()`.
- In the `users/{userId}` update rule (line 63), change the `pairedCoupleId` regex guard to also accept empty string: `incoming().pairedCoupleId.matches('^(.*_)?' + request.auth.uid + '(_.*)?$') || incoming().pairedCoupleId == ''`

**AuthProvider.tsx changes:**
- `onAuthStateChanged` callback (lines 32-68): Replace the bare `getDoc(userRef)` call with a `retryGetDoc(ref, maxAttempts, delay)` helper that retries up to 3 times with 500ms exponential backoff when Firestore returns a "permission-denied" error.

[Classes]
No class modifications.

[Dependencies]
No dependency changes.

[Testing]

**Validation strategy:**
- Manually verify `memory_photos` and `milestones` subcollection reads/writes succeed after rule deployment by loading the Memory Board.
- Manually verify unpair flow completes without permission errors.
- Manually verify the `users/{userId}` get race condition is resolved (no console errors on login).
- Existing unit tests for Firestore helpers should continue to pass.
- Run `firebase emulators:start` and test the rule changes against the emulator if available.

[Implementation Order]

Implement changes in this sequence to minimize risk and enable testing after each step:

1. Edit `firestore.rules` to move `memory_photos` and `milestones` blocks under `match /couples/{coupleId}`, remove `resource.data` from list rules, and update `pairedCoupleId` regex.
2. Edit `components/AuthProvider.tsx` to add retry logic for `getDoc` in the auth handler.
3. Deploy updated Firestore rules with `firebase deploy --only firestore:rules`.
4. Test all three affected flows (memory board list/read/write, unpair, initial login) manually.