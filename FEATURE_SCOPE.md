# UsTogether — Consolidated Product Specs

**Version:** 1.1  
**Date:** 2026-07-04  
**Status:** Active — Post-Audit

This repo keeps one set of canonical product docs:
- Product Requirements Document: `PRD.md`
- Technical Architecture: `TECHNICAL_ARCHITECTURE.md`
- Security & Access: `SECURITY_AND_ACCESS.md`
- Frontend Spec: `FRONTEND_SPEC.md`
- Implementation Tickets: `FEATURE_TICKETS.md`

Obsolete/duplicate docs below were consolidated there and can be removed:
- `CODEBASE_AUDIT.md`
- `Goals & Roadmap.md`
- `implementation_plan.md`
- `security_spec.md`

These 5 features are scoped for immediate development and have clear dependencies, acceptance criteria, and technical requirements. They range from high-impact performance improvements to user-facing enhancements.

---

## Feature 1: Performance Optimization — Component Refactoring & Code Splitting

**Impact:** Critical  
**Effort:** Medium (4–6 hours)  
**Dependencies:** None (can run in parallel)  
**Status:** ⏳ Not Started

### Description
Refactor `app/page.tsx` from a fully client-side component into a Next.js Server Component with isolated authentication logic. Implement dynamic imports for Firebase and the Dashboard component to defer loading until the user is authenticated, reducing Time to First Byte (TTFB) and improving Core Web Vitals.

### Current State
- `app/page.tsx` is already a Server Component (no `"use client"`) ✅
- `AuthWrapper` already uses `dynamic()` import for `Dashboard` ✅
- Firebase lib is imported statically — needs dynamic import ❌
- Lighthouse performance optimization not yet measured ❌

### Acceptance Criteria
- ✅ `app/page.tsx` uses `"use server"` or remains async (Server Component) — ✅ Done
- ✅ Authentication logic moved to `<AuthWrapper />` (already exists) — ✅ Done
- ✅ `Dashboard` component uses `next/dynamic` with `ssr: false` and loading fallback — ✅ Done
- ❌ Firebase lib is dynamically imported only after auth check passes
- ❌ Lighthouse Performance score improves by 10+ points
- ✅ `npm run dev` loads without errors — ✅ Done

### Why It Matters
- Reduces initial bundle size and TTFB
- Improves user experience on mobile/slow networks
- Enables faster perceived app load time

### Technical Details
- Modify `app/page.tsx` structure
- Update `next.config.js` if needed for dynamic imports
- Test with DevTools Lighthouse audit

**Team:** Backend/Performance

---

## Feature 2: Real-Time Quiz Synchronization Debug

**Impact:** Critical  
**Effort:** Medium–High (6–8 hours)  
**Dependencies:** Feature 1 (optional)  
**Status:** ⏳ Not Started

### Description
Debug and fix state synchronization failures in `ActiveSession.tsx` where quiz questions and scores don't sync between partners during live quiz sessions. Ensure Firestore listeners are consolidated, deduped, and properly batched to eliminate state drift.

### Current State
- `ActiveSession.tsx` uses `useFirestoreDocument` for session data ✅
- Answer submission uses `batchWrite` ✅
- Potential state drift when both partners answer simultaneously ❌
- Multiple Firestore listeners across components may cause re-render storms ❌

### Acceptance Criteria
- ❌ Quiz question appears on both screens simultaneously
- ❌ Score updates propagate instantly (< 500ms latency)
- ❌ No duplicate Firestore writes or listeners
- ❌ Firestore document watchers only fire once per update (no re-renders on same data)
- ❌ E2E test `quiz-flow.spec.ts` passes with two simulated partners
- ❌ No console errors or memory leaks

### Why It Matters
- Quiz is a core revenue/engagement driver
- State drift breaks the user experience
- Fixing this enables live, real-time gameplay

### Technical Details
- Review `ActiveSession.tsx` data flow
- Consolidate multiple `onSnapshot()` listeners into one
- Add `.off()` cleanup on unmount
- Verify Firestore rules allow cross-partner reads
- Write E2E test simulating both partners taking a quiz

**Team:** Backend/Frontend

---

## Feature 3: Memory Board — Photo Gallery Foundation

**Impact:** High  
**Effort:** Medium (5–7 hours)  
**Dependencies:** Feature 1 (or Feature 2)  
**Status:** ⏳ Not Started (Partial implementation exists)

### Description
Build the foundational Memory Board component to display shared couple photos and milestones. Create Firestore `memories` collection, implement upload handler (storing to Firebase Storage), and render a grid/timeline view of uploaded memories.

### Current State
- `MemoryBoard.tsx` exists and shows quiz history (finished sessions) ✅
- AI Challenge generation via `/api/generate-challenge` works ✅
- **Photo upload not yet implemented** ❌
- **Firebase Storage integration not yet initialized** ❌
- **Milestones timeline not yet implemented** ❌

### Acceptance Criteria
- ✅ New component `components/MemoryBoard.tsx` (or enhance existing if it exists) — ✅ Done
- ❌ Firestore collection `/couples/{coupleId}/memories` is created and secured
- ❌ Upload feature allows selecting images from device
- ❌ Images stored in Firebase Storage at `gs://bucket/couples/{coupleId}/memories/{id}`
- ❌ Memory grid displays all couple memories in chronological or reverse-chronological order
- ❌ Each memory shows: image, title, date, caption (optional)
- ❌ Delete memory removes both Firestore doc and Storage file
- ❌ Firestore rules prevent other couples from viewing private memories
- ❌ Mobile-responsive grid layout (1 col mobile, 2–3 desktop)

### Why It Matters
- Memory Board is a Nice-to-Have feature that drives emotional engagement
- Photo sharing is a proven retention driver in relationship apps
- Creates a visual timeline of couple history

### Technical Details
- Use `firebase/storage` for file uploads
- Implement `uploadBytes()` and `getDownloadURL()`
- Secure with `.getAuth()` to ensure only couple members upload/view
- Use Next.js Image component for optimization
- Add loading states and error handling

**Team:** Full Stack

---

## Feature 4: Chat UI/UX Refinement — Dark Mode & Advanced Features

**Impact:** Medium  
**Effort:** Medium (4–6 hours)  
**Dependencies:** Feature 1 (or independent)  
**Status:** ⏳ Partial — Chat Drawer exists, missing polish features

### Description
Refine the Chat Drawer UI to match the "UsTogether" dark aesthetic (`#1a1a2e` dark background, purple/pink accents). Implement message bubbles, typing indicators, read receipts, and emoji support for a more polished conversational experience.

### Current State
- ChatDrawer component exists with dark theme, slide-in animation ✅
- Typing indicators implemented via Firestore ✅
- Message bubbles styled (sender right-aligned gradient, partner left-aligned) ✅
- **Read receipts (readAt field) not implemented** ❌
- **Emoji picker not integrated** ❌
- **Message grouping by date not implemented** ❌

### Acceptance Criteria
- ✅ Chat container uses dark background with `backdrop-filter: blur()` — ✅ Done
- ✅ Message bubbles: user messages right-aligned (purple), partner messages left-aligned (gray) — ✅ Done
- ✅ Typing indicator shows "Partner is typing..." — ✅ Done
- ❌ Read receipts show checkmark when message is read
- ❌ Emoji picker (via emoji library or browser native) integrated in input
- ✅ Message history persists in Firestore and loads on mount — ✅ Done
- ✅ Soft drop shadows and 16–24px border radius for polish — ✅ Done
- ✅ Mobile responsive (single column, full height) — ✅ Done
- ✅ Auto-scroll to latest message on new message or load — ✅ Done

### Why It Matters
- Chat is core to couples' daily engagement
- Polished UX drives retention and daily active usage
- Visual match to dashboard improves brand cohesion

### Technical Details
- Update `components/ChatDrawer.tsx` or create `components/ChatPanel.tsx`
- Use Firestore document listeners to track typing status (e.g., `user.isTyping: true`)
- Implement `readAt` field on messages for read receipts
- Add emoji via `emoji-picker-react` or similar
- Use Tailwind for styling (`bg-opacity-*, backdrop-blur-*`)

**Team:** Frontend

---

## Feature 5: Dashboard Analytics & Couple Stats Page

**Impact:** Medium  
**Effort:** Medium (5–7 hours)  
**Dependencies:** Features 1 & 2 (optional)  
**Status:** ✅ Complete

### Description
Create a dedicated analytics/stats page showing couple progress: total points earned, quiz streaks, achievements unlocked, quiz completion rate, and activity heatmap. This gamification feature motivates couples to engage regularly.

### Current State
- Stats page at `app/stats/page.tsx` exists with full implementation ✅
- 4 metric cards: Total Points, Day Streak, Quizzes Done, Achievements ✅
- 30-day activity heatmap with color-coded squares ✅
- Recent achievements grid display ✅
- Share to clipboard button ✅

### Acceptance Criteria
- ✅ New page at `/dashboard/stats` or modal accessible from Dashboard — ✅ Done
- ✅ Display total couple points across all time — ✅ Done
- ✅ Show current streak (daily/weekly) with visual counter — ✅ Done
- ✅ List all unlocked achievements with unlock dates — ✅ Done
- ❌ Chart quiz completion over last 30 days (bar or line chart) — Missing (uses heatmap instead)
- ✅ Activity heatmap showing which days the couple was active — ✅ Done
- ❌ Comparison badge: e.g., "You're in the top 10% of active couples" (if leaderboard exists) — Requires leaderboard
- ✅ Share stats button (copy to clipboard or social share) — ✅ Done
- ✅ Mobile-responsive grid layout — ✅ Done
- ✅ Real-time updates (Firestore listeners) — ✅ Done

### Why It Matters
- Drives engagement through progress visualization
- Gives couples a sense of accomplishment and milestones
- Encourages return visits ("Don't break the streak!")
- Sets up foundation for leaderboards post-MVP

### Technical Details
- Use Recharts or Chart.js for visualizations (not yet integrated)
- Fetch couple data from Firestore: `couples/{coupleId}` and related subcollections
- Implement heatmap via CSS grid or a heatmap library
- Add social share via native Share API or manual copy-to-clipboard
- Secure with couple auth (only couple members can view their own stats)

**Team:** Full Stack / Frontend

---

## Feature 6: Photo Upload for Memory Board

**Impact:** High  
**Effort:** Medium (5–7 hours)  
**Dependencies:** None  
**Status:** ❌ Not Started

### Description
Integrate Firebase Storage to enable photo uploads in the Memory Board. Create a `couples/{coupleId}/photos` Firestore subcollection, build upload UI with image preview, and render a responsive photo grid. This is the highest-value missing feature.

### Acceptance Criteria
- Firebase Storage initialized in Firebase project
- Photo upload button with file picker (accepts image/*)
- Upload progress indicator
- Photos stored at `gs://bucket/couples/{coupleId}/photos/{id}`
- Photo grid displays in reverse-chronological order
- Click to enlarge (lightbox)
- Delete photo removes both Storage file and Firestore doc
- Firestore rules prevent unauthorized access

**Team:** Full Stack

---

## Feature 7: Milestones Timeline

**Impact:** Medium  
**Effort:** Medium (4–6 hours)  
**Dependencies:** None  
**Status:** ❌ Not Started

### Description
Add a visual timeline of relationship milestones (anniversaries, trips, achievements) with a dedicated Firestore subcollection and timeline UI component.

### Acceptance Criteria
- New subcollection `couples/{coupleId}/milestones`
- Milestone form: title, description, date, category
- Vertical timeline layout with alternating cards
- Real-time updates via Firestore listener

**Team:** Full Stack

---

## Feature 8: API Auth Refactor

**Impact:** Medium  
**Effort:** Low (1–2 hours)  
**Dependencies:** None  
**Status:** ❌ Not Started

### Description
Replace the REST-based Firebase ID token verification in `lib/api-auth.ts` with Firebase Admin SDK initialization for proper server-side auth.

### Acceptance Criteria
- Firebase Admin SDK initialized in API routes
- `getUserId()` uses `admin.auth().verifyIdToken()` instead of REST API
- Backward compatible — all existing routes continue working

**Team:** Backend

---

## Prioritization Matrix

| Feature | Impact | Effort | Risk | Recommended Order | Status |
|---------|--------|--------|------|-------------------|--------|
| Performance Optimization | Critical | Medium | Low | **1st** | ⏳ Partial |
| Quiz Sync Debug | Critical | High | Medium | **2nd** | ⏳ Not Started |
| Photo Upload | High | Medium | Low | **3rd** | ❌ Not Started |
| Chat UI Polish | Medium | Medium | Low | **4th** | ⏳ Partial |
| Dashboard Analytics | Medium | Medium | Low | **5th** | ✅ Complete |
| Milestones Timeline | Medium | Medium | Low | **6th** | ❌ Not Started |
| API Auth Refactor | Medium | Low | Low | **7th** | ❌ Not Started |

---

## Next Steps

1. **Pick a feature** from above or do them in recommended order
2. **Create a GitHub Issue** or ticket for each feature (use FEATURE_TICKETS.md as template)
3. **Estimate scope** with your team
4. **Assign to developer(s)**
5. **Update Goals & Roadmap.md** as features are completed

---

## Questions?

- Need more detail on a specific feature?
- Want to break down effort estimates further?
- Have dependencies or blockers we should know about?

Contact the dev lead or add notes here.