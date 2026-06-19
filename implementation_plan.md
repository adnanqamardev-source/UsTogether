# Implementation Plan

[Overview]
Resolve six performance, scalability, and correctness issues in the UsTogether codebase through targeted, low-risk refactors across Firestore queries, React rendering, and AI caching logic.

The app is a Next.js couples-connection platform using Firebase Firestore for persistence and Google Gemini for AI-generated quizzes and challenges. As usage grows, the current implementation will degrade: unbounded queries will blow up Firebase egress costs, infinite chat lists will crash lower-end browsers, and the AI caching bug will make every couple see the same quiz for hours. This plan addresses each issue incrementally so changes can be shipped and tested independently.

[Types]
Minimal new types required; the work primarily adjusts existing component props and local state.

New types to add:
- QuizListItem — explicit interface for quiz objects stored in QuizList state (replaces any[]).
  Fields: id: string; title: string; description: string; questions: any[]; isPublic: boolean; creatorId: string; createdAt: number.
- SessionSummary — explicit interface for session documents in QuizList and MemoryBoard.
  Fields: id: string; coupleId: string; type: string; status: string; state: { quizId: string; currentQuestion: number; scores: Record<string, number>; answers: Record<string, any> }; createdAt: number; updatedAt: number; quizTitle: string.

[Files]
- components/MemoryBoard.tsx — Remove full quizzes collection fetch; rely on denormalized quizTitle stored on session docs.
- components/QuizList.tsx — Add .limit(20) to public quiz query, implement Load More pagination, denormalize quizTitle into session docs on creation.
- components/ChatPanel.tsx — Replace direct messages.map() with react-virtuoso Virtuoso for windowed rendering.
- components/Dashboard.tsx — Replace window.location.reload() with router.refresh() + local state update after pairing.
- components/CoupleDashboard.tsx — Replace window.location.reload() with state-driven cleanup after unpairing.
- app/api/generate-quiz/route.ts — Remove unstable_cache wrapper so each request reaches Gemini.
- app/api/generate-challenge/route.ts — Summarize history to last 5 quiz titles before passing to unstable_cache to bound key size.
- package.json — Add react-virtuoso dependency.

[Functions]
- fetchMemories (MemoryBoard.tsx) — Remove getDocs over entire quizzes collection; read quizTitle directly from session data.
- startQuiz (QuizList.tsx) — Add quizTitle field when creating a new session doc.
- useEffect quiz listener (QuizList.tsx) — Apply .limit(20), track displayed count, conditionally render Load More button.
- ChatPanel render block — Substitute Virtuoso for messages.map().
- handlePair (Dashboard.tsx) — Drop window.location.reload(); call router.refresh() and set local state to pair-complete.
- handleUnpair (CoupleDashboard.tsx) — Drop window.location.reload(); clear local state and let AuthProvider handle re-render.
- getCachedQuiz (generate-quiz/route.ts) — Inline the Gemini call; eliminate unstable_cache entirely.
- getCachedChallenge (generate-challenge/route.ts) — Summarize input to keep cache keys small.

[Classes]
No class-based components in this codebase; all changes target functional components and route handlers.

[Dependencies]
Add react-virtuoso (^4.12.3) for chat virtualization. No other dependency version changes.

[Testing]
- Add Playwright test for chat rendering with 1000+ messages.
- Verify two consecutive quiz requests return different content.
- Verify pairing completes without full page reload via network panel.
- Manual smoke test: create 100+ public quizzes, confirm QuizList loads 20 at a time.

[Implementation Order]
1. Denormalize quizTitle in QuizList startQuiz, then fix MemoryBoard to drop full-collection scan.
2. Add limit(20) + Load More to QuizList.
3. Replace hard reloads in Dashboard and CoupleDashboard with router.refresh() and state updates.
4. Remove unstable_cache from generate-quiz/route.ts.
5. Summarize history in generate-challenge/route.ts cache key.
6. Add react-virtuoso and virtualize ChatPanel.