# OffOn Style Guide

Design system, component API reference, and CSS utility catalogue for the Astro + Vue codebase. The source of truth for all tokens is `src/styles/index.css`; the source of truth for all component APIs is the component files themselves. Where this document and the code disagree, the code wins.

---

## Design System

### Colour tokens (`@theme`)

All colours are defined as HSL channel variables and consumed via Tailwind utilities (`bg-background`, `text-foreground`, etc.). Never hardcode hex or `hsl()` values in components.

| Token | Tailwind utility |
| --- | --- |
| `--color-background` | `bg-background`, `text-background` |
| `--color-foreground` | `text-foreground` |
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-foreground` | `text-primary-foreground` |
| `--color-secondary` | `bg-secondary`, `text-secondary` |
| `--color-card` | `bg-card`, `text-card-foreground` |
| `--color-muted` | `bg-muted`, `text-muted` |
| `--color-border` | `border-border` |
| `--color-accent` | `text-accent` |
| `--color-emerald` / `--color-teal` | `text-emerald`, `text-teal` |

**Special:** `--color-dim` and `--color-faint` already include `hsl()` — use them as `color: var(--color-dim)` or `text-dim`/`text-faint`, never wrapped in `hsl()` again.

Yellow `#ffc034` (primary) is accent-only in light mode. Never use it as a text colour.

### Typography

| Token | Role |
| --- | --- |
| `--font-sans` | Inter — body, UI labels |
| `--font-heading` | Syne — display headings |
| `--font-mono` | JetBrains Mono — code |

**Type scale:** defined in the `@theme` block. Never write `font-size` values directly in components; use the scale utilities (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`).

**Capitalisation rules:**
- Title case (Chicago): button/CTA labels, section headings, card titles, nav and footer links, pill/badge text.
- Sentence case: body paragraphs, meta descriptions, hero sub-headings, card descriptions.
- Overline/eyebrow labels: CSS `text-transform: uppercase` — write source text lowercase.

### Radii

| Token | Usage |
| --- | --- |
| `--radius-lg` | Cards, drawers, large containers |
| `--radius-md` | Buttons, pills, badges |
| `--radius-sm` | Inputs, small chips |

---

## Buttons

Raw `<button>` or `<a>` with a class from the table below. No `<Button>` wrapper component.

| Class | Appearance | When to use |
| --- | --- | --- |
| `.btn-primary` | Filled amber, hover brightness +10. Darkened-amber border in light mode | Primary CTA |
| `.btn-ghost` | Transparent + foreground border, hover amber border | Secondary action |
| `.btn-secondary` | Solid inverted neutral (foreground fill, background text) | Paired action that must carry the same weight as `.btn-primary` (consent Decline) |
| `.btn-soft` | Primary-tinted bg and border | Tertiary / low-emphasis action |
| `.btn-inverse` | `bg-background`, primary border | CTA on `bg-primary` sections |
| `.btn-ghost-inverse` | Transparent + background-coloured border | Secondary CTA on `bg-primary` sections |

All classes include `focus-ring`, `cursor-pointer`, and overrides for `forced-colors` and `prefers-reduced-motion`.

`.btn-primary`, `.btn-secondary` and `.btn-ghost` all reserve a 1px border so they share a height; only `.btn-ghost` and light-mode `.btn-primary` colour it. The amber fill is ~1.6:1 against the near-white surfaces in light mode, so `--primary-border` (a darkened amber, ~5.1:1 against every surface in use) gives the control the visible boundary WCAG 1.4.11 wants. Dark mode needs none: the fill is ~11.9:1 there. Guarded by `e2e/btn-primary-contrast.spec.ts`, which checks every route in both themes.

Touch target: interactive elements must meet WCAG 2.5.8 (≥24 × 24 px). Nav links use `min-h-[44px]`; footer links use `min-h-[48px]`.

---

## Filter pills

Used in `ChallengesFilter.astro`. Three classes compose the pill system:

| Class | Purpose |
| --- | --- |
| `.filter-pill` | Base — `[aria-pressed]` selectors for forced-colours mode |
| `.pill-active` | Selected state — primary-tinted, amber border, `min-h-[44px]` |
| `.pill-inactive` | Unselected state — transparent, border-border, hover electric glow shadow |

---

## Focus rings

Four utilities, applied via `@utility`. Always use these — never write `outline` or `box-shadow` focus styles manually.

| Class | Ring | When to use |
| --- | --- | --- |
| `.focus-ring` | `ring-2 ring-ring ring-offset-2` | Default for most interactive elements |
| `.focus-ring-tight` | `ring-2 ring-ring ring-offset-1` | Compact elements (badges, small links inside cards) |
| `.focus-ring-subtle` | `ring-1 ring-ring` | Breadcrumb links |

---

## Link styles

| Class | Usage |
| --- | --- |
| `.docs-ext-link` | Inline prose links site-wide. `inline-flex`, underline, amber underline-offset on dark; near-black on light. External icon via `::after` mask on `[target="_blank"]`. Use for `PersonNameLink` and external references in narrative copy. |
| `.social-icon-link` | Icon-only social buttons (Footer, ChallengeShareLinks). `text-secondary`, `hover:text-primary`. |
| `.tag-chip-link` | Tag anchor chips (TagChips). Uses `outline` for focus-visible so it escapes `overflow:hidden` parents. Light-mode border contrast override for WCAG 1.4.11. |

External links must always have `target="_blank" rel="noopener noreferrer" aria-describedby="new-tab-hint"`. The `#new-tab-hint` span is in `Layout.astro`.

---

## Navigation & layout classes

| Class | Purpose |
| --- | --- |
| `.skip-nav` | Off-screen until `:focus`. Required for WCAG 2.4.1. Lives in `Layout.astro`. |
| `.logo-link` | Applied to the Navbar logo anchor. Excluded from nav-link hover overrides via `.light nav a:not(.logo-link)`. |
| `.section-label` | Eyebrow pill — `text-transform: uppercase`. Write source text lowercase. |
| `.hero-badge` | Hero eyebrow pill — amber fill + dark border in light mode. |

---

## Glow and decorative effects

| Class | Purpose |
| --- | --- |
| `.card-glow` | Hover: amber outer box-shadow + teal secondary glow; border-colour override. Applied to cards and CollapsibleSection. |
| `.contributor-pill` | Base pill: `bg-primary/5`, `border-primary/20`, `text-primary`. |
| `.contributor-pill-glow` | Static glow variant for contributor pills in the challenge sidebar. |
| `.firefly` | 2 px amber dot, animated with `fireflyFloat` keyframes. Used in `Hero.astro`; hidden on mobile (nth-child 7+) and `prefers-reduced-motion`. |
| `.badge-levels` | Level count badge on AdventureCard. Light-mode override retains amber. |

---

## Prose containers

Author-controlled markdown prose is pre-rendered to sanitised HTML at build time via `src/lib/markdown-pipeline.mjs`. Always render with `set:html` inside one of these classes, or use `InlineProse.astro`.

| Class | Element | Content |
| --- | --- | --- |
| `.md-inline` | `<p>` (via InlineProse) | Single-paragraph inline prose. Styles `<code>`, `<strong>`, `<em>`, `<a>`. |
| `.md-content` | `<div>` (via InlineProse) | Block prose — paragraphs, lists, headings, pre/code, blockquote, table. `overflow-x: clip`. |

**Inside an interactive element** (link card, button): call `stripLinks(html)` from `@/lib/markdown` first to avoid nested `<a>`/`<button>`.

**Into a plain-text context** (meta attribute): call `stripHtml(html)` from `@/lib/markdown`.

---

## Code blocks

Code blocks rendered from author prose use a three-class structure built at build time by `renderCodeBlockChrome` in `markdown-pipeline.mjs`. The Layout.astro script wires the Copy button click handler on `astro:page-load`.

| Class | Element | Purpose |
| --- | --- | --- |
| `.code-block-body` | `<div>` | Outer wrapper; also carries `data-code-block` attribute |
| `.code-block-header` | `<div>` | Top bar — language label + Copy button |
| `.code-lang-label` | `<span>` | Language identifier; JetBrains Mono, `text-faint`, `user-select: none` |
| `.code-header-btn` | `<button>` | Copy button; `hover:border-primary/50` |
| `.md-pre-group` | `<div>` | Relative wrapper around `<pre>` in prose code blocks |

Shiki dual-theme token colours are applied via `--shiki-dark` / `--shiki-light` CSS custom properties on each `<span>`. Dark mode: `.md-content pre code span { color: var(--shiki-dark, inherit) }`. Light mode: `.light .md-content pre code span { color: var(--shiki-light, inherit) }`. Falls back to `inherit` for un-highlighted blocks.

---

## Animations

All animations respect `prefers-reduced-motion: reduce` (duration collapsed to 0.01 ms).

| Class | Behaviour |
| --- | --- |
| `.animate-fade-up` | `fadeUp` 0.35 s ease-out on load |
| `.animate-fade-up-delay-1 / -2 / -3` | Same with 0.05 s / 0.10 s / 0.15 s delays |
| `.animate-ping` | Infinite ping dot (LivePill) |
| `.firefly` | `fireflyFloat` infinite; position and duration vary per `nth-child` |

---

## Light mode

Light mode is applied as `.light` on `<html>`. The inline script in `Layout.astro` sets this before first paint; `ThemeToggle.astro`'s delegated click handler updates it at runtime.

Rules:
- Light overrides live in the "Light mode overrides" section at the bottom of `index.css`, outside any `@layer`, scoped to `.light`.
- Never add a `dark:` Tailwind override without a corresponding base (light) style.
- `group-hover:*` / `group-focus:*` are not matched by `.light .classname` — add explicit `.light .group:hover` rules.
- Dark mode uses `:root` / `.dark`. Never touch these when fixing light mode.

---

## Components

### Static `.astro` components

#### `AdventureCard`

Props: `adventure: { slug, title, story, tags, icon?, isLive?, levels: {id, difficulty}[], contributor? }`

Root element is `<a>` with a composite `aria-label` (title + difficulties + live status + tags). Calls `stripHtml` on `adventure.story` for the excerpt. `ContributorBadge` pinned to the bottom via `mt-auto pt-4`; intentionally omits `url` (the card is already a link — a nested `<a>` would be invalid HTML). Applies `.card-glow` and `.focus-ring`.

---

#### `AdventureIcon`

Props: `icon?: string`, `size?: number (default 16)`, `class?: string`

Maps Lucide PascalCase icon names to kebab via `PASCAL_TO_KEBAB`. Renders nothing for unknown names. Always `aria-hidden="true"`.

---

#### `AvatarLink`

Props: `username: string`, `avatarUrl?: string`, `size?: 24 | 28 (default 24)`, `class?: string`

Not a link — renders an img (or initials fallback) plus a visible username span. All visual elements are `aria-hidden`. `onerror` swaps a failed img for the initials chip.

---

#### `BottomCTA`

No props. Full-width amber section with Nyx mascot (hidden below `lg`). Uses `BRAND_NAME`, `COMMUNITY_URL`, `CHALLENGES_REPO_URL` from `src/lib/site.ts`. All external links carry `aria-describedby="new-tab-hint"`.

---

#### `Breadcrumb`

Props: `items: { label: string; href?: string }[]`, `class?: string (default 'mb-5')`

`<nav aria-label="Breadcrumb">`. Last item (no `href`) gets `aria-current="page"`. Hrefs resolved via `BASE_URL`. Separator chevrons are `aria-hidden`.

---

#### `ChallengeBuildersSection`

No props. Slots: `aside` (optional sticky sidebar on `lg+`). Data from `ADVENTURE_CONTRIBUTORS`. Renders only when contributors exist. Has `aria-labelledby`.

---

#### `ChallengeHighlights`

No props. Three hardcoded value-prop cards with Lucide icons (all `aria-hidden`).

---

#### `ChallengeShareLinks`

Props: `url: string`, `levelName: string`

LinkedIn, X, Bluesky, Mastodon share buttons. Inline SVGs all `aria-hidden`. Each `<a>` has `aria-label` + `aria-describedby="new-tab-hint"`.

---

#### `CodespacesButton`

Props: `href: string`, `fullWidth?: boolean (default false)`

`.btn-primary` external link to GitHub Codespaces. Renders helper text below button. `fullWidth` toggles `w-full justify-center` vs `w-fit`.

---

#### `CollapsibleSection`

Props: `id: string`, `title: string`, `defaultOpen?: boolean (default true)`, `headingLevel?: 2 | 3 | 4 (default 2)`

Slots: `default` (section body)

Uses native `<details>` / `<summary>` — works without JS. `scroll-mt-28` prevents the fixed nav obscuring anchored sections. Chevron rotates via `group-open` Tailwind variant. Applies `.card-glow`.

---

#### `CommunityLeaders`

Props: `sections?: string[]`, `limit?: number`

Data from `src/data/community-leaders.json`. Each section is an `<ol aria-label="...">`. Rank numbers are `aria-hidden`.

---

#### `CommunitySection`

No props. Slots: `aside` (optional). `<section aria-labelledby>` with four Discourse category link cards. Same aside pattern as `ChallengeBuildersSection`.

---

#### `CommunitySidebar`

Props: `levelId`, `discussionUrl`, `contributor?`, `discussion: Discussion | null`, `leaderboardRows: LeaderboardRow[]`

Fully static — all data resolved at build time by `community-data.ts`. Three sections: contributor credit, leaderboard top-3, latest activity posts. Non-cert posts preferred in the activity list.

---

#### `ContributorBadge`

Props: `name: string`, `url?: string`, `glow?: boolean (default false)`, `label?: string (default 'Challenge Builder')`

Renders as `<a class="contributor-pill">` when `url` is present, `<span>` otherwise. Hammer icon `aria-hidden`. `contributor-pill-glow` applied when `glow={true}`. External links carry `aria-describedby="new-tab-hint"`.

---

#### `DifficultyBadge`

Props: `difficulty: Difficulty` (`"Beginner" | "Intermediate" | "Expert"`), `showDot?: boolean (default false)`

Uses `data-difficulty` attribute targeted by `.light [data-difficulty]` CSS overrides. Colours via inline CSS using `--difficulty-{variant}-bg/border/text` HSL vars. Dot (showDot) is `aria-hidden`.

---

#### `Footer`

No props. Two `<nav>` landmarks: `aria-label="Explore"` and `aria-label="Community"`. Section group labels ("explore", "community") are `<p>` elements — not headings — to avoid spurious outline entries; CSS uppercases them. All nav links have `min-h-[48px]`. Social SVGs are `aria-hidden focusable="false"`.

---

#### `Hero`

No props. `<section aria-labelledby="hero-heading">`. 8 firefly spans in an `aria-hidden` container. Staggered `.animate-fade-up-*` on badge, `<h1>`, `<p>`, and CTA row. Full-viewport height (`min-h-dvh`).

Primary CTA is an in-page jump to `#challenges`, which is why its icon is a down arrow. Rendered only on the home page, so the target always exists; `html { scroll-padding-top }` keeps it clear of the fixed navbar.

---

#### `InlineProse`

Props: `html: string`, `class?: string`

**The canonical wrapper for author prose.** Auto-detects block vs inline by testing for block-level tag names. Block → `<div class="md-content">`, inline → `<p class="md-inline">`. Always uses `set:html`.

---

#### `LeaderboardList`

Props: `rows: { rank, username, avatarUrl?, points? }[]`, `label?: string (default 'Ranked players')`

`<ol aria-label="...">`. Rank numbers `aria-hidden`. Points column uses `tabular-nums`.

---

#### `LivePill`

Props: `class?: string`

"Live" text with an animated ping dot. No `role="status"` — live status is carried by the parent `AdventureCard` composite `aria-label`. Ping respects `prefers-reduced-motion`.

---

#### `Navbar`

No props. `<header>` wrapping `<nav aria-label="Main">`. Logo anchor has `.logo-link`. Desktop nav links: `min-h-[44px]`, animated underline (`decoration-transparent` base, revealed on hover/active), `aria-current="page"` via `isActive()`. Hosts `ThemeToggle` (one per breakpoint) and `MobileMenu`, both static `.astro`. Computes `isActive()` once and passes it to the drawer, so both navs agree.

---

#### `OtherLevelsCard`

Props: `adventure: { slug, title, levels, upcomingLevels? }`, `currentLevelId: string`

Filters out the current level. Upcoming levels render as non-interactive `<span>` with a "Soon" badge. Each active level link has a full `aria-label`. Renders nothing if there are no other or upcoming levels.

---

#### `PageHero`

Props: `eyebrow?: string`, `title: string`, `description: string`, `primaryCta?: { label, href, external? }`, `secondaryCta?: { label, href, external? }`

`<section aria-labelledby="page-hero-heading">`. `pt-32` clears the fixed nav. `primaryCta` → `.btn-inverse`, `secondaryCta` → `.btn-ghost-inverse`. All hrefs resolved with `BASE_URL`.

---

#### `PersonNameLink`

Props: `name: string`, `url?: string`

`<a class="docs-ext-link">` when `url` present; `<span>` otherwise. External link with `aria-describedby="new-tab-hint"`.

---

#### `RewardsCard`

Props: `rewards: { deadline, eligibility, tiers, rankingNote?, rankingRulesUrl? }`, `compact?: boolean (default false)`, `levelDeadline?: string`, `deadlinePast?: boolean (default false)`

`compact` shows a trimmed sidebar variant. Uses `set:html` with `class="md-inline"` directly for `eligibility` and `rankingNote`. Uses `InlineProse` for tier descriptions.

---

#### `SEO`

Props: `title: string`, `description: string`, `path: string`, `ogType?: string (default 'website')`, `noindex?: boolean (default false)`

Head-only. Emits `<title>`, meta description, robots `noindex`, canonical, full `og:*` set (title, description, type, url, image 1200×630 with alt, site_name, locale en_GB), and Twitter card tags. **Never hand-write these tags in pages.**

---

#### `SectionLabel`

No props. Slots: `default` (label text).

Wraps slot in a `<p class="section-label">`. CSS uppercases — source text must be lowercase.

---

#### `SolutionBlocks`

Props: `blocks: SolutionBlock[]`

Dispatches on `block.type`: `text` → `set:html` into `.md-content`; `code` → header + Copy button with `data-copy-code` (wired by Layout script); `image` → lazy `<figure>`; `callout` → `role="note"`. Image `src` paths rebased with `BASE_URL` for PR preview compatibility.

---

#### `SolutionStepNav`

Props: `steps: { id: string; title: string }[]`, `class?: string`

`<nav aria-label="What was fixed">`. Step numbers `aria-hidden`. In-page anchor links to step IDs. Rendered twice per solution page: sidebar (desktop) and inline above article (mobile).

---

#### `SponsorStrip`

No props. `<section aria-labelledby="sponsor-heading">`. Two-column grid with a CTA to `/sponsors/`.

---

#### `TagChips`

Props: `tags: string[]`

Each tag is an anchor to `/challenges/[tag-slug]/` with class `.tag-chip-link`. Focus ring uses `outline` (not `box-shadow`) to escape `overflow:hidden` parents.

---

#### `ChallengesFilter` (`.astro`)

No props passed from outside; all state is derived from the URL and the DOM on `astro:page-load`. Static markup plus a vanilla `<script>` — no island, no hydration directive.

- Below `lg`: dropdown buttons. Above `lg`: `role="radiogroup"` difficulty selector + tag toggles with arrow-key navigation.
- Dropdowns close on Escape, return focus to trigger. Outside-click handled by a `mousedown` listener on `document`.
- `aria-live="polite"` live region announces result counts.
- URL synced via `replaceState` (no navigation); state seeded from `?topics` / `?difficulty` on `astro:page-load`.
- `embedded` attribute on the root element suppresses sr-only section headings to avoid duplicate document outline on the home page.
- All listeners registered on `astro:page-load`, torn down on `astro:before-swap` (including the two document-level `mousedown`/`keydown` handlers).

---

#### `ConsentBanner` (`.astro`)

### Interactive islands (`.vue`)

No islands exist yet. When the first one is added:

No props. Static markup plus one script, no island. Both states are rendered and both start `hidden`; the script subscribes to `$consent` and reveals whichever matches. The state machine stays in `src/stores/consent.ts`.

- `aria-live="polite" aria-atomic="true"` wrapper around both states, always present so assistive tech has it registered before either appears.
- Banner: `role="region" aria-labelledby="consent-banner-title"`. Inner container is `max-h-[80vh] overflow-y-auto` with safe-area padding, so the actions stay reachable at 400% zoom and clear of the iOS home indicator (WCAG 1.4.10).
- Decline comes first in DOM and tab order and uses `.btn-secondary`, so declining carries the same weight as accepting.
- Cookie preferences floating button: 44 × 44 px, `position:fixed` bottom-right with safe-area inset.
- Focus moves **only** from the click handlers, never from the `$consent` subscription. `initConsent()` restoring a stored choice is a state change but not a user action; focusing there would steal focus from the skip-nav link on every page load.
- Analytics lifecycle (`firePageView`, `trackClicks`) is **not** here. It has its own script in `Layout.astro`, so it does not depend on this component and cannot miss the first `page_view` of a session.

---

#### `MobileMenu` (`.astro`)

Props: `links: { href: string; label: string; external?: boolean; active?: boolean }[]`

Static markup plus one script, no island. Navbar passes `active` already resolved from `Astro.url.pathname`, so `aria-current="page"` is correct in the SSR HTML rather than being re-derived in the browser.

- Full focus trap: Tab / Shift+Tab cycle within the drawer; Escape closes and returns focus to the trigger. Uses the full 7-pattern focusable selector (links, buttons, `input`, `select`, `textarea`, `[contenteditable]`, `[tabindex]`), so a form control added later cannot fall outside the trap.
- Sets `inert` + `aria-hidden` on all body siblings while open, clears them on close.
- Drawer is always in the DOM and carries `hidden` while closed, so `aria-controls` always resolves.
- The trigger icon is chosen by CSS from `aria-expanded` (`group-aria-expanded:*`), so the icon and the state assistive tech sees cannot disagree.
- Open styling is applied as classes by script, because Tailwind's `flex` would otherwise override the `hidden` attribute.
- Releases on `astro:before-swap` and on crossing to `>=md`.

---

#### `StarterNudge` (`.astro`)

Props: `adventureId: string`, `adventureTitle: string`, `tag: string`, `levelId: string`, `base: string`

Static markup plus one script, no island. Rendered `hidden`; the script reveals it only when `starter_nudge_dismissed` is absent from localStorage, so a visitor who dismissed it never sees it flash back. Dismiss button: `aria-label="Dismiss suggestion"`, `min-h-8 min-w-8` (32 px, WCAG 2.5.8). Wrapper: `aria-live="polite" aria-atomic` so screen readers announce the reveal.

Target comes from `getStarterTarget()` in `src/lib/challenges.ts`: the easiest level of the newest **live** adventure, falling back to the most recent when nothing is live. Live is a preference, not a gate — an open rewards window is the most useful place to send someone, but gating on it blanked the pointer entirely once every deadline had passed.

---

#### `ThemeToggle` (`.astro`)

Props: `variant?: 'desktop' | 'mobile' (default 'mobile')`

Static markup, no island. Both icons and both accessible names are rendered, and CSS picks between them off the `.dark` class on `<html>` (`hidden dark:block` / `block dark:hidden`, the same technique as the Navbar logo). The control is therefore correct in the first painted frame for a returning light-mode visitor, with no JS.

- The accessible name comes from two `sr-only` spans rather than `aria-label`, because an attribute cannot be swapped by CSS.
- One delegated `click` listener on `document`, matched via `[data-theme-toggle]`. It survives View Transitions without rebinding and covers every instance, so the two breakpoint copies need no shared state: both read the same `<html>` class.
- Announces via the `#theme-status` sr-only polite live region in `Layout.astro`.

---

## Shared stores (`src/stores/`)

| Store | File | Key |
| --- | --- | --- |
| `$consent` | `stores/consent.ts` | `analytics_consent` in localStorage. Plain atom, default `null`. Safe to read via `useStore` (SSR and first client render both default `null`). |

---

## Interactivity: which tool to reach for

**Default to `.astro` + a vanilla `<script>`.** Reach for a framework only when the component has genuinely reactive state that a class toggle and a small script cannot express.

**When a framework is warranted, it is Vue. Never React.** The `@astrojs/vue` integration stays installed even while nothing uses it, so adding an island is a one-file change rather than a toolchain decision. Do not remove `vue`, `@astrojs/vue`, `@vitejs/plugin-vue`, `@vue/test-utils`, `eslint-plugin-vue`, `eslint-plugin-vuejs-accessibility` or `vue-eslint-parser` as "unused dependencies" — they are deliberately retained.

**The site currently ships zero islands.** Every interactive surface is `.astro` plus a script: theme toggle, mobile drawer, consent banner, starter nudge, challenge filter, code-copy buttons, abbreviation tooltips, the brand-page scrollspy.

### What does not justify a framework

These were all islands once and are now plain scripts. Use them as the bar:

| Component | What it actually does |
| --- | --- |
| `ThemeToggle` | toggles a class on `<html>`, writes localStorage |
| `MobileMenu` | shows/hides a drawer, focus trap, `inert` on siblings |
| `ConsentBanner` | shows one of two states, writes localStorage |
| `StarterNudge` | shows/hides a banner, writes localStorage |
| `ChallengesFilter` | toggles `hidden` on server-rendered cards, syncs the URL |

The last one is the useful reference: even a filter with two dropdowns, a roving-tabindex radiogroup, URL reconciliation and a live region came out smaller and lighter as markup plus a script, because the cards can be rendered server-side and filtered by attribute.

A framework earns its place when state drives markup that cannot reasonably be pre-rendered — genuinely dynamic lists, editors, multi-step forms with derived state.

### Patterns for the script

- Bind on `astro:page-load` so the component survives View Transitions, or delegate from `document` where one handler can cover every instance.
- Prefer letting CSS derive presentation from an ARIA attribute (`group-aria-expanded:*`, `.dark`) over having the script set both. One source of truth, and the visual state cannot drift from what assistive tech sees.
- Release listeners and store subscriptions on `astro:before-swap` when those listeners target a **long-lived node** (`document`, `window`, or any node that survives a body swap) and were registered inside an `astro:page-load` handler. Listeners that are not removed accumulate across navigations and fire multiple times on the second and subsequent visits. Use a module-scope `teardown` variable: assign the cleanup function on init, call and null it in the `astro:before-swap` handler. `MobileMenu.astro` is the canonical implementation to copy.

  **Two patterns are safe without `astro:before-swap` — do not add teardown to these:**

  1. **Module-scope delegation on a surviving node** (`ThemeToggle.astro`): a single `document.addEventListener("click", handler)` at module scope runs once per session. `document` survives every swap; the handler matches by selector at event time, so there is no stale node reference and no accumulation. Adding teardown here would break the listener on the second navigation.

  2. **Listeners bound to the component's own child nodes** (`StarterNudge.astro`): when ClientRouter swaps `<body>`, the component subtree is detached. Dead listeners on detached nodes can never fire and are GC-eligible. The next `astro:page-load` operates on fresh nodes from the new body. No teardown is needed or correct.

## Hydration quick-reference

Applies if and when an island is added back.

| Directive | When to use |
| --- | --- |
| `client:load` | Above-the-fold interactivity that must hydrate immediately |
| `client:visible` | Below-fold islands — hydrate when entering the viewport |
| `client:idle` | Non-critical islands that can wait until the browser is idle |

`.astro` components cannot be rendered inside a `.vue` island. If an island needs a badge, pill, or icon, inline the markup and use an icon component.

---

## Inline links in prose need explicit spaces

Astro strips the whitespace between a text node and an adjacent element when the source has a newline between them. This markup renders as "See ourPrivacy Policyfor details.":

```astro
See our
<a href={privacyUrl}>Privacy Policy</a>
for details.
```

Add `{" "}` on both sides:

```astro
See our{" "}
<a href={privacyUrl}>Privacy Policy</a>{" "}
for details.
```

JSX behaves the same way; Vue's compiler did not, which is why the requirement is easy to lose when porting a `.vue` template. `e2e/inline-spacing.spec.ts` scans the build for a link abutting a word character and fails the suite, because nothing else catches it: the source reads correctly and no axe or smoke assertion looks at word spacing.

---

## Adding a new component

1. Static UI → `.astro`. Interactive (needs client state) → `.vue` island.
2. Add an entry to this guide before opening a PR (`validate-docs.yml` enforces it).
3. Touch targets ≥ 24 × 24 px (WCAG 2.5.8). Use `min-h-[44px]` on nav-adjacent links.
4. All decorative SVGs and icons: `aria-hidden="true" focusable="false"`.
5. Check `ACCESSIBILITY.md` before writing any interactive element.
