# Implementation Plan — UsTogether Feature Scope & Capability Audit

**Version:** 1.0  
**Date:** 2026-07-04  
**Status:** Active

---

[Overview]

Document the complete feature scope, current implementation status, and backend capabilities of the UsTogether relationship platform to guide future development priorities.

This document serves as a comprehensive audit of the UsTogether codebase, mapping every implemented feature against the PRD requirements and identifying gaps, technical debt, and infrastructure readiness. The goal is to provide a single source of truth for what exists, what's missing, and what the backend can support. The audit covers 10 major feature areas across 30+ source files, 7 Firestore collections, 2 API routes, and a full authentication/authorization pipeline. The findings reveal that the MVP is largely complete with authentication, pairing, real-time chat, AI quizzes, streak tracking, achievements, and a memory board all implemented. Key gaps include photo uploads, push notifications, leaderboards, and i18n support. Technical debt exists in quiz state synchronization, API auth implementation, and performance optimization opportunities.

---

[Types]

No new types are required for this audit document; however, the following existing type definitions from `global.d.ts` define the data structures used across all features:

- **UserProfile**: email, displayName?, points, pairedCoupleId?, streak?, lastActiveDate?, createdAt, updatedAt
- **Couple**: user1Id, user2Id, coupleName?, status ('pending' | 'active'), totalScore, createdAt, updatedAt
- **QuizQuestion**: q, type ('text' | 'multiple'), options?
- **StaticQuizQuestion**: id, category, question, type ('mcq'), options, text_fallback_allowed
- **Quiz**: creatorId, title, description, questions (QuizQuestion[]), isPublic, createdAt
- **ChatMessage**: id, senderId, text, timestamp (Date)
- **Session**: coupleId, type ('quiz' | 'minigame'), status ('waiting' | 'playing' | 'finished'), state (Record<string, any>), quizTitle?, createdAt, updatedAt
- **Achievement**: id, title, description, unlockedAt?
- **AchievementDefinition**: id, title, description, icon (emoji), category ('participation' | 'streak' | 'milestone' | 'social')
- **PairingCode**: userId, createdAt
- **BatchWriteOperation**: type ('set' | 'update' | 'delete'), ref (DocumentReference), data? (Record<string, any>)
- **RateLimitEntry**: count, last

---

[Files]

The following files constitute the complete codebase, organized by layer:

**Frontend Components (13 files):**
- `components/AuthProvider.tsx` — Firebase auth context provider with real-time user profile sync
- `components/AuthWrapper.tsx` — Auth guard with dynamic Dashboard import, sign-in/sign-out UI
- `components/CoupleDashboard.tsx` — Main dashboard shell with navigation, widgets, mobile menu
- `components/Dashboard.tsx` — Pre-pairing dashboard with pairing code display and partner code input
- `components/ChatDrawer.tsx` — Real-time chat panel with typing indicators, message bubbles
- `components/ChatPanel.tsx` — Alternative chat panel with Virtuoso virtualized list, print/PDF support
- `components/ActiveSession.tsx` — Real-time multiplayer quiz session with answer sync
- `components/QuizList.tsx` — Quiz listing with AI generation trigger, live session display
- `components/QuizCard.tsx` — Individual quiz card with hover effects, delete, start actions
- `components/QuizCardSkeleton.tsx` — Loading skeleton for quiz cards
- `components/StreakCounter.tsx` — Animated streak display with progress bar
- `components/AchievementsPanel.tsx` — Achievement grid with expand/collapse
- `components/MemoryBoard.tsx` — Quiz history display with AI challenge generation
- `components/LandingSections.tsx` — Landing page content sections
- `components/ErrorBoundary.tsx` — React error boundary wrapper
- `components/Skeletons.tsx` — Shared skeleton components

**App Router Pages (4 files):**
- `app/page.tsx` — Root page (Server Component) with AuthWrapper
- `app/layout.tsx` — Root layout with dark theme, Providers wrapper
- `app/providers.tsx` — Client-side providers (AuthProvider)
- `app/stats/page.tsx` — Stats dashboard with metrics, activity heatmap, achievements

**API Routes (2 files):**
- `app/api/generate-quiz/route.ts` — POST endpoint for Gemini-powered quiz generation with rate limiting
- `app/api/generate-challenge/route.ts` — POST/GET endpoints for AI couple challenge with caching

**Library Modules (9 files):**
- `lib/firebase.ts` — Firebase client initialization with env var fallback
- `lib/firestore-helpers.ts` — CRUD utilities, batch writes, pairing code management
- `lib/firestore-errors.ts` — Typed Firestore error handling
- `lib/api-auth.ts` — Firebase ID token verification via Google Identity Toolkit REST API
- `lib/input-validation.ts` — Zod validation schemas for API request bodies
- `lib/ratelimit.ts` — In-memory rate limiter with configurable windows
- `lib/streak.ts` — Streak calculation and update logic
- `lib/achievements.ts` — Achievement definitions, eligibility checks, awarding
- `lib/quiz-data.ts` — Static quiz question bank and fallback generation
- `lib/utils.ts` — General utility functions

**Hooks (3 files):**
- `hooks/useFirestoreDocument.ts` — Generic real-time document listener
- `hooks/useFirestoreCollection.ts` — Generic real-time collection listener with query constraints
- `hooks/use-mobile.ts` — Mobile viewport detection

**Data (2 files):**
- `data/quiz-questions.json` — Static quiz question bank
- `data/quiz-questions-sample.json` — Sample quiz questions subset

**Configuration (8 files):**
- `package.json` — Dependencies and scripts
- `tsconfig.json` — TypeScript configuration
- `next.config.js` — Next.js configuration
- `tailwind.config.ts` — Tailwind CSS configuration
- `postcss.config.mjs` — PostCSS configuration
- `vitest.config.ts` — Vitest unit test configuration
- `playwright.config.ts` — Playwright E2E test configuration
- `firestore.rules` — Firestore security rules
- `firebase.json` — Firebase project configuration
- `.eslintrc.json` / `eslint.config.js` — ESLint configuration
- `global.d.ts` — Global type definitions

**Tests (3+ files):**
- `tests/unit/streak.test.ts` — Streak calculation unit tests
- `tests/unit/achievements.test.ts` — Achievement logic unit tests
- `tests/e2e/dashboard-and-sessions.spec.ts` — E2E dashboard and session tests

---

[Functions]

**API Route Handlers:**
- `POST /api/generate-quiz` — `app/api/generate-quiz/route.ts` — Generates AI quiz via Gemini 2.5 Flash with structured JSON output, rate limiting, and fallback
- `POST /api/generate-challenge` — `app/api/generate-challenge/route.ts` — Generates AI couple challenge with 24h caching
- `GET /api/generate-challenge` — `app/api/generate-challenge/route.ts` — Streaming challenge generation via Vercel AI SDK

**Auth Functions:**
- `getUserId(req: NextRequest): Promise<string | null>` — `lib/api-auth.ts` — Verifies Firebase ID token via Google Identity Toolkit REST API
- `signIn()` — `components/AuthProvider.tsx` — Triggers Google OAuth popup
- `logOut()` — `components/AuthProvider.tsx` — Signs out via Firebase Auth
- `useAuth()` — `components/AuthProvider.tsx` — Custom hook returning { user, loading, signIn, logOut, dbUser }

**Firestore Helper Functions (lib/firestore-helpers.ts):**
- `getUserProfile(userId): Promise<UserProfile | null>` — Fetches single user document
- `getCouple(coupleId): Promise<Couple | null>` — Fetches couple document
- `getQuiz(quizId): Promise<Quiz | null>` — Fetches quiz document
- `getPairingCode(code): Promise<PairingCode | null>` — Fetches pairing code
- `getAchievements(userId): Promise<Achievement[]>` — Fetches all achievements for user
- `getSession(sessionId): Promise<Session | null>` — Fetches session document
- `getChatMessages(coupleId, options?): Promise<ChatMessage[]>` — Fetches chat messages
- `batchWrite(writes: BatchWriteOperation[]): Promise<void>` — Atomic batch writes (max 500)
- `createPairingCode(userId): Promise<string>` — Creates 8-char pairing code
- `deletePairingCode(code): Promise<void>` — Deletes pairing code (best-effort)
- `addMessage(coupleId, message): Promise<string>` — Adds chat message
- `createUserProfile(userId, data): Promise<void>` — Creates user document on first login

**Streak Functions (lib/streak.ts):**
- `updateStreak(userId): Promise<{ streak: number; unlocked: string[] }>` — Calculates and updates streak based on lastActiveDate comparison

**Achievement Functions (lib/achievements.ts):**
- `getEligibleAchievements(userId, ctx): Promise<AchievementDefinition[]>` — Checks which achievements user qualifies for
- `awardAchievement(userId, def): Promise<void>` — Writes achievement document
- `checkAndAwardAchievements(userId, ctx): Promise<string[]>` — Combined check-and-award flow

**Rate Limiting (lib/ratelimit.ts):**
- `checkRateLimit(key, max, windowMs): boolean` — In-memory rate limit check

**Custom Hooks:**
- `useFirestoreDocument<T>(pathSegments): { data, loading, error }` — Real-time document listener
- `useFirestoreCollection<T>(pathSegments, constraints, mapper): { data, loading, error }` — Real-time collection listener
- `use-mobile()` — Mobile viewport detection

**Component Functions (key exports):**
- `AuthProvider({ children })` — Auth context provider
- `AuthWrapper({ children })` — Auth guard with dynamic Dashboard
- `CoupleDashboard({ coupleId })` — Main dashboard
- `Dashboard()` — Pre-pairing dashboard
- `ChatDrawer({ coupleId, onClose })` — Chat panel
- `ChatPanel({ messages, user, onClose, onSendMessage })` — Alternative chat
- `ActiveSession({ coupleId, sessionId, couple })` — Quiz session
- `QuizList({ coupleId })` — Quiz listing
- `QuizCard({ quiz, onStart, onDelete, userId })` — Quiz card
- `StreakCounter({ streak, label })` — Streak display
- `AchievementsPanel({ achievements })` — Achievement grid
- `MemoryBoard({ coupleId })` — Memory board
- `StatsPage()` — Stats dashboard
- `ErrorBoundary({ children })` — Error boundary

---

[Classes]

No classes are used in this codebase. The project follows a functional React pattern with hooks, custom hooks, and utility functions. All components are functional components with TypeScript interfaces for props.

---

[Dependencies]

**Current dependencies (from package.json):**

Production:
- `@ai-sdk/google` ^3.0.83 — Google AI provider for Vercel AI SDK
- `@google/genai` ^2.3.0 — Google GenAI SDK for Gemini API
- `@hookform/resolvers` ^5.2.1 — Form validation resolvers
- `ai` ^6.0.208 — Vercel AI SDK for streaming
- `class-variance-authority` ^0.7.1 — Component variant management
- `clsx` ^2.1.1 — Class name utility
- `firebase` ^11.0.0 — Firebase SDK (Auth, Firestore, Storage)
- `lucide-react` ^0.553.0 — Icon library
- `motion` ^12.23.24 — Animation library (Framer Motion successor)
- `next` ^16.2.6 — React framework
- `react` ^18.2.0 — UI library
- `react-dom` ^18.2.0 — React DOM
- `react-markdown` ^10.1.0 — Markdown rendering
- `react-virtuoso` ^4.18.7 — Virtualized list
- `tailwind-merge` ^3.3.1 — Tailwind class merging

Dev:
- `@firebase/eslint-plugin-security-rules` — Firestore rules linting
- `@playwright/test` ^1.61.0 — E2E testing
- `@tailwindcss/postcss` 4.1.11 — Tailwind PostCSS plugin
- `@testing-library/jest-dom` ^6.9.1 — DOM testing matchers
- `@testing-library/react` ^16.3.2 — React testing utilities
- `@types/node` ^25.9.4 — Node.js types
- `@types/react` ^18.2.0 — React types
- `@types/react-dom` ^18.2.0 — React DOM types
- `@vitejs/plugin-react` ^6.0.3 — Vite React plugin
- `eslint` 9.39.1 — Linter
- `eslint-config-next` 16.0.8 — Next.js ESLint config
- `jsdom` ^29.1.1 — DOM environment for tests
- `postcss` ^8.5.6 — CSS processor
- `tailwindcss` 4.1.11 — CSS framework
- `typescript` ^6.0.3 — TypeScript
- `vitest` ^4.1.9 — Unit test runner

**Missing dependencies for planned features:**
- `firebase/storage` — Already available via Firebase SDK, needs import
- `recharts` or `chart.js` — For stats page charts (Feature 5)
- `emoji-picker-react` or similar — For chat emoji picker (Feature 4)
- `focus-trap` — For modal accessibility (optional)

---

[Testing]

**Current test coverage:**
- `tests/unit/streak.test.ts` — Tests streak calculation logic
- `tests/unit/achievements.test.ts` — Tests achievement eligibility and awarding
- `tests/e2e/dashboard-and-sessions.spec.ts` — E2E tests for dashboard and quiz sessions

**Test infrastructure:**
- Vitest configured with jsdom environment and @ path alias
- Playwright configured with webServer pointing to `npm run dev` on port 3000
- Test scripts: `npm run test:unit`, `npm run test:unit:watch`, `npm run test:e2e`

**Testing gaps:**
- No unit tests for `lib/firestore-helpers.ts`, `lib/api-auth.ts`, `lib/ratelimit.ts`, `lib/input-validation.ts`
- No unit tests for hooks (`useFirestoreDocument`, `useFirestoreCollection`)
- No component tests for any UI components
- No E2E tests for chat flow, pairing flow, or memory board
- No integration tests for API routes

---

[Implementation Order]

The following represents the recommended order for implementing remaining features and addressing technical debt, based on impact, effort, and dependencies:

1. **Fix Quiz State Synchronization** — Debug and consolidate Firestore listeners in `ActiveSession.tsx` to eliminate state drift between partners during live quiz sessions. This is the highest-impact fix as quiz sync is core to the engagement loop.

2. **Performance Optimization** — Refactor `app/page.tsx` to use dynamic imports for Firebase and Dashboard, reducing initial bundle size and improving TTFB. Implement code splitting for heavy components.

3. **Photo Upload for Memory Board** — Integrate Firebase Storage for photo uploads, create `couples/{coupleId}/photos` subcollection, build upload UI and photo grid. This is the highest-value missing feature.

4. **Chat UI Polish** — Add emoji picker, read receipts, and message grouping by date. Enhance the existing ChatDrawer with these features.

5. **Dashboard Analytics Enhancement** — Integrate Recharts or Chart.js into the existing stats page to add bar/line charts for quiz completion over time and activity patterns.

6. **API Auth Refactor** — Replace the REST-based token verification in `lib/api-auth.ts` with Firebase Admin SDK initialization for proper server-side auth.

7. **Streak Module Cleanup** — Remove the dynamic `import()` inside `lib/streak.ts` and use proper top-level imports.

8. **Test Coverage Expansion** — Add unit tests for firestore-helpers, api-auth, ratelimit, and hooks. Add E2E tests for chat and pairing flows.

9. **Push Notifications** — Set up Firebase Cloud Messaging for quiz invites and chat notifications (post-MVP).

10. **Leaderboards** — Implement anonymized couple scoring with aggregation queries (post-MVP).