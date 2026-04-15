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
| Code / mono (`font-mono`, `code`, `pre`) | Azeret Mono | 400 primary (500, 600 available) | WOFF2 only (`public/fonts/azeret-mono-*.woff2`) |

All fonts are fully self-hosted as WOFF2. No TTF fallbacks. No external network requests.

Subset coverage (via `unicode-range` in `src/index.css` -- only the needed subset downloads per user):

| Family | Subsets |
|---|---|
| Inter | latin, latin-ext, cyrillic-ext, cyrillic, greek-ext, greek, vietnamese |
| Syne | latin, latin-ext, greek |
| Azeret Mono | latin, latin-ext |

### Font preload

Two Inter variants are preloaded in `index.html` to avoid the three-level font discovery delay (HTML parse → CSS parse → font file request):

- `inter-latin-600-normal.woff2` — used by nav links and subheadings
- `inter-latin-500-normal.woff2` — used by body medium weight

Only Latin subset variants are preloaded. Other subsets (cyrillic, greek, vietnamese, etc.) are served from `public/fonts/` but are not preloaded.

### Tailwind font utilities

| Utility | Resolves to |
|---|---|
| `font-sans` | Inter |
| `font-mono` | Azeret Mono |
| `font-heading` | Syne |

### Scale (Tailwind defaults)

| Element | Class example | Notes |
|---|---|---|
| H1 | `text-4xl font-bold` md:`text-5xl` | Syne, weight 700 |
| H2 | `text-3xl font-bold` md:`text-4xl` | Syne, weight 700 |
| H3 | `text-lg font-semibold` | Syne, weight 600 |
| Body | `text-base` | Inter, weight 400 |
| Small / caption | `text-sm` | Inter, weight 400 |
| Overline label | `font-mono text-xs font-medium uppercase tracking-widest` | Azeret Mono |
| Badge / tag | `font-mono text-xs uppercase tracking-wider` | Azeret Mono |

---

## Colors

All color tokens are CSS custom properties defined in `src/index.css` and exposed as Tailwind utilities via `tailwind.config.ts`. Always use the Tailwind class that references the token; never hardcode hex values.

### Dark Mode (default, `:root, .dark`)

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

#### Difficulty badges (dark)

| Token | HSL | Color |
|---|---|---|
| `--difficulty-starter` | `41 100% 60%` | Amber/yellow |
| `--difficulty-builder` | `85 48% 56%` | Green |
| `--difficulty-architect` | `245 45% 79%` | Lavender/purple |

---

### Light Mode (`.light`)

| Token | Value | Hex | Notes |
|---|---|---|---|
| Background | `hsl(230 100% 99%)` | `#FAFBFF` | |
| Surface/card | `hsl(230 100% 98%)` | `#F5F7FF` | |
| Surface hover | `hsl(225 100% 97%)` | `#F0F4FF` | |
| Primary accent | `hsl(41 100% 60%)` | `#ffc034` | Fill only, never text |
| Primary foreground | `hsl(0 0% 0%)` | `#000000` | Text on yellow |
| Foreground/body | `hsl(240 30% 6%)` | `#0A0B14` | |
| Headings | `hsl(0 0% 0%)` | `#000000` | |
| Muted text | `hsl(0 0% 29%)` | `#4A4A4A` | |
| Border | `hsl(230 20% 85%)` | | |
| Badge: Beginner | `hsl(41 100% 82%)` | | Black text |
| Badge: Intermediate | `hsl(41 100% 76%)` | | Black text |
| Badge: Expert | `hsl(41 100% 68%)` | | Black text |

#### `.light` override strategy

Yellow (`hsl(41 100% 60%)`) is the global `--primary` color and is safe as a fill or border. It must **never** be used as a text color in light mode because it fails contrast requirements.

All `text-primary` usages are overridden to black (`#000000`) in light mode via unlayered CSS rules at the bottom of `src/index.css`, scoped to `.light`. These rules must **not** be placed inside `@layer base`. Rules inside `@layer base` are always overridden by `@layer utilities` regardless of specificity, so the override would be silently ignored. Keeping the overrides unlayered gives them the specificity needed to win against utility classes.

---

## Component Classes

### Buttons

| Class | Style | Usage |
|---|---|---|
| `.btn-primary` | Filled amber, `rounded-md px-5 py-2.5 text-sm font-semibold`, electric glow on hover | Default CTA on page background |
| `.btn-ghost` | Outlined, `border-foreground/35`, subtle glow on hover | Secondary CTA on page background |
| `.btn-soft` | Tinted `bg-primary/10 border-primary/30`, no glow | Tertiary / low-emphasis action |
| `.btn-inverse` | White/background fill with primary border, primary text — inverts on hover to primary bg | Primary CTA inside a `bg-primary` section (e.g. `PageHero`, `BottomCTA`) |
| `.btn-ghost-inverse` | Transparent with background-colored border and text — inverts on hover to background fill | Secondary CTA inside a `bg-primary` section |

#### Button contrast rule (light mode)

Never place any button directly on a `bg-primary` background using `.btn-primary` or `.btn-ghost`. Those classes are designed for page-background contexts and will produce yellow text on yellow background in light mode.

For buttons inside `bg-primary` sections (e.g. `PageHero`, `BottomCTA`), always use `.btn-inverse` or `.btn-ghost-inverse`. The `.light .bg-primary .btn-inverse` and `.light .bg-primary .btn-ghost-inverse` rules in `src/index.css` (unlayered section) enforce correct contrast: black text on yellow fill at rest, yellow text on black fill on hover.

Never add a `bg-primary` section button without adding or verifying the corresponding `.light .bg-primary .btn-*` override in the unlayered section of `src/index.css`.

### Pills (filter toggles)

| Class | Style |
|---|---|
| `.pill-active` | `rounded-full bg-primary/10 border-primary/50 text-primary` |
| `.pill-inactive` | `rounded-full bg-transparent border-surface-border text-text-secondary` |

Both use `px-4 py-1.5 text-sm font-medium leading-none inline-flex items-center` and include `focus-visible` ring styles.

### Difficulty Badges

| Class | Usage |
|---|---|
| `.badge-difficulty` | Base: `rounded-md border px-2.5 py-1 font-mono text-[13px] uppercase tracking-wider` |
| `.badge-beginner` | Amber (primary) color |
| `.badge-intermediate` | Green (`--difficulty-builder`) |
| `.badge-expert` | Lavender (`--difficulty-architect`) |

### Nav and Footer Links

Link hover and active states use an underline that is always rendered in the DOM but invisible by default. This avoids layout shift on hover.

| State | Classes |
|---|---|
| Default | `underline decoration-transparent underline-offset-2 transition-colors duration-200` |
| Hover | `hover:decoration-primary/60` |
| Active / current route | `decoration-primary` |

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
| `.animate-fade-up` | fadeUp (slide up 14px + fade in) | 0.6s ease-out |
| `.animate-fade-up-delay-1` | fadeUp | 0.6s, 0.1s delay |
| `.animate-fade-up-delay-2` | fadeUp | 0.6s, 0.2s delay |
| `.animate-fade-up-delay-3` | fadeUp | 0.6s, 0.3s delay |
| `.animate-marquee` | horizontal scroll left | 30s linear infinite |

### Firefly particles

`.firefly` - 3×3 px dot with `box-shadow` glow in `--primary` color, animated with `fireflyFloat` (8 particles, varying `animation-duration` 6.5–11 s and `animation-delay`).

### Hero glow

`.hero-glow` - three radial gradients (amber 8%, warm 4%, orange 3%) with a mask gradient that fades at top/bottom 10% and 70–100%. Animated with `glowPulse` (9 s ease-in-out, opacity 0.75 → 1, scale 1 → 1.04).

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
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2
```

Adjust `ring-offset-1` for inline elements or `ring-offset-2` for block elements as appropriate.

---

## Hooks

### `useTheme`

`src/hooks/useTheme.tsx`

Manages the light/dark theme. Applies `.light` or `.dark` class to the `<html>` element and persists the choice in `localStorage` under the key `theme`.

```ts
const { theme, setTheme } = useTheme();
```

| Return | Type | Description |
|---|---|---|
| `theme` | `"light" \| "dark"` | Current active theme |
| `setTheme(t)` | `(t: "light" \| "dark") => void` | Change and persist the theme |

The default is dark. All light mode color overrides live in `src/index.css` as unlayered CSS rules scoped to `.light`. Never place light mode overrides inside `@layer base` — they would be silently overridden by `@layer utilities`.

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

## Components

### `ConsentBanner`

`src/components/ConsentBanner.tsx`

Dual-mode component. Renders differently based on whether the user has made a consent decision:

- **No decision yet (`consent === null`):** renders a full-width fixed bottom bar with Decline / Accept analytics buttons and a link to `/privacy`.
- **Decision made (`consent !== null`):** renders a single 44×44 px floating cookie icon button fixed at `bottom-right`. Clicking it calls `reset()` to re-show the banner.

The banner uses `paddingBottom: env(safe-area-inset-bottom)` and the floating button uses `bottom: calc(env(safe-area-inset-bottom) + 1rem)` so both respect the iOS home indicator safe area. `index.html` must include `viewport-fit=cover` in the viewport meta tag for this to work.

Touch target is 44×44 px (`h-11 w-11`) to meet WCAG 2.5.5 (minimum 44×44 px).

No props. Uses `useConsent` context internally.

### `CookiePreferencesLink`

`src/components/CookiePreferencesLink.tsx`

Inline `<button>` that calls `reset()` from `useConsent`, re-showing the `ConsentBanner`. Used in the Footer Policies nav column.

| Prop | Type | Description |
|---|---|---|
| `className` | `string` | Applied to the button element |

Use the same `lnk` class string as other Footer links to maintain visual consistency.
---

## Patterns

### Inline Challenge Card

Used in `ChallengesGrid`, `AdventureDetail`, and `ChallengeDetail` when filtering challenges by technology tag.

Cards use `flex flex-col` so `mt-auto` works on the bottom row. Standard classes:

```
card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6
transition-all duration-200 hover:-translate-y-[3px] flex flex-col
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2
```

Bottom row layout:

```
mt-auto pt-4 flex flex-wrap gap-1.5 items-center justify-between
```

Inside the bottom row:
- Left: `<span className="font-mono text-xs text-muted-foreground">Challenge</span>`
- Right: `<span className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">{adventureTitle}</span>`

### Technology Filter Pattern

Used on the home page (`ChallengesGrid`), `AdventureDetail`, and `ChallengeDetail` to filter challenge cards by technology tag.

```ts
const [activeTech, setActiveTech] = useState<string | null>(null);
```

- Filter chips render with `.pill-active` when selected and `.pill-inactive` otherwise.
- Each chip sets `aria-pressed={activeTech === tag}`.
- Clicking an already-active chip deselects it: `setActiveTech(activeTech === tag ? null : tag)`.
- No URL change and no page navigation occur on selection.
- The filtered results grid only renders when `activeTech` is non-null and results exist.

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
Never put a raw SVG icon next to text inside a plain `inline` or `block` element — the icon will drop below the baseline.

```tsx
// Correct
<a className="inline-flex items-center gap-1 ...">
  Share something <ArrowRight size={13} aria-hidden="true" />
</a>

// Incorrect — icon drops below text baseline
<a className="text-sm ...">
  Share something <ArrowRight size={13} />
</a>
```

### Accessibility

- Decorative icons (paired with visible text): `aria-hidden="true"`, no `aria-label`.
- Icon-only interactive elements: no `aria-hidden`, always include `aria-label` on the parent.

### Icon map (current usage)

| Icon | Lucide name | Where used |
|---|---|---|
| External link (navigation) | `ArrowUpRight` | Navbar GitHub button, BottomCTA GitHub button, CommunityGuide links |
| Navigate forward / CTA | `ArrowRight` | Inline text links (DiscussionSection, VerificationSection, CommunityVoicesSection, ConnectSection, BottomCTA) |
| Navigate back | `ArrowLeft` | ChallengeDetail breadcrumb |
| Scroll down / anchor | `ArrowDown` | Hero primary CTA, About PageHero primary CTA |
| Community Voices section | `Megaphone` | CommunityVoicesSection card icon |
| Q&A section | `CircleHelp` | CommunityVoicesSection card icon |
| Introduce yourself section | `UserPlus` | ConnectSection card icon |
| Events & meetups section | `CalendarDays` | ConnectSection card icon |

---

## Performance

### Lighthouse scores (production build)

Measured against the production build at https://offon.dev.

| Category | Score |
|---|---|
| Performance | 96 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
