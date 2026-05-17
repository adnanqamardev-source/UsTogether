# Goals

- Fix bug where "Entering Partner Login Code With User a Then User B Should connect By Itself" fails due to Missing or Insufficient Permissions. (Done)
- Create CoupleSession sub-collection instead of root collections that lack proper Firestore security rules.
- Fix UI so that both users seamlessly enter the CoupleDashboard instead of crashing or being blocked.
- Ensure chat and quizzes function as intended within `couples/{coupleId}/*` collections.

## Completed
- Updated `QuizList.tsx` and `ActiveSession.tsx` to reference `couples/${coupleId}/sessions` (subcollection) instead of the top-level `sessions` collection, aligning with `firestore.rules` paths and properly enforcing security.
- Removed unused arguments from `firestore-errors` handler.
- Fixed a bug where `User B`'s update triggered `Missing or insufficient permissions` due to missing top-level security rules.
