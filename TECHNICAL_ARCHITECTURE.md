# Technical Architecture — UsTogether

**Version:** 4.0
**Date:** 2026-09-28
**Status:** Active

## 1. Tech Stack

- Next.js 16.2 + React 18.2 + TypeScript 6.0+
- Firebase v11: Firestore, Auth, Storage
- Tailwind CSS 4.1 (`@theme` tokens in `app/globals.css`, no config file)
- Motion (Framer Motion successor, `motion/react`)
- Firebase Admin SDK for server-side auth
- Playwright (91 E2E specs, chromium) + Vitest (33 unit tests) for testing

## 2. File & Folder Structure

- `app/page.tsx` — Root landing page, uses AuthWrapper
- `app/stats/page.tsx` — Stats page (heatmap, metrics)
- `app/api/generate-quiz|generate-challenge|chat|reset-data/` — Server routes (Admin SDK, rate-limited)
- `components/features/couple/CoupleDashboard.tsx` — Couple-aware dashboard shell
- `components/features/couple/Dashboard.tsx` — Pre-pairing (pairing code in/out)
- `components/features/couple/StreakCounter.tsx` — Streak display
- `components/features/chat/ChatDrawer.tsx` — Chat with read receipts, date grouping, emoji picker
- `components/features/session/ActiveSession.tsx` — Quiz session, transaction-based answers
- `components/features/quiz/QuizList.tsx` + `QuizCard.tsx` — Quiz library + AI generation trigger
- `components/features/memories/MemoryBoard.tsx` — Photo upload + milestone timeline tabs
- `components/features/achievements/AchievementsPanel.tsx` — Achievement grid
- `components/shared/` — `BottomNav`, `ErrorBoundary`, `LandingSections`, `Skeletons` (no ChatFAB — removed, chat lives in BottomNav)
- `components/ui/` + `components/layout/` — Shared primitives (`button`, `card`, `input`, `badge`, `empty-state`, `section-header`)
- One import path per module: `@/components/features/...`, `@/components/shared/...`, `@/components/providers`, `@/components/auth/...` (no root re-export shims)
- `lib/firebase/client.ts` — Firebase client init + `isDemo` flag (hard-off in production)
- `lib/firebase/demo.ts` + `demo-seed.ts` — In-memory demo store (dev/CI only)
- `lib/firebase/index.ts` — Client re-export barrel
- `lib/shared/*` — `firestore-helpers`, `streak`, `achievements`, `quiz-data`, `storage`, `input-validation`, `firestore-errors`
- `lib/server/*` — `admin`, `api-auth`, `ratelimit` (API-only)
- One import path per module: `@/lib/shared/*` (shared), `@/lib/server/*` (server-only), `@/lib/firebase/client`, `@/lib/firestore` (demo-aware seam)
- `firestore.rules` — Row-level security (canonical for access policy)
- `global.d.ts` — Type definitions (imported as `@/types`)

## 3. Database Schema

- `users/{userId}` — profile, streak, points, pairedCoupleId
- `couples/{coupleId}` — pairing, typing status
- `couples/{coupleId}/messages/{messageId}` — chat messages with readBy
- `couples/{coupleId}/sessions/{sessionId}` — quiz sessions with state
- `quizzes/{quizId}` — quiz metadata
- `achievements/{userId}/items/{itemId}` — achievement records
- `pairingCodes/{code}` — pairing codes
- `memory_photos/{photoId}` — photo metadata with coupleId, sessionId
- `milestones/{milestoneId}` — milestones with coupleId, type, date

## 4. Firestore Data Flow

- Client app uses Firestore SDK through hooks
- Server API routes use Admin SDK via lib/server/admin.ts
- Chat messages updated with read receipts
- Sessions written via runTransaction to prevent drift

## 5. Environment & Configuration

- `.env.local` for NEXT_PUBLIC_FIREBASE_* client keys
- Server env FIREBASE_ADMIN_CREDENTIALS or applicationDefault
- `NEXT_PUBLIC_DEMO_MODE=true` — local dev + CI E2E only. `next.config.js`
  aliases `firebase/firestore|auth|storage` to the in-memory demo store and
  throws on a real Vercel production build (`VERCEL_ENV=production`) that sets
  it, so mock data can never reach real users. The check keys off VERCEL_ENV,
  not NODE_ENV, because `next build` always sets NODE_ENV=production (CI E2E
  intentionally builds with the demo flag).
- getStorage exposed from lib/firebase/client.ts

## 6. API & Integration Spec

- API auth now uses Admin SDK (`lib/server/api-auth.ts`)
- Chat, sessions, photos interact client-side

## 7. Authentication & Authorization

- Client: Firebase Auth
- Server: Admin SDK verifyIdToken
- Security Rules: couples scoped access control

## 8. State Management

- React local state + Firestore real-time listeners
- No global state store

## 9. Testing Strategy

- Playwright E2E tests in tests/e2e
- Unit tests with Vitest

## 10. Motion Library

- Use `motion/react` for all animation imports (successor to framer-motion)
- Standardized across ChatDrawer, Skeletons, and all animated components

## 11. Rate Limiting

- Serverless-compatible rate limiting via `lib/server/ratelimit.ts`
- Supports Redis/REDIS_URL for persistent backend in production
- Falls back to in-memory store for development

## 12. Deploy-Staleness Recovery

Quiz views load via `next/dynamic`. After a redeploy, a cached tab's HTML can
reference deleted chunk hashes (`ChunkLoadError`). `ErrorBoundary` reloads
once (sessionStorage-guarded against loops) to fetch fresh HTML; otherwise it
shows Try Again + Reload Page.
