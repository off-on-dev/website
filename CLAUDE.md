# CLAUDE.md

Guidance for AI coding agents working in this repository.

---

## Project Commands

Project-level Claude Code commands live in `.claude/commands/`. Invoke them with `/command-name` in Claude Code. These are committed to the repo and available to all contributors.

| Command | When to use |
| --- | --- |
| `/a11y-audit` | On-demand accessibility audit using the Red Team / Blue Team persona pipeline. Run against a component or page to get a severity-weighted report. Invokes sub-commands below as needed. |
| &nbsp;&nbsp;`/keyboard` | Sub-command: writing or reviewing any interactive element — buttons, modals, dropdowns, tabs, custom widgets. |
| &nbsp;&nbsp;`/navigation` | Sub-command: working on nav components — primary nav, skip links, breadcrumbs, pagination, mobile menus. |
| &nbsp;&nbsp;`/progressive-enhancement` | Sub-command: building any new feature or reviewing architecture. Ensures core content works without JS. |
| &nbsp;&nbsp;`/user-personalization` | Sub-command: working on theme toggle, consent state, or any user preference persistence. |
| `/add-solution` | Generate a structured TypeScript solution file (`src/data/solutions/<id>/<level>.ts`) from any input format. Downloads and converts images to WebP. Solutions are pre-built TS objects loaded by the app; there is no generator step. |
| `/create-presentation` | Create a presentation deck for an OffOn event or challenge. Reveal.js HTML or editable PPTX. Output goes to `public/<event-slug>/index.html` or `public/downloads/`. |

The `spec-first-coding` command is installed globally (`~/.claude/skills/`). Use `/a11y-audit` for all accessibility audits.

---

## Project Overview

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts. It is fully static with no backend and no database. Pages are prerendered at build time by **Astro** (`output: 'static'`); interactivity is layered on as **Vue islands**.

> This project was migrated from React Router v8 to Astro + Vue. If you find a reference to `root.tsx`, `entry.server`, `routes.ts`, `*.generated.ts`, `useConsent`, `useTheme`, or `scripts/generate-adventures.mjs`, it is stale — those no longer exist.

Community activity happens on a separate Discourse instance (display name **community.offon.dev**). Use the `COMMUNITY_URL` constant from `src/lib/site.ts`; never hardcode it. Do not replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** Astro 7 (static output), TypeScript. Check `package.json` for versions.
- **Interactivity:** Vue 3 islands via `@astrojs/vue`, hydrated with `client:*` directives. Shared cross-island state uses **nanostores** (`src/stores/`).
- **Styling:** Tailwind CSS 4, CSS-first via `src/styles/index.css` (`@theme` block) and the `@tailwindcss/vite` plugin. No `tailwind.config.ts`.
- **Icons:** `astro-icon` (lucide set) in `.astro`; `lucide-vue-next` in `.vue` islands.
- **UI primitives:** Reka UI (`reka-ui`) for the tooltip. There is no shadcn surface.
- **Content:** Astro Content Collections (Zod-validated) over authored YAML. See "Content collection".
- **Routing:** Astro file-based routing + `getStaticPaths()`. Trailing slashes always.
- **Testing:** Playwright + `@axe-core/playwright` in `e2e/` (a11y + SEO/smoke/hydration).
- **Hosting:** GitHub Pages. **PR previews:** `rossjrw/pr-preview-action`.
- **Node.js:** 26 (pinned in `.nvmrc`; `nvm use`).

---

## Conventions

### Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Astro components / pages | PascalCase files (components), kebab or `[param]` (pages) | `AdventureCard.astro`, `adventures/[id].astro` |
| Vue island components | PascalCase | `ThemeToggle.vue`, `ChallengesFilter.vue` |
| nanostores | camelCase file, `$`-prefixed export | `stores/theme.ts` → `$theme` |
| Module-level constants | SCREAMING_SNAKE_CASE | `BRAND_NAME`, `DIFFICULTIES` |
| Route segments | kebab-case | `presentation-templates`, `handbook` |

### What lives where

- Adventure data is derived from the `adventures` content collection (`getCollection('adventures')`). Do not re-derive collection logic ad hoc in pages; put shared derivations in `src/lib/` (e.g. `challenges.ts`, `adventure-derive.mjs`).
- Reusable markup belongs in `src/components/` (`.astro` for static, `.vue` for islands). Extract before the second copy appears.
- Retired URLs are handled by the `redirects` map in `astro.config.mjs`, not by page files.

---

## URLs and External Organisations

- The canonical domain is <https://offon.dev>. og:url, og:image, and all absolute URLs must use it.
- The og:image is `public/og.png` (<https://offon.dev/og.png>), 1200 x 630 px.
- PR previews are served from the gh-pages branch under `/pr-preview/pr-{number}/`.
- The open source challenges content lives at <https://github.com/off-on-dev/open-source-challenges> (intentional external link; never flag it).
- The community Discourse instance is <https://community.offon.dev>. Use `COMMUNITY_URL` from `src/lib/site.ts`; never hardcode. Use `COMMUNITY_DISPLAY_NAME` for visible text, `COMMUNITY_URL` for hrefs.

---

## Repository Layout

```text
src/
  pages/          # File-based routes (.astro). Dynamic routes use getStaticPaths().
    index.astro   # Home
    adventures/[id].astro, adventures/[id]/levels/[levelId].astro (+/solution.astro)
    challenges/[...tag].astro, 404.astro, and the static pages
    _app.ts       # Vue appEntrypoint (island-wide setup)
  layouts/
    Layout.astro  # App shell: <head> (SEO, CSP, favicons, theme + GA4 bootstrap, JSON-LD),
                  # ClientRouter, skip-nav, Navbar, <slot/>, Footer, ConsentBanner
  components/      # *.astro (static, zero-JS) and *.vue (islands)
  content.config.ts  # Content collection: Zod schema + custom loader + markdown rendering
  data/
    adventures/<id>/adventure.yaml + <level>-posts.json + leaderboard.json
    adventures/contributors.ts, types.ts
    solutions/<id>/<level>.ts (pre-built Solution objects), sponsors.ts, team.ts
  lib/            # markdown-pipeline.mjs, adventure-derive.mjs, community-data.ts,
                  # solutions.ts, challenges.ts, difficulty.ts, markdown.ts, utils.ts,
                  # site.ts (constants), level-constants.mjs, deadline.mjs
  stores/         # nanostores: theme.ts ($theme), consent.ts ($consent + gtag injector)
  styles/index.css  # Tailwind @theme, component classes, light-mode overrides
  assets/diagrams/  # Architecture SVGs (imported per-level via import.meta.glob)
e2e/
  a11y.spec.ts    # axe (dark/light/forced-colors) + touch targets + focus rings + zoom
  smoke.spec.ts   # per-route title/canonical/OG/h1 + island hydration
public/           # copied verbatim to dist/ (fonts, favicons, brand, well-known, decks, etc.)
astro.config.mjs, tsconfig.json, playwright.config.ts, package.json
.github/workflows/  # deploy, preview, validate-adventures, sync-adventure,
                    # add-discussion-url, refresh-community-*, a11y-scan, reuse
```

---

## Commands

```sh
nvm use              # Node 26
npm run dev          # Astro dev server (http://localhost:4321)
npm run build        # Static build -> dist/
npm run preview      # Serve the built dist/ (astro preview)
npm run sync         # astro sync — runs the Zod content schema; fails on invalid adventure YAML
npm run test:e2e     # Playwright (a11y + smoke). Runs `astro preview` itself; no separate build needed
npm run lint:reuse   # REUSE licence compliance (requires: pip install reuse)  [if present]

# Presentation templates (unchanged; run from repo root)
node .claude/templates/generate-reveal-zip.mjs   # → public/downloads/offon-reveal-template.zip
node .claude/templates/generate-pptx.mjs         # → public/downloads/offon-deck-template.pptx
```

There is **no** content generator, `npm run generate`, or `*.generated.ts` — routes and rendered prose come from the content collection at build time.

---

## Code Quality

- Explicit return types on functions and helpers.
- Keep components small and single-responsibility. Split a function that needs more than one level of conditional nesting to describe.
- Prefer `const`; never `var`. Use async/await; handle errors explicitly.
- Never leave unused imports, variables, or dead code. Self-documenting code; comment only non-obvious logic.

---

## Stability Rules

- Never remove or rename existing exports without checking all usages first.
- Never change a component's props without updating all call sites.
- Never delete files without confirming they are unused.
- When refactoring, change one thing at a time. Do not mix refactors with feature changes.
- Always verify the build (`npm run build`) has no TypeScript errors after changes.
- Prefer extending existing components over rewriting them. Flag risky changes before proceeding.

---

## Debugging Rules

### Evidence rules

- Never claim a fix worked from source inspection alone. The only signal that counts is the expected behaviour observed in a real browser against the current build (`npm run build && npm run preview`).
- Before acting on any error, verify it came from the current build. Astro emits hashed asset names (`_astro/*.js`); a stale hash means the browser is serving cached code.
- Before acting on diagnostic output, state what evidence supports the conclusion.
- When a grep claims to confirm something, verify the pattern excludes false positives. `::after` and other pseudo-elements are invisible to `querySelectorAll('*')` — layout/overflow bugs can hide there.

### One-fix-at-a-time rule

- Never stack fixes. One change, rebuild, verify, then the next. Commit after every verified fix.
- If the same bug has been "fixed" more than once in a session and still reproduces, stop and go back to first principles.

### Server / cache rules

- Playwright's webServer uses `reuseExistingServer: false`; kill any stray `astro dev`/`astro preview` on port 4321 before running tests (a lingering **dev** server has the dev toolbar, which fails focus-ring tests).
- If a build looks stale, `rm -rf dist .astro` and rebuild.

---

## TypeScript

- Use the `@/*` path alias for imports from `src/`: `import { BRAND_NAME } from "@/lib/site"`.
- Astro components declare props with `interface Props { ... }` and `Astro.props`. In plain `.ts` prefer `type` for object shapes.
- Avoid `any`; use `unknown` with narrowing. Never `@ts-ignore`. `tsconfig.json` extends `astro/tsconfigs/strict`.

---

## Components

- Static UI is a `.astro` component (zero JS shipped). Only make something a **Vue island** when it needs client state/interactivity, and hydrate it with the lightest directive that works: `client:visible` / `client:idle` by default, `client:load` only for above-the-fold interactivity (protects the Lighthouse baseline).
- `.astro` components cannot be rendered inside a `.vue` island. If an island needs a badge/pill/icon, inline the markup and use `lucide-vue-next`.
- **Buttons:** raw `<button>` with the CSS utility classes in `src/styles/index.css` (`.btn-primary`, `.btn-ghost`, `.btn-soft`, `.btn-inverse`, `.btn-ghost-inverse`). No Button wrapper. See `styleguide.md`.
- **Touch targets (WCAG 2.5.8):** nav/footer links and any blockified interactive element must be ≥24×24px. Nav links use `min-h-[44px]`, footer links `min-h-[48px]`.
- **Author-controlled prose is pre-rendered, sanitised HTML.** The content collection converts author markdown fields (`level.audience`, `tool.description`, `step.title`, `step.content`, `contributor.about`, `rewards.eligibility`, `tier.description`, `rewards.rankingNote`, `level.learnings`, `level.objective`, `level.intro`, `level.backstory`, `level.scenario`, `level.architecture`, `adventure.story`, `adventure.backstory`) to sanitised HTML at build time via `src/lib/markdown-pipeline.mjs`. Render with `set:html={value}` and the `md-inline` (inline) or `md-content` (block) class — via `<InlineProse html={...} />`, which picks the wrapper automatically. Never render `{value}` raw.
  - **Inside an interactive element** (a link card or button): call `stripLinks(html)` from `@/lib/markdown` first, to avoid nested `<a>`/`<button>`.
  - **Into a plain-text context** (e.g. a meta attribute): call `stripHtml(html)` from `@/lib/markdown` (strips tags and decodes entities).
  - `adventure.story` is rendered plain in card views (`stripHtml`) to keep card markup light.
  - The markdown packages (`unified`, `remark-*`, `rehype-*`) are used only by `src/lib/markdown-pipeline.mjs` at build time. Do not import them in pages/components.

### Component CSS patterns

- `hero-badge` on the Hero pill; `logo-link` on the Navbar logo (excludes it from nav-link hover); `data-difficulty` on `DifficultyBadge`; `contributor-pill` / `contributor-pill-glow` on `ContributorBadge`.
- Footer nav group labels ("explore", "community") use `<p class="font-sans ... text-faint">`, not headings (they'd create spurious document-outline entries). Source text is lowercase (CSS uppercases).
- `docs-ext-link` on all inline prose links site-wide (bundles inline-flex, underline, focus ring, and light/dark colour handling). Links inside pre-rendered adventure HTML use the `.md-inline a` / `.md-content a` rules in `index.css`. Do not add redundant `hover:*`/`inline-flex` utilities.

---

## Content collection

Authored as YAML at `src/data/adventures/<id>/adventure.yaml`, loaded and validated by `src/content.config.ts`:

- **Custom loader** (not `glob()`): reads the YAML with the `yaml` package. Astro's built-in glob YAML parser auto-casts unquoted ISO timestamps to `Date` objects, corrupting `deadline` fields — the `yaml` package (YAML 1.2 core) keeps them as strings. Digest-gated.
- **Zod schema** mirrors the old JSON Schema (`.strict()` = fail on unknown fields). `npm run sync` runs it; invalid YAML fails the build.
- **Markdown fields** are rendered to sanitised HTML in the loader via `mdToInline`/`mdToBlock` (`src/lib/markdown-pipeline.mjs`, which preserves the original abbr-tooltip expansion, external-link annotation, and `rehype-sanitize` posture). `astro:content` returns `entry.data` with HTML fields already rendered.
- **Field normalization** (title/name, story/backstory[0], icon/emoji, difficulty/emoji, learnings aliases, codespacesUrl, discussionUrl, deadline, rewards defaults, meta descriptions, services→step injection) lives in `src/content.config.ts` + `src/lib/adventure-derive.mjs`.
- **Discussion + leaderboard** JSON (`<level>-posts.json`, `leaderboard.json`) is read at build time by `src/lib/community-data.ts` (node `fs`, resolved from `process.cwd()`). These render statically — no client fetch. Refreshed hourly by `refresh-community-data.yml`.
- **Solutions** are pre-built TS objects in `src/data/solutions/<id>/<level>.ts`, loaded via `import.meta.glob` in `src/lib/solutions.ts`. No generation.
- **No runtime `fetch` in components.** All data is resolved at build time.

Adding an adventure requires only the YAML + per-level `*-posts.json` and registering the id in `ADVENTURE_CATEGORIES` (`scripts/refresh-leaderboard.mjs`). Routes appear automatically via `getStaticPaths()`.

---

## Styling

- Tailwind utilities directly on elements. Check the `@theme` block in `src/styles/index.css` before adding any colour/font/spacing/radius; never hardcode these.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`, `text-foreground`). Never add a `dark:` override without a base (light) style.
- Mobile first (`sm:`/`md:`/`lg:`). See `styleguide.md` for the type scale, component classes, and animations (source of truth).
- **Light mode overrides:** add unlayered rules to the "Light mode overrides" section at the bottom of `index.css`, scoped to `.light` (rules in `@layer base` are overridden by `@layer utilities`).

### Design system rules

- Light mode uses `.light` on `<html>`, set by the theme pre-hydration script in `Layout.astro` and the `ThemeToggle` island (backed by the `$theme` nanostore, localStorage key `theme`).
- Yellow `#ffc034` is accent-only in light mode; never a text colour.
- Dark mode uses `:root`/`.dark`. Never modify these when fixing light mode.
- `group-hover:*`/`group-focus:*` are not matched by `.light .classname`; add explicit `.light .group:hover` rules.

---

## Accessibility

Read [`ACCESSIBILITY.md`](ACCESSIBILITY.md) before writing or modifying any component. WCAG 2.2 AA is the floor, not the goal.

The `e2e/a11y.spec.ts` suite gates every representative route on axe (dark, light, and forced-colors with the full WCAG tag set), touch-target size, focus-ring visibility (dark + light), focus traps, and 200% zoom reflow. Never reduce the axe tag set `["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa","best-practice"]`. Add new routes to `PAGES` in `a11y.spec.ts` and `smoke.spec.ts`.

---

## Analytics and Consent

Google Analytics 4 with **Consent Mode v2 in gated-load mode**: no data of any kind is sent to Google until Accept; `gtag.js` is not loaded until then. After Accept, only `analytics_storage` flips to `granted`; the three ad signals stay denied for the site's lifetime.

### Where it lives

- **`Layout.astro`** contains the minimal inline `<head>` bootstrap (`is:inline`): bootstrap `window.dataLayer`, define `window.gtag` as the `dataLayer.push` shim, and `gtag('consent','default',{...})` with all four signals denied. **No** `wait_for_update`, localStorage read, `js`, `config`, or `<script src=...googletagmanager...>`.
- **`src/stores/consent.ts`** owns the state (a plain nanostore `$consent`, default `null`, so island SSR matches hydration) and the `gtag.js` injector. The injector is shared by Accept and the mount-restore path, gated by a module-scoped `gtagScriptInjected` boolean. On Accept it pushes `consent update` + `js` + `config` synchronously **before** appending the script tag. `config` passes only `cookie_flags: 'SameSite=Lax;Secure'`, `cookie_expires: 15552000`, `send_page_view: false`. The stored format (`{value, timestamp}` + 180-day expiry, key `analytics_consent`) is preserved from the React app.
- **`src/components/ConsentBanner.vue`** (island, `client:load` + `transition:persist`) renders the banner until a choice is made, then a floating cookie button that calls `reset()`. Keeps `aria-live="polite"`. On mount it calls `initConsent()` (GPC + restore) and registers `firePageView` on `astro:page-load`.
- **`firePageView`** only fires when `$consent === "granted"` and `gtag` is loaded — never queue events while undecided/denied.

### Consent state machine (enumerate all transitions before touching this code)

| From | To | Trigger | localStorage | $consent | gtag.js | dataLayer / cookies |
| --- | --- | --- | --- | --- | --- | --- |
| `null` | `granted` | Accept | write `granted` | `granted` | inject if not already | `consent update granted` + `js` + `config` |
| `null` | `denied` | Decline | write `denied` | `denied` | not injected | `consent update denied`, clear `_ga*` |
| `granted` | `denied` | Decline after grant | write `denied` | `denied` | unchanged | `consent update denied`, clear `_ga*` |
| `denied` | `granted` | Accept after decline | write `granted` | `granted` | inject if not already | `consent update granted` (+ js/config only on first injection) |
| `granted`/`denied` | `null` | Cookie Preferences (reset) | clear | `null` | unchanged | `consent update denied`, clear `_ga*` |
| `null` | stored value | Page load with stored choice | (read) | stored | inject if stored `granted` | on granted: `consent update granted` + js + config |
| `null`/`denied` | `denied` | Page load, GPC active, not explicitly granted | write `denied` | `denied` | not injected | clear `_ga*` |
| GPC active | `granted` | Page load, GPC active, stored `granted` | (read) | `granted` | injected | `consent update granted` + js + config |

### Do not

- Do not load `gtag.js` outside the injector. Do not put `js`/`config` in `Layout.astro` (they belong queued after the consent update in the injector).
- Do not reintroduce `wait_for_update`, `ANALYTICS_LINKER_DOMAINS`, or `cookie_domain`.
- Do not put the consent update inside `script.onload` (queue it before `appendChild`).
- Do not remove GPC detection (`navigator.globalPrivacyControl === true`).
- Do not remove the script, wipe `dataLayer`, or replace `window.gtag` on deny.
- Do not push `page_view`/`click_event` when consent is not granted. Do not skip clearing `_ga*` on deny/reset.

---

## Islands & Hydration Safety

These patterns produce hydration mismatches and console errors. Never introduce them.

- **An island's first client render must match its SSR output.** SSR runs with default state (dark theme, `null` consent). Read `localStorage`/`navigator`/the DOM in `onMounted`, then update reactive state — never in `<script setup>` top level or as a `ref` initializer. This is why `$theme`/`$consent` are plain atoms read on mount, not `persistentAtom` (which reads localStorage at import time and would mismatch SSR).
- **No non-deterministic values in a render body.** Build-time `.astro` frontmatter may use `new Date()` (it runs on the server); Vue island templates must not.
- **`client:only` + ClientRouter** has a first-navigation hydration bug — prefer SSR islands (`client:visible`/`idle`/`load`). Islands in `Layout.astro` (theme toggle, consent) use `transition:persist` so they survive View Transitions.
- **After each client navigation** (`astro:after-swap`), `Layout.astro` re-asserts the `<html>` theme class (prevents flash) and moves focus to `#main-content`. Astro's `<ClientRouter />` provides the route announcer and respects `prefers-reduced-motion`.
- **Wide content** (code blocks) must scroll inside its own `overflow-x:auto` container; grid tracks holding it need `minmax(0,1fr)`, not `1fr`.
- **Progressive enhancement:** core content (headings, prose, nav, cards) must render server-side and work with JS disabled. Filters/theme/consent may degrade. Verify: DevTools → Disable JavaScript → reload; and inspect `dist/`.

---

## SEO

Static site. Apply on every page.

- Every page: unique descriptive `<title>`, `<meta name="description">` under 160 chars, and canonical `${SITE_URL}${path}` (trailing slash). One `<h1>`; logical heading order (no skips; use block `<span>` for multi-line headings, not `<br>`).
- **Per-page meta comes from the `<SEO>` component** (`src/components/SEO.astro`), fed by `Layout.astro` props (`title`, `description`, `path`, `ogType`, `noindex`). It emits canonical, OG (`og:title/description/type/url/image` + width/height/alt, `og:site_name`, `og:locale` en_GB) and Twitter tags. Do not hand-write these in pages. Legal pages pass `noindex`.
- Internal links use plain `<a href>` with **trailing slashes** and `import.meta.env.BASE_URL` (so PR previews under `/pr-preview/pr-N/` resolve). External links: `target="_blank" rel="noopener noreferrer" aria-describedby="new-tab-hint"`.
- **`Layout.astro` global head** (verify when editing): `<meta charset>` in the first 1024 bytes, viewport (never `user-scalable=no`), `color-scheme`, favicons (svg/png/ico/apple-touch), manifest, both `theme-color` tags, CSP meta, the two JSON-LD blocks (`WebSite` + `Organization`, brand name hardcoded), font preloads, and the PR-preview `noindex` guard. `lang="en"` on `<html>`.
- **Soft 404s:** unmatched paths must return 404, not 200. `src/pages/404.astro` → `dist/404.html` (GitHub Pages serves it). No catch-all route rendering a 200 "not found" page. Retire URLs via the `redirects` map in `astro.config.mjs`.
- Read [`PERFORMANCE.md`](PERFORMANCE.md) before adding a dependency, font, image, or route.

---

## Content and Copy

### Brand Name

- Always **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".
- "Open Ecosystem" is retired. Never use it.
- In code, use the `BRAND_NAME` constant from `src/lib/site.ts`.
- As a URL/href: `offon.dev` (lowercase). As a display name: `OffOn.dev` (never `OffOn.Dev`).

### Tone

- Direct, positive, community-focused. Write for open source enthusiasts, not a corporate audience. Plain language. Active voice. Short, scannable sentences.
- Never enumerate specific difficulty levels in UI copy. Use broad language ("any difficulty level", "the difficulty that fits where you are").

### Capitalisation

UI labels use **title case (Chicago)**; body copy uses **sentence case**.
- **Title case:** button/CTA labels, section headings (h2/h3), card/value titles, nav and footer links, pill/badge text. Capitalise every word except articles, prepositions under five letters, and coordinating conjunctions — unless they open or close the label.
- **Sentence case:** body paragraphs, meta descriptions, `<p>` text, hero sub-headings, card descriptions.
- **Exception:** overline labels use CSS `text-transform: uppercase`, so write source text lowercase.

### Formatting

- Never use em dashes anywhere (comments and docs included). Use commas, periods, or restructure.
- Keep tone cohesive; don't mix formal and casual registers within a page.

---

## Git

- Branch naming: `type/short-description` (e.g. `feat/hero-section`).
- All commits signed off: `git commit -s`.
- Never force-push to `main`. PR titles follow conventional commits.

| Type | When |
| --- | --- |
| `feat` / `fix` / `docs` / `style` / `refactor` / `chore` / `perf` / `security` / `config` / `revert` | as named |

---

## Site Maintenance

### Well-known files

- `public/.well-known/security.txt` `Expires` — update annually (current: `2027-06-01`).
- `public/llms.txt` / `llms-full.txt` — update when an adventure/level is added or a page renamed.
- `public/robots.txt` — named `User-agent` groups do not inherit `Disallow` from `*`; repeat `Disallow` in each group. Must include `Sitemap: https://offon.dev/sitemap.xml`.
- `public/.well-known/agent-skills/offon/SKILL.md` — after editing, update the SHA256 `digest` in `index.json`.

### Sitemap

- `/sitemap.xml` is generated at build time by `src/pages/sitemap.xml.ts` from `getCollection()` + the static route list. Adventure, level, solution, and challenge-tag URLs are automatic. When adding a new **static** page, add its path to the `staticPaths` array in that endpoint (unless it is noindex — `/privacy/` and `/presentation-templates/` are excluded).

### Routes

- Routes come from file-based pages and `getStaticPaths()`. There is no prerender array to maintain. When adding a page, add it to `PAGES` in `e2e/a11y.spec.ts` and `ROUTES` in `e2e/smoke.spec.ts` (with the expected title), to `public/sitemap.xml` (except `/privacy/`), and to the routes table in `README.md`.

### Adding an adventure or level

See [`ADVENTURES.md`](ADVENTURES.md). In brief: add/extend the YAML at `src/data/adventures/<id>/adventure.yaml`, add each level's `*-posts.json`, register the id in `ADVENTURE_CATEGORIES` (`scripts/refresh-leaderboard.mjs`), and add the new URLs to `public/sitemap.xml`, the test route lists, `README.md`, and `public/llms.txt`. Routes generate automatically.

---

## Deployment

- Push to `main` triggers `deploy.yml` → GitHub Pages. Open PRs trigger `preview.yml`.
- The build outputs `dist/`; `JamesIves/github-pages-deploy-action` publishes it to `gh-pages`. Astro emits `dist/404.html` natively.
- `trailingSlash: 'always'` matches GitHub Pages URL normalization (no `_.data` alias handling needed).
- **PR previews** build with `VITE_BASE_PATH=/pr-preview/pr-N/` (→ Astro `base`); the whole `dist/` is the preview source (public assets are copied into `dist/` automatically, so there is no per-directory copy step). `Layout.astro` marks `/pr-preview/` builds `noindex`.

### GitHub Actions allowlist

The `off-on-dev` org restricts third-party actions. Permitted: `actions/checkout`, `actions/cache`, `actions/setup-node`, `actions/create-github-app-token`, `JamesIves/github-pages-deploy-action`, `marocchino/sticky-pull-request-comment`, `rossjrw/pr-preview-action`, `fsfe/reuse-action`, actions owned by `off-on-dev`, actions created by GitHub, and Marketplace-verified actions. **The official `withastro/action` and `actions/deploy-pages` are NOT allowlisted** — keep the JamesIves deploy flow. Before adding a `uses:`, verify it is permitted or use `gh`/shell.

---

## Before Submitting Code

State the result of each check explicitly before finishing.

1. **Content gate:** `npm run sync` passes (Zod schema over adventure YAML).
2. **Lint:** `npm run lint` passes (ESLint for astro/vue/ts; `typescript` is pinned to 6.x because typescript-eslint does not support TS 7 yet).
3. **REUSE lint:** `npm run lint:reuse` (or `reuse lint`) passes. `.astro`/`.vue` are covered by globs in `REUSE.toml`.
4. **Build:** `npm run build` completes with no errors.
5. **e2e + a11y:** `npm run test:e2e` passes. The axe audit runs the full WCAG tag set in dark and light. Kill any stray server on port 4321 first. Manual persona testing (ACCESSIBILITY.md) is still required.
6. **Re-read every file you changed;** verify the final state.
7. **Check call sites** for any changed prop/type/export. **Check imports** resolve; no unused imports.
8. **Verify at 375 / 768 / 1280px** against the production build (`npm run preview`), not the dev server.
9. If the change adds/modifies adventure levels, verify a per-level `*-posts.json` exists.

### Red flags — stop and flag to the user

- A fix touches >3 files you did not plan to change; a type error needs a cast/suppression; the same bug is "fixed" more than once; a replacement is a silent no-op; a browser error shows a stale asset hash.

---

## Do Not

- Do not add a backend, API routes, or SSR (`output` stays `static`).
- Do not add external font or icon CDN links; all assets self-hosted.
- Do not change `base` handling without verifying GitHub Pages + PR-preview routing.
- Do not install a new dependency without checking an existing lib/primitive covers it.
- Do not commit secrets, tokens, or credentials.
- Do not change the `@theme` block in `src/styles/index.css` without verifying it doesn't break components.
- Do not edit the copied data types by hand expecting a generator to reconcile — there is no generator; the YAML and the Zod schema are the source of truth.

---

## When Suggesting Code

- Read `styleguide.md` before UI/copy/component changes. Follow the Styling and Components sections.
- Flag accessibility concerns before writing code (read `ACCESSIBILITY.md`). Flag breaking changes explicitly.
- Prefer simple, readable solutions. If multiple approaches exist, state the tradeoff and recommend one.

---

## After Making Changes

A task is not done until the relevant docs are updated.

1. New/changed component, island, or utility? Update `styleguide.md`.
2. New/changed page or route? Update the routes table in `README.md` (and the test route lists + sitemap).
3. New/changed constant or config value? Document it in `README.md`.
4. Changed a build/deploy/dev workflow? Update the Commands section in `CLAUDE.md` and `README.md`.

State which checks applied and what was updated (or why skipped).

---

## Implementation Rules

### Shared state

State consumed by more than one island lives in a **nanostore** (`src/stores/`), read via `@nanostores/vue`'s `useStore`. Do not duplicate cross-island state in component refs.

### File extensions

Static, zero-JS UI is `.astro`. Interactive islands are `.vue`. Pure logic is `.ts`/`.mjs`. Build-time-only pipeline modules are `.mjs`.

### State machines

Enumerate every transition before writing code. For each, list every system that must update (localStorage, store state, DOM, `gtag`/dataLayer). The consent machine table above is the reference.

---

## Known follow-ups (post-migration)

Tracked cleanups not yet done: the abbr JS tooltip (touch + viewport reposition; the CSS `::after` tooltip is `display:none` when hidden to avoid layout overflow); Shiki syntax highlighting for code blocks (`markdown.shikiConfig` is set but the pipeline doesn't highlight yet); GA4 click-event tracking; consent runtime regression tests (browser interaction over the state machine); and the component-by-component rewrite of `styleguide.md`.
