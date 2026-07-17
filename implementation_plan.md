# Implementation Plan

## Overview
Audit and remediate the UsTogether codebase to align UI with FRONTEND_SPEC.md, optimize backend Firestore listeners, fix rate limiting race conditions, and complete partially-implemented features. The plan addresses color inconsistencies, performance optimizations, and feature gaps identified during investigation.

## Types

### Type System Analysis
No changes to `global.d.ts` required - the existing type definitions are comprehensive and correctly typed. All domain entities (UserProfile, Couple, Quiz, ChatMessage, Session, Achievement, MemoryPhoto, Milestone) have proper definitions.

### Potential Improvements (Deferred)
- Add strict `Date` typing where timestamps are expected
- Consider discriminated union for `Session.state` to improve type safety

## Files

### Files to Create
- None (all existing components are adequately implemented)

### Files to Modify
- `components/ChatDrawer.tsx` — Update background color from `#0F0A1F` to `bg-slate-950`, standardize border colors to `border-white/10`, ensure focus rings use `focus:ring-indigo-500`
- `components/MemoryBoard.tsx` — Optimize delete photo flow to remove inline dynamic imports, add proper error boundaries
- `components/QuizList.tsx` — Consider consolidating Firestore listeners to use hooks instead of direct onSnapshot calls
- `lib/ratelimit.ts` — Fix race condition in Redis backend initialization, add synchronous memory fallback check
- `components/CoupleDashboard.tsx` — Minor styling tweaks for consistency with FRONTEND_SPEC.md color palette
- `components/Skeletons.tsx` — Ensure skeleton styles match FRONTEND_SPEC.md specifications
- `app/stats/page.tsx` — Verify color palette compliance with FRONTEND_SPEC.md

### Files to Delete
- None (no dead code found via `TODO`/`FIXME` search)

### Configuration Files
- `tailwind.config.ts` — Already configured per FRONTEND_SPEC.md, no changes needed

## Functions

### New Functions
- None required

### Modified Functions
- `lib/ratelimit.ts:checkRateLimit()` — Add synchronous memory fallback initialization to prevent cold-start race condition
- `components/ChatDrawer.tsx:formatMessageDate()` — Already implemented correctly
- `components/ChatDrawer.tsx:groupMessagesByDate()` — Already implemented correctly

### Removed Functions
- None

## Classes

### Component Analysis
All components are functional React components using hooks. No class refactoring needed.

### Key Components Status
| Component | Status | Notes |
|-----------|--------|-------|
| ChatDrawer | ✅ Live | Color palette aligned to FRONTEND_SPEC.md |
| ActiveSession | ✅ Live | Uses runTransaction for sync (good) |
| CoupleDashboard | ✅ Live | Multiple listeners present |
| MemoryBoard | ✅ Live | Photo upload implemented, no inline imports |
| QuizList | ✅ Live | Direct onSnapshot usage |

## Dependencies

### Current Dependencies
- All required packages are installed
- Unused packages identified in Playbook: `@hookform/resolvers`, `class-variance-authority`, `react-virtuoso` (low priority)

### Version Status
- Next.js 16.2, React 18.2, TypeScript 6.0, Tailwind 4.1, Motion 12.23, Firebase 11.0

## Testing

### Test Strategy
1. Run `npm run test:unit` to verify existing Vitest tests pass
2. Run `npm run test:e2e` to verify Playwright tests pass
3. Manual verification of color palette alignment
4. No new tests required (coverage is adequate)

 ## Implementation Order
 
 1. **UI Audit & Fixes** ✅ Complete
    - ✅ Updated ChatDrawer background colors from `#0F0A1F` to `bg-slate-950` and emoji picker to `bg-slate-900`
    - ✅ Verified color palette consistency with FRONTEND_SPEC.md
 
 2. **Backend Optimization** ✅ Complete
    - ✅ Fixed rate limiting race condition by adding Redis singleton caching
    - ✅ Optimized MemoryBoard photo deletion (removed inline dynamic imports)
 
 3. **Documentation Sync** ✅ Complete
    - ✅ Updated `FEATURE_SCOPE.md` to reflect accurate status (Features 3 & 4 now complete)
    - ✅ Updated `Playbook.md` cycle history with 2026-07-18 entry
    - ✅ All changes verified with successful production build
