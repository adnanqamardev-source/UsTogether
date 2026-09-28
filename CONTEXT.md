# CONTEXT.md — UsTogether Domain Model

Glossary for **UsTogether**: a Next.js App Router app where two people (a **Couple**)
take AI-generated quizzes, chat, and collect shared **Memories**.

Types: `global.d.ts` (as `@/types`). Security: `firestore.rules`. Product: `PRD.md`.

**Use these terms, not filenames.** "the Couple pairing module" — not "the
`handlePair` in `Dashboard.tsx`".

---

## Ubiquitous language

| Term | Meaning | Document |
|---|---|---|
| **User** | Google-authenticated person. **Solo** (no `pairedCoupleId`) or **Paired**. | `users/{uid}` → `UserProfile` |
| **Couple** | Two paired Users playing together. | `couples/{coupleId}` → `Couple` |
| **Pairing Code** | Single-use secret a second User redeems to join a first User. | `pairingCodes/{code}` → `PairingCode` |
| **Pairing** | Two Users becoming a Couple: create Couple doc, point both profiles at it, delete the code. | 4-write batch, `features/couple/Dashboard.tsx` |
| **Disconnect** | Reverse of Pairing: clear both `pairedCoupleId`, delete Couple doc. | 3-write batch, `features/couple/CoupleDashboard.tsx` |
| **Membership** | "Am I one of the two Users on this Couple?" | see invariants |
| **Quiz** | Set of `QuizQuestion`s. **AI Quiz** (Gemini, on demand) or **Library Quiz** (stored, public). | `quizzes/{quizId}` → `Quiz` |
| **Session** | One shared round of play. | `couples/{coupleId}/sessions/{sessionId}` |
| **Challenge** | Daily Gemini prompt derived from a Couple's recent quiz history. **Not stored** — cached, per-history. | `/api/generate-challenge` |
| **Chat Message** | Immutable text message. | `couples/{coupleId}/messages/{messageId}` |
| **Typing Status** | Transient presence signal. Any auth User reads; only owner writes. | `couples/{coupleId}/typing/{uid}` |
| **Memory** | Two durable Couple collections: **Memory Photo** and **Milestone**. | `…/memory_photos/{id}`, `…/milestones/{id}` |
| **Achievement** | Per-User badge. Idempotent — only newly-eligible, not-yet-owned definitions are written. | `achievements/{userId}/items/{itemId}` |
| **Streak** | Consecutive days of engagement, on the User profile. | `UserProfile.streak` + `lastActiveDate` (`YYYY-MM-DD`) |
| **Points** | Score for finishing Sessions. Aggregated on `Couple.totalScore`. | **never written** — see divergences |

---

## Load-bearing invariants

These are load-bearing. Breaking one silently locks data or voids a write.

1. **`coupleId` derivation.** `coupleId = [uidA, uidB].sort().join('_')` — always
   the two uids, sorted, underscore-joined. `firestore.rules:133-139` parses
   membership out of the *string* (`request.auth.uid in coupleId.split('_')`).
   A non-canonical `coupleId` locks the Couple out of their own data.
   **Never hand-build one. Always derive it.**
2. **Chat Messages are immutable.** `firestore.rules:182-183` — `allow update: if
   false`, `allow delete: if false`. Read receipts live in `readBy`; nothing else
   changes after send.
3. **Points are not client-writable.** `firestore.rules:74` excludes `points` from
   updates. Treat any client-side point write as a bug.
4. **Session updates freeze on finish.** `firestore.rules:213` — `existing().status
   != 'finished'`. Identity fields (`coupleId`, `type`, `createdAt`) immutable.
5. **Session advances via dotted path.** `state.currentQuestion`, not a full
   `state` replace — `rules:208-211` relies on this.
6. **Answers are write-once per (question, user).** `ActiveSession.handleAnswer`
   guards in-component *and* re-reads server state inside a transaction.
7. **Achievement awarding is idempotent.** Re-check ownership before write.
8. **Users is PII-isolated.** `allow list: if false` (`rules:67`). Read by owner
   only, except the partner-touching `pairedCoupleId` carve-out (`rules:77-81`).

---

## Firestore layout

```
users/{uid}                          UserProfile    PII: get-by-owner only, list:false
pairingCodes/{code}                  PairingCode    single-use secret
quizzes/{quizId}                     Quiz           public library
achievements/{userId}/items/{id}     Achievement    per-User
couples/{coupleId}                   Couple         ← membership derived from ID string
  ├─ messages/{messageId}            ChatMessage    immutable
  ├─ sessions/{sessionId}            Session
  ├─ memory_photos/{photoId}         MemoryPhoto    uploader-only delete
  ├─ milestones/{milestoneId}        Milestone
  └─ typing/{uid}                    TypingStatus   transient
```

**Membership is answered three different ways today** — ID-string parse (rules),
doc-field read (rules fallback), client-side `user1Id === uid`
(`features/couple/CoupleDashboard.tsx`, `features/session/ActiveSession.tsx`). Any module touching Couple
data must answer it consistently.

---

## Known divergences — bugs, not design

Recorded so a future reader doesn't mistake them for intent.

1. **Points are never awarded.** `points` and `Couple.totalScore` are initialised
   to `0` (`lib/shared/firestore-helpers.ts`, `features/couple/Dashboard.tsx`) and **never written
   again**. No scoring path exists, though `rules:74` reserves the field as
   server-only and `app/stats/page.tsx:41` reads it. PRD promises "points awarded;
   scores tracked in real-time" (§5.4 step 7). **Unimplemented.**
2. **Displayed code ≠ stored code.** The UI shows `user.uid.substring(0,8)
   .toUpperCase()` (`features/couple/Dashboard.tsx:28`) but stores a 6-char `generateRandomCode()`
   (`lib/shared/firestore-helpers.ts:189-201`). Typing the on-screen code into the form **cannot
   match** the stored document. Pairing is broken outside demo mode. (Verified still open 2026-09-28.)
3. **Pairing/Disconnect now live in the Couple pairing module**
    (`lib/shared/couple-pairing.ts`): `deriveCoupleId` (canonical id),
    `isMember`/`partnerIdOf` (Membership), `pairWithCode` (4-write Pairing),
    `disconnectCouple` (3-write Disconnect). Callers own UI only — no inline
    id derivation or write composition. → **Deepening target #1 done.**
4. **Overlapping demo mechanisms remain in part:** `next.config.js` is now the single
   config (the dead `next.config.ts` was deleted) and all raw env reads route through
   `isDemo` (`lib/firebase/client.ts`, hard-off on real Vercel production via a
   `VERCEL_ENV` build guard). Still overlapping: 16 any-typed re-exports branching on
   `isDemo` (`lib/firestore.ts`) and hook-level path string-matching
   (`useFirestoreCollection.ts:44-47`, which `includes('sessions')`). → **Target #2.**
5. **Model strings drifted:** `gemini-1.5-flash` (`generate-quiz/route.ts:84`) vs
   `gemini-3-flash-preview` (`generate-challenge/route.ts:45`, `chat/route.ts:58`). → **Target #5.**
   (Verified still open 2026-09-28.)
6. **Migration shims removed (resolved 2026-09-28).** The ~27 one-line
   re-exports at `lib/*.ts` and `components/*.tsx` (plus
   `scripts/generate_shims.cjs`, `scripts/update_shims.py`, and the
   `fix_*.py` import-rewrite helpers) were deleted. One import path per
   module: `@/lib/shared/*` (shared), `@/lib/server/*` (server-only),
   `@/lib/firebase/client`, `@/lib/firestore` (demo-aware seam);
   `@/components/features/...`, `@/components/shared/...`,
   `@/components/providers`, `@/components/auth/...`. Tests mock only
   the canonical paths.
7. **`reset-data` targets the wrong paths.** `app/api/reset-data/route.ts:30`
   reads a top-level `memory_photos` collection; photos actually live at
   `couples/{coupleId}/memory_photos`. It also misses `couples/*/messages`,
   `sessions`, `milestones`, and `typing`. **Leaves orphaned data behind.**
   (Verified still open 2026-09-28.)

---

## Resolved 2026-09-28 — do not regress

- **Demo lock:** `isDemo` hard-off on real Vercel production; `next.config.js`
  fails that build outright. CI E2E intentionally builds with the demo flag
  (guard keys off `VERCEL_ENV`, not `NODE_ENV`).
- **Chunk staleness:** `ErrorBoundary` reloads once on `ChunkLoadError`
  (sessionStorage-guarded); quiz views load via `next/dynamic`.
- **Chat entry points:** exactly one on mobile — `BottomNav`. `ChatFAB` deleted.
- **Palette:** lilac-ash/onyx/graphite/dim-grey/white, tokens in
  `app/globals.css` (`@theme`). No `rose-*`/`indigo-*`/`slate-*` in components.

---

## Architecture vocabulary

Per the `codebase-design` skill. Use these words precisely — not "component",
"service", "API", or "boundary".

- **Module** — anything with an interface and an implementation (function, file,
  folder). Deliberately scale-agnostic.
- **Interface** — everything a caller must know: signature *plus* invariants, error
  modes, ordering constraints, config. **The interface is the test surface.**
- **Depth** — leverage per unit of interface. **Deep** = much hidden behind little.
  **Shallow** = interface about as complex as the body.
- **Seam** — a place you can change behaviour without editing in that place.
- **Adapter** — a concrete thing satisfying an interface at a seam (Firestore
  adapter vs in-memory demo adapter).
- **Leverage** — what callers gain from depth. **Locality** — what maintainers
  gain: change, bugs, and verification concentrate in one place.
- **The deletion test** — delete it. Complexity vanishes → it was a pass-through.
  Complexity reappears across N callers → it was earning its keep.
- **One adapter is a hypothetical seam; two adapters is a real one.**
