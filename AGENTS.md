# AGENTS.md

Guidance for AI coding agents working in this repository.

> **This is the canonical source for the project AI guidelines.** It is vendor-neutral and works with any AI assistant: paste it as a system prompt or load it into your tool's context.
>
> **Claude Code users:** you do not need to do anything. `CLAUDE.md` is auto-loaded and imports this file with `@AGENTS.md`, so you get everything here plus the Claude-specific slash-command table. Do not copy guidance into `CLAUDE.md`; it belongs here, where every tool can read it.

---

## AI Prompts for Contributors

Workflow-specific AI prompts live in [`.claude/commands/`](.claude/commands/). Any AI assistant can use them: paste the relevant file as a system prompt or opening message. The YAML frontmatter block at the top is harmless and can be ignored.

**Claude Code users:** invoke them as slash commands, `/command-name`. The same table with Claude-specific invocation notes is in [`CLAUDE.md`](CLAUDE.md).

| Prompt | File | When to use |
| --- | --- | --- |
| a11y-audit | [`.claude/commands/a11y-audit.md`](.claude/commands/a11y-audit.md) | On-demand accessibility audit using the Red Team / Blue Team persona pipeline. Run against a component or page to get a severity-weighted report. |
| &nbsp;&nbsp;keyboard | [`.claude/commands/keyboard.md`](.claude/commands/keyboard.md) | Sub-prompt: writing or reviewing any interactive element, such as buttons, modals, dropdowns, tabs, custom widgets. |
| &nbsp;&nbsp;navigation | [`.claude/commands/navigation.md`](.claude/commands/navigation.md) | Sub-prompt: working on nav components, such as primary nav, skip links, breadcrumbs, pagination, mobile menus. |
| &nbsp;&nbsp;progressive-enhancement | [`.claude/commands/progressive-enhancement.md`](.claude/commands/progressive-enhancement.md) | Sub-prompt: building any new feature or reviewing architecture. Ensures core content works without JS. |
| &nbsp;&nbsp;user-personalization | [`.claude/commands/user-personalization.md`](.claude/commands/user-personalization.md) | Sub-prompt: working on theme toggle, consent state, or any user preference persistence. |
| add-solution | [`.claude/commands/add-solution.md`](.claude/commands/add-solution.md) | Generate a structured TypeScript solution file (`src/data/solutions/<id>/<level>.ts`) from any input format (md, YAML, HTML, plain text). Downloads and converts images to WebP. Solutions are pre-built TS objects loaded by the app; there is no generator step. |
| create-presentation | [`.claude/commands/create-presentation.md`](.claude/commands/create-presentation.md) | Create a presentation deck for an OffOn event or challenge. Supports two formats: Reveal.js HTML (`public/deck-template/index.html`) and editable PowerPoint PPTX (edit and run `.ai/templates/generate-pptx.mjs`). Reveal.js output goes to `public/<event-slug>/index.html`; PPTX outputs to `public/downloads/offon-deck-template.pptx`. |

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

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts. It is fully static with no backend and no database. Pages are prerendered at build time by **Astro** (`output: 'static'`); interactivity is layered on as `.astro` components with vanilla `<script>` blocks.

> This project was migrated from React Router v8 to Astro + Vue. If you find a reference to `root.tsx`, `entry.server`, `src/routes.ts`, `routes.ts`, `react-router.config.ts`, `*.generated.ts`, `useConsent`, `useTheme`, `FilteredLevelCard.tsx`, `dist/client/`, or `scripts/generate-adventures.mjs`, it is stale and no longer exists. (`e2e/routes.ts` is live: it is the SMOKE_ROUTES / A11Y_PAGES source of truth.)

Community activity happens on a separate Discourse instance (display name **community.offon.dev**). Use the `COMMUNITY_URL` constant from `src/lib/site.ts`; never hardcode it. Do not replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** Astro 7 (static output), TypeScript. Check `package.json` for versions.
- **Interactivity:** `@astrojs/vue` is installed and ready for Vue 3 islands, but the site currently ships **zero islands**. All interactive surfaces are `.astro` components with vanilla `<script>` blocks. Adding the first island is a one-file change. Shared store state uses **nanostores** (`src/stores/`), read directly via `.subscribe()`/`.get()` in inline scripts, not via `@nanostores/vue` (which is not installed; add it when the first Vue island needing shared state is created).
- **Styling:** Tailwind CSS 4, CSS-first via `src/styles/index.css` (`@theme` block) and the `@tailwindcss/vite` plugin. No `tailwind.config.ts`.
- **Icons:** `unplugin-icons` (lucide set via `@iconify-json/lucide`) in both `.astro` and `.vue` islands.
- **UI primitives:** No shared component library. The abbreviation tooltip is a plain JS portal in `Layout.astro` (position:fixed, escapes overflow clipping). There is no shadcn or Reka UI surface.
- **Content:** Astro Content Collections (Zod-validated) over authored YAML. See "Content collection".
- **Routing:** Astro file-based routing + `getStaticPaths()`. Trailing slashes always.
- **Testing:** Playwright + `@axe-core/playwright` in `e2e/` (a11y + SEO/smoke/hydration/consent).
- **Hosting:** GitHub Pages. **PR previews:** `rossjrw/pr-preview-action`.
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
                  # skip-nav, Navbar, <slot/>, Footer, ConsentBanner
  components/      # *.astro (static, zero-JS) and *.vue (islands)
  content.config.ts  # Content collection: Zod schema + custom loader + markdown rendering
  data/
    adventures/<id>/adventure.yaml + <level>-posts.json + leaderboard.json
    adventures/contributors.ts, types.ts
    solutions/<id>/<level>.ts (pre-built Solution objects), sponsors.ts, team.ts
  lib/            # markdown-pipeline.mjs, adventure-derive.mjs, community-data.ts,
                  # solutions.ts, challenges.ts, difficulty.ts, markdown.ts, utils.ts,
                  # site.ts (constants), level-constants.mjs, deadline.mjs,
                  # adventure-icons.ts, lucide-icons.ts, structured-data.ts
  stores/         # nanostores: consent.ts ($consent + gtag injector)
  styles/index.css  # Tailwind @theme, component classes, light-mode overrides
  assets/diagrams/  # Architecture SVGs (imported per-level via import.meta.glob)
e2e/
  a11y.spec.ts              # axe (dark/light/forced-colors) + touch targets + focus rings + zoom
  smoke.spec.ts             # per-route title/canonical/OG/h1 + island hydration
  consent.spec.ts           # consent state machine + page_view accounting
  consent-ui.spec.ts        # ConsentBanner visibility and focus management
  theme-toggle.spec.ts      # ThemeToggle SSR correctness and persistence
  mobile-menu.spec.ts       # focus trap, ESC, restore
  challenges-filter.spec.ts # radiogroup keyboard, URL sync
  challenges-filter-deep.spec.ts  # filter combinations and deep-link
  btn-primary-contrast.spec.ts    # WCAG 1.4.11 boundary for primary/ghost/secondary
  solution-hashchange.spec.ts     # step hashchange listener lifecycle
  starter-nudge.spec.ts     # nudge rendering and dismiss persistence
  inline-spacing.spec.ts    # whitespace around inline links in prose
  brand-toc.spec.ts         # /brand/ TOC keyboard navigation
  hero-cta.spec.ts          # hero CTA target and text
  budget.spec.ts            # /adventures/ page budget display
  avatar-fallback.spec.ts   # community avatar error handling
  route-coverage.spec.ts    # every route returns 200 and has a canonical
  visual.spec.ts            # VRT baselines (local-only; excluded from CI)
  routes.ts                 # shared SMOKE_ROUTES map
  teardown.ts               # global teardown (server stop)
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
npm run sync         # astro sync, runs the Zod content schema; fails on invalid adventure YAML
npm run check        # astro check (TypeScript). Gated in CI.
npm run lint         # ESLint (astro/vue/ts)
npm run test:unit    # Vitest unit tests (lib, stores, Vue components). Fast, no server needed
npm run test:e2e     # Playwright (a11y + smoke). Requires `npm run build` first; runs e2e/static-server.mjs internally
npm run lint:reuse   # REUSE licence compliance (requires: pip install reuse)  [if present]
rm -rf .astro        # Bust the content collection pipeline cache. The loader's digest is keyed
                     # on YAML content, so editing markdown-pipeline.mjs or adventure-derive.mjs
                     # does NOT invalidate cached entries; unchanged adventures are served from
                     # the store without re-rendering. Always run this after editing the pipeline.
                     #
                     # Always follow it with `npm run sync` before `npm run check`. A bare
                     # `astro check` against a stale or missing .astro/types.d.ts reports the
                     # collection as `never` and floods the output with phantom errors
                     # ("Property 'contributor' does not exist on type 'never'", 150+ of them).
                     # Nothing is wrong with the code; re-run `npm run sync` and re-check.
                     # Local-only: CI always sequences sync before check.

# Regenerate downloadable presentation ZIPs and PPTX (run from repo root)
# jszip is a devDependency, so this runs after a plain `npm ci`. reveal.js itself
# is not needed: the deck assets come from the committed public/reveal/.
node .ai/templates/generate-reveal-zip.mjs   # -> public/downloads/offon-reveal-template.zip
# pptxgenjs is not in devDependencies (not needed in CI). Install it locally first:
#   npm install pptxgenjs
node .ai/templates/generate-pptx.mjs         # -> public/downloads/offon-deck-template.pptx
```

There is **no** content generator, `npm run generate`, or `*.generated.ts`. Routes and rendered prose come from the content collection at build time.

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
- When a grep claims to confirm something, verify the pattern excludes false positives. `::after` and other pseudo-elements are invisible to `querySelectorAll('*')`, so layout/overflow bugs can hide there. A grep that returns nothing also needs its exit path checked: a shell that ate the glob reports "no matches" identically to a genuine absence.

### One-fix-at-a-time rule

- Never stack fixes. One change, rebuild, verify, then the next. Commit after every verified fix.
- If the same bug has been "fixed" more than once in a session and still reproduces, stop and go back to first principles.

### Server / cache rules

- Playwright's webServer uses `reuseExistingServer: false`; kill any stray `astro dev` on port 4321 before running tests (a lingering dev server has the dev toolbar, which fails focus-ring tests). The e2e suite uses a plain foreground Node.js static server (`node e2e/static-server.mjs`), not `astro preview`, so there is no daemon to stop between runs.
- If a build looks stale, `rm -rf dist .astro` and rebuild.

---

## TypeScript

- Use the `@/*` path alias for imports from `src/`: `import { BRAND_NAME } from "@/lib/site"`.
- Astro components declare props with `interface Props { ... }` and `Astro.props`. In plain `.ts` prefer `type` for object shapes.
- Avoid `any`; use `unknown` with narrowing. Never `@ts-ignore`. `tsconfig.json` extends `astro/tsconfigs/strict`.

---

## Components

- Static UI is a `.astro` component (zero JS shipped). For interactivity, default to a `.astro` component with a plain `<script>`; the site currently ships **zero islands**. Only reach for a **Vue island** when the component has genuinely reactive state that a class toggle and a small script cannot express, and hydrate it with the lightest directive that works: `client:visible` / `client:idle` by default, `client:load` only for above-the-fold interactivity (protects the Lighthouse baseline).
- **Frameworks: Vue, never React.** `@astrojs/vue` and its toolchain stay installed even while unused, so adding an island is a one-file change. Do not strip them as unused dependencies.
- **Navigation model: real page loads, no SPA router.** The site does not use `<ClientRouter />`. Every in-site link triggers a full browser navigation. `<script>` modules re-execute fresh on each load, so there is no listener accumulation across pages. Initialize in `DOMContentLoaded` (fires once per load); no teardown or `astro:page-load` / `astro:before-swap` listeners are needed or correct. Prefer module-scope delegation on `document` (e.g. `ThemeToggle`) where one handler covers every instance.
- **Inline links in prose need `{" "}` around them.** Astro removes the whitespace between text and an adjacent element when the source has a newline there. `e2e/inline-spacing.spec.ts` guards this.
- `.astro` components cannot be rendered inside a `.vue` island. If an island needs a badge/pill/icon, inline the markup and use `lucide-vue-next`.
- **Buttons:** raw `<button>` with the CSS utility classes in `src/styles/index.css` (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-soft`, `.btn-inverse`, `.btn-ghost-inverse`). No Button wrapper. See `styleguide.md`.
- **Touch targets (WCAG 2.5.8):** nav/footer links and any blockified interactive element must be at least 24x24 px. Nav links use `min-h-[44px]`, footer links `min-h-[48px]`.
- **Author-controlled prose is pre-rendered, sanitised HTML.** The content collection converts author markdown fields (`level.audience`, `tool.description`, `step.title`, `step.content`, `contributor.about`, `rewards.eligibility`, `tier.description`, `rewards.rankingNote`, `level.learnings`, `level.objective`, `level.intro`, `level.backstory`, `level.scenario`, `level.architecture`, `adventure.story`, `adventure.backstory`) to sanitised HTML at build time via `src/lib/markdown-pipeline.mjs`. Render with `set:html={value}` and the `md-inline` (inline) or `md-content` (block) class, via `<InlineProse html={...} />`, which picks the wrapper automatically. Never render `{value}` raw.
  - **Inside an interactive element** (a link card or button): call `stripLinks(html)` from `@/lib/markdown` first, to avoid nested `<a>`/`<button>`.
  - **Into a plain-text context** (e.g. a meta attribute): call `stripHtml(html)` from `@/lib/markdown` (strips tags and decodes entities).
  - `adventure.story` is rendered plain in card views (`stripHtml`) to keep card markup light.
  - The markdown packages (`unified`, `remark-*`, `rehype-*`) are used only by `src/lib/markdown-pipeline.mjs` at build time. Do not import them in pages/components.

### Component CSS patterns

- `hero-badge` on the Hero pill; `logo-link` on the Navbar logo (excludes it from nav-link hover); `data-difficulty` on `DifficultyBadge`; `contributor-pill` / `contributor-pill-glow` on `ContributorPill`.
- Footer nav group labels ("explore", "community") use `<p class="font-sans ... text-faint">`, not headings (they would create spurious document-outline entries). Source text is lowercase (CSS uppercases).
- `docs-ext-link` on all inline prose links site-wide (bundles inline-flex, underline, focus ring, and light/dark colour handling). Links inside pre-rendered adventure HTML use the `.md-inline a` / `.md-content a` rules in `index.css`. Do not add redundant `hover:*`/`inline-flex` utilities.

---

## Content collection

Authored as YAML at `src/data/adventures/<id>/adventure.yaml`, loaded and validated by `src/content.config.ts`:

- **Custom loader** (not `glob()`): reads the YAML with the `yaml` package. Astro's built-in glob YAML parser auto-casts unquoted ISO timestamps to `Date` objects, corrupting `deadline` fields; the `yaml` package (YAML 1.2 core) keeps them as strings. Digest-gated.
- **Zod schema** mirrors the old JSON Schema (`.strict()` = fail on unknown fields). `npm run sync` runs it; invalid YAML fails the build.
- **Markdown fields** are rendered to sanitised HTML in the loader via `mdToInline`/`mdToBlock` (`src/lib/markdown-pipeline.mjs`, which preserves the original abbr-tooltip expansion, external-link annotation, and `rehype-sanitize` posture). `astro:content` returns `entry.data` with HTML fields already rendered.
- **Field normalization** (title/name, story/backstory[0], icon/emoji, difficulty/emoji, learnings aliases, codespacesUrl, discussionUrl, deadline, rewards defaults, meta descriptions, services→step injection) lives in `src/content.config.ts` + `src/lib/adventure-derive.mjs`.
- **Discussion + leaderboard** JSON (`<level>-posts.json`, `leaderboard.json`) is read at build time by `src/lib/community-data.ts` (node `fs`, resolved from `process.cwd()`). These render statically, no client fetch. Refreshed hourly by `refresh-community-data.yml`, which validates the result against the build's own schemas before committing (`scripts/validate-refreshed-data.mjs`).
- **Solutions** are pre-built TS objects in `src/data/solutions/<id>/<level>.ts`, loaded via `import.meta.glob` in `src/lib/solutions.ts`. No generation.
- **No runtime `fetch` in components.** All data is resolved at build time.

Adding an adventure requires only the YAML + per-level `*-posts.json`, with `community_category_id` set in the YAML. There is no registry constant to edit: `buildAdventureCategories()` in `scripts/refresh-leaderboard.mjs` derives the adventure list by reading `community_category_id` out of every `adventure.yaml` at runtime. Routes appear automatically via `getStaticPaths()`.

---

## Styling

- Tailwind utilities directly on elements. Check the `@theme` block in `src/styles/index.css` before adding any colour/font/spacing/radius; never hardcode these.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`, `text-foreground`). Never add a `dark:` override without a base (light) style.
- Mobile first (`sm:`/`md:`/`lg:`). See `styleguide.md` for the type scale, component classes, and animations (source of truth).
- **Light mode overrides:** add unlayered rules to the "Light mode overrides" section at the bottom of `index.css`, scoped to `.light` (rules in `@layer base` are overridden by `@layer utilities`).

### Design system rules

- Light mode uses `.light` on `<html>`, set by the inline pre-paint script in `Layout.astro` and by `ThemeToggle.astro`'s delegated click handler (localStorage key `theme`). `ThemeToggle` is static markup: CSS picks the icon and the sr-only accessible name off the `.dark` class, so it is correct before any JS runs.
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
- **`src/stores/consent.ts`** owns the state (a plain nanostore `$consent`, default `null`, so island SSR matches hydration) and the `gtag.js` injector. The injector is shared by Accept and the mount-restore path, gated by a module-scoped `gtagScriptInjected` boolean. On Accept it pushes `consent update` + `js` + `config` synchronously **before** appending the script tag. `config` passes `cookie_flags: 'SameSite=Lax;Secure'` and `cookie_expires: 15552000`; GA4 auto-fires one `page_view` per load from this call. The stored format (`{value, timestamp}` + 180-day expiry, key `analytics_consent`) is preserved from the React app.
- **`src/components/ConsentBanner.astro`** is static markup plus one script: both states are rendered `hidden` and the script reveals whichever matches `$consent`. Keeps `aria-live="polite" aria-atomic="true"`. It calls `initConsent()` (GPC + restore) and moves focus only from the click handlers, never from the subscription. `trackClicks` lives in its own script in `Layout.astro`, independent of this component.

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

## Islands and Hydration Safety

These patterns produce hydration mismatches and console errors. Never introduce them.

- **An island's first client render must match its SSR output.** SSR runs with default state (`null` consent). Read `localStorage`/`navigator`/the DOM in `onMounted`, then update reactive state, never in `<script setup>` top level or as a `ref` initializer. `$consent` is a plain atom (default `null`); once `@nanostores/vue` is installed, it is safe to read via `useStore` since server and first-client render agree. Theme is not an island at all: `ThemeToggle.astro` renders both states and lets CSS choose off the `<html>` class, which sidesteps the mismatch rather than working around it.
- **No non-deterministic values in a render body.** Build-time `.astro` frontmatter may use `new Date()` (it runs on the server); Vue island templates must not.
- Prefer SSR islands (`client:visible`/`idle`/`load`); `client:load` only for above-the-fold interactivity. The global chrome is plain `.astro` plus scripts: no islands, no hydration directives.
- **Theme class on every load:** the inline pre-paint script in `<head>` sets the `<html>` class before first paint; no post-navigation re-assertion is needed or correct.
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

- **Title case:** button/CTA labels, section headings (h2/h3), card/value titles, nav and footer links, pill/badge text. Capitalise every word except articles, prepositions under five letters, and coordinating conjunctions, unless they open or close the label.
- **Sentence case:** body paragraphs, meta descriptions, `<p>` text, hero sub-headings, card descriptions.
- **Exception:** overline labels use CSS `text-transform: uppercase`, so write source text lowercase.

### Formatting

- Never use em dashes anywhere (comments and docs included). Use commas, periods, or restructure.
- Keep tone cohesive; do not mix formal and casual registers within a page.

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

- `public/.well-known/security.txt` `Expires`, update annually (current: `2027-06-01`).
- `public/llms.txt` / `llms-full.txt`, update when an adventure/level is added or a page renamed.
- `public/robots.txt`, named `User-agent` groups do not inherit `Disallow` from `*`; repeat `Disallow` in each group. Must include `Sitemap: https://offon.dev/sitemap.xml`.
- `public/.well-known/agent-skills/offon/SKILL.md`, after editing update the SHA256 `digest` in `index.json`.

### Sitemap

- `/sitemap.xml` is generated at build time by `src/pages/sitemap.xml.ts` from `getCollection()` + the static route list. Adventure, level, solution, and challenge-tag URLs are automatic. When adding a new **static** page, add its path to the `staticPaths` array in that endpoint (unless it is noindex; `/privacy/` and `/presentation-templates/` are excluded).

### Routes

- Routes come from file-based pages and `getStaticPaths()`. There is no prerender array to maintain. When adding a page, add it to `PAGES` in `e2e/a11y.spec.ts` and `ROUTES` in `e2e/smoke.spec.ts` (with the expected title), to the `staticPaths` array in `src/pages/sitemap.xml.ts` (except `/privacy/` and `/presentation-templates/`), and to the routes table in `README.md`.

### Adding an adventure or level

See [`ADVENTURES.md`](ADVENTURES.md). In brief: add/extend the YAML at `src/data/adventures/<id>/adventure.yaml`, add each level's `*-posts.json`, set `community_category_id` in the YAML (the leaderboard registry derives from it; there is no constant to edit), and add the new URLs to the test route lists, `README.md`, and `public/llms.txt`. Adventure/level/solution URLs are auto-derived in `src/pages/sitemap.xml.ts` from `getCollection()`, so no manual sitemap edit is needed. Routes generate automatically.

---

## Deployment

- Push to `main` triggers `deploy.yml` → GitHub Pages. Open PRs trigger `preview.yml`.
- The build outputs `dist/`; `JamesIves/github-pages-deploy-action` publishes it to `gh-pages`. Astro emits `dist/404.html` natively.
- `trailingSlash: 'always'` matches GitHub Pages URL normalization (no `_.data` alias handling needed).
- **PR previews** build with `VITE_BASE_PATH=/pr-preview/pr-N/` (→ Astro `base`); the whole `dist/` is the preview source (public assets are copied into `dist/` automatically, so there is no per-directory copy step). `Layout.astro` marks `/pr-preview/` builds `noindex`.

### GitHub Actions allowlist

The `off-on-dev` org restricts third-party actions. Permitted: `actions/checkout`, `actions/cache`, `actions/setup-node`, `actions/create-github-app-token`, `JamesIves/github-pages-deploy-action`, `marocchino/sticky-pull-request-comment`, `rossjrw/pr-preview-action`, `fsfe/reuse-action`, actions owned by `off-on-dev`, actions created by GitHub, and Marketplace-verified actions. **The official `withastro/action` and `actions/deploy-pages` are NOT allowlisted**, keep the JamesIves deploy flow. Before adding a `uses:`, verify it is permitted or use `gh`/shell.

### Workflow convention: scripts/ require npm ci

Any workflow job that invokes a script under `scripts/` via `node scripts/*.mjs` must run `npm ci` immediately after `setup-node`, before the first script step:

```yaml
- uses: actions/setup-node@v7
  with:
    node-version-file: ".nvmrc"
    cache: "npm"

- name: Install dependencies
  run: npm ci
```

This is unconditional, even when the script currently uses only Node built-ins. Scripts acquire package imports over time; a workflow that skips `npm ci` breaks silently on the next scheduled run. With `cache: "npm"` a clean install takes a few seconds.

---

## Before Submitting Code

State the result of each check explicitly before finishing.

1. **Content gate:** `npm run sync` passes (Zod schema over adventure YAML).
2. **Types:** `npm run check` (`astro check`) passes with zero errors. Gated in CI.
3. **Lint:** `npm run lint` passes (ESLint for astro/vue/ts; `typescript` is pinned to 6.x because typescript-eslint does not support TS 7 yet).
4. **REUSE lint:** `npm run lint:reuse` (or `reuse lint`) passes. `.astro`/`.vue` are covered by globs in `REUSE.toml`.
5. **Build:** `npm run build` completes with no errors.
6. **Unit tests:** `npm run test:unit` passes. Tests live in `src/test/` (lib, stores, scripts).
7. **e2e + a11y:** `npm run test:e2e` passes. The axe audit runs the full WCAG tag set in dark and light. Kill any stray server on port 4321 first. Manual persona testing (ACCESSIBILITY.md) is still required.
8. **Re-read every file you changed;** verify the final state.
9. **Check call sites** for any changed prop/type/export. **Check imports** resolve; no unused imports.
10. **Verify at 375 / 768 / 1280px** against the production build (`npm run preview`), not the dev server.
11. If the change adds/modifies adventure levels, verify a per-level `*-posts.json` exists.

### Red flags, stop and flag to the user

- A fix touches more than 3 files you did not plan to change; a type error needs a cast/suppression; the same bug is "fixed" more than once; a replacement is a silent no-op; a browser error shows a stale asset hash.

---

## Do Not

- Do not add a backend, API routes, or SSR (`output` stays `static`).
- Do not add external font or icon CDN links; all assets self-hosted.
- Do not change `base` handling without verifying GitHub Pages + PR-preview routing.
- Do not install a new dependency without checking an existing lib/primitive covers it.
- Do not commit secrets, tokens, or credentials.
- Do not change the `@theme` block in `src/styles/index.css` without verifying it doesn't break components.
- Do not edit the copied data types by hand expecting a generator to reconcile; there is no generator, the YAML and the Zod schema are the source of truth.
- Do not add `@astrojs/react`, `react`, or `react-dom`. Vue is the island framework.

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
4. Changed a build/deploy/dev workflow? Update the Commands section in this file and in `README.md`.

Project guidance lives in this file only. `CLAUDE.md` imports it with `@AGENTS.md` and adds nothing but the Claude-specific slash-command table, so there is no second copy to keep in sync. Do not reintroduce one.

State which checks applied and what was updated (or why skipped).

---

## Implementation Rules

### Shared state

State consumed by more than one component lives in a **nanostore** (`src/stores/`). In `.astro` inline scripts, read the store directly via `.subscribe(callback)` or `.get()`. When the first Vue island needing shared state is created, install `@nanostores/vue` and use its `useStore` composable inside the island.

Do not duplicate cross-island state in component refs.

### File extensions

Static, zero-JS UI is `.astro`. Interactive islands are `.vue`. Pure logic is `.ts`/`.mjs`. Build-time-only pipeline modules are `.mjs`.

### State machines

Enumerate every transition before writing code. For each, list every system that must update (localStorage, store state, DOM, `gtag`/dataLayer). The consent machine table in the Analytics and Consent section above is the reference.

---

## Known follow-ups (post-migration)

No open cleanups. (Done: Shiki dual-theme syntax highlighting for code blocks, lint, sitemap endpoint, consent runtime tests `e2e/consent.spec.ts`, gated click-event tracking, the full React-parity restoration of the home/adventures/challenges pages + nav/footer chrome, the code-block header + Copy button, the abbr JS tooltip, a `position:fixed` portal in `Layout.astro` that clamps to the viewport and escapes overflow clipping, and the full component-by-component `styleguide.md` rewrite with verified prop types.)
