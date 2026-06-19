# Implementation Plan

[Overview]
Transform UsTogether into a polished, culturally resonant couples app with a premium UI, desi-themed AI interactions, and smooth perceived performance.

This plan addresses the "box-in-box" UI anti-pattern, navbar zoom collapse, chat overlap on mobile, uneven card grid layouts, generic AI content, JSON AI crashes, and slow perceived loading. It introduces ambient background glows, culturally-tuned loading states, skeleton loaders, AI text streaming via Vercel AI SDK, and culturally-specific quiz/challenge prompts for Gemini.

[Types]
No new TypeScript types or interfaces are required; existing component props and Firebase data shapes remain unchanged. The AI response schema will be updated to enforce structured JSON output.

[Files]
- `components/CoupleDashboard.tsx` — Remove the giant inner card wrapper, add ambient background glows, fix navbar shrink behavior with responsive classes, restructure chat into a full-height sidebar with backdrop.
- `components/ChatDrawer.tsx` — Convert from floating card to full-height right sidebar with dark backdrop overlay.
- `components/QuizList.tsx` — Replace flex layout with CSS grid for consistent card sizing at all zoom levels.
- `components/MemoryBoard.tsx` — Same grid replacement as QuizList.
- `app/api/generate-quiz/route.ts` — Create new API route with desi-themed system prompt and Gemini structured output.
- `app/api/generate-challenge/route.ts` — Create new API route with culturally resonant challenge prompts and structured output.
- `components/QuizCardSkeleton.tsx` — New skeleton loader component mirroring quiz card structure.
- `app/api/chat/route.ts` — Update to include 24-hour icebreaker auto-injection logic and desi-themed loading states.
- `package.json` — Add `ai` SDK dependency for streamText.

[Functions]
- `CoupleDashboard` (components/CoupleDashboard.tsx) — Remove the `rounded-[40px] bg-white/5 border border/10 shadow-2xl` wrapper div; replace outer container with `max-w-6xl mx-auto w-full flex-1 relative min-h-screen`; add ambient glows via fixed positioned divs with `bg-rose-900/15 blur-[120px]`; add `shrink-0` to logo, auth buttons, and `whitespace-nowrap` to nav text; add `hidden sm:flex` to center links with hamburger fallback.
- `ChatDrawer` (components/ChatDrawer.tsx) — Restructure from floating bubble to `fixed right-0 top-0 h-full max-w-sm` sidebar with `fixed inset-0 bg-black/60` backdrop; keep chat panel inside.
- `QuizList` (components/QuizList.tsx) — Replace flex/grid cards with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`; integrate `QuizCardSkeleton` during loading.
- `MemoryBoard` (components/MemoryBoard.tsx) — Same grid replacement.
- `generateQuiz` (app/api/generate-quiz/route.ts) — New POST handler calling Gemini with desi-themed system instructions and `responseSchema` enforcing JSON array output.
- `generateChallenge` (app/api/generate-challenge/route.ts) — New POST handler calling Gemini with desi romance system instructions, `responseSchema` enforcing JSON object with `title`, `description`, `desiTwist`, `penalty` fields.
- `streamChallengeText` (app/api/generate-challenge/route.ts) — New helper using `streamText` from Vercel AI SDK for typewriter effect.
- `icebreakerCheck` (app/api/chat/route.ts) — Helper checking last message timestamp; auto-injects culturally themed prompt if >24h gap.

[Classes]
- `QuizCardSkeleton` (components/QuizCardSkeleton.tsx) — New component: card-shaped div with `animate-pulse bg-white/5 rounded-2xl`, matching the structural shape of a real quiz card with placeholder lines.

[Dependencies]
- Add `ai` (latest) to `dependencies` in package.json for Vercel AI SDK `streamText`.
- No other dependency changes; `@google/genai` is already present.

[Testing]
Manual browser testing across zoom levels (100%, 125%, 150%), mobile widths, and dark/light contrast. Verify AI endpoints return valid JSON. Verify streaming renders incrementally. Verify chat sidebar does not overlap main content. Verify quiz/memory grids remain uniform.

[Implementation Order]
1. Remove box-in-box layout from CoupleDashboard.tsx and add ambient glows.
2. Fix navbar zoom collapse classes in CoupleDashboard.tsx.
3. Restructure ChatDrawer.tsx to full-height sidebar with backdrop.
4. Replace flex with grid in QuizList.tsx and MemoryBoard.tsx; create QuizCardSkeleton.tsx.
5. Create app/api/generate-quiz/route.ts with desi prompt and structured output.
6. Create app/api/generate-challenge/route.ts with desi prompt, structured output, and streamText.
7. Update app/api/chat/route.ts with 24-hour icebreaker and desi loading states.
8. Update package.json with `ai` SDK.
9. Final visual QA across breakpoints and zoom levels.