# Goals & Roadmap

## 🚨 Current Priority Issues

### Performance & Architecture Optimization (New)
- ❌ **Component Boundaries (Critical)** - `"use client"` is declared at the top of `app/page.tsx`, needlessly bloating the initial JS bundle. Needs refactoring into an RSC with an isolated `<AuthWrapper />` client component.
- ❌ **Code Splitting (High)** - The `Dashboard` and heavy Firebase dependencies in `app/page.tsx` need to be wrapped in `next/dynamic` to ensure they are only downloaded after authentication.
- ❌ **Core Web Vitals (High)** - AI network requests in `app/api/generate-quiz/route.ts` and `app/api/generate-challenge/route.ts` are blocking and cause slow Time to First Byte (TTFB). Refactor to use the Vercel AI SDK for streaming.
- ❌ **Data Fetching Waterfalls (Medium)** - Unoptimized chained Firestore `onSnapshot` listeners in `components/ActiveSession.tsx` are causing excessive re-renders. Consolidate listeners.

### Quiz Functionality
- ❌ **Quiz Not Working Properly** - Sessions fail to sync between partners during quiz completion
  - Needs debugging of real-time state synchronization in `ActiveSession.tsx`
  - Points calculation may not be persisting correctly to Firestore

### UI/UX Improvements
- ❌ **Homepage Feels Empty & Bland** - Lacks visual appeal and user engagement
  - Need hero section with call-to-action
  - Add testimonials or couple stories
  - Improve color scheme and visual hierarchy
  - Add loading states and animations
- ❌ **Dashboard Lacks Polish** - Needs better visual design and layout

### Feature Implementation
- ❌ **Memory Feature Missing** - No way to view/store couple memories or photos
  - Need memory/gallery collection in Firestore
  - UI for uploading and displaying shared memories
- ❌ **Chat Implementation Incomplete** - Basic messaging exists but needs:
  - Message history persistence
  - Better UI with message bubbles
  - Typing indicators
  - Read receipts
  - Emoji support

---

## ✅ Completed Features

- Updated `QuizList.tsx` and `ActiveSession.tsx` to reference `couples/${coupleId}/sessions`
- Fixed Firestore permissions for couple pairing
- Removed unused arguments from error handlers
- Fixed User B's connection permissions
- Authentication with Google OAuth
- Private couple pairing system
- Real-time chat drawer (basic)
- Interactive quiz foundation
- Error handling framework

---

## 📋 Next Steps (Priority Order)

1. **Resolve Performance Bottlenecks** - Fix React component boundaries, implement AI route streaming, and patch the Firestore data fetch waterfall.
2. **Debug & Fix Quiz Sync** - Ensure both partners see same questions and final scores
3. **Redesign Homepage** - Modern, engaging UI with better visual design
4. **Polish Dashboard** - Better layout and navigation
5. **Implement Memory/Gallery Feature** - Add photo sharing capability
6. **Enhance Chat UI** - Improve message display and user experience
7. **Add Stats/Leaderboard** - Show couple scores and progress over time
8. **Mobile Responsiveness** - Ensure works well on phones/tablets