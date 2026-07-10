# Implementation Plan

[Overview]
Audit and remediate the UsTogether couples-connect codebase to improve code quality, eliminate duplication, fix architectural inconsistencies, and ensure all documentation stays synchronized with the code.

The plan consolidates redundant auth listeners, removes duplicate chat components, fixes rate limiting, and updates technical documentation to reflect the current implementation state. These changes reduce runtime bugs, improve maintainability, and prepare the codebase for future feature development.

[Types]
No type system changes needed. The existing `global.d.ts` correctly defines all domain entities. Minor import path standardization is required to ensure consistent type resolution across files.

[Files]

New files to create:
- None

Existing files to modify:
- `components/AuthWrapper.tsx` — Remove duplicate `onAuthStateChanged` listener, rely solely on `AuthProvider` context, remove inline `getDoc/setDoc` user creation
- `components/AuthProvider.tsx` — Enhance `createUserProfile` call to include `displayName` from `u.displayName || u.email?.split('@')[0] || ''`, remove unused `handleFirestoreError` operationType parameter (optional)
- `components/ChatPanel.tsx` — DELETE this file (duplicate of ChatDrawer)
- `components/ChatDrawer.tsx` — Ensure this is the canonical chat component used everywhere
- `components/CoupleDashboard.tsx` — Verify spinner import `Loader` from `lucide-react` exists (currently imported in inline dynamic imports)
- `components/ChatFAB.tsx` — Verify connected to ChatDrawer, not ChatPanel
- `components/BottomNav.tsx` — Verify connected to ChatDrawer
- `lib/ratelimit.ts` — Upgrade from in-memory Map to a persistent store (Cloudflare KV or Redis recommended, fallback to file-based per IP/route counters for serverless environments)
- `firestore.rules` — Keep as-is (well-structured)
- `app/stats/page.tsx` — Implement actual stats page using existing userProfile streak and sessions data (or flag as deferred if out of scope)
- `.vscode/settings.json` — Add auto-import configuration if missing

Files to delete:
- `components/ChatPanel.tsx` — Duplicate chat implementation

[Functions]
Consolidate authentication initialization into `AuthProvider.createUserProfile` only. Remove the redundant user creation logic in `AuthWrapper.tsx` `useEffect`.

Add debounce utility function in `lib/utils.ts` if not already present for chat typing optimization.

[Classes]
No class-level changes. All code uses functional components with hooks.

[Dependencies]
No new packages to add or remove. Existing dependency on `motion` (successor to framer-motion) should be used consistently — replace any remaining `framer-motion` imports with `motion/react` in `ChatPanel.tsx` (before deleting it).

[Testing]
- Run existing Vitest tests: `npm run test:unit` — verify all pass
- Run Playwright E2E: `npm run test:e2e` — verify all pass (3 tests currently)
- Add at least 1 test for auth flow to cover the consolidated `AuthProvider` behavior
- Add test for rate limiter persistence behavior (mock serverless environment)

[Implementation Order]

1. Delete `components/ChatPanel.tsx` (confirm no other imports reference it)
2. Update `AuthWrapper.tsx` to remove duplicate auth logic and user creation
3. Update `AuthProvider.tsx` to handle user creation robustly with displayName fallback
4. Audit all files importing from `ChatPanel` — update to `ChatDrawer`
5. Standardize motion imports (search for `framer-motion`)
6. Upgrade `lib/ratelimit.ts` with persistent back-end
7. Implement or improve stats page at `app/stats/page.tsx`
8. Update `TECHNICAL_ARCHITECTURE.md` and `implementation_plan.md` with any entity changes
9. Update `Playbook.md` (Documentation Lifecycle) to reflect completed work
10. Run full test suite and fix any breakage