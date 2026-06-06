---
name: navigation
description: >
  Load this skill whenever the project contains navigation components —
  primary navigation menus, dropdown menus, breadcrumbs, pagination, mobile
  hamburger menus, or in-page jump navigation. Under no circumstances create
  navigation without proper landmark roles, keyboard support, and accessible
  labels. Absolutely always wrap navigation in <nav> with a unique aria-label.
source: https://github.com/mgifford/accessibility-skills/blob/main/skills/navigation/SKILL.md
---

# Navigation Accessibility Skill

Apply these rules when creating or reviewing navigation patterns.

## Severity Scale

| Level | Meaning |
|---|---|
| **Critical** | Navigation completely unreachable or creates a keyboard trap |
| **Serious** | Dropdown only works on hover; `role="menu"` misused; no `aria-current` |
| **Moderate** | Missing `aria-label` on secondary nav; breadcrumb not labelled |
| **Minor** | Nav item count exceeds 7; inconsistent `aria-expanded` update |

## Critical: Landmark Structure

Every page must have navigational landmarks.

```html
<!-- Skip link — always first in <body> -->
<a class="skip-link" href="#main-content">Skip to main content</a>

<header role="banner">
  <nav aria-label="Main">
    <ul>
      <li><a href="/" aria-current="page">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main id="main-content" tabindex="-1">…</main>

<nav aria-label="Footer">…</nav>
```

Rules:
- `<nav>` wraps every navigation region
- When multiple `<nav>` elements are present, every one needs a unique `aria-label`
- `aria-label` must be short and descriptive: "Main", "Footer", "Breadcrumb" — not "Navigation menu"

## Serious: `aria-current="page"`

The current page link must be identified programmatically. Use `aria-current="page"` on
the active link in every `<nav>`. Also provide a **visual** indicator — never rely on
`aria-current` alone.

## Serious: Do Not Use `role="menu"` for Site Navigation

`role="menu"` signals a desktop-application-style menu. It puts screen readers into
application-menu interaction mode where arrow keys navigate (not Tab), which breaks the
expected mental model for web navigation.

Standard site navigation uses native `<a>` elements in `<ul>` lists inside `<nav>`. No
ARIA menu roles needed.

```html
<!-- Wrong -->
<ul role="menu">
  <li role="menuitem"><a href="/about">About</a></li>
</ul>

<!-- Right -->
<nav aria-label="Main">
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

## Serious: Disclosure Dropdown Pattern

Use the Disclosure pattern (not the APG Menubar pattern) for dropdown submenus.

```html
<button type="button"
        aria-expanded="false"
        aria-controls="services-submenu">
  Services
</button>
<ul id="services-submenu" hidden>
  <li><a href="/services/web">Web</a></li>
</ul>
```

- `Escape` must close the dropdown and return focus to the trigger
- Never mix link and dropdown trigger on a single element
- Hover dropdowns must not disappear immediately — add `transition-delay: 0.2s`

## Voice Control: Label in Name (WCAG 2.5.3)

Dragon NaturallySpeaking and iOS Voice Control navigate by speaking visible link text.
If `aria-label` differs from visible text, the user cannot activate the link by speaking
what they see. **The accessible name must contain the visible text.**

## SPA/React Router Note

After route changes, screen reader users hear nothing unless focus is managed. When React
Router navigates, move focus to the new page's `<h1>` or the skip link target, and ensure
the page title updates. This is already handled by React Router v7's framework mode —
verify it is not broken when adding new routes.

## Definition of Done Checklist

- [ ] `<nav>` landmark wraps every navigation region
- [ ] Every `<nav>` has a unique, descriptive `aria-label`
- [ ] Skip link: first in DOM, visible on focus, target has `tabindex="-1"`
- [ ] `aria-current="page"` on current page link in every nav
- [ ] `role="menu"` / `role="menuitem"` not used on site navigation
- [ ] Dropdowns use Disclosure pattern: `aria-expanded`, `aria-controls`, `hidden`
- [ ] `Escape` closes dropdown and returns focus to trigger
- [ ] Voice Control tested: all links activatable by speaking visible text
- [ ] Screen magnification tested at 200%: nav not covering content

## Key WCAG Criteria

- 2.4.1 Bypass Blocks (A)
- 2.4.3 Focus Order (A)
- 2.4.7 Focus Visible (AA)
- 2.4.11 Focus Appearance (AA, WCAG 2.2)
- 2.5.3 Label in Name (A)
- 4.1.2 Name, Role, Value (A)
