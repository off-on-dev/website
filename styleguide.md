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
| `.btn-primary` | Filled amber, hover brightness +10 | Primary CTA |
| `.btn-ghost` | Transparent + foreground border, hover amber border | Secondary action |
| `.btn-secondary` | Solid inverted neutral (foreground fill, background text) | Paired action that must carry the same weight as `.btn-primary` (consent Decline) |
| `.btn-soft` | Primary-tinted bg and border | Tertiary / low-emphasis action |
| `.btn-inverse` | `bg-background`, primary border | CTA on `bg-primary` sections |
| `.btn-ghost-inverse` | Transparent + background-coloured border | Secondary CTA on `bg-primary` sections |

All five classes include `focus-ring`, `cursor-pointer`, and overrides for `forced-colors` and `prefers-reduced-motion`.

Touch target: interactive elements must meet WCAG 2.5.8 (≥24 × 24 px). Nav links use `min-h-[44px]`; footer links use `min-h-[48px]`.

---

## Filter pills

Used in `ChallengesFilter.vue`. Three classes compose the pill system:

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

No props. `<header>` wrapping `<nav aria-label="Main">`. Logo anchor has `.logo-link`. Desktop nav links: `min-h-[44px]`, animated underline (`decoration-transparent` base, revealed on hover/active), `aria-current="page"` via `isActive()`. Hosts `ThemeToggle` (one per breakpoint, static `.astro`) and `MobileMenu` (`client:media`).

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

### Interactive islands (`.vue`)

#### `ChallengesFilter`

Props: `entries: ChallengeEntry[]`, `tags: string[]`, `base: string`, `initialTag: string | null`, `adventureCount: number`, `embedded?: boolean`, `seeAllHref?: string`

Slots: `adventures` (named — static `AdventureCard` elements for the unfiltered state)

Hydration: `client:visible` (home), `client:load` (challenges page)

- Below `lg`: dropdown buttons. Above `lg`: `role="radiogroup"` difficulty selector + tag toggles with arrow-key navigation.
- Dropdowns close on Escape, return focus to trigger.
- `aria-live="polite"` announces result counts.
- URL synced via `replaceState` (no navigation); state seeded from `initialTag`, restored from `?topics` / `?difficulty` on mount only.
- `embedded` suppresses sr-only section headings to avoid duplicate document outline on the home page.

---

#### `ConsentBanner`

No props. Hydration: `client:load transition:persist` (Layout.astro)

- `aria-live="polite"` wrapper so screen readers announce the banner after hydration.
- Banner: `role="region" aria-labelledby="consent-banner-title"`.
- Cookie preferences floating button: 44 × 44 px, `position:fixed` bottom-right with safe-area inset.
- Focus management: null → granted/denied moves focus to cookie button; X → null (reset) moves focus to Decline button.
- Wires `firePageView` on `astro:page-load`; calls `initConsent()` and `trackClicks()` on mount.

---

#### `MobileMenu`

Props: `links: { href: string; label: string; external?: boolean }[]`

Hydration: `client:media="(max-width: 767px)" transition:persist="mobile-menu"` (Navbar.astro)

- Full focus trap: Tab / Shift+Tab cycles within drawer; Escape closes and returns focus to hamburger.
- Sets `inert` + `aria-hidden` on all body siblings while open.
- Drawer is always in the DOM (`aria-controls` resolves on SSR).
- Auto-closes on `astro:before-swap` and on breakpoint change to `>=md`.
- `aria-current="page"` on the active link.

---

#### `StarterNudge`

Props: `adventureId: string`, `adventureTitle: string`, `tag: string`, `levelId: string`, `base: string`

Hydration: `client:idle`

SSR renders nothing (`show = false`). Reveal deferred to `onMounted` + localStorage check (`starter_nudge_dismissed`). Dismiss button: `aria-label="Dismiss suggestion"`, `min-h-8 min-w-8` (32 px, WCAG 2.5.8). Wrapper: `aria-live="polite" aria-atomic` so screen readers announce appearance.

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

## Hydration quick-reference

| Directive | When to use |
| --- | --- |
| `client:load` | Above-the-fold islands that must hydrate immediately (ConsentBanner). |
| `client:visible` | Below-fold islands — hydrate when entering the viewport (ChallengesFilter on home). |
| `client:idle` | Non-critical islands that can wait until the browser is idle (StarterNudge). |
| `client:media="..."` | Breakpoint-conditional islands (MobileMenu). |

`.astro` components cannot be rendered inside a `.vue` island. If an island needs a badge, pill, or icon, inline the markup and use `lucide-vue-next`.

---

## Adding a new component

1. Static UI → `.astro`. Interactive (needs client state) → `.vue` island.
2. Add an entry to this guide before opening a PR (`validate-docs.yml` enforces it).
3. Touch targets ≥ 24 × 24 px (WCAG 2.5.8). Use `min-h-[44px]` on nav-adjacent links.
4. All decorative SVGs and icons: `aria-hidden="true" focusable="false"`.
5. Check `ACCESSIBILITY.md` before writing any interactive element.
