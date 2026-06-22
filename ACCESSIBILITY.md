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
- Color contrast verified at 7:1 for body text and 4.5:1 for large text (both WCAG AAA), and 3:1 for UI controls, in both modes.
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

For every UI change, step through each persona below and verify the listed checks. These are the failure modes axe-core cannot catch. A change is not done until all six personas pass.

#### 1. Screen Reader Navigator (non-visual)

Simulates a user who navigates entirely by audio output.

- Spot-check the changed flow with VoiceOver (macOS/iOS) or NVDA (Windows). See the screen reader quick reference below.
- Every interactive element is announced with its role and accessible name.
- Dynamic content updates (filters, route changes, consent state) are announced without forcibly moving focus.
- Heading order matches the visual reading order with no skipped levels.
- `aria-current="page"` is set on the active nav link, paired with a visible indicator (color change or underline). Never rely on `aria-current` alone — it is invisible to sighted users.
- No vague or duplicate link text ("view", "read more", "click here" alone).

#### 2. Power Keyboard User (motor limit)

Simulates a user who operates the page with Tab, Shift+Tab, Enter, Space, and arrow keys only.

- Tab through the entire changed flow without a mouse. Every interactive element is reachable.
- Tab order follows a logical visual reading order.
- No focus traps. Every trap-like UI (modal, dropdown) has a working Escape exit.
- Focus ring is visible on every interactive element in both light and dark mode.
- After dynamic changes (filter apply, modal close, route change), focus lands on a logical element — not reset to the top of the page.
- Skip link is the first focusable element and is visible on focus.

#### 3. Magnification Expert (low vision)

Simulates a user navigating with browser zoom at 200% and 400%.

- At 400% zoom: no horizontal scrolling required. Content reflows into a single column (WCAG 1.4.10).
- Text is not truncated or clipped at high zoom.
- No sticky/fixed elements that consume more than half the viewport height at 400%.
- Focus ring remains clearly visible at high zoom.
- Verify at 375px, 768px, and 1280px widths against the production build.
- Windows High Contrast Mode: interactive states (hover, focus, disabled) are visible. Do not rely solely on `background-color` or semi-transparent borders.

#### 4. Cognitive Strategist (neurodivergent)

Simulates a user sensitive to clutter, inconsistent UI, and unpredictable behaviour.

- Page title clearly reflects where the user is in the site.
- Multi-step flows (e.g. challenge instructions) have a visible indication of progress or position.
- UI controls are consistent: the same action uses the same element and label across all pages.
- No auto-advancing UI (carousels, auto-dismiss toasts) that interrupts reading without user intent.
- CTA labels clearly state the outcome ("Start the Beginner level" not "Go").
- Error states identify the problem in plain language and suggest a fix — no technical "fail" messages.

#### 5. Vestibular User (motion sensitivity)

Simulates a user for whom animations can trigger motion sickness.

- Every animation and transition in the changed code is gated by `@media (prefers-reduced-motion: no-preference)` in CSS, or by `window.matchMedia('(prefers-reduced-motion: reduce)')` in JS.
- No parallax or scroll-linked motion effects.
- No auto-playing animations triggered without user intent.
- No content that flashes more than three times per second (WCAG 2.3.1).

#### 6. Distracted / Fatigued User (situational limit)

Simulates a user navigating under high cognitive load.

- System status is clear after every action: the user knows whether something succeeded, is loading, or failed.
- Consent and theme state are visually obvious at a glance (the banner or the toggle reflect the current state).
- No session timeouts on this static site — confirm no new timed behaviour has been introduced.
- The purpose of every CTA is unambiguous without surrounding context.

### Screen reader quick reference

Use these commands to run through a changed flow without a full-session setup.

#### VoiceOver on macOS (VO = Caps Lock or Ctrl+Option)

| Task | Keys |
| --- | --- |
| Toggle VoiceOver on/off | Cmd+F5 |
| Read next / previous item | VO+→ / VO+← |
| Navigate to next heading | VO+Cmd+H (and Shift to go back) |
| List all headings | VO+U, then select Headings |
| List all landmarks | VO+U, then select Landmarks |
| List all links | VO+U, then select Links |
| Activate a link or button | VO+Space |
| Enter / exit a web area | VO+Shift+↓ / VO+Shift+↑ |
| Stop speaking | Ctrl |

#### NVDA on Windows (NVDA key = Insert by default)

| Task | Keys |
| --- | --- |
| Toggle NVDA on/off | Ctrl+Alt+N (installer default) |
| Read next / previous item | ↓ / ↑ (browse mode) |
| Navigate to next heading | H (and Shift+H to go back) |
| Navigate to next landmark | D (and Shift+D to go back) |
| List elements dialog | NVDA+F7 |
| Activate a link or button | Enter |
| Toggle browse/focus mode | NVDA+Space |
| Stop speaking | Ctrl |

**What to verify in every changed flow:**

1. Every interactive element is announced with its role (button, link, etc.) and accessible name.
2. Dynamic content updates (state changes, filter results) are announced without forcibly moving focus.
3. No phantom tab stops appear (e.g. from SVGs missing `focusable="false"` or decorative elements missing `aria-hidden`).
4. Heading order matches the visual reading order.

---

## Reporting an Accessibility Barrier

If something on offon.dev blocks you or is hard to use, please tell us.

- **Preferred:** [Open an accessibility issue](https://github.com/off-on-dev/website/issues/new?template=accessibility.yml). The form prompts for the page, your assistive technology, and severity, which helps us reproduce and prioritize.
- **Email:** <offondev@gmail.com> if you cannot or prefer not to use GitHub.

We aim to acknowledge accessibility reports within five working days and to provide a workaround or fix timeline in the same response.

### Severity

| Severity | Definition |
| --- | --- |
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

- Normal text (under 18px / non-bold under 14px): minimum 7:1 (WCAG AAA).
- Large text (18px+ or bold 14px+): minimum 4.5:1 (WCAG AAA).
- UI components and focus indicators: minimum 3:1 against adjacent colors.
- Focus indicators (WCAG 2.4.11): the focus indicator area must be at least as large as a 2px perimeter outline of the component, and the focused/unfocused contrast ratio must be at least 3:1.
- Never use `hsl(41 100% 60%)` (`#ffc034` yellow) as text in light mode. Fails contrast.
- Never place text on `bg-primary` without verifying light mode contrast.
- Never use `opacity-*` on an element that contains visible text. Use an explicit CSS color token instead (e.g. `text-[hsl(var(--text-faint))]`).
- Always verify contrast in both light and dark mode.
- Never rely on color alone to convey meaning. Always pair with text, icon, or pattern.
- **Hover state contrast in light mode:** `hover:text-primary` resolves to amber (`#ffc034`) on a light surface, which fails contrast. Never use `hover:text-primary` on its own. Use `hover:text-foreground dark:hover:text-primary` so light mode gets a dark, accessible color and dark mode gets the amber accent. Apply the same logic to any interactive element whose hover color differs by mode.
- **Icon/indicator colors in light mode:** CSS variables like `--difficulty-builder` are set to a pale tint in light mode (`hsl(85 48% 75%)`) and will be near-invisible on light surfaces. Do not use these variables for icon foreground colors. Use a hardcoded accessible value (e.g. `#15803d` for green) that passes contrast in both modes.

### Focus rings

- Pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm`. Inline elements: `ring-offset-1`.
- Always use `ring-ring`, never `ring-primary/xx`.
- Hover states must not change layout properties (padding, border, font-weight, width). Use color and opacity only.

### Keyboard navigation

Use the correct keys for each control type:

| Control | Required keys |
| --- | --- |
| Button | `Enter`, `Space` |
| Link | `Enter` |
| Checkbox | `Space` to toggle |
| Radio group | Arrow keys to move; `Space` to select |
| Dialog | `Escape` to close; focus trapped inside while open |
| Tab widget | Arrow keys between tabs; `Enter`/`Space` to activate |
| Combobox | Arrow keys in list; `Enter` to select; `Escape` to collapse |

- Every interactive element must be reachable and operable via keyboard.
- Tab order must follow a logical reading order.
- Never remove focus outlines.
- Modals must trap focus while open and return focus to the trigger on close. Use shadcn `Dialog`: verify `inert` is applied to background content, `Escape` closes the modal, and focus moves to the first interactive element on open.
- Dropdown menus must use the Disclosure pattern: `<button aria-expanded="false" aria-controls="submenu-id">` toggling a `<ul id="submenu-id" hidden>`. `Escape` must close the dropdown and return focus to the trigger. Hover-triggered dropdowns must not vanish immediately — use a CSS `transition-delay` of at least 200ms.
- Composite widgets (toolbars, radio groups, tab lists) must use roving tabindex so only one item is in the tab stop at a time and arrow keys move within the group. See [WAI-ARIA APG: Roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex).
- If sticky headers or floating elements exist, ensure focused elements are not fully hidden behind them (WCAG 2.4.12 Focus Not Obscured). Add to CSS: `:focus-visible { scroll-margin-top: var(--sticky-header-height, 4rem); }`

### Touch targets

- Interactive elements must have a minimum touch target of 24x24px (WCAG 2.5.8). Prefer 44x44px for primary actions.
- Never rely on padding alone when the visible element is smaller than 24px.

### Motion

- All animations and transitions must respect `prefers-reduced-motion`.
- Wrap motion in `@media (prefers-reduced-motion: no-preference)` in CSS, or check `window.matchMedia('(prefers-reduced-motion: reduce)')` before triggering JS-driven animation.
- Also respect `prefers-contrast: more` (users requiring higher contrast) and `forced-colors: active` (Windows High Contrast Mode) in any component that communicates state through color or opacity alone. See the Windows High Contrast Mode section.

### Semantic HTML

- Use the correct element for the job (`<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`).
- Never use a `<div>` or `<span>` as an interactive element.
- Never use `role="menu"` or `role="menuitem"` on site navigation. These roles put screen readers into application mode where arrow keys replace Tab, breaking web navigation expectations. Use native `<a>` elements inside `<nav>` instead.
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
- When using `aria-label` on a link, include the visible link text in the label. Voice control users speak visible text to activate links; if the accessible name does not contain that text, the link cannot be activated by voice (WCAG 2.5.3 Label in Name).

### Icons and special characters

- Decorative icons paired with visible text: `aria-hidden="true"`.
- Icon-only interactive elements: `aria-label` on the parent, no `aria-hidden`.
- Never use raw Unicode characters (`→`, `♥`, `✓`) to convey meaning.
- Decorative separators between pill segments: use an empty `<span aria-hidden="true" className="inline-block w-px h-3 bg-current opacity-40" />` instead of a text character.

### SVG

- Always add `focusable="false"` to inline `<svg>` elements. Without it, Internet Explorer and some Edge versions make every SVG tab-focusable, creating phantom tab stops.
- Decorative SVGs (icons next to text, or purely visual): `aria-hidden="true"` and `focusable="false"`. No `<title>`.
- Meaningful SVGs conveying information without adjacent text (e.g. standalone infographics): add `role="img"`, a `<title>` as the first child with a unique `id`, and `aria-labelledby` pointing to that `id`.

  ```tsx
  <svg role="img" aria-labelledby="chart-title" focusable="false">
    <title id="chart-title">Monthly active contributors: 142</title>
    ...
  </svg>
  ```

- Never use `aria-label` directly on `<svg>`. Support across assistive technologies is inconsistent. Use the `<title>` + `aria-labelledby` pattern instead.
- For lucide-react icons: always pass `aria-hidden={true}` when the icon is decorative (next to visible text). For icon-only buttons, put `aria-label` on the parent `<button>` or `<a>`, not on the `<svg>`.
- Brand SVGs (e.g. LinkedIn in `Footer.tsx`): set `aria-hidden="true"` on the `<svg>` and `aria-label` on the parent interactive element. Use `fill="currentColor"` so hover and theme color changes apply. See the Icons section of `styleguide.md`.

### ARIA

- Only add ARIA attributes when semantic HTML is not enough.
- Never use ARIA to paper over bad markup. Fix the markup first.
- Use `role="status"` (implicit `aria-live="polite"`) for non-urgent updates like form success messages.
- Use `role="alert"` (implicit `aria-live="assertive"`) only for errors requiring immediate attention. Never use `aria-live="assertive"` for informational updates.
- Use `aria-expanded` on toggles that open/close UI.
- Always add `aria-label` or `aria-labelledby` to icon-only buttons.
- Preference toggles (theme, consent): announce state changes to screen readers with a `role="status"` live region. Clear the region then set new text after a 50ms delay so screen readers detect the change as a mutation: `region.textContent = ''` → `setTimeout(() => { region.textContent = 'Theme switched to dark mode'; }, 50)`.

### Tooltips

This site uses Radix UI's `<Tooltip>` primitive (via `src/components/ui/tooltip.tsx`). Radix manages `role="tooltip"` and `aria-describedby` automatically when the component is wired up correctly. The rules below cover the cases Radix does not handle for you.

- Always wrap the usage site in `<TooltipProvider>`. Do not mount `<TooltipProvider>` globally in `Layout.tsx`; wrap only the subtree that uses `<Tooltip>`.
- `<TooltipTrigger>` must wrap a real interactive element (`<button>`, `<a>`, or a component that renders one). Never put a non-interactive element like `<span>` or `<div>` as the direct trigger child; screen readers will not announce the tooltip.
- Never put interactive content (buttons, links) inside `<TooltipContent>`. Tooltips are not reachable by touch or keyboard-only users and cannot contain their own focusable children.
- Tooltips must not be the only means of conveying critical information. If the tooltip text is essential to understanding or operating the trigger, surface it as visible text, a label, or an accessible description instead.
- Test that the tooltip appears on both `:hover` and `:focus-visible`. Radix handles this by default; do not override the `defaultOpen`/`open` props in a way that breaks focus triggering.
- Mobile: there is no hover on touch screens. If the tooltip content is not exposed any other way, add visible text or an `aria-label` on the trigger as a fallback.

### Forms

- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` via `for`/`id` pairing or `aria-label`.
- Never use placeholder text as a substitute for a label.

### Skip navigation

- Every page must have a skip link as the first focusable element targeting `#main-content`.
- The skip link uses the `.skip-nav` class in `src/index.css`. Never remove this class or its focus rules.
- When adding a new page, always add `id="main-content" tabIndex={-1}` to its `<main>` element. Without `tabIndex={-1}`, activating the skip link scrolls the page but does not move keyboard focus -- the link is broken for keyboard users in Chromium and Safari.

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

| Principle | Criterion | What to verify |
| --- | --- | --- |
| **Perceivable (1.x)** | 1.1.1 Non-text Content (A) | Every image, icon, and non-text element has a text alternative or `aria-hidden`. |
| | 1.3.1 Info and Relationships (A) | Structure conveyed visually is also in markup (headings, lists, tables). |
| | 1.4.3 Contrast (AA) | Normal text 4.5:1, large text 3:1 against background. |
| | 1.4.4 Resize Text (AA) | Text readable at 200% zoom. Never `user-scalable=no`. |
| | 1.4.10 Reflow (AA) | No horizontal scroll at 400% zoom (320px viewport). |
| | 1.4.11 Non-text Contrast (AA) | UI components and focus indicators: 3:1 against adjacent colors. |
| **Operable (2.x)** | 2.1.1 Keyboard (A) | All functionality is keyboard-accessible. |
| | 2.1.2 No Keyboard Trap (A) | Focus is never permanently trapped; `Escape` exits modals and dropdowns. |
| | 2.3.1 Three Flashes (A) | No content flashes more than 3 times per second. |
| | 2.4.1 Bypass Blocks (A) | Skip link is the first focusable element on every page. |
| | 2.4.3 Focus Order (A) | Tab order follows logical reading order. |
| | 2.4.7 Focus Visible (AA) | All focusable elements have a visible focus indicator. |
| | 2.4.11 Focus Appearance (AA, WCAG 2.2) | Focus indicator is at least 2px, with 3:1 contrast against adjacent colors. |
| | 2.4.12 Focus Not Obscured (AA, WCAG 2.2) | Focused elements are not fully hidden by sticky headers or overlays. |
| | 2.5.3 Label in Name (A) | Accessible name contains the visible text (required for voice control). |
| | 2.5.8 Target Size Minimum (AA, WCAG 2.2) | Touch targets are at least 24×24px. |
| **Understandable (3.x)** | 3.1.1 Language of Page (A) | `<html lang="en">` is set. |
| | 3.3.1 Error Identification (A) | Error messages identify the field and describe the error. |
| | 3.3.2 Labels or Instructions (A) | Form fields have labels; placeholders are not substitutes. |
| **Robust (4.x)** | 4.1.2 Name, Role, Value (A) | ARIA roles and attributes are valid. Dynamic state (`aria-expanded`, `aria-current`) is kept in sync. |
