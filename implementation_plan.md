# Implementation Plan

[Overview]
Enhance UsTogether with polished visuals and new features that deepen couples' connection through streak tracking, achievements, and daily reminders while preserving the app's luxurious dark Desi aesthetic.

This plan responds to the request to improve the website look using screenshots and implement new features. It first assesses the current UI baseline captured in `test-results/landing-current.png`, then proceeds with a top-to-bottom visual polish across the landing page, dashboard, quizzes, and memory board. New features—streaks, achievements, and reminders—are layered in as dashboard modules, keeping the change minimal and non-breaking.

[Types]
No new TypeScript types are required; existing component props and Firestore document shapes remain valid.

New Firestore fields will use existing types or add optional properties where appropriate. Planned additions:
- `users/{uid}`: optional `streak`, `lastActiveAt`, `reminderEnabled`, `reminderTime`
- `couples/{coupleId}`: optional `streak`, `lastQuizCompletedAt`
- New subcollection: `achievements/{userId}` with lightweight objects like `{ id, title, description, unlockedAt }`

[Files]
- `app/globals.css` — Add custom animations, smooth scrollbar styling, and premium gradient mesh noise texture
- `app/layout.tsx` — Add metadata enhancement and theme color declarations
- `components/LandingSections.tsx` — New animated landing sections with staggered fade-ins and floating gradient orbs
- `components/StreakCounter.tsx` — New dashboard module for current streak display
- `components/AchievementsPanel.tsx` — New dashboard module showing recent achievement badges
- `components/QuizCard.tsx` — Enhanced quiz card with improved hover glow, glass-morphism, and border gradient
- `components/ChatDrawer.tsx` — Polish message bubbles, add message timestamps and read receipts
- `components/MemoryBoard.tsx` — Refine card layout, add date formatting and mood icon per memory
- `components/CoupleDashboard.tsx` — Integrate new modules in dashboard without changing auth logic
- `package.json` — No dependency changes; enhancements use existing Tailwind, Motion, Lucide

[Functions]
- `Page` (app/page.tsx) — Wrap with new animated sections component
- `CoupleDashboard` (components/CoupleDashboard.tsx) — Add modules for streak counter and achievements below quiz list
- `QuizList` (components/QuizList.tsx) — Update card styling through new `QuizCard` component
- `ChatDrawer` (components/ChatDrawer.tsx) — Add timestamp rendering and sender label
- `MemoryBoard` (components/MemoryBoard.tsx) — Improve date display, add icon, and grid hover effects

[Classes]
- New components: `QuizCard`, `LandingSections`, `StreakCounter`, `AchievementsPanel`

[Testing]
Playwright tests will be extended to cover new UI states:
- Verify streak counter appears with correct fallback text when missing data
- Verify achievements panel renders empty state gracefully
- Verify polished landing page animations do not block initial interaction
- Verify Message timestamps in ChatDrawer are human-readable

[Implementation Order]
1. Add visual polish in globals.css: gradients, smooth transitions, custom scrollbar
2. Create `LandingSections.tsx` and integrate into `app/page.tsx`
3. Create `QuizCard.tsx` and update `QuizList.tsx` to use it
4. Create `StreakCounter.tsx` and `AchievementsPanel.tsx`, integrate into dashboard
5. Polish `ChatDrawer.tsx` and `MemoryBoard.tsx`
6. Run Playwright tests and capture before/after screenshots for comparison