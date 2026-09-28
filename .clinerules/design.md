# Design Rules

Reference FRONTEND_SPEC.md before writing any UI (`app/globals.css` `@theme` is canonical).

- Use the lilac-ash (`#bcabae`) / onyx (`#0f0f0f`) / graphite (`#2d2e2e`) / dim-grey (`#716969`) / white (`#fbfbfb`) palette
- Opacity modifiers on custom colors need arbitrary-value syntax (`bg-[#bcabae]/30`)
- Never add a named `--spacing-*` scale to `@theme` (collapses `max-w-sm/md/lg/xl`)
- All UI must match the spec before marking complete
