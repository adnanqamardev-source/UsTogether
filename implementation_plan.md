# Implementation Plan

## Overview
Fix two runtime errors blocking the UsTogether app: a Firestore permission-denied on the achievements subcollection, and a 500 Internal Server Error from the Gemini quiz generation API using an invalid model name.

The fixes are surgical and additive: one new security rules entry, one model string correction. No component or API structure changes are required.

---

## Types
No type system changes are needed.

All relevant types already exist:
- `Achievement` in `components/AchievementsPanel.tsx` (fields: `id, title, description, unlockedAt?`)
- API route is standalone; response schema validation is inline.

No new interfaces, enums, or type modifications are required.

---

## Files

### Files to modify:

1. **`firestore.rules`** — Add a new `match` block for the achievements subcollection right after the Users section (around line 49), so the `achievements/{userId}/items/{itemId}` path is explicitly allowed instead of falling through to the global `allow read, write: if false;` safety net.

2. **`app/api/generate-quiz/route.ts`** — Change the invalid model name on line 37 from `"gemini-3-flash-preview"` to a currently available model: `"gemini-2.5-flash"`.

### Files NOT modified:
- All components remain unchanged.
- `implementation_plan.md` is a separate UI polish document and is unrelated.

---

## Functions

No functions are added, removed, or renamed.

### Modified functions:

- **Firestore rules:** Add `match /achievements/{userId}/items/{itemId}` block with:
  - `allow read: if isAuthenticated() && request.auth.uid == userId;`
  - `allow write: if isAuthenticated() && request.auth.uid == userId;`
  - (Optional) Add `isValidAchievement(data)` validation similar to other collections if strict schema enforcement is desired, but the current read-only usage makes this optional.

- **`app/api/generate-quiz/route.ts` `POST()`:** Change `model: "gemini-3-flash-preview"` → `model: "gemini-2.5-flash"`.

---

## Classes
No class modifications.

---

## Dependencies
No dependency changes. The `@google/genai` SDK already supports `gemini-2.5-flash`; no version bump required.

---

## Testing

1. **Firestore规则验证：** 运行 `firebase emulators:exec --only firestore` 或部署后通过 dashboard 加载页验证控制台不再出现 `permission-denied`。
2. **Quiz generation：** 触发一次 quiz 生成（点击 "Fetch New" 或自动加载），确认返回 200 且 JSON 结构正确；无 500 错误。
3. 可以利用 Playwright 现有的 e2e 测试覆盖 couple-dashboard 流程。

---

## Implementation Order

1. **Patch `firestore.rules` first** — Add the achievements match block. This unblocks the frontend from crashing on mount.
2. **Patch `app/api/generate-quiz/route.ts`** — Fix model name. This unblocks quiz generation from throwing 500.
3. **Verify locally** — Run `next dev`, open dashboard, confirm zero console errors for both listeners and quiz fetch.
4. **Optional:** Write a brief entry in `CODEBASE_AUDIT.md` documenting the corrections.