---
name: user-personalization
description: >
  Load this skill whenever the project has personalization features, user
  preference controls, theme selectors, font size adjusters, motion toggles,
  contrast settings, or any user-configurable accessibility accommodations.
  Under no circumstances override or ignore user OS-level accessibility
  preferences without explicit user consent. Absolutely always persist user
  preferences, apply them immediately, and respect prefers-reduced-motion,
  prefers-contrast, and similar media queries.
source: https://github.com/mgifford/accessibility-skills/blob/main/skills/user-personalization/SKILL.md
---

# User Personalization Accessibility Skill

Apply these rules when implementing user preference controls or reviewing personalization.

## Core Mandate

Users should be able to customize content presentation to meet their individual needs
without compromising information, functionality, or accessibility.

## Severity Scale

| Level | Meaning |
|---|---|
| **Critical** | Overlay used as compliance substitute; interferes with user's AT |
| **Serious** | OS-level preferences (reduced-motion, colour scheme) not respected |
| **Moderate** | Personalization widget not keyboard accessible; state not announced |
| **Minor** | Preferences not persisted; `prefers-reduced-data` not considered |

## Critical: Never Use Accessibility Overlays

Third-party "accessibility overlay" widgets that claim to auto-fix accessibility issues
must not be used. They cannot fix underlying structural issues, actively interfere with
users' own assistive technologies, and are widely rejected by the disability community.
See <https://overlayfactsheet.com/>.

## Serious: CSS Media Queries Must Come First

Respect OS-level preferences before adding any custom controls. This site handles these
in `src/styles/index.css`. Check every new animation or color change against these queries.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-color-scheme: dark) { /* handled by the inline pre-paint script in Layout.astro */ }

@media (prefers-contrast: more) {
  :root {
    --color-text: #000000;
    --color-background: #ffffff;
  }
}

@media (forced-colors: active) {
  .custom-focus-indicator {
    forced-color-adjust: none;
    outline: 2px solid CanvasText;
  }
}
```

## Project-Specific: Theme and Consent State

This site manages two user preferences:

**Theme (light/dark):** Handled by `ThemeToggle.astro` and an inline pre-paint script in `Layout.astro`.
- Stored in `localStorage` under the `theme` key
- The pre-paint script reads it before first paint to avoid FOUC; `ThemeToggle.astro` toggles it via a delegated `click` listener on `document`
- Never read `localStorage` during server-side render — only in the inline pre-paint script or in a `DOMContentLoaded` handler

**Analytics consent:** State lives in the `$consent` nanostore (`src/stores/consent.ts`).
- Stored in `localStorage` under `analytics_consent` key
- `ConsentBanner.astro` is the personalization UI; its `DOMContentLoaded` handler runs `initConsent()` once per full page load to restore stored consent state
- All `localStorage` access must be in `try/catch` blocks

## Moderate: Safe localStorage Pattern

```js
function getStoredPref(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}
function setStoredPref(key, value) {
  try { localStorage.setItem(key, value); }
  catch { /* Preference will not persist — widget still works in session */ }
}
```

## Moderate: Announce State Changes to Screen Readers

When a preference toggle changes state, announce it:

```html
<div aria-live="polite" aria-atomic="true" class="sr-only" id="pref-announcement"></div>
```

```js
function announceChange(message) {
  const region = document.getElementById('pref-announcement');
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 50);
}
```

## Definition of Done Checklist

- [ ] No third-party accessibility overlay used
- [ ] CSS media queries implemented: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors`
- [ ] `localStorage` access wrapped in `try/catch`
- [ ] Preferences restored on `DOMContentLoaded` (never during render)
- [ ] State changes announced via `aria-live="polite"`
- [ ] Personalization controls are keyboard accessible

## Key WCAG Criteria

- 1.4.3 Contrast Minimum (AA)
- 1.4.4 Resize Text (AA)
- 1.4.12 Text Spacing (AA)
- 2.3.3 Animation from Interactions (AAA) — context for `prefers-reduced-motion`
