# UsTogether Architecture & Development Patterns

## Overview
Codified engineering standards, patterns, and quality gates extracted from the `UsTogether-staging` repository git history and commit analysis.

---

## Key Development Patterns

### Pattern 1: Firebase Browser-Only Initialization (SSR Resilience)
- **Problem**: Calling Firebase `getAuth()` or `getFirestore()` on the server during Next.js SSR / static prerendering throws missing API key or `auth/invalid-api-key` errors.
- **Solution**: Always guard Firebase app and service initialization behind browser check (`typeof window !== 'undefined'`) or environment/demo mode fallbacks.
- **Implementation**:
```typescript
const isBrowser = typeof window !== "undefined";

export const auth = isDemo
  ? demoAuth
  : isBrowser
    ? getAuth(ensureApp())
    : (null as unknown as Auth);
```

---

### Pattern 2: Demo Mode Module Resolution
- **Problem**: E2E tests, design evaluation, or staging without Firebase credentials need full app functionality.
- **Solution**: `NEXT_PUBLIC_DEMO_MODE=true` environment flag combined with Turbopack / Webpack alias redirection pointing `firebase/auth` and `firebase/firestore` to in-memory mock handlers (`lib/firebase/demo.ts`).
- **Implementation** (`next.config.ts`):
```typescript
turbopack: {
  resolveAlias: {
    "firebase/firestore": "./lib/firebase/demo.ts",
    "firebase/auth": "./lib/firebase/demo.ts",
    "firebase/storage": "./lib/firebase/demo.ts",
  },
}
```

---

### Pattern 3: Auth Token Propagation & Retry Logic
- **Problem**: Immediately accessing Firestore after user login can fail with `permission-denied` because auth token propagation is asynchronous.
- **Solution**: Refresh token via `u.getIdToken()` before performing security-gated writes and wrap `getDoc` calls in exponential backoff retries (`retryGetDoc`).

---

### Pattern 4: Playwright Page Object Model & Semantic Testing
- **Rule**: Avoid relying on Tailwind utility CSS classes (`.group.relative.rounded-\[2rem\]`) or transient fallback text in E2E tests.
- **Best Practice**: Use explicit `data-testid` attributes or semantic accessible locators (`page.getByRole()`, `page.getByText()`).

---

## Commit Message Standards

Use conventional commit prefixes:
- `feat:` New features / UI additions
- `fix:` Bug fixes and patch resolutions
- `refactor:` Restructuring without changing external behavior
- `ci:` Pipeline, GitHub Actions, Vercel, Playwright caching fixes
- `docs:` Documentation and specs updates
- `test:` Unit/E2E test updates

---

## Common Anti-Patterns to Avoid

1. **Directly exporting un-guarded Firebase client references**: Never initialize Firebase at module root on the server side.
2. **Hardcoded staging URLs in Playwright config**: Use `PLAYWRIGHT_TEST_BASE_URL` or `process.env.BASE_URL`.
3. **Using `experimental.turbo` in Next.js 16**: In Next.js 16+, use top-level `turbopack` config key instead of `experimental.turbo`.
