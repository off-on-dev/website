# Offon Style Guide

## Typography

### Fonts

| Role | Family | Weights | Source |
|---|---|---|---|
| Headings (`h1`–`h6`) | Syne | 400, 500, 600, 700, 800 | Self-hosted `public/fonts/Syne-*.ttf` |
| Body & UI (`font-sans`) | Inter | 400, 500, 600, 700 | Self-hosted `public/fonts/Inter_18pt-*.ttf` |
| Code / Mono (`font-mono`, `code`, `pre`) | Azeret Mono | 400, 500, 600 | Self-hosted `public/fonts/AzeretMono-*.ttf` |

All fonts are fully self-hosted. No external network requests.

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

### Dark Mode (default — `:root, .dark`)

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

| Token | HSL | Approx hex | Usage |
|---|---|---|---|
| `--background` | `0 0% 100%` | `#ffffff` | Page background |
| `--foreground` | `230 42% 9%` | `#0d1020` | Primary text |
| `--card` | `223 100% 99%` | `#f8f9ff` | Card background |
| `--card-foreground` | `230 42% 9%` | `#0d1020` | Text on cards |
| `--primary` | `220 77% 49%` | `#2272e2` | Buttons, links |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | Text on primary |
| `--secondary` | `221 45% 89%` | `#ccd5ed` | Secondary backgrounds |
| `--secondary-foreground` | `229 39% 19%` | `#1e2342` | Text on secondary |
| `--muted` | `221 45% 89%` | `#ccd5ed` | Muted backgrounds |
| `--muted-foreground` | `228 46% 17%` | `#1b2141` | Muted text |
| `--accent` | `220 77% 49%` | `#2272e2` | Accent highlights |
| `--accent-foreground` | `0 0% 100%` | `#ffffff` | Text on accent |
| `--destructive` | `0 84% 40%` | `#bc1717` | Error / destructive |
| `--destructive-foreground` | `0 0% 100%` | `#ffffff` | Text on destructive |
| `--border` | `222 73% 78%` | `#91aae4` | Borders |
| `--input` | `223 67% 73%` | `#84a0dc` | Input borders |
| `--ring` | `220 77% 49%` | `#2272e2` | Focus ring |

#### Custom text tokens (light)

| Token | HSL | Usage |
|---|---|---|
| `--text-primary` | `230 42% 9%` | Main content |
| `--text-secondary` | `229 39% 19%` | Supporting text, nav links |
| `--text-tertiary` | `228 46% 17%` | Tertiary text |
| `--text-muted` | `228 46% 17%` | Captions, hints |
| `--text-faint` | `228 46% 17%` | Disabled / very subtle |

#### Surface tokens (light)

| Token | HSL | Usage |
|---|---|---|
| `--surface` | `223 100% 99%` | Card / section backgrounds |
| `--surface-border` | `222 73% 78%` | Surface borders |
| `--surface-hover` | `221 45% 96%` | Hover states on surfaces |
| `--accent-subtle` | `221 92% 95%` | Very subtle accent tint |

#### Difficulty badges (light)

| Token | HSL | Color |
|---|---|---|
| `--difficulty-starter` | `220 77% 49%` | Blue |
| `--difficulty-builder` | `25 90% 35%` | Burnt orange |
| `--difficulty-architect` | `0 75% 40%` | Dark red |

---

## Component Classes

### Buttons

| Class | Style |
|---|---|
| `.btn-primary` | Filled amber, `rounded-md px-5 py-2.5 text-sm font-semibold`, electric glow on hover |
| `.btn-ghost` | Outlined, `border-foreground/35`, subtle glow on hover |
| `.btn-soft` | Tinted `bg-primary/10 border-primary/30`, no glow |

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

`.firefly` — 3×3 px dot with `box-shadow` glow in `--primary` color, animated with `fireflyFloat` (8 particles, varying `animation-duration` 6.5–11 s and `animation-delay`).

### Hero glow

`.hero-glow` — three radial gradients (amber 8%, warm 4%, orange 3%) with a mask gradient that fades at top/bottom 10% and 70–100%. Animated with `glowPulse` (9 s ease-in-out, opacity 0.75 → 1, scale 1 → 1.04).

---

## Electric Glow Effects

- `.btn-primary:hover` — 28 px amber `box-shadow`
- `.btn-ghost:hover` — 20 px subtle amber `box-shadow`
- `.card-glow:hover` — 1 px border glow + 32 px / 60 px radial shadows

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