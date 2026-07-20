---
name: keyboard
description: >
  Load this skill for every project containing interactive UI elements —
  buttons, links, modals, dropdowns, sliders, tabs, carousels, or any
  custom widget. Under no circumstances create an interactive component that
  cannot be fully operated by keyboard alone. Absolutely always ensure visible
  focus indicators, logical tab order, and no keyboard traps.
source: https://github.com/mgifford/accessibility-skills/blob/main/skills/keyboard/SKILL.md
---

# Keyboard Accessibility Skill

Apply these rules to every interactive UI element and feature.

## Severity Scale

| Level | Meaning |
|---|---|
| **Critical** | Blocks task completion entirely for keyboard and AT users |
| **Serious** | Significantly impairs keyboard access; workaround unreasonable |
| **Moderate** | Creates friction for keyboard users; workaround exists |
| **Minor** | Best-practice gap; marginal keyboard impact |

## Critical: No Keyboard Trap

Users must never become unable to move focus away from a component using standard keys
(Tab, Shift+Tab, Escape, arrow keys). The only exception is an intentional modal dialog
trap where Escape closes the dialog and returns focus to the trigger.

## Critical: Expected Key Behaviours

| Control | Required keys |
|---|---|
| Button | `Enter`, `Space` |
| Link | `Enter` |
| Checkbox | `Space` to toggle |
| Radio group | Arrow keys to move; `Space` to select |
| Dialog | `Escape` to close; focus trapped inside while open |
| Tab widget | Arrow keys between tabs; `Enter`/`Space` to activate |
| Combobox | Arrow keys in list; `Enter` to select; `Escape` to collapse |

## Critical: Dialog Focus Management

Prefer the `inert` attribute (baseline 2023, supported in all modern browsers).

```js
function openDialog(dialog, trigger) {
  document.querySelectorAll('body > *:not(#dialog-container)')
    .forEach(el => el.setAttribute('inert', ''));
  dialog.removeAttribute('hidden');
  dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
}

function closeDialog(dialog, trigger) {
  document.querySelectorAll('[inert]').forEach(el => el.removeAttribute('inert'));
  dialog.setAttribute('hidden', '');
  trigger.focus();
}

dialog.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDialog(dialog, trigger);
});
```

This site uses shadcn `Dialog` (Radix UI) for modals. Radix handles focus trapping
automatically. Verify `inert` is applied to background content and `Escape` works.

## Serious: Focus Visibility

Every focusable element must have a clear, persistent visible focus indicator.
This project uses the pattern:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm
```
Never remove this. Never substitute `ring-primary/xx` for `ring-ring`.

WCAG 2.4.11 minimum: 2px thick, 3:1 contrast against adjacent colours, visible in both modes.

## Serious: Focus Not Obscured (WCAG 2.4.12)

Sticky headers or floating elements can cover the focused element. If this site gains
a sticky header, add:

```css
:focus { scroll-margin-top: var(--sticky-header-height, 4rem); }
```

## Serious: Focus Order

- Use semantic DOM order as the primary mechanism
- Never use positive `tabindex` values — they override DOM order globally
- `tabindex="0"` — only to make custom widgets focusable
- `tabindex="-1"` — only for programmatic focus targets (skip link anchors, modal management)

## Serious: Roving Tabindex for Composite Widgets

Composite widgets (toolbars, radio groups, tab lists) must use roving tabindex so only
one item is in the tab stop at a time and arrow keys move within the group.

```html
<div role="toolbar" aria-label="Text formatting">
  <button tabindex="0">Bold</button>
  <button tabindex="-1">Italic</button>
</div>
```

See [WAI-ARIA APG: Roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex).

## Serious: Disabled Controls Stay Discoverable Where It Matters

Native `disabled` is the correct default for form controls: it removes the element
from the tab order and the accessibility tree, which is usually what you want.

But a control the user must still be able to *find* and understand as unavailable
should use `aria-disabled="true"` instead, because it keeps the element focusable
and announced. Reach for `aria-disabled` when:

- The control is a **submit button** — keep it active (or `aria-disabled`), never
  natively `disabled`, so a keyboard/screen-reader user can trigger validation and
  hear what is missing rather than tabbing past a dead, silent button.
- The control is **important to keep in the focus order** while temporarily
  inactive (e.g. a carousel arrow at the end of its range).

Do not blanket-replace `disabled` with `aria-disabled`. When you do use it,
suppress the action in JavaScript and style the state explicitly (`aria-disabled`
gets no user-agent dimming), e.g. `[aria-disabled="true"] { cursor: not-allowed; }`.

```html
<!-- Form field: native disabled is right -->
<input type="text" disabled />

<!-- Submit / must-stay-discoverable control: aria-disabled -->
<button type="button" aria-disabled="true" aria-label="Scroll to next">…</button>
```

See [WAI-ARIA APG: Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Moderate: Touch Targets (WCAG 2.5.8)

```css
button, a, [role="button"] {
  min-width: 24px;
  min-height: 24px;
  /* Recommended: 44×44 for primary actions */
}
```

Never use `user-scalable=no` in the viewport meta tag.

## Definition of Done Checklist

- [ ] Tab through entire page: logical order, no unexpected skips
- [ ] Visible focus indicator on every focusable element in both light and dark modes
- [ ] All interactive elements activatable with correct keys per widget type
- [ ] No keyboard trap (except intentional modal trap with working Escape)
- [ ] Dialog: background content `inert` on open; focus returns to trigger on close
- [ ] Skip link present, first in DOM, visible on focus, target has `tabindex="-1"`
- [ ] Composite widgets use roving tabindex
- [ ] Submit buttons are not natively `disabled`; `aria-disabled` used only where the control must stay discoverable
- [ ] Touch targets meet 24×24px minimum

## Key WCAG Criteria

- 2.1.1 Keyboard (A)
- 2.1.2 No Keyboard Trap (A)
- 2.4.3 Focus Order (A)
- 2.4.7 Focus Visible (AA)
- 2.4.11 Focus Appearance (AA, WCAG 2.2)
- 2.4.12 Focus Not Obscured (AA, WCAG 2.2)
- 2.5.3 Label in Name (A)
- 2.5.8 Target Size Minimum (AA, WCAG 2.2)
