# Implementation Plan — UsTogether Dashboard UX Enhancements

**Version:** 3.0  
**Date:** 2026-07-04  
**Status:** Active

## Overview

Execute 6 sequential phases: Performance Optimization & Skeletons wiring, Quiz Sync Debug, Photo Upload, Chat UI Polish, Milestones Timeline, and API Auth Refactor. Each phase targets specific files, functions, and validation criteria. Follow dependency order to minimize conflicts.

## Types

Add to `global.d.ts`:

```ts
// In Firestore timestamps section or new section
export interface PhotoUploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
}

export interface MemoryPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  sessionId: string;
  coupleId: string;
  uploadedBy: string;
  uploadedAt: number;
  createdAt: number;
}

export interface Milestone {
  id: string;
  coupleId: string;
  type: 'session_completed' | 'streak_7' | 'streak_30' | 'quiz_milestone' | 'anniversary';
  title: string;
  description?: string;
  date: number;
  relatedSessionId?: string;
  icon?: string;
}
```

Modify `ChatMessage` type to add `readBy` field:

```ts
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number | Date;
  readBy?: string[];
}
```

## Files

### New files
- `lib/storage.ts` — Firebase Storage helpers: `uploadPhoto`, `getDownloadURL`, `deletePhoto`, `uploadWithProgress`
- `lib/admin.ts` — Firebase Admin SDK initialization and `verifyIdToken` for server-side auth

### Files to modify
- `components/Skeletons.tsx` — Already has `QuizCardSkeleton`, `ChatPanelSkeleton`, `DashboardSkeleton`, `AchievementsPanelSkeleton`. No new components needed.
- `components/ChatDrawer.tsx` — Add read receipts, sender avatars, date grouping, emoji picker
- `components/ActiveSession.tsx` — Consolidate listeners, fix state drift with transaction, add debounce
- `components/MemoryBoard.tsx` — Add photo upload grid with drag-drop, milestone timeline tabs
- `lib/firebase.ts` — Export `getStorage()`
- `lib/api-auth.ts` — Replace REST API with Firebase Admin SDK
- `package.json` — Add `firebase-admin` dependency
- `firestore.rules` — Add `memory_photos` and `milestones` subcollection rules
- `global.d.ts` — Add `PhotoUploadProgress`, `MemoryPhoto`, `Milestone` types; update `ChatMessage`

## Functions

### New functions
- `lib/storage.ts:uploadWithProgress(file, path, onProgress)` — Upload to Firebase Storage with progress callback
- `lib/storage.ts:uploadPhoto(coupleId, file, userId)` — Generate path, call uploadWithProgress, return URL
- `lib/storage.ts:getDownloadURL(path)` — Wrapper for `getDownloadURL` from Firebase Storage
- `lib/storage.ts:deletePhoto(path)` — Delete from Firebase Storage
- `lib/admin.ts:admin` — Initialized Firebase Admin app
- `lib/admin.ts:verifyIdToken(idToken)` — Verify ID token using Admin SDK

### Modified functions
- `components/ActiveSession.tsx:handleAnswer` — Wrap with `runTransaction` to prevent race conditions
- `components/ChatDrawer.tsx` — Add `markAsRead`, group messages by date, render avatars via `getAvatarUrl`
- `components/MemoryBoard.tsx` — Add photo upload handler, milestone timeline rendering

## Classes

No new classes. Continue using existing functional component patterns.

## Dependencies

- Add `firebase-admin` to `package.json` (server-only)
- No new client-side dependencies required

## Testing

Write E2E test for quiz sync in `tests/e2e/quiz-sync.spec.ts`:
1. Two partners join session
2. One submits answer
3. Verify second partner sees updated state within 2s
4. Verify no state drift after 10 rapid submissions

Unit tests for `lib/storage.ts` and `lib/admin.ts` with mocked Firebase instances.

## Implementation Order

1. **Phase 1: Performance Optimization & Skeletons**
   - Verify `app/page.tsx` is Server Component
   - Wire `ChatPanelSkeleton` into `ChatDrawer` loading states
   - Wire `DashboardSkeleton` into `CoupleDashboard` loading states
   - Wire `AchievementsPanelSkeleton` into `AchievementsPanel` loading states

2. **Phase 2: Quiz Sync Debugging**
   - Wrap `handleAnswer` in `runTransaction` in `ActiveSession.tsx`
   - Add debounce to frequency of state writes
   - Ensure listeners consolidate on `session.state` only
   - Write E2E test `tests/e2e/quiz-sync.spec.ts`

3. **Phase 3: Photo Upload**
   - Add `getStorage` export to `lib/firebase.ts`
   - Create `lib/storage.ts` with upload helpers
   - Update `firestore.rules` for `memory_photos` subcollection
   - Enhance `MemoryBoard.tsx` with photo upload grid + drag-drop

4. **Phase 4: Chat UI Polish**
   - Add `readBy` field tracking to `ChatMessage` type
   - Implement read receipts in `ChatDrawer.tsx`
   - Add emoji picker button with native picker fallback
   - Group messages by date with headers
   - Add sender avatars via `useAuth` + `getAvatarUrl`

5. **Phase 5: Milestones Timeline**
   - Add `Milestone` type to `global.d.ts`
   - Update `firestore.rules` for `milestones` subcollection
   - Add milestone timeline UI tabs to `MemoryBoard.tsx`

6. **Phase 6: API Auth Refactor**
   - Install `firebase-admin`
   - Create `lib/admin.ts` with service account init
   - Refactor `lib/api-auth.ts` to use Admin SDK
   - Update `TECHNICAL_ARCHITECTURE.md` Section 7

After each phase, update documentation per `.clinerules` mandate.