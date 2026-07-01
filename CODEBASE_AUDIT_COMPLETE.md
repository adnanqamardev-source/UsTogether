# UsTogether Codebase Audit Report

## Executive Summary

**Project**: UsTogether - A couples relationship app with quizzes, chat, achievements, and streak tracking  
**Stack**: Next.js 16, React 18, Firebase, TypeScript, Tailwind CSS, Vitest, Playwright  
**Overall Health**: GOOD - Well-structured with solid security practices, minor improvements needed

---

## 1. Project Structure & Architecture

### ✅ Strengths
- **Clean separation of concerns**: `app/api/`, `components/`, `lib/`, `hooks/`, `data/`
- **Modern Next.js App Router**: Uses server components and API routes appropriately
- **TypeScript**: Strong typing with `global.d.ts` for shared types
- **Custom hooks**: Reusable `useFirestoreDocument` and `useFirestoreCollection`
- **Dynamic imports**: Client-only components properly lazy-loaded with `ssr: false`

### ⚠️ Areas for Improvement
- `lib/firebase.ts` has `"use client"` directive but is imported by server API routes - could cause bundling issues
- Mix of barrel exports (`export *`) and named exports may complicate tree-shaking
- `firebase-applet-config.json` appears to be a fallback config - ensure it's in `.gitignore`

---

## 2. Security Audit

### ✅ Firestore Security Rules (EXCELLENT)
The `firestore.rules` demonstrate strong security practices:

```javascript
// Key strengths:
- Default deny: `allow read, write: if false;`
- Strict PII isolation: `allow list: if false;` for users
- Owner-based access: `request.auth.uid == userId`
- Timestamp validation: ±60s window for create/update operations
- Field-level validation: `isValidUser()`, `isValidCouple()`, etc.
- Immutable messages: `allow update: if false;`
- Subcollection isolation: Achievements nested under `/users/{userId}/items`
```

**Rules Coverage**:
- ✅ Users: CRUD with strict owner checks
- ✅ Couples: Member-only access, immutable user1Id/user2Id
- ✅ Messages: Immutable after creation
- ✅ Sessions: Terminal state protection (`status != 'finished'`)
- ✅ Quizzes: Creator-only updates, size limits (50 questions max)
- ✅ Pairing codes: Authenticated-only reads

### ⚠️ Security Concerns

#### CRITICAL: API Auth Bypass Risk
**File**: `lib/api-auth.ts`
```typescript
const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, ...);
```
**Issue**: Uses `NEXT_PUBLIC_FIREBASE_API_KEY` (client-side exposed) for server-side auth verification
**Risk**: Low - Firebase API keys are public by design, but this pattern is unconventional
**Recommendation**: Use Firebase Admin SDK instead for server-side token verification

#### MEDIUM: Rate Limiting In-Memory
**File**: `lib/ratelimit.ts`
```typescript
const limits = new Map<string, RateLimitEntry>();
```
**Issue**: In-memory Map doesn't persist across serverless function invocations
**Impact**: Rate limiting ineffective in production (Vercel/Netlify)
**Recommendation**: Use Redis (Upstash, Vercel KV) or Firebase Realtime DB for distributed rate limiting

#### MEDIUM: Missing Input Sanitization
**File**: `app/api/chat/route.ts`
```typescript
contents: [...safeMessages.map((m) => ({
  role: m.role === "assistant" ? "model" : "user",
  parts: [{ text: m.text || "" }],
}))]
```
**Issue**: No sanitization of `m.text` before sending to AI API
**Risk**: Prompt injection via crafted user messages
**Recommendation**: Strip/escape special tokens, limit message length

#### LOW: CORS Not Explicitly Configured
No CORS headers in API routes - relies on Next.js defaults. May need explicit configuration for cross-origin clients.

---

## 3. Backend/API Implementation

### ✅ API Routes
**Chat** (`app/api/chat/route.ts`):
- ✅ Auth check + rate limiting
- ✅ Input validation
- ✅ Error handling with try/catch
- ⚠️ Hardcoded system instruction (should be configurable)
- ⚠️ `maxDuration = 30` may be insufficient for slow AI responses

**Generate Challenge** (`app/api/generate-challenge/route.ts`):
- ✅ `unstable_cache` for cost optimization (24h TTL)
- ✅ Dual endpoint (POST cached, GET streaming)
- ⚠️ Inconsistent caching: POST uses cache, GET streams fresh (confusing UX)
- ⚠️ Imports both `GoogleGenAI` and `createGoogleGenerativeAI` (redundant)

**Generate Quiz** (`app/api/generate-quiz/route.ts`):
- ✅ JSON response schema enforcement
- ✅ Topic deduplication via `recentTopics`
- ⚠️ Question IDs generated via `Date.now() + idx` - potential collision in rapid requests
- ⚠️ No validation that AI returns exactly 5 questions

### ✅ Input Validation
**File**: `lib/input-validation.ts`
- ✅ Type guards with `ok` pattern
- ✅ Array validation with length limits
- ✅ Safe type narrowing (`t is string`)

---

## 4. Frontend Code Quality

### ✅ React Patterns
- Proper `"use client"` directives
- Context API for auth state
- Custom hooks for Firestore subscriptions
- Dynamic imports for code splitting
- Suspense boundaries for async components

### ⚠️ Code Issues

#### MEDIUM: Firestore Query Without Composite Index
**File**: `components/CoupleDashboard.tsx` (line 100-107)
```typescript
const finishedConstraints = user && coupleId
  ? [where('coupleId', '==', coupleId), where('status', '==', 'finished')]
  : undefined as any;
```
**Issue**: Compound query on `coupleId` + `status` requires composite index
**Impact**: App breaks in production until index is created
**Recommendation**: Add index to Firestore console or restructure queries

#### MEDIUM: Unhandled Edge Cases
- `user?.displayName?.[0]` may crash if displayName is empty string
- `partnerId` defaults to `''` instead of `null` - causes unnecessary deletes in unpair
- `as any` usage for `finishedConstraints` (line 101)

#### LOW: Performance
- `useEffect` dependencies in `CoupleDashboard` trigger re-renders (line 109-114)
- No memoization for expensive computations
- Loading states could be more granular

---

## 5. Data Validation & Sanitization

### ✅ Client-Side
- ✅ Message validation: role + text required
- ✅ History array validation
- ✅ Recent topics capped at 20 items
- ✅ Type guards prevent runtime errors

### ⚠️ Server-Side Gaps
- **No length limits on chat messages** - could abuse AI API quota
- **No XSS prevention** - `react-markdown` renders user content without sanitization
- **Quiz questions not validated** - trust AI output blindly

**Recommendation**: Add `dompurify` for markdown, enforce max message length (e.g., 2000 chars)

---

## 6. Authentication & Authorization

### ✅ Firebase Auth
- Google Sign-In via popup
- Real-time user profile sync via `onSnapshot`
- Auto-creates user profile on first sign-in
- Proper cleanup of listeners

### ⚠️ Auth Issues

#### MEDIUM: No Email Verification Enforcement
**File**: `firestore.rules` (line 14)
```javascript
function isAuthenticated() { return isSignedIn(); }
```
**Issue**: Comment says "preferably `email_verified == true`" but not enforced
**Risk**: Unverified emails can access app
**Recommendation**: Enforce email verification in production

#### LOW: No RBAC
All authenticated users have same permissions. No admin/ moderator roles.

---

## 7. Dependencies & Vulnerabilities

### 📦 Dependencies (from `package.json`)

**Core**:
- `next`: 16.2.6 ✅ Latest stable
- `react/react-dom`: 18.2.0 ⚠️ React 19 available
- `firebase`: 11.0.0 ✅ Latest
- `typescript`: 6.0.3 ✅ Latest

**AI/ML**:
- `@ai-sdk/google`: 3.0.83 ✅
- `@google/genai`: 2.3.0 ✅
- `ai`: 6.0.208 ✅

**Testing**:
- `vitest`: 4.1.9 ✅
- `@playwright/test`: 1.61.0 ✅
- `@testing-library/react`: 16.3.2 ✅

**⚠️ Potential Vulnerabilities**:
1. **Outdated React 18**: React 19 released with performance improvements
2. **No lockfile integrity check**: `package-lock.json` exists but no CI verification
3. **Tailwind v4 beta**: `tailwindcss`: "4.1.11" - v4 is still in active development

**Recommendation**: Run `npm audit` and `npm audit fix` before deployment

---

## 8. Test Coverage

### ✅ Tests Implemented
Based on `implementation_plan.md`:
- **Vitest unit tests**: 18 tests for `streak.ts` and `achievements.ts`
- **Playwright E2E**: 3 tests for dashboard/session integration
- **Date edge cases**: Leap years, month transitions, year boundaries

### 📊 Coverage Gaps
- ❌ No tests for API routes (`/api/chat`, `/api/generate-quiz`)
- ❌ No tests for Firestore rules (use `firestore-emulator` + `@firebase/rules-unit-testing`)
- ❌ No tests for `lib/input-validation.ts`
- ❌ No tests for `lib/firestore-helpers.ts`
- ❌ No tests for React components (except E2E)

**Recommendation**: Add unit tests for API validation and Firestore rules

---

## 9. Implementation Status vs. Roadmap

### ✅ Completed Features

Based on codebase analysis:
- [x] **Authentication**: Firebase Google Sign-In
- [x] **User Profiles**: Create/update with points
- [x] **Couple Pairing**: Via pairing codes
- [x] **Quizzes**: AI-generated + static quizzes
- [x] **Quiz Sessions**: Real-time state management
- [x] **Chat**: AI-powered desi chat companion
- [x] **Streaks**: Daily activity tracking with streak logic
- [x] **Achievements**: 8 achievements with unlock logic
- [x] **Memory Board**: Shared memories view
- [x] **Responsive UI**: Mobile + desktop with Tailwind

### ⏳ Partially Implemented
- **Minigames**: Listed in `isValidSession()` but no UI found
- **Leaderboards**: `totalScore` in couples but no ranking UI

### ❌ Missing Features (from `Goals & Roadmap.md`)
- [ ] **Push Notifications**: No FCM integration
- [ ] **Photo/Media Sharing**: No storage rules or upload UI
- [ ] **User Settings**: No settings page
- [ ] **Friends/Social**: Only couple pairing, no broader social
- [ ] **Monetization**: No Stripe/subscription integration
- [ ] **Admin Dashboard**: No admin UI

---

## 10. Critical Recommendations

### Priority 1 (Fix Before Production)
1. **Migrate `lib/api-auth.ts` to Firebase Admin SDK**
2. **Add Firestore composite index** for `couples` query
3. **Implement distributed rate limiting** (Redis)
4. **Run `npm audit` and patch vulnerabilities**

### Priority 2 (Improve Production Readiness)
5. **Add API route tests** with supertest/fetch-mock
6. **Sanitize markdown** with DOMPurify
7. **Enforce email verification** in Firestore rules
8. **Add request logging** to API routes (structured logging)

### Priority 3 (Nice to Have)
9. **Upgrade to React 19**
10. **Add error boundary** components
11. **Implement Sentry** for error tracking
12. **Add CI/CD** with GitHub Actions

---

## 11. Code Quality Score

| Category | Score | Notes |
|----------|-------|-------|
| Security | 8/10 | Strong Firestore rules, minor auth improvements needed |
| Architecture | 8/10 | Clean structure, minor organization issues |
| Testing | 6/10 | Good unit tests, missing API/rule tests |
| Documentation | 5/10 | Some docs exist, could be expanded |
| Error Handling | 7/10 | Good try/catch, could add retries |
| Performance | 7/10 | Lazy loading, caching, but no memoization |
| Type Safety | 8/10 | Strong TypeScript, minor `any` usage |
| **Overall** | **7.4/10** | Production-ready with minor fixes |

---

## 12. Next Steps

1. **Fix Priority 1 issues** (1-2 days)
2. **Add missing tests** (2-3 days)
3. **Upgrade dependencies** (1 day)
4. **Add monitoring/logging** (1-2 days)
5. **Implement remaining features** per roadmap (ongoing)

---

*Audit completed: 2026-01-07*  
*Auditor: Cline (AI)*