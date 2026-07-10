---
description: >
  Universal agent rule set — documentation framework, lifecycle mandate,
  compliance mandate, and per-project living playbook.
  Single source of truth for all projects.
alwaysApply: true
---

# Universal Agent Playbook

> Living documentation and agent rule set. Covers universal rules, the 5-document
> framework, compliance mandates, and per-project cycle history.
> Updated at the start and end of every development cycle.

---

## Table of Contents

1. [Universal Agent Rules](#1-universal-agent-rules)
2. [Compliance & Privacy Mandate](#2-compliance--privacy-mandate)
3. [Documentation Framework: The 5 Foundation Docs](#3-documentation-framework-the-5-foundation-docs)
4. [Documentation Synchronization Mandate](#4-documentation-synchronization-mandate)
5. [Project Contexts](#5-project-contexts)

---

## 1. Universal Agent Rules

These rules apply to **all projects** without exception.

### What not to touch without explicit sync

- Do not edit canonical type definitions without syncing related architecture docs.
- Do not edit security/critical files without understanding their full impact.
- Do not edit dependencies without verifying alignment with architecture.
- Do not edit any source file without updating its mapped canonical doc
  (see [Documentation Synchronization Mandate](#4-documentation-synchronization-mandate)).

### Always ask before

- Deleting exports or files — run static analysis first.
- Removing dependencies.
- Committing or opening a PR.

### Preferred style

- TypeScript; consistent indentation per project (typically 2-space).
- Follow project conventions (Next.js App Router, CRA, etc.).
- All API payloads validated with schema validation (e.g., Zod) before processing.
- User-generated content escaped before render (XSS protection).
- No secrets in the client bundle.

### Definition of "done"

Documentation is part of done. A task is not complete while its docs are out of date.

- Keep project documentation current via version bump or cycle entry.
- Create the 5 foundation docs for any new project (see §3).
- Append a cycle history entry for every meaningful change.

---

## 2. Compliance & Privacy Mandate

These rules govern how agents interact with user data, legal boundaries, and
system security. They apply to all projects without exception.

### 2.1 Data Minimization (Privacy Policy)

Agents must adhere to strict data minimization. Only read, process, or summarize
the specific data necessary for the immediate task.

**Controls:**
- Do not inherit broad permissions to scan entire databases.
- Implement least-privilege access — scope permissions to the task, not the actor.
- Block unauthorized data sharing at the integration layer.

### 2.2 Operational Boundaries (Terms of Service)

Agents must operate strictly within defined service limits and must not execute
unauthorized or unmonitored changes to accounts or systems.

**Controls:**
- Build circuit breakers or require human-in-the-loop (HITL) approval for
  high-stakes automated actions.
- Any autonomous decision must be explainable and verifiable against the
  user's ToS agreement.

### 2.3 Data Processing Limits (DPA / GDPR)

Agents must respect regional data boundaries (e.g., GDPR). Client data fed into
an agent — inputs, context, retrieved records — must not be used to train or
fine-tune external AI models without explicit, documented consent.

**Controls:**
- Verify that third-party API and infrastructure vendor contracts explicitly prohibit
  training their models on client data.
- Do not route EU-resident data through non-compliant regions.

### 2.4 Security Hardening & Auditability (Security Document)

Agents introduce new attack surfaces (prompt injection, data leakage). They must
be technically secured against adversarial attacks and be fully auditable.

**Controls:**
- Log every decision, API call, and data retrieval with timestamps.
- Treat agent outputs as untrusted until validated against expected schema.
- Maintain an audit-ready trail to prove data protection during automated workflows.

### 2.5 Tenant Isolation (NDA)

An agent processing Client A's data must never allow that data to bleed into
outputs generated for Client B.

**Controls:**
- Use strictly partitioned vector databases and siloed memory architectures.
- Treat any hallucination or cross-tenant data leak as a potential confidentiality
  breach and regulatory exposure event — escalate immediately.

---

## 3. Documentation Framework: The 5 Foundation Docs

Every project **must** have these 5 documents created at inception. They provide
the blueprint for building the app correctly.

### 3.1 PRD — Product Requirements Document

**What it contains:**
- **Problem Statement** — What problem does this app solve? Who faces it? Why does it matter? Plain English, no jargon.
- **Target Users** — Who is this app for? Age, tech comfort level, wants, frustrations.
- **Product Vision** — One or two lines: the app's north star.
- **Core Features** — Every feature: name, short description, must-have vs nice-to-have.
- **App Flow** — Step-by-step user journey: every screen, button, and decision point.
- **Success Metrics** — Signups, tasks completed, time spent, etc.

**When to create:** Project inception, before any code is written.

**AI Prompt:**
```
Act as a senior product manager with experience in early-stage startups. I am
building an app and I need you to create a detailed Product Requirements Document
for it. The document should cover — what the app does, who it is for, what problem
it solves, all core features with must-have vs nice-to-have classification, how a
user flows through the app from start to finish, what the MVP looks like, how
success will be measured, and what we are deliberately NOT building in version one.
My app idea is: [paste your idea here]
```

---

### 3.2 Technical Architecture Document

**What it contains:**
- **Tech Stack** — Every technology: frontend framework, backend language, database, hosting, auth service, versions where applicable.
- **File & Folder Structure** — Map of project organization. Which folder holds which type of file.
- **Database Schema** — Every table/collection, every field, relationships, in plain English.
- **Environment & Config Notes** — Required environment variables, keys, what must never be hardcoded.

**When to create:** After PRD is stabilized.

**AI Prompt:**
```
Act as a senior software architect who has built and scaled multiple SaaS products.
Based on my app idea, create a complete Technical Architecture Document. It should
include the recommended tech stack with reasoning for each choice, the complete file
and folder structure of the project, the full database schema with all tables,
fields, and relationships explained in plain English, and any environment variables
or configuration notes I need to be aware of before I start building.
My app idea is: [paste your idea here]
```

---

### 3.3 Security & Access Document

**What it contains:**
- **Authentication Method** — Email/password, Google OAuth, OTP, magic link, etc.
- **User Roles & Permissions** — Admin, Regular User, Guest, etc. What each role can see and do.
- **Row-Level Security Rules** — Who can read/write whose data.
- **Error Handling** — API errors, auth failures, payment failures. Defined responses prevent silent crashes.
- **Edge Cases** — Empty submissions, unauthorized access attempts, slow connections.

**When to create:** After Technical Architecture is defined.

**AI Prompt:**
```
Act as a senior security engineer who specializes in early-stage product security.
Create a Security and Access Document for my app. It should cover the authentication
method that best fits my use case, all user roles and exactly what each role can and
cannot do, row-level security rules for the database, a complete error handling guide
for all major failure points, and a list of edge cases I need to handle before
launch. Write everything in plain English so a non-technical founder can understand
it. My app idea is: [paste your idea here]
```

---

### 3.4 Frontend Specification Document

**What it contains:**
- **Color Palette** — Brand colors with hex codes: primary, secondary, background, text, error, success.
- **Typography** — Fonts, sizes, and purpose: heading, body, button text.
- **Component Styles** — Buttons, inputs, cards, modals. Clear descriptions for AI consistency.
- **Spacing & Layout Rules** — Padding, margins, grid system.
- **API & Integration Spec** — Third-party services (Stripe, Firebase, OpenAI, etc.), endpoints, request/response shape.

**When to create:** After Security & Access Document is defined.

**AI Prompt:**
```
Act as a senior UI/UX designer and frontend architect. Create a Frontend
Specification Document for my app. It should define a complete design system
including color palette with hex codes, typography choices, component styles for
buttons, inputs, cards and modals, and spacing and layout rules. It should also
include a full API and integration spec for every third-party service my app will
use — what each service does, which endpoints are called, what data is sent and what
response is expected. My app idea is: [paste your idea here]
```

---

### 3.5 Feature Ticket List

**What it contains:**
- **Feature Name** — Short and clear.
- **Task Description** — Exactly what needs to happen, written for someone unfamiliar with the codebase.
- **Acceptance Criteria** — Unambiguous statements defining when the task is done.
- **Dependencies** — Which tasks must complete first.
- **Priority** — Must-have for launch / should-have / nice-to-have.

**When to create:** After Frontend Specification is defined.

**AI Prompt:**
```
Act as a senior engineering lead who breaks down products into buildable tasks.
Based on my PRD, create a complete Feature Ticket List for my app. For each feature,
write a ticket that includes the feature name, a clear description of what needs to
be built, acceptance criteria that defines when the task is done, any dependencies
on other features that must be completed first, and a priority label — must-have for
launch, should-have, or nice-to-have. Write each ticket so it can be directly used
as a prompt for an AI coding tool. My PRD is: [paste your PRD here]
```

---

## 4. Documentation Synchronization Mandate

At the beginning and end of **every development cycle** (task, feature, bugfix, or
refactor session), maintain project documentation so knowledge stays current.

### When to act

| Moment | Action |
|---|---|
| Start of a cycle | If documentation lacks required sections, create or initialize them. |
| End of a cycle | Update docs to reflect what was built, decisions made, and new conventions. |
| User explicitly asks for docs | Treat the project's Playbook section as the deliverable. |

### What to record each cycle

For every change, append or update:

- **Cycle entry** — date, goal, one-line summary.
- **Architecture / structure** — notable files, directories, and how they fit together.
- **Decisions & rationale** — why a particular approach was chosen.
- **Conventions** — coding standards, naming, tooling commands discovered or enforced.
- **Open items / next steps** — pending work, known issues, follow-ups.
- **References** — commands, URLs, or resources that matter.

Keep entries concise and scannable. Use headings, tables, and bullet lists.

### Rules of thumb

- Documentation is part of "done." Do not mark a task complete while docs are out of date.
- Use clear Markdown; no binary or proprietary formats.
- Never delete historical cycle entries — append newer ones. Mark superseded decisions instead.
- Trivial changes (typos, etc.) only need a one-line entry.

---

## 5. Project Contexts

Each project maintains its own context section below. Add new projects by
appending a new subsection.

---

### Project: UsTogether (couple-connect)

A couples-connect web app with chat, quiz sessions, streak tracking, achievements,
photo memory board, and AI chat.

#### Project Overview

- Primary app or package: `couple-connect` (Next.js app)
- Main entry points:
  - `app/layout.tsx` — Root layout, providers, global CSS
  - `app/page.tsx` — Landing / auth-gated root (uses `AuthWrapper`)
  - `app/providers.tsx` — Client providers (Firebase/Auth context)
  - `app/api/*/route.ts` — Server API routes (Admin SDK auth)
- Important directories:
  - `app/` — Next.js App Router routes, pages, API routes
  - `components/` — React UI components (Dashboards, Chat, Quiz, Streak, Achievements)
  - `lib/` — Firebase client/admin init, Firestore helpers, streak, achievements, validation, rate-limit
  - `hooks/` — Firestore React hooks, mobile detection
  - `data/` — `quiz-questions.json` / `quiz-questions-sample.json`
  - `tests/` — `e2e/` (Playwright) + `unit/` (Vitest)
  - `context7-mcp/` — MCP server scaffold

#### Architecture Notes

- **Module boundaries:**
  - Client layer: `lib/firebase.ts`, `components/*`, `hooks/*` — talk to Firestore
    via Firebase JS SDK.
  - Server layer: `app/api/*` uses `lib/admin.ts` + `lib/api-auth.ts` (Firebase
    Admin SDK, `verifyIdToken`). Never expose `GEMINI_API_KEY` to the browser.
  - Types: `global.d.ts` is the canonical entity type source; changes must sync to
    `TECHNICAL_ARCHITECTURE.md` and `implementation_plan.md`.
- **Generated or vendored:** `tsconfig.tsbuildinfo`, `next-env.d.ts`,
  `UsTogether.code-workspace` (auto). `context7-mcp/` is a vendored MCP scaffold.
- **Sensitive areas:**
  - `lib/firebase.ts`, `lib/admin.ts`, `lib/api-auth.ts` — credential & token handling.
  - `firestore.rules` / `DRAFT_firestore.rules` — row-level security; edits must sync
    to `TECHNICAL_ARCHITECTURE.md` §7.3.
  - `.env.local` — Firebase client keys; `FIREBASE_ADMIN_CREDENTIALS` (server only, never commit).

#### Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Build | `npm run build` |
| Unit tests | `npm run test:unit` (Vitest) |
| E2E tests | `npm run test:e2e` (Playwright) |
| Dev server | `npm run dev` |
| Type check | `tsc --noEmit` |
| Lint | `npm run lint` |

#### Tooling — Fallow

Run `fallow audit --format json --quiet` before committing AI-generated changes.
Use the matrix below for targeted checks.

| When the agent is about to… | Run |
|---|---|
| Delete an "unused" export or file | `fallow dead-code --trace <file>:<export>` |
| Delete an "unused" dependency | `fallow dead-code --trace-dependency <name>` |
| Commit or open a PR | `fallow audit --base <ref>` |
| Prioritize refactoring | `fallow health --hotspots --targets` |
| Ask who owns code | `fallow health --ownership` |
| Check untested-but-reachable code | `fallow health --coverage-gaps` |
| Consolidate duplication | `fallow dupes --trace dup:<fingerprint>` |
| Find feature flags | `fallow flags` |
| Check architecture rules before changing a file | `fallow guard <files>` |
| Surface security candidates | `fallow security` |
| Understand a finding | `fallow explain <issue-type>` |
| Scope a monorepo | `--workspace <glob>` / `--changed-workspaces <ref>` (global flags) |

Also available: `fallow dupes --format json --quiet`, `fallow health --format json --quiet`,
`fallow list --entry-points --format json --quiet`, `fallow list --boundaries --format json --quiet`.

#### Cycle History

##### 2026-07-10 — Audit remediation and test fixes

- **Goal:** Fix audit-identified issues: duplicate auth listeners, duplicate chat
  components, animation imports, and rate limiting.
- **Changes:**
  - Deleted `components/ChatPanel.tsx` (duplicate of `ChatDrawer`).
  - Consolidated `AuthWrapper.tsx` to use `AuthProvider` context instead of a
    duplicate `onAuthStateChanged` listener.
  - Standardized animation imports from `framer-motion` to `motion/react` across
    all components.
  - Fixed `lib/ratelimit.ts` memory backend bug (key parameter was ignored, causing
    a shared counter).
  - Added Redis backend support in `lib/ratelimit.ts` via dynamic import.
  - Added `redis` npm package and module declaration in `global.d.ts`.
  - Updated `TECHNICAL_ARCHITECTURE.md` with Motion Library and Rate Limiting
    sections.
  - Fixed `tests/unit/authprovider.test.ts` mock structure to work with Vitest
    hoisting.
  - All 33 unit tests now passing.
- **Decisions:**
  - Used dynamic import for Redis to keep it optional (no forced dependency).
  - Standardized on `motion/react` as the modern Framer Motion package name.
- **Next steps:** Investigate E2E test 404 resource-loading error; consider adding
  Redis-specific unit tests.

---

##### 2026-07-10 — Consolidate global rules

- **Goal:** Merge `AGENTS.md`, `documentation-lifecycle.md`, and `Playbook.md`
  into one properly-named file.
- **Changes:** Created a single `Playbook.md` containing project overview,
  architecture notes, commands, Fallow matrix, agent rules, documentation-lifecycle
  mandate, decision log, and cycle history. Deleted the now-redundant `AGENTS.md`
  and `documentation-lifecycle.md`.
- **Decisions:** Kept `Playbook.md` as the canonical name since it is already
  referenced as the living-doc deliverable; added `alwaysApply: true` frontmatter
  so the mandate applies in every session.
- **Next steps:** Maintain this file each cycle; keep project context current as
  workflows change.

---

##### 2026-07-07 — Initialize documentation lifecycle

- **Goal:** Create a rule that generates docs like this playbook and updates it
  each development cycle.
- **Changes:** Added `documentation-lifecycle.md` rule (`alwaysApply`) and seeded
  the original `Playbook.md` with the standard structure.
- **Decisions:** Chose one living doc over per-feature docs for simplicity; rule is
  global so it applies to all projects.
- **Next steps:** Add cycle entries as features are built; expand
  Architecture/Conventions as the project grows.

#### Open Items

- **E2E test failure:** Console errors test reports 404 for a missing resource on
  the dashboard page. Root cause unknown — investigate network/asset loading during
  Playwright run.