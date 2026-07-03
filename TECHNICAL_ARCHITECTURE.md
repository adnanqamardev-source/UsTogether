# Technical Architecture Document — UsTogether

**Version:** 1.0  
**Date:** 2026-07-03  
**Status:** Active

---

## 1. Tech Stack

### Frontend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 14.2 | React framework | Built-in SSR, App Router, API routes, optimized bundling; zero-config deployment to Vercel |
| **React** | 18.2 | UI library | Mature ecosystem, large community, excellent TypeScript support |
| **TypeScript** | 6.0+ | Type safety | Catches errors at compile time; improves maintainability and developer experience |
| **Tailwind CSS** | 4.1 | Styling | Utility-first CSS; rapid UI development; small bundle size with purging |
| **Framer Motion** | 11.x | Animations | Declarative animations; smooth transitions for chat drawer, quiz cards |
| **Lucide React** | 0.553 | Icon library | Tree-shakeable, consistent design language, lightweight |

### Backend & Data

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Firebase Auth** | 11.0 | Authentication | Google OAuth out-of-the-box; handles session management securely |
| **Firebase Firestore** | 11.0 | Primary database | Real-time listeners, offline support, scalable NoSQL for couples data and messages |
| **Google GenAI SDK** | 2.3+ | AI quiz generation | Gemini 1.5 Flash for streaming quiz generation; low latency, high quality |
| **AI SDK (Vercel)** | 6.0+ | AI streaming framework | Unified interface for AI providers; built-in streaming and caching |

### Infrastructure & DevOps

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Vercel** | N/A | Hosting platform | Native Next.js deployment, edge functions, automatic CI/CD |
| **Firebase Hosting** | Optional | CDN fallback | Alternative hosting if needed |
| **Playwright** | 1.61 | E2E testing | Cross-browser testing, reliable, supports parallel execution |
| **Vitest** | 4.1+ | Unit testing | Fast, Vite-native, excellent TypeScript support, jsdom for DOM testing |

---

## 2. File & Folder Structure

```
ustogether/
├── app/
│   ├── (auth)/                 # Auth-related routes (login, callback)
│   │   └── ...
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # POST /api/chat (send message)
│   │   ├── generate-quiz/
│   │   │   └── route.ts        # POST /api/generate-quiz (AI quiz generation)
│   │   ├── generate-challenge/
│   │   │   └── route.ts        # POST /api/generate-challenge (AI challenge generation)
│   │   └── ...
│   ├── globals.css             # Global styles + Tailwind imports
│   ├── layout.tsx              # Root layout (providers, fonts)
│   ├── page.tsx                # Landing page (server component)
│   └── providers.tsx           # Client-side providers (Auth, theme)
│
├── components/
│   ├── AuthProvider.tsx        # Firebase auth state provider
│   ├── AuthWrapper.tsx         # Auth guard (redirects if not logged in)
│   ├── CoupleDashboard.tsx     # Main dashboard (post-pairing)
│   ├── Dashboard.tsx           # Core dashboard layout
│   ├── LandingSections.tsx     # Landing page content sections
│   ├── ActiveSession.tsx       # Real-time quiz session component
│   ├── QuizCard.tsx            # Individual quiz question card
│   ├── QuizList.tsx            # Quiz selection list
│   ├── ChatPanel.tsx           # Chat message list
│   ├── ChatDrawer.tsx          # Chat drawer container
│   ├── StreakCounter.tsx       # Streak display component
│   ├── AchievementsPanel.tsx   # Achievements grid/list
│   └── MemoryBoard.tsx         # Memory board (post-MVP)
│
├── hooks/
│   ├── useFirestoreCollection.ts  # Generic Firestore real-time listener
│   ├── useFirestoreDocument.ts    # Single document real-time listener
│   └── use-mobile.ts              # Mobile viewport detection
│
├── lib/
│   ├── firebase.ts             # Firebase client initialization (reads env vars)
│   ├── firestore-helpers.ts    # Firestore utility functions
│   ├── firestore-errors.ts     # Typed Firestore error classes
│   ├── quiz-data.ts            # Quiz question templates
│   ├── streak.ts               # Streak calculation logic
│   ├── achievements.ts         # Achievement evaluation and awarding
│   ├── api-auth.ts             # API auth helper (verify Firebase ID tokens)
│   ├── input-validation.ts     # Zod/runtime validation schemas
│   ├── ratelimit.ts            # In-memory rate limiter
│   └── utils.ts                # General utilities
│
├── data/
│   ├── quiz-questions.json     # Static quiz question bank
│   └── quiz-questions-sample.json
│
├── tests/
│   ├── e2e/
│   │   ├── dashboard-and-sessions.spec.ts
│   │   └── ...
│   └── unit/
│       ├── streak.test.ts
│       ├── achievements.test.ts
│       └── ...
│
├── context7-mcp/               # Context7 MCP server config (local dev)
│
├── public/                     # Static assets
│   ├── images/
│   └── ...
│
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Template for environment variables
├── .gitignore
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest unit test configuration
├── playwright.config.ts        # Playwright E2E test configuration
├── package.json                # Dependencies and scripts
└── README.md
```

---

## 3. Database Schema (Firestore)

Firestore is a schemaless NoSQL database. The following defines the authoritative schema for all collections.

### 3.1 Collection: `users/{userId}`

User profile document. Created automatically on first Google OAuth login.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's Google email address |
| `displayName` | string | No | Display name shown in app |
| `photoURL` | string | No | Profile photo URL |
| `points` | number | Yes | Accumulated points from quizzes (default: 0) |
| `pairedCoupleId` | string | No | Reference to couple document if paired |
| `streak` | number | No | Current daily streak count (post-MVP) |
| `lastActiveDate` | string | No | ISO date string "YYYY-MM-DD" for streak tracking |
| `createdAt` | number | Yes | Unix timestamp (ms) of account creation |
| `updatedAt` | number | Yes | Unix timestamp (ms) of last profile update |

**Indexes:**
- `email` (single field, for uniqueness checks)
- `pairedCoupleId` (single field, for couple queries)

**Relationships:**
- One-to-one with `Couple.user1Id` or `Couple.user2Id`
- One-to-many with `ChatMessage.senderId`
- One-to-many with `Achievement.userId`

### 3.2 Collection: `couples/{coupleId}`

Couple document representing a paired relationship.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user1Id` | string | Yes | UID of first partner |
| `user2Id` | string | Yes | UID of second partner |
| `status` | enum | Yes | "pending" or "active" |
| `coupleName` | string | No | Shared name for the couple |
| `totalScore` | number | Yes | Combined quiz points (default: 0) |
| `createdAt` | number | Yes | Unix timestamp (ms) |
| `updatedAt` | number | Yes | Unix timestamp (ms) |

**Indexes:**
- `user1Id` (single field)
- `user2Id` (single field)

**Relationships:**
- One-to-one with `User.pairedCoupleId` (both users)
- One-to-many with `ChatMessage` under `couples/{coupleId}/messages/{messageId}`
- One-to-many with `Session` under `couples/{coupleId}/sessions/{sessionId}`

### 3.3 Subcollection: `couples/{coupleId}/messages/{messageId}`

Private chat messages between a couple.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `senderId` | string | Yes | UID of message sender |
| `text` | string | Yes | Message text (max 1000 chars) |
| `createdAt` | number | Yes | Unix timestamp (ms) |

**Indexes:**
- `couples/{coupleId}/messages`: Order by `createdAt` ascending

**Relationships:**
- Belongs to `Couple` (parent)
- Authored by `User`

### 3.4 Collection: `quizzes/{quizId}`

Quiz definition document (public quizzes created by users or AI-generated).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `creatorId` | string | Yes | UID of quiz creator |
| `title` | string | Yes | Quiz title |
| `description` | string | No | Quiz description |
| `questions` | array | Yes | Array of question objects `[{q: string, type: "text" | "multiple", options?: string[]}]` |
| `isPublic` | boolean | Yes | Whether quiz is publicly visible |
| `createdAt` | number | Yes | Unix timestamp (ms) |

**Indexes:**
- `creatorId` (single field)
- `isPublic` + `createdAt` (composite)

**Relationships:**
- Created by `User`
- Referenced by `Session` (via `quizId` in `session.state`)

### 3.5 Collection: `sessions/{sessionId}` (Active Game Sessions)

NOTE: The project is currently migrating sessions under `couples/{coupleId}/sessions/{sessionId}`. Both paths may exist during transition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coupleId` | string | Yes | Reference to couple |
| `type` | enum | Yes | "quiz" or "minigame" |
| `status` | enum | Yes | "waiting", "playing", or "finished" |
| `state` | object | Yes | JSON blob of game state (currentQuestionIndex, scores, answers) |
| `quizTitle` | string | No | Title of quiz being played |
| `createdAt` | number | Yes | Unix timestamp (ms) |
| `updatedAt` | number | Yes | Unix timestamp (ms) |

**Indexes:**
- `coupleId` + `createdAt` (composite, descending)
- `status` (single field)

**Relationships:**
- Belongs to `Couple`

### 3.6 Collection: `achievements/{achievementId}`

User achievements (earned badges).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | UID of user who earned it |
| `achievementId` | string | Yes | Reference to achievement definition |
| `title` | string | Yes | Achievement title |
| `description` | string | No | Achievement description |
| `icon` | string | No | Emoji icon string |
| `unlockedAt` | number | Yes | Unix timestamp (ms) of unlock |

**Indexes:**
- `userId` + `unlockedAt` (composite)

**Relationships:**
- Belongs to `User`

**Note:** Achievement definitions are currently hardcoded in `lib/achievements.ts` (not stored in Firestore).

### 3.7 Collection: `pairingCodes/{code}`

Pairing codes for linking users.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | UID of user who created the code |
| `createdAt` | number | Yes | Unix timestamp (ms) |
| `expiresAt` | number | Yes | Unix timestamp (ms) of expiration (typically 7 days) |

---

## 4. Environment & Configuration

### 4.1 Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase Client Configuration (public, safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Server-Side Only (never exposed to client)
GEMINI_API_KEY=AIzaSy...
```

### 4.2 Environment Variable Usage

- **`NEXT_PUBLIC_FIREBASE_*`** — Used in `lib/firebase.ts` for client-side Firebase initialization. These are safe to expose because Firebase API keys are project-scoped, not secret keys (they identify the project, not authenticate it).
- **`GEMINI_API_KEY`** — Used exclusively in API routes (`app/api/generate-quiz/route.ts`, `app/api/generate-challenge/route.ts`). This is a secret key and must never be exposed to the client.

### 4.3 Firebase Configuration

Firebase is initialized in `lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### 4.4 Firestore Security Rules

Firestore rules are defined in `firestore.rules`. Key principles:

- Users can only read/write their own user document
- Users can read/write couple documents where they are `user1Id` or `user2Id`
- Users can only access messages within their own couple document
- All rules use `request.auth.uid` to validate identity

### 4.5 Configuration Best Practices

1. **Never hardcode secrets** — always use environment variables
2. **Validate env vars at startup** — throw clear errors if missing
3. **Separate dev/prod configs** — use Vercel environment variables for production
4. **Rotate keys regularly** — especially `GEMINI_API_KEY`
5. **Set Firestore budget alerts** — monitor read/write costs

---

## 5. API & Integration Spec

### 5.1 Firebase Authentication

**Service:** Firebase Auth  
**Purpose:** User sign-in and session management

**Flow:**
1. User clicks "Sign In with Google"
2. `signInWithPopup(auth, googleProvider)` triggers OAuth flow
3. Firebase returns `UserCredential` with `user` object
4. App creates/updates user document in Firestore
5. Auth state persisted in localStorage via Firebase

**Key Methods:**
- `signInWithPopup(auth, provider)` — initiate OAuth
- `onAuthStateChanged(auth, callback)` — listen for auth changes
- `signOut(auth)` — log user out

### 5.2 Firestore Database

**Service:** Firebase Firestore  
**Purpose:** Real-time database for all app data

**Key Operations:**

- **Read (Real-time):**
  ```typescript
  const unsub = onSnapshot(doc(db, "users", userId), (doc) => { ... });
  ```
- **Write (Batch):**
  ```typescript
  const batch = writeBatch(db);
  batch.set(doc(db, "couples", coupleId), coupleData);
  batch.update(doc(db, "users", user1Id), { pairedCoupleId: coupleId });
  batch.update(doc(db, "users", user2Id), { pairedCoupleId: coupleId });
  await batch.commit();
  ```
- **Query (Collection):**
  ```typescript
  const q = query(collection(db, "users"), where("pairedCoupleId", "==", coupleId));
  ```

### 5.3 Google Gemini AI

**Service:** Google GenAI SDK (Gemini 1.5 Flash)  
**Purpose:** Generate relationship quizzes dynamically

**Endpoint:** Used server-side in API routes only

**Request:**
```typescript
import { genAI } from '@/lib/firebase'; // or direct SDK init

const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  .generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });
```

**Response:** Streamed JSON content matching quiz schema

**Rate Limiting:** Enforced at API route level (5s minimum between requests per user)

### 5.4 Vercel AI SDK (Optional Streaming)

**Service:** Vercel AI SDK (`ai` package)  
**Purpose:** Simplify streaming AI responses to client

**Usage:**
```typescript
// app/api/generate-quiz/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const result = streamText({
    model: google('gemini-1.5-flash'),
    prompt: req.body.prompt,
  });
  return result.toAIStreamResponse();
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Method

- **Primary:** Google OAuth 2.0 via Firebase Auth
- **Provider:** Google only (no email/password in MVP)
- **Token:** Firebase ID token (JWT)
- **Session:** Firebase manages session persistence in IndexedDB/localStorage
- **Expiration:** 1 hour (auto-refreshed by Firebase SDK)

### 6.2 API Route Authentication

All `/api/*` routes verify Firebase ID tokens:

```typescript
// lib/api-auth.ts
import { auth } from '@/lib/firebase';
import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
```

Usage in routes:
```typescript
const userId = await getUserId(req);
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 6.3 Row-Level Security (Firestore Rules)

Brief overview (full rules in `firestore.rules`):

- Users can only read their own user document
- Users can update their own user document (limited fields)
- Users can read couple documents where they are a member
- Users can create sessions within their couple
- Users can read/write messages within their couple
- All access requires authenticated user

---

## 7. State Management

### 7.1 Client-Side State

- **React State:** Local component state for UI (chat input, form fields)
- **Custom Hooks:** `useFirestoreCollection`, `useFirestoreDocument` for real-time data
- **Context:** `AuthProvider` provides auth state globally

### 7.2 Server State

- **Firestore Real-Time Listeners:** Single source of truth
- **Optimistic UI:** Chat messages appear immediately before Firestore confirmation
- **Cache:** Firestore offline persistence enabled

### 7.3 URL State

- Next.js router for navigation (App Router)
- No URL state management library needed (simple routes)

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

- **Location:** `tests/unit/`
- **Coverage Target:** 80%
- **Key Modules:** `lib/streak.ts`, `lib/achievements.ts`, `lib/ratelimit.ts`, `lib/firestore-helpers.ts`
- **Run:** `npm run test:unit`

### 8.2 E2E Tests (Playwright)

- **Location:** `tests/e2e/`
- **Key Flows:** Login, pairing, chat, quiz session
- **Mocking:** Intercept Firebase and Gemini API calls
- **Run:** `npm run test:e2e`

### 8.3 Integration Tests

- **API Routes:** Test auth, validation, and rate limiting
- **Firestore Rules:** Use Firebase Emulator Suite for local rule testing

---

## 9. Deployment

### 9.1 Production Environment

- **Hosting:** Vercel (recommended) or self-hosted on Firebase Hosting
- **Domain:** Custom domain configured in Vercel
- **SSL:** Automatic via Vercel/Firebase
- **CI/CD:** Automatic on push to `main` branch

### 9.2 Environment Secrets

Configure in Vercel Dashboard:
- `NEXT_PUBLIC_FIREBASE_*` variables
- `GEMINI_API_KEY`

### 9.3 Database

- **Firestore:** Production database in Firebase project
- **Rules:** Deploy with `firebase deploy --only firestore:rules`
- **Indexes:** Deploy with `firebase deploy --only firestore:indexes`

---

## 10. Monitoring & Observability

- **Error Tracking:** Sentry (optional, post-MVP)
- **Analytics:** Firebase Analytics + custom events
- **Performance:** Vercel Analytics + Web Vitals
- **Logging:** Structured console logs in API routes; Cloud Logging for Firebase
- **Uptime:** Vercel monitoring

---

## 11. Scalability Considerations

1. **Firestore Reads:** Optimize queries; avoid `get()` in loops; use indexed queries
2. **AI Costs:** Cache quiz results; rate limit; use Flash model for speed
3. **Real-Time Listeners:** Consolidate listeners in `ActiveSession.tsx` to prevent re-render storms
4. **Bundle Size:** Code-split heavy components (`Dashboard`, `Firebase`); lazy-load non-critical components
5. **Concurrent Users:** Firestore scales automatically; Vercel edge functions handle load

---

## 12. Development Workflow

1. **Local Development:** `npm run dev` (Next.js dev server)
2. **Testing:** `npm run test:unit` and `npm run test:e2e`
3. **Linting:** `npm run lint`
4. **Build:** `npm run build` (production build)
5. **Deploy:** Automatic via Vercel on merge to main

### 12.1 Branching Strategy

- `main` — production branch
- `develop` — integration branch (optional)
- `feature/*` — feature branches
- `fix/*` — bug fix branches

---

## 13. Glossary

- **Server Component:** Next.js component that renders on the server (no client-side JS)
- **Client Component:** React component with `"use client"` directive; interactive on client
- **Optimistic UI:** UI updates immediately, then syncs with backend
- **Real-Time Listener:** Firestore `onSnapshot()` subscription that pushes updates
- **Batch Write:** Atomic group of Firestore writes (all succeed or all fail)
- **Edge Function:** Vercel/Cloudflare function running at CDN edge for low latency