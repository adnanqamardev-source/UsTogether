---
description: "UsTogether project playbook — architecture, commands, Fallow tooling, agent rules, documentation lifecycle, decision log, and cycle history."
alwaysApply: true
---
# UsTogether Playbook

> **Single source of truth** for project context, architecture, commands, agent rules, and development-cycle history.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Compliance & Privacy Mandate](#2-compliance--privacy-mandate)
3. [Architecture & Conventions](#3-architecture--conventions)
4. [Commands](#4-commands)
5. [Fallow Tooling](#5-fallow-tooling)
6. [Agent Rules](#6-agent-rules)
7. [Documentation Lifecycle](#7-documentation-lifecycle)
8. [Decision Log](#8-decision-log)
9. [Cycle History](#9-cycle-history)
10. [Open Items](#10-open-items)

---

## 1. Project Overview

**UsTogether** is a private, couple-focused PWA for shared journals, quizzes, streaks, and real-time chat. Built with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Firebase Auth (Email/Password + Email Link), Firestore, Firebase Storage, and Firebase Cloud Messaging. Hosted on Firebase Hosting with PWA support via `next-pwa`. Tested with Vitest (unit) and Playwright (E2E).

---

## 2. Compliance & Privacy Mandate

### 2.1 GDPR & Data Minimization
- **Data minimization** — Collect only data strictly necessary for core couple features (journals, quizzes, streaks, chat).
- **Lawful basis** — Explicit consent via onboarding flow; documented in `PRD.md` and `PRIVACY.md`.
- **Right to erasure** — `DELETE /api/admin/couple/:coupleId` hard-deletes all sub-collections and Storage objects; Cloud Function `onUserDelete` triggers cleanup on Auth deletion.
- **Data portability** — `GET /api/admin/couple/:coupleId/export` returns NDJSON of all Firestore docs + signed Storage URLs (valid 1 h).
- **DPA** — Firebase Data Processing Amendment accepted; region locked to `europe-west1`.

### 2.2 COPPA & Age Gate
- **Minimum age 13** — Enforced at sign-up via `dateOfBirth` field; Cloud Function `onCreateUser` rejects accounts < 13 yr.
- **No behavioural advertising** — No third-party trackers, no IDFA/AAID collection.

### 2.3 Security Controls
- **Encryption** — TLS 1.2+ in transit; Firestore/Storage encryption at rest (Google-managed keys).
- **Secrets** — No secrets in repo. Firebase Functions config (`firebase functions:config:set`) + GitHub Actions secrets for CI.
- **Rate limiting** — `lib/ratelimit.ts` (in-memory + optional Redis) on all callable Functions & `/api/*` routes.
- **CSP** — Strict CSP via `next.config.js` headers; `script-src 'self' 'unsafe-inline'` only for Next.js inline chunks.
- **Security headers** — `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=()`.
- **Dependency scanning** — `npm audit --audit-level=high` in CI; Dependabot PRs auto-merged for patch/minor.

### 2.4 Privacy by Design
- **Couple isolation** — Firestore rules enforce `request.auth.uid in resource.data.partnerUids` on every collection.
- **No server-side analytics** — No GA, Mixpanel, etc. Local analytics only (streaks, streak streaks).
- **FCM tokens** — Stored under `users/{uid}/fcmTokens/{token}`; TTL 90 days; deleted on logout.

### 2.5 Retention & Disposal
| Data Type | Retention | Disposal Trigger |
|-----------|-----------|------------------|
| Journals, Quizzes, Chat | Indefinite (user-controlled) | Couple deletion or account deletion |
| FCM Tokens | 90 days inactivity | `onTokenCleanup` Cloud Function (daily cron) |
| Analytics Events | 13 months | BigQuery TTL partition expiry |

---

## 3. Architecture & Conventions

| Layer | Stack | Conventions |
|-------|-------|-------------|
| **Framework** | Next.js 14 (App Router) | Server Components by default; `'use client'` only where needed |
| **Language** | TypeScript (strict) | `strict: true`, `noUncheckedIndexedAccess: true` |
| **Styling** | Tailwind CSS | Mobile-first, `dark:` variant via `next-themes` |
| **State** | React Context + SWR | `AuthProvider`, `CoupleProvider`; SWR for Firestore listeners |
| **Auth** | Firebase Auth (Email/Password + Email Link) | `AuthProvider` wraps app; `AuthWrapper` guards routes |
| **Database** | Firestore (Native SDK) | Collection-per-feature under `couples/{coupleId}/…` |
| **Storage** | Firebase Storage | `couples/{coupleId}/{journal|quiz|chat}/{uuid}.{ext}` |
| **Messaging** | FCM (Web Push) | Service worker in `public/firebase-messaging-sw.js` |
| **Testing** | Vitest (unit) + Playwright (E2E) | `tests/unit/` mirrors `components/` & `lib/`; `tests/e2e/` mirrors user flows |
| **CI/CD** | GitHub Actions → Firebase Hosting | `lint → typecheck → unit → e2e → deploy preview → deploy prod` |
| **PWA** | `next-pwa` (Workbox) | `manifest.webmanifest`, offline fallback `/offline` |

### Key Directories
```
app/                # App Router pages & layouts
components/         # Shared UI components
lib/                # Firebase init, helpers, utilities
hooks/              # Custom React hooks
lib/ratelimit.ts    # Rate limiter (in-memory + optional Redis)
lib/firebase.ts     # Firebase app initialization (client & admin)
lib/firestore-helpers.ts  # Typed Firestore helpers
public/firebase-messaging-sw.js  # FCM service worker
tests/unit/         # Vitest unit tests
tests/e2e/          # Playwright E2E tests
```

### Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ChatDrawer.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useFirestoreCollection.ts`)
- Utils: `kebab-case.ts` (e.g., `firestore-helpers.ts`)
- Types: `types.ts` co-located with feature or in `types/`

### Git & Branching
- `main` → production (protected, PR required)
- `feature/*` → short-lived feature branches
- `fix/*` → hotfix branches from `main`
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`

---

## 4. Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (`next dev`) |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Run production build (`next start`) |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Vitest unit tests (`vitest run`) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:all` | `lint → typecheck → test → test:e2e` |
| `npm run deploy:preview` | Deploy to Firebase preview channel |
| `npm run deploy:prod` | Deploy to Firebase production |
| `npm run firebase:emulators` | Start Firebase emulators |
| `npm run firebase:deploy:rules` | Deploy Firestore rules & indexes |
| `npm run fallow:list:entry` | List Fallow entry points |
| `npm run fallow:list:boundaries` | List Fallow architectural boundaries |
| `npm run fallow:check` | Run Fallow boundary checks |
| `npx fallow check --boundaries --format json --quiet` | CI-friendly boundary check |

---

## 5. Fallow Tooling

### Architectural Boundaries Matrix

| Boundary | Allowed Imports | Disallowed Imports |
|----------|-----------------|-------------------|
| `app/**` | `components/**`, `lib/**`, `hooks/**` | `tests/**`, `app/**` (cross-route) |
| `components/**` | `lib/**`, `hooks/**`, `components/**` (siblings) | `app/**`, `tests/**` |
| `lib/**` | `lib/**` (siblings), `types/**` | `app/**`, `components/**`, `hooks/**`, `tests/**` |
| `hooks/**` | `lib/**`, `hooks/**` (siblings) | `app/**`, `components/**`, `tests/**` |
| `tests/**` | `*` (test files may import anything) | — |

### Additional Ad-hoc Commands
| Command | Purpose |
|---------|---------|
| `npx fallow list --entry-points --format json --quiet` | List entry points (CI) |
| `npx fallow list --boundaries --format json --quiet` | List boundaries (CI) |

---

## 6. Agent Rules

1. **Playbook is law** — Always read this file first; update it every cycle.
2. **Architecture boundaries** — Respect Fallow matrix; no cross-boundary imports without explicit approval.
3. **TypeScript strictness** — `strict: true`, `noUncheckedIndexedAccess: true`; no `any` unless `// eslint-disable-line @typescript-eslint/no-explicit-any` with justification.
4. **Testing mandate** — Every new component/hook/util gets a Vitest file; every new user flow gets a Playwright test.
5. **Security first** — No secrets in code; Firestore rules must pass `npm run firebase:deploy:rules -- --dry-run` before merge.
5. **Documentation lifecycle** — Update this Playbook every cycle (see §7).
6. **Git hygiene** — Conventional commits; squash-merge to `main`; delete branch after merge.
7. **CI gate** — `npm run test:all` must pass locally before push; CI runs same pipeline.

---

## 7. Documentation Lifecycle

**Rule:** *One living document per project.* This `Playbook.md` is the canonical artifact.

**Mandatory updates each cycle:**
1. **Cycle History** (§9) — Add entry with date, goal, changes, decisions, next steps.
2. **Decision Log** (§8) — Record architectural/technical decisions with rationale.
3. **Architecture & Conventions** (§3) — Update if stack, patterns, or boundaries change.
4. **Commands** (§4) — Add/remove scripts as tooling evolves.
5. **Fallow Matrix** (§5) — Update boundaries when directories move or new layers added.
6. **Open Items** (§10) — Track open bugs, tech debt, investigations.

**Format for Cycle History entry:**
```markdown
##### YYYY-MM-DD — Short Title

- **Goal:** One-sentence objective.
- **Changes:** Bullet list of files changed & why.
- **Decisions:** Key technical choices with rationale.
- **Next steps:** Concrete follow-ups.
```

**Format for Decision Log entry:**
```markdown
##### YYYY-MM-DD — Decision Title

- **Context:** What forced the decision.
- **Decision:** What was chosen.
- **Rationale:** Why this over alternatives.
- **Consequences:** Trade-offs accepted.
```

---

## 8. Decision Log

##### 2026-07-10 — Consolidate Global Rules into Single Playbook

- **Context:** Project had `AGENTS.md`, `documentation-lifecycle.md`, and `Playbook.md` with overlapping content.
- **Decision:** Merge into single `Playbook.md` with `alwaysApply: true` frontmatter.
- **Rationale:** Single source of truth reduces drift; frontmatter ensures rules apply in every agent session.
- **Consequences:** Old files deleted; all references updated.

##### 2026-07-07 — Initialize Documentation Lifecycle Rule

- **Context:** No living documentation process existed.
- **Decision:** Add `documentation-lifecycle.md` rule (`alwaysApply`) and seed `Playbook.md`.
- **Rationale:** One living doc > fragmented per-feature docs; global rule ensures compliance.
- **Consequences:** Requires discipline to update each cycle; mitigated by making it a CI gate.

##### 2026-07-10 — Consolidate Auth Listeners & Standardize Motion Imports

- **Context:** Audit found duplicate `onAuthStateChanged` listeners and mixed `framer-motion` / `motion/react` imports.
- **Decision:** Consolidate auth into `AuthProvider` context; standardize on `motion/react`.
- **Rationale:** Eliminates race conditions; aligns with Framer Motion v11+ package rename.
- **Consequences:** Removed `AuthWrapper.tsx` duplicate listener; updated all component imports.

##### 2026-07-10 — Fix Rate Limiter Memory Backend Bug & Add Redis Support

- **Context:** `lib/ratelimit.ts` memory backend ignored key parameter, causing shared counter.
- **Decision:** Fix key scoping; add optional Redis backend via dynamic import.
- **Rationale:** Keeps Redis optional (no forced dependency); fixes critical rate-limit bug.
- **Consequences:** Added `redis` npm package + `global.d.ts` module declaration; updated `TECHNICAL_ARCHITECTURE.md`.

---

## 9. Cycle History

---

##### 2026-07-10 — Audit Remediation & Test Fixes

- **Goal:** Fix audit-identified issues: duplicate auth listeners, duplicate chat components, animation imports, and rate limiting.
- **Changes:**
  - Deleted `components/ChatPanel.tsx` (duplicate of `ChatDrawer`).
  - Consolidated `AuthWrapper.tsx` to use `AuthProvider` context instead of duplicate `onAuthStateChanged` listener.
  - Standardized animation imports from `framer-motion` to `motion/react` across all components.
  - Fixed `lib/ratelimit.ts` memory backend bug (key parameter was ignored, causing shared counter).
  - Added Redis backend support in `lib/ratelimit.ts` via dynamic import.
  - Added `redis` npm package and module declaration in `global.d.ts`.
  - Updated `TECHNICAL_ARCHITECTURE.md` with Motion Library and Rate Limiting sections.
  - Fixed `tests/unit/authprovider.test.ts` mock structure to work with Vitest hoisting.
  - All 33 unit tests now passing.
- **Decisions:**
  - Used dynamic import for Redis to keep it optional (no forced dependency).
  - Standardized on `motion/react` as the modern Framer Motion package name.
- **Next steps:** Investigate E2E test 404 resource-loading error; consider adding Redis-specific unit tests.

---

##### 2026-07-10 — Consolidate Global Rules

- **Goal:** Merge `AGENTS.md`, `documentation-lifecycle.md`, and `Playbook.md` into one properly-named file.
- **Changes:** Created a single `Playbook.md` containing project overview, architecture notes, commands, Fallow matrix, agent rules, documentation-lifecycle mandate, decision log, and cycle history. Deleted the now-redundant `AGENTS.md` and `documentation-lifecycle.md`.
- **Decisions:** Kept `Playbook.md` as the canonical name since it is already referenced as the living-doc deliverable; added `alwaysApply: true` frontmatter so the mandate applies in every session.
- **Next steps:** Maintain this file each cycle; keep project context current as workflows change.

---

##### 2026-07-07 — Initialize Documentation Lifecycle

- **Goal:** Create a rule that generates docs like this playbook and updates it each development cycle.
- **Changes:** Added `documentation-lifecycle.md` rule (`alwaysApply`) and seeded the original `Playbook.md` with the standard structure.
- **Decisions:** Chose one living doc over per-feature docs for simplicity; rule is global so it applies to all projects.
- **Next steps:** Add cycle entries as features are built; expand Architecture/Conventions as the project grows.

---

## 10. Open Items

- **E2E test failure:** Console errors test reports 404 for a missing resource on the dashboard page. Root cause unknown — investigate network/asset loading during Playwright run.