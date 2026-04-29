# OffOn Style Guide

## Brand Name

The brand is always written **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".

In code, use the `BRAND_NAME` constant from `src/data/constants.ts` instead of hardcoding the string.

The domain `offon.dev` is always lowercase (it is a URL, not a brand mention).

---

## Typography

### Fonts

| Role | Family | Key weights | Format |
|---|---|---|---|
| Headings / display (`font-heading`) | Syne | 700 primary (400–800 available) | WOFF2 only (`public/fonts/syne-*.woff2`) |
| Body & UI (`font-sans`) | Inter | 400, 500, 600 primary (700 available) | WOFF2 only (`public/fonts/inter-*.woff2`) |
| Code / mono (`font-mono`, `code`, `pre`) | JetBrains Mono | 400 primary (500, 600 available) | WOFF2 only (`public/fonts/jetbrains-mono-*.woff2`) |

All fonts are fully self-hosted as WOFF2. No TTF fallbacks. No external network requests.

Subset coverage (via `unicode-range` in `src/index.css` -- only the needed subset downloads per user):

| Family | Subsets |
|---|---|
| Inter | latin, latin-ext, cyrillic-ext, cyrillic, greek-ext, greek, vietnamese |
| Syne | latin, latin-ext, greek |
| JetBrains Mono | latin, latin-ext |

### Font preload

Five fonts are preloaded via the `links()` export in `src/root.tsx` to avoid the three-level font discovery delay (HTML parse → CSS parse → font file request):

- `inter-latin-400-normal.woff2`, used by body text
- `inter-latin-500-normal.woff2`, used by body medium weight
- `inter-latin-600-normal.woff2`, used by nav links and subheadings
- `inter-latin-700-normal.woff2`, used by bold body text
- `syne-latin-700-normal.woff2`, used by headings

Only Latin subset variants are preloaded. Other subsets are served from `public/fonts/` but are not preloaded. Check the `links()` export in `src/root.tsx` for the current preload list and update it whenever above-the-fold typography changes.

### Tailwind font utilities

| Utility | Resolves to |
|---|---|
| `font-sans` | Inter |
| `font-mono` | JetBrains Mono |
| `font-heading` | Syne |

### Scale (Tailwind defaults)

| Element | Class example | Notes |
|---|---|---|
| H1 | `text-4xl font-bold` md:`text-5xl` | Syne, weight 700 |
| H2 | `text-3xl font-bold` md:`text-4xl` | Syne, weight 700 |
| H3 | `text-lg font-semibold` | Syne, weight 600 |
| Body | `text-base` | Inter, weight 400 |
| Small / caption | `text-sm` | Inter, weight 400 |
| Overline label | `font-sans text-sm font-medium uppercase tracking-widest` | Inter |
| Badge / tag | `font-mono text-xs uppercase tracking-wider` | JetBrains Mono |

### Copy casing

**UI labels (buttons, CTAs, headings, card titles, nav links) use title case (Chicago style).** Body copy and descriptions use sentence case.

Title case rule: capitalise every word except articles (a, an, the), prepositions under five letters (by, in, on, of, to, for, at), and coordinating conjunctions (and, but, or, nor) — unless they open the label.

| Context | Case | Example |
|---|---|---|
| Button / CTA label | Title case | `"Join the Community"`, `"Start a Challenge"` |
| Section heading (h2/h3) | Title case | `"Find Challenges by Technology"`, `"Share and Learn Together"` |
| Card / value title | Title case | `"Learn by Doing"`, `"Open Source First"` |
| Footer / nav link text | Title case | `"Propose an Adventure Idea"` |
| Body paragraph / description | Sentence case | `"A vendor-neutral space for open source practitioners."` |
| Overline label (CSS uppercase) | Write in lowercase, CSS transforms it | Source: `"adventures"` → renders as `"ADVENTURES"` |

See CLAUDE.md → Content and Copy → Capitalisation for the full rule and examples.

---

## Colors

All color tokens are CSS custom properties defined in `src/index.css` (in `:root`/`.light`) and registered as Tailwind utilities via the `@theme` block in `src/index.css`. There is no `tailwind.config.ts`. Always use the Tailwind class that references the token; never hardcode hex values.

### Dark Mode (default, `:root, .dark`)

> **Heading color in dark mode:** `h1`–`h6` receive `color: hsl(var(--primary))` (amber) via a `@layer base` rule in `src/index.css`. This is intentional: headings stand out from body text in the dark theme. Light mode overrides this to `hsl(var(--foreground))` via `.light h1–h6` in the unlayered section.

| Token | HSL | Approx hex | Usage |
|---|---|---|---|
| `--background` | `0 0% 4%` | `#0a0a0a` | Page background |
| `--foreground` | `47 54% 98%` | `#faf8f3` | Primary text |
| `--card` | `240 9% 9%` | `#141416` | Card / panel background |
| `--card-foreground` | `47 54% 98%` | `#faf8f3` | Text on cards |
| `--popover` | `0 0% 10%` | `#1a1a1a` | Popover background |
| `--popover-foreground` | `47 54% 98%` | `#faf8f3` | Text on popovers |
| `--primary` | `41 100% 60%` | `#ffc034` | Buttons, links, highlights |
| `--primary-foreground` | `0 0% 4%` | `#0a0a0a` | Text on primary |
| `--secondary` | `0 0% 12%` | `#1f1f1f` | Secondary backgrounds |
| `--secondary-foreground` | `43 27% 92%` | `#ece8de` | Text on secondary |
| `--muted` | `0 0% 12%` | `#1f1f1f` | Muted backgrounds |
| `--muted-foreground` | `43 36% 94%` | `#f5eedf` | Muted / placeholder text |
| `--accent` | `41 100% 60%` | `#ffc034` | Accent highlights |
| `--accent-foreground` | `0 0% 4%` | `#0a0a0a` | Text on accent |
| `--destructive` | `0 84% 60%` | `#f03f3f` | Error / destructive |
| `--destructive-foreground` | `0 0% 100%` | `#ffffff` | Text on destructive |
| `--border` | `219 36% 18%` | `#1b283e` | Borders |
| `--input` | `218 37% 23%` | `#23324e` | Input borders |
| `--ring` | `41 100% 60%` | `#ffc034` | Focus ring |
| `--radius` | `0.625rem` | 10px | Border radius base |

#### Custom text tokens (dark)

| Token | HSL | Approx | Usage |
|---|---|---|---|
| `--text-primary` | `47 54% 98%` | `#faf8f3` | Main content |
| `--text-secondary` | `43 27% 92%` | `#ece8de` | Supporting text, nav links |
| `--text-tertiary` | `43 36% 94%` | `#f5eedf` | Tertiary text |
| `--text-muted` | `43 36% 94%` | `#f5eedf` | Captions, hints |
| `--text-faint` | `43 36% 94%` | `#f5eedf` | Disabled / very subtle, counts |

#### Surface tokens (dark)

| Token | HSL | Usage |
|---|---|---|
| `--surface` | `240 9% 9%` | Card / section backgrounds |
| `--surface-border` | `219 36% 18%` | Surface borders |
| `--surface-hover` | `0 0% 10%` | Hover states on surfaces |
| `--border-med` | `219 36% 18%` | Medium border (alias) |
| `--accent-subtle` | `221 57% 12%` | Very subtle accent tint background |

#### Accent / effect palette (dark)

| Token | HSL | Usage |
|---|---|---|
| `--electric` | `41 100% 60%` | Primary glow / electric yellow |
| `--emerald` | `41 100% 60%` | Warm accent (same as electric) |
| `--teal` | `38 100% 58%` | Secondary warm accent |
| `--purple` | `32 100% 52%` | Tertiary warm accent |

#### Difficulty badges

Used for avatar tints in `DiscussionSection` (at `/0.2` opacity) and as semantic color anchors for the difficulty visual language. The `-bg` and `-border` tokens (used by `DifficultyBadge`) share the same hue families.

| Token | Dark HSL | Light HSL | Color |
|---|---|---|---|
| `--difficulty-starter` | `41 100% 60%` | `41 100% 80%` | Amber/yellow |
| `--difficulty-builder` | `85 48% 56%` | `85 48% 75%` | Green |
| `--difficulty-architect` | `245 45% 79%` | `245 45% 85%` | Lavender/purple |

---

### Light Mode (`.light`)

The light mode uses a barely-cool background palette. The slight cool/warm contrast between the background and amber accents is intentional — it mirrors how dark mode works (near-black vs warm amber), just inverted and far more subtle. `bg-primary` sections (PageHero, BottomCTA) stay amber in light mode — they do not flip to black.

| Token | Value | Approx hex | Notes |
|---|---|---|---|
| Background | `hsl(220 12% 98%)` | `#F8F9FB` | Barely-cool off-white |
| Surface/card | `hsl(220 10% 96%)` | `#F4F5F7` | Slightly deeper card |
| Surface hover | `hsl(220 8% 93%)` | `#ECEEF1` | Hover state |
| Primary accent | `hsl(41 100% 60%)` | `#ffc034` | Fill/border only, never text |
| Primary foreground | `hsl(0 0% 0%)` | `#000000` | Text on amber fills |
| Foreground/body | `hsl(240 25% 8%)` | `#0D0D17` | Deep navy (`--foreground`) |
| Foreground hover | `hsl(240 25% 5%)` | | Slightly deeper than foreground, used for link/nav hover (`--foreground-hover`) |
| Headings | `hsl(240 25% 8%)` | `#0D0D17` | Overrides dark mode primary-colored headings (via `.light h1–h6`) |
| Muted text | `hsl(35 8% 38%)` | `#655E55` | Warm gray (intentional warm/cool contrast) |
| Border | `hsl(220 12% 87%)` | `#D8DBE2` | Cool border |
| Badge: Beginner | `hsl(41 80% 85%)` | | Black text |
| Badge: Intermediate | `hsl(85 40% 82%)` | | Black text |
| Badge: Expert | `hsl(245 40% 87%)` | | Black text |

#### `.light` override strategy

Yellow (`hsl(41 100% 60%)`) is the global `--primary` color and is safe as a fill or border. It must **never** be used as a text color in light mode because it fails contrast requirements.

All `text-primary` usages are overridden to `hsl(var(--foreground))` (deep warm navy) in light mode via unlayered CSS rules at the bottom of `src/index.css`, scoped to `.light`. These rules must **not** be placed inside `@layer base`. Rules inside `@layer base` are always overridden by `@layer utilities` regardless of specificity, so the override would be silently ignored. Keeping the overrides unlayered gives them the specificity needed to win against utility classes.

#### `bg-primary` sections in light mode

In light mode, `bg-primary` sections (PageHero, BottomCTA) stay amber. Do **not** add a `background-color: black` override. Body text inside those sections uses `text-background/90` which resolves to the cream background color and must be overridden to dark navy in `.light .bg-primary .text-background\/90`.

---

## Component Classes

### Buttons

| Class | Style | Usage |
|---|---|---|
| `.btn-primary` | Filled amber, `rounded-md px-5 py-2.5 text-sm font-semibold`, electric glow on hover | Default CTA on page background |
| `.btn-ghost` | Outlined, `border-foreground/35`, subtle glow on hover | Secondary CTA on page background |
| `.btn-soft` | Tinted `bg-primary/10 border-primary/30`, no glow | Tertiary / low-emphasis action |
| `.btn-inverse` | White/background fill with primary border, primary text; inverts on hover to primary bg | Primary CTA inside a `bg-primary` section (e.g. `PageHero`, `BottomCTA`) |
| `.btn-ghost-inverse` | Transparent with background-colored border and text; inverts on hover to background fill | Secondary CTA inside a `bg-primary` section |

#### Button contrast rule (light mode)

Never place any button directly on a `bg-primary` background using `.btn-primary` or `.btn-ghost`. Those classes are designed for page-background contexts and will produce yellow text on yellow background in light mode.

For buttons inside `bg-primary` sections (e.g. `PageHero`, `BottomCTA`), always use `.btn-inverse` or `.btn-ghost-inverse`. Since the section stays amber in light mode, the unlayered overrides in `src/index.css` set `.btn-inverse` to black background with amber text (reversal), and `.btn-ghost-inverse` to transparent with a dark border and dark text.

Never add a `bg-primary` section button without adding or verifying the corresponding `.light .bg-primary .btn-*` override in the unlayered section of `src/index.css`.

### Pills (filter toggles)

| Class | Style |
|---|---|
| `.pill-active` | `rounded-full bg-primary/10 border-primary/50 text-primary` |
| `.pill-inactive` | `rounded-full bg-transparent border-surface-border text-text-secondary`; hover: `border-primary/60 text-primary bg-primary/5` with electric glow |

Both use `px-4 py-1.5 text-sm font-medium leading-none inline-flex items-center gap-1.5` and include `focus-visible` ring styles (`ring-ring`).

### Difficulty Badges

Badge colors use CSS tokens defined in `src/index.css`. All three difficulties use black text (`--difficulty-text`) on pastel backgrounds for WCAG AA compliance (minimum 4.5:1 contrast ratio).

| Difficulty | Dark mode bg token | Light mode bg token | Color |
|---|---|---|---|
| Beginner | `--difficulty-starter-bg` | `--difficulty-starter-bg` | Pastel amber |
| Intermediate | `--difficulty-builder-bg` | `--difficulty-builder-bg` | Pastel sage green |
| Expert | `--difficulty-architect-bg` | `--difficulty-architect-bg` | Pastel lavender |

Tokens are defined in the `:root, .dark` block and overridden in the `.light` unlayered section of `src/index.css`. Never hardcode HSL values in `DifficultyBadge.tsx`. Use `hsl(var(--difficulty-*))` references only.

### Nav and Footer Links

Link hover and active states use an underline that is always rendered in the DOM but invisible by default. This avoids layout shift on hover.

| State | Classes |
|---|---|
| Default | `underline decoration-transparent decoration-[3px] underline-offset-4 transition-colors` |
| Hover | `hover:text-primary` |
| Active / current route | `text-primary underline decoration-primary underline-offset-4` |

The active state uses both a color change (`text-primary`) and a visible underline (`decoration-primary`) so the indicator is not color-only (WCAG 1.4.1). In light mode, `text-primary` is overridden to `hsl(var(--foreground-hover))` via `.light nav a.text-primary` in `src/index.css`.

This pattern is applied to all navigation links in `Navbar.tsx` and all footer column links in `Footer.tsx`.

---

### Card Glow

Add `.card-glow` to any card to get a primary-colored glow + border highlight on hover (transitioning
`box-shadow` and `border-color`).

**Important:** The glow effect uses CSS variables defined in `src/index.css`. In light mode, the glow colors
must be overridden using CSS custom properties, never hardcoded HSL values. Example:

```css
.light .card-glow {
  --glow-color: hsl(var(--primary));
  box-shadow: 0 0 20px hsl(var(--glow-color) / 0.2);
}
```

---

## Background Texture

Dark mode uses a subtle dot grid overlay on `body`:

```css
background-image: radial-gradient(circle, hsl(var(--primary) / 0.035) 1px, transparent 1px);
background-size: 44px 44px;
```

Light mode: no background texture.

---

## Animations

| Class | Keyframe | Duration |
|---|---|---|
| `.animate-fade-up` | fadeUp (fade from opacity 0 + slide up 14px) | 0.6s ease-out |
| `.animate-fade-up-delay-1` | fadeUp | 0.6s, 0.1s delay |
| `.animate-fade-up-delay-2` | fadeUp | 0.6s, 0.2s delay |
| `.animate-fade-up-delay-3` | fadeUp | 0.6s, 0.3s delay |
| `.animate-marquee` | horizontal scroll left | 30s linear infinite |

### Firefly particles

`.firefly` - 2×2 px dot with `box-shadow` glow in `--primary` color, animated with `fireflyFloat` (8 particles, varying `animation-duration` 6.5–11 s and `animation-delay`). In light mode, `.light .firefly` reduces to 1.5×1.5 px and uses `--firefly-color` (`41 100% 45%`, slightly darker amber) for contrast against the light background.

---

## Electric Glow Effects

- `.btn-primary:hover` - 28 px amber `box-shadow`
- `.btn-ghost:hover` - 20 px subtle amber `box-shadow`
- `.card-glow:hover` - 1 px border glow + 32 px / 60 px radial shadows

Light mode overrides reduce glow intensities.

---

## Sidebar Tokens

Sidebar uses the same token namespace (`--sidebar-*`) mirroring the main tokens. Not currently used in any page component.

---

## Focus Visible Styling

All interactive elements use the standard focus-visible pattern for keyboard accessibility:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

Adjust `ring-offset-1` for inline elements or `ring-offset-2` for block elements as appropriate.

Always use `ring-ring`, never `ring-primary/xx`. The `--ring` token is theme-aware: dark mode amber (`41 100% 60%`), light mode dark amber (`41 100% 35%`, hex `#B37700`) for WCAG AA contrast in both modes.

---

## Skip Navigation

Every page must support keyboard bypass of the navigation bar (WCAG 2.4.1).

- The skip link is rendered as the first child inside `<ConsentProvider>` in `Layout.tsx` and always targets `#main-content`. Routing is handled by React Router v7 framework mode (no `<BrowserRouter>` in the codebase).
- It is styled with the `.skip-nav` class defined in `src/index.css`: visually hidden (`top: -100%`) until focused, at which point it appears at `top: 1rem`.
- Every page's `<main>` element must have `id="main-content"`. Do not omit this on new pages.

```tsx
// In Layout.tsx (already present, do not duplicate)
<a href="#main-content" className="skip-nav">Skip to main content</a>

// On every page
<main id="main-content" ...>
```

---

## Hooks

### `useTheme`

`src/hooks/useTheme.tsx`

Manages the light/dark theme. Applies `.light` or `.dark` class to the `<html>` element and persists the choice in `localStorage` under the key `theme`.

```ts
const { theme, toggle } = useTheme();
```

| Return | Type | Description |
|---|---|---|
| `theme` | `"light" \| "dark"` | Current active theme |
| `toggle()` | `() => void` | Toggle between light and dark and persist the choice |

The default is dark. All light mode color overrides live in `src/index.css` as unlayered CSS rules scoped to `.light`. Never place light mode overrides inside `@layer base`, as they would be silently overridden by `@layer utilities`.

---

### `useActiveSection`

`src/hooks/useActiveSection.ts`

Observes a list of section element IDs using `IntersectionObserver` and returns the ID of whichever section is currently visible in the viewport, or `null` if none are.

Designed for anchor-based nav items on single-page layouts. Runs off the main thread with zero scroll listeners.

```ts
const activeSection = useActiveSection(["challenges", "about"]);
// returns "challenges" | "about" | null
```

| Param | Type | Description |
|---|---|---|
| `sectionIds` | `string[]` | Array of element IDs to observe. Pass a stable module-level constant to prevent unnecessary re-runs. |

| Return | Type | Description |
|---|---|---|
| (value) | `string \| null` | ID of the intersecting section, or `null` when none are in view |

The observer fires at `threshold: 0.2` (20% visibility). The observer is disconnected on unmount.

Usage in `Navbar.tsx`:

```ts
const OBSERVED_SECTIONS = ["challenges"]; // stable constant, outside component
const activeSection = useActiveSection(OBSERVED_SECTIONS);
const challengesActive = location.pathname === "/" && activeSection === "challenges";
```

---

### `useConsent`

`src/hooks/useConsent.tsx`

Manages analytics consent state for GDPR Consent Mode v2.

```ts
const { consent, grant, deny, reset } = useConsent();
```

| Return | Type | Description |
|---|---|---|
| `consent` | `"granted" \| "denied" \| null` | `null` = not yet decided (show banner) |
| `grant()` | `() => void` | Accept analytics, updates gtag and localStorage |
| `deny()` | `() => void` | Decline analytics, updates localStorage |
| `reset()` | `() => void` | Clears stored choice, re-shows banner, resets gtag to denied |

Consent is stored in `localStorage` under the key `analytics_consent` as `{ value, timestamp }`. It expires after 6 months and the user is re-prompted.

---

### `useIsomorphicLayoutEffect`

A utility constant that resolves to `useLayoutEffect` in the browser and `useEffect` on the server. Used to avoid the React SSR warning "useLayoutEffect does nothing on the server" during SSG prerendering.

```ts
import { useEffect, useLayoutEffect } from "react";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

Always guard any `localStorage` or browser API access inside the callback:

```ts
useIsomorphicLayoutEffect(() => {
  if (typeof window === "undefined") return;
  // browser-only code here
}, []);
```

Currently used in: `src/hooks/useTheme.tsx`.

---

### `useDiscussionPosts`

`src/hooks/useDiscussionPosts.ts`

Loads Discourse posts for a single adventure level from `src/data/discussion-data.json` (written at build time). Returns them as `PostWithAge[]` — raw post fields plus a computed `age` string. Returns `[]` until the data loads or if the URL contains no recognisable topic ID.

```ts
const posts = useDiscussionPosts(discussionUrl);
// or, in tests:
const posts = useDiscussionPosts(discussionUrl, mockLoader);
```

| Argument | Type | Description |
|---|---|---|
| `discussionUrl` | `string` | Full Discourse topic URL. Topic ID is extracted from the path. |
| `loader` | `DiscussionDataLoader` (optional) | Async function that returns the raw JSON data. Defaults to a dynamic `import()` of the JSON file (omitted from the ChallengeDetail bundle). Pass a `vi.fn().mockResolvedValue(data)` in tests — see the Testing section of `CLAUDE.md` for the injectable-loader pattern. |

**Why the injectable loader?** Vitest's dynamic-import mock runner has a multi-second first-call cost per test run. Injecting a mock loader bypasses it entirely. `vi.spyOn` on the module export does NOT work for same-module calls in ES module context.

---

## Components

### `ConsentBanner`

`src/components/ConsentBanner.tsx`

Dual-mode component. Renders differently based on whether the user has made a consent decision:

- **No decision yet (`consent === null`):** renders a full-width fixed bottom bar with Decline / Accept analytics buttons and a link to `/privacy`.
- **Decision made (`consent !== null`):** renders a single 44×44 px floating cookie icon button fixed at `bottom-right`. Clicking it calls `reset()` to re-show the banner.

The banner uses `paddingBottom: env(safe-area-inset-bottom)` and the floating button uses `bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem)` so both respect the iOS home indicator safe area. `index.html` must include `viewport-fit=cover` in the viewport meta tag for this to work.

Touch target is 44×44 px (`h-11 w-11`) to meet WCAG 2.5.5 (minimum 44×44 px).

No props. Uses `useConsent` context internally.

---

### `NavLink`

`src/components/NavLink.tsx`

A thin wrapper around React Router's `NavLink` that normalises the `className` API. React Router v6's `NavLink` passes a function to `className`; this wrapper accepts plain strings for `className`, `activeClassName`, and `pendingClassName` and merges them via `cn`.

```tsx
<NavLink to="/about" className="base-class" activeClassName="active-class">
  About
</NavLink>
```

| Prop | Type | Description |
|---|---|---|
| `className` | `string?` | Always-applied class |
| `activeClassName` | `string?` | Applied when the route is active |
| `pendingClassName` | `string?` | Applied during navigation pending state |
| All other `NavLinkProps` | | Forwarded to React Router `NavLink` |

Uses `forwardRef` to pass through refs.

---

### `PageHero`

`src/components/PageHero.tsx`

Full-width amber (`bg-primary`) hero banner used at the top of inner pages. Renders an optional eyebrow label, an `<h1>` title, a description paragraph, and up to two CTA buttons.

```tsx
<PageHero
  eyebrow="About"
  title="Building the contributors and maintainers of tomorrow"
  description="Vendor-neutral. Open source. Community-driven."
  primaryCta={{ label: <>Start <ArrowDown size={14} aria-hidden="true" /></>, href: "#section" }}
  secondaryCta={{ label: "Learn more", href: "/handbook" }}
/>
```

| Prop | Type | Description |
|---|---|---|
| `eyebrow` | `string?` | Small overline label above the title |
| `title` | `string` | Page `<h1>` text |
| `description` | `string` | Supporting paragraph |
| `primaryCta` | `Cta?` | Primary button (`.btn-inverse`) |
| `secondaryCta` | `Cta?` | Secondary button (`.btn-ghost-inverse`) |

`Cta` shape: `{ label: ReactNode; href: string; external?: boolean }`. External CTAs get `target="_blank"` with the sr-only new-tab span. Anchors (`#`) and `mailto:` links render as `<a>`; all others render as React Router `<Link>`.

**Important:** Buttons inside `PageHero` must use `.btn-inverse` / `.btn-ghost-inverse`. Never use `.btn-primary` or `.btn-ghost` inside `bg-primary` sections — they produce yellow-on-yellow in light mode.

---

### `LevelCard`

`src/components/LevelCard.tsx`

Renders a single adventure level as a card: difficulty badge, level name, key learnings list, and links to open in GitHub Codespaces and view the discussion.

```tsx
<LevelCard level={level} headingLevel="h2" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `level` | `AdventureLevel` | required | Level data from `src/data/adventures.ts` |
| `headingLevel` | `"h2" \| "none"` | `"h2"` | Pass `"none"` when the parent page already renders the level name as `<h1>` to avoid duplicate heading in the document outline. When `"none"`, the level name renders as a `<p>`. The "Key Learnings" label always renders as a `<p>` regardless of this prop — it is a decorative sub-label, not a structural heading. |

---

### `FilteredLevelCard`

`src/components/FilteredLevelCard.tsx`

Navigation card used in tag-filtered level grids. The entire card is a `<Link>` to the challenge detail page. Renders a difficulty badge, level name, first three learnings, and a footer row with "Challenge" label and the parent adventure title.

```tsx
<FilteredLevelCard
  level={level}
  adventureId={adventureId}
  adventureTitle={adventureTitle}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `level` | `AdventureLevel` | required | Level data from `src/data/adventures.ts` |
| `adventureId` | `string` | required | Used to build the link href: `/adventures/:id/levels/:levelId` |
| `adventureTitle` | `string` | required | Shown in the card footer as a tag label |
| `className` | `string?` | — | Merged onto the root `<Link>` via `cn()`. Pass `"animate-fade-up-delay-1"` when the card is in a staggered grid. |

Distinct from `LevelCard`: `FilteredLevelCard` is a router link used in listing/filter contexts; `LevelCard` is a static card used on detail pages and includes the GitHub Codespaces CTA.

---

### `AboutSection`

`src/components/AboutSection.tsx`

Renders the About page content: Our Mission, Who It's For, What We Stand For, and How We Build Together sections. The "How We Build Together" section renders a four-column grid of value cards (icon + title + description). Each value card title uses `<h3 className="mt-3 text-lg font-semibold text-foreground">` — these are structural sub-headings under the `<h2>` section heading and must remain `<h3>`, not `<p>`.

No props. Self-contained section component.

---

### `VerificationSection`

`src/components/VerificationSection.tsx`

Static card explaining how to run the in-Codespace verification script. Includes an external link to the challenges repo on GitHub.

No props. Renders a self-contained `<div>` with heading, description, and external link. Used on `ChallengeDetail` pages.

---

### `DiscussionSection`

`src/components/DiscussionSection.tsx`

Displays up to five community posts for an adventure level, fetched at build time from Discourse. Post ages are computed on the client after mount to avoid calling `Date.now()` at render time.

```tsx
<DiscussionSection discussionUrl={level.discussionUrl} />
```

| Prop | Type | Description |
|---|---|---|
| `discussionUrl` | `string` | Full Discourse topic URL. The topic ID is extracted from this URL and used as the key into `src/data/discussion-data.json`. |

The component is a pure renderer. All data-loading and ID-extraction logic lives in `useDiscussionPosts` (see Hooks section). Falls back to an empty state with a "Join the discussion" link when no posts are found.

Uses `aria-live="polite"` so screen readers announce the age values when they update after mount.

---

### `TechFilterSection`

`src/components/TechFilterSection.tsx`

Self-contained technology filter used on `AdventureDetail` and `ChallengeDetail` pages. Renders a row of filter pills (one per unique tag across all adventures) and a grid of matching challenge cards when a tag is selected.

```tsx
<TechFilterSection />
```

No props. Owns its own `activeTech` state internally. `ALL_TAGS` is imported from `src/data/adventures.ts` (computed once at module load; shared with `ChallengesGrid`). The results grid only renders when a tag is active and at least one matching level exists. Wraps results in `aria-live="polite"` so screen readers announce updates.

The challenge cards in the results grid are rendered via `FilteredLevelCard` with `className="animate-fade-up-delay-1"` (see `FilteredLevelCard` in the Components section).

---

### `ChallengesGrid`

`src/components/ChallengesGrid.tsx`

Renders the full adventure listing with a technology tag filter. Used on the home page (`Index.tsx`) and the dedicated adventures listing page (`Adventures.tsx`).

```tsx
<ChallengesGrid />
```

No props. Owns its own `activeTopic` state internally.

**Two display modes:**

- **No tag selected (default):** renders one `AdventureCard` per adventure. Each card links to `/adventures/:id` and carries `aria-label={adventure.title}`.
- **Tag selected:** replaces adventure cards with a grid of `FilteredLevelCard` instances (one per matching level across all adventures). Each card links to `/adventures/:id/levels/:levelId`. Wrapped in `aria-live="polite"` so screen readers announce updates.

The filter chips use `role="group"` with `aria-label="Filter challenges by technology"`. Clicking an active chip deselects it and returns to the adventure card view. The `aria-live` region is only mounted when a tag is active.

**Important:** the Technology Filter Pattern in the Patterns section documents the shared state logic. `AdventureDetail` and `ChallengeDetail` use `TechFilterSection` for the same filter — do not add a second instance of `ChallengesGrid` on those pages.

---

## Patterns

### Inline Challenge Card

Use `FilteredLevelCard` (see Components section). Do not inline the card markup. The component handles all classes, accessibility attributes, and structure.

```tsx
<FilteredLevelCard
  level={level}
  adventureId={adventureId}
  adventureTitle={adventureTitle}
  className="animate-fade-up-delay-1"  {/* optional — omit when no stagger needed */}
/>
```

Used in `ChallengesGrid` and `TechFilterSection` (and wherever a tag-filtered level result grid is needed). Each card is a `<Link>` to `/adventures/:id/levels/:levelId`.

### Technology Filter Pattern

Used on the home page (`ChallengesGrid`) and on adventure/challenge detail pages via the `TechFilterSection` component. `AdventureDetail` and `ChallengeDetail` must use `<TechFilterSection />` — do not inline this pattern in those pages again.

```ts
const [activeTech, setActiveTech] = useState<string | null>(null);
```

- Filter chips render with `.pill-active` when selected and `.pill-inactive` otherwise.
- Each chip sets `aria-pressed={activeTech === tag}`.
- Clicking an already-active chip deselects it: `setActiveTech(activeTech === tag ? null : tag)`.
- No URL change and no page navigation occur on selection.
- The filtered results grid only renders when `activeTech` is non-null and results exist.

---

## Utilities

### `buildPageMeta`

`src/lib/meta.ts`

Generates the standard meta tag array for a page's `meta()` export. Covers `title`, canonical link, `description`, all `og:*` tags, and all `twitter:*` tags with the site's standard OG image.

```ts
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "Page Title - OffOn",
    description: "Under 160 characters.",
    url: `${SITE_URL}/path`,
  });
```

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | required | Page title and `og:title` / `twitter:title` |
| `description` | `string` | required | Meta description and `og:description` / `twitter:description` |
| `url` | `string` | required | Canonical URL and `og:url` |
| `ogType` | `string?` | `"website"` | `og:type` value. Use `"article"` for adventure and challenge pages. |
| `extra` | `MetaDescriptor[]?` | `[]` | Additional tags appended after the standard set (e.g. `{ name: "robots", content: "noindex" }` for `Privacy`). |

Every page's `meta()` must use this function. Do not inline the og/twitter tag block manually.

---

## Icons

All icons use **lucide-react** (already a project dependency; no other icon library may be added).

### Sizes

| Context | Size prop |
|---|---|
| Inline with `text-sm` body or link text | `size={13}` |
| Inline with `text-base` or larger | `size={16}` |
| Section card icon (standalone, above heading) | `size={28}` |
| Button icon (paired with button label) | `size={14}` |

### Alignment

When pairing an icon with text inside a link or button, always use `inline-flex items-center gap-1` on the container.
Never put a raw SVG icon next to text inside a plain `inline` or `block` element. The icon will drop below the baseline.

```tsx
// Correct
<a className="inline-flex items-center gap-1 ...">
  Share something <ArrowRight size={13} aria-hidden="true" />
</a>

// Incorrect: icon drops below text baseline
<a className="text-sm ...">
  Share something <ArrowRight size={13} />
</a>
```

### Accessibility

- Decorative icons (paired with visible text): `aria-hidden="true"`, no `aria-label`.
- Icon-only interactive elements: no `aria-hidden`, always include `aria-label` on the parent.
- Never omit `aria-hidden="true"` from a decorative icon next to visible text. The icon will be announced redundantly by screen readers if omitted.

### Icon map (current usage)

| Icon | Lucide name | Where used |
|---|---|---|
| External link (navigation) | `ArrowUpRight` | Navbar GitHub button, BottomCTA GitHub button, CommunityGuide links |
| Navigate forward / CTA | `ArrowRight` | Inline text links (DiscussionSection, VerificationSection, CommunityVoicesSection, ConnectSection, BottomCTA, LevelCard) |
| Navigate back | `ArrowLeft` | ChallengeDetail breadcrumb |
| Scroll down / anchor | `ArrowDown` | Hero primary CTA |
| Community Voices section | `Megaphone` | CommunityVoicesSection card icon |
| Q&A section | `CircleHelp` | CommunityVoicesSection card icon |
| Introduce yourself section | `UserPlus` | ConnectSection card icon |
| Events & meetups section | `CalendarDays` | ConnectSection card icon |
| Adventure levels badge | `Layers` | ChallengesGrid adventure card |

### Brand/social icon exceptions

Some official brand marks have no equivalent in lucide-react and must use the brand's own SVG. These are the only permitted exceptions to the lucide-react-only rule.

| Brand | Where used | Notes |
|---|---|---|
| LinkedIn "in" rounded-rectangle mark | `Footer.tsx` bottom strip | Inline SVG, `aria-hidden="true"` on `<svg>`, `aria-label="LinkedIn (opens in new tab)"` on parent `<a>`, `fill="currentColor"`, `className="w-3.5 h-3.5"` (14 px, matching surrounding icon size) |

When adding a new brand SVG: place it inline, set `aria-hidden="true"` on the `<svg>`, put the accessible label on the parent interactive element, use `fill="currentColor"`, and add a row to this table.

---

## Utilities

### `stripHtml`

`src/utils/stripHtml.ts`

Strips all HTML tags from a string, leaving only the plain text content. Used by `DiscussionSection` to produce accessible `aria-label` strings and plain-text previews from Discourse HTML.

```ts
stripHtml("<p>Hello <strong>world</strong></p>") // => "Hello world"
```

| Param | Type | Description |
|---|---|---|
| `html` | `string` | Raw HTML string to strip |

Returns the input with all `<tag>` patterns removed. HTML entities (e.g. `&amp;`) are left as-is.

---

## CSS Class Patterns

### `.section-label`

A utility class for decorative overline labels that appear above section headings or page content areas.

Applied as: `font-sans text-sm font-medium uppercase tracking-widest text-primary section-label`

Used on `<span>` elements in: `CommunityVoicesSection`, `ConnectSection`, `ChallengesGrid`, `NotFound`.

**Light mode override:** `.light .section-label` in the unlayered section of `src/index.css` sets `color: hsl(240 20% 9%)` (near-black) so the label does not render as yellow text in light mode.

---

### `.docs-ext-link`

A styled external link class for inline prose links in `CommunityGuide.tsx`. Combines an underline treatment (decoration-2 underline-offset-2) with focus-visible ring and transitions.

**Dark mode:** foreground text, `--primary`-colored underline. Hover softens both to `primary / 0.75`.
**Light mode:** foreground text with `currentColor` underline. Hover shifts text and underline to `--muted-foreground`.

```ts
const extLink = "docs-ext-link inline-flex items-center gap-1 underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";
```

---

### `.badge-levels`

Inline pill used in `ChallengesGrid.tsx` adventure cards to show the number of levels. Styled as a mono-font uppercase tag with amber fill in light mode.

```tsx
<span className="badge-levels inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
  <Layers size={11} aria-hidden="true" /> {n} levels
</span>
```

Light mode override: `.light .badge-levels` sets black text on amber background so it remains legible. Excluded from the broad `.light span.text-primary:not(.badge-levels)` reset — it intentionally keeps its amber styling.

---

### `.bg-primary` focus ring override

Any element with `bg-primary` (PageHero, BottomCTA) overrides `--ring` to black (`0 0% 0%`) so that focus rings remain visible against the amber background in both modes. This is defined as an unlayered rule in `src/index.css`:

```css
.bg-primary {
  --ring: 0 0% 0%;
}
```

Never place a `bg-primary` section without verifying that focusable children inherit this black ring value.

---

## Performance

### Lighthouse scores (production build)

Measured against the production build locally (`npm run build && npm run preview`). Minimum acceptable score: 90 for all categories.

| Category | Score |
|---|---|
| Performance | 90 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
