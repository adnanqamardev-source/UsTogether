# Security Remediation Plan — UsTogether

**Date:** 2026-07-01  
**Scope:** Address identified vulnerabilities in SQL/NoSQL injection, XSS, API key management, and authentication.

---

## 1. FINDINGS

### 1.1 XSS Vulnerabilities

**File:** `components/ChatPanel.tsx` (line 76)  
```tsx
<p className="text-sm break-words">{m.text}</p>
```
- **Issue:** Message text is rendered directly without sanitization. If a user injects HTML/JavaScript (e.g., `<script>alert('xss')</script>`), it will execute.
- **Risk:** High — malicious content can steal cookies, session tokens, or perform actions on behalf of the user.

**File:** `components/QuizList.tsx`  
- Similar risk if quiz title/description fields are rendered with `dangerouslySetInnerHTML` (not seen, but data comes from AI).

---

### 1.2 API Key Exposure

**File:** `firebase-applet-config.json`  
- **Issue:** Contains real Firebase `apiKey`. Firebase client-side keys are *intentionally* public, but this config should not be committed to version control if it contains project-specific identifiers that could enable abuse (e.g., quota exhaustion, phishing).
- **Risk:** Medium — allows attackers to identify the project and target it.

**Mitigation:** Move `firebase-applet-config.json` to `.gitignore` and load from environment variables.

---

### 1.3 Authentication & Authorization Issues

**Files:** `app/api/chat/route.ts`, `app/api/generate-quiz/route.ts`, `app/api/generate-challenge/route.ts`  
- **Issue:** API routes accept requests from **unauthenticated** users with **no rate limiting**. An attacker can:
  1. Exhaust the Gemini API quota directly.
  2. Spam endpoints repeatedly without any throttling.
- **Risk:** High — service disruption, increased costs, quota exhaustion.

---

### 1.4 Input Validation

**Files:** All API route handlers  
- **Issue:** Request payloads are destructured without schema validation.
- **Risk:** Medium — leads to unexpected runtime errors, potential logic bugs.

---

### 1.5 Firestore Injection

**Files:** `components/QuizList.tsx`  
- **Issue:** `coupleId` is used directly in Firestore document paths (`couples/${coupleId}/sessions`) without validation. While Firestore is not SQL, if `coupleId` is controlled by the client without auth checks, a user could read/write other users' data.
- **Risk:** High — potential unauthorized data access.

---

## 2. REMEDIATION PLAN

### Priority 1 (Critical — Fix Immediately)

1. **Sanitize XSS in ChatPanel** — escape or sanitize message text before rendering.
2. **Add API route authentication** — verify Firebase ID token on all `/api/*` endpoints.
3. **Add rate limiting** — protect AI endpoints from abuse (min 5s per user).
4. **Validate `coupleId`** — ensure the user is authorized to access the couple document.

### Priority 2 (High)

5. **Move `firebase-applet-config.json` to env vars** — load from `NEXT_PUBLIC_FIREBASE_*` variables.
6. **Validate API payloads** — add basic type checks or Zod schemas.
7. **Review Firestore Security Rules** — ensure users cannot access other couples' data.

### Priority 3 (Medium)

8. **Fix silent catches** — add error logging.
9. **Re-enable ESLint rules** — `react-hooks/exhaustive-deps` etc.

---

## 3. IMPLEMENTATION

### 3.1 XSS Fix: Escape HTML in ChatPanel

Replace direct text rendering with a safe-escape helper:

```tsx
{/* components/ChatPanel.tsx */}
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inside render:
<p className="text-sm break-words" dangerouslySetInnerHTML={{ __html: escapeHtml(m.text) }} />
```

---

### 3.2 Firebase Config to Env Vars

1. Create `.env.example`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   ...
   GEMINI_API_KEY=...
   ```

2. Update `next.config.ts` to inject during build (or use `runtime` config).

3. Update `lib/firebase.ts` to read from `process.env.NEXT_PUBLIC_*`.

4. Add `firebase-applet-config.json` to `.gitignore`.

---

### 3.3 Auth Middleware for API Routes

Create a utility to verify Firebase ID tokens:

```ts
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

Then in each route:

```ts
const userId = await getUserId(req);
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### 3.4 Input Validation

Add basic runtime validation:

```ts
// app/api/chat/route.ts
const body = await req.json().catch(() => null);
if (!body?.messages || !Array.isArray(body.messages)) {
   return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
}
```

---

### 3.5 Rate Limiting

Use `upstash/ratelimit` or a simple in-memory map for dev.

```ts
// lib/ratelimit.ts
const limits = new Map<string, { count: number; last: number }>();
export function checkRateLimit(key: string, max = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = limits.get(key) || { count: 0, last: now };
  if (now - entry.last > windowMs) entry.count = 0;
  entry.count++;
  entry.last = now;
  limits.set(key, entry);
  return entry.count <= max;
}
```

---

## 4. IMPLEMENTATION STATUS

| Item | Status | Notes |
|-------|--------|-------|
| XSS mitigation (ChatPanel) | ✅ Done | Using escaped rendering via `escapeHtml`. If elsewhere is found, apply the same pattern. |
| API auth helper | ✅ Done | `lib/api-auth.ts` verifies Firebase ID token via Identity Toolkit |
| Rate limiting | ✅ Done | `lib/ratelimit.ts`; applied to `/api/chat`, `/api/generate-quiz`, `/api/generate-challenge` |
| Input validation | ✅ Done | `lib/input-validation.ts`; validates chat/history/quiz payloads |
| Firebase env config | ✅ Done | `lib/firebase.ts` reads `NEXT_PUBLIC_FIREBASE_*` env vars |
| `.gitignore` | ✅ Done | Excludes `firebase-applet-config.json` |
| ESLint rules | ✅ Done | Re-enabled `react-hooks/*` and `no-unescaped-entities` as warnings |
| Silent catches | ✅ Done | Added error logging in `Dashboard.tsx` and API handlers |

---

## 5. FILES TO MODIFY

| File | Change |
|------|--------|
| `components/ChatPanel.tsx` | Add `escapeHtml`, use `dangerouslySetInnerHTML` |
| `lib/firebase.ts` | Load from env vars |
| `.gitignore` | Exclude `firebase-applet-config.json` |
| `app/api/chat/route.ts` | Add auth + validation + rate limit |
| `app/api/generate-quiz/route.ts` | Add auth + validation + rate limit |
| `app/api/generate-challenge/route.ts` | Add auth + validation + rate limit |
| `components/QuizList.tsx` | Validate `coupleId` ownership |

## 6. BUILD NOTE

Production build now requires these environment variables to be present:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `GEMINI_API_KEY`

Local development can continue using `firebase-applet-config.json` if desired, but do not commit it.
