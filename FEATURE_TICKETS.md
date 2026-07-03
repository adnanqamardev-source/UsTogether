# Feature Ticket List — UsTogether

**Version:** 1.0  
**Date:** 2026-07-03  
**Status:** Active  
**Source:** derived from PRD.md, TECHNICAL_ARCHITECTURE.md

---

## How to Use This Document

Each ticket below can be used directly as a prompt for an AI coding tool. Copy the **Ticket Prompt** section and paste it into your AI assistant to build that feature.

Tickets are ordered by **dependency** — build them in sequence for maximum velocity.

---

## Epic 0: Project Foundation & Infrastructure

### Ticket 0.1: Initialize Next.js Project with TypeScript and Tailwind

**Description:** Set up the base Next.js 14 project with App Router, TypeScript, and Tailwind CSS v4. Configure path aliases and project structure.

**Acceptance Criteria:**
- `npm run dev` starts without errors
- Page renders at `http://localhost:3000`
- TypeScript compiles without errors
- Tailwind classes work in components

**Dependencies:** None

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a senior Next.js developer. Initialize a new Next.js 14 project using App Router with TypeScript and Tailwind CSS v4. Configure tsconfig.json with a @ path alias pointing to the project root. Set up the basic folder structure: app/, components/, lib/, hooks/, data/, tests/. Create a test page that renders "Hello UsTogether" to verify the setup works. Provide the complete file contents for: package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, app/globals.css, app/layout.tsx, app/page.tsx.
```

---

### Ticket 0.2: Set Up Firebase Project and Client SDK

**Description:** Create Firebase project, enable Firestore and Auth, and initialize the Firebase client SDK in the Next.js app using environment variables.

**Acceptance Criteria:**
- Firebase project created with Firestore and Google Auth enabled
- `lib/firebase.ts` reads config from `NEXT_PUBLIC_FIREBASE_*` env vars
- App can connect to Firestore without errors
- `.env.example` file documents all required env vars

**Dependencies:** 0.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a Firebase specialist. I have a Next.js 14 project and need to integrate Firebase. Create the file lib/firebase.ts that initializes Firebase using the modular SDK (v11 compat). It should: 1) Read all config from process.env.NEXT_PUBLIC_FIREBASE_* (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId), 2) Initialize the app only once (use getApps() guard), 3) Export initialized instances: auth (getAuth), db (getFirestore), googleProvider (GoogleAuthProvider). Also create .env.example with placeholder values for all Firebase config keys. Show me the exact code for lib/firebase.ts and .env.example.
```

---

### Ticket 0.3: Set Up Vitest and Playwright Testing Infrastructure

**Description:** Configure Vitest for unit tests and Playwright for E2E tests. Create test directories and a sample passing test.

**Acceptance Criteria:**
- `npm run test:unit` runs and passes
- `npm run test:e2e` runs and passes (can be empty/mocked)
- `vitest.config.ts` exists with jsdom environment and @ path alias
- `playwright.config.ts` exists with baseURL http://localhost:3000

**Dependencies:** 0.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a QA engineer setting up test infrastructure for a Next.js 14 + TypeScript project. Create: 1) vitest.config.ts with jsdom environment, test globals enabled, @ path alias mapping to project root, and tests/unit/ + tests/e2e/ excluded from unit runs. 2) playwright.config.ts with webServer: 'npm run dev' on port 3000 and baseURL http://localhost:3000. 3) Create tests/unit/example.test.ts with a passing test "should pass". 4) Update package.json to add scripts: "test:unit": "vitest run" and "test:unit:watch": "vitest". Show all file contents.
```

---

## Epic 1: Authentication & User Profiles

### Ticket 1.1: Build AuthProvider Component

**Description:** Create a React context provider that listens to Firebase auth state changes and exposes the current user and loading state to the entire app.

**Acceptance Criteria:**
- `components/AuthProvider.tsx` wraps the app in `app/providers.tsx`
- `useAuth()` hook returns `{ user, loading, error }`
- On auth state change, provider re-renders with updated user
- Loading state is true until Firebase confirms auth state

**Dependencies:** 0.2

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React developer building a Firebase auth context for a Next.js 14 app. Create components/AuthProvider.tsx that: 1) Uses React.createContext() to create AuthContext, 2) On mount, calls onAuthStateChanged(auth, callback) from our lib/firebase.ts, 3) Exposes a useAuth() custom hook that returns { user: User | null, loading: boolean, error: Error | null }, 4) Shows a "Loading..." spinner while loading is true, 5) Optionally calls /api/auth/sync-profile on login to create/update the user document in Firestore. The provider should be marked "use client". Show the full component code.
```

---

### Ticket 1.2: Build AuthWrapper Component

**Description:** Create a wrapper component that redirects unauthenticated users to the landing page and shows the app only when authenticated.

**Acceptance Criteria:**
- Unauthenticated users see landing page (or are redirected)
- Authenticated users see the wrapped children
- No flash of protected content before auth check completes
- Works with nested routes in App Router

**Dependencies:** 1.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React developer. Create components/AuthWrapper.tsx for a Next.js 14 app with Firebase auth. This component: 1) Accepts children prop, 2) Uses the useAuth() hook from AuthProvider, 3) While loading, shows a minimal centered loading spinner, 4) If not authenticated (user === null and not loading), redirects to "/" (landing page) using useRouter from next/navigation, 5) If authenticated, renders the children. Mark as "use client". Show full code.
```

---

### Ticket 1.3: Create User Profile Document on First Login

**Description:** When a user logs in for the first time, create their user profile document in Firestore with default values.

**Acceptance Criteria:**
- First-time login creates a document at `/users/{uid}`
- Document contains: email, displayName, points: 0, createdAt, updatedAt
- Subsequent logins update `updatedAt` only
- No duplicate documents created

**Dependencies:** 1.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a Firebase and Next.js developer. I need an API route at app/api/auth/sync-profile/route.ts that syncs the current Firebase user to a Firestore user document. The route should: 1) Verify the Firebase ID token using getUserId from lib/api-auth.ts, 2) Get the current user from the token, 3) Check if a document exists at /users/{uid}, 4) If not, create it with: email (from token), displayName (from token.name), points: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), 5) If it exists, update only the updatedAt field and optionally displayName/photoURL if they changed, 6) Return { success: true } on completion. Show the full route.ts code.
```

---

### Ticket 1.4: Build Landing Page with Sign-In Button

**Description:** Create the public landing page with branding, value proposition, and a "Sign In with Google" button.

**Acceptance Criteria:**
- Landing page renders at `/` for unauthenticated users
- Shows app name, tagline, and 2-3 feature highlights
- "Sign In with Google" button triggers Firebase OAuth
- Responsive layout (mobile + desktop)
- Styled with Tailwind CSS

**Dependencies:** 0.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a UI/UX developer. Build a landing page for "UsTogether" — a relationship app for couples. The page should use Next.js 14 App Router (app/page.tsx). Include: 1) A header with the app logo (a "U" monogram in a gradient rose-to-indigo rounded square) and app name "UsTogether", 2) A hero section with headline "Strengthen Your Bond, Together" and subheadline "Chat, quiz, and grow with your partner in one place.", 3) Three feature cards with icons (Lucide icons): Chat, Quiz, Memory, 4) A "Sign In with Google" button that triggers signInWithPopup from Firebase Auth, 5) A footer with copyright. Use Tailwind CSS v4 with dark theme (bg: slate-950, text: slate-100, accent: indigo-500). Make it fully responsive. Show the complete page.tsx code.
```

---

## Epic 2: Partner Pairing

### Ticket 2.1: Build Pairing Code Generation

**Description:** Allow an authenticated, unpaired user to generate a unique pairing code that their partner can use to link accounts.

**Acceptance Criteria:**
- User can click "Invite Partner" to generate code
- Code is displayed with copy-to-clipboard button
- Code stored in Firestore with userId and expiration (7 days)
- Code auto-expires via Firestore TTL (or server cleanup)
- User can regenerate if code expires

**Dependencies:** 1.2

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a Firebase and Next.js developer. Build a pairing code generation flow for UsTogether. Create: 1) An API route POST /api/pairing/generate that: a) verifies Firebase ID token, b) generates a 6-character alphanumeric code, c) checks if code already exists in /pairingCodes/{code}, d) stores { userId: token.uid, createdAt: serverTimestamp(), expiresAt: Timestamp.fromDate(new Date(Date.now() + 7*24*60*60*1000)) }, e) returns { code, expiresAt }. 2) A client component PairingInvite that calls this API, displays the code, and has a copy button. Use Tailwind styling matching the existing dark theme. Show both files.
```

---

### Ticket 2.2: Build Pairing Code Acceptance Flow

**Description:** Allow a second user to enter a pairing code, which links both users into a couple document atomically.

**Acceptance Criteria:**
- User enters 6-character code
- System validates code exists and is not expired
- System creates couple document with user1Id and user2Id
- System updates both user profiles with pairedCoupleId
- All writes happen in a single Firestore batch
- On success, both users see the dashboard

**Dependencies:** 2.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a Firebase and Next.js developer. Build the pairing acceptance flow. Create: 1) An API route POST /api/pairing/accept that: a) verifies Firebase ID token (this is user B), b) takes { code } from request body, c) reads /pairingCodes/{code} and validates it exists and is not expired, d) creates a new document in /couples/{coupleId} with user1Id = code.userId, user2Id = token.uid, status: 'active', totalScore: 0, timestamps, e) in the same batch, updates both user documents (user1 and user2) setting pairedCoupleId to the new coupleId, f) deletes the pairing code document, g) commits the batch, h) returns { success: true, coupleId }. 2) A client component PairingJoin with a code input field and submit button. Handle errors (expired code, already paired, etc.). Show both files.
```

---

### Ticket 2.3: Build Onboarding / Pairing Screen

**Description:** Create the screen shown to authenticated users who are not yet paired, offering options to invite partner or join with code.

**Acceptance Criteria:**
- Users without pairedCoupleId see this screen after login
- Two options: "Invite" (shows code, copy button) and "Join" (shows input)
- Smooth toggle between modes
- Responsive layout
- Disabled states while pairing is in progress

**Dependencies:** 2.1, 2.2

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a UI/UX developer. Create a pairing onboarding screen for UsTogether. The screen should be a React client component (components/PairingScreen.tsx) that checks if the current user is already paired (useAuth + Firestore user doc listener). If not paired, show: 1) A centered card with app branding, 2) A tab toggle: "Invite Partner" / "Join Partner", 3) Invite tab: "Generate Code" button → calls /api/pairing/generate → shows code with copy button, 4) Join tab: 6-char input + "Join" button → calls /api/pairing/accept, 5) Loading and error states. Use Tailwind CSS matching the dark theme (bg: slate-900, card: slate-800, accent: indigo-500, text: slate-100). Show the full component code.
```

---

## Epic 3: Dashboard

### Ticket 3.1: Build Core Dashboard Layout

**Description:** Create the main dashboard shell that shows couple greeting, action buttons, and loads the rest of the app. This is the primary screen after pairing.

**Acceptance Criteria:**
- Shows both partners' names or avatars
- Displays current couple points total
- Navigation to: Start Quiz, Chat, Achievements
- Logout button in header
- Responsive for mobile and desktop

**Dependencies:** 2.3

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a UI/UX developer. Build the main dashboard for UsTogether. Create components/CoupleDashboard.tsx as a client component. Features: 1) Top bar with app logo, logout button, 2) Hero section greeting both partners (e.g., "Hi, Alex & Sam 💕"), 3) Stats row showing couple total score and streak (if available), 4) Quick-action cards: "Start a Quiz" (navigates to ActiveSession), "Open Chat" (opens ChatDrawer), "View Achievements" (opens AchievementsPanel), 5) Each card has Lucide icon, title, description. Style with Tailwind dark theme: bg slate-950, card bg slate-900 with border slate-800, accent indigo-500, text slate-100. Use Framer Motion for subtle hover animations. Show the full component code.
```

---

### Ticket 3.2: Build Chat Drawer Component

**Description:** Create a slide-in chat drawer that allows real-time messaging between partners using Firestore real-time listeners.

**Acceptance Criteria:**
- Drawer slides in from right when chat button is clicked
- Messages load from `couples/{coupleId}/messages` ordered by createdAt
- New messages appear in real-time via onSnapshot
- User can type and send messages (optimistic UI)
- Auto-scroll to bottom on new messages
- Empty state shown when no messages

**Dependencies:** 3.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React and Firebase developer. Build a real-time chat drawer for UsTogether. Create: 1) components/ChatDrawer.tsx: container that manages open/closed state, slides in from right with Framer Motion (animate={{ x: isOpen ? 0 : '100%' }}), backdrop blur, dark bg #1a1a2e with border. 2) components/ChatPanel.tsx: message list using onSnapshot to listen to /databases/{database}/documents/couples/{coupleId}/messages ordered by createdAt asc. Render each message with sender name, text (escaped via escapeHtml helper to prevent XSS), and timestamp. 3) Chat input at bottom: text field + send button. On send: addDoc to messages collection with senderId = current user uid, text = input value, createdAt = serverTimestamp(). Use optimistic UI (add message to local state immediately before server confirms). 4) Auto-scroll with react-virtuoso or a simple ref-based scroll. Show all 3 files (ChatDrawer, ChatPanel, and escapeHtml helper).
```

---

### Ticket 3.3: Integrate Streak Counter on Dashboard

**Description:** Display a couple's streak count (consecutive days both partners were active) on the dashboard.

**Acceptance Criteria:**
- Streak number displayed prominently on dashboard
- Updates in real-time when either partner completes an action
- Shows streak "flame" icon
- Falls back gracefully if streak is 0

**Dependencies:** 3.1

**Priority:** Nice-to-Have (defined in PRD)

**Ticket Prompt:**
```
Act as a React developer. Create components/StreakCounter.tsx that displays a couple's streak count. The component: 1) Accepts coupleId and streak count as props, 2) Shows a large flame emoji 🔥 and a big number (the streak count), 3) Has a label "Day Streak" below, 4) Uses Tailwind for styling (indigo accent, dark theme), 5) Animates the number with Framer Motion (scale up on mount). Also, in lib/streak.ts, write an updateStreak function that: a) takes userId and Firestore db, b) reads the user document, c) compares lastActiveDate to today (YYYY-MM-DD), d) if same day, does nothing, e) if yesterday, increments streak, f) if older, resets to 1, g) writes updated streak and lastActiveDate back to user doc. Export updateStreak. Show both files.
```

---

## Epic 4: Quizzes & AI

### Ticket 4.1: Build Quiz List Screen

**Description:** Create a screen showing available quizzes with a "Generate AI Quiz" button that triggers Gemini API.

**Acceptance Criteria:**
- Displays list of pre-defined quizzes from static data
- "Generate AI Quiz" button calls /api/generate-quiz
- Loading spinner while generating
- Error shown if generation fails
- User can select quiz to start session

**Dependencies:** 3.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React developer. Build a quiz list screen for UsTogether. Create components/QuizList.tsx (client component) that: 1) Lists quizzes from data/quiz-questions.json (import as const quizzes), 2) Each quiz shows title, description, category, 3) Has a prominent "✨ Generate AI Quiz" button that calls POST /api/generate-quiz with { prompt } in body, 4) While loading, shows skeleton cards, 5) On success, shows the new quiz in the list, 6) On error, shows error message, 7) Each quiz is clickable → navigates to /session/{quizId} using useRouter. Style with Tailwind dark theme (bg slate-950, cards slate-900, button indigo-500, text slate-100). Show full component code.
```

---

### Ticket 4.2: Build AI Quiz Generation API Route

**Description:** Create the server-side API route that calls Google Gemini to generate a relationship quiz with strict JSON output.

**Acceptance Criteria:**
- Accepts POST with `{ prompt?: string }`
- Calls Gemini 1.5 Flash with system prompt to generate quiz JSON
- Validates response against Zod schema (title, description, questions[])
- Returns generated quiz with id, title, description, questions
- Rate limits to 3 requests per 5 minutes per user
- API auth required

**Dependencies:** 0.2

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a backend developer. Create an API route POST /api/generate-quiz for a Next.js 14 app using Firebase Auth and Google GenAI SDK. The route should: 1) Verify Firebase ID token using getUserId(req), return 401 if missing, 2) Check rate limit (max 3 requests per 5 minutes per user) using checkRateLimit from lib/ratelimit.ts, return 429 if exceeded, 3) Build a prompt: "Generate a fun relationship quiz with exactly 5 multiple-choice questions..." (write a good prompt that forces JSON output), 4) Call Google Gemini 1.5 Flash (use @google/genai SDK with streaming), 5) Parse the JSON response, validate with Zod (title: string, description: string, questions: array of { q: string, type: 'multiple', options: string[] }), 6) Return the quiz object with a generated id. 7) Handle errors (AI timeout, invalid JSON) with appropriate status codes. Show the full route.ts code.
```

---

### Ticket 4.3: Build Active Quiz Session Component

**Description:** Create the interactive quiz session screen where both partners answer questions in real-time using Firestore for sync.

**Acceptance Criteria:**
- One question displayed at a time
- Both partners see the same question simultaneously via Firestore listener
- Answers submitted to session.state in Firestore
- Score updates in real-time
- Progress bar shows completion
- Session ends when all questions answered

**Dependencies:** 4.1, 4.2

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React and Firebase developer. Build components/ActiveSession.tsx, a real-time multiplayer quiz session. Requirements: 1) Receives sessionId and coupleId as params (use useParams from next/navigation), 2) On mount, creates a Firestore listener on /sessions/{sessionId}, 3) Displays current question from session.state.questions[session.state.currentQuestionIndex], 4) For multiple-choice questions, renders buttons for each option, 5) On answer click, updates session.state.answers with { userId, answer, timestamp } and increments session.state.scores[userId], 6) Shows both partners' scores in real-time as they answer, 7) When all questions answered, shows results screen with winner celebration and "Play Again" button, 8) Uses optimistic UI for answer selection (disable buttons immediately), 9) Shows loading skeleton while session data loads. Style with Tailwind dark theme and Framer Motion for transitions. Show the full component code.
```

---

## Epic 5: Achievements & Gamification

### Ticket 5.1: Build Achievements Panel Component

**Description:** Create a component to display earned and locked achievements for a user.

**Acceptance Criteria:**
- Grid layout of achievement badges
- Earned achievements shown with icon and unlock date
- Locked achievements shown grayed out with hint
- Pulls achievements from Firestore `achievements` collection
- Includes both participation and streak achievements

**Dependencies:** 3.1

**Priority:** Nice-to-Have (post-MVP, but can be built if time permits)

**Ticket Prompt:**
```
Act as a React developer. Build components/AchievementsPanel.tsx for UsTogether. The component: 1) Takes userId and coupleId as props, 2) Queries Firestore /achievements subcollection filtered by userId, 3) Renders a grid of achievement cards. Achievement definitions are imported from lib/achievements.ts (array of { id, title, description, icon, category }). 4) For each definition, check if user has earned it (exists in Firestore results). 5) Earned achievements: full color, show icon large, show unlocked date. 6) Locked achievements: grayscale, show title only with opacity-50. 7) Include a "progress bar" for streak achievements (e.g., "7 days / 7"). Style: dark theme, card bg slate-900, border slate-800, accent colors by category (streak: orange, participation: blue, milestone: purple). Show full component code.
```

---

### Ticket 5.2: Implement Achievement Awarding Logic

**Description:** Write the server-side logic to check and award achievements when users complete actions (finish quiz, reach streak milestones).

**Acceptance Criteria:**
- After quiz completion, checks and awards relevant achievements
- Prevents duplicate awarding (same achievement per user)
- Writes new achievement documents to Firestore
- Logs success/failure for debugging

**Dependencies:** 5.1

**Priority:** Nice-to-Have

**Ticket Prompt:**
```
Act as a Firebase developer. Write lib/achievements.ts with two main functions for UsTogether.

getEligibleAchievements(userId: string, context: AchievementContext): AchievementDefinition[]
- Takes userId and context (e.g., { type: 'quiz_complete', score?: number, streak?: number })
- Reads user profile from /users/{userId}
- Reads user's existing achievements from /achievements
- Returns array of achievement definitions the user qualifies for but hasn't earned yet
- Achievement rules: "First Quiz" (any quiz complete), "Perfect Score" (score === 100), "Week Warrior" (streak >= 7), "Social Butterfly" (sent 100+ messages)

checkAndAwardAchievements(userId: string, context: AchievementContext): Promise<Achievement[]>
- Calls getEligibleAchievements
- For each eligible achievement, creates a document in /achievements/{achievementId}_{timestamp} with fields: userId, achievementId, title, description, icon, unlockedAt: serverTimestamp()
- Returns array of newly awarded achievements

Use AchievementDefinition and AchievementContext types from global.d.ts. Import db from lib/firebase. Use serverTimestamp() for timestamps. Show the full lib/achievements.ts code.
```

---

## Epic 6: Chat Enhancements (Post-MVP)

### Ticket 6.1: Add Message History Persistence & UI Polish

**Description:** Enhance the chat UI with message bubbles, avatars, timestamps, and hover actions. Ensure history loads correctly on app open.

**Acceptance Criteria:**
- Message bubbles: right-aligned for sender, left for receiver
- Sender avatar and name shown above message
- Timestamp shown on hover or below message
- Messages grouped by date with divider
- Smooth scroll to newest message on open

**Dependencies:** 3.2

**Priority:** Nice-to-Have

**Ticket Prompt:**
```
Act as a UI/UX developer. Enhance the existing ChatPanel.tsx in UsTogether. Update the message rendering: 1) Each message is in a rounded-2xl bubble — sender's messages on right (bg indigo-600), partner's on left (bg slate-800), 2) Show sender name and small avatar (first letter of displayName in colored circle) above each group of messages, 3) Show timestamp (format as "10:42 AM") on hover below message, 4) If message is new (created in last 5 minutes), show a subtle "NEW" badge, 5) Add visual divider between different dates, 6) Ensure message list scrolls to bottom smoothly on initial load. Keep existing escapeHtml XSS protection. Style with Tailwind dark theme. Show the updated ChatPanel.tsx message rendering code (you don't need to show the full file, just the relevant parts).
```

---

### Ticket 6.2: Add Typing Indicators

**Description:** Show "Partner is typing..." indicator when the other person is composing a message.

**Acceptance Criteria:**
- Typing indicator appears when partner has an active input
- Clears after 3 seconds of inactivity
- Does not flicker or show for self
- Uses a lightweight Firestore document for state

**Dependencies:** 6.1

**Priority:** Nice-to-Have

**Ticket Prompt:**
```
Act as a Firebase and React developer. Add typing indicators to UsTogether chat. Approach: 1) In Firestore, create a document at /couples/{coupleId}/typing/{userId} with { isTyping: boolean, updatedAt: timestamp }. 2) In ChatPanel.tsx, on input focus, set isTyping: true via setDoc with merge. On blur or after 3s of no typing, set isTyping: false. 3) Listen to partner's typing document with onSnapshot. When partner.isTyping === true, show a "Partner is typing..." bubble at the bottom of the message list. 4) Use useEffect cleanup to clear typing on unmount. 5) Debounce the typing updates (only write to Firestore every 1s max). Show the relevant code snippets.
```

---

## Epic 7: Memory Board (Post-MVP)

### Ticket 7.1: Design Memory Board Data Model

**Description:** Define the Firestore schema and API for the memory board (shared photos and milestones). No UI implementation yet.

**Acceptance Criteria:**
- Document memory collection schema (photos vs milestones)
- Define required and optional fields
- Write Firestore rules for memory access
- Document in TECHNICAL_ARCHITECTURE.md

**Dependencies:** 2.2

**Priority:** Nice-to-Have

**Ticket Prompt:**
```
Act as a data architect. Design the memory board data model for UsTogether (a relationship app). Define two subcollections under /couples/{coupleId}: 1) /milestones/{milestoneId}: fields = title, description, date (ISO string or timestamp), category (anniversary, trip, achievement, etc.), createdBy, createdAt. 2) /photos/{photoId}: fields = url (Firebase Storage URL), caption, uploadedBy, createdAt, tags[]. Also write the corresponding Firestore security rules for both subcollections (only couple members can read/write). Update TECHNICAL_ARCHITECTURE.md section 3.3 with the new subcollections. Show the updated schema table and security rules.
```

---

### Ticket 7.2: Build Memory Board UI

**Description:** Build the visual memory board showing photo gallery and milestone timeline for a couple.

**Acceptance Criteria:**
- Grid layout for photos (masonry or uniform)
- Timeline layout for milestones
- Upload photo button (triggers Firebase Storage upload)
- Add milestone button with form
- Responsive layout (mobile: stacked, desktop: grid)

**Dependencies:** 7.1

**Priority:** Nice-to-Have

**Ticket Prompt:**
```
Act as a UI/UX developer. Build the memory board screen for UsTogether. Create components/MemoryBoard.tsx (client component) with two tabs: "Photos" and "Milestones". Photos tab: 1) Mosaic grid of photos from /couples/{coupleId}/photos (query ordered by createdAt desc), 2) Upload button at top → opens file picker → uploads to Firebase Storage → saves metadata to /photos, 3) Click photo to enlarge (simple lightbox). Milestones tab: 1) Vertical timeline with alternating left/right cards, 2) "Add Milestone" button with form (title, description, date), 3) Saves to /milestones. Style with Tailwind dark theme (bg slate-950, cards slate-800, accent indigo-500). Use Framer Motion for scroll animations. Show full component code.
```

---

## Epic 8: Polish & Launch Readiness

### Ticket 8.1: Add Loading Skeleton States

**Description:** Add placeholder skeleton components for all major data-fetching screens to improve perceived performance.

**Acceptance Criteria:**
- Skeleton for ChatPanel (3-5 message lines)
- Skeleton for QuizCard (question text + answer buttons)
- Skeleton for Dashboard stats
- Skeleton for AchievementsPanel
- All skeletons use Tailwind animate-pulse

**Dependencies:** 3.1, 3.2, 4.3, 5.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a UI developer. Add loading skeleton components to UsTogether. Create: 1) components/QuizCardSkeleton.tsx (already partially exists — complete it with pulsing question text and 4 option buttons), 2) components/ChatPanelSkeleton.tsx (3-5 message lines with varying widths), 3) components/DashboardSkeleton.tsx (greeting placeholder, 3 stat cards, 3 action cards), 4) components/AchievementsPanelSkeleton.tsx (6 achievement cards in grid). Use Tailwind animate-pulse with bg-slate-800 rounded. All components should be "use client". Show all 4 files.
```

---

### Ticket 8.2: Add Error Boundaries and Global Error Handling

**Description:** Wrap the app in error boundaries to gracefully handle runtime errors without crashing the entire UI.

**Acceptance Criteria:**
- Root error boundary catches unhandled errors
- Shows user-friendly error message with "Try Again" button
- Logs error details to console for debugging
- Boundary around ActiveSession to isolate quiz failures

**Dependencies:** 3.1

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a React developer. Add error boundaries to UsTogether. Create: 1) components/ErrorBoundary.tsx — a class component (since error boundaries must be class components in React 18) that catches errors in its children tree, displays: "Something went wrong 😢" message, error description, and a "Try Again" button that calls resetErrorState. Log the error to console.error. 2) Wrap the main app content in app/providers.tsx with ErrorBoundary. 3) Optionally wrap ActiveSession.tsx in its own ErrorBoundary so chat failures don't break quiz. Show all relevant code.
```

---

### Ticket 8.3: Optimize Performance and Bundle Size

**Description:** Implement code splitting, dynamic imports, and Firestore listener optimizations to improve load times and reduce costs.

**Acceptance Criteria:**
- Dashboard loads in under 2 seconds on 3G
- Firestore listener count is minimized (one per data type)
- AI route uses streaming (Vercel AI SDK) instead of waiting for full response
- No unnecessary re-renders in ActiveSession

**Dependencies:** All previous tickets

**Priority:** Must-Have

**Ticket Prompt:**
```
Act as a performance optimization specialist for Next.js. Audit UsTogether and implement these optimizations: 1) In app/page.tsx, wrap components/LandingSections with dynamic(() => import('@/components/LandingSections'), { ssr: false }) to defer client-side loading. 2) In components/CoupleDashboard.tsx, ensure only one onSnapshot listener is active for each data type (user, couple, messages). Consolidate multiple listeners into a single useEffect. 3) Verify that the AI quiz route app/api/generate-quiz/route.ts uses streamText from 'ai' SDK for streaming responses. Show me the optimized code for each file.
```

---

## Ticket Dependency Map (Visual)

```
0.1 (Project Setup)
 └── 0.2 (Firebase)
      └── 0.3 (Testing)
           └── 1.1 (AuthProvider)
                └── 1.2 (AuthWrapper)
                     └── 1.3 (User Profile Sync)
                          └── 1.4 (Landing Page)
                               └── 2.1 (Pairing Generate)
                                    └── 2.2 (Pairing Accept)
                                         └── 2.3 (Onboarding Screen)
                                              └── 3.1 (Dashboard)
                                                   ├── 3.2 (Chat Drawer)
                                                   │    └── 6.1 (Chat Polish)
                                                   │         └── 6.2 (Typing)
                                                   ├── 3.3 (Streak)
                                                   │    └── 5.2 (Achievements Logic)
                                                   │         └── 5.1 (Achievements UI)
                                                   └── 4.1 (Quiz List)
                                                        └── 4.2 (AI Quiz API)
                                                             └── 4.3 (Active Session)
                                                                  └── 7.1 (Memory Model)
                                                                       └── 7.2 (Memory UI)
                                                                            └── 8.x (Polish)
```

---

## Quick-Start: First 3 Tickets

If you're new to the codebase, build these tickets in order to get a minimal working app:

1. **Ticket 0.1** — Set up Next.js + TypeScript + Tailwind
2. **Ticket 0.2** — Set up Firebase client SDK
3. **Ticket 1.4** — Build landing page with Sign-In button

After these three, you'll have a running app that you can open in a browser and see the landing page with a working Google sign-in button.

---

## Notes

- All tickets assume the codebase pattern established in the first tickets
- API routes follow the auth + validation + rate limit pattern
- Components use TypeScript, Tailwind, and Framer Motion
- Firestore operations use the modular SDK (v11+)
- All dates/times use Unix timestamps (ms) unless otherwise specified
- The `escapeHtml` utility from SECURITY_AND_ACCESS.md should be used wherever user text is rendered