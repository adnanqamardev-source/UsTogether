# Implementation Plan

Improve the visual polish and user experience of the UsTogether website by enhancing design consistency, adding visual richness to key pages, and refining micro-interactions across all components. The current app uses a dark glassmorphism theme with rose/indigo/purple gradients, but several areas feel sparse or under-designed.

[Types]
No new types or interfaces required; existing component props and TypeScript types remain unchanged. All improvements are presentational (Tailwind CSS classes and motion animations).

[Files]
Single sentence describing file modifications.

Detailed breakdown:
- **components/LandingSections.tsx** - Expand hero section: add animated stats counter, feature highlight cards, and a secondary CTA button
- **components/CoupleDashboard.tsx** - Add mobile hamburger menu, refine nav styling, improve card grid spacing
- **components/QuizCard.tsx** - Enhance hover effects, add gradient border animation, improve empty/loading states
- **components/QuizList.tsx** - Refine section headers, improve "Live Session" card design, add count badges
- **components/ActiveSession.tsx** - Improve progress indicator styling, refine answer reveal animations, better empty-state messaging
- **components/MemoryBoard.tsx** - Enhance memory card design with date formatting improvements and richer hover states
- **components/StreakCounter.tsx** - Add animated flame intensity, better gradient background, progress bar
- **components/AchievementsPanel.tsx** - Add trophy animation, expand list view, add "View All" affordance
- **components/ChatDrawer.tsx** - Refined message bubbles with gradient accents, improved timestamp styling, typing indicator
- **app/globals.css** - Add bounce-in and float animations, enhance scrollbar gradient, add global focus-visible ring utility
- **app/page.tsx** - Update footer with richer links and social icons

[Functions]
Single sentence describing function modifications.

Detailed breakdown:
- **LandingSections** - Add `AnimatedCounter` sub-component and `FeatureCard` sub-component; restructure JSX into multiple `<section>` elements with staggered motion.div wrappers
- **CoupleDashboard** - Add `useState` for mobile menu toggle; add `MobileMenu` sub-component; update nav rendering for mobile breakpoints
- **QuizCard** - Add `isHovering` state for tilt effect; restructure button styles to use consistent gradient utility classes
- **QuizList** - Extract `SectionHeader` sub-component; add `sessionsCount` and `quizzesCount` badges to headers
- **ActiveSession** - Refine `bothAnswered` logic UI to add celebration overlay; replace Force Next button with subtle ghost styling
- **MemoryBoard** - Add `formatDate` helper; replace static date string with `Intl.DateTimeFormat`
- **StreakCounter** - Add `useEffect` to pulse fire emoji on mount; increase container padding and add gradient border
- **AchievementsPanel** - Add `showAll` state; expand visible items from 3 to 5; add "View All" toggle button
- **ChatDrawer** - Add `isTyping` dummy state; animate new message entrance with `AnimatePresence`

[Classes]
No new classes or component classes; all changes are functional components with enhanced Tailwind class lists.

[Files]
Single sentence describing file modifications.

Detailed breakdown:
- **components/LandingSections.tsx** - Modify to include 3 new feature cards, 3 stat counters, and a secondary CTA
- **components/CoupleDashboard.tsx** - Add hamburger menu button and slide-in mobile nav overlay
- **components/QuizCard.tsx** - Update style props and add hover animation classes
- **components/QuizList.tsx** - Add section badges and refactor grid spacing
- **components/ActiveSession.tsx** - Add confetti-style animation on quiz finish
- **components/MemoryBoard.tsx** - Add richer card styling with gradient overlays
- **components/StreakCounter.tsx** - Add animated gradient border and emoji burst
- **components/AchievementsPanel.tsx** - Expand list interactivity and add trophy glow
- **components/ChatDrawer.tsx** - Upgrade message bubbles with gradient tails
- **app/globals.css** - Add 4 new keyframe animations and extend utility classes
- **app/page.tsx** - Update footer with nav links and copyright style

[Dependencies]
No new packages required. All changes use existing dependencies:
- `motion` (framer-motion) for additional animations
- `lucide-react` for additional icons (Menu, X, Trophy, Flame, etc.)
- `tailwindcss` v4 for arbitrary values and `@theme` config

[Testing]
Single sentence describing testing approach.

- No new test files needed
- Existing e2e tests in `tests/e2e/` should pass without modification as selectors are unchanged
- Manual verification: run `npm run dev`, navigate through landing → pairing → dashboard → quiz → finish flow, confirm mobile responsiveness at 375px and 768px breakpoints

[Implementation Order]
Single sentence describing the implementation sequence.

1. Global styles first (`app/globals.css`) so new animations/utilities are available to all components
2. Landing page enhancements (`components/LandingSections.tsx`, `app/page.tsx` footer)
3. Dashboard navigation improvements (`components/CoupleDashboard.tsx`)
4. Core UI components polish (`components/QuizCard.tsx`, `components/QuizList.tsx`)
5. Interactive components refinements (`components/ActiveSession.tsx`, `components/MemoryBoard.tsx`, `components/ChatDrawer.tsx`)
6. Widget components polish (`components/StreakCounter.tsx`, `components/AchievementsPanel.tsx`)
7. Final review and browser verification