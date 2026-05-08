# Accessibility Statement

OffOn is a platform for open source enthusiasts. We want everyone to be able to read, browse, and contribute, regardless of disability, assistive technology, or device. This document explains what we support today, how we test, and how to tell us when we get it wrong.

## Our Commitment

- **Target:** [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) across every page on [offon.dev](https://offon.dev).
- **Both color modes:** light and dark mode must meet contrast and focus requirements. We do not ship a feature that only works in one mode.
- **Keyboard first:** every interactive element is reachable and operable from the keyboard alone.
- **No motion traps:** we honor `prefers-reduced-motion` and avoid auto-playing animation that the user did not request.

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

## Supported Environments

- Modern evergreen browsers: Chrome, Edge, Firefox, Safari (current and previous major versions).
- Mobile web on iOS Safari and Android Chrome.
- Screen readers we test against during manual spot checks: VoiceOver on macOS and iOS, NVDA on Windows.
- The site is fully static and served from GitHub Pages, so it works without JavaScript for reading content. Some interactive features (theme toggle, consent banner, filtering) require JavaScript.

## Known Limitations

- We do not currently provide captions or transcripts because the site does not host video or audio. If we add media, captions and transcripts will ship with it.
- The community discussion content is hosted on a separate Discourse instance and follows its own accessibility status.

If you find a barrier that is not listed here, please report it using the link below. We treat this list as evidence-based, not aspirational.

## How We Test

### Automated

- **axe-core via Playwright** on every pull request, configured in [`e2e/smoke.spec.ts`](e2e/smoke.spec.ts). Runs in both dark and light mode against the production build. The PR preview workflow blocks on these scans.
- **Vitest** assertions on landmark roles, labels, and focus behavior for components and hooks ([`src/test/`](src/test/)).
- **ESLint** with React and JSX accessibility rules.

### Manual

For UI changes, contributors verify:

- Tab order matches the visual reading order.
- Focus is visible on every interactive element in both modes.
- The page works at 200% browser zoom and at 375px, 768px, and 1280px widths.
- Screen reader spot check on the changed flow (VoiceOver or NVDA).

See the [Accessibility section in `CLAUDE.md`](CLAUDE.md#accessibility-wcag-22-aa-mandatory) for the full per-component checklist contributors apply.

## Reporting an Accessibility Barrier

If something on offon.dev blocks you or is hard to use, please tell us.

- **Preferred:** [Open an accessibility issue](https://github.com/off-on-dev/website/issues/new?template=accessibility.yml). The form prompts for the page, your assistive technology, and severity, which helps us reproduce and prioritize.
- **Email:** offondev@gmail.com if you cannot or prefer not to use GitHub.

We aim to acknowledge accessibility reports within five working days and to provide a workaround or fix timeline in the same response.

### Severity We Use

| Severity | Definition |
|---|---|
| Critical | Blocks a user from completing a core task (reading content, navigating to a challenge, accepting consent). |
| High | Significant difficulty, but a workaround exists. |
| Medium | Inconsistent or annoying experience that does not block the task. |
| Low | Minor issue with minimal impact on usability. |

## For Contributors

If you are submitting a pull request, every UI change should pass the checklist in our [pull request template](.github/pull_request_template.md). The full ruleset lives in [`CLAUDE.md`](CLAUDE.md#accessibility-wcag-22-aa-mandatory) and applies to every change.

Thank you for helping us make OffOn usable by everyone.
