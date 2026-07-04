# Technical Architecture — UsTogether

**Version:** 3.0  
**Date:** 2026-07-04  
**Status:** Active

## 1. Tech Stack

- Next.js 16.2 + React 18.2 + TypeScript 6.0+
- Firebase v11: Firestore, Auth, Storage
- Tailwind CSS 4.1
- Motion (Framer Motion successor)
- Firebase Admin SDK for server-side auth
- Playwright + Vitest for testing

## 2. File & Folder Structure

- `app/page.tsx` — Root landing page, uses AuthWrapper
- `components/CouplesDashboard.tsx` — Couple-aware dashboard with chat, sessions, achievements
- `components/ChatDrawer.tsx` — Chat with read receipts, date grouping, emoji picker
- `components/ActiveSession.tsx` — Quiz session with transaction-based answer submission
- `components/MemoryBoard.tsx` — Photo upload + milestone timeline tabs
- `components/Skeletons.tsx` — Reusable loaders
- `lib/firebase.ts` — Firebase client init + storage export
- `lib/firestore-helpers.ts` — Core Firestore ops
- `lib/storage.ts` — Firebase Storage helpers with progress
- `lib/admin.ts` — Firebase Admin SDK init + verifyIdToken
- `lib/api-auth.ts` — Server-side token verification using Admin SDK
- `firestore.rules` — Row-level security for couples, photos, milestones
- `global.d.ts` — Type definitions for new entities

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
- Server API routes use Admin SDK via lib/admin.ts
- Chat messages updated with read receipts
- Sessions written via runTransaction to prevent drift

## 5. Environment & Configuration

- `.env.local` for NEXT_PUBLIC_FIREBASE_* client keys
- Server env FIREBASE_ADMIN_CREDENTIALS or applicationDefault
- getStorage exposed from lib/firebase.ts

## 6. API & Integration Spec

- API auth now uses Admin SDK
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