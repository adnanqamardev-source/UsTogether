# Goals & Roadmap

## 🚀 Performance & Architecture Optimization (Critical)

* **Component Boundaries**: Refactor `app/page.tsx` from a client-side component into a Server Component; move authentication logic to an isolated `<AuthWrapper />`.
* **Code Splitting**: Implement `next/dynamic` for heavy dependencies (Firebase) and the `Dashboard` component to defer loading until authentication is complete.
* **Core Web Vitals**: Refactor AI routes (`/api/generate-quiz` and `/api/generate-challenge`) to leverage Vercel AI SDK streaming, reducing Time to First Byte (TTFB).
* **Data Fetching**: Consolidate `onSnapshot` listeners in `components/ActiveSession.tsx` to eliminate redundant re-renders and data fetching waterfalls.

## 🛠️ Feature Development & Debugging

### Quiz Functionality

* **Real-time Synchronization**: Debug `ActiveSession.tsx` to resolve state sync failures between partners during quiz sessions.
* **Data Persistence**: Ensure accurate point calculations are correctly written to and retrieved from Firestore.

### Chat System (UI/UX)

* **Visual Integration**: Refactor the chat window to match the dashboard's "UsTogether" aesthetic:
* **Container**: Dark, semi-transparent background (`#1a1a2e`) with `backdrop-filter: blur()`, rounded corners (16px–24px), and a subtle `1px` white-alpha border.
* **Typography**: Utilize off-white for headers and muted gray for input placeholders.
* **Input Field**: Use a recessed/embedded style with high contrast; use the primary brand accent (purple/pink) for the send icon.
* **Refinement**: Add soft drop shadows for elevation and ensure proper `z-index` layering.


* **Functional Upgrades**: Implement message history persistence, bubble UI, typing indicators, read receipts, and emoji support.

### Memory & Gallery

* **Database**: Establish `memories` and `gallery` collections in Firestore.
* **Client UI**: Build a functional interface for uploading, storing, and displaying shared couple photos and milestones.

### UI/UX Refinement

* **Homepage Redesign**: Develop a high-conversion hero section, integrate social proof (testimonials/stories), and modernize the overall color scheme and hierarchy.
* **Dashboard Polish**: Refine layout, navigation, and add loading states/animations to improve perceived performance.

---

## ✅ Completed Features

* Refactored `QuizList.tsx` and `ActiveSession.tsx` to use `couples/${coupleId}/sessions` pathing.
* Established secure Firestore rules for couple pairing.
* Stabilized User B connection permissions.
* Implemented Google OAuth authentication.
* Developed foundational real-time chat drawer and interactive quiz engine.
* Cleaned up error handling framework.

---

## 📋 Execution Roadmap (Priority Order)

1. **Resolve Performance Bottlenecks**: Fix component boundaries, stream AI responses, and optimize Firestore listeners.
2. **Debug Quiz Synchronization**: Ensure cross-device state consistency for questions and scores.
3. **Modernize Homepage**: Execute the visual overhaul for engagement.
4. **Polish Dashboard**: Finalize layout and navigation improvements.
5. **Implement Memory/Gallery**: Build core photo-sharing capabilities.
6. **Enhance Chat UI**: Integrate custom styling and advanced messaging features.
7. **Gamification**: Add statistics and leaderboards for couple progress.
8. **Mobile Optimization**: Finalize responsive design for tablet and mobile devices.

---

Which of these priority items would you like to tackle first in our next session?