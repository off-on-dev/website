# Offon Style Guide

## Typography

### Fonts

| Role | Family | Weights |
|---|---|---|
| Body & UI | Syne | 400, 500, 600, 700, 800 |
| Code / Mono | Azeret Mono | 400, 500, 600 |

Font files are self-hosted in `public/fonts/`. No Google Fonts dependency for Syne.

### Scale (Tailwind defaults)

| Element | Class example | Notes |
|---|---|---|
| H1 | `text-4xl font-extrabold` | weight 800 |
| H2 | `text-3xl font-bold` | weight 700 |
| H3 | `text-2xl font-semibold` | weight 600 |
| H4 | `text-xl font-semibold` | weight 600 |
| Body | `text-base font-normal` | weight 400 |
| Small / caption | `text-sm` | weight 400 |
| Mono | `font-mono` | Azeret Mono |

---

## Colors

### Dark Mode (default)

| Token | HSL | Approx hex | Usage |
|---|---|---|---|
| `--background` | 0 0% 4% | `#0a0a0a` | Page background |
| `--foreground` | 0 0% 95% | `#f2f2f2` | Primary text |
| `--card` | 0 0% 7% | `#121212` | Card / panel background |
| `--primary` | 41 100% 60% | `#ffc034` | Buttons, links, highlights |
| `--primary-foreground` | 0 0% 4% | `#0a0a0a` | Text on primary |
| `--secondary` | 0 0% 12% | `#1f1f1f` | Secondary backgrounds |
| `--secondary-foreground` | 0 0% 75% | `#bfbfbf` | Secondary text |
| `--muted` | 0 0% 12% | `#1f1f1f` | Muted backgrounds |
| `--muted-foreground` | 0 0% 53% | `#878787` | Muted / placeholder text |
| `--accent` | 41 100% 60% | `#ffc034` | Accent highlights |
| `--destructive` | 0 84% 60% | `#f03f3f` | Error / destructive actions |
| `--border` | 0 0% 100% / 0.05 | 5% white | Borders |
| `--ring` | 41 100% 60% | `#ffc034` | Focus ring |

#### Text tokens (dark)

| Token | HSL | Usage |
|---|---|---|
| `--text-primary` | 0 0% 95% | Main content |
| `--text-secondary` | 0 0% 66% | Supporting text |
| `--text-muted` | 0 0% 53% | Captions, hints |
| `--text-faint` | 0 0% 42% | Disabled / very subtle |

#### Surface tokens (dark)

| Token | Value | Usage |
|---|---|---|
| `--surface` | white / 2.5% | Subtle surface overlays |
| `--surface-border` | white / 7% | Surface borders |
| `--surface-hover` | white / 5% | Hover states on surfaces |

#### Accent palette (dark)

| Token | HSL | Usage |
|---|---|---|
| `--electric` | 41 100% 60% | Primary glow / electric yellow |
| `--teal` | 38 100% 58% | Secondary warm accent |
| `--purple` | 32 100% 52% | Tertiary warm accent |

---

### Light Mode

| Token | HSL | Approx hex | Usage |
|---|---|---|---|
| `--background` | 0 0% 100% | `#ffffff` | Page background |
| `--foreground` | 0 0% 7% | `#121212` | Primary text |
| `--card` | 0 0% 97% | `#f7f7f7` | Card / panel background |
| `--primary` | 214 100% 34% | `#005eb8` | Buttons, links, highlights |
| `--primary-foreground` | 0 0% 100% | `#ffffff` | Text on primary |
| `--secondary` | 0 0% 92% | `#ebebeb` | Secondary backgrounds |
| `--muted` | 0 0% 94% | `#f0f0f0` | Muted backgrounds |
| `--muted-foreground` | 0 0% 44% | `#707070` | Muted / placeholder text |
| `--accent` | 214 100% 34% | `#005eb8` | Accent highlights |
| `--destructive` | 0 84% 40% | `#cc2900` | Error / destructive actions |
| `--border` | 0 0% 87% | `#dedede` | Borders |
| `--ring` | 214 100% 34% | `#005eb8` | Focus ring |

#### Accent palette (light)

| Token | HSL | Usage |
|---|---|---|
| `--electric` | 214 100% 34% | Primary blue |
| `--teal` | 210 100% 40% | Secondary blue-teal |
| `--purple` | 225 80% 45% | Tertiary blue-purple |

---

## Difficulty & Type Badges

| Token | Dark | Light |
|---|---|---|
| `--difficulty-starter` | yellow `41 100% 60%` | blue `214 100% 34%` |
| `--difficulty-builder` | orange `25 90% 55%` | burnt orange `25 90% 35%` |
| `--difficulty-architect` | red `0 75% 55%` | dark red `0 75% 40%` |
| `--type-simulation` | warm amber `38 100% 58%` | teal `200 100% 38%` |
| `--type-interactive` | yellow `41 100% 60%` | blue `214 100% 34%` |

---

## Border Radius

| Token | Value |
|---|---|
| `--radius` | `0.625rem` (10px) |

Tailwind classes: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl` map to fractions and multiples of this base.

---

## Background Texture

Dark mode uses a subtle dot grid overlay:

```css
background-image: radial-gradient(circle, hsl(45 100% 65% / 0.035) 1px, transparent 1px);
background-size: 44px 44px;
```

Light mode has no background texture.

---

## Animations

| Class | Keyframe | Duration |
|---|---|---|
| `.animate-fade-up` | fadeUp (slide up + fade in) | 0.6s |
| `.animate-fade-up-delay-1` | fadeUp | 0.6s, 0.1s delay |
| `.animate-fade-up-delay-2` | fadeUp | 0.6s, 0.2s delay |
| `.animate-fade-up-delay-3` | fadeUp | 0.6s, 0.3s delay |
| `.animate-marquee` | horizontal scroll | 30s linear infinite |

Firefly particles use `.firefly` with `fireflyFloat` easing, primary color glow via `box-shadow`.
