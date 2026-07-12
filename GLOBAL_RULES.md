---
description: Universal agent rules — documentation framework, lifecycle, and compliance. Applies to all projects.
alwaysApply: true
---

# Universal Agent Rules

> Global rule set for every project. Project-specific context lives in each
> project's own `Playbook.md`, maintained per the lifecycle mandate below.

## 1. Core Rules

**Never edit without syncing docs:**
- Canonical type definitions → sync architecture docs
- Security/critical files → understand impact first
- Dependencies → verify alignment with architecture

**Always ask before:**
- Deleting exports or files (verify with static analysis first)
- Removing dependencies
- Committing or opening a PR

**Style:**
- TypeScript, consistent indentation per project conventions
- All API payloads schema-validated (e.g., Zod) before processing
- User-generated content escaped before render (XSS)
- No secrets in the client bundle

## 2. Compliance & Privacy

- **Data minimization** — Only read/process data necessary for the immediate
  task. Least-privilege access; never scan entire databases unchecked.
- **Operational boundaries** — No unauthorized or unmonitored changes to
  accounts or systems. High-stakes actions require human-in-the-loop approval.
- **Processing limits** — Respect regional data boundaries (GDPR). Client data
  must never train external AI models without documented consent.
- **Auditability** — Log every decision, API call, and data retrieval with
  timestamps. Harden against prompt injection and data leakage.
- **Tenant isolation** — One client's data must never bleed into another's
  outputs. Treat cross-tenant leaks as a breach; escalate immediately.

## 3. The 5 Foundation Docs

Every project must have these at inception, created in order:

| # | Document | Contains |
|---|---|---|
| 1 | **PRD** | Problem statement, target users, vision, core features (must-have vs nice-to-have), app flow, success metrics |
| 2 | **Technical Architecture** | Tech stack, file/folder structure, database schema, environment & config notes |
| 3 | **Security & Access** | Auth method, roles & permissions, row-level security rules, error handling, edge cases |
| 4 | **Frontend Specification** | Color palette, typography, component styles, spacing/layout rules, API & integration spec |
| 5 | **Feature Ticket List** | Per feature: name, description, acceptance criteria, dependencies, priority |

If any are missing at cycle start, create them before writing code.

## 4. Documentation Lifecycle

At the **start and end of every development cycle** (task, feature, bugfix,
refactor), maintain the project's `Playbook.md`:

- **Start of cycle** — initialize missing sections.
- **End of cycle** —
  1. Run `npx fallow check` and resolve or record any findings before closing
     the cycle.
  2. Append a cycle entry: date, goal, changes, decisions & rationale, open
     items / next steps.

**Rules:**
- Documentation is part of "done." Never mark a task complete with stale docs
  or an unrun/failing `npx fallow check`.
- Never delete historical cycle entries — append; mark superseded decisions.
- Keep entries concise and scannable. Trivial changes need only one line.

## 5. Command Memory

Do not retry commands that repeatedly fail. Learn from failures instead:

- If a command fails **twice** for the same reason, stop retrying it.
- Record it in the project Playbook under **Known Bad Commands**, with:
  the command, the error, the cause (if known), and the working alternative.
- **Check Known Bad Commands before running any command** — use the recorded
  alternative instead of rediscovering the failure.
- When a command starts working again (e.g., after a fix or version bump),
  mark the entry as resolved — don't delete it.

Example table format:

| Command | Error | Cause | Use instead | Status |
|---|---|---|---|---|
| `npm run test` | script not found | no such script | `npm run test:unit` | active |

## 6. Per-Project Playbook Template

Each project's `Playbook.md` must contain:

- **Overview** — purpose, entry points, key directories
- **Architecture Notes** — module boundaries, sensitive areas, canonical type sources
- **Commands** — install, build, test, dev, lint/typecheck
- **Known Bad Commands** — failing commands and their working alternatives (see §5)
- **Tooling** — project-specific analysis tools and when to run them
- **Cycle History** — append-only entries per §4
- **Open Items** — known issues and follow-ups

---

## Project Context: UsTogether

> Project-specific context is maintained in [`Playbook.md`](Playbook.md). The
> template above (§6) is the contract for that file.

### Quick reference
- **Package:** `ustogether` (Next.js 16 App Router + Firebase + Gemini AI)
- **Entry points:** `app/page.tsx`, `app/dashboard/page.tsx`, `app/stats/page.tsx`, `app/api/*`
- **Canonical types:** `global.d.ts`
- **Security rules:** `firestore.rules`
- **5 foundation docs present:** PRD.md, TECHNICAL_ARCHITECTURE.md, SECURITY_AND_ACCESS.md, FRONTEND_SPEC.md, FEATURE_TICKETS.md ✅
- **Known Bad Commands (current):** `npx fallow check` prints a deprecation warning → use `npx fallow dead-code` (recorded in Playbook.md).