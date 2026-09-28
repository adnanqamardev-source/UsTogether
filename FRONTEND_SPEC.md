# Frontend Specification Document — UsTogether

**Version:** 3.0
**Date:** 2026-09-28
**Status:** Active

> Canonical source for colors is `app/globals.css` (`@theme`). If this doc
> and `globals.css` disagree, `globals.css` wins.

---

## 1. Color Palette

### Primary Colors

| Name | Hex Code | Token | Usage |
|------|----------|-------|-------|
| **Lilac Ash** | `#bcabae` | `lilac-ash` | Primary accent, active states, CTAs, focus rings |
| **Onyx** | `#0f0f0f` | `onyx` / `canvas` | Page background |
| **Graphite** | `#2d2e2e` | `graphite` / `surface` | Card backgrounds, elevated surfaces |
| **Dim Grey** | `#716969` | `dim-grey` / `ink-muted` | Muted text, placeholders |
| **White** | `#fbfbfb` | `white` / `ink` | Primary text (overrides Tailwind `white`) |

### Semantic Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| **Success (emerald)** | `#10b981` | Success messages, completed states |
| **Warning (amber)** | `#f59e0b` | Warnings, streak indicators |
| **Error (rose)** | `#f43f5e` | Error messages, destructive actions |
| **Info (sky)** | `#0ea5e9` | Info messages, hints |

### Gradient Stops

| Gradient | Colors | Usage |
|----------|--------|-------|
| **Brand Gradient** | `from-[#bcabae] to-white` | Logo accents, hero highlights |
| **Card Hover** | `border-[#bcabae]/50` glow | Card hover states (subtle) |
| **Success Glow** | `from-emerald-500 to-teal-600` | Achievement unlock, quiz completion |

> Opacity modifiers on custom v4 colors need arbitrary-value syntax:
> `bg-[#bcabae]/30`, `text-[#716969]`. Utilities like `bg-lilac-ash/30` do
> not resolve. Never define a named `--spacing-*` scale in `@theme` — it
> silently redefines `max-w-sm/md/lg/xl/xs` to a few pixels.

---

## 2. Typography

### Font Families

| Font | Source | Usage |
|------|--------|-------|
| **Inter** | Google Fonts (loaded in layout.tsx) | Primary font for all UI text |
| **System Fallback** | `font-sans` | Tailwind default system stack |

**Note:** All fonts should be loaded via `next/font` in `app/layout.tsx` for optimal performance.

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Labels, captions, timestamps |
| `text-sm` | 14px | 20px | Secondary text, helper text, chat messages |
| `text-base` | 16px | 24px | Body text, input fields, buttons |
| `text-lg` | 18px | 28px | Subheadings, card titles |
| `text-xl` | 20px | 28px | Section headings |
| `text-2xl` | 24px | 32px | Page titles |
| `text-3xl` | 30px | 36px | Hero headline |
| `text-4xl` | 36px | 40px | Display text (app name, hero) |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| **Light** | `font-light` (300) | App name, large display text |
| **Normal** | `font-normal` (400) | Body text, buttons, inputs |
| **Medium** | `font-medium` (500) | Secondary headings, emphasis |
| **Semibold** | `font-semibold` (600) | Card titles, important labels |
| **Bold** | `font-bold` (700) | Primary headings, logo monogram |

### Text Colors (Dark Theme)

| Purpose | Class | Hex |
|---------|-------|-----|
| Primary text | `text-white` | `#fbfbfb` |
| Secondary text | `text-[#bcabae]` | `#bcabae` |
| Muted text | `text-[#716969]` | `#716969` |
| Heading text | `text-white` | `#fbfbfb` |
| Accent text | `text-lilac-ash` | `#bcabae` |
| Error text | `text-rose-400` | `#fb7185` |
| Success text | `text-emerald-400` | `#34d399` |

---

## 3. Component Styles

### 3.1 Buttons

**Primary Button (CTA):**

```tsx
className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-lilac-ash hover:bg-[#d4c8ca] text-white font-medium rounded-xl shadow-lg shadow-[#bcabae]/30 transition-all duration-200 hover:scale-105 active:scale-95"
```

- **States:** Default, hover (darker bg + scale), active (pressed), disabled (opacity-50, cursor-not-allowed)
- **Padding:** `px-6 py-3`
- **Border Radius:** `rounded-xl`
- **Shadow:** Soft colored shadow matching button color

**Secondary Button:**

```tsx
className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-graphite hover:bg-[#3a3b3b] text-white font-medium rounded-xl border border-white/10 transition-colors"
```

**Destructive Button:**

```tsx
className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-xl border border-rose-500/20 transition-colors"
```

**Icon Button:**

```tsx
className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-graphite hover:bg-[#3a3b3b] text-[#716969] hover:text-white transition-colors"
```

### 3.2 Input Fields

**Text Input:**

```tsx
className="w-full px-4 py-3 bg-graphite border border-white/10 rounded-xl text-white placeholder:text-[#716969] focus:outline-none focus:ring-2 focus:ring-[#bcabae] focus:border-transparent transition-all"
```

- **Background:** `bg-graphite` (recessed look)
- **Border:** `border-white/10` (subtle)
- **Focus Ring:** `focus:ring-2 focus:ring-[#bcabae]`
- **Placeholder:** `placeholder:text-[#716969]`
- **Padding:** `px-4 py-3`
- **Border Radius:** `rounded-xl`

**Textarea:**

Same as input, but with `resize-y` and `min-h-[120px]`.

**Input with Label:**

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-[#716969]">Label</label>
  <input className="..." />
</div>
```

**Input with Error:**

```tsx
<input className="... border-rose-500 focus:ring-rose-500" />
<p className="mt-1 text-sm text-rose-400">Error message</p>
```

### 3.3 Cards

**Standard Card:**

```tsx
<div className="bg-graphite border border-white/10 rounded-2xl p-6 shadow-xl">
  {/* Content */}
</div>
```

- **Background:** `bg-graphite`
- **Border:** `border-white/10` (1px)
- **Border Radius:** `rounded-2xl`
- **Padding:** `p-6`
- **Shadow:** `shadow-xl` (elevation)

**Interactive Card (Hover):**

```tsx
<div className="bg-graphite border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#bcabae]/50 hover:shadow-[#bcabae]/10 transition-all duration-300 cursor-pointer">
  {/* Content */}
</div>
```

- Adds hover border color and subtle glow
- Smooth transition on hover

**Glass Card (Chat Drawer):**

```tsx
<div className="bg-graphite/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
  {/* Content */}
</div>
```

- **Background:** Semi-transparent dark with blur
- **Border:** White with 10% opacity
- **Border Radius:** `rounded-3xl`

### 3.4 Modals

**Modal Overlay:**

```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  {/* Modal content */}
</div>
```

**Modal Container:**

```tsx
<div className="bg-graphite border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
  {/* Content */}
</div>
```

**Modal Header:**

```tsx
<div className="flex items-center justify-between mb-4">
  <h3 className="text-xl font-semibold text-white">Modal Title</h3>
  <button className="text-[#716969] hover:text-white">
    <X className="w-5 h-5" />
  </button>
</div>
```

### 3.5 Navigation

**Top Navigation Bar:**

```tsx
<nav className="flex justify-between items-center mb-12 relative z-10 gap-4 mt-6">
  {/* Logo */}
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-gradient-to-br from-[#bcabae] to-[#716969] rounded-xl flex items-center justify-center shadow-lg shadow-[#bcabae]/30">
      <span className="font-bold text-xl text-white">U</span>
    </div>
    <span className="text-2xl font-light tracking-tight">Us<span className="font-bold">Together</span></span>
  </div>

  {/* Nav Links */}
  <div className="flex items-center gap-4">
    <button className="text-[#716969] hover:text-white transition-colors">Features</button>
    <button className="px-4 py-2 bg-lilac-ash hover:bg-[#d4c8ca] text-white rounded-lg transition-colors">
      Sign In
    </button>
  </div>
</nav>
```

**Bottom Navigation (Mobile):**

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-graphite/90 backdrop-blur-lg border-t border-white/10 z-40">
  <div className="flex justify-around items-center max-w-lg mx-auto">
    <button className="flex flex-col items-center gap-1 p-3 text-[#bcabae]">
      <Home className="w-5 h-5" />
      <span className="text-xs">Home</span>
    </button>
    {/* More nav items */}
  </div>
</nav>
```

### 3.6 Loading States

**Spinner:**

```tsx
<div className="flex items-center justify-center">
  <div className="w-8 h-8 border-4 border-white/10 border-t-[#bcabae] rounded-full animate-spin"></div>
</div>
```

**Skeleton (Generic):**

```tsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-graphite rounded w-3/4"></div>
  <div className="h-4 bg-graphite rounded w-1/2"></div>
</div>
```

**Card Skeleton:**

```tsx
<div className="bg-graphite border border-white/10 rounded-2xl p-6 animate-pulse">
  <div className="h-48 bg-graphite rounded-xl mb-4"></div>
  <div className="h-6 bg-graphite rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-graphite rounded w-1/2"></div>
</div>
```

### 3.7 Badges & Tags

**Status Badge:**

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Active
</span>
```

**Achievement Badge:**

```tsx
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#bcabae]/10 text-[#bcabae] rounded-lg border border-[#bcabae]/20">
  <Trophy className="w-4 h-4" />
  <span className="text-sm font-medium">First Quiz</span>
</div>
```

---

## 4. Spacing & Layout Rules

### 4.1 Spacing System

UsTogether follows Tailwind's default spacing scale (multiples of 4px):

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Tight padding inside small components |
| `p-2` | 8px | Default gap between flex items |
| `p-3` | 12px | Padding in compact cards |
| `p-4` | 16px | Standard padding (inputs, buttons) |
| `p-6` | 24px | Card padding, section spacing |
| `p-8` | 32px | Large section padding |
| `p-12` | 48px | Hero section padding |

### 4.2 Layout Grid

**Container (Desktop):**

```tsx
<div className="max-w-6xl mx-auto px-6">
  {/* Content */}
</div>
```

- **Max Width:** `max-w-6xl` (1152px)
- **Padding:** `px-6` (24px horizontal)
- **Centered:** `mx-auto`

**Container (Mobile):**

```tsx
<div className="w-full px-4">
  {/* Content */}
</div>
```

- **Padding:** `px-4` (16px horizontal)

### 4.3 Grid Systems

**2-Column Grid (Cards):**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card />
  <Card />
</div>
```

**3-Column Grid (Achievements):**

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  <AchievementBadge />
</div>
```

**Masonry Grid (Photos):**

```tsx
<div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
  <img className="break-inside-avoid rounded-xl" />
</div>
```

### 4.4 Responsive Breakpoints

| Breakpoint | Screen Size | Usage |
|------------|-------------|-------|
| `sm` | 640px+ | Large phones, small tablets |
| `md` | 768px+ | Tablets, small laptops |
| `lg` | 1024px+ | Laptops, desktops |
| `xl` | 1280px+ | Large desktops |

### 4.5 Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| **Base** | `z-0` | Default content |
| **Nav** | `z-10` | Navigation bars |
| **Dropdown** | `z-20` | Dropdown menus |
| **Overlay** | `z-30` | Backdrops, modals |
| **Modal** | `z-40` | Modal dialogs |
| **Toast** | `z-50` | Notifications, toasts |

### 4.6 Animation Timing

| Duration | Class | Usage |
|----------|-------|-------|
| **Fast** | `duration-150` | Button hover, small transitions |
| **Normal** | `duration-200` | Input focus, standard transitions |
| **Slow** | `duration-300` | Modal appears, drawer slides |
| **Ease-out** | `ease-out` | Entrance animations |
| **Spring** | Framer Motion `type: "spring"` | Bouncy, playful interactions |

---

## 5. API & Integration Spec

### 5.1 Firebase Authentication

**Service:** Firebase Auth  
**Integration Type:** Client-side SDK  
**Purpose:** Google OAuth sign-in

**API Calls (Client):**

```typescript
// Sign in
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);

// Sign out
import { signOut } from 'firebase/auth';
await signOut(auth);

// Listen for auth state changes
import { onAuthStateChanged } from 'firebase/auth';
const unsub = onAuthStateChanged(auth, (user) => {
  console.log('User:', user);
});
```

**Expected Response:**

```typescript
// User object
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}
```

### 5.2 Firestore Database

**Service:** Firebase Firestore  
**Integration Type:** Client + Server  
**Purpose:** Real-time database

**Client API Calls:**

```typescript
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firestore';

// Real-time listener
const unsub = onSnapshot(
  query(collection(db, 'couples', coupleId, 'messages'), orderBy('createdAt', 'asc')),
  (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);

// Batch write
const batch = writeBatch(db);
batch.set(doc(db, 'couples', coupleId), coupleData);
batch.update(doc(db, 'users', userId), { pairedCoupleId: coupleId });
await batch.commit();
```

**Server API Calls (API Routes):**

```typescript
import { getFirestore } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const db = getFirestore(); // Admin SDK in API routes
await setDoc(doc(db, 'users', userId), { points: 10 }, { merge: true });
```

### 5.3 Google Gemini AI

**Service:** Google GenAI SDK  
**Integration Type:** Server-side only (API routes)  
**Purpose:** Generate relationship quizzes

**API Call (Server):**

```typescript
// app/api/generate-quiz/route.ts
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateQuiz(prompt: string) {
  const result = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

  let fullText = '';
  for await (const chunk of result.stream) {
    fullText += chunk.text();
  }
  return JSON.parse(fullText);
}
```

**Request:**

```json
{
  "prompt": "Generate a fun relationship quiz with 5 multiple-choice questions about communication styles..."
}
```

**Success Response (200):**

```json
{
  "id": "generated_abc123",
  "title": "How Well Do You Know Each Other?",
  "description": "Test your knowledge of your partner's preferences",
  "questions": [
    {
      "q": "What's your partner's favorite way to spend a Sunday?",
      "type": "multiple",
      "options": ["Sleeping in", "Outdoors", "Reading", "Gaming"]
    }
  ]
}
```

**Error Response (503):**

```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Quiz generation is temporarily unavailable"
}
```

### 5.4 Rate Limiting

**Service:** In-memory (MVP) → Upstash Redis (production)  
**Integration Type:** Server-side middleware  
**Purpose:** Prevent API abuse

**Usage:**

```typescript
import { checkRateLimit } from '@/lib/ratelimit';

// Check rate limit (max 3 requests per 5 minutes)
if (!checkRateLimit(`quiz:${userId}`, 3, 300000)) {
  return NextResponse.json(
    { error: 'RATE_LIMITED', message: 'Too many requests', retryAfter: 300 },
    { status: 429 }
  );
}
```

**Rate Limit Headers:**

```typescript
return NextResponse.json(data, {
  status: 200,
  headers: {
    'X-RateLimit-Limit': '3',
    'X-RateLimit-Remaining': '2',
    'X-RateLimit-Reset': new Date(Date.now() + 300000).toISOString(),
  },
});
```

### 5.5 Vercel AI SDK (Streaming)

**Service:** Vercel AI SDK  
**Integration Type:** Server-side API route  
**Purpose:** Stream AI responses to client

**API Route:**

```typescript
// app/api/generate-quiz/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const result = streamText({
    model: google('gemini-1.5-flash'),
    prompt: 'Generate a relationship quiz...',
    temperature: 0.7,
  });
  
  return result.toAIStreamResponse();
}
```

**Client Consumption:**

```typescript
// components/QuizList.tsx
const response = await fetch('/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  const text = decoder.decode(value);
  // Append to UI progressively
}
```

### 5.6 Firebase Storage (Post-MVP)

**Service:** Firebase Storage  
**Integration Type:** Client-side  
**Purpose:** Upload photos for memory board

**Upload Flow:**

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

async function uploadPhoto(file: File) {
  const storageRef = ref(storage, `couples/${coupleId}/photos/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
```

---

## 6. Component Library

UsTogether uses a custom component layer on top of Tailwind. All components are in the `components/` directory.

### 6.1 Core Components

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| **AuthProvider** | `components/providers/AuthProvider.tsx` | Firebase auth context with real-time user profile sync | ✅ Live |
| **AuthWrapper** | `components/auth/AuthWrapper.tsx` | Auth guard with dynamic Dashboard import, sign-in/sign-out UI | ✅ Live |
| **ErrorBoundary** | `components/shared/ErrorBoundary.tsx` | Catches React errors; auto-reloads once on `ChunkLoadError` (stale deploy chunks), otherwise "Try Again" + "Reload Page" | ✅ Live |
| **LandingSections** | `components/shared/LandingSections.tsx` | Landing page content sections | ✅ Live |
| **Button** | `components/ui/button.tsx` | `primary` / `secondary` / `destructive` variants (cva) | ✅ Live |
| **Input** | `components/ui/input.tsx` | Shared text input | ✅ Live |
| **Card** | `components/ui/card.tsx` | Standard card + hover variant | ✅ Live |
| **Badge** | `components/ui/badge.tsx` | Status badges | ✅ Live |
| **EmptyState** | `components/ui/empty-state.tsx` | Empty states | ✅ Live |
| **SectionHeader** | `components/layout/section-header.tsx` | Section headings | ✅ Live |

### 6.2 Feature Components

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| **Dashboard** | `components/features/couple/Dashboard.tsx` | Pre-pairing dashboard with pairing code display and partner code input | ✅ Live |
| **CoupleDashboard** | `components/features/couple/CoupleDashboard.tsx` | Main dashboard shell with navigation, widgets, mobile menu | ✅ Live |
| **ChatDrawer** | `components/features/chat/ChatDrawer.tsx` | Slide-in chat panel with typing indicators, read receipts, emoji picker, date grouping, sender avatars | ✅ Live |
| **QuizList** | `components/features/quiz/QuizList.tsx` | Quiz selection screen with AI generation trigger, live session display | ✅ Live |
| **ActiveSession** | `components/features/session/ActiveSession.tsx` | Real-time multiplayer quiz session with transaction-based answer sync and debounce | ✅ Live |
| **QuizCard** | `components/features/quiz/QuizCard.tsx` | Single quiz card with hover effects, delete, start actions | ✅ Live |
| **StreakCounter** | `components/features/couple/StreakCounter.tsx` | Streak display with animated flame icon and progress bar | ✅ Live |
| **AchievementsPanel** | `components/features/achievements/AchievementsPanel.tsx` | Achievement grid with expand/collapse | ✅ Live |
| **MemoryBoard** | `components/features/memories/MemoryBoard.tsx` | Quiz history display with AI-generated couple challenges | ✅ Live |
| **StatsPage** | `app/stats/page.tsx` | Dedicated stats page with activity heatmap and metrics | ✅ Live |
| **BottomNav** | `components/shared/BottomNav.tsx` | Mobile bottom nav with pill `layoutId` indicator (chat lives here — no separate FAB) | ✅ Live |

> `components/*.tsx` one-line re-exports point at the paths above for
> backwards compatibility. `ChatFAB` was removed (it duplicated BottomNav chat
> on mobile).

### 6.3 Skeleton Components

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| **QuizCardSkeleton** | `components/features/quiz/QuizCardSkeleton.tsx` | Loading state for quiz card | ✅ Live |
| **Skeletons** | `components/shared/Skeletons.tsx` | Shared skeleton components (ChatPanelSkeleton, DashboardSkeleton, AchievementsPanelSkeleton) | ✅ Live |
| **ChatPanelSkeleton** | `components/shared/Skeletons.tsx` | Loading state for chat | ✅ Live |
| **DashboardSkeleton** | `components/shared/Skeletons.tsx` | Loading state for dashboard | ✅ Live |
| **AchievementsPanelSkeleton** | `components/shared/Skeletons.tsx` | Loading state for achievements | ✅ Live |

---

## 7. Accessibility (A11y) Standards

### 7.1 Color Contrast

- **WCAG AA minimum:** 4.5:1 for normal text, 3:1 for large text
- Current palette meets WCAG AAA for most text (7:1+ contrast)
- Use `text-white` on `bg-onyx` (14:1 contrast ratio)

### 7.2 Keyboard Navigation

- All interactive elements must be focusable with `Tab` key
- Focus states visible: `focus:ring-2 focus:ring-[#bcabae] focus:outline-none`
- Modals trap focus (use `focus-trap` library if needed)
- Escape key closes modals and drawers

### 7.3 Screen Readers

- All images have `alt` text
- Icon-only buttons have `aria-label`
- Form inputs have `<label>` association
- Live regions for dynamic content (`aria-live="polite"`)
- Loading states announced: `aria-busy="true"`

### 7.4 Semantic HTML

- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<header>`, `<footer>` landmarks
- Use heading hierarchy (`h1` → `h2` → `h3`)
- Form inputs wrapped in `<form>` with ` onSubmit` handler

---

## 8. Animation Guidelines

### 8.1 Principles

- **Purposeful:** Animations guide attention, not distract
- **Subtle:** Keep durations under 300ms for UI feedback
- **Smooth:** Use `ease-out` for entrances, `ease-in` for exits
- **Respectful:** Honor `prefers-reduced-motion` media query

### 8.2 Common Animations

**Fade In:**

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Slide In (Drawer):**

```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
  Chat Drawer
</motion.div>
```

**Scale Up (Achievement Unlock):**

```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', bounce: 0.5 }}
>
  🏆
</motion.div>
```

**Hover Lift (Cards):**

```tsx
<motion.div
  whileHover={{ y: -4, transition: { duration: 0.2 } }}
>
  Card
</motion.div>
```

### 8.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Design Tokens (Tailwind v4 `@theme`)

There is no `tailwind.config.ts`. Tokens live in `app/globals.css`:

```css
@theme {
  --color-lilac-ash: #bcabae;
  --color-onyx: #0f0f0f;
  --color-graphite: #2d2e2e;
  --color-dim-grey: #716969;
  --color-white: #fbfbfb;

  --color-canvas: var(--color-onyx);
  --color-surface: var(--color-graphite);
  --color-ink: var(--color-white);
  --color-ink-soft: var(--color-lilac-ash);
  --color-ink-muted: var(--color-dim-grey);
  --color-accent: var(--color-lilac-ash);
}
```

Rules: opacity modifiers on custom colors need arbitrary-value syntax
(`bg-[#bcabae]/30`); never add a named `--spacing-*` scale (it collapses
`max-w-sm/md/lg/xl/xs`). Font stack: Inter via `next/font`, `--font-sans`
token.

### 9.2 Custom Animations

```typescript
// In tailwind.config.ts
extend: {
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'slide-up': {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
  animation: {
    'fade-in': 'fade-in 0.3s ease-out',
    'slide-up': 'slide-up 0.4s ease-out',
  },
}
```

---

## 10. Responsive Design Guidelines

### 10.1 Mobile-First Approach

- Design for mobile first (`default` styles)
- Enhance for tablet (`md:` prefix)
- Enhance for desktop (`lg:` prefix)

### 10.2 Key Breakpoints

| Device | Breakpoint | Layout Adjustments |
|--------|-----------|-------------------|
| **iPhone SE** | 375px | Single column, full-width cards |
| **iPhone 14 Pro** | 390px | Single column, slightly more padding |
| **iPad** | 768px | 2-column grid possible |
| **iPad Pro** | 1024px | 3-column grid, sidebar navigation |
| **Laptop** | 1280px | 4-column grid, max-width container |
| **Desktop** | 1536px+ | Max-width container, more whitespace |

### 10.3 Touch Targets

- **Minimum size:** 44x44px (Apple HIG, Material Design)
- **Spacing between buttons:** 8px minimum
- **Input fields:** 48px height on mobile

### 10.4 Safe Areas (Mobile)

```tsx
// For notched phones
<div className="pb-safe">
  {/* Content */}
</div>

// CSS
@supports (padding-top: env(safe-area-inset-top)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## 11. Dark Theme Enforcement

UsTogether is dark-only in the current version. Do not include light mode toggles until the feature is explicitly added.

**Background Hierarchy:**

```
Page Background: onyx (#0f0f0f)
  └── Cards/Panels: graphite (#2d2e2e)
       └── Inputs/Surfaces: graphite / #3a3b3b
            └── Borders: white/10
```

**Text Hierarchy:**

```
Headings: white
Body: white (#fbfbfb)
Secondary: lilac-ash (#bcabae)
Muted: dim-grey (#716969)
```

All colors must come from the §1 palette (onyx/graphite backgrounds, lilac-ash accents, dim-grey muted, white text) or the semantic set. `globals.css` is canonical.

---

## 12. Example Screens

### 12.1 Landing Page (Desktop)

```
┌────────────────────────────────────────┐
│ [U] UsTogether         Features  Sign In│
│                                        │
│      Strengthen Your Bond, Together    │
│   Chat, quiz, and grow with your       │
│         partner in one place.          │
│                                        │
│   ┌──────────┐ ┌──────────┐ ┌────────┐│
│   │ 💬 Chat  │ │ 🧠 Quiz  │ │ 📸 Mem ││
│   │ Real-time│ │ AI-powered│ │ Shared ││
│   └──────────┘ └──────────┘ └────────┘│
│                                        │
│          [ Sign In with Google ]       │
│                                        │
│         © 2026 UsTogether              │
└────────────────────────────────────────┘
```

### 12.2 Dashboard (Mobile)

```
┌──────────────────────┐
│ [U] UsTogether    [←] │
│                      │
│ Hi, Alex & Sam 💕    │
│ Total Score: 1,250   │
│ 🔥 7 Day Streak      │
│                      │
│ ┌──────────────────┐ │
│ │ 🧠 Start a Quiz  │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 💬 Open Chat     │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 🏆 Achievements  │ │
│ └──────────────────┘ │
└──────────────────────┘
```

### 12.3 Chat Drawer

```
┌──────────────────────────────┐
│ Chat                       [X]│
├──────────────────────────────┤
│ Alex                        │
│ 10:30 AM                     │
│ Hey, how was your day?       │
│                    Sam 10:32 │
│                   It was good!│
│                      ...     │
│                    NEW       │
├──────────────────────────────┤
│ [Type a message...     ] [➤] │
└──────────────────────────────┘
```

### 12.4 Quiz Session

```
┌──────────────────────────────┐
│ ← Back        Question 2/5   │
├──────────────────────────────┤
│                              │
│ What's your partner's        │
│ favorite way to spend a      │
│ Sunday?                      │
│                              │
│ ┌──────────────────────────┐ │
│ │ 😴 Sleeping in            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🌲 Outdoors               │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 📚 Reading               │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🎮 Gaming                 │ │
│ └──────────────────────────┘ │
│                              │
│ Score: Alex 2 - Sam 1       │
└──────────────────────────────┘
```

---

## 13. Component Naming Conventions

- **File names:** PascalCase for components (`ChatPanel.tsx`)
- **Default export:** each component file exports one default component
- **Named exports:** types and constants
- **Client components:** `"use client"` at top

**Example:**

```tsx
// components/ChatPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { Message } from '@/types';

interface ChatPanelProps {
  coupleId: string;
}

export default function ChatPanel({ coupleId }: ChatPanelProps) {
  // Component logic
}

export type { Message };
```

---

## 14. Code Style (Tailwind Ordering)

When writing Tailwind classes, follow this order for consistency:

1. **Layout:** `flex`, `grid`, `block`, `hidden`, `relative`, `absolute`
2. **Sizing:** `w-*`, `h-*`, `max-w-*`, `min-h-*`
3. **Spacing:** `p-*`, `m-*`, `gap-*`, `space-*`
4. **Typography:** `text-*`, `font-*`, `tracking-*`, `leading-*`
5. **Colors:** `bg-*`, `text-*`, `border-*`
6. **Borders:** `border`, `rounded-*`
7. **Effects:** `shadow-*`, `opacity-*`, `blur-*`
8. **Transitions:** `transition-*`, `duration-*`, `ease-*`
9. **Transforms:** `scale-*`, `rotate-*`, `translate-*`
10. **Interactivity:** `hover:*`, `focus:*`, `active:*`, `disabled:*`

**Example:**

```tsx
<button className="
  flex items-center justify-center
  w-full px-6 py-3
  bg-lilac-ash hover:bg-[#d4c8ca]
  text-white font-medium rounded-xl
  shadow-lg shadow-[#bcabae]/30
  transition-all duration-200
  hover:scale-105 active:scale-95
">
  Click Me
</button>
```

---

## 15. Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| iOS Safari | 14+ | ✅ Full support |
| Samsung Internet | 14+ | ✅ Full support |

**Notes:**
- Firebase Auth requires HTTPS in production
- Firestore offline persistence works in all modern browsers
- Framer Motion uses CSS transforms, widely supported
- Google OAuth popup may be blocked by some extensions (provide fallback)

---

## 16. Performance Budget

### 16.1 Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint (hero image/text) |
| **FID** | < 100ms | First Input Delay (button responsiveness) |
| **CLS** | < 0.1 | Cumulative Layout Shift (visual stability) |

### 16.2 Bundle Size Budget

| Resource | Budget | Notes |
|----------|--------|-------|
| **Initial JS** | < 200KB | Gzipped |
| **Initial CSS** | < 50KB | Gzipped |
| **Fonts** | < 100KB | Per font family |
| **Images** | < 100KB | Lazy load below-fold images |

### 16.3 Rendering Budget

- **First Paint:** < 1s on 3G
- **Time to Interactive:** < 3s on 3G
- **Route Transition:** < 200ms (client-side navigation)

---

## Appendix: Design Inspiration

- **Discord:** Dark theme with blur effects, rounded corners
- **Linear:** Subtle gradients, smooth animations
- **Stripe:** Clean typography, strategic use of color
- **Notion:** Minimalist UI, clear hierarchy

UsTogether should feel: **warm, intimate, modern, playful** — not corporate or generic.