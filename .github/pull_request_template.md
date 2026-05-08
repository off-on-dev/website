## Summary

<!-- One or two sentences on what this PR changes and why. -->

## Type of change

- [ ] `feat` new feature
- [ ] `fix` bug fix
- [ ] `refactor` no behavior change
- [ ] `docs` documentation only
- [ ] `chore` / `config` / `perf` / `style` / `security`

## Accessibility checklist

For any change that touches the UI, copy, or routing, confirm the following before requesting review. See [`ACCESSIBILITY.md`](../ACCESSIBILITY.md) and the [Accessibility section in `CLAUDE.md`](../CLAUDE.md#accessibility-wcag-22-aa-mandatory) for the full rules.

- [ ] Every interactive element is reachable and operable with the keyboard alone.
- [ ] Focus rings are visible in both light and dark mode (use the `ring-ring` token).
- [ ] One `<h1>` per page, no skipped heading levels.
- [ ] Every `<img>` has an `alt` attribute. Decorative images use `alt=""` paired with `aria-hidden="true"`.
- [ ] Every `<a target="_blank">` includes `<span className="sr-only"> (opens in new tab)</span>`.
- [ ] No raw Unicode symbols (such as arrows, hearts, checkmarks) used to convey meaning. Use `lucide-react` icons with `aria-hidden`, or visible text.
- [ ] Color is not the only way meaning is conveyed.
- [ ] Verified visually at mobile (375px), tablet (768px), and desktop (1280px) widths.
- [ ] If animations were added or changed, `prefers-reduced-motion` is respected.

## Quality gates

- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` completes with no TypeScript or build errors.
- [ ] If routes were added or changed: updated [`public/sitemap.xml`](../public/sitemap.xml), the `prerender` array in [`react-router.config.ts`](../react-router.config.ts), and the routes table in [`README.md`](../README.md).
- [ ] If a new component, hook, constant, or workflow was added or changed: updated [`styleguide.md`](../styleguide.md) and/or [`README.md`](../README.md) per the After Making Changes section in [`CLAUDE.md`](../CLAUDE.md#after-making-changes).

## Screenshots or recordings

<!-- Required for visual changes. Capture both light and dark mode where relevant. -->

## Testing notes

<!-- Anything reviewers should know to verify locally. Reproduction steps for bug fixes. -->
