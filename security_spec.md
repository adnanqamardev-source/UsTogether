# Security Specification for CoupleConnect

## 1. Data Invariants
1. Users can only edit their own user document fields like displayName.
2. Only the users in a pair (`user1Id` or `user2Id`) can read/write to their `couples/{coupleId}` document and subcollections.
3. Chat messages can only be sent to a `couples/{coupleId}` sub-collection if the sender is currently a member of that couple.
4. Quizzes created by users can be public or private. Private quizzes are only visible to the creator.
5. Sessions can only be created and updated by members of the `coupleId` referenced in the session.
6. The `points` field in user documents and `totalScore` in couples can only be updated, not set arbitrarily to huge numbers. (Need atomicity constraints if possible, or strict limits, but for this simpler version, user can only increment). Wait, we might use a trusted edge function for scores if needed, or allow limited updates. For MVP, we can allow limited increment if validation passes, or assume clients update it. The instructions say "Tier 1 vs Tier 2" logic.

## 2. Dirty Dozen Payloads
We will test for:
1. `shadowField`: Injecting an undeclared field (e.g., `isAdmin: true`)
2. `idPoisoning`: Injecting a massive string as an ID
3. `spoofedIdentity`: Creating a message where `senderId` belongs to someone else
4. `relationalBypass`: Creating a session for a `coupleId` where the user is NOT a member
5. `typePoisoning`: Sending a `createdAt` timestamp as a string instead of number
6. `sizeExplosion`: Sending a massive array of questions in a Quiz.
7. `updateGap`: Trying to skip the `status: 'waiting'` state directly to `status: 'finished'` without intermediate updates, or changing `createdAt` during update.
8. `piiLeak`: Getting another user's private data via list.
9. `unauthenticatedWrite`: Writing without auth
10. `terminalLockBypass`: Updating a session after its `status` is `'finished'`
11. `listDelegation`: Querying couples without filtering by membership.
12. `unauthorizedRead`: Reading a private quiz created by another user.

## 3. The Test Runner
A test suite `firestore.rules.test.ts` covering these invariants.
