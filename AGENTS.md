# AGENTS.md

Guidance for AI coding agents working in this repository.

> This is the vendor-neutral version of the project AI guidelines. It works with any AI assistant — paste it as a system prompt or load it into your tool's context. Claude Code users: your tool auto-loads `CLAUDE.md`, which contains the same rules plus Claude-specific slash commands and hooks. Keep both files in sync when updating project guidelines.

---

## AI Prompts for Contributors

Workflow-specific AI prompts live in [`.claude/commands/`](.claude/commands/). Any AI assistant can use them: paste the relevant file as a system prompt or opening message. The YAML frontmatter block at the top is harmless and can be ignored.

**Claude Code users:** invoke them as slash commands — `/command-name` in Claude Code.

| Prompt | File | When to use |
| --- | --- | --- |
| a11y-audit | [`.claude/commands/a11y-audit.md`](.claude/commands/a11y-audit.md) | On-demand accessibility audit using the Red Team / Blue Team persona pipeline. Run against a component or page to get a severity-weighted report. |
| &nbsp;&nbsp;keyboard | [`.claude/commands/keyboard.md`](.claude/commands/keyboard.md) | Sub-prompt: writing or reviewing any interactive element — buttons, modals, dropdowns, tabs, custom widgets. |
| &nbsp;&nbsp;navigation | [`.claude/commands/navigation.md`](.claude/commands/navigation.md) | Sub-prompt: working on nav components — primary nav, skip links, breadcrumbs, pagination, mobile menus. |
| &nbsp;&nbsp;progressive-enhancement | [`.claude/commands/progressive-enhancement.md`](.claude/commands/progressive-enhancement.md) | Sub-prompt: building any new feature or reviewing architecture. Ensures core content works without JS. |
| &nbsp;&nbsp;user-personalization | [`.claude/commands/user-personalization.md`](.claude/commands/user-personalization.md) | Sub-prompt: working on theme toggle, consent state, or any user preference persistence. |
| add-solution | [`.claude/commands/add-solution.md`](.claude/commands/add-solution.md) | Generate a structured TypeScript solution file from any input format (md, YAML, HTML, plain text). Downloads and converts images to WebP. |
| create-presentation | [`.claude/commands/create-presentation.md`](.claude/commands/create-presentation.md) | Create a presentation deck for an OffOn event or challenge. Supports two formats: Reveal.js HTML and editable PowerPoint PPTX (edit and run `node .ai/templates/generate-pptx.mjs`). |

A `spec-first-coding` prompt is available for Claude Code users (installed globally at `~/.claude/skills/`). It enforces W3C spec citations before generating any accessibility-related code. For other AI tools, cite the relevant W3C spec manually before implementing any accessibility feature.

Use the `a11y-audit` prompt for all accessibility audits in this repo.

---

## Icons

- Icons come from `unplugin-icons` using the `lucide` set (`@iconify-json/lucide`). Import with `~icons/lucide/<name>` in both `.astro` and `.vue` files.
- Do not install any other icon library.
- Decorative icons next to visible text: set `aria-hidden="true"` on the icon element, no `aria-label`.
- Icon-only interactive elements: add `aria-label` to the parent `<button>` or `<a>`, not on the icon itself.
- When placing an icon next to text in a link or button, add `inline-flex items-center gap-1` to the container.
- See the Icons section of `styleguide.md` for the full icon map, size conventions, and current usage.

---

## Project Overview

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts. It is fully static with no backend and no database. Pages are prerendered at build time by **Astro** (`output: 'static'`); interactivity is added as `.astro` components with vanilla `<script>` blocks.

> This project was migrated from React Router v8 to Astro. If you find a reference to `root.tsx`, `entry.server`, `routes.ts`, `react-router.config.ts`, `*.generated.ts`, `useConsent`, `useTheme`, `FilteredLevelCard.tsx`, `dist/client/`, or `scripts/generate-adventures.mjs`, it is stale and no longer exists.

Community activity happens on a separate Discourse instance. Its display name is **community.offon.dev**. Use the `COMMUNITY_URL` constant from `src/lib/site.ts`. Never hardcode it. Do not replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** Astro 7 (static output), TypeScript. Check `package.json` for versions.
- **Interactivity:** `.astro` components with vanilla `<script>` blocks. `@astrojs/vue` is installed but the site currently ships **zero Vue islands** — it is retained so the first island is a one-file change. Only reach for a Vue island when the component has genuinely reactive state that a class toggle and a plain script cannot express.
- **Styling:** Tailwind CSS 4, CSS-first via `src/styles/index.css` (`@theme` block) and the `@tailwindcss/vite` plugin. No `tailwind.config.ts`.
- **Icons:** `unplugin-icons` (lucide set via `@iconify-json/lucide`) in both `.astro` and `.vue` files.
- **State:** nanostores in `src/stores/`. Read directly via `.subscribe()`/`.get()` in inline scripts. `@nanostores/vue` is not installed; install it when the first Vue island that needs shared state is added.
- **Content:** Astro Content Collections (Zod-validated) over authored YAML. See "Content collection" below.
- **Routing:** Astro file-based routing + `getStaticPaths()`. Trailing slashes always.
- **Testing:** Playwright + `@axe-core/playwright` in `e2e/` (a11y + SEO/smoke/hydration/consent).
- **Hosting:** GitHub Pages. PR previews: `rossjrw/pr-preview-action`.
- **Node.js:** 26 (pinned in `.nvmrc`; `nvm use`).

---

## Conventions

### Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Astro components / pages | PascalCase files (components), kebab or `[param]` (pages) | `AdventureCard.astro`, `adventures/[id].astro` |
| Vue island components | PascalCase | `MyFeature.vue` (no islands exist yet; convention is ready) |
| nanostores | camelCase file, `$`-prefixed export | `stores/consent.ts` → `$consent` |
| Module-level constants | SCREAMING_SNAKE_CASE | `BRAND_NAME`, `DIFFICULTIES` |
| Route segments | kebab-case | `presentation-templates`, `handbook` |

### What lives where

- Adventure data is derived from the `adventures` content collection (`getCollection('adventures')`). Shared derivations go in `src/lib/` (e.g. `challenges.ts`, `adventure-derive.mjs`). Do not re-derive ad hoc in pages.
- Reusable markup belongs in `src/components/` (`.astro` for static, `.vue` for islands). Extract before the second copy appears.
- Retired URLs are handled by the `redirects` map in `astro.config.mjs`, not by page files.

---

## URLs and External Organisations

- The canonical domain is <https://offon.dev>. `og:url`, `og:image`, and all absolute URLs must use it.
- The `og:image` is `public/og.png` (<https://offon.dev/og.png>), 1200 x 630 px.
- PR previews are served from the gh-pages branch under `/pr-preview/pr-{number}/`.
- The open source challenges content lives at <https://github.com/off-on-dev/open-source-challenges> (intentional external link).
- The community Discourse instance is <https://community.offon.dev>. Use `COMMUNITY_URL` from `src/lib/site.ts`, never hardcode. Use `COMMUNITY_DISPLAY_NAME` for visible text.

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
  components/      # *.astro (static, zero-JS) and *.vue (reserved for islands)
  content.config.ts  # Content collection: Zod schema + custom loader + markdown rendering
  data/
    adventures/<id>/adventure.yaml + <level>-posts.json + leaderboard.json
    adventures/contributors.ts, types.ts
    solutions/<id>/<level>.ts (pre-built Solution objects), sponsors.ts, team.ts
  lib/            # markdown-pipeline.mjs, adventure-derive.mjs, community-data.ts,
                  # solutions.ts, challenges.ts, difficulty.ts, markdown.ts, utils.ts,
                  # site.ts (constants), level-constants.mjs, deadline.mjs
  stores/         # nanostores: consent.ts ($consent + gtag injector)
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
npm run test:unit    # Vitest unit tests (lib, stores) — fast, no server needed
npm run test:e2e     # Playwright (a11y + smoke). Requires `npm run build` first; `astro preview` serves the built dist/
npm run lint         # ESLint (astro/vue/ts)
npm run lint:reuse   # REUSE licence compliance (requires: pip install reuse)
rm -rf .astro        # Bust the content collection pipeline cache (after editing markdown-pipeline.mjs or adventure-derive.mjs)

# Regenerate downloadable presentation ZIPs and PPTX (run from repo root)
node .ai/templates/generate-reveal-zip.mjs   # -> public/downloads/offon-reveal-template.zip
# pptxgenjs is not in devDependencies. Install it locally first: npm install pptxgenjs
node .ai/templates/generate-pptx.mjs         # -> public/downloads/offon-deck-template.pptx
```

There is **no** content generator, `npm run generate`, or `*.generated.ts`. Routes and rendered prose come from the content collection at build time.

---

## Code Quality

- Explicit return types on functions and helpers.
- Keep components small and single-responsibility. Split a function that needs more than one level of conditional nesting.
- Prefer `const`; never `var`. Use async/await; handle errors explicitly.
- Never leave unused imports, variables, or dead code. Self-documenting code; comment only non-obvious logic.

---

## Stability Rules

- Never remove or rename existing exports without checking all usages first.
- Never change a component's props without updating all call sites.
- Never delete files without confirming they are unused.
- When refactoring, change one thing at a time. Do not mix refactors with feature changes.
- Always verify `npm run build` has no TypeScript errors after changes.
- Prefer extending existing components over rewriting them. Flag risky changes before proceeding.

---

## Debugging Rules

### Evidence rules

- Never claim a fix worked from source inspection alone. The only signal that counts is the expected behaviour observed in a real browser against the current build (`npm run build && npm run preview`).
- Before acting on any error, verify it came from the current build. Astro emits hashed asset names (`_astro/*.js`); a stale hash means the browser is serving cached code.
- Before acting on diagnostic output, state what evidence supports the conclusion.

### One-fix-at-a-time rule

- Never stack fixes. One change, rebuild, verify, then the next. Commit after every verified fix.
- If the same bug has been "fixed" more than once in a session and still reproduces, stop and go back to first principles.

### Server / cache rules

- Kill any stray `astro dev`/`astro preview` on port 4321 before running tests.
- If a build looks stale, `rm -rf dist .astro` and rebuild.

---

## TypeScript

- Use the `@/*` path alias for imports from `src/`: `import { BRAND_NAME } from "@/lib/site"`.
- Astro components declare props with `interface Props { ... }` and `Astro.props`. In plain `.ts` prefer `type` for object shapes.
- Avoid `any`; use `unknown` with narrowing. Never `@ts-ignore`. `tsconfig.json` extends `astro/tsconfigs/strict`.

---

## Components

- Static UI is a `.astro` component (zero JS shipped). For interactivity, default to a `.astro` component with a plain `<script>`. The site currently ships **zero islands**.
- Only reach for a **Vue island** when the component has genuinely reactive state that a class toggle and a small script cannot express. Hydrate with the lightest directive that works: `client:visible` / `client:idle` by default, `client:load` only for above-the-fold interactivity.
- **Frameworks: Vue, never React.** `@astrojs/vue` stays installed even while unused. Do not strip it.
- **Inline links in prose need `{" "}` around them.** Astro removes whitespace between text and an adjacent element when the source has a newline there.
- `.astro` components cannot be rendered inside a `.vue` island. If an island needs a badge/pill/icon, inline the markup.
- **Buttons:** raw `<button>` with the CSS utility classes in `src/styles/index.css` (`.btn-primary`, `.btn-ghost`, `.btn-soft`, `.btn-inverse`, `.btn-ghost-inverse`). No Button wrapper. See `styleguide.md`.
- **Touch targets (WCAG 2.5.8):** nav/footer links and any blockified interactive element must be at least 24x24 px. Nav links use `min-h-[44px]`, footer links `min-h-[48px]`.
- **Author prose is pre-rendered HTML.** Render with `set:html={value}` and the `md-inline` or `md-content` class, or via `<InlineProse html={...} />`. Never render `{value}` raw.
  - Inside an interactive element: call `stripLinks(html)` from `@/lib/markdown` first.
  - In a plain-text context (e.g. a meta attribute): call `stripHtml(html)` from `@/lib/markdown`.

### Script initialization

The site uses real page navigations — no SPA router. `<script>` modules re-execute fresh on every load. Initialize in `DOMContentLoaded`; no teardown pattern is needed. Prefer module-scope delegation on `document` (e.g. `ThemeToggle`) where one handler covers every instance across the page lifetime.

### Component CSS patterns

- `hero-badge` on the Hero pill; `logo-link` on the Navbar logo; `data-difficulty` on `DifficultyBadge`; `contributor-pill` / `contributor-pill-glow` on `ContributorBadge`.
- Footer nav group labels use `<p class="font-sans ... text-faint">`, not headings.
- `docs-ext-link` on all inline prose links site-wide. Do not add redundant `hover:*`/`inline-flex` utilities.

---

## Content Collection

Authored as YAML at `src/data/adventures/<id>/adventure.yaml`, loaded and validated by `src/content.config.ts`:

- **Custom loader** (not `glob()`): reads YAML with the `yaml` package (YAML 1.2 core). Astro's built-in glob YAML parser auto-casts unquoted ISO timestamps to `Date` objects, corrupting `deadline` fields.
- **Zod schema** mirrors the old JSON Schema (`.strict()` = fail on unknown fields). `npm run sync` runs it; invalid YAML fails the build.
- **Markdown fields** are rendered to sanitised HTML in the loader via `mdToInline`/`mdToBlock` from `src/lib/markdown-pipeline.mjs`. `astro:content` returns `entry.data` with HTML fields already rendered.
- **Field normalization** lives in `src/content.config.ts` + `src/lib/adventure-derive.mjs`.
- **Discussion + leaderboard** JSON is read at build time by `src/lib/community-data.ts`. No client fetch.
- **Solutions** are pre-built TS objects in `src/data/solutions/<id>/<level>.ts`, loaded via `import.meta.glob`. No generation step.
- **No runtime `fetch` in components.** All data is resolved at build time.

Adding an adventure requires only the YAML + per-level `*-posts.json` and registering the id in `ADVENTURE_CATEGORIES` (`scripts/refresh-leaderboard.mjs`). Routes appear automatically via `getStaticPaths()`.

---

## Styling

- Tailwind utilities directly on elements. Check the `@theme` block in `src/styles/index.css` before adding any colour/font/spacing/radius; never hardcode these.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`, `text-foreground`). Never add a `dark:` override without a base (light) style.
- Mobile first (`sm:`/`md:`/`lg:`). See `styleguide.md` for the type scale, component classes, and animations (source of truth).
- **Light mode overrides:** add unlayered rules to the "Light mode overrides" section at the bottom of `index.css`, scoped to `.light`.

### Design system rules

- Light mode uses `.light` on `<html>`, set by the inline pre-paint script in `Layout.astro` and by `ThemeToggle.astro`.
- Yellow `#ffc034` is accent-only in light mode; never a text colour.
- Dark mode uses `:root`/`.dark`. Never modify these when fixing light mode.

---

## Accessibility

Read [`ACCESSIBILITY.md`](ACCESSIBILITY.md) before writing or modifying any component. WCAG 2.2 AA is the floor, not the goal.

The `e2e/a11y.spec.ts` suite gates every representative route on axe (dark, light, and forced-colors), touch-target size, focus-ring visibility, and 200% zoom reflow. Never reduce the axe tag set `["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa","best-practice"]`. Add new routes to `PAGES` in `a11y.spec.ts` and `smoke.spec.ts`.

---

## Analytics and Consent

Google Analytics 4 with **Consent Mode v2 in gated-load mode**: no data of any kind is sent to Google until Accept; `gtag.js` is not loaded until then.

- **`Layout.astro`** contains the minimal inline `<head>` bootstrap: sets up `dataLayer`, defines `window.gtag`, and calls `gtag('consent','default',...)` with all four signals denied.
- **`src/stores/consent.ts`** owns the state (`$consent` atom, default `null`) and the `gtag.js` injector. Read via `.subscribe()`/`.get()` in inline scripts.
- **`src/components/ConsentBanner.astro`** is static markup plus a script that registers under `astro:page-load` and tears down under `astro:before-swap`.

### Do not

- Do not load `gtag.js` outside the injector.
- Do not put `gtag('js')`/`gtag('config')` in `Layout.astro`.
- Do not remove GPC detection (`navigator.globalPrivacyControl === true`).
- Do not push `page_view`/`click_event` when consent is not granted.

---

## Islands and Hydration Safety

These patterns produce hydration mismatches and console errors. Never introduce them.

- **An island's first client render must match its SSR output.** Read `localStorage`/`navigator`/the DOM in `onMounted`, not in `<script setup>` top level or as a `ref` initializer.
- **No non-deterministic values in a render body.** Build-time `.astro` frontmatter may use `new Date()`; Vue island templates must not.
- **After each client navigation** (`astro:after-swap`), `Layout.astro` re-asserts the `<html>` theme class.
- **Progressive enhancement:** core content must render server-side and work with JS disabled.

---

## SEO

Static site. Apply on every page.

- Every page: unique descriptive `<title>`, `<meta name="description">` under 160 chars, and canonical `${SITE_URL}${path}` (trailing slash). One `<h1>`; logical heading order.
- **Per-page meta comes from the `<SEO>` component** (`src/components/SEO.astro`), fed by `Layout.astro` props. Do not hand-write these in pages.
- Internal links use plain `<a href>` with **trailing slashes** and `import.meta.env.BASE_URL`.
- External links: `target="_blank" rel="noopener noreferrer" aria-describedby="new-tab-hint"`.
- Retire URLs via the `redirects` map in `astro.config.mjs`.
- Read [`PERFORMANCE.md`](PERFORMANCE.md) before adding a dependency, font, image, or route.

---

## Content and Copy

### Brand Name

- Always **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".
- "Open Ecosystem" is retired. Never use it.
- In code, use the `BRAND_NAME` constant from `src/lib/site.ts`.
- As a URL/href: `offon.dev` (lowercase). As a display name: `OffOn.dev`.

### Tone

- Direct, positive, community-focused. Plain language. Active voice. Short, scannable sentences.
- Never enumerate specific difficulty levels in UI copy.

### Capitalisation

UI labels use **title case (Chicago)**; body copy uses **sentence case**.

### Formatting

- Never use em dashes anywhere (comments and docs included). Use commas, periods, or restructure.

---

## Git

- Branch naming: `type/short-description` (e.g. `feat/hero-section`).
- All commits signed off: `git commit -s`.
- Never force-push to `main`. PR titles follow conventional commits.

---

## Site Maintenance

### Well-known files

- `public/.well-known/security.txt` `Expires` — update annually (current: `2027-06-01`).
- `public/llms.txt` / `llms-full.txt` — update when an adventure/level is added or a page renamed.
- `public/robots.txt` — named `User-agent` groups do not inherit `Disallow` from `*`; repeat `Disallow` in each group.
- `public/.well-known/agent-skills/offon/SKILL.md` — after editing, update the SHA256 `digest` in `index.json`.

### Sitemap

`/sitemap.xml` is generated at build time by `src/pages/sitemap.xml.ts`. When adding a new **static** page, add its path to the `staticPaths` array in that endpoint (except noindex pages).

### Routes

When adding a page, add it to `PAGES` in `e2e/a11y.spec.ts` and `ROUTES` in `e2e/smoke.spec.ts`, to the `staticPaths` array in `src/pages/sitemap.xml.ts`, and to the routes table in `README.md`.

### Adding an adventure or level

See [`ADVENTURES.md`](ADVENTURES.md). Add/extend the YAML, add per-level `*-posts.json`, register the id in `ADVENTURE_CATEGORIES`, and add the new URLs to the test route lists, `README.md`, and `public/llms.txt`.

---

## Deployment

- Push to `main` triggers `deploy.yml` → GitHub Pages via `JamesIves/github-pages-deploy-action`.
- Open PRs trigger `preview.yml`. The build outputs `dist/`; `JamesIves/github-pages-deploy-action@v4` publishes it to `gh-pages`.
- `trailingSlash: 'always'` matches GitHub Pages URL normalization.
- **PR previews** build with `VITE_BASE_PATH=/pr-preview/pr-N/`; `Layout.astro` marks these builds `noindex`.

### GitHub Actions allowlist

The `off-on-dev` org restricts third-party actions. Permitted: `actions/checkout`, `actions/cache`, `actions/setup-node`, `actions/create-github-app-token`, `JamesIves/github-pages-deploy-action`, `marocchino/sticky-pull-request-comment`, `rossjrw/pr-preview-action`, `fsfe/reuse-action`, actions owned by `off-on-dev`, actions created by GitHub, and Marketplace-verified actions. `withastro/action` and `actions/deploy-pages` are **NOT allowlisted**. Before adding a `uses:`, verify it is permitted.

---

## Before Submitting Code

State the result of each check explicitly before finishing.

1. **Content gate:** `npm run sync` passes (Zod schema over adventure YAML).
2. **Types:** `npm run check` (`astro check`) passes with zero errors.
3. **Lint:** `npm run lint` passes.
4. **REUSE lint:** `npm run lint:reuse` passes.
5. **Build:** `npm run build` completes with no errors.
6. **Unit tests:** `npm run test:unit` passes.
7. **e2e + a11y:** `npm run test:e2e` passes. Kill any stray server on port 4321 first.
8. **Re-read every file you changed;** verify the final state.
9. **Check call sites** for any changed prop/type/export.
10. **Verify at 375 / 768 / 1280px** against the production build (`npm run preview`).

### Red flags — stop and flag to the user

- A fix touches more than 3 files you did not plan to change; a type error needs a cast/suppression; the same bug is "fixed" more than once; a replacement is a silent no-op; a browser error shows a stale asset hash.

---

## Do Not

- Do not add a backend, API routes, or SSR (`output` stays `static`).
- Do not add external font or icon CDN links; all assets self-hosted.
- Do not change `base` handling without verifying GitHub Pages + PR-preview routing.
- Do not install a new dependency without checking an existing lib/primitive covers it.
- Do not commit secrets, tokens, or credentials.
- Do not change the `@theme` block in `src/styles/index.css` without verifying it doesn't break components.
- Do not edit adventure data types by hand; the YAML and the Zod schema are the source of truth.
- Do not add `@astrojs/react`, `react`, or `react-dom` — Vue is the island framework.

---

## When Suggesting Code

- Read `styleguide.md` before UI/copy/component changes.
- Flag accessibility concerns before writing code (read `ACCESSIBILITY.md`). Flag breaking changes explicitly.
- Prefer simple, readable solutions. If multiple approaches exist, state the tradeoff and recommend one.

---

## After Making Changes

A task is not done until the relevant docs are updated.

1. New/changed component, island, or utility? Update `styleguide.md`.
2. New/changed page or route? Update the routes table in `README.md` and the test route lists + sitemap.
3. New/changed constant or config value? Document it in `README.md`.
4. Changed a build/deploy/dev workflow? Update Commands in `CLAUDE.md` and `README.md`. Keep `AGENTS.md` in sync.

State which checks applied and what was updated (or why skipped).

---

## Implementation Rules

### Shared state

State consumed by more than one island lives in a **nanostore** (`src/stores/`), read via `.subscribe()`/`.get()` in inline scripts. When the first Vue island needing shared state is added, install `@nanostores/vue` and use `useStore` from it.

### File extensions

Static, zero-JS UI is `.astro`. Interactive islands are `.vue`. Pure logic is `.ts`/`.mjs`. Build-time-only pipeline modules are `.mjs`.

### State machines

Enumerate every transition before writing code. For each, list every system that must update (localStorage, store state, DOM, `gtag`/dataLayer). The consent machine table in `CLAUDE.md` is the reference.
