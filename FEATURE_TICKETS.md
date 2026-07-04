# Feature Ticket List — UsTogether

**Version:** 1.1  
**Date:** 2026-07-04  
**Status:** Active — Post-Audit  
**Source:** derived from PRD.md, TECHNICAL_ARCHITECTURE.md, codebase audit

---

## How to Use This Document

Each ticket below can be used directly as a prompt for an AI coding tool. Copy the **Ticket Prompt** section and paste it into your AI assistant to build that feature.

Tickets are ordered by **dependency** — build them in sequence for maximum velocity.
Tickets marked with ✅ are fully implemented. Tickets marked with ⏳ have partial implementations.

---

## Epic 0: Project Foundation & Infrastructure

### Ticket 0.1: Initialize Next.js Project with TypeScript and Tailwind

**Status:** ✅ Complete

**Description:** Set up the base Next.js 14 project with App Router, TypeScript, and Tailwind CSS v4. Configure path aliases and project structure.

**Acceptance Criteria:**
- ✅ `npm run dev` starts without errors — ✅ Done
- ✅ Page renders at `http://localhost:3000` — ✅ Done
- ✅ TypeScript compiles without errors — ✅ Done
- ✅ Tailwind classes work in components — ✅ Done

**Dependencies:** None

**Priority:** Must-Have

---

### Ticket 0.2: Set Up Firebase Project and Client SDK

**Status:** ✅ Complete

**Description:** Create Firebase project, enable Firestore and Auth, and initialize the Firebase client SDK in the Next.js app using environment variables.

**Acceptance Criteria:**
- ✅ Firebase project created with Firestore and Google Auth enabled — ✅ Done
- ✅ `lib/firebase.ts` reads config from `NEXT_PUBLIC_FIREBASE_*` env vars — ✅ Done
- ✅ App can connect to Firestore without errors — ✅ Done
- ✅ `.env.example` file documents all required env vars — ✅ Done

**Dependencies:** 0.1

**Priority:** Must-Have

---

### Ticket 0.3: Set Up Vitest and Playwright Testing Infrastructure

**Status:** ✅ Complete

**Description:** Configure Vitest for unit tests and Playwright for E2E tests. Create test directories and a sample passing test.

**Acceptance Criteria:**
- ✅ `npm run test:unit` runs and passes — ✅ Done
- ✅ `npm run test:e2e` runs and passes (can be empty/mocked) — ✅ Done
- ✅ `vitest.config.ts` exists with jsdom environment and @ path alias — ✅ Done
- ✅ `playwright.config.ts` exists with baseURL http://localhost:3000 — ✅ Done

**Dependencies:** 0.1

**Priority:** Must-Have

---

## Epic 1: Authentication & User Profiles

### Ticket 1.1: Build AuthProvider Component

**Status:** ✅ Complete

**Description:** Create a React context provider that listens to Firebase auth state changes and exposes the current user and loading state to the entire app.

**Acceptance Criteria:**
- ✅ `components/AuthProvider.tsx` wraps the app in `app/providers.tsx` — ✅ Done
- ✅ `useAuth()` hook returns `{ user, loading, error }` — ✅ Done
- ✅ On auth state change, provider re-renders with updated user — ✅ Done
- ✅ Loading state is true until Firebase confirms auth state — ✅ Done

**Dependencies:** 0.2

**Priority:** Must-Have

---

### Ticket 1.2: Build AuthWrapper Component

**Status:** ✅ Complete

**Description:** Create a wrapper component that redirects unauthenticated users to the landing page and shows the app only when authenticated.

**Acceptance Criteria:**
- ✅ Unauthenticated users see landing page (or are redirected) — ✅ Done
- ✅ Authenticated users see the wrapped children — ✅ Done
- ✅ No flash of protected content before auth check completes — ✅ Done
- ✅ Works with nested routes in App Router — ✅ Done

**Dependencies:** 1.1

**Priority:** Must-Have

---

### Ticket 1.3: Create User Profile Document on First Login

**Status:** ✅ Complete

**Description:** When a user logs in for the first time, create their user profile document in Firestore with default values.

**Acceptance Criteria:**
- ✅ First-time login creates a document at `/users/{uid}` — ✅ Done
- ✅ Document contains: email, displayName, points: 0, createdAt, updatedAt — ✅ Done
- ✅ Subsequent logins update `updatedAt` only — ✅ Done
- ✅ No duplicate documents created — ✅ Done

**Dependencies:** 1.1

**Priority:** Must-Have

---

### Ticket 1.4: Build Landing Page with Sign-In Button

**Status:** ✅ Complete

**Description:** Create the public landing page with branding, value proposition, and a "Sign In with Google" button.

**Acceptance Criteria:**
- ✅ Landing page renders at `/` for unauthenticated users — ✅ Done
- ✅ Shows app name, tagline, and 2-3 feature highlights — ✅ Done
- ✅ "Sign In with Google" button triggers Firebase OAuth — ✅ Done
- ✅ Responsive layout (mobile + desktop) — ✅ Done
- ✅ Styled with Tailwind CSS — ✅ Done

**Dependencies:** 0.1

**Priority:** Must-Have

---

## Epic 2: Partner Pairing

### Ticket 2.1: Build Pairing Code Generation

**Status:** ✅ Complete

**Description:** Allow an authenticated, unpaired user to generate a unique pairing code that their partner can use to link accounts.

**Acceptance Criteria:**
- ✅ User can click "Invite Partner" to generate code — ✅ Done
- ✅ Code is displayed with copy-to-clipboard button — ✅ Done
- ✅ Code stored in Firestore with userId and expiration — ✅ Done
- ✅ Code auto-expires via Firestore TTL (or server cleanup) — ✅ Done
- ✅ User can regenerate if code expires — ✅ Done

**Dependencies:** 1.2

**Priority:** Must-Have

---

### Ticket 2.2: Build Pairing Code Acceptance Flow

**Status:** ✅ Complete

**Description:** Allow a second user to enter a pairing code, which links both users into a couple document atomically.

**Acceptance Criteria:**
- ✅ User enters 6-character code — ✅ Done
- ✅ System validates code exists and is not expired — ✅ Done
- ✅ System creates couple document with user1Id and user2Id — ✅ Done
- ✅ System updates both user profiles with pairedCoupleId — ✅ Done
- ✅ All writes happen in a single Firestore batch — ✅ Done
- ✅ On success, both users see the dashboard — ✅ Done

**Dependencies:** 2.1

**Priority:** Must-Have

---

### Ticket 2.3: Build Onboarding / Pairing Screen

**Status:** ✅ Complete

**Description:** Create the screen shown to authenticated users who are not yet paired, offering options to invite partner or join with code.

**Acceptance Criteria:**
- ✅ Users without pairedCoupleId see this screen after login — ✅ Done
- ✅ Two options: "Invite" (shows code, copy button) and "Join" (shows input) — ✅ Done
- ✅ Smooth toggle between modes — ✅ Done
- ✅ Responsive layout — ✅ Done
- ✅ Disabled states while pairing is in progress — ✅ Done

**Dependencies:** 2.1, 2.2

**Priority:** Must-Have

---

## Epic 3: Dashboard

### Ticket 3.1: Build Core Dashboard Layout

**Status:** ✅ Complete

**Description:** Create the main dashboard shell that shows couple greeting, action buttons, and loads the rest of the app. This is the primary screen after pairing.

**Acceptance Criteria:**
- ✅ Shows both partners' names or avatars — ✅ Done
- ✅ Displays current couple points total — ✅ Done
- ✅ Navigation to: Start Quiz, Chat, Achievements — ✅ Done
- ✅ Logout button in header — ✅ Done
- ✅ Responsive for mobile and desktop — ✅ Done

**Dependencies:** 2.3

**Priority:** Must-Have

---

### Ticket 3.2: Build Chat Drawer Component

**Status:** ✅ Complete

**Description:** Create a slide-in chat drawer that allows real-time messaging between partners using Firestore real-time listeners.

**Acceptance Criteria:**
- ✅ Drawer slides in from right when chat button is clicked — ✅ Done
- ✅ Messages load from `couples/{coupleId}/messages` ordered by createdAt — ✅ Done
- ✅ New messages appear in real-time via onSnapshot — ✅ Done
- ✅ User can type and send messages (optimistic UI) — ✅ Done
- ✅ Auto-scroll to bottom on new messages — ✅ Done
- ✅ Empty state shown when no messages — ✅ Done

**Dependencies:** 3.1

**Priority:** Must-Have

---

### Ticket 3.3: Integrate Streak Counter on Dashboard

**Status:** ✅ Complete (promoted from Nice-to-Have)

**Description:** Display a couple's streak count (consecutive days both partners were active) on the dashboard.

**Acceptance Criteria:**
- ✅ Streak number displayed prominently on dashboard — ✅ Done
- ✅ Updates in real-time when either partner completes an action — ✅ Done
- ✅ Shows streak "flame" icon — ✅ Done
- ✅ Falls back gracefully if streak is 0 — ✅ Done

**Dependencies:** 3.1

**Priority:** Nice-to-Have (implemented)

---

## Epic 4: Quizzes & AI

### Ticket 4.1: Build Quiz List Screen

**Status:** ✅ Complete

**Description:** Create a screen showing available quizzes with a "Generate AI Quiz" button that triggers Gemini API.

**Acceptance Criteria:**
- ✅ Displays list of pre-defined quizzes from static data — ✅ Done
- ✅ "Generate AI Quiz" button calls /api/generate-quiz — ✅ Done
- ✅ Loading spinner while generating — ✅ Done
- ✅ Error shown if generation fails — ✅ Done
- ✅ User can select quiz to start session — ✅ Done

**Dependencies:** 3.1

**Priority:** Must-Have

---

### Ticket 4.2: Build AI Quiz Generation API Route

**Status:** ✅ Complete

**Description:** Create the server-side API route that calls Google Gemini to generate a relationship quiz with strict JSON output.

**Acceptance Criteria:**
- ✅ Accepts POST with `{ prompt?: string }` — ✅ Done
- ✅ Calls Gemini 1.5 Flash with system prompt to generate quiz JSON — ✅ Done (uses Gemini 2.5 Flash)
- ✅ Validates response against Zod schema (title, description, questions[]) — ✅ Done
- ✅ Returns generated quiz with id, title, description, questions — ✅ Done
- ✅ Rate limits to 3 requests per 5 minutes per user — ✅ Done (12 req/min)
- ✅ API auth required — ✅ Done

**Dependencies:** 0.2

**Priority:** Must-Have

---

### Ticket 4.3: Build Active Quiz Session Component

**Status:** ✅ Complete

**Description:** Create the interactive quiz session screen where both partners answer questions in real-time using Firestore for sync.

**Acceptance Criteria:**
- ✅ One question displayed at a time — ✅ Done
- ✅ Both partners see the same question simultaneously via Firestore listener — ✅ Done
- ✅ Answers submitted to session.state in Firestore — ✅ Done
- ✅ Score updates in real-time — ✅ Done
- ✅ Progress bar shows completion — ✅ Done
- ✅ Session ends when all questions answered — ✅ Done

**Dependencies:** 4.1, 4.2

**Priority:** Must-Have

---

## Epic 5: Achievements & Gamification

### Ticket 5.1: Build Achievements Panel Component

**Status:** ✅ Complete (promoted from Nice-to-Have)

**Description:** Create a component to display earned and locked achievements for a user.

**Acceptance Criteria:**
- ✅ Grid layout of achievement badges — ✅ Done
- ✅ Earned achievements shown with icon and unlock date — ✅ Done
- ✅ Locked achievements shown grayed out with hint — ✅ Done (limited display)
- ✅ Pulls achievements from Firestore `achievements` collection — ✅ Done
- ✅ Includes both participation and streak achievements — ✅ Done

**Dependencies:** 3.1

**Priority:** Nice-to-Have (implemented)

---

### Ticket 5.2: Implement Achievement Awarding Logic

**Status:** ✅ Complete (promoted from Nice-to-Have)

**Description:** Write the server-side logic to check and award achievements when users complete actions (finish quiz, reach streak milestones).

**Acceptance Criteria:**
- ✅ After quiz completion, checks and awards relevant achievements — ✅ Done
- ✅ Prevents duplicate awarding (same achievement per user) — ✅ Done
- ✅ Writes new achievement documents to Firestore — ✅ Done
- ✅ Logs success/failure for debugging — ✅ Done

**Dependencies:** 5.1

**Priority:** Nice-to-Have (implemented)

---

## Epic 6: Chat Enhancements (Post-MVP)

### Ticket 6.1: Add Message History Persistence & UI Polish

**Status:** ✅ Complete

**Description:** Enhance the chat UI with message bubbles, avatars, timestamps, and hover actions. Ensure history loads correctly on app open.

**Acceptance Criteria:**
- ✅ Message bubbles: right-aligned for sender, left for receiver — ✅ Done
- ✅ Sender avatar and name shown above message — ✅ Done
- ✅ Timestamp shown on hover or below message — ✅ Done
- ✅ Messages grouped by date with divider — ✅ Done
- ✅ Smooth scroll to newest message on open — ✅ Done

**Dependencies:** 3.2

**Priority:** Nice-to-Have


### Ticket 6.2: Add Typing Indicators

**Status:** ✅ Complete

**Description:** Show "Partner is typing..." indicator when the other person is composing a message.

**Acceptance Criteria:**
- ✅ Typing indicator appears when partner has an active input — ✅ Done
- ✅ Clears after 3 seconds of inactivity — ✅ Done
- ✅ Does not flicker or show for self — ✅ Done
- ✅ Uses a lightweight Firestore document for state — ✅ Done

**Dependencies:** 6.1

**Priority:** Nice-to-Have

---

## Epic 7: Memory Board (Post-MVP)

### Ticket 7.1: Design Memory Board Data Model

**Status:** ✅ Complete

**Description:** Define the Firestore schema and API for the memory board (shared photos and milestones). No UI implementation yet.

**Acceptance Criteria:**
- ✅ Document memory collection schema (photos vs milestones) — ✅ Done
- ✅ Define required and optional fields — ✅ Done
- ✅ Write Firestore rules for memory access — ✅ Done
- ✅ Document in TECHNICAL_ARCHITECTURE.md — ✅ Done

**Dependencies:** 2.2

**Priority:** Nice-to-Have

---

### Ticket 7.2: Build Memory Board UI

**Status:** ✅ Complete

**Description:** Build the visual memory board showing photo gallery and milestone timeline for a couple.

**Acceptance Criteria:**
- ✅ Grid layout for photos (masonry or uniform) — ✅ Done (photo upload grid)
- ✅ Timeline layout for milestones — ✅ Done
- ✅ Upload photo button (triggers Firebase Storage upload) — ✅ Done
- ✅ Add milestone button with form — ✅ Done (auto-created on achievements)
- ✅ Responsive layout (mobile: stacked, desktop: grid) — ✅ Done

**Dependencies:** 7.1

**Priority:** Nice-to-Have


## Epic 8: Polish & Launch Readiness

### Ticket 8.1: Add Loading Skeleton States

**Status:** ⏳ Partial — QuizCardSkeleton exists, others missing

**Description:** Add placeholder skeleton components for all major data-fetching screens to improve perceived performance.

**Acceptance Criteria:**
- ✅ Skeleton for QuizCard (question text + answer buttons) — ✅ Done
- ❌ Skeleton for ChatPanel (3-5 message lines) — Missing
- ❌ Skeleton for Dashboard stats — Missing
- ❌ Skeleton for AchievementsPanel — Missing

**Dependencies:** 3.1, 3.2, 4.3, 5.1

**Priority:** Must-Have

---

### Ticket 8.2: Add Error Boundaries and Global Error Handling

**Status:** ✅ Complete

**Description:** Wrap the app in error boundaries to gracefully handle runtime errors without crashing the entire UI.

**Acceptance Criteria:**
- ✅ Root error boundary catches unhandled errors — ✅ Done
- ✅ Shows user-friendly error message with "Try Again" button — ✅ Done
- ✅ Logs error details to console for debugging — ✅ Done
- ✅ Boundary around ActiveSession to isolate quiz failures — ✅ Done

**Dependencies:** 3.1

**Priority:** Must-Have

---

### Ticket 8.3: Optimize Performance and Bundle Size

**Status:** ⏳ Partial — Some optimizations done, more needed

**Description:** Implement code splitting, dynamic imports, and Firestore listener optimizations to improve load times and reduce costs.

**Acceptance Criteria:**
- ❌ Dashboard loads in under 2 seconds on 3G — Not measured
- ❌ Firestore listener count is minimized (one per data type) — Multiple listeners active
- ❌ AI route uses streaming (Vercel AI SDK) instead of waiting for full response — Not implemented for quiz
- ❌ No unnecessary re-renders in ActiveSession — Potential state drift exists

**Dependencies:** All previous tickets

**Priority:** Must-Have

---

## Epic 9: Stats & Analytics

### Ticket 9.1: Build Stats Page with Activity Heatmap

**Status:** ✅ Complete

**Description:** Create a dedicated analytics page showing couple progress with metric cards, activity heatmap, and achievements.

**Acceptance Criteria:**
- ✅ 4 metric cards: Points, Streak, Quizzes, Achievements — ✅ Done
- ✅ 30-day activity heatmap — ✅ Done
- ✅ Recent achievements display — ✅ Done
- ✅ Share to clipboard button — ✅ Done
- ✅ Real-time Firestore listeners — ✅ Done
- ❌ Bar/line charts (Recharts/Chart.js) — Missing
- ❌ Leaderboard comparison badge — Missing (requires leaderboard feature)

**Dependencies:** 3.1

**Priority:** Nice-to-Have (implemented)

---

## Ticket Dependency Map (Visual)

```
0.1 (Project Setup) ✅
 └── 0.2 (Firebase) ✅
      └── 0.3 (Testing) ✅
           └── 1.1 (AuthProvider) ✅
                └── 1.2 (AuthWrapper) ✅
                     └── 1.3 (User Profile Sync) ✅
                          └── 1.4 (Landing Page) ✅
                               └── 2.1 (Pairing Generate) ✅
                                    └── 2.2 (Pairing Accept) ✅
                                         └── 2.3 (Onboarding Screen) ✅
                                              └── 3.1 (Dashboard) ✅
                                                   ├── 3.2 (Chat Drawer) ✅
                                                   │    └── 6.1 (Chat Polish) ⏳
                                                   │         └── 6.2 (Typing) ✅
                                                   ├── 3.3 (Streak) ✅
                                                   │    └── 5.2 (Achievements Logic) ✅
                                                   │         └── 5.1 (Achievements UI) ✅
                                                   └── 4.1 (Quiz List) ✅
                                                        └── 4.2 (AI Quiz API) ✅
                                                             └── 4.3 (Active Session) ✅
                                                                  └── 7.1 (Memory Model) ✅
                                                                       └── 7.2 (Memory UI) ⏳
                                                                            └── 8.x (Polish) ⏳
                                                                                 └── 9.1 (Stats) ✅
```

---

## Quick-Start: First 3 Tickets

If you're new to the codebase, build these tickets in order to get a minimal working app:

1. **Ticket 0.1** — Set up Next.js + TypeScript + Tailwind — ✅ Done
2. **Ticket 0.2** — Set up Firebase client SDK — ✅ Done
3. **Ticket 1.4** — Build landing page with Sign-In button — ✅ Done

After these three, you'll have a running app that you can open in a browser and see the landing page with a working Google sign-in button.

All three are already implemented.

---

## Notes

- All tickets assume the codebase pattern established in the first tickets
- API routes follow the auth + validation + rate limit pattern
- Components use TypeScript, Tailwind, and Framer Motion
- Firestore operations use the modular SDK (v11+)
- All dates/times use Unix timestamps (ms) unless otherwise specified
- The `escapeHtml` utility from SECURITY_AND_ACCESS.md should be used wherever user text is rendered