# Architecture Rules

## Project Context

- **Package:** `ustogether` (Next.js 16 App Router + Firebase + Gemini AI)
- **Entry points:** `app/page.tsx`, `app/dashboard/page.tsx`, `app/stats/page.tsx`, `app/api/*`
- **Canonical types:** `global.d.ts`
- **Security rules:** `firestore.rules`
- **5 foundation docs present:** PRD.md, TECHNICAL_ARCHITECTURE.md, SECURITY_AND_ACCESS.md, FRONTEND_SPEC.md, FEATURE_TICKETS.md ✅

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `lib/` | Firebase/DB helpers, auth, rate limiting |
| `components/` | UI components |
| `hooks/` | Firestore listeners |
| `app/api/` | Server routes |

## Architecture Notes

- Client Firebase SDK in `lib/firebase.ts`; server Admin SDK in `lib/admin.ts`
- Firestore security rules in `firestore.rules` ("2" rules_version)
- Real-time data via `useFirestoreCollection` / `useFirestoreDocument` hooks
- Canonical types live in `global.d.ts`
- `lib/firestore-helpers.ts` is a client module ("use client")
- All API payloads schema-validated before processing
- No secrets in the client bundle