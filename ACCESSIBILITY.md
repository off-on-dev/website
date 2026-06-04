# Accessibility

OffOn is a platform for open source enthusiasts. We want everyone to be able to read, browse, and contribute, regardless of disability, assistive technology, or device. This document explains what we support today, how we test, and how to tell us when we get it wrong.

---

## Our Commitment

- **Target:** [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) across every page on [offon.dev](https://offon.dev). WCAG 2.2 AA is the floor, not the goal. Every component must be genuinely usable by keyboard-only users, screen reader users, and people with low vision.
- **Both color modes:** light and dark mode must meet contrast and focus requirements. We do not ship a feature that only works in one mode.
- **Keyboard first:** every interactive element is reachable and operable from the keyboard alone.
- **No motion traps:** we honor `prefers-reduced-motion` and avoid auto-playing animation that the user did not request.

---

## What We Support Today

- Skip-to-content link as the first focusable element on every page.
- Visible focus rings on all interactive elements, in both light and dark mode.
- Semantic landmarks: one `<main id="main-content">`, plus `<nav>`, `<header>`, `<footer>`, `<section>`, and `<article>` where appropriate.
- One `<h1>` per page with no skipped heading levels.
- Meaningful `alt` text on informational images, empty `alt=""` paired with `aria-hidden="true"` on decorative ones.
- Screen reader announcement of links that open in a new tab.
- Color contrast verified at 4.5:1 for body text and 3:1 for large text and UI controls in both modes.
- Tested with [axe-core](https://github.com/dequelabs/axe-core) on every pull request preview, in both light and dark mode.
- Self-hosted fonts so users on restricted networks are not locked out.
- Google Analytics is opt-in only via the consent banner. No tracking runs until the user accepts.

---

## Supported Environments

- Modern evergreen browsers: Chrome, Edge, Firefox, Safari (current and previous major versions).
- Mobile web on iOS Safari and Android Chrome.
- Screen readers we test against during manual spot checks: VoiceOver on macOS and iOS, NVDA on Windows.
- The site is fully static and served from GitHub Pages, so it works without JavaScript for reading content. Some interactive features (theme toggle, consent banner, filtering) require JavaScript.

---

## Known Limitations

- We do not currently provide captions or transcripts because the site does not host video or audio. If we add media, captions and transcripts will ship with it.
- The community discussion content is hosted on a separate Discourse instance and follows its own accessibility status.

If you find a barrier that is not listed here, please report it using the link below. We treat this list as evidence-based, not aspirational.

---

## How We Test

### Automated

- **axe-core via Playwright** on every pull request, configured in [`e2e/smoke.spec.ts`](e2e/smoke.spec.ts). Runs in both dark and light mode against the production build with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`. The PR preview workflow blocks on these scans. Never reduce this tag set.
- **Vitest** assertions on landmark roles, labels, and focus behavior for components and hooks ([`src/test/`](src/test/)).

Automated axe passes are necessary but not sufficient. Automated tools catch roughly 30–40% of real-world accessibility issues. Manual testing is required for every interactive component.

### Manual

For every UI change, contributors must verify:

1. **Keyboard-only navigation:** tab through the entire changed flow without a mouse. Tab order matches the visual reading order. No focus traps. Every interactive element is reachable and operable.
2. **Focus visibility:** focus ring is visible on every interactive element in both light and dark mode.
3. **Screen reader:** spot-check the changed flow with VoiceOver (macOS/iOS) or NVDA (Windows). Dynamic content updates are announced correctly.
4. **Zoom:** the page works at 200% browser zoom without content clipping or layout breakage.
5. **Viewports:** verify at 375px, 768px, and 1280px widths against the production build.
6. **Windows High Contrast Mode:** interactive states (hover, focus, disabled) are visible. Do not rely solely on background-color or semi-transparent borders to communicate state.

---

## Reporting an Accessibility Barrier

If something on offon.dev blocks you or is hard to use, please tell us.

- **Preferred:** [Open an accessibility issue](https://github.com/off-on-dev/website/issues/new?template=accessibility.yml). The form prompts for the page, your assistive technology, and severity, which helps us reproduce and prioritize.
- **Email:** offondev@gmail.com if you cannot or prefer not to use GitHub.

We aim to acknowledge accessibility reports within five working days and to provide a workaround or fix timeline in the same response.

### Severity

| Severity | Definition |
|---|---|
| Critical | Blocks a user from completing a core task (reading content, navigating to a challenge, accepting consent). |
| High | Significant difficulty, but a workaround exists. |
| Medium | Inconsistent or annoying experience that does not block the task. |
| Low | Minor issue with minimal impact on usability. |

---

## For Contributors

Every UI change must pass the checklist below before the PR is submitted. See [`CLAUDE.md`](CLAUDE.md) for project conventions.

---

## Contributor Checklist (Required for Every New Component)

Apply this to every component you write or modify.

### Color contrast

- Normal text (under 18px / non-bold under 14px): minimum 4.5:1.
- Large text (18px+ or bold 14px+): minimum 3:1.
- UI components and focus indicators: minimum 3:1 against adjacent colors.
- Focus indicators (WCAG 2.4.11): the focus indicator area must be at least as large as a 2px perimeter outline of the component, and the focused/unfocused contrast ratio must be at least 3:1.
- Never use `hsl(41 100% 60%)` (`#ffc034` yellow) as text in light mode — fails contrast.
- Never place text on `bg-primary` without verifying light mode contrast.
- Never use `opacity-*` on an element that contains visible text. Use an explicit CSS color token instead (e.g. `text-[hsl(var(--text-faint))]`).
- Always verify contrast in both light and dark mode.
- Never rely on color alone to convey meaning. Always pair with text, icon, or pattern.

### Focus rings

- Pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm`. Inline elements: `ring-offset-1`.
- Always use `ring-ring`, never `ring-primary/xx`.
- Hover states must not change layout properties (padding, border, font-weight, width). Use color and opacity only.

### Keyboard navigation

- Every interactive element must be reachable and operable via keyboard.
- Tab order must follow a logical reading order.
- Never remove focus outlines.
- Modals must trap focus while open and return focus on close. Use shadcn `Dialog`.

### Touch targets

- Interactive elements must have a minimum touch target of 24x24px (WCAG 2.5.8). Prefer 44x44px for primary actions.
- Never rely on padding alone when the visible element is smaller than 24px.

### Motion

- All animations and transitions must respect `prefers-reduced-motion`.
- Wrap motion in `@media (prefers-reduced-motion: no-preference)` in CSS, or check `window.matchMedia('(prefers-reduced-motion: reduce)')` before triggering JS-driven animation.

### Semantic HTML

- Use the correct element for the job (`<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`).
- Never use a `<div>` or `<span>` as an interactive element.
- One `<h1>` per page. No skipped heading levels.
- Every `<section>` and `<article>` must have an accessible name via `aria-labelledby` pointing to its heading, or `aria-label` if there is no visible heading. An unnamed `<section>` is not exposed as a landmark to screen readers.
- Never apply overline/label typography (`text-sm uppercase tracking-widest`) to a heading tag. If the text is a genuine section heading, give it heading-appropriate typography. If it is purely decorative, use `<span>` or `<p>`.
- Never use a non-heading tag for text visually styled as a heading. Promote it to the correct heading level.
- Every page's primary content must live inside a single `<main id="main-content">`. Do not split content across multiple `<main>` elements.
- `<html lang="en">` is set in `src/root.tsx`. Never remove or change it. If a page includes content in another language, add `lang` to that element.
- Tables must include `<caption>` or `aria-label`, and header cells must use `scope="col"` or `scope="row"`.

### Images and media

- Every `<img>` must have an `alt` attribute. No exceptions.
- Meaningful images: `alt` describes the content or purpose.
- Decorative images: `alt=""` AND `aria-hidden="true"` together.
- Never use `aria-hidden="true"` when alt text is present.
- Set explicit `width` and `height` on every `<img>` to prevent layout shift.

### External links

- Every `<a target="_blank">` must include `<span className="sr-only"> (opens in new tab)</span>` as its last child.

### Links

- Every link's text must describe its destination. Never use "click here", "read more", or "more" alone as link text.
- When link text is ambiguous in isolation (e.g. "View" repeated on every card), add `aria-label` on the `<a>` to provide a full, descriptive accessible name.
- Every `<a>` element must have an accessible name (text content, `aria-label`, or `aria-labelledby`). An `<a>` with no accessible name is invisible to screen readers and cannot be operated by voice control.

### Icons and special characters

- Decorative icons paired with visible text: `aria-hidden="true"`.
- Icon-only interactive elements: `aria-label` on the parent, no `aria-hidden`.
- Never use raw Unicode characters (`→`, `♥`, `✓`) to convey meaning.
- Decorative separators between pill segments: use an empty `<span aria-hidden="true" className="inline-block w-px h-3 bg-current opacity-40" />` instead of a text character.

### ARIA

- Only add ARIA attributes when semantic HTML is not enough.
- Never use ARIA to paper over bad markup. Fix the markup first.
- Use `role="status"` (implicit `aria-live="polite"`) for non-urgent updates like form success messages.
- Use `role="alert"` (implicit `aria-live="assertive"`) only for errors requiring immediate attention. Never use `aria-live="assertive"` for informational updates.
- Use `aria-expanded` on toggles that open/close UI.
- Always add `aria-label` or `aria-labelledby` to icon-only buttons.

### Forms

- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` via `for`/`id` pairing or `aria-label`.
- Never use placeholder text as a substitute for a label.

### Skip navigation

- Every page must have a skip link as the first focusable element targeting `#main-content`.
- The skip link uses the `.skip-nav` class in `src/index.css`. Never remove this class or its focus rules.
- When adding a new page, always add `id="main-content"` to its `<main>` element.

### Hidden until found

- For collapsible sections that should remain discoverable by browser find-in-page and screen readers, use `hidden="until-found"` instead of `display: none` or `visibility: hidden`. The browser auto-expands the section when the user searches for content inside it.
- Do not use `hidden="until-found"` for content that must be genuinely hidden until an explicit interaction (e.g. a confirmation dialog). Use `display: none` for those cases.

### Accessibility overlays

- Never install third-party JavaScript "accessibility overlay" widgets that claim to auto-remediate WCAG issues at runtime. They do not reliably fix issues, frequently create new barriers for screen-reader users, and are not a substitute for genuine compliance work.

### Windows High Contrast Mode

- Test all interactive components with forced colors enabled.
- Never rely solely on `background-color` or `border-color` with opacity to communicate interactive state.
- Use `@media (forced-colors: active)` to restore visible borders where needed:
  ```css
  @media (forced-colors: active) {
    .your-component { border: 1px solid ButtonText; }
  }
  ```

### Minimum text size

- Minimum visible text size is 12px (`text-xs`). Do not use `text-[0.6rem]` or smaller for any visible text.
- Avatar initials and rank numbers that are `aria-hidden` are exempt.

### Page content structure

- All page content (including `PageHero` and `BottomCTA`) must be inside `<main id="main-content">`.

---

## WCAG Principle Reference

Use this to identify which criterion applies before writing or reviewing code.

| Principle | What to verify |
|---|---|
| **Perceivable (1.x)** | Every non-text element has a text alternative. Color is not the only means of conveying information. |
| **Operable (2.x)** | Every interactive element is keyboard-operable. No keyboard trap. Focus indicator is always visible. Touch targets are large enough. Motion can be disabled. |
| **Understandable (3.x)** | Error messages identify the field, describe the error, and suggest a correction. State is never communicated by color alone. |
| **Robust (4.x)** | ARIA usage is valid for the host element. Dynamic content updates are announced without forcibly moving focus. |
