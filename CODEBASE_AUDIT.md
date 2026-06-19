# Codebase Audit Report — UsTogether

**Date:** 2026-06-20  
**Scope:** Source code quality, architecture, security, and licensing  
**Project:** UsTogether — A couples connection app built with Next.js, Firebase, and Google AI

---

## 1. Executive Summary

The project is a well-structured Next.js 16 application using modern tooling. Overall code quality is solid, with good TypeScript discipline and a clean component architecture. Several items require attention around error handling, type safety, and security hardening.

| Area               | Status     | Notes                                                              |
|--------------------|------------|--------------------------------------------------------------------|
| Dependencies       | ✅ Good     | Modern, well-maintained packages                                   |
| TypeScript Config  | ✅ Good     | Strict mode enabled, proper module resolution                      |
| Linting            | ⚠️ Fair     | Flat config used; several React hook rules disabled                |
| Architecture       | ✅ Good     | Clean separation of concerns, API routes, components               |
| Error Handling     | ⚠️ Fair     | Some silent catches, missing validations                           |
| Security           | ⚠️ Fair     | No input validation; API keys handled via env vars                 |
| Testing            | ⚠️ Setup    | Playwright configured; no unit/integration tests visible           |
| Licensing          | ✅ Complete | MIT License added                                                  |

---

## 2. Technology Stack

| Category        | Technology                  | Version  |
|-----------------|----------------------------|----------|
| Framework       | Next.js                    | 16.2.6   |
| Language        | TypeScript                 | 6.0.3    |
| Styling         | Tailwind CSS               | 4.1.11   |
| Backend/SDK     | Firebase                   | 11.0.0   |
| AI              | Google Generative AI       | 2.3.0    |
| Animation       | Motion (Framer Motion)     | 12.23.24 |
| Icons           | Lucide React               | 0.553.0  |
| Testing         | Playwright                 | 1.61.0   |

---

## 3. Coding Practices Findings

### 3.1 ✅ Strengths

- **TypeScript strict mode** is enabled (`strict: true` in `tsconfig.json`)
- **Path aliases** configured (`@/*` → root) for cleaner imports
- **Flat ESLint config** (ESLint 9 style) with Next.js and Firebase security rules plugins
- **Component composition** is clean — `AuthWrapper`, `Dashboard`, `CoupleDashboard` are well separated
- **Dynamic imports** used for dashboard (SSR disabled for auth-gated content)
- **Firestore error handling utility** exists (`lib/firestore-errors.ts`)
- **Caching** applied to AI generation routes (`unstable_cache` with 1h/24h revalidation)

### 3.2 ⚠️ Issues & Recommendations

#### A. Silent Error Swallowing
**File:** `components/Dashboard.tsx` (line 31)  
```ts
try {
   setDoc(doc(db, 'pairingCodes', code), { ... }, { merge: true });
} catch(e) {}
```
**Issue:** Errors during pairing code creation are silently ignored.  
**Fix:** Handle or at least log the error:
```ts
} catch (e) {
   console.error("Failed to create pairing code:", e);
}
```

#### B. Unused Imports
**File:** `app/api/generate-challenge/route.ts` (lines 4–5)  
```ts
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
```
`streamText` is never used in the file. It is used in the GET handler, but its import appears at the top level. These imports are valid (used in GET), but ensure they are only imported where needed or confirm linter flags them appropriately.

#### C. Type Safety — `any` Usage
**File:** `components/AuthProvider.tsx` (line 14)  
```ts
dbUser: any | null;
```
**Issue:** Using `any` defeats TypeScript's type system.  
**Fix:** Define an interface for the Firestore user document:
```ts
interface FirestoreUser {
  email: string;
  points: number;
  displayName: string;
  pairedCoupleId?: string;
  createdAt: number;
  updatedAt: number;
}
// ...
const [dbUser, setDbUser] = useState<FirestoreUser | null>(null);
```

#### D. Duplicate User Creation Logic
**Files:** `components/AuthProvider.tsx` (lines 48–57) and `components/AuthWrapper.tsx` (lines 43–51)  
Both components contain nearly identical logic to create a Firestore user document if it doesn't exist.  
**Fix:** Extract to a shared utility function in `lib/firebase.ts` or a custom hook.

#### E. Client-Side Navigation via `window.location.reload`
**File:** `components/Dashboard.tsx` (line 104)  
```ts
window.location.reload();
```
**Issue:** Bypasses Next.js router and causes a full page reload.  
**Fix:** Use `router.refresh()` from `next/navigation` or manage state updates properly with Firestore listeners.

#### F. Missing Input Validation on API Routes
**Files:** `app/api/chat/route.ts`, `app/api/generate-quiz/route.ts`, `app/api/generate-challenge/route.ts`  
Request bodies are destructured without schema validation.  
**Fix:** Add Zod validation or at minimum type guards:
```ts
import { z } from 'zod';

const ChatSchema = z.object({
  messages: z.array(z.object({ role: z.string(), text: z.string(), timestamp: z.string().optional() })),
  coupleId: z.string().optional(),
});
```

#### G. Missing API Key Check in GET Handler
**File:** `app/api/generate-challenge/route.ts` (lines 76–86)  
The GET handler calls `createGoogleGenerativeAI` without first checking `process.env.GEMINI_API_KEY`, unlike the POST handler.  
**Fix:** Add the same guard:
```ts
if (!process.env.GEMINI_API_KEY) {
   return NextResponse.json({ error: "Missing API key." }, { status: 500 });
}
```

#### H. ESLint Rules Disabled
**File:** `eslint.config.js` (lines 16–21)  
Several React hook rules are disabled:
```ts
"react-hooks/exhaustive-deps": "off",
"react-hooks/purity": "off",
"react-hooks/immutability": "off",
"react-hooks/set-state-in-effect": "off",
```
**Issue:** Disabling these rules can hide real bugs.  
**Fix:** Re-enable rules and fix the underlying issues, or add comments explaining why each is disabled.

#### I. No Rate Limiting on API Routes
**Files:** All route handlers in `app/api/`  
**Issue:** API endpoints are open; a malicious user could exhaust the Gemini API quota.  
**Fix:** Implement rate limiting (e.g., using Upstash Ratelimit or Firebase App Check).

#### J. No Environment Variable Validation at Startup
**Issue:** If `GEMINI_API_KEY` or Firebase config is missing, errors only surface at runtime when an endpoint is hit.  
**Fix:** Add a startup check in `lib/firebase.ts` or a middleware:
```ts
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}
```

---

## 4. Security Observations

| Item                   | Status | Detail |
|------------------------|--------|--------|
| Firebase Config        | ✅ OK   | Stored in `lib/firebase.ts` (not committed or hardcoded) |
| API Keys               | ⚠️  | Referenced via `process.env` — confirm `.env` is in `.gitignore` |
| Firestore Rules        | ⚠️  | `firestore.rules` and `DRAFT_firestore.rules` exist — ensure rules enforce user ownership |
| Input Validation       | ❌ None | No Zod/Joi validation on API request bodies |
| CORS                    | ❌ None | No explicit CORS configuration (standard for Next.js API routes) |
| Content Security Policy | ❌ None | No CSP headers observed in `next.config.js` |

---

## 5. File Structure Overview

```
UsTogether/
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   ├── generate-challenge/route.ts
│   │   └── generate-quiz/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── AchievementsPanel.tsx
│   ├── ActiveSession.tsx
│   ├── AuthProvider.tsx
│   ├── AuthWrapper.tsx
│   ├── ChatDrawer.tsx
│   ├── ChatPanel.tsx
│   ├── CoupleDashboard.tsx
│   ├── Dashboard.tsx
│   ├── LandingSections.tsx
│   ├── MemoryBoard.tsx
│   ├── QuizCard.tsx
│   ├── QuizCardSkeleton.tsx
│   ├── QuizList.tsx
│   └── StreakCounter.tsx
├── lib/
│   ├── firebase.ts
│   ├── firestore-errors.ts
│   └── utils.ts
├── tests/
├── hooks/
├── LICENSE                   ← Added
├── CODEBASE_AUDIT.md         ← This file
├── package.json
├── tsconfig.json
├── eslint.config.js
├── firestore.rules
├── next.config.js
└── ...
```

---

## 6. Recommended Next Steps

1. **Add input validation** — Integrate Zod for all API route payloads.
2. **Fix error swallowing** — Remove empty `catch` blocks; add logging.
3. **Enable ESLint rules** — Re-enable `exhaustive-deps` and other React hook rules.
4. **Add `dbUser` interface** — Replace `any` types with a defined Firestore user schema.
5. **Consolidate auth logic** — Share user creation logic between `AuthProvider` and `AuthWrapper`.
6. **Add rate limiting** — Protect AI endpoints from abuse.
7. **Add start-up validation** — Fail fast on missing env vars.
8. **Add unit tests** — Currently only Playwright E2E tests are configured.
9. **Review Firestore Rules** — Ensure users can only read/write their own data.

---

## 7. License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

**Copyright (c) 2026 UsTogether**