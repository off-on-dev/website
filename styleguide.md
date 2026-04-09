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

### Dark Mode (default — `:root, .dark`)

| Token | HSL | Approx hex | Usage |
|---|---|---|---|
| `--background` | `0 0% 4%` | `#0a0a0a` | Page background |
| `--foreground` | `0 0% 95%` | `#f2f2f2` | Primary text |
| `--card` | `0 0% 7%` | `#121212` | Card / panel background |
| `--card-foreground` | `0 0% 95%` | `#f2f2f2` | Text on cards |
| `--popover` | `0 0% 7%` | `#121212` | Popover background |
| `--primary` | `41 100% 60%` | `#ffc034` | Buttons, links, highlights |
| `--primary-foreground` | `0 0% 4%` | `#0a0a0a` | Text on primary |
| `--secondary` | `0 0% 12%` | `#1f1f1f` | Secondary backgrounds |
| `--secondary-foreground` | `0 0% 75%` | `#bfbfbf` | Secondary text |
| `--muted` | `0 0% 12%` | `#1f1f1f` | Muted backgrounds |
| `--muted-foreground` | `45 22% 72%` | `#c8bfa0` | Muted / placeholder text |
| `--accent` | `41 100% 60%` | `#ffc034` | Accent highlights |
| `--destructive` | `0 84% 60%` | `#f03f3f` | Error / destructive |
| `--border` | `0 0% 16%` | `#292929` | Borders |
| `--input` | `0 0% 16%` | `#292929` | Input borders |
| `--ring` | `41 100% 60%` | `#ffc034` | Focus ring |
| `--radius` | `0.625rem` | 10px | Border radius base |

#### Custom text tokens (dark)

| Token | HSL | Approx | Usage |
|---|---|---|---|
| `--text-primary` | `0 0% 95%` | `#f2f2f2` | Main content |
| `--text-secondary` | `45 22% 72%` | `#c8bfa0` | Supporting text, nav links |
| `--text-muted` | `45 15% 63%` | `#b0a98c` | Captions, hints |
| `--text-faint` | `38 30% 72%` | `#c9bfa5` | Disabled / very subtle, counts |

#### Surface tokens (dark)

| Token | HSL | Usage |
|---|---|---|
| `--surface` | `0 0% 10%` | Card / section backgrounds |
| `--surface-border` | `0 0% 16%` | Surface borders |
| `--surface-hover` | `0 0% 13%` | Hover states on surfaces |
| `--border-med` | `40 28% 17%` | Medium warm border |

#### Accent / effect palette (dark)

| Token | HSL | Usage |
|---|---|---|
| `--electric` | `41 100% 60%` | Primary glow / electric yellow |
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
| `--foreground` | `0 0% 7%` | `#121212` | Primary text |
| `--card` | `0 0% 97%` | `#f7f7f7` | Card background |
| `--primary` | `214 100% 34%` | `#005eb8` | Buttons, links |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | Text on primary |
| `--muted-foreground` | `0 0% 44%` | `#707070` | Muted text |
| `--border` | `0 0% 87%` | `#dedede` | Borders |
| `--input` | `0 0% 87%` | `#dedede` | Input borders |
| `--ring` | `214 100% 34%` | `#005eb8` | Focus ring |

#### Difficulty badges (light)

| Token | HSL | Color |
|---|---|---|
| `--difficulty-starter` | `214 100% 34%` | Blue |
| `--difficulty-builder` | `25 90% 35%` | Burnt orange |
| `--difficulty-architect` | `0 75% 40%` | Dark red |

---

## Component Classes

### Buttons

| Class | Style |
|---|---|
| `.btn-primary` | Filled amber, `rounded-md px-5 py-2.5 text-sm font-semibold`, electric glow on hover |
| `.btn-ghost` | Outlined, `border-foreground/25`, subtle glow on hover |
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

### Ghost Word

| Class | Style |
|---|---|
| `.ghost-word` | `color: transparent`, `-webkit-text-stroke: 1.5px`, `font-weight: 800`, `letter-spacing: -0.025em` |

Used in `BottomCTA` on the word "alone." The text is in the DOM for screen readers; stroke outline makes it visually distinct from filled text.

### Card Glow

Add `.card-glow` to any card to get a primary-colored glow + border highlight on hover (transitioning `box-shadow` and `border-color`).

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

`.firefly` -- 3x3px dot with `box-shadow` glow in `--primary` color, animated with `fireflyFloat` (8 particles, varying `animation-duration` 6.5-11s and `animation-delay`).

### Hero glow

`.hero-glow` -- three radial gradients (amber 8%, warm 4%, orange 3%) with a mask gradient that fades at top/bottom 10% and 70-100%. Animated with `glowPulse` (9s ease-in-out, opacity 0.75 to 1, scale 1 to 1.04).

---

## Electric Glow Effects

- `.btn-primary:hover` -- 22px amber `box-shadow`
- `.btn-ghost:hover` -- 14px subtle amber `box-shadow`
- `.card-glow:hover` -- 1px border glow + 32px / 60px radial shadows

Light mode overrides disable or reduce all glow intensities.

---

## Sidebar Tokens

Sidebar uses the same token namespace (`--sidebar-*`) mirroring the main tokens. Not currently in use in any page component.


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

---

## Writing and Copy Rules

- **No em dashes.** Never use `--` or `—` in UI copy. Use a colon, semicolon, or rewrite the sentence.
- **No ellipsis (`...`)** in button labels or links. Use a full phrase.
- **Arrow conventions:** Use `→` for forward navigation, `↓` for scroll-down actions, `↗` for external links.
- **Sentence case** everywhere. No title case in body copy, cards, or descriptions.
- **Community domain:** All links to the community forum use `https://community.open-ecosystem.com`. Update in `src/data/adventures.ts` and across all pages when the domain changes.

---

## Routing

| Path | Page | Notes |
|---|---|---|
| `/` | Home (`Index.tsx`) | Hero, Adventures grid, CommunityVoicesSection, ConnectSection |
| `/adventures/:id` | Adventure detail | All 3 level cards or filtered to one level |
| `/adventures/:id/levels/:levelId` | Adventure detail | Same page, filtered to selected level |
| `/topics/:tag` | Topic page | All challenges tagged with this keyword |
| `/docs` | Docs index | Links to on-site docs + community forum docs |
| `/docs/community-guide` | Community Guide | Quick start, docs index, vendor policy, leaderboards, contact |
| `/about` | About | PageHero + content + BottomCTA |
| `/sponsors` | Sponsors | PageHero + sponsor tiers + BottomCTA |
| `*` | 404 | NotFound |

---

## Community Forum Links

All hosted on `https://community.open-ecosystem.com`. Linked from Docs page and CommunityGuide.

| Label | URL |
|---|---|
| Forum root | `/` |
| Getting Started | `/t/getting-started/36` |
| What the community is about | `/t/what-is-the-community-about-and-who-is-it-for/35` |
| Community Guide | `/t/community-guide/29` |
| Posting Guidelines | `/t/posting-guidelines/30` |
| Code of Conduct | `/t/code-of-conduct/31/1` |
| Stay in the Loop | `/t/stay-in-the-loop/33` |
| Questions and Feedback | `/t/questions-feedback/34` |
| FAQ and Guidelines | `/t/faq-guidelines/4` |
| Privacy Policy | `/t/privacy-policy/22` |
| Hall of Fame leaderboard | `/leaderboard/8` |
| Leaderboards | `/leaderboard/6` |
| Moderators group | `/groups/moderators` |
