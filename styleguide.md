# OffOn Style Guide

## Brand Name

The brand is always written **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".

The domain `offon.dev` is always lowercase (it is a URL, not a brand mention).

All brand copy constants live in `src/data/constants.ts`. Use them instead of hardcoding strings:

| Constant | Value / purpose |
| --- | --- |
| `BRAND_NAME` | `"OffOn"`: the brand name |
| `BRAND_SLOGAN_PARTS` | `["Vendor-Neutral", "Open Source", "Community-Driven"]`. Slogan as an array, used to render with icon separators |
| `BRAND_SLOGAN` | The three parts joined with `". "`. Use for plain-text contexts (page titles, meta) |
| `BRAND_SECONDARY_LINE_PARTS` | `["always On.", "always Open.", "always Learning."]`. Rendered in the Hero h1 |
| `BRAND_SECONDARY_LINE` | The three parts joined with spaces. Use for plain-text contexts (CTA copy) |
| `BRAND_SHORT_DESCRIPTION` | The canonical homepage meta description |
| `SITE_NAME` | `"offon.dev"`. The domain, always lowercase |

---

## Typography

### Fonts

| Role | Family | Key weights | Format |
| --- | --- | --- | --- |
| Headings / display (`font-heading`) | Syne | 700 | WOFF2 only (`public/fonts/syne-*.woff2`) |
| Body & UI (`font-sans`) | Inter | 400, 500, 600 | WOFF2 only (`public/fonts/inter-*.woff2`) |
| Code / mono (`font-mono`, `code`, `pre`) | JetBrains Mono | 400 primary (500, 600 available) | WOFF2 only (`public/fonts/jetbrains-mono-*.woff2`) |

All fonts are fully self-hosted as WOFF2. No TTF fallbacks. No external network requests.

Subset coverage (via `unicode-range` in `src/index.css` -- only the needed subset downloads per user):

| Family | Subsets |
| --- | --- |
| Inter | latin, latin-ext, cyrillic-ext, cyrillic, greek-ext, greek, vietnamese |
| Syne | latin, latin-ext, greek |
| JetBrains Mono | latin, latin-ext |

### Font preload

Fonts are preloaded to avoid the three-level font discovery delay (HTML parse → CSS parse → font file request). All preloads live in `src/root.tsx` and fire on every page load:

**Global (`src/root.tsx`), preloaded on every page:**

- `inter-latin-400-normal.woff2`: body text (Navbar, paragraphs)
- `inter-latin-500-normal.woff2`: medium-weight body text (Navbar links)
- `inter-latin-600-normal.woff2`: semibold text (section labels, card titles)
- `syne-latin-700-normal.woff2`: h1 and h2 elements (the `@layer base` rule in `src/index.css` applies `font-family: 'Syne'` to h1 and h2 only; h3–h6 use Inter)

Only Latin subset variants are preloaded. Other subsets are served from `public/fonts/` but are not preloaded. Update `src/root.tsx` whenever above-the-fold typography changes.

### Tailwind font utilities

| Utility | Resolves to |
| --- | --- |
| `font-sans` | Inter |
| `font-mono` | JetBrains Mono |
| `font-heading` | Syne |

### Scale (Tailwind defaults)

| Element | Class example | Notes |
| --- | --- | --- |
| H1 | `text-4xl font-bold` md:`text-5xl` | Syne, weight 700 |
| H2 | `text-3xl font-bold` md:`text-4xl` | Syne, weight 700 |
| H3 | `text-lg font-semibold` | Inter, weight 700 (base layer); apply `font-semibold` to override to 600 |
| Body | `text-base` | Inter, weight 400 |
| Small / caption | `text-sm` | Inter, weight 400 |
| Overline label | `font-sans text-sm font-medium uppercase tracking-widest` | Inter |
| Badge / tag | `font-mono text-xs uppercase tracking-wider` | JetBrains Mono |

### Copy casing

**UI labels (buttons, CTAs, headings, card titles, nav links) use title case (Chicago style).** Body copy and descriptions use sentence case.

Title case rule: capitalise every word except articles (a, an, the), prepositions under five letters (by, in, on, of, to, for, at), and coordinating conjunctions (and, but, or, nor), unless they open the label.

| Context | Case | Example |
| --- | --- | --- |
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
| --- | --- | --- | --- |
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
| --- | --- | --- | --- |
| `--text-primary` | `47 54% 98%` | `#faf8f3` | Main content |
| `--text-secondary` | `43 27% 92%` | `#ece8de` | Supporting text, nav links |
| `--text-tertiary` | `43 36% 94%` | `#f5eedf` | Tertiary text |
| `--text-muted` | `43 36% 94%` | `#f5eedf` | Captions, hints |
| `--text-faint` | `43 36% 94%` | `#f5eedf` | Disabled / very subtle, counts |

#### Surface tokens (dark)

| Token | HSL | Usage |
| --- | --- | --- |
| `--surface` | `240 9% 9%` | Card / section backgrounds |
| `--surface-border` | `219 36% 18%` | Surface borders |
| `--surface-hover` | `0 0% 10%` | Hover states on surfaces |
| `--border-med` | `219 36% 18%` | Medium border (alias) |
| `--accent-subtle` | `221 57% 12%` | Very subtle accent tint background |

#### Accent / effect palette (dark)

| Token | HSL | Usage |
| --- | --- | --- |
| `--electric` | `41 100% 60%` | Primary glow / electric yellow |
| `--emerald` | `41 100% 60%` | Warm accent (same as electric) |
| `--teal` | `38 100% 58%` | Secondary warm accent |
| `--purple` | `32 100% 52%` | Tertiary warm accent |

#### Difficulty badges

Used for avatar tints in `DiscussionSection` (at `/0.2` opacity) and as semantic color anchors for the difficulty visual language. The `-bg` and `-border` tokens (used by `DifficultyBadge`) share the same hue families.

| Token | Dark HSL | Light HSL | Color |
| --- | --- | --- | --- |
| `--difficulty-starter` | `41 100% 60%` | `41 100% 80%` | Amber/yellow |
| `--difficulty-builder` | `85 48% 56%` | `85 48% 75%` | Green |
| `--difficulty-architect` | `245 45% 79%` | `245 45% 85%` | Lavender/purple |

---

### Light Mode (`.light`)

The light mode uses a barely-cool background palette. The slight cool/warm contrast between the background and amber accents is intentional: it mirrors how dark mode works (near-black vs warm amber), just inverted and far more subtle. `bg-primary` sections (PageHero, BottomCTA) stay amber in light mode. They do not flip to black.

| Token | Value | Approx hex | Notes |
| --- | --- | --- | --- |
| Background | `hsl(220 12% 98%)` | `#F8F9FB` | Barely-cool off-white |
| Surface/card | `hsl(220 10% 96%)` | `#F4F5F7` | Slightly deeper card |
| Surface hover | `hsl(220 8% 93%)` | `#ECEEF1` | Hover state |
| Primary accent | `hsl(41 100% 60%)` | `#ffc034` | Fill/border only, never text |
| Primary foreground | `hsl(0 0% 0%)` | `#000000` | Text on amber fills |
| Foreground/body | `hsl(240 25% 8%)` | `#0D0D17` | Deep navy (`--foreground`) |
| Foreground hover | `hsl(240 25% 5%)` | | Slightly deeper than foreground, used for link/nav hover (`--foreground-hover`) |
| Headings | `hsl(240 25% 8%)` | `#0D0D17` | Overrides dark mode primary-colored headings (via `.light h1–h6`) |
| Muted text (`--muted-foreground`) | `hsl(35 8% 32%)` | `#534B42` | Warm gray, ~7.3:1 on light bg — used via `text-muted-foreground` |
| Faint text (`--text-tertiary`, `--text-muted`, `--text-faint`) | `hsl(35 8% 29–30%)` | `#504B44` | Slightly darker; labels, timestamps, metadata — ~8:1+ on light bg |
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

### Tailwind Utility Shortcuts

The `@theme` block in `src/index.css` maps design tokens to named Tailwind utilities. Use these instead of arbitrary values:

| Pattern to avoid | Named utility | Token |
| --- | --- | --- |
| `border-[hsl(var(--surface-border))]` | `border-border` | `--border` / `--surface-border` (identical values) |
| `text-[hsl(var(--text-secondary))]` | `text-dim` | `--text-secondary` via `--color-dim` in `@theme` |
| `text-[hsl(var(--text-faint))]` | `text-faint` | `--text-faint` via `--color-faint` in `@theme` |

For focus ring classes see the [Focus Visible Styling](#focus-visible-styling) section.

---

## Component Classes

### Buttons

| Class | Style | Usage |
| --- | --- | --- |
| `.btn-primary` | Filled amber, `rounded-md px-5 py-3 text-sm font-semibold`, `brightness-110` on hover | Default CTA on page background |
| `.btn-ghost` | Outlined, `border-foreground/35`, amber border and text on hover | Secondary CTA on page background |
| `.btn-soft` | Tinted `bg-primary/10 border-primary/30`, no glow | Tertiary / low-emphasis action |
| `.btn-inverse` | White/background fill with primary border, primary text, `font-semibold`; inverts on hover to primary bg | Primary CTA inside a `bg-primary` section (e.g. `PageHero`, `BottomCTA`) |
| `.btn-ghost-inverse` | Transparent with background-colored border and text, `font-semibold`; inverts on hover to background fill | Secondary CTA inside a `bg-primary` section |

#### Button contrast rule (light mode)

Never place any button directly on a `bg-primary` background using `.btn-primary` or `.btn-ghost`. Those classes are designed for page-background contexts and will produce yellow text on yellow background in light mode.

For buttons inside `bg-primary` sections (e.g. `PageHero`, `BottomCTA`), always use `.btn-inverse` or `.btn-ghost-inverse`. Since the section stays amber in light mode, the unlayered overrides in `src/index.css` set `.btn-inverse` to black background with amber text (reversal), and `.btn-ghost-inverse` to transparent with a dark border and dark text.

Never add a `bg-primary` section button without adding or verifying the corresponding `.light .bg-primary .btn-*` override in the unlayered section of `src/index.css`.

### Pills (filter toggles)

| Class | Style |
| --- | --- |
| `.pill-active` | `rounded-full bg-primary/10 border-primary/50 text-primary` |
| `.pill-inactive` | `rounded-full bg-transparent border-surface-border text-text-secondary`; hover: `border-primary/60 text-primary bg-primary/5` with electric glow |

Both use `px-4 py-1.5 min-h-[44px] text-sm font-medium leading-none inline-flex items-center gap-1.5` and include `focus-visible` ring styles (`ring-ring`). The `min-h-[44px]` satisfies WCAG 2.5.5 target size; content is vertically centered via `items-center`.

### cursor: pointer rule

All `<button>`-based interactive elements must have `cursor: pointer` set explicitly in `src/index.css`. Browsers default `<button>` to `cursor: default`, so without this, AI agents doing visual analysis will not recognise the element as actionable. `<a>` / `<Link>` elements are exempt — browsers default those to pointer already.

This applies to every new button utility class and every pill class used on `<button>` elements. Add `cursor: pointer` in the class definition in `src/index.css`, not inline via Tailwind.

### Difficulty Badges

Badge colors use CSS tokens defined in `src/index.css`. All three difficulties use black text (`--difficulty-text`) on pastel backgrounds for WCAG AA compliance (minimum 4.5:1 contrast ratio).

| Difficulty | Dark mode bg token | Light mode bg token | Color |
| --- | --- | --- | --- |
| Beginner | `--difficulty-starter-bg` | `--difficulty-starter-bg` | Pastel amber |
| Intermediate | `--difficulty-builder-bg` | `--difficulty-builder-bg` | Pastel sage green |
| Expert | `--difficulty-architect-bg` | `--difficulty-architect-bg` | Pastel lavender |

Tokens are defined in the `:root, .dark` block and overridden in the `.light` unlayered section of `src/index.css`. Never hardcode HSL values in `DifficultyBadge.tsx`. Use `hsl(var(--difficulty-*))` references only.

### Nav and Footer Links

Link hover and active states use an underline that is always rendered in the DOM but invisible by default. This avoids layout shift on hover.

| State | Classes |
| --- | --- |
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

All animation classes are defined inside `@media (prefers-reduced-motion: no-preference)`. Under `prefers-reduced-motion: reduce` the animation property is absent, so elements render at their natural styles (fully visible, no transform).

| Class | Keyframe | Duration |
| --- | --- | --- |
| `.animate-fade-up` | fadeUp (slide up 8px, no opacity change) | 0.35s ease-out |
| `.animate-fade-up-delay-1` | fadeUp | 0.35s, 0.05s delay |
| `.animate-fade-up-delay-2` | fadeUp | 0.35s, 0.10s delay |
| `.animate-fade-up-delay-3` | fadeUp | 0.35s, 0.15s delay |
| `.animate-marquee` | horizontal scroll left | 30s linear infinite |

### Firefly particles

`.firefly` - 2×2 px dot with `box-shadow` glow in `--primary` color, animated with `fireflyFloat` inside `@media (prefers-reduced-motion: no-preference)` (8 particles, varying `animation-duration` 5.5–8.5 s and `animation-delay`). `will-change: transform, opacity` is applied only to the first three particles to stay within the ≤3 simultaneous limit. In light mode, `.light .firefly` keeps the same 2×2 px size but switches `background-color` and `box-shadow` to `--firefly-color` (`41 100% 45%`, slightly darker amber) for contrast against the light background. Under `prefers-reduced-motion: reduce`, fireflies are hidden entirely (`display: none`) — not just unanimated — because the glowing dots are purely decorative and serve no informational purpose when static.

---

## Electric Glow Effects

- `.btn-primary:hover` - `brightness-110` (lightens the amber fill; no `box-shadow`)
- `.btn-ghost:hover` - border shifts to `primary/60`, text shifts to `primary` (amber); no `box-shadow`
- `.card-glow:hover` - 1 px border glow + 32 px / 60 px radial shadows

Light mode overrides reduce glow intensities on `card-glow`.

---

## Sidebar Tokens

Sidebar uses the same token namespace (`--sidebar-*`) mirroring the main tokens. Not currently used in any page component.

---

## Focus Visible Styling

All interactive elements use the standard focus-visible pattern for keyboard accessibility. Use the shorthand CSS utilities defined in `src/index.css` (`@layer utilities`):

| Class | Expands to | When to use |
| --- | --- | --- |
| `focus-ring` | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | Block and card-level interactive elements (buttons, toggle, hamburger, skip link, logo) |
| `focus-ring-tight` | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` | Small inline elements (topic pill links, inline text links) |
| `focus-ring-subtle` | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` | Compact inline links where a full ring-2 ring would visually overwhelm the element (breadcrumb links) |

Always use `ring-ring`, never `ring-primary/xx`. The `--ring` token is theme-aware: dark mode amber (`41 100% 60%`), light mode dark amber (`41 100% 35%`, hex `#B37700`) for WCAG AA contrast in both modes.

Focus indicators must meet a minimum 3:1 contrast ratio against adjacent colors (WCAG 2.4.11). Verify in both light and dark mode whenever the surrounding background changes. See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the full contrast checklist.

---

## Skip Navigation

Every page must support keyboard bypass of the navigation bar (WCAG 2.4.1).

- The skip link is rendered as the first child inside `<ConsentProvider>` in `Layout.tsx` and always targets `#main-content`. Routing is handled by React Router v8 framework mode (no `<BrowserRouter>` in the codebase).
- It is styled with the `.skip-nav` class defined in `src/index.css`: visually hidden (`top: -100%`) until focused, at which point it appears at `top: 1rem`.
- Every page's `<main>` element must have `id="main-content"`. Do not omit this on new pages.

### Route effect components in `Layout.tsx`

`Layout.tsx` mounts four sibling components that each handle a single route-level side effect:

- **`<ScrollToTop />`**: on every route change, scrolls to the top of the page. When the URL has a hash, it instead scrolls the matching element into view via `requestAnimationFrame` so the target is mounted before the scroll runs. Required because React Router does not handle hash-anchor scrolling on client-side navigation.
- **`<FocusReset />`**: on every route change (skipping initial mount), moves focus to `#main-content` via `requestAnimationFrame` so keyboard and AT users land in the main content area rather than on `<body>`. Uses `{ preventScroll: true }` so the scroll position set by `<ScrollToTop />` is not overridden. All page `<main>` elements carry `id="main-content" tabIndex={-1}`.
- **`<PageViewTracker />`**: fires GA4 `page_view` on every navigation when consent is `"granted"`. Reads pathname, full URL, and `document.title`. Was previously combined with `<ScrollToTop />`; split so each component has a single responsibility.
- **`<ClickTracker />`**: wraps `useClickTracking` so the document-level click listener attaches when the consent context changes.

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

Manages the light/dark theme. Applies `.light` or `.dark` class to the `<html>` element and persists the choice in `localStorage` under the key `theme`. All `localStorage` access is wrapped in `try/catch` so the hook degrades gracefully in private browsing or when storage is unavailable.

```ts
const { theme, toggle } = useTheme();
```

| Return | Type | Description |
| --- | --- | --- |
| `theme` | `"light" \| "dark"` | Current active theme |
| `toggle()` | `() => void` | Toggle between light and dark and persist the choice |

The default is dark. If no preference is stored, the hook initialises to dark regardless of the OS-level `prefers-color-scheme` setting. User preference (stored in `localStorage` under `THEME_STORAGE_KEY`) always takes precedence. All light mode color overrides live in `src/index.css` as unlayered CSS rules scoped to `.light`. Never place light mode overrides inside `@layer base`, as they would be silently overridden by `@layer utilities`.

Theme changes are announced to screen readers via a `ThemeAnnouncer` component (private, mounted in `Layout.tsx`) that uses `role="status" aria-live="polite"`. The announcer skips the initial mount to avoid announcing the default theme on page load.

---

### `useConsent`

`src/hooks/useConsent.tsx`

Owns the React-side state for GDPR Consent Mode v2 (gated-load mode) and the `gtag.js` injector. The inline `<head>` bootstrap in `src/root.tsx` only sets the consent default to denied; `gtag.js` is loaded by this hook the moment the user clicks Accept (or on mount when `localStorage` records a granted decision).

```ts
const { consent, grant, deny, reset } = useConsent();
```

| Return | Type | Description |
| --- | --- | --- |
| `consent` | `"granted" \| "denied" \| null` | `null` = not yet decided (show banner) |
| `grant()` | `() => void` | Injects gtag.js (once per session), pushes `analytics_storage: granted`, writes localStorage |
| `deny()` | `() => void` | Pushes `analytics_storage: denied`, clears `_ga*` cookies, writes localStorage |
| `reset()` | `() => void` | Clears stored choice, re-shows banner, pushes `analytics_storage: denied`, clears `_ga*` cookies |

Consent is stored in `localStorage` under the key `analytics_consent` as `{ value, timestamp }`. It expires after 180 days and the user is re-prompted. The `ad_storage`, `ad_user_data`, and `ad_personalization` signals stay denied for the lifetime of the site since OffOn does not run Google Ads. Only `analytics_storage` is in scope.

The injector is shared between the Accept click and the mount-restore-from-localStorage path, gated by a module-scoped `gtagScriptInjected` boolean. Within a single session, a deny → grant → deny → grant cycle only ever appends one `<script>` tag; subsequent grants push only the consent update. The injector queues `consent update` + `js` + `config` synchronously before `appendChild` so when `gtag.js` loads it drains the queue in the correct order.

---

### `useClickTracking`

`src/hooks/useClickTracking.ts`

Attaches a delegated document-level `click` listener that fires a GA4 `click_event` whenever the click resolves to an `<a>` or `<button>` ancestor. The listener is gated on `consent === "granted"` and is removed automatically the moment consent flips away from granted.

```ts
useClickTracking();
```

Returns nothing. Reads consent via `useConsent`, so the call site must be inside `ConsentProvider`. Currently mounted via the `ClickTracker` sibling in `Layout.tsx`. Gating exists because pushing events to `dataLayer` while gtag.js is not loaded would queue them, and a later Accept would drain the queue and retroactively send clicks for actions the user took while consent was undecided or denied.

| Event property | Source | Fallback |
| --- | --- | --- |
| `click_text` | `tracked.getAttribute("aria-label")` when non-empty, otherwise `tracked.textContent?.trim()`, sliced to 100 chars | `"unknown"` |
| `click_url` | `<a>`: `href`. `<button>`: `data-url` attribute. | `"no-url"` |
| `click_element` | `tracked.tagName.toLowerCase()` (`"a"` or `"button"`) | none |
| `click_page` | `window.location.pathname` | none |

`tracked` is the closest `<a>` or `<button>` ancestor of `event.target`, so a click on an icon or text inside a link still attributes to the link itself. Clicks on plain elements (`<div>`, `<span>`) do not fire the event.

The custom property is named `click_page` (not `page_location`) because GA4 reserves `page_location` for the full page URL set on the `page_view` event. Sending a relative pathname into a reserved parameter would clash with GA4's URL grouping.

`click_text` is truncated to 100 chars at the source. GA4 silently truncates string parameter values at 100 chars, so doing it ourselves keeps the limit visible in the code rather than being discovered through missing-tail data in reports.

The skip-nav link (`<a href="#main-content">` in `Layout.tsx`) is excluded from tracking because it fires on every keyboard `Tab + Enter` and reflects assistive-tech navigation, not user intent. Other in-page hash links (e.g. `#section-2`) are still tracked normally.

---

### `useIsomorphicLayoutEffect`

A utility constant that resolves to `useLayoutEffect` in the browser and `useEffect` on the server. Used to avoid the React SSR warning "useLayoutEffect does nothing on the server" during SSG prerendering.

```ts
import { useEffect, useLayoutEffect } from "react";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

No `typeof window` guard is needed inside the callback. In SSR, `useIsomorphicLayoutEffect` resolves to `useEffect`, and React never runs effect callbacks during SSR, so the callback body is never reached on the server. Guard `localStorage` and other fallible browser APIs with `try/catch` instead (for private browsing and quota errors):

```ts
useIsomorphicLayoutEffect(() => {
  try {
    // browser-only code here
  } catch {
    // handle unavailable API
  }
}, []);
```

Currently used in: `src/hooks/useTheme.tsx`, `src/components/WalkthroughSection.tsx`.

---

### `useDiscussionPosts`

`src/hooks/useDiscussionPosts.ts`

Loads Discourse posts for a single adventure level from its per-level JSON file at `src/data/adventures/<adventureId>/<levelId>-posts.json` (refreshed daily by the GitHub Action). Returns `{ posts, totalReplies, solvers, loaded }`. The `cooked` field is pre-stripped plain text; HTML is removed by the refresh script before the JSON is written. All four fields start at their empty defaults until the async load completes or if the file does not exist.

```ts
const { posts, totalReplies, solvers, loaded } = useDiscussionPosts(adventureId, levelId);
// or, in tests:
const { posts, totalReplies, solvers, loaded } = useDiscussionPosts(adventureId, levelId, mockLoader);
```

| Argument | Type | Description |
| --- | --- | --- |
| `adventureId` | `string` | Adventure slug (e.g. `"echoes-lost-in-orbit"`). |
| `levelId` | `string` | Level slug (e.g. `"beginner"`). |
| `loader` | `DiscussionDataLoader` (optional) | Async function that returns `{ discussionPosts?, totalReplies?, solvers? }`. Defaults to a `import.meta.glob` import of the per-level JSON. Pass a `vi.fn().mockResolvedValue(data)` in tests; see the Testing section of `CLAUDE.md` for the injectable-loader pattern. |

`DiscussionResult` shape: `posts: PostWithAge[]`, `totalReplies: number`, `solvers: Solver[]`, `loaded: boolean`. `PostWithAge` is `StoredPost & { age: string }`. `Solver` has `username`, `avatarUrl?`, `solvedAt`. Gate content rendering on `loaded` to prevent a flash of empty state before data arrives.

**Why the injectable loader?** Vitest's dynamic-import mock runner has a multi-second first-call cost per test run. Injecting a mock loader bypasses it entirely. `vi.spyOn` on the module export does NOT work for same-module calls in ES module context.

---

### `useAdventureLeaderboard`

`src/hooks/useAdventureLeaderboard.ts`

Loads the per-adventure leaderboard from `src/data/adventures/<adventureId>/leaderboard.json` (refreshed daily by the GitHub Action). Returns ranked rows with points, avatar URL, and optional breakdown fields. Returns `[]` until data loads or if the file does not exist.

```ts
const { rows, updatedAt } = useAdventureLeaderboard(adventureId);
// or, in tests:
const { rows, updatedAt } = useAdventureLeaderboard(adventureId, mockLoader);
```

| Argument | Type | Description |
| --- | --- | --- |
| `adventureId` | `string` | Adventure slug (e.g. `"blind-by-design"`). |
| `loader` | `LeaderboardLoader` (optional) | Async function that returns `{ updatedAt, rows }`. Defaults to a dynamic `import.meta.glob` import. Pass `vi.fn().mockResolvedValue(data)` in tests. |

`LeaderboardRow` shape: `rank`, `username`, `avatarUrl?`, `points`, `challengesSolved?`, `beginnerPoints?`, `intermediatePoints?`, `expertPoints?`, `singlePoints?`, `breakdown?`.

---

### `useEscapeKey`

`src/hooks/useEscapeKey.ts`

Attaches a `keydown` listener on `document` that calls `onEscape` when `Escape` is pressed, and removes it when `enabled` is `false` or the component unmounts. Uses a ref to always call the latest `onEscape` without re-registering the listener on every render.

```ts
useEscapeKey(onEscape, enabled);
```

| Argument | Type | Description |
| --- | --- | --- |
| `onEscape` | `() => void` | Called when Escape is pressed. Always reads the latest version via an internal ref — do **not** wrap in `useCallback` with an empty `deps` array. A memoised closure with `deps: []` is never regenerated, so the ref always holds that stale first-render closure; state captured inside it will be wrong after any re-render. |
| `enabled` | `boolean` | Pass the open/active state of the overlay or dropdown. The listener is only registered while this is `true`. |

Used in `Navbar` (mobile menu) and `ChallengeFilters` (both dropdowns). When `enabled` is `difficultyOpen || tagsOpen`, the callback reads the latest values of both to determine which dropdown to close.

---

### `useFocusTrap`

`src/hooks/useFocusTrap.ts`

Traps Tab/Shift+Tab focus within a container while `enabled` is `true`. Focuses the first focusable element immediately when enabled. Removes all listeners when `enabled` flips to `false` or the component unmounts.

```ts
useFocusTrap(containerRef, enabled);
```

| Argument | Type | Description |
| --- | --- | --- |
| `containerRef` | `RefObject<HTMLElement \| null>` | Ref pointing to the container that should trap focus. Must be attached to the DOM element before `enabled` becomes `true`. |
| `enabled` | `boolean` | Pass the open state of the drawer or modal. The listener and initial focus move are only active while this is `true`. |

Focusable selector:

```css
a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),
textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]),
[tabindex]:not([tabindex="-1"])
```

The Tab handler re-queries the DOM on every keypress, so elements added or removed while the trap is active are reflected immediately.

**`display:none` guard:** if the container is `display:none` when `enabled` becomes `true` (e.g. the container has the `hidden` HTML attribute or is hidden by a Tailwind responsive class like `md:hidden`), the initial-focus move is silently skipped and no Tab events are intercepted. This is intentional — the hook does nothing when the container is not rendered. There is no automatic retry when the container later becomes visible; if the open state persists through a viewport resize that reveals the container, focus must be set by the caller. Do not use `visibility:hidden` as a visibility toggle — only `display:none` (or the HTML `hidden` attribute) is checked.

Used in `Navbar` (mobile menu drawer). The ref is attached to the menu `<div>` which is always in the DOM (hidden via the `hidden` attribute), so `containerRef.current` is non-null before the hook first runs.

---

## Components

### `Abbr`

`src/components/Abbr.tsx`

Wraps an abbreviation in a stateful component that renders a `<abbr>` with `aria-describedby` pointing to an sr-only `<span>` containing the expansion. A visual tooltip appears on hover and focus via CSS opacity transitions on a positioned child `<span>`. The `title` prop is the expansion text; it is intentionally NOT placed on the `<abbr>` element (doing so would show the browser's native tooltip alongside the custom one). Screen readers read the expansion via `aria-describedby` when the element has focus.

Use `<Abbr>` for abbreviations in JSX pages and components. Use native `<abbr title="…">` in template literal HTML strings passed to `dangerouslySetInnerHTML`; the generator (and `MarkdownContent.tsx` as a fallback) converts `title` to `data-title`, adds `tabindex` and an `aria-describedby` sr-only expansion span (not `aria-label`, which would replace the visible token), and attaches a JS portal tooltip. That prose path mirrors this component.

```tsx
<Abbr title="pull request">PR</Abbr>
<Abbr title="Web Content Accessibility Guidelines">WCAG</Abbr>
```

No `TooltipProvider` is needed. The `<abbr>` element is styled with `cursor-help` and a dotted underline. `tabIndex={0}` makes it keyboard-focusable so the tooltip is reachable without a mouse (WCAG 1.4.13). The component computes `maxWidth` from `window.innerWidth` after mount to prevent the tooltip from overflowing the viewport on narrow screens.

**Do not nest `<Abbr>` inside an `<a>` or `<button>`.** The `tabIndex={0}` would create an invalid interactive-inside-interactive structure. Use a plain `<abbr title="...">` instead; screen readers read `title` when traversing link text.

---

### `InlineProse`

`src/components/InlineProse.tsx`

Safe renderer for all author-prose HTML fields. Use this component in place of a bare `<p dangerouslySetInnerHTML>` wherever the content was converted from Markdown by the generator.

Renders `<p className="md-inline …">` when the HTML is inline-only, and `<div className="md-content …">` when the HTML contains any block-level element (`p`, `ul`, `ol`, `blockquote`, `h1`–`h6`, `pre`, `table`, `hr`, `figure`, `div`). The switch is automatic: callers never need to inspect the HTML.

**Rule:** every `dangerouslySetInnerHTML` site that renders an author-prose field (as listed in `CLAUDE.md`) must use `InlineProse`. Do not render author-prose HTML with a bare `<p>` or `<span>`.

**Exception:** `rewards.rankingNote` renders inside a `<span>` inside a `<p>`, so `InlineProse` cannot be used there. The generator enforces that `rankingNote` is inline-only and fails the build if block markup is detected.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `html` | `string` | required | Sanitised HTML from the generator |
| `className` | `string?` | `""` | Tailwind utilities appended before `md-inline`/`md-content` |

```tsx
<InlineProse html={tier.description} className="text-xs text-dim" />
```

`BLOCK_ELEMENT_RE` is also exported for the rare case where callers need to perform the same check without rendering (e.g. server-side generator scripts).

---

### `ConsentBanner`

`src/components/ConsentBanner.tsx`

Dual-mode component. Renders differently based on whether the user has made a consent decision:

- **No decision yet (`consent === null`):** renders a full-width fixed bottom bar with Decline / Accept analytics buttons and a link to `/privacy`.
- **Decision made (`consent !== null`):** renders a single 44×44 px floating cookie icon button fixed at `bottom-right`. Clicking it calls `reset()` to re-show the banner.

The banner uses `paddingBottom: env(safe-area-inset-bottom)` and the floating button uses `bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem)` so both respect the iOS home indicator safe area. `index.html` must include `viewport-fit=cover` in the viewport meta tag for this to work.

Touch target is 44×44 px (`h-11 w-11`) to meet WCAG 2.5.5 (minimum 44×44 px).

The banner uses `role="region"` with `aria-labelledby="consent-banner-title"` (pointing to the visible title paragraph). When the banner first mounts, focus is moved to the Decline button so keyboard users immediately know a decision is available.

No props. Uses `useConsent` context internally.

---

### `FocusReset` (internal, `src/Layout.tsx`)

Moves keyboard focus to `#main-content` on every SPA route change (WCAG 2.4.3). Skips the initial mount so users do not receive an intrusive focus jump on first page load. Deferred via `requestAnimationFrame` so the incoming route's DOM is committed before focus is attempted. Calls `element.focus({ preventScroll: true })` so `<ScrollToTop />`'s `scrollTo(0, 0)` is not overridden by the browser scrolling `#main-content` into view.

All page `<main>` elements must carry `id="main-content" tabIndex={-1}` for this to work. If the element is absent (e.g., a redirect page that renders `null`), the optional-chain short-circuits silently.

No props. Internal to `Layout.tsx`. Do not extract or reuse elsewhere.

---

### `RouteAnnouncer` (internal, `src/Layout.tsx`)

Announces the page title to screen readers on every SPA navigation. Renders a visually hidden `role="status"` live region. The announcement is deferred one `requestAnimationFrame` so React Router's `<Meta />` head update completes before the title is read.

Skips the initial mount so users do not hear an announcement when they first load the page. Only fires on subsequent `pathname` changes via `useLocation`.

No props. Internal to `Layout.tsx`. Do not extract or reuse elsewhere.

---

### `NavLink`

`src/components/NavLink.tsx`

A thin wrapper around React Router's `NavLink` that normalises the `className` API. React Router's `NavLink` passes a function to `className`; this wrapper accepts plain strings for `className`, `activeClassName`, and `pendingClassName` and merges them via `cn`.

```tsx
<NavLink to="/about" className="base-class" activeClassName="active-class">
  About
</NavLink>
```

| Prop | Type | Description |
| --- | --- | --- |
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
  description="Vendor-Neutral. Open Source. Community-Driven."
  primaryCta={{ label: <>Start <ArrowDown size={14} aria-hidden="true" /></>, href: "#section" }}
  secondaryCta={{ label: "Learn more", href: "/handbook" }}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `eyebrow` | `string?` | Small overline label above the title |
| `title` | `string` | Page `<h1>` text |
| `description` | `string` | Supporting paragraph |
| `primaryCta` | `Cta?` | Primary button (`.btn-inverse`) |
| `secondaryCta` | `Cta?` | Secondary button (`.btn-ghost-inverse`) |

`Cta` shape: `{ label: ReactNode; href: string; external?: boolean }`. External CTAs get `target="_blank"` with the sr-only new-tab span. Anchors (`#`) and `mailto:` links render as `<a>`; all others render as React Router `<Link>`.

**Important:** Buttons inside `PageHero` must use `.btn-inverse` / `.btn-ghost-inverse`. Never use `.btn-primary` or `.btn-ghost` inside `bg-primary` sections. They produce yellow-on-yellow in light mode.

---

### `LevelCard`

`src/components/LevelCard.tsx`

Renders a single adventure level as a card: difficulty badge, level name, key learnings list, and links to open in GitHub Codespaces and view the discussion.

```tsx
<LevelCard level={level} headingLevel="h2" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `AdventureLevel` | required | Level data from `src/data/adventures` |
| `headingLevel` | `"h2" \| "none"` | `"h2"` | Pass `"none"` when the parent page already renders the level name as `<h1>` to avoid duplicate heading in the document outline. When `"none"`, the level name renders as a `<p>`. The "Key Learnings" label always renders as a `<p>` regardless of this prop. It is a decorative sub-label, not a structural heading. |

---

### `FilteredLevelCard`

`src/components/FilteredLevelCard.tsx`

Navigation card used in tag-filtered level grids. The entire card is a `<Link>` to the challenge detail page. Renders a difficulty badge, level name, first three learnings, and a footer row with "Challenge" label, an optional estimated time pill (`Clock` icon + `level.estimatedTime`), and the parent adventure title.

**Accessible name:** the link carries `aria-label` in the format `"{level.name}: {difficulty}, {adventureTitle}"` (e.g. `"The Observability Challenge: Beginner, Blind by Design"`). This replaces the verbose computed name that would otherwise include all three learning bullet points.

```tsx
<FilteredLevelCard
  level={level}
  adventureId={adventureId}
  adventureTitle={adventureTitle}
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `AdventureLevelSummary` | required | Level data. Accepts both `AdventureLevelSummary` (from `summaries.ts`) and full `AdventureLevel` (from `index.ts`), since the summary is a structural subset |
| `adventureId` | `string` | required | Used to build the link href: `/adventures/:id/levels/:levelId` |
| `adventureTitle` | `string` | required | Shown in the card footer as a tag label |
| `isLive` | `boolean?` | (none) | When true, renders a `LivePill` in the card header alongside the difficulty badge. Pass from the `isLive` field on `RelatedLevelSummary`. |
| `className` | `string?` | (none) | Merged onto the root `<Link>` via `cn()`. Pass `"animate-fade-up-delay-1"` when the card is in a staggered grid. |

Distinct from `LevelCard`: `FilteredLevelCard` is a router link used in listing/filter contexts; `LevelCard` is a static card used on detail pages and includes the GitHub Codespaces CTA.

---

### `StarterNudge`

`src/components/StarterNudge.tsx`

First-visit wayfinding banner that points new users to the latest live adventure's Beginner level. Renders a solid amber (`bg-primary`) strip with dark text and a dismiss button. Dismissed state persists in `localStorage` under the key `starter_nudge_dismissed`. Once dismissed, the nudge never reappears. Hidden server-side (hydration-safe).

```tsx
<StarterNudge />
```

No props. Derives the target adventure from `ADVENTURE_SUMMARIES` (first entry with `isLive: true` that has a Beginner level). Renders `null` when no qualifying adventure exists, when the nudge has been dismissed, or on the server.

Used in `ChallengesGrid` (above the filter) and `Challenges` (above the filter). The same `localStorage` key is shared, so dismissing on one page dismisses on both.

---

### `ChallengeFilters`

`src/components/ChallengeFilters.tsx`

Two-row filter UI for the adventure catalog. Row 1 is a difficulty single-select; row 2 is a multi-select technology tag filter. Adapts to screen size: below `lg`, each row collapses to a dropdown (trigger button + popover); at `lg+`, the full pill rows are shown side by side.

```tsx
<ChallengeFilters
  activeTopics={activeTopics}
  activeDifficulty={activeDifficulty}
  tags={SUMMARY_TAGS}
  onDifficultyChange={handleDifficultyChange}
  onTopicsChange={handleTopicsChange}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `activeTopics` | `string[]` | Currently selected technology tags (multi-select). Empty = no tag filter. |
| `activeDifficulty` | `string \| null` | Currently selected difficulty. `null` = all levels. |
| `tags` | `string[]` | Full list of technology tags to render. Pass `SUMMARY_TAGS` from `@/data/adventures/summaries`. |
| `onDifficultyChange` | `(diff: Difficulty \| null) => void` | Called when difficulty changes. |
| `onTopicsChange` | `(topics: string[]) => void` | Called when tag selection changes. |

**ARIA pattern:** all filter groups (mobile dropdowns and desktop pill rows) use `role="group"` with `aria-pressed` on each button. Mobile dropdowns are always in the DOM — the panel uses the HTML `hidden` attribute when closed so `aria-controls` on the trigger always resolves to a valid IDREF. Trigger buttons use `aria-expanded` and `aria-controls` to signal disclosure state; `aria-haspopup` is intentionally omitted because none of the valid ARIA values (`menu`, `listbox`, `tree`, `grid`, `dialog`) accurately describe a `role="group"` panel, and using an incorrect value misleads screen readers about expected interaction semantics. Arrow-key navigation (Up/Down) is supported within each open panel via `onKeyDown` handlers on the panel buttons.

**Exported type:** `Difficulty = "Beginner" | "Intermediate" | "Expert"`. Import from `@/components/ChallengeFilters` where `activeDifficulty` state needs typing.

---

### `ChallengeHighlights`

`src/components/ChallengeHighlights.tsx`

A slim 3-column feature strip placed directly after `ChallengesGrid`, separated by a top border. Answers "why are these challenges worth doing" without a full card section. Each item is an icon + bold title + one-line description, no card borders.

| Item | Icon | Size |
| --- | --- | --- |
| Learn by Doing | `BookOpen` | `size={22}` |
| Build Real Skills | `TrendingUp` | `size={22}` |
| Open Source | `Shield` | `size={22}` |

Icons use `size={22}` (not the `size={28}` convention for full card sections) because this component is a slim strip, not a bordered card layout.

No props. Used only in `Index.tsx`.

---

### `CommunityLeaders`

`src/components/CommunityLeaders.tsx`

Sidebar card displaying community leaders fetched daily from Discourse Data Explorer queries. Renders a `<div>` card with an `<h3>` "Community Leaders" heading (sidebar context is subordinate to main-content `h2` sections) and a ranked list per category. Each category title is rendered as `<h4>` by `LeaderCategory`. Each category uses a lucide-react icon and an `<ol aria-label="{section.title}">` of user rows (rank, avatar, username, count). Avatars are lazy-loaded from external Discourse CDN URLs.

Data source: `src/data/community-leaders.json` (refreshed daily by `.github/workflows/refresh-community-leaders.yml`).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sections` | `string[]` | all | Filter to show only specific section IDs, in the order given |
| `limit` | `number` | all | Cap the number of users shown per section. Used on `Index.tsx` (homepage) with `limit={3}` |

Section IDs: `top-contributors`, `challenge-rockstars`, `challenge-grand-builders`, `top-challenge-solvers`, `challenge-builders`, `most-liked`, `most-replies`, `most-supportive`.

| Section | Icon |
| --- | --- |
| Top Contributors | `Trophy` |
| Challenge Rockstars | `Star` |
| Challenge Grand Builders | `Building2` |
| Top Challenge Solvers | `Target` |
| Challenge Builders | `Wrench` |
| Most Liked | `Heart` |
| Most Replies | `MessageCircle` |
| Most Supportive | `HandHeart` |

Used in: `Index.tsx` (via CommunitySection aside, limit=3), `Adventures.tsx` (via ChallengeBuildersSection aside, builder-first order), `Challenges.tsx` (via ChallengeBuildersSection aside, solver-first order), `CommunityGuide.tsx` (standalone sidebar, all sections), `About.tsx` (via SidebarLayout aside), `Contribute.tsx` (via SidebarLayout aside).

---

### `CommunitySection`

`src/components/CommunitySection.tsx`

Merged replacement for the former `CommunityVoicesSection` and `ConnectSection`. Renders a 4-card 2-column grid covering all community participation paths: share, ask, introduce, and attend. Section label: "community", h2: "Get Involved".

| Card | Icon | Destination |
| --- | --- | --- |
| Community Voices | `Megaphone` | `COMMUNITY_URL/c/community-voices/38` |
| Q&A | `CircleHelp` | `COMMUNITY_URL/c/general/q-a/10` |
| Introduce Yourself | `UserPlus` | `COMMUNITY_URL/c/general/introductions/18` |
| Events & Meetups | `CalendarDays` | `COMMUNITY_URL/c/events-and-talks/12` |

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `aside` | `ReactNode` | (none) | Optional sidebar content rendered in a sticky column at lg breakpoint |

Used in `Index.tsx`.

---

### `SponsorStrip`

`src/components/SponsorStrip.tsx`

A slim horizontal strip (separated by a top border, `py-12`) with sponsor copy on the left and a "Become a Sponsor" `<Link>` to `/sponsors` on the right. Not a full section. No section label or heading. Sits between `CommunitySection` and `BottomCTA`.

No props.

---

### `SectionLabel`

`src/components/SectionLabel.tsx`

Uppercased eyebrow label rendered above section h2s. Wraps a `<span className="section-label ...">` in a `<div className="mb-3">`. Source text stays lowercase because the `section-label` CSS class applies `text-transform: uppercase`. Used in `AboutSection`, `BoardSection`, `BrandStory`, `CommunitySection`, `ChallengesGrid`, `CommunityGuide`, and `NotFound`. Replaces the previously duplicated div+span pattern.

```tsx
<SectionLabel>our foundation</SectionLabel>
```

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | Label text (write lowercase). |

---

### `BulletList`

`src/components/BulletList.tsx`

Renders a vertical list with one of three marker styles (`dot`, `check`, `x`) and two spacing densities (`tight`, `loose`). Items can be plain strings or `{ lead, desc }` objects. When an item is an object, the `lead` string is rendered as a bold, foreground-colored phrase followed by the `desc` body. Plain string items render as-is.

`marker="dot"` (default) renders a small amber dot. `marker="check"` and `marker="x"` render lucide `Check`/`X` icons in `text-foreground` (light-mode contrast safe; `text-primary` amber would fail WCAG 1.4.11). `spacing="tight"` (default) is the dense AboutSection layout; `spacing="loose"` matches the airier list rhythm used on `Sponsors`.

```tsx
<BulletList
  marker="check"
  spacing="loose"
  items={[
    "A simple bullet",
    { lead: "Bold lead.", desc: "Followed by descriptive body text." },
  ]}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `(string \| { lead: string; desc: string })[]` | One entry per bullet. |
| `marker` | `"dot" \| "check" \| "x"` (default `"dot"`) | Bullet marker style. |
| `spacing` | `"tight" \| "loose"` (default `"tight"`) | List density. |

---

### `AboutSection`

`src/components/AboutSection.tsx`

Renders the About page content: Our Mission, Our Vision, Who It's For, and What We Stand For. Section is wrapped with the "our foundation" eyebrow at the top (using the standard `section-label` overline pattern) and carries `id="approach"`. Each of the four h2s also has its own id (`mission`, `vision`, `audience`, `values`) for deep-linking. The opening Mission paragraph is rendered as a `text-lg text-foreground` lead so the page has a clear thesis statement; subsequent paragraphs use `text-dim`. Mission and Vision render as flowing paragraphs; Who It's For and What We Stand For use `BulletList` (the latter with `{ lead, desc }` items so each bullet leads with a bold headline phrase).

No props. Self-contained section component.

---

### `BoardSection`

`src/components/BoardSection.tsx`

Renders the Board section on the About page (mounted after `BrandStory`, with `ChallengeBuildersSection` immediately following it). Carries the "the people" eyebrow above its h2. That overline label visually groups Board and the subsequent `ChallengeBuildersSection` (which has no eyebrow of its own). Reads `BOARD_MEMBERS` from `src/data/team.ts` and renders a responsive card grid (`sm:grid-cols-2 lg:grid-cols-3`). Each card shows an 80px circular avatar, the member name rendered via `PersonNameLink`, and a short bio. Card markup mirrors the pattern in `ChallengeBuildersSection.tsx`. Members are listed alphabetically by first name; placeholder seats sit at the end with `// TODO` comments next to them in `team.ts`.

Avatars are 320px square WebP files in `src/assets/team/`, imported in `team.ts` and assigned to `BoardMember.image`. They render at 80×80 with `width`/`height` attributes set and `loading="lazy"` (the section is below the fold). Members without an `image` (placeholder seats) get a neutral circle with the lucide `User` icon as a visual filler. The icon is `aria-hidden="true"` because the name beneath it carries the meaning. To swap a placeholder for a real member, drop a 320px square WebP into `src/assets/team/`, import it in `team.ts`, and set the `image` field.

`KATHARINA_SICK` is exported from `src/data/adventures/contributors.ts` (re-exported via the barrel `src/data/adventures/index.ts`) and reused in `team.ts` so her bio has a single source of truth.

No props. Self-contained section component.

---

### `ChallengeBuildersSection`

`src/components/ChallengeBuildersSection.tsx`

Renders the Challenge Builders section, used on both the About page (mounted directly after `BoardSection`, sharing the "the people" eyebrow group) and the Adventures page (mounted between `ChallengesGrid` and `BottomCTA`). Has no eyebrow of its own; on the About page, the visual grouping is provided by the eyebrow on the preceding `BoardSection`. Reads `ADVENTURE_CONTRIBUTORS` from `src/data/adventures` and renders a card grid (`sm:grid-cols-2`) thanking everyone who has contributed an adventure. Each card shows the contributor name rendered via `PersonNameLink`, a short bio, and a list of their adventures linked via React Router `<Link>` to each detail page. Returns `null` if `ADVENTURE_CONTRIBUTORS` is empty.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `aside` | `ReactNode` | (none) | Optional sidebar content rendered in a sticky column at lg breakpoint |

Used in `Adventures.tsx` and `About.tsx`.

---

### `PersonNameLink`

`src/components/PersonNameLink.tsx`

Renders a person's name with consistent styling, used for board members and adventure contributors. When `url` is provided, renders an external `<a>` with the lucide `ExternalLink` icon and a `sr-only` "(opens in new tab)" announcement; when omitted, renders a plain `<span>` with the same font weight. Shared by `BoardSection` and `ChallengeBuildersSection` so the className string and external-link affordances stay in sync.

```tsx
<PersonNameLink name="Jane Doe" url="https://example.com" />
```

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Person's display name. |
| `url` | `string` (optional) | When set, renders the name as an external link with new-tab affordance. |

---

### `BrandStory`

`src/components/BrandStory.tsx`

Renders the "The Story Behind the Firefly" section on the About page (mounted between `AboutSection` and `BoardSection`). Carries the "our story" eyebrow above its h2. Three short paragraphs covering: the rebrand process and the question the team kept returning to; how the firefly mascot (Nyx) came to life; and what Nyx represents for the community. Uses `text-dim leading-relaxed` body text within `max-w-3xl` to match the prose blocks in `AboutSection`.

Section uses `pb-16` only (no top padding), since `AboutSection` above it already terminates with its own `py-16`. The `id="story"` anchor is reserved for future in-page navigation.

No props. Self-contained section component.

---

### `DiscussionSection`

`src/components/DiscussionSection.tsx`

Displays up to three community posts for an adventure level, fetched at build time from Discourse. Post content (`cooked`) is plain text. HTML is stripped by the refresh script before the JSON is written, so no runtime processing is needed. Post ages are computed on the client after mount to avoid calling `Date.now()` at render time.

```tsx
<DiscussionSection adventureId={adventure.id} levelId={level.id} discussionUrl={level.discussionUrl} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `adventureId` | `string` | Adventure slug used to locate the per-level JSON file. |
| `levelId` | `string` | Level slug used to locate the per-level JSON file. |
| `discussionUrl` | `string` | Full Discourse topic URL. Used as the fallback link when no posts are loaded. |

The component is a pure renderer. All data-loading logic lives in `useDiscussionPosts` (see Hooks section). Falls back to an empty state with a "Join the discussion" link when no posts are found.

Contains a `<span role="status" aria-live="polite" aria-atomic="true">` (sr-only) that announces the loaded post count to screen readers. Content rendering is gated on the `loaded` flag from `useDiscussionPosts` to prevent a flash of the empty state before data arrives.

---

### `CommunitySidebar`

`src/components/CommunitySidebar.tsx`

Sidebar panel for the structured challenge detail layout. Shows the challenge builder (contributor badge), a completion stat, a leaderboard of top solvers (derived from certificate posts), latest activity feed (non-certificate posts preferred), and a "Share & Discuss" button linking to the discussion thread. Used inside `ChallengeDetail` structured layout only.

```tsx
<CommunitySidebar adventureId={adventure.id} levelId={level.id} discussionUrl={level.discussionUrl} contributor={adventure.contributor} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `adventureId` | `string` | Adventure slug for loading discussion data and leaderboard points lookup. |
| `levelId` | `string` | Level slug for loading discussion data. |
| `discussionUrl` | `string` | Full Discourse topic URL. Used for the "Join the discussion" link. |
| `contributor` | `Adventure["contributor"]?` | Optional contributor shown at the top of the panel. |

The leaderboard section renders the top 3 solvers (from certificate posts) via `LeaderboardList`, cross-referencing points from `useAdventureLeaderboard` by username.

---

### `AvatarLink`

`src/components/AvatarLink.tsx`

Renders a user avatar followed by a plain-text username. The avatar is either an `<img>` (when `avatarUrl` is provided) or an initials fallback `<span>` (both `aria-hidden`). The username is rendered as a `<span>`, not a link. Used by `LeaderboardList` and `CommunityLeaders`.

```tsx
<AvatarLink
  username="alice"
  avatarUrl="https://example.com/alice.png"
  size={24}
  className="inline-flex items-center gap-1 font-medium text-foreground"
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `username` | `string` | required | Discourse username. Used as display text and for the initials fallback. |
| `avatarUrl` | `string` (optional) | (none) | Avatar image URL. Falls back to initials when omitted. |
| `size` | `24 \| 28` | `24` | Avatar diameter in pixels. |
| `avatarFallbackStyle` | `CSSProperties` (optional) | (none) | Inline style for the initials `<span>`. Use palette colors from `CommunitySidebar`. |
| `className` | `string` | required | Class applied to the username `<span>` element. Caller controls layout and typography. |

The avatar image and initials span are both `aria-hidden="true"`.

---

### `LeaderboardList`

`src/components/LeaderboardList.tsx`

Shared primitive for rendering a ranked list of players with avatar, username, and optional points. Used by both `AdventureLeaderboard` (adventure page sidebar) and `CommunitySidebar` (challenge detail sidebar). Ranks are plain numbers, no medal icons.

```tsx
<LeaderboardList rows={rows} label="Adventure leaderboard" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `LeaderboardEntry[]` | required | Ranked entries to render. |
| `label` | `string` | `"Ranked players"` | Accessible `aria-label` for the `<ol>`. |

`LeaderboardEntry` shape: `rank`, `username`, `avatarUrl?`, `points?`, `avatarFallbackStyle?` (inline style for the avatar initials fallback, used by `CommunitySidebar` for palette colors).

---

### `SidebarLayout`

`src/components/SidebarLayout.tsx`

Layout primitive that renders a two-column grid (`1fr 300px`) on `lg+` when `aside` is provided, with the aside column sticky at `top-24`. Falls back to rendering `children` alone when `aside` is omitted. Used by `CommunitySection`, `ChallengeBuildersSection`, and `CommunityGuide` so the sticky-sidebar pattern is defined in one place.

```tsx
<SidebarLayout aside={<CommunityLeaders />}>
  {/* main content */}
</SidebarLayout>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | required | Main content (left column). |
| `aside` | `ReactNode` (optional) | (none) | Sidebar content (right column, sticky). When omitted, children render without a grid wrapper. |

---

### `AdventureLeaderboard`

`src/components/AdventureLeaderboard.tsx`

Sidebar card for the adventure detail page. Loads ranked player data via `useAdventureLeaderboard` and renders it via `LeaderboardList`. Returns `null` when no leaderboard data exists for the adventure, so the sidebar is fully absent until data is available.

```tsx
<AdventureLeaderboard adventureId={adventure.id} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `adventureId` | `string` | Adventure slug. Passed directly to `useAdventureLeaderboard`. |

---

### `RewardsCard`

`src/components/RewardsCard.tsx`

Displays the rewards for an adventure (trophy tiers, eligibility text, deadline, and an optional ranking rules link). Rendered only when `adventure.rewards` is defined. Supports two modes: full (used on `AdventureDetail`) and compact (used in the `ChallengeDetail` sidebar, where the adventure-level deadline is replaced by the per-level `deadline` field).

```tsx
{/* Full mode: AdventureDetail */}
<RewardsCard rewards={adventure.rewards} />

{/* Compact mode: ChallengeDetail sidebar */}
<RewardsCard rewards={adventure.rewards} compact levelDeadline={level.deadline} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rewards` | `AdventureRewards` | required | Reward tiers, eligibility, deadline, and optional ranking rules. |
| `compact` | `boolean` | `false` | Hides eligibility text and ranking note; shows per-level deadline instead of adventure-wide deadline. |
| `levelDeadline` | `string \| undefined` | (none) | Per-level deadline string shown only in compact mode. |

Deadline is always stored as a plain date-and-time string (e.g. `"26 May 2026 at 23:59 CET"`), never as a days-remaining calculation.

---

### `LivePill`

`src/components/LivePill.tsx`

Small amber pill with an animated ping dot indicating that an adventure currently has an active rewards window. Rendered in `AdventureCard`, `FilteredLevelCard`, and the `AdventureDetail` header. The `isLive` flag is computed at build time (via the generator for card views, via the loader for detail pages) so the pill never causes a hydration mismatch.

```tsx
<LivePill />
<LivePill className="my-extra-class" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string?` | (none) | Merged onto the root `<span>` via `cn()`. |

---

### `ContributorBadge`

`src/components/ContributorBadge.tsx`

Small pill identifying the adventure or challenge builder. Renders a `Hammer` icon, a configurable label, a separator, and the contributor name. When `url` is provided the pill is an `<a>` link to the contributor's profile; otherwise a plain `<span>`. The optional `glow` prop adds an amber box-shadow for emphasis (used on `ChallengeDetail` header only, not on `AdventureCard`).

```tsx
<ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} label="Adventure Builder" />
<ContributorBadge name={level.contributor.name} glow />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | required | Contributor display name. |
| `url` | `string \| undefined` | (none) | External profile URL. Omit to render as a non-interactive pill. |
| `glow` | `boolean` | `false` | Adds `contributor-pill-glow` amber box-shadow. Use on `ChallengeDetail` only. |
| `label` | `string` | `"Challenge Builder"` | Text label before the name separator. |

CSS classes: `contributor-pill` (scopes light mode overrides), `contributor-pill-glow` (static amber glow, sized for a small pill).

---

### `OtherLevelsCard`

`src/components/OtherLevelsCard.tsx`

Sidebar card listing sibling levels in the same adventure (excluding the current one) plus any upcoming levels. Each active level is a `<Link>` pill styled with the difficulty color palette. Upcoming levels render as inert `<span>` pills with an opacity fade and a "Soon" label. Returns `null` if there are no other levels or upcoming levels.

```tsx
<OtherLevelsCard adventure={adventure} currentLevelId={level.id} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `adventure` | `Adventure` | Full adventure object (provides `levels` and `upcomingLevels`). |
| `currentLevelId` | `string` | ID of the current level to exclude from the list. |

---

### `CollapsibleSection`

`src/components/CollapsibleSection.tsx`

A native `<details>/<summary>` wrapper with consistent card styling, chevron animation, and focus ring. Used by `ScenarioSection`, `ArchitectureSection`, and `WalkthroughSection` as their outer shell.

```tsx
<CollapsibleSection id="backstory" title="The Story">
  <p>Content here</p>
</CollapsibleSection>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | required | Sets the `id` attribute on the `<details>` element for anchor linking. |
| `title` | `string` | required | Text shown in the `<summary>` as a heading. |
| `children` | `ReactNode` | required | Content revealed when open. |
| `defaultOpen` | `boolean?` | `true` | Whether the section starts expanded. |
| `headingLevel` | `2 \| 3 \| 4` | `2` | The `aria-level` for the heading inside `<summary>`. Match the surrounding heading hierarchy. |

---

### `ScenarioSection`

`src/components/ScenarioSection.tsx`

Renders the narrative backstory for a challenge level inside a `CollapsibleSection` titled "The Story". Each paragraph renders as a `<p>` with secondary text styling.

```tsx
<ScenarioSection backstory={level.backstory} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `backstory` | `string[]` | Array of narrative paragraphs. |

---

### `ArchitectureSection`

`src/components/ArchitectureSection.tsx`

Renders architecture content inside a `CollapsibleSection` titled "Architecture". Diagram and text are independent: a diagram (SVG preferred over ASCII) and markdown text are each shown when present and can appear together. At least one prop should be provided; rendering none produces an empty collapsible.

```tsx
{/* SVG + text: both render */}
<ArchitectureSection diagram={diagramUrl} diagramAlt="Spring Boot OpenFeature architecture" architecture={level.architecture.join("\n\n")} />
{/* ASCII only: rendered when no SVG is available */}
<ArchitectureSection ascii="┌──────┐\n│ App  │\n└──────┘" />
{/* Text only, no diagram */}
<ArchitectureSection architecture={level.architecture.join("\n\n")} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `diagram` | `string` (optional) | URL of an architecture diagram image (SVG or raster). Takes precedence over `ascii` when both are present. |
| `diagramAlt` | `string` (optional) | Alt text for the diagram image. Defaults to `"Architecture diagram"` when omitted. |
| `ascii` | `string` (optional) | Inline ASCII art rendered as a `<pre>` block. Shown only when `diagram` is absent. |
| `architecture` | `string` (optional) | Markdown string describing the system architecture. Rendered below the diagram (or alone when no diagram is present). |

---

### `WalkthroughSection`

`src/components/WalkthroughSection.tsx`

Renders a numbered walkthrough as a vertical stepper inside a `CollapsibleSection` titled "Walkthrough". Each step shows a numbered circle, an optional title, and markdown body content.

```tsx
<WalkthroughSection steps={level.howToPlay} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `WalkthroughStep[]` | Array of `{ title: string; content: string }`. Both fields contain pre-rendered HTML generated at build time. `content` is rendered via `MarkdownContent`; `title` is rendered inline with links stripped (it sits inside a `<button>`). |

---

### `CodeBlock`

`src/components/CodeBlock.tsx`

Renders a single fenced code block with a header bar (language/title label left, copy button right) and a code body. Used on solution pages wherever structured code blocks are needed.

```tsx
<CodeBlock language="bash" title="Install deps" code="npm install" />
```

| Prop | Type | Description |
| --- | --- | --- |
| `language` | `string` | Language identifier shown in the header label (e.g. `"bash"`, `"yaml"`). |
| `title` | `string?` | Optional filename or custom label. Shown instead of `language` when provided. |
| `code` | `string` | Raw code string (not HTML). |

The header bar uses `.code-block-header` (CSS class) and the label uses `.code-lang-label`. The copy button uses `.code-header-btn`. The copy button border tints amber on hover/focus — no opacity tricks.

Used by `SolutionDetail`.

---

### `MarkdownContent`

`src/components/MarkdownContent.tsx`

Renders pre-compiled block HTML (generated at build time by `scripts/generate-adventures.mjs`) inside a `div.md-content` container. A `useEffect` wraps every `<pre>` element in the same header-bar structure used by `CodeBlock` — language label on the left (extracted from the `language-*` class on the `<code>` element), copy button on the right.

- Fenced code blocks get an always-visible "Copy" button in a header bar (clipboard API, flips to "Copied" for 1.5 s, with proper `aria-label` updates). Same `.code-block-header`, `.code-lang-label`, and `.code-header-btn` CSS classes as `CodeBlock`.
- All element styles (headings, lists, code, blockquote, tables, links) are driven by `.md-content` rules in `src/index.css`.
- External links get `target="_blank"`, `rel="noopener noreferrer"`, and a `<span class="sr-only"> (opens in new tab)</span>` injected by the generator. The external link icon is rendered purely via a CSS `::after` rule on `[target="_blank"]` in `src/index.css` — no inline SVG in the HTML.

```tsx
<MarkdownContent source={htmlString} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `source` | `string` | Pre-rendered HTML string. Never pass raw Markdown; convert it in the generator first. |

Used by `WalkthroughSection` (step content) and `ArchitectureSection`. Both fields come from the generated adventure data files and already contain sanitised HTML.

**Inline HTML** (short prose inside `<p>`, `<span>`, `<li>`) uses `dangerouslySetInnerHTML={{ __html: value }}` with the `md-inline` CSS class directly on the host element, not `<MarkdownContent>`. See the CSS patterns section below and the `CLAUDE.md` "Author-controlled prose fields" rule.

---

### `ChallengesGrid`

`src/components/ChallengesGrid.tsx`

Renders the full adventure listing with two-dimensional filtering. Used on the home page (`Index.tsx`) and the dedicated adventures listing page (`Adventures.tsx`).

```tsx
<ChallengesGrid />
<ChallengesGrid limit={6} />
```

**Props:**

| prop | type | description |
| --- | --- | --- |
| `limit` | `number?` | Optional. Caps how many adventure cards render in the default (All) view. When the total exceeds `limit`, a "See all adventures" link to `/challenges` appears below the grid. Omit to show every adventure. Used on `Index.tsx` (home page) with `limit={6}`; not used on `Adventures.tsx`. Does not affect the filtered level card view. |

Adventure cards render newest first, ordered by the `month` field on each adventure. Delegates filter UI to `ChallengeFilters`. Owns `activeTopics: string[]` and `activeDifficulty: string | null` state internally.

**Two display modes:**

- **No filters active (default):** renders one `AdventureCard` per adventure. Each card links to `/adventures/:id`.
- **Any filter active:** replaces adventure cards with a grid of `FilteredLevelCard` instances matching all selected tags (AND) and/or the selected difficulty. Wrapped in `aria-live="polite"` so screen readers announce updates.

Filter logic lives in `src/data/adventures/filter-utils.ts` (`getLevelSummariesByFilters`). No URL changes occur on selection.

---

### `ChallengeShareLinks`

`src/components/ChallengeShareLinks.tsx`

Renders a row of icon-only share links (LinkedIn, X, Bluesky, Mastodon) for a challenge level. Shown below the main content area on `ChallengeDetail`. Uses the `.social-icon-link` CSS class.

```tsx
<ChallengeShareLinks url={levelUrl} levelName={level.name} />
```

**Props:**

| prop | type | description |
| --- | --- | --- |
| `url` | `string` | Canonical URL of the level page. |
| `levelName` | `string` | Display name used in the pre-composed share text. |

Each platform link opens in a new tab with `rel="noopener noreferrer"`. All `<svg>` icons carry `aria-hidden="true"`; each `<a>` carries an explicit `aria-label` for screen readers.

---

### `Hero`

`src/components/Hero.tsx`

Home page full-viewport hero section. No props. Renders `BRAND_SECONDARY_LINE_PARTS` as an animated `<h1>` (`id="hero-heading"`) with two `<span>` lines, a brand slogan pill above it, and two CTAs below. Eight `.firefly` particle `<span>` elements are generated with `useMemo` so they do not re-create on re-render. The section carries `aria-labelledby="hero-heading"`. Buttons use `.btn-primary` and `.btn-ghost` because the hero sits on the default page background, not on a `bg-primary` section.

---

### `BottomCTA`

`src/components/BottomCTA.tsx`

Full-width `bg-primary` amber section at the bottom of the home page. No props. Contains a four-line `<h2>` ("Start Curious. Break Things."), two paragraphs of brand copy, and two CTAs. At `lg+`, a Nyx mascot image renders as a third column and is hidden at smaller breakpoints. Buttons must use `.btn-inverse` and `.btn-ghost-inverse` because the section background is amber. Never use `.btn-primary` or `.btn-ghost` here.

---

### `Navbar`

`src/components/Navbar.tsx`

Site-wide sticky navigation bar. No props. Contains: logo `<Link>` (`logo-link` class), desktop nav links via the internal `NavLinks` component, a theme toggle via `NavThemeToggle`, and a mobile hamburger drawer. The mobile menu (`id="mobile-menu"`) is always in the DOM and uses the HTML `hidden` attribute so `aria-controls` on the trigger always resolves to a valid element. Escape key close is delegated to `useEscapeKey`; Tab focus trapping to `useFocusTrap`; one `useEffect` handles background-content isolation while the drawer is open.

**Mobile menu close behaviour:** `closeMenu(restoreFocus = true)` accepts an optional parameter. Escape close calls `closeMenu()` (default `true`) — focus returns to the hamburger button, as required by WAI-ARIA APG Disclosure Navigation. Navigation link clicks call `closeMenu(false)` — focus is left for the router/page to manage on the new route, since the trigger is no longer the meaningful focus destination after navigation. Never pass `restoreFocus: true` from an `onNavigate` handler or the hamburger will steal focus from the incoming page.

**Background-content isolation:** When the drawer opens, every direct child of `<body>` except the `<nav>` receives `inert` and `aria-hidden="true"`. This covers all landmarks, overlays, and the consent banner — not just `#main-content` and `footer`. The effect walks from `menuRef.current` up to its nearest body-child ancestor to find the element to exclude, so it works correctly in both production and test environments. `aria-hidden` is kept alongside `inert` for older JAWS/VoiceOver versions that do not yet fully honour the `inert` attribute.

---

### `Footer`

`src/components/Footer.tsx`

Site-wide footer. No props. Contains two `<nav>` landmark regions (`aria-label="Explore"` and `aria-label="Community"`), a brand identity column, and a bottom strip with copyright text, the three-part slogan, and social icon links (LinkedIn, Bluesky, X). The logo `src` switches between `logoDark` and `logoLight` based on the active theme. Social icons use inline SVG brand marks (see Brand/social icon exceptions in the Icons section).

---

### `AdventureCard`

`src/components/AdventureCard.tsx`

Navigation card linking to an adventure overview page. The entire card is a `<Link>` to `/adventures/:id/`. Renders a header row with an "Adventure" mono label, an optional `LivePill`, and a `.badge-levels` level-count pill; the adventure title (hover: amber); a two-line `story` snippet; a row of `DifficultyBadge` instances; up to four technology tag `<span>` chips; and an optional `ContributorBadge` pinned to the card footer via `mt-auto`. Card border is `border-primary/50` when `adventure.isLive`, otherwise `border-border`. Uses `card-glow` for hover glow.

**Accessible name:** the link carries `aria-label` in the format `"{title}: {difficulties}, {tags}"` (e.g. `"Blind by Design: Beginner, Intermediate, Expert, Prometheus, Grafana"`). Tags are omitted if the adventure has none. This gives screen reader users difficulty and technology context when navigating by links, without the verbosity of the full card content.

```tsx
<AdventureCard adventure={adventureSummary} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `adventure` | `AdventureCardSummary` | Summary data from `ADVENTURE_SUMMARIES`. Includes `id`, `title`, `story`, `tags`, `levels`, `contributor`, and `isLive`. |

Distinct from `FilteredLevelCard`: `AdventureCard` links to the adventure overview; `FilteredLevelCard` links to an individual level.

---

### `AdventureIcon`

`src/components/AdventureIcon.tsx`

Renders the Lucide icon associated with an adventure by its string name. Returns `null` if `icon` is undefined or not registered in the component's `ICONS` map.

```tsx
<AdventureIcon icon={adventure.icon} size={16} className="shrink-0 text-muted-foreground" />
<AdventureIcon icon={adventure.icon} size={28} className="text-primary shrink-0" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string?` | — | Lucide icon name (e.g. `"Compass"`, `"Building2"`). Must match a key in the internal `ICONS` registry. |
| `size` | `number?` | `16` | Pixel size passed to the Lucide icon component. |
| `className` | `string?` | — | CSS class applied to the rendered icon element. |

`aria-hidden="true"` is applied automatically — the icon is purely decorative.

**Adding a new icon (two-step process):**

1. Add the emoji-to-name mapping in `scripts/generate-adventures.mjs` `EMOJI_ICON_MAP`.
2. Add the import and registry entry in `src/components/AdventureIcon.tsx` `ICONS`.

Both steps must be done together. A missing entry in either file causes the icon to silently not render — there is no type error or build warning.

---

### `DifficultyBadge`

`src/components/DifficultyBadge.tsx`

Renders a difficulty level as a styled pill using the shadcn `Badge` primitive. Colors are applied via inline `style` referencing CSS tokens (`--difficulty-starter-bg`, `--difficulty-builder-bg`, `--difficulty-architect-bg`). The `data-difficulty` attribute on the root element is used for CSS targeting and for Playwright selectors in accessibility tests.

```tsx
<DifficultyBadge difficulty="Beginner" />
<DifficultyBadge difficulty="Expert" showDot />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `difficulty` | `"Beginner" \| "Intermediate" \| "Expert"` | required | Determines token set and badge label. |
| `showDot` | `boolean` | `false` | When true, renders a small filled circle in the badge's text color before the label. Used by `LevelCard` to add a visual status indicator. |

Never hardcode HSL values in this component. Use `hsl(var(--difficulty-*))` references only. See the Difficulty Badges section of Colors for the full token list.

---

### `CodespacesButton`

`src/components/CodespacesButton.tsx`

"Open in Codespaces" CTA. Renders a `.btn-primary` `<a>` that opens a GitHub Codespaces URL in a new tab, followed by a "Free GitHub account required" helper note in mono text.

```tsx
<CodespacesButton href={level.codespacesUrl} />
<CodespacesButton href={level.codespacesUrl} fullWidth />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | required | GitHub Codespaces launch URL. |
| `fullWidth` | `boolean` | `false` | When true, applies `w-full justify-center` to the button and centers the helper note. Used in mobile-oriented `LevelCard` layouts. |

---

### `TagChips`

`src/components/TagChips.tsx`

Renders a flat list of technology tag `<Link>` chips, each linking to `/challenges/:slug/`. Applies the `tag-chip-link` CSS class for light/dark mode contrast compliance (see CSS Class Patterns). No wrapper element; renders a fragment.

```tsx
<TagChips tags={level.topics} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `tags` | `readonly string[]` | Technology tag display names. URL slugs are derived at render time via `tagToSlug`. |

Used in `ChallengeDetail` and `AdventureDetail` to render the level's technology stack as navigable filter links.

---

### `NotFoundPage`

`src/components/NotFoundPage.tsx`

Reusable 404 page shell used by both `NotFound.tsx` (prerendered `/404` route) and `CatchAll.tsx` (client-side fallback). Renders `Navbar`, a centered `<main id="main-content">` with an `<h1>`, body message, and "Go to Homepage" link, and `Footer`.

```tsx
<NotFoundPage title="Page Not Found" message="The page you're looking for doesn't exist." />
```

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | `<h1>` text. |
| `message` | `string` | Body text below the heading. |

---

## Patterns

### Inline Challenge Card

Use `FilteredLevelCard` (see Components section). Do not inline the card markup. The component handles all classes, accessibility attributes, and structure.

```tsx
<FilteredLevelCard
  level={level}
  adventureId={adventureId}
  adventureTitle={adventureTitle}
  className="animate-fade-up-delay-1"  {/* optional; omit when no stagger needed */}
/>
```

Used in `ChallengesGrid` and `Challenges` (and wherever a tag-filtered level result grid is needed). Each card is a `<Link>` to `/adventures/:id/levels/:levelId`.

### Technology Filter Pattern

Used in `ChallengesGrid` (home/adventures pages) and `Challenges` (challenges/ page).

```ts
const [activeTopic, setActiveTopic] = useState<string | null>(null);
```

- An "All" pill appears first. It is active (`aria-pressed={activeTopic === null}`) when no tag is selected.
- Tag chips render with `.pill-active` when selected and `.pill-inactive` otherwise. Each sets `aria-pressed={activeTopic === tag}`.
- Clicking an already-active chip deselects it and returns to the default view.
- `ChallengesGrid`: no URL change on selection. Default (All) = adventure card grid. Tag = flat level card grid.
- `Challenges`: URL updates to `/challenges/:tag` when a tag is selected. Default (All) = adventure card grid (same as `ChallengesGrid`). Tag = filtered flat level card grid.

---

### `Breadcrumb`

`src/components/Breadcrumb.tsx`

Navigation trail component. Renders a `<nav aria-label="Breadcrumb">` with an ordered list of items. The last item carries `aria-current="page"` and is rendered as plain text; all preceding items render as React Router `<Link>` elements.

```tsx
<Breadcrumb
  items={[
    { label: "Adventures", href: "/adventures" },
    { label: adventure.title, href: `/adventures/${adventure.id}` },
    { label: level.name },
  ]}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `BreadcrumbItem[]` | Ordered list of crumbs; last item has no `href` |
| `className` | `string?` | Class applied to the wrapping `<nav>`; defaults to `"mb-5"` |

`BreadcrumbItem` shape: `{ label: string; href?: string }`. Items without `href` are rendered as `<span aria-current="page">`.

Used in `ChallengeDetail.tsx` (adventure level pages) and `AdventureDetail.tsx` (adventure overview pages). The visible breadcrumb mirrors the `BreadcrumbList` JSON-LD already present in those pages' `meta()` exports.

---

## Utilities

### `utils`

`src/lib/utils.ts`

General-purpose utility functions.

| Export | Signature | Description |
| --- | --- | --- |
| `cn` | `(...inputs: ClassValue[]) => string` | Merges Tailwind class names and resolves conflicts via `tailwind-merge`. Use everywhere class names are conditionally composed. |
| `isDeadlinePast` | `(deadline: string \| undefined) => boolean` | Returns `true` if the ISO 8601 deadline string represents a date in the past. Returns `false` for `undefined` or unparseable values. |
| `isSolutionUnlocked` | `(deadline: string \| undefined) => boolean` | Returns `true` when a solution is unlocked: no deadline set, or deadline has passed. Used in the `SolutionDetail` loader to gate access. |
| `formatDeadline` | `(iso: string) => string` | Formats an ISO 8601 deadline string for human display, preserving the stored UTC offset rather than converting to the viewer's local timezone. `+01:00` renders as CET, `+02:00` as CEST. Returns the original string unchanged if it does not match the expected format. |
| `resolveDiscussionUrl` | `(rawUrl: string \| null \| undefined, communityUrl: string) => string` | Resolves a raw `discussionUrl` field to an absolute URL. Full URLs pass through unchanged; relative paths are prepended with `communityUrl`; missing or empty values fall back to `communityUrl`. |

```ts
import { cn, isDeadlinePast, isSolutionUnlocked, formatDeadline, resolveDiscussionUrl } from "@/lib/utils";
```

---

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
| --- | --- | --- | --- |
| `title` | `string` | required | Page title and `og:title` / `twitter:title` |
| `description` | `string` | required | Meta description and `og:description` / `twitter:description` |
| `url` | `string` | required | Canonical URL and `og:url`. Normalized to end with `/` to match GitHub Pages' 301 redirects for directory routes. |
| `ogType` | `string?` | `"website"` | `og:type` value. Use `"article"` for adventure and challenge pages. |
| `extra` | `MetaDescriptor[]?` | `[]` | Additional tags appended after the standard set (e.g. `{ name: "robots", content: "noindex" }` for `Privacy`). |

Every page's `meta()` must use this function. Do not inline the og/twitter tag block manually.

---

### `tag-utils`

`src/data/adventures/tag-utils.ts`

Converts between tag display names (e.g. `"OpenTelemetry"`) and URL-safe slugs (e.g. `"opentelemetry"`). Built from `SUMMARY_TAGS` in `summaries.ts` so it does not import the full generated adventure detail files. Use this module (not `@/data/adventures`) in any component or page that only needs tag conversion.

| Export | Signature | Description |
| --- | --- | --- |
| `tagToSlug` | `(tag: string) => string` | Lowercases and replaces non-alphanumeric runs with `-`. Strips leading/trailing hyphens. |
| `slugToTag` | `(slug: string) => string \| undefined` | Reverse lookup from slug to original tag name. Returns `undefined` for unknown slugs. |

```ts
import { tagToSlug, slugToTag } from "@/data/adventures/tag-utils";
```

Do not import these from `@/data/adventures` in card or filter components. That import pulls all five generated adventure detail files into the bundle.

---

### `filter-utils`

`src/data/adventures/filter-utils.ts`

Filtering logic for the adventure catalog. Built from `ADVENTURE_SUMMARIES` so it does not import the full generated detail files.

| Export | Signature | Description |
| --- | --- | --- |
| `getLevelSummariesByFilters` | `(tags: string[], difficulty: string \| null) => RelatedLevelSummary[]` | Returns all level summaries matching any of the provided tags (OR logic) and/or the difficulty. Pass `[]` and `null` to get all levels. |
| `ALL_LEVEL_SUMMARIES` | `RelatedLevelSummary[]` | Pre-computed result of `getLevelSummariesByFilters([], null)`. Use this constant instead of calling the function with empty args. |
| `DIFFICULTIES` | `readonly ["Beginner", "Intermediate", "Expert"]` | Ordered difficulty array. Use for rendering difficulty filter options. |
| `Difficulty` | `type` | `"Beginner" \| "Intermediate" \| "Expert"`. Import from here rather than re-deriving the union. |

### `src/lib/difficulty`

Shared difficulty display utilities. Import from here instead of re-deriving the `Difficulty → CSS var suffix` mapping in each component.

| Export | Signature | Description |
| --- | --- | --- |
| `DIFFICULTY_VAR` | `Record<Difficulty, string>` | Maps `"Beginner" → "starter"`, `"Intermediate" → "builder"`, `"Expert" → "architect"`. Use to build `--difficulty-{suffix}-bg/border` CSS variable references. |
| `difficultyStyle` | `(difficulty: Difficulty) => CSSProperties` | Returns the base inline style object (`color`, `borderColor`, `backgroundColor`) for a difficulty. Used by `DifficultyBadge`, `OtherLevelsCard`, and `ChallengeFilters`. |

```ts
import { DIFFICULTY_VAR, difficultyStyle } from "@/lib/difficulty";
```

```ts
import { getLevelSummariesByFilters, DIFFICULTIES, type Difficulty } from "@/data/adventures/filter-utils";
```

Used by `ChallengesGrid` and `Challenges`. Do not call `getLevelSummariesByFilters` directly in components; use `ALL_LEVEL_SUMMARIES` for the unfiltered case.

---

### `discussion-utils`

`src/lib/discussion-utils.ts`

Helper functions for processing discussion posts in `DiscussionSection` and `CommunitySidebar`.

| Export | Signature | Description |
| --- | --- | --- |
| `isCertificatePost` | `(post: PostWithAge) => boolean` | Returns true when `post.challengeSolved === true`. The `challengeSolved` flag is set by the refresh script when it identifies a completion post. |
| `displaySnippet` | `(post: PostWithAge) => string` | Returns the display text for a post. For certificate posts, strips the `CERTIFICATE START … CERTIFICATE END` block from `cooked` and falls back to `"Completed the challenge."` if nothing else remains. |

---

### `avatar-utils`

`src/lib/avatar-utils.ts`

Generates the avatar fallback colour palette used by `DiscussionSection` and `CommunitySidebar`.

| Export | Signature | Description |
| --- | --- | --- |
| `makeAvatarPalette` | `(opacity: number) => CSSProperties[]` | Returns a five-entry array of `{ backgroundColor, color }` style objects. Each entry uses a design token from the `@theme` block with the provided opacity. The `color` is always `hsl(var(--foreground))` to satisfy contrast requirements in both light and dark mode. |

```ts
import { makeAvatarPalette } from "@/lib/avatar-utils";

const avatarPalette = makeAvatarPalette(0.2);
// style={avatarPalette[index % avatarPalette.length]}
```

The opacity argument lets each call site tune the background fill for its surface context. `DiscussionSection` uses `0.2`; `CommunitySidebar` uses `0.25`.

---

### `markdown`

`src/lib/markdown.ts`

Helper functions for the `MarkdownContent` component.

| Export | Signature | Description |
| --- | --- | --- |
| `slugify` | `(text: string) => string` | Converts heading text to a URL-safe slug for `id` attributes. |
| `getSectionIcon` | `(slug: string) => LucideIcon \| undefined` | Maps known section slugs (`architecture`, `toolbox`, `how-to-play`) to their lucide-react icon. Returns `undefined` for unrecognised slugs. |
| `stripLinks` | `(html: string) => string` | Strips `<a>` tags from sanitised HTML while preserving link text. Also removes `sr-only` new-tab spans injected by the generator. Call before passing any author-prose HTML to `dangerouslySetInnerHTML` inside an interactive element (`<Link>`, `<button>`) to prevent invalid nested anchors. |
| `stripHtml` | `(html: string) => string` | Strips all HTML tags and decodes named and numeric HTML entities in a single pass. Contract: input must be rehype-sanitize output so `>` in attribute values is already escaped. Single-pass prevents double-decode of mixed entities (`&amp;lt;` → `&lt;`, not `<`). Use when placing author-prose HTML into plain-text contexts such as `<meta content="">` attributes. |

---

## Icons

All icons use **lucide-react** (already a project dependency; no other icon library may be added).

### Sizes

| Context | Size prop |
| --- | --- |
| Inline with `text-sm` body or link text | `size={13}` |
| Inline with `text-base` or larger | `size={16}` |
| Section card icon (standalone, above heading) | `size={28}` |
| Button icon (paired with button label) | `size={14}` |

### Alignment

When pairing an icon with text inside a link or button, always use `inline-flex items-center gap-1` on the container.
Never put a raw SVG icon next to text inside a plain `inline` or `block` element. The icon will drop below the baseline.

```tsx
// Correct: internal navigation
<Link className="inline-flex items-center gap-1 ...">
  Next step <ArrowRight size={13} aria-hidden="true" />
</Link>

// Correct: external link (opens in new tab)
<a target="_blank" ... className="docs-ext-link">
  View docs <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
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
| --- | --- | --- |
| External link (opens in new tab) | `ExternalLink` | All `<a target="_blank">` links: Navbar, BottomCTA, Hero, CommunityGuide, LevelCard, DiscussionSection, LeaderboardList, Privacy, and more |
| Navigate forward / CTA | `ArrowRight` | Internal `<Link>` navigation only (OtherLevelsCard, SponsorStrip, AdventureDetail) |
| Breadcrumb separator | `ChevronRight` | `Breadcrumb.tsx` — rendered between each breadcrumb item |
| Scroll down / anchor | `ArrowDown` | Hero primary CTA |
| Community Voices card | `Megaphone` | CommunitySection card icon |
| Q&A card | `CircleHelp` | CommunitySection card icon |
| Introduce yourself card | `UserPlus` | CommunitySection card icon |
| Events & meetups card | `CalendarDays` | CommunitySection card icon |
| Adventure levels badge | `Layers` | ChallengesGrid adventure card |
| Learn by Doing highlight | `BookOpen` | ChallengeHighlights |
| Build Real Skills highlight | `TrendingUp` | ChallengeHighlights |
| Vendor-neutral highlight | `Shield` | ChallengeHighlights |

### Brand/social icon exceptions

Some official brand marks have no equivalent in lucide-react and must use the brand's own SVG. These are the only permitted exceptions to the lucide-react-only rule.

| Brand | Where used | Notes |
| --- | --- | --- |
| LinkedIn "in" rounded-rectangle mark | `Footer.tsx` bottom strip | Inline SVG, `aria-hidden="true"` on `<svg>`, `aria-label="LinkedIn (opens in new tab)"` on parent `<a>`, `fill="currentColor"`, `className="w-3.5 h-3.5"` (14 px, matching surrounding icon size) |
| Bluesky butterfly mark | `Footer.tsx` bottom strip | Inline SVG, `aria-hidden="true"` on `<svg>`, `aria-label="Bluesky (opens in new tab)"` on parent `<a>`, `fill="currentColor"`, `className="w-3.5 h-3.5"`. URL from `BLUESKY_URL` constant. |
| X (Twitter) mark | `Footer.tsx` bottom strip | Inline SVG, `aria-hidden="true"` on `<svg>`, `aria-label="X / Twitter (opens in new tab)"` on parent `<a>`, `target="_blank"`, `rel="noopener noreferrer"`, `fill="currentColor"`, `className="w-3.5 h-3.5"`. URL from `X_URL` constant. |

When adding a new brand SVG: place it inline, set `aria-hidden="true"` on the `<svg>`, put the accessible label on the parent interactive element, use `fill="currentColor"`, and add a row to this table.

---

## CSS Class Patterns

### `.section-label`

A CSS selector hook for decorative overline labels that appear above section headings or page content areas. The class itself has no base CSS styles — all visual styling comes from the Tailwind utilities applied alongside it. The class exists solely so the light-mode override can target it.

Applied as: `font-sans text-sm font-medium uppercase tracking-widest text-primary section-label`

Used on `<span>` elements via the `SectionLabel` component in: `CommunitySection`, `ChallengesGrid`, `NotFound`.

**Light mode override:** `.light .section-label` in the unlayered section of `src/index.css` sets `color: hsl(240 20% 9%)` (near-black) so the label does not render as yellow text in light mode. This is the only CSS rule for `.section-label` in `src/index.css`.

---

### `.docs-ext-link`

The standard class for all inline prose links across the site. Handles both modes correctly without any additional Tailwind utilities for color or hover state.

**Dark mode:** foreground text with amber (`--primary`) underline. Hover shifts text and underline to full `hsl(var(--primary))` (`#ffc034`).
**Light mode:** near-black foreground text with `currentColor` underline. Hover shifts text and underline to `--link-hover-light` (`hsl(41 100% 21%)` ≈ `#6b4900`), dark amber, same hue as primary, ~7.5:1 contrast on bg-card. Passes WCAG AAA.

Used in: `CommunityGuide`, `DiscussionSection`, `CommunitySection`, `LevelCard`, `PersonNameLink`, `ChallengeBuildersSection`, `ChallengeDetail`, `MarkdownContent`, `CommunitySidebar`, `RewardsCard`, `Accessibility`, and `Privacy`.

Do not use `hover:text-primary` or `hover:underline` on inline content links. Use `docs-ext-link` instead.

```ts
// The CSS class now bundles: inline-flex, align-items, gap, underline,
// decoration-thickness, underline-offset, border-radius, focus-visible ring,
// and color/hover transitions. No additional utilities needed for basic usage.
const extLink = "docs-ext-link";

// Add contextual utilities as needed (font-size, weight, margin):
className="docs-ext-link text-sm font-medium mt-4"
```

---

### `.social-icon-link`

CSS class for icon-only social media `<a>` links. Used in the Spread the Word card on `/contribute` and in `ChallengeShareLinks` on challenge detail pages.

**Dark mode:** base `text-dim`, hover `hsl(var(--primary))` (amber, fine on dark backgrounds).
**Light mode:** `.light .social-icon-link:hover` overrides to `hsl(var(--link-hover-light))` (~7.5:1 dark amber on bg-card), avoiding `#ffc034` which is ~1.6:1 on near-white and fails WCAG 1.4.11.

Includes `padding: 0.25rem` (equivalent to `p-1`) to improve tap target size and `border-radius: 2px` for focus ring containment.

Usage pattern:

```tsx
<a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in new tab)" className="social-icon-link">
  <svg aria-hidden="true" ...>...</svg>
</a>
```

Always use `aria-label` on the parent `<a>` (not the svg) for icon-only links. Do not use `hover:text-primary` on icon-only social links that appear on `bg-card` or `bg-background` in light mode.

---

### `.tag-chip-link`

CSS class applied to tag/technology chip `<Link>` elements in `ChallengeDetail` and `AdventureDetail`. Added alongside the standard Tailwind border and text utilities to provide light mode overrides that meet WCAG 1.4.11 (3:1 border contrast for interactive components).

**Dark mode:** inherits border from `border-border` and text from `text-faint`; hover shifts to `border-primary` / `text-primary` (amber).
**Light mode:** `.light .tag-chip-link` overrides border to `hsl(220 12% 55%)` (~3.25:1) and text to `--text-secondary`. Hover shifts to `hsl(220 12% 38%)` border and `hsl(220 12% 20%)` text (dark slate), avoiding amber which is below 3:1 on light backgrounds.

Usage pattern:

```tsx
<Link
  to={`/challenges/${tagToSlug(tag)}`}
  className="tag-chip-link rounded-sm border border-border px-2.5 py-1 text-xs text-faint hover:border-primary hover:text-primary transition-colors"
>
  {tag}
</Link>
```

Always add `tag-chip-link` to interactive tag chip links. Do not use `hover:border-primary hover:text-primary` alone. In light mode those produce amber, which fails 1.4.11.

**Focus indicator:** `.tag-chip-link:focus-visible` uses `outline` rather than `box-shadow` for the focus ring. `box-shadow` is clipped by `overflow:hidden` on ancestor elements (the chip sits inside card containers), silently hiding the focus indicator. `outline` is not clipped by `overflow:hidden` and escapes those containers. Do not revert to `box-shadow` for this element.

---

### `.badge-levels`

Inline pill used in `ChallengesGrid.tsx` adventure cards to show the number of levels. Styled as a mono-font uppercase tag with amber fill in light mode.

```tsx
<span className="badge-levels inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
  <Layers size={11} aria-hidden="true" /> {n} levels
</span>
```

Light mode override: `.light .badge-levels` sets black text on amber background so it remains legible. Excluded from the broad `.light span.text-primary:not(.badge-levels)` reset. It intentionally keeps its amber styling.

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

### `@media (prefers-contrast: more)`

Located at the end of `src/index.css`. Fires when the user enables "Increase Contrast" on macOS/iOS or equivalent OS settings.

Overrides:

- `.btn-ghost` border: full-opacity foreground color (removes `border-foreground/35` opacity)
- `.btn-ghost-inverse` border: full-opacity background color
- `.pill-inactive` border and text: full-opacity foreground

Use this block for any element whose visible boundary or text relies on opacity-based color tokens. Do not use it for already-opaque elements.

---

### `@media (forced-colors: active)`

Located at the end of `src/index.css`. Fires when the user enables Windows High Contrast Mode or any forced-color OS mode.

Applies system color keywords (`ButtonFace`, `ButtonText`, `Highlight`, `HighlightText`) to buttons and pills. Uses `forced-color-adjust: none` to prevent the browser from adding conflicting overrides on top of our manual system-color assignments. Focus rings use `Highlight` so they remain visible regardless of the `--ring` variable value.

When adding a new interactive component (button, pill, toggle, chip), add a corresponding rule to the `forced-colors` block so its boundaries and labels remain visible in High Contrast Mode.

---

## Brand Guidelines Page (`/brand`)

`src/pages/BrandGuidelines.tsx`

A public-facing reference for how to use the OffOn brand. Linked from the footer's Explore nav. Sections: Mission and Values, Logo, Colors, Typography, Design Elements (Mascot, OG image), Photography, Voice and Tone.

### Key patterns

- **Side-by-side color panels**: dark and light mode swatches are shown simultaneously in two always-on panels with hardcoded `backgroundColor` inline styles. `ColorCard` accepts a `dark: boolean` prop and uses hardcoded inline styles for text so cards render correctly regardless of the page theme. No toggle or `colorMode` state.
- **TOC scrollspy** (`activeSection` state): an `IntersectionObserver` created inside `useEffect` tracks which section is in the top 20% of the viewport and highlights the matching TOC link with `aria-current="location"`.
- **Download links** use `<a download="filename">` with `href` pointing to `public/brand/` assets. These have stable, clean URLs (no Vite hash) because they live in `public/`, not `src/assets/`.
- **Static data arrays** (`LOGO_CARDS`, `ICON_DOWNLOADS`, `NYX_FULL_DOWNLOADS`, etc.) are defined at module level using the Vite compile-time constant `BASE = import.meta.env.BASE_URL`. Do not move them inside the component.

### Brand assets in `public/brand/`

All downloadable brand assets live at `public/brand/`. File naming convention: `offon-<asset>.<ext>` with no size suffix in the filename.

| File | Purpose |
| --- | --- |
| `offon-logo-dark-color.svg` / `.png` | Color wordmark for dark backgrounds |
| `offon-logo-light-mono.svg` / `.png` | Mono wordmark for light and amber backgrounds |
| `offon-logo-dark-mono.svg` / `.png` | Mono wordmark for single-color print on dark |
| `offon-favicon.svg` / `.png` | Standalone icon mark |
| `offon-nyx.png` | Mascot full variant (PNG) |
| `offon-nyx-peek.png` | Mascot peeking variant (PNG) |

Mascot WebP sources (`nyx.webp`, `nyx_peek.webp`) live in `public/` (not `public/brand/`) because they are also used as background images in page hero sections.

### Hover contrast rule (light mode)

`hover:text-primary` resolves to amber on a light surface and fails WCAG contrast. Always use `hover:text-foreground dark:hover:text-primary` on any interactive element in this page.

---

## Performance

### Lighthouse scores (production build)

Measured against the production build locally (`npm run build && npm run preview`). Minimum acceptable score: 95 for performance and 100 for the rest of the categories.

| Category | Score |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

## Solution Pages (`/adventures/:id/levels/:levelId/solution`)

Solution walkthroughs live at `src/pages/SolutionDetail.tsx`. The page is gated: if a deadline has not passed (or no solution file exists), a locked state is shown. Once available, the page renders a two-column layout.

### Data model

Source files live at `src/data/solutions/<adventure-id>/<level-id>.ts`. Types are in `src/data/solutions/types.ts`.

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Title case, no emoji, no em dashes |
| `contributor` | `{ name: string; url?: string }` | Optional. Walkthrough author if different from the challenge builder. Renders as a pill between the intro text and the topic tag pills in the hero. |
| `spoilerWarning` | `string` | One sentence, plain text |
| `intro` | `string` | One or two sentences, plain text |
| `context` | `{ title, body: SolutionBlock[] }` | Optional. Always-open setup section rendered before the step accordions. Include only when the reader needs background on tooling or architecture before the steps make sense. Title should reflect the specific challenge; avoid generic phrases. |
| `steps` | `SolutionStep[]` | One step per challenge objective. Max two takeaways per step. |
| `furtherReading` | `Array<{ title, url }>` | Optional. Links shown in the sidebar "Further Reading" card. Deduplicate by URL before adding. |
| `completeSolution` | `{ title, description, language, code }` | Optional. Final corrected config or runbook shown as a summary card. |
| `outro` | `{ heading: string; html: string }` | Narrative close. End with a sentence that follows the adventure's story world, then a sentence inviting the reader to see how others solved it. The "Browse the discussion" link is rendered by the component automatically after the html. |

### `SolutionBlock` union

| `type` | Fields | Rendered as |
| --- | --- | --- |
| `text` | `html: string` | `.md-content` div with `dangerouslySetInnerHTML` |
| `code` | `language, title?, code` | `.md-pre-group` with copy button and language label |
| `image` | `src, alt, caption?` | `<figure>` with `<img>` and optional `<figcaption>` |
| `callout` | `variant: tip, warning, or info; html` | Bordered box with icon and variant label |

### Callout variants

| Variant | Icon | Color |
| --- | --- | --- |
| `tip` | `Lightbulb` | Amber (`primary`) |
| `warning` | `AlertTriangle` | Orange |
| `info` | `Info` | Blue |

### Images

- Stored in `public/solutions/<adventure-id>/`.
- File naming: `<level-id>-<descriptive-slug>.webp`.
- Converted from source PNGs using `cwebp -q 85`.
- Alt text: one sentence, direct description, no em dashes, no "screenshot of" filler.

### Page layout

The solution page uses a two-column layout: main article on the left, sticky sidebar on the right (collapses to a single column on mobile).

- **Hero**: backstory quote (top band), then difficulty badge + "Solution" label, `h1` title, intro text, contributor pill (if present), topic tag pills.
- **Sidebar**: "What Was Fixed" step nav (`<nav aria-label="What was fixed">`), "Solve Along" Codespaces card (if `codespacesUrl` present), challenge back-link, discussion link, "Further Reading" card (from `solution.furtherReading`).
- **Main column**: spoiler warning, context section (always-open, no toggle), step accordions (first step open by default), complete solution toggle, outro card.

### Adding a new solution

Use the `/add-solution` command. It handles image conversion, TypeScript authoring, and generator patching automatically.
