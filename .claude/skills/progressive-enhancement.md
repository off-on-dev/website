---
name: progressive-enhancement
description: >
  Load this skill when building any web feature, reviewing architecture
  decisions, or evaluating JavaScript dependencies. Under no circumstances
  build features that break completely when JavaScript is unavailable or fails.
  Absolutely always start with semantic HTML, layer CSS enhancements, and add
  JavaScript as the final, optional layer. Prioritize resilience and universal
  access over cutting-edge features.
source: https://github.com/mgifford/accessibility-skills/blob/main/skills/progressive-enhancement/SKILL.md
---

# Progressive Enhancement Accessibility Skill

Apply these rules when building any web feature or reviewing architecture decisions.

## Core Mandate

Start with a solid foundation that works for every user, then layer enhancements.
Every user — regardless of browser capability, network speed, assistive technology,
or JavaScript availability — must be able to access core content and complete core
tasks.

## Severity Scale

| Level | Meaning |
|---|---|
| **Critical** | Core content or task inaccessible without JS/CSS |
| **Serious** | Core content accessible but significantly degraded without JS/CSS |
| **Moderate** | Enhancement degrades gracefully but with friction |
| **Minor** | Best-practice gap; marginal impact |

## The Three Layers

### Layer 1 — Semantic HTML (always required)

**Failure here is Critical.**

- All core content readable in plain HTML — no CSS or JS required
- Forms submittable with native browser behaviour
- Navigation functions as standard links
- Headings, lists, tables, and landmarks accurately reflect document structure

### Layer 2 — CSS (enhance presentation)

- External stylesheets that can be disabled without losing content
- Respect user preferences: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors`
- Page remains usable if stylesheets fail to load

### Layer 3 — JavaScript (enhance interactivity)

**JS that gates core content or tasks is Critical.**

- JS enhances; it does not gate access to core content or tasks
- Apply JS-dependent classes/behaviours from scripts, not static markup
- Handle script failure gracefully — the HTML layer must still work
- Use feature detection, not browser detection:

```js
if ('fetch' in window && 'querySelector' in document) {
  // apply enhanced experience
}
```

## Critical: Core Content Must Not Require JavaScript

This site uses React Router v7 with `ssr: false` (static prerendering). Pages are
prerendered at build time so content is in the HTML. Verify that:

- Every page's core content is in the prerendered HTML output in `dist/client/`
- No critical information is rendered exclusively client-side after hydration
- Filter/search UI degrades gracefully (content visible even when JS filtering is unavailable)

## Critical: Navigation Must Work Without JavaScript

```html
<!-- Plain links always work -->
<nav aria-label="Main">
  <ul>
    <li><a href="/about">About</a></li>
    <li><a href="/adventures">Adventures</a></li>
  </ul>
</nav>
```

## Moderate: CSS User Preferences Must Be Respected

`prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, and
`forced-colors` are Layer 2 responsibilities. This site handles `prefers-reduced-motion`
via `@media (prefers-reduced-motion: no-preference)` guards in `src/index.css`.
Check that every new animation is gated the same way.

## What to Avoid

- Rendering page content exclusively in client-side JavaScript — **Critical**
- `display:none` / `visibility:hidden` on content required at the HTML layer — **Critical**
- `user-scalable=no` in viewport meta — **Serious** (prevents zoom for low-vision users)
- Assuming scripts will execute — always handle failure states

## Definition of Done Checklist

- [ ] Core content readable with JavaScript disabled
- [ ] Core tasks completable with JavaScript disabled
- [ ] Navigation works as standard HTML links
- [ ] CSS respects `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`
- [ ] Feature detection used (not browser detection)
- [ ] Tested: disable JS → verify core content visible; disable CSS → verify logical reading order

## Key WCAG Criteria

- 2.1.1 Keyboard (A) — native elements have built-in keyboard support
- 4.1.2 Name, Role, Value (A)

> **Note:** WCAG 4.1.1 Parsing was removed in WCAG 2.2. Do not cite it in audits.
