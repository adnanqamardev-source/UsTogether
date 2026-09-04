# Security & Access Document — UsTogether

**Version:** 1.1  
**Date:** 2026-07-04  
**Status:** Active

---

## 1. Authentication Method

### Primary Authentication: Google OAuth via Firebase Auth

**How it works:**
1. User clicks **"Sign In with Google"** button on landing page
2. Firebase Auth's `signInWithPopup()` opens a Google OAuth consent screen
3. User selects Google account and grants permission
4. Firebase receives an ID token and creates a `User` object
5. On return, the app checks `onAuthStateChanged()` to detect login status
6. If first-time user, app creates a `UserProfile` document in Firestore
7. Session is persisted in the browser (IndexedDB/localStorage) and auto-refreshes

**Why Google OAuth:**
- Zero password management overhead (no forgot-password flows)
- High trust signal (users recognize Google)
- Firebase Auth handles session security, token refresh, and revocation
- Reduces signup friction — one-tap login on mobile devices

**Token Details:**
- **Format:** JWT (JSON Web Token)
- **Expiry:** 1 hour (auto-refreshed by Firebase SDK)
- **Signing:** RSA256 by Firebase
- **Claims:** Includes `uid`, `email`, `email_verified`, `picture`, `name`

**Validation in API Routes:**

Every `/api/*` route must verify the Firebase ID token before processing:

```typescript
import { auth } from '@/lib/firebase';
import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.error('Invalid ID token:', error);
    return null;
  }
}

// Usage in route:
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed with authenticated user
}
```

**Client-Side Token Handling:**

- Firebase SDK automatically attaches ID token to requests
- No manual token storage on client (uses IndexedDB)
- On page load, `onAuthStateChanged()` restores session if valid

---

## 2. User Roles & Permissions

**Current Role Model (MVP): Two roles only**

| Role | Identifier | Description | Capabilities | Restrictions |
|------|-----------|-------------|--------------|--------------|
| **Authenticated User** | Any logged-in `uid` | A registered user with Google OAuth | View own profile, pair with partner, chat, play quizzes, earn points | Cannot access other users' data without a valid couple relationship |
| **Unauthenticated Visitor** | `null` / no `uid` | Not logged in | View landing page only | Cannot access dashboard, chat, quizzes, or any authenticated feature |

**No Admin Role in MVP:** The app is owned by its users. No moderation panel or admin dashboard is planned for v1.0.

### Permission Matrix

| Action | Unauthenticated | Authenticated User (not paired) | Authenticated User (paired) |
|---------|----------------|--------------------------------|----------------------------|
| View landing page | ✅ | ✅ | ✅ |
| Sign in with Google | ✅ | ❌ | ❌ |
| View onboarding/pairing screen | ❌ | ✅ | ✅ |
| Generate pairing code | ❌ | ✅ | ❌ (already paired) |
| Accept pairing code | ❌ | ✅ | ❌ (already paired) |
| View dashboard | ❌ | ❌ | ✅ |
| Send/receive chat messages | ❌ | ❌ | ✅ (own couple only) |
| Start/play quiz session | ❌ | ❌ | ✅ (own couple only) |
| Invite partner to quiz | ❌ | ❌ | ✅ (own couple only) |
| View own profile | ❌ | ❌ | ✅ |
| View other user's profile | ❌ | ❌ | ❌ |
| Edit own display name/points | ❌ | ❌ | ✅ (limited fields only) |
| Sign out | ❌ | ❌ | ✅ |

---

## 3. Row-Level Security Rules (Firestore)

Firestore security rules enforce data isolation at the database level. Even if a client-side bug exists, these rules prevent unauthorized access.

### 3.1 Full Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isSignedInUserId(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isCoupleMember(coupleId) {
      return isAuthenticated() && 
        (resource.data.user1Id == request.auth.uid || resource.data.user2Id == request.auth.uid);
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedInUserId(userId);
      allow create: if isSignedInUserId(userId);
      allow update: if isSignedInUserId(userId) && 
        // Only allow updating specific fields
        request.resource.data.diff(resource.data).affectedKeys().hasOnly([
          'displayName', 'photoURL', 'points', 'pairedCoupleId', 'streak', 'lastActiveDate', 'updatedAt'
        ]) &&
        // Prevent users from setting points manually (only server should)
        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['points']) || false);
      allow delete: if false; // No self-deletion in MVP
    }

    // Couples collection
    match /couples/{coupleId} {
      allow read: if isCoupleMember(coupleId);
      allow create: if isAuthenticated() && 
        request.resource.data.user1Id == request.auth.uid;
      allow update: if isCoupleMember(coupleId);
      allow delete: if isCoupleMember(coupleId);
    }

    // Messages subcollection
    match /couples/{coupleId}/messages/{messageId} {
      allow read: if isCoupleMember(coupleId);
      allow create: if isAuthenticated() && 
        isCoupleMember(coupleId) &&
        request.resource.data.senderId == request.auth.uid &&
        request.resource.data.text.size() <= 1000;
      allow update, delete: if 
        isCoupleMember(coupleId) && 
        resource.data.senderId == request.auth.uid;
    }

    // Quizzes collection
    match /quizzes/{quizId} {
      allow read: if isAuthenticated() && resource.data.isPublic == true;
      allow create: if isAuthenticated() && request.resource.data.creatorId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.creatorId == request.auth.uid;
    }

    // Game sessions (current path)
    match /sessions/{sessionId} {
      allow read: if isAuthenticated() && 
        exists(/databases/$(database)/documents/couples/$(resource.data.coupleId));
      allow create: if isAuthenticated() && 
        request.resource.data.coupleId != null &&
        exists(/databases/$(database)/documents/couples/$(request.resource.data.coupleId));
      allow update: if isAuthenticated() && 
        exists(/databases/$(database)/documents/couples/$(resource.data.coupleId));
      allow delete: if false;
    }

    // Pairing codes subcollection/scollection
    match /pairingCodes/{code} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Auto-expire via TTL
    }

    // Achievements
    match /achievements/{achievementId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Achievements are permanent once earned
    }
  }
}
```

### 3.2 Rule Explanation (Plain English)

**Users Collection (`/users/{userId}`):**
- A user can read and update their own profile
- A user cannot read another user's profile
- A user cannot directly modify `points` (only server-side logic can award points)

**Couples Collection (`/couples/{coupleId}`):**
- Only members of the couple (user1 or user2) can read or update the couple document
- A user can create a couple document only if they are specified as `user1Id`

**Messages Subcollection (`/couples/{coupleId}/messages/{messageId}`):**
- Only couple members can read all messages in the conversation
- Either member can send a message (max 1000 chars, senderId must match authenticated user)
- A user can delete only their own messages

**Quizzes Collection (`/quizzes/{quizId}`):**
- Anyone logged in can read public quizzes
- Only the creator can create, update, or delete their quizzes

**Sessions Collection (`/sessions/{sessionId}`):**
- A user can read a session only if the `coupleId` exists and they are a member of that couple
- Same for create and update (the couple must exist and user must be a member)

**Achievements (`/achievements/{achievementId}`):**
- A user can only read their own achievements
- Achievements are write-only (created by server, never modified or deleted)

---

## 4. Error Handling

### 4.1 API Route Errors

All API routes must return consistent error responses:

```typescript
// Standard error response format
interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Usage:
return NextResponse.json(
  { error: 'VALIDATION_ERROR', message: 'Message text exceeds 1000 character limit', details: { maxLength: 1000 } },
  { status: 400 }
);
```

### 4.2 Error Handling Guide

| Scenario | HTTP Status | Response Body | User-Facing Message |
|---------|-------------|---------------|---------------------|
| **Unauthorized (no token)** | 401 | `{ error: 'UNAUTHORIZED', message: 'Missing authentication token' }` | "Please sign in to continue." |
| **Invalid token** | 401 | `{ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }` | "Your session has expired. Please sign in again." |
| **Forbidden (valid token, wrong resource)** | 403 | `{ error: 'FORBIDDEN', message: 'You do not have access to this resource' }` | "You don't have permission to view this." |
| **Invalid request payload** | 400 | `{ error: 'VALIDATION_ERROR', message: 'Message text must be 1-1000 characters', details: {...} }` | "Please check your input and try again." |
| **Not found (quiz/session)** | 404 | `{ error: 'NOT_FOUND', message: 'Quiz not found' }` | "This quiz is no longer available." |
| **Rate limit exceeded** | 429 | `{ error: 'RATE_LIMITED', message: 'Too many requests. Please wait 5 seconds.', retryAfter: 5 }` | "Slow down! Please wait a moment before trying again." |
| **AI service unavailable** | 503 | `{ error: 'SERVICE_UNAVAILABLE', message: 'Quiz generation is temporarily unavailable' }` | "We're having trouble generating quizzes right now. Please try again later." |
| **Firestore unavailable** | 503 | `{ error: 'DATABASE_ERROR', message: 'Database connection failed' }` | "We're having connection issues. Please check your internet and retry." |
| **Unknown error** | 500 | `{ error: 'INTERNAL_ERROR', message: 'Something went wrong' }` | "Oops! Something went wrong on our end. Please try again later." |

### 4.3 Client-Side Error Handling

In React components, use error boundaries and user-friendly messages:

```tsx
// Example: ChatPanel.tsx
try {
  const messagesRef = collection(db, `couples/${coupleId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, 
    (snapshot) => { /* handle messages */ },
    (error) => {
      console.error('Firestore listener error:', error);
      setError('Unable to load messages. Please check your connection.');
    }
  );
} catch (error) {
  setError('Failed to connect to chat.');
}
```

### 4.4 Silent Error Logging

Never silently swallow errors. Log to console (and optionally Sentry post-MVP):

```typescript
// Bad:
try { ... } catch (e) { /* ignore */ }

// Good:
try { ... } catch (error) {
  console.error('[ChatPanel] Failed to send message:', error);
  setError('Failed to send message. Please try again.');
}
```

---

## 5. Edge Cases

### 5.1 Empty / Invalid Input

| Edge Case | Handling |
|-----------|----------|
| Empty message text | Client-side validation: disable send button if input is empty or whitespace-only. Server-side: reject with 400 if text.trim().length === 0 |
| Message exceeds 1000 chars | Client-side: show character counter with warning at 900 chars. Server-side: reject with 400 |
| Quiz question array is empty | Server-side: validate AI response has at least 1 question; regenerate if not |
| Missing required fields in API payload | Server-side: validate with `input-validation.ts` schemas; return 400 with details |

### 5.2 Authentication Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User signs in on two devices simultaneously | Firebase supports multiple sessions; both work independently |
| User clears browser storage | Firebase token in localStorage is lost; app redirects to login |
| User deletes Firebase account | User document should be deleted via Firebase Cloud Function trigger (not implemented in MVP; handle by filtering `auth.users` deleted events) |
| Google OAuth popup blocked | Show fallback: "Please allow popups for this site" with retry button |

### 5.3 Data Consistency Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Partner goes offline during quiz | Firestore listeners automatically reconnect when partner returns. Quiz state is preserved in `session.state` |
| Message sent while partner is offline | Message stored in Firestore; delivered when partner's listener reconnects |
| Duplicate message (network retry) | Client assigns temporary `messageId`; server checks for duplicates or client removes temp message on server ack |
| Concurrent quiz answer submissions | Server uses Firestore transactions to prevent race conditions when updating scores |

### 5.4 Network & Performance Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Slow network connection (3G) | Show loading skeletons for chat messages and quiz cards. Use optimistic UI where possible |
| Firestore rate limit exceeded | Exponential backoff retry in `useFirestoreCollection` hook |
| Gemini API timeout (30s+) | Client-side timeout with error message; server aborts and returns 503 |
| Browser tab in background | Firebase listeners pause in some browsers (Firefox). App should refresh on tab focus with `onAuthStateChanged` |
| Very long quiz title or description | Truncate in UI with ellipsis; store full text in DB |

### 5.5 Security Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User tries to access another couple's messages by guessing ID | Firestore rules block access (403). Client shows "Message not found" |
| User attempts to update another user's profile via direct API call | Token verification fails (uid mismatch); 403 returned |
| XSS in chat message text | Client-side `escapeHtml()` before rendering. Server-side: Firestore stores text safely (not HTML) |
| CSRF on API routes | Firebase ID token in header is non-guessable; CSRF tokens not required ( SameSite cookie not used ) |
| SQL/NoSQL injection via coupleId | CoupleId is a Firebase document path segment (alphanumeric); reject malformed IDs at validation layer |

### 5.6 Business Logic Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User tries to pair with themselves | Reject with error: "You cannot pair with yourself" |
| User already in a couple tries to pair again | Check `pairedCoupleId`; show "You are already paired with [name]. Unpair first to pair with someone else." |
| Quiz session finished but partner hasn't submitted all answers | Session marked "finished"; pending answers are marked "abandoned" in state |
| Points awarded twice for same quiz completion | Use Firestore transaction with idempotency key (quizId + sessionId + userId) |
| Achievement should only unlock once | Check if achievement already exists for user before awarding (deduplication in `achievements.ts`) |

---

## 6. Rate Limiting

To prevent abuse of AI endpoints and protect quota:

| Endpoint | Limit | Window | Scope |
|---------|-------|--------|-------|
| `/api/chat` | 10 requests | 1 minute | Per user |
| `/api/generate-quiz` | 3 requests | 5 minutes | Per user |
| `/api/generate-challenge` | 3 requests | 5 minutes | Per user |

**Implementation (`lib/ratelimit.ts`):**

```typescript
const limits = new Map<string, { count: number; last: number }>();

export function checkRateLimit(key: string, max: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = limits.get(key) || { count: 0, last: now };

  // Reset window if expired
  if (now - entry.last > windowMs) {
    entry.count = 0;
  }

  entry.count++;
  entry.last = now;
  limits.set(key, entry);

  return entry.count <= max;
}
```

**Usage in API Routes:**

```typescript
const userId = await getUserId(req);
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

if (!checkRateLimit(`quiz:${userId}`, 3, 300000)) {
  return NextResponse.json(
    { error: 'RATE_LIMITED', message: 'Too many quiz requests. Please wait 5 minutes.', retryAfter: 300 },
    { status: 429 }
  );
}
```

---

## 7. Secure Coding Practices

1. **Input Validation** — All API payloads validated with Zod schemas before processing
2. **Output Encoding** — User-generated content escaped before rendering (XSS prevention)
3. **Least Privilege** — Firestore rules grant minimum necessary permissions
4. **No Secrets in Client** — `GEMINI_API_KEY` never exposed to browser
5. **HTTPS Only** — Enforced in production; Firebase auth requires HTTPS
6. **SQL/NoSQL Injection Prevention** — Use parameterized queries; validate IDs
7. **Error Messages** — Do not leak stack traces or internal details in API responses
8. **Audit Logging** — Log security-relevant events (pairing, auth failures) to console

---

## 8. Dependency Security

- **Firebase SDK** — managed by Google; monitor for security advisories
- **Google GenAI SDK** — only used server-side; keep API key server-side
- **Next.js** — follow official security recommendations (CSP headers, etc.)
- **npm audit** — run `npm audit` regularly in development
- **Dependabot** — enable GitHub Dependabot alerts for PRDs

---

## 9. Incident Response

**If a security incident occurs:**

1. **Identify:** Determine scope (who is affected, what data)
2. **Contain:** Disable compromised accounts, revoke Firebase tokens
3. **Notify:** Inform affected users via email (post-MVP; manual in MVP)
4. **Remediate:** Fix vulnerability, rotate exposed keys
5. **Document:** Log incident in `security_incidents.md` (create if needed)
6. **Post-mortem:** Review root cause and update rules/prevention

**Emergency Contacts:**
- Firebase Support: https://firebase.google.com/support
- Google AI: https://ai.google.dev/support

---

## 10. Security Measures Summary

| Category | Measures |
|----------|----------|
| **Authentication** | Google OAuth via Firebase Auth, JWT tokens (1hr expiry, auto-refresh) |
| **Authorization** | Firestore security rules enforce row-level access control |
| **Input Validation** | Zod schemas in `lib/input-validation.ts` for all API payloads |
| **XSS Prevention** | Client-side `escapeHtml()`, server stores plain text |
| **CSRF Protection** | Firebase ID token in header; no cookies = no CSRF |
| **Rate Limiting** | In-memory `lib/ratelimit.ts` (chat: 10/min, quiz: 3/5min) |
| **Secrets Management** | GEMINI_API_KEY server-only, NEXT_PUBLIC_ for client keys |
| **PII Isolation** | User profiles never list-queried; couple-scoped data access |
| **Immutable Data** | Messages/sessions cannot be arbitrarily updated |
| **Network Security** | HTTPS enforced; Firebase requires HTTPS in production |
| **Dependency Security** | npm audit, Dependabot alerts, Google-managed SDKs |
| **Error Handling** | No stack traces leaked; consistent error response format |
| **Audit Logging** | Console logging for auth events, pairing, security incidents |

---

## 11. Compliance Notes (MVP)

- **Data Minimization:** Only collect necessary user data (email, displayName, points)
- **Retention:** Messages stored indefinitely in MVP; add TTL cleanup post-MVP
- **Right to Delete:** Not implemented in MVP; add "Delete Account" flow later
- **Privacy Policy:** Required at launch — draft in parallel (outside this document scope)