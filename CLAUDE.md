# CLAUDE.md

Guidance for AI coding agents working in this repository.

---

## Project Skills

Project-level Claude Code skills live in `.claude/skills/`. Invoke them with `/skill-name` in Claude Code. These are committed to the repo and available to all contributors.

| Skill | When to use |
|---|---|
| `/a11y-audit` | On-demand accessibility audit using the Red Team / Blue Team persona pipeline. Run against a component or page to get a severity-weighted report. Invokes sub-skills below as needed. |
| &nbsp;&nbsp;`/keyboard` | Sub-skill: writing or reviewing any interactive element — buttons, modals, dropdowns, tabs, custom widgets. |
| &nbsp;&nbsp;`/navigation` | Sub-skill: working on nav components — primary nav, skip links, breadcrumbs, pagination, mobile menus. |
| &nbsp;&nbsp;`/progressive-enhancement` | Sub-skill: building any new feature or reviewing architecture. Ensures core content works without JS. |
| &nbsp;&nbsp;`/user-personalization` | Sub-skill: working on theme toggle, consent state, or any user preference persistence. |

The `spec-first-coding` skill is installed globally (`~/.claude/skills/`) and is not in this repo. It enforces W3C spec citations before generating any accessibility-related code.

Use `/a11y-audit` for all accessibility audits in this repo. The four sub-skills can also be invoked directly when working in their specific domain.

---

## Icons

- Always use **lucide-react** for all icons. Do not add any other icon library.
- Decorative icons next to visible text: `aria-hidden="true"`, no `aria-label`.
- Icon-only interactive elements: add `aria-label` to the parent element, do not use `aria-hidden`.
- When placing an icon next to text in a link or button, always add `inline-flex items-center gap-1` to the container. A lone icon inside a plain `inline` element drops below the text baseline.
- See the Icons section of `styleguide.md` for the full icon map, size conventions, and current usage.
- **Brand/social icon exception:** Official brand SVGs (e.g. the LinkedIn "in" mark) are exempt from the lucide-react-only rule when no equivalent exists in lucide-react. Place the SVG inline, set `aria-hidden="true"` on the `<svg>` element, and put `aria-label` on the parent interactive element. Use `fill="currentColor"` so hover and theme color changes apply. Document every brand SVG addition in the Icon map table in `styleguide.md`. Current exceptions: LinkedIn icon in `Footer.tsx`.

---

## Project Overview

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts.
It is fully static with no backend and no database. Pages are prerendered at build time using React Router v7 framework mode (`ssr: false`).

Community activity happens on a separate Discourse instance. Its display name is **community.offon.dev**, but the real URL is managed via the `COMMUNITY_URL` constant in `src/data/constants.ts`. Do not hardcode it. Do not attempt to replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** React 19 with TypeScript, bundled via Vite. Check `package.json` for current versions.
- **Styling:** Tailwind CSS 4, configured CSS-first via `src/index.css` (`@theme` block). There is no `tailwind.config.ts`; it was deleted as part of the Tailwind 4 migration.
- **Components:** Minimal shadcn/ui surface. `src/components/ui/` contains only `badge.tsx` and `tooltip.tsx`. Most Radix UI packages were intentionally removed.
- **Routing:** React Router v7 framework mode (static prerendering with `ssr: false`)
- **Testing:** Vitest + @testing-library/react (unit/component); Playwright (smoke tests in `e2e/`)
- **Hosting:** GitHub Pages
- **PR previews:** pr-preview-action
- **Node.js:** 24 is required. Version is pinned in `.nvmrc`. Run `nvm use` to switch automatically.

---

## Conventions

### Naming

| Thing | Convention | Example |
|---|---|---|
| Component files and exports | PascalCase | `FilteredLevelCard.tsx`, `export const FilteredLevelCard` |
| Hook files and exports | camelCase, `use` prefix | `useTheme.tsx`, `export function useTheme` |
| Module-level constants from static data | SCREAMING_SNAKE_CASE | `ADVENTURES`, `ALL_TAGS` |
| Route segments | kebab-case | `community-guide`, `adventure-detail` |

### What lives where

- Logic derived from `ADVENTURES` belongs in `src/data/adventures/index.ts`, exported, and imported everywhere. Do not re-derive it in component files.
- Reusable card or list markup belongs in `src/components/`, not duplicated inline. Extract before the second copy appears.
- Redirect routes that share a destination share a single file in `src/pages/redirects/`. The filename describes the destination, not the source (e.g. `HandbookRedirect.tsx`).

---

## URLs and External Organisations

- The canonical domain for this site is https://offon.dev.
- og:url, og:image, and all absolute URLs must use https://offon.dev.
- The og:image file is public/og.png and its full URL is https://offon.dev/og.png.
- PR preview deployments are served from the gh-pages branch under /pr-preview/pr-{number}/.
- The open source challenges content lives in a separate organisation at https://github.com/off-on-dev/open-source-challenges. This is an intentional external link and must never be changed or flagged as a violation.
- The community Discourse instance is at https://community.offon.dev. Use the `COMMUNITY_URL` constant from `src/data/constants.ts`, never hardcode this URL.
- `COMMUNITY_DISPLAY_NAME` is defined in `src/data/constants.ts` as the user-facing display name for the community URL. Use it for visible text, use `COMMUNITY_URL` for href attributes.

---

## Repository Layout

```
src/
  components/   # Reusable UI components (named exports, PascalCase files)
  pages/        # Route-level page components
  data/         # Static data files (TypeScript objects/arrays)
  hooks/        # Custom React hooks
  lib/          # Shared utilities
  assets/       # Static assets bundled by Vite
  Layout.tsx    # App shell: providers, skip nav, scroll-to-top, consent banner, and Outlet
e2e/
  smoke.spec.ts # Playwright smoke tests (requires npm run build first)
public/
  fonts/        # Self-hosted fonts (Inter, Syne, JetBrains Mono)
.github/
  workflows/
    deploy.yml                    # Production deploy to GitHub Pages (push to main)
    preview.yml                   # PR preview deploy (runs smoke tests before deploying)
    refresh-community-data.yml    # Hourly discussion and leaderboard data refresh
    refresh-community-sitemap.yml # Daily community sitemap regeneration
    sync-adventure.yml            # workflow_dispatch: sync an adventure from the challenges repo
    validate-adventures.yml       # PR check: validates adventure YAML, routes, and sitemap consistency
    validate-docs.yml             # PR check: ensures styleguide.md/README.md updated with code changes
    add-discussion-url.yml        # workflow_dispatch: set discussionUrl for a level and fetch initial posts
```

---

## Commands

```sh
nvm use              # Switch to Node 24 (required)
npm run dev          # Start local dev server (http://localhost:8080)
npm run build        # Production SSG build (React Router v7) -> dist/client/
npm run build:dev    # Dev-mode build
npm run lint         # ESLint
npm test             # Run tests once (Vitest)
npm run test:watch   # Tests in watch mode
npm run test:coverage  # Run tests with v8 coverage (uses @vitest/coverage-v8)
npm run test:e2e     # Playwright smoke tests (requires npm run build first)
npm run test:visual  # Visual regression tests (requires npm run build first)
npm run test:visual:update  # Update visual baseline screenshots
npm run preview      # Copy 404 fallback and serve the production build locally
npm run generate     # Regenerate TypeScript from adventure YAML files
npm run generate:validate  # Validate YAML against schema without writing files

npx shadcn@latest add <component>   # Add a shadcn/ui component
```

---

## Code Quality

- Use explicit return types on all functions and components.
- Prefer named exports for components.
- Keep components small and single-responsibility.
- Functions must have a single responsibility. If a function requires more than one level of conditional nesting to describe in plain language, split it.
- Use functional components with hooks only. No class components.
- Prefer `const` over `let`, never `var`.
- Use async/await over promise chains. Always handle errors explicitly.
- Never leave unused imports, variables, or dead code.
- Write self-documenting code. Add comments only for non-obvious logic.

---

## Stability Rules

- Never remove or rename existing exports without checking all usages first.
- Never change a component's props interface without updating all call sites.
- Never delete files without confirming they are unused.
- When refactoring, change one thing at a time. Do not mix refactors with feature changes.
- Always verify no TypeScript errors after making changes.
- Prefer extending existing components over rewriting them.
- If a change could break something, flag it explicitly before proceeding.

---

## Debugging Rules

When diagnosing a bug, especially in the production build, follow these rules without exception. They exist to prevent debugging by accumulation.

### Evidence rules

- Never claim a fix worked based on source inspection alone. The only signal that counts is the expected behavior observed in a real browser against the current bundle hash.
- Before acting on any error message, verify the error came from the current build. Compare the bundle hash in the error stack trace (e.g. `index-XXXX.js`) against the latest build output. If they differ, the browser is serving cached code and the error is stale.
- Before acting on any diagnostic output, state what evidence supports the conclusion. "Only X was left in the DOM" is not evidence of what the DOM looked like at error time. React's error recovery can tear down the tree before the diagnostic runs.
- When a grep claims to confirm something, verify the grep pattern is specific enough to exclude false positives. Strings like "hydrateRoot" exist in production React too, so their presence proves nothing about whether the build is minified.

### One-fix-at-a-time rule

- Never stack fixes. One change, rebuild, verify in a real browser, then the next. If you apply two fixes before verifying, you cannot tell which one worked or if either did.
- Commit after every verified fix. Each commit should have a clear before/after.
- If the same bug has been "fixed" more than once in a session and still reproduces, stop. The diagnosis is wrong. Go back to first principles.

### Build cache rules

- Always run `rm -rf dist node_modules/.vite` before any rebuild you intend to verify against. Vite's cache can silently produce stale output.
- After rebuilding, always compare the new bundle hash to the previous one. If the hash is identical, the cache was reused. Clear it and rebuild.

### Getting unminified React errors

- The `--mode development` flag alone does not produce a dev React build with Vite's React plugin. Proof: a dev React bundle is roughly 1.4 MB; a production bundle is roughly 330 KB.
- To force a dev React build, add to vite.config.ts inside defineConfig:
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    build: { minify: false, sourcemap: true }
- Verify the dev build actually happened: `ls -lh dist/assets/index-*.js`. Size should be ~1.4 MB, not ~330 KB.
- Revert this change before merging to main.

---

## TypeScript

- `noImplicitAny: false` and `strictNullChecks: false` are intentional. Do not change them.
- Avoid `any` in new code. Use proper types or `unknown` with narrowing.
- Never use `@ts-ignore`.
- Use `@/*` path alias for all imports from `src/`: e.g. `import { cn } from "@/lib/utils"`.
- Prefer `type` over `interface` for object shapes.

---

## Components

- Always check `src/components/ui/` before building a new primitive.
- `src/components/ui/` contains two files: `badge.tsx` and `tooltip.tsx`. Adding a new shadcn component requires an immediate use case in the same PR. Unused components are removed. To add one: `npx shadcn@latest add <component>`.
- Never modify files inside `src/components/ui/` directly. Extend or wrap them in `src/components/`.
- Page-level components go in `src/pages/`. Reusable components go in `src/components/`.
- Extract sub-components into `src/components/` rather than nesting them inline.
- Do not duplicate card or list markup across components. If the same JSX structure appears in two places, extract a shared component. `FilteredLevelCard` is the established pattern.
- **Buttons:** use raw `<button>` elements with the CSS utility classes defined in `src/index.css` (`.btn-primary`, `.btn-ghost`, `.btn-soft`, `.btn-inverse`, `.btn-ghost-inverse`). There is no `Button` component wrapper and no `@radix-ui/react-slot` dependency. See `styleguide.md` for which class to use on which background color.
- **Toasts:** if toast notifications are ever needed, install `sonner` and add `src/components/ui/sonner.tsx` (shadcn pattern). Mount `<Toaster>` in the nearest layout that actually triggers a toast. Do not install speculatively.
- **TooltipProvider** is intentionally not mounted in `Layout.tsx` until a call site exists. Wrap only the subtree that uses `<Tooltip>` with `<TooltipProvider>` at that point.
- **Author-controlled prose fields contain pre-rendered HTML.** Every YAML/TS field that holds prose written by a challenge author (`level.audience`, `tool.description`, `step.title`, `step.content`, `contributor.about`, `rewards.eligibility`, `tier.description`, `rewards.rankingNote`, `level.learnings`, `level.objective`, `level.intro`, `level.backstory`, `level.scenario`, `level.architecture`, `adventure.story`, `adventure.backstory`) is converted from Markdown to sanitised HTML at build time by `scripts/generate-adventures.mjs`. Always render them with `dangerouslySetInnerHTML={{ __html: value }}` and the `md-inline` (inline prose) or `md-content` (block content) CSS class. Never render as `{value}` directly. Identifier fields (`id`, URLs, enum values like `difficulty`, emoji) are not author prose and are rendered directly.
  - **When the container is an interactive element** (e.g. a `<Link>` card or a `<button>`), call `stripLinks(html)` from `src/lib/markdown.ts` before passing to `dangerouslySetInnerHTML` to prevent nested `<a>` inside `<a>` or `<button>`, which is invalid HTML.
  - **Exception: `adventure.story` in `AdventureCard` and `summaries.ts`:** The summary card and `ADVENTURE_SUMMARIES` store `story` as plain text (no HTML) so the home page renders it as a plain `<span>` with no markdown overhead. The generator emits a build-time warning if any story value contains markdown syntax (`*`, `_`, `` ` ``). Keep story field values as plain prose.
  - **The markdown pipeline (`unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-sanitize`, `rehype-stringify`) is dev-only**, used only by `scripts/generate-adventures.mjs`. Do not import any of these packages in component or page files.

### Component CSS patterns

- `hero-badge` class on the hero pill `<div>` in `Hero.tsx`. It is used for CSS scoping of light mode overrides.
- `logo-link` class on the Navbar logo `<Link>`. It is used to exclude the logo from nav link hover styles.
- `data-difficulty` attribute on `DifficultyBadge`. It is used for CSS targeting of badge text color.
- `contributor-pill` class on `ContributorBadge`. Scopes light mode overrides: transparent background with slate border instead of the near-invisible `bg-primary/5`.
- `contributor-pill-glow` class on `ContributorBadge` (applied via `glow` prop). Static amber box-shadow glow, sized for a small pill. Used only on `ChallengeDetail` -- not in `AdventureCard`.
- `docs-ext-link` class on all inline prose links site-wide. Bundles `inline-flex`, `align-items: center`, `gap`, `underline`, `decoration-thickness`, `underline-offset`, `border-radius`, focus-visible ring, and color/hover transitions. Handles both modes: dark mode foreground text with amber underline, hover to full `#ffc034`; light mode near-black text with `currentColor` underline, hover to `--link-hover-light` (`hsl(41 100% 22%)` dark amber, ~7.4:1 contrast). Used in `CommunityGuide`, `DiscussionSection`, `CommunitySection`, `LevelCard`, `PersonNameLink`, `ChallengeBuildersSection`, `ChallengeDetail`, `CommunitySidebar`, `RewardsCard`, `Accessibility`, and `Privacy`. Links inside pre-rendered adventure HTML use the `.md-inline a` and `.md-content a` rules in `src/index.css` instead. Do not use `hover:text-primary` or `hover:underline` on inline links, and do not add redundant `inline-flex items-center gap-*` utilities. Use `docs-ext-link` alone, adding only contextual utilities (font-size, weight, margin).

---

## Data

- Static content lives in `src/data/` as typed TypeScript objects/arrays.
- No runtime `fetch` calls in components. All network data must be fetched at build time.
- **Adventure content pipeline:** Adventure data is authored as YAML files at `src/data/adventures/<id>/adventure.yaml` and compiled to TypeScript via `scripts/generate-adventures.mjs`. The generated files (`*.generated.ts`, `index.ts`, and `summaries.ts`) are committed to the repo. The `prebuild` hook runs the generator automatically before every build. Never edit `*.generated.ts`, `src/data/adventures/index.ts`, or `src/data/adventures/summaries.ts` by hand.
  - **`summaries.ts` vs `index.ts`:** `summaries.ts` is a lightweight snapshot (id, title, month, story, tags, contributor name, and per-level id/name/difficulty/topics/learnings) with no imports from the full `*.generated.ts` files. Components that only render cards or tag filters (e.g. `ChallengesGrid`, `AdventureCard`, `FilteredLevelCard`) must import from `@/data/adventures/summaries` to avoid pulling the full detail-page data into the home page bundle. Detail pages and components that need full adventure content import from `@/data/adventures`.
  - **Why YAML + generated TS instead of writing TS directly?** YAML is easier to author and review for non-engineers, and validated by JSON Schema. Vite cannot import YAML natively, so a generator converts it to fully-typed TS that the app can statically import. Committing the generated files means the build works without running the generator first, and CI can detect when generated output is out of sync with the source YAML.
- **Schema validation:** Adventure YAML files are validated against `schemas/adventure.schema.json` (JSON Schema Draft 2020-12). Run `npm run generate:validate` to check without writing files.
- **Build-time fetching:** Discussion data lives in per-level JSON files under `src/data/adventures/<adventure-id>/<level-id>-posts.json`. Each file contains only `discussionUrl`, `discussionPosts`, and `totalReplies`. These are refreshed hourly by the GitHub Action in `.github/workflows/refresh-community-data.yml` (runs `scripts/refresh-discussions.mjs`). Components import the JSON dynamically via `import.meta.glob`.
- When adding a new adventure level, create its per-level discussion JSON file (`<level-id>-posts.json`) with a `discussionUrl` field. The refresh script uses this URL to fetch posts.
- `scripts/refresh-discussions.mjs`, `scripts/refresh-leaderboard.mjs`, and `scripts/refresh-community-leaders.mjs` each contain a `COMMUNITY_BASE` constant that is a necessary duplicate of `COMMUNITY_URL` in `src/data/constants.ts`. The scripts run in Node and cannot import from `src/`, so the value must be maintained manually in all four places. Always update them together.
- The domain `community.offon.dev` in the three refresh scripts and `src/data/constants.ts` is the actual Discourse server URL used for API calls at build time. `COMMUNITY_DISPLAY_NAME` in `src/data/constants.ts` is the separate user-facing label shown in the UI. Always update all four places together.

---

## Styling

- Use Tailwind utility classes directly on JSX elements.
- Always check the `@theme` block in `src/index.css` before introducing any new color, font, spacing, or border radius value. Never hardcode these. There is no `tailwind.config.ts`; all theme values live in the `@theme` block in `src/index.css`.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`, `text-foreground`) that shadcn sets up. Never hardcode a color that only works in one mode.
- Never add a `dark:` override without a corresponding base (light) style.
- Mobile first. Write base styles for mobile, then add `sm:`, `md:`, `lg:` breakpoints as needed.
- For font utilities, type scale, component class patterns (buttons, pills, badges, overline labels), and animations, see `styleguide.md`. It is the source of truth. Do not duplicate those details here.
- Never write custom CSS unless Tailwind genuinely cannot do the job. If you must, add it to `src/index.css` with a comment explaining why.
- Light mode overrides: do NOT put them inside `@layer base`; rules there are always overridden by `@layer utilities`. Add unlayered rules to the "Light mode overrides" section at the bottom of `src/index.css`, scoped to `.light`.

### Design system rules

- Light mode uses `.light` class on `<html>`, set by the `useTheme` hook.
- Yellow `#ffc034` is accent-only in light mode. Never use it as a text color.
- Dark mode uses `:root` and `.dark`. Never modify these when fixing light mode issues.
- Tailwind `group-hover:*` and `group-focus:*` utilities are not matched by `.light .classname` selectors. Always add explicit `.light .group:hover` rules in the unlayered light mode overrides section of `src/index.css`.
- Avatar palette colors must not be used directly as text colors in light mode. They fail contrast on near-white surfaces. Use `hsl(var(--foreground))` as the text color for avatar initials in all modes.

---

## Accessibility

Read [`ACCESSIBILITY.md`](ACCESSIBILITY.md) before writing or modifying any component. It contains the full contributor checklist, WCAG principle reference, and manual testing requirements.

The target is not minimum compliance. Every component must be genuinely usable by keyboard-only users, screen reader users, and people with low vision. WCAG 2.2 AA is the floor, not the goal.

---

## Analytics and Consent

The site uses Google Analytics 4 with **Consent Mode v2 in gated-load mode**. No data of any kind is sent to Google until the user clicks Accept on the cookie banner; the `gtag.js` script itself is not loaded until that point. Cross-domain measurement between `offon.dev` and `community.offon.dev` is configured in the GA4 admin UI, not in this codebase.

After Accept, only `analytics_storage` flips to `granted`. The three ad signals (`ad_storage`, `ad_user_data`, `ad_personalization`) stay denied for the lifetime of the site since OffOn does not run Google Ads.

### Constants

All analytics-related constants live in `src/data/constants.ts`:

| Constant | Purpose |
|---|---|
| `GA_MEASUREMENT_ID` | GA4 Measurement ID. Used by `useConsent.tsx` only, when it injects `gtag.js` on Accept. The inline bootstrap in `src/root.tsx` does not reference it. |
| `CONSENT_STORAGE_KEY` | `localStorage` key for the consent decision (`analytics_consent`). |
| `CONSENT_EXPIRY_MS` | Stored consent expiry (180 days). Re-prompt the user on the next visit after this. |
| `BRAND_NAME` | Always `"OffOn"`. Never hardcode the string. |
| `COMMUNITY_URL` | Real URL of the Discourse instance. Never hardcode. |
| `COMMUNITY_DISPLAY_NAME` | User-facing display name for the community URL. Use for visible text. |
| `SITE_URL` | `"https://offon.dev"`. Use for canonical URLs and OG tags. |
| `SITE_NAME` | `"offon.dev"`. |
| `CONTACT_EMAIL` | Contact email address. Used in `CommunityGuide.tsx`. Never hardcode. |
| `LINKEDIN_URL` | LinkedIn company page URL. |
| `BLUESKY_URL` | Bluesky profile URL (`https://bsky.app/profile/off-on-dev.bsky.social`). Used in `Footer.tsx`. |
| `X_URL` | X (Twitter) profile URL (`https://x.com/OffonDev`). Used in `Footer.tsx`. |
| `THEME_STORAGE_KEY` | `localStorage` key for the stored theme preference (`"theme"`). Used by `useTheme.tsx`. |

### How it works

- `src/root.tsx` contains a minimal inline `<head>` bootstrap that does only three things: bootstrap `window.dataLayer`, define `window.gtag` as the `dataLayer.push` shim, and call `gtag('consent', 'default', {...})` with all four signals denied. **No `wait_for_update`. No localStorage read. No `gtag('js', ...)`. No `gtag('config', ...)`. No `<script src="...googletagmanager...">` tag.**
- `src/hooks/useConsent.tsx` owns the React-side state and the `gtag.js` injector. The injector is shared by both the Accept click path and the mount-restore path, gated by a module-scoped `gtagScriptInjected` boolean so the script tag is appended at most once per session. On Accept, the injector pushes `consent update`, `js`, and `config` into `dataLayer` synchronously **before** appending the script tag, so when `gtag.js` loads it drains the queue in the correct order. The `config` call passes only `cookie_flags: 'SameSite=Lax;Secure'`, `cookie_expires: 15552000` (180 days), and `send_page_view: false`. No `cookie_domain` or `linker`.
- On Decline, the hook pushes `consent update analytics_storage: denied` and clears any `_ga*` cookies. The script tag is **not** removed; `dataLayer` is **not** wiped; `window.gtag` is **not** replaced. `gtag.js` itself stops sending hits when consent is denied.
- On Reset (floating cookie button): same as Decline plus state goes back to `null` and `localStorage` is cleared so the banner reappears.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice. Once consent is set, it renders a floating cookie icon button (bottom-right) that calls `reset()` to reopen the banner.
- `src/Layout.tsx` mounts `PageViewTracker` and `ClickTracker`. **Both gate on `consent === "granted"`.** Pushing events to `dataLayer` while `gtag.js` is not loaded would queue them, and a later Accept would drain the queue and retroactively send pageviews and click events for routes/clicks the user made while consent was undecided or denied. Gating prevents that.
- `src/hooks/useTheme.tsx` manages the light/dark toggle. Theme is stored in `localStorage` under key `theme`. `ThemeProvider` is mounted in `Layout.tsx`.

### Consent state machine: enumerate all transitions before touching this code

| From | To | Trigger | localStorage | React state | gtag.js | dataLayer / cookies |
|---|---|---|---|---|---|---|
| `null` | `"granted"` | User clicks Accept | write `granted` | `setConsent("granted")` | injected if not already | push `consent update granted` + `js` + `config` |
| `null` | `"denied"` | User clicks Decline | write `denied` | `setConsent("denied")` | not injected | push `consent update denied`, clear `_ga*` cookies (no-op if none) |
| `"granted"` | `"denied"` | Decline after grant | write `denied` | `setConsent("denied")` | unchanged (still loaded) | push `consent update denied`, clear `_ga*` cookies |
| `"denied"` | `"granted"` | Accept after decline | write `granted` | `setConsent("granted")` | injected if not already | push `consent update granted` (+ `js` + `config` only if first injection) |
| `"granted"` | `null` | User clicks Cookie Preferences | clear | `setConsent(null)` | unchanged | push `consent update denied`, clear `_ga*` cookies |
| `"denied"` | `null` | User clicks Cookie Preferences | clear | `setConsent(null)` | unchanged | push `consent update denied` |
| `null` | `"granted"` | Page load with stored `granted` | (read) | `setConsent("granted")` | injected by mount effect | push `consent update granted` + `js` + `config` |
| `null` | `"denied"` | Page load with stored `denied` | (read) | `setConsent("denied")` | not injected | nothing |
| `null` | `"denied"` | Page load, GPC active, no stored preference | write `denied` | `setConsent("denied")` | not injected | clear `_ga*` cookies |
| `"denied"` | `"denied"` | Page load, GPC active, stored `denied` | overwrite `denied` | `setConsent("denied")` | not injected | clear `_ga*` cookies |
| GPC active | `"granted"` | Page load, GPC active, stored `granted` | (read) | `setConsent("granted")` | injected by mount effect | push `consent update granted` + `js` + `config` |

### Do not

- Do not load `gtag.js` outside the consent injector.
- Do not put `gtag('js')` or `gtag('config')` in `root.tsx`. Both belong in the injector, queued after the consent update.
- Do not reintroduce `wait_for_update`.
- Do not remove GPC detection: `navigator.globalPrivacyControl === true` is checked on mount in `useConsent.tsx`. If active and no explicit prior Accept is stored, consent is auto-denied without prompting the user.
- Do not reintroduce `ANALYTICS_LINKER_DOMAINS` or `cookie_domain`.
- Do not put the consent update inside `script.onload`. It must be queued before `appendChild` so the dataLayer drains in the correct order.
- Do not remove the script tag, wipe `dataLayer`, or replace `window.gtag` on deny.
- Do not push `page_view` or `click_event` when consent is not granted.
- Do not skip clearing `_ga*` cookies on deny or reset.

---

## Testing

- Use Vitest for all unit and integration tests.
- Use `@testing-library/react` for component tests. Test from the user's perspective, not implementation details.
- Test files live in `src/test/` or co-located alongside the module as `*.test.ts(x)`.
- Write tests for all logic in `src/lib/` and `src/hooks/`. Target 80% coverage for new utility and hook files.
- Pure visual components (no state, no side effects) do not require tests. A visual component that holds state or has side effects is not a pure visual component and must have tests.
- Prefer `getByRole` and `getByLabelText` queries over `getByTestId`. They also validate accessibility.
- Never ship code that causes test or lint failures.
- Every new hook, utility function, or stateful component must have tests covering the happy path, edge cases, and all state transitions.
- Tests must be written as part of the implementation, not as an afterthought.
- If a component or hook has side effects (DOM mutations, localStorage, external scripts), mock those side effects in tests and assert they are called correctly.
- When fixing a bug, add a regression test that would have caught it before writing the fix.
- When fixing a bug caused by an incorrect import, file path, or configuration value, add a regression test that asserts on the file's contents.
- Prerender tests live in `src/test/prerender.test.ts` and require a production build. Always run `npm run build` before `npm test` if prerender tests are included.
- Playwright smoke tests live in `e2e/smoke.spec.ts` and require a production build. The axe audit runs with tags `["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]` in both dark and light mode. Never remove `wcag22aa` from this list. When adding a new prerendered route, add it to the `ROUTES` array in `e2e/smoke.spec.ts` and `src/test/seo.test.ts`, and to the `pages` array in `src/test/prerender.test.ts` with the expected `<title>` value.
- SEO tests live in `src/test/seo.test.ts` and require a production build. When adding a new prerendered route, add it to the `ROUTES` array in `src/test/seo.test.ts`.
- **Visual regression tests** live in `e2e/visual.spec.ts` and require a production build. Run `npm run build && npm run test:visual`. First run generates baseline screenshots in `e2e/__screenshots__/`; subsequent runs compare against baselines and fail if pixel differences exceed threshold. Baselines are committed. To update baselines after intentional visual changes: `npm run test:visual:update`. When adding a new page or making major layout changes, add it to `VISUAL_ROUTES` in `visual.spec.ts` and regenerate baselines. Use `maskSelectors` to hide dynamic content (timestamps, discussion posts) that changes between builds.
- When a page renders multiple navigation landmarks, use `within` from `@testing-library/react` to scope queries to the correct landmark before asserting link destinations.
- **Testing hooks with dynamic imports:** Never use `vi.mock` for a dynamic import called inside a hook. Export a loader type and default loader; tests inject `vi.fn().mockResolvedValue(data)` via an optional argument. See `src/hooks/useDiscussionPosts.ts` for the reference implementation.
- **Coverage:** run `npm run test:coverage` for v8 coverage reports. `@vitest/coverage-v8` is installed as a dev dependency.
- **Axe incomplete flags:** When axe reports an "Incomplete" or "Needs Review" result, provide a definitive manual ruling (confirmed violation, confirmed pass, or cannot determine without AT testing) before merging. Do not leave incomplete flags unresolved. Use `/a11y-audit` to evaluate in context.

---

## Hydration and Prerender Safety

Whether or not the site is prerendered today, these patterns cause bugs. They produce visible flashes in client-only apps and break hydration entirely if the site is ever prerendered. Never introduce them.

### Do not read browser-only globals during render

- Never read `window`, `document`, `navigator`, `localStorage`, or `sessionStorage` in a component function body.
- Never read them in a `useState` lazy initializer.
- Correct pattern: initialize state with a safe default, then update it in `useEffect` or `useLayoutEffect`.

### Do not use non-deterministic values during render

- Never call `Math.random()`, `Date.now()`, `new Date()`, `crypto.randomUUID()`, or `performance.now()` in a render body.
- `new Date().getFullYear()` in JSX is a common mistake. Use a module-level constant instead.

### Client-only behavior must be gated

- Anything that depends on `localStorage`, `matchMedia`, or similar must produce the same initial render as a fresh visitor with no stored state.
- For theme and consent state: always render the default (dark, no-consent) on first render, then update in an effect.
- Always wrap `localStorage` reads and writes in `try/catch`. Storage throws in private browsing and when quota is exceeded.

### No IntersectionObserver or ResizeObserver at render time

- Always create observers inside `useEffect`, never at the top level of a component or module.
- Guard any observer that affects rendered content with a `typeof window !== 'undefined'` check.
- Use `useIsomorphicLayoutEffect` instead of `useLayoutEffect` in any component that renders during SSG.

### entry.server.tsx must use renderToPipeableStream, not renderToString

- `renderToString` emits `<!--$!-->` markers for any Suspense boundary that suspends during prerender.
- `entry.server.tsx` must always use `renderToPipeableStream` with `onAllReady` callback.
- Never revert to `renderToString` in `entry.server.tsx`.

### Do not add Suspense wrappers around Outlet in Layout.tsx

- Adding `<Suspense>` around `<Outlet />` in Layout.tsx creates an extra boundary React Router does not resolve during prerender, producing broken hydration.
- If you need loading states for routes, configure them in the route module itself.

### useSearchParams() and prerender hydration

`useSearchParams()` is safe to call during render, but its value differs between prerender (empty, no URL) and client hydration (real URL params from the browser). Deriving initial `useState` from it causes a mismatch: the prerendered HTML has one value, the hydrating client has another, React throws. Always default to the server-safe value (`false`, `null`, or `[]`) and sync to the real param value in `useEffect`.

```tsx
// WRONG: lazy initializer reads params at prerender time (always empty) and at
// hydration time (real URL), causing a mismatch.
const [hasFiltered, setHasFiltered] = useState(() => searchParams.has("topics"));

// CORRECT: start with the server-safe default; sync after mount.
const [hasFiltered, setHasFiltered] = useState(false);
useEffect(() => { if (searchParams.has("topics")) setHasFiltered(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### JavaScript degradation testing

Core content must be readable with JavaScript disabled. To verify: DevTools → Cmd+Shift+P → "Disable JavaScript" → reload the page.

- Page headings, body text, images, and navigation links must be visible and functional.
- Filters, theme toggle, and consent banner may degrade gracefully — they are JS-enhanced features.
- Challenge and adventure text, navigation, and all other primary page content must not be exclusively client-side rendered.
- Run `npm run build` and confirm all content appears in the prerendered HTML files in `dist/client/`.

---

## SEO

This is a fully static React site. Apply these practices on every page.

### Document structure

- Every page must have a unique, descriptive `<title>` tag.
- Every page must have a `<meta name="description">` under 160 characters.
- Add Open Graph tags to every page: `og:title`, `og:description`, `og:url`, `og:type`, and `og:image` where an image is available.
- Add Twitter meta tags: always include `twitter:card` (use `summary_large_image` for pages with images), `twitter:title`, `twitter:description`, and `twitter:image`.
- Use React Router v7's `meta()` export on each route module to manage head tags per page. Use the `buildPageMeta` helper from `src/lib/meta.ts`.

### Heading hierarchy

- One `<h1>` per page that clearly describes the page topic.
- Headings follow a logical order with no skipped levels.
- For multi-line hero or section headings, do not use `<br />` inside `h1`/`h2`. Use block-level `<span>` elements for visual line breaks.

### Links and navigation

- Internal links use React Router `<Link>`. Never trigger full page reloads.
- Use descriptive link text. Never use "click here" or "read more" alone.
- Set the canonical URL for each page as `${SITE_URL}${pathname}` using the `SITE_URL` constant from `src/data/constants.ts`.

### Performance

Read [`PERFORMANCE.md`](PERFORMANCE.md) before adding any new dependency, font, image, or route.

### Global head setup (root.tsx)

- **Required `<head>` elements** -- verify these are present whenever editing `src/root.tsx`:
  - `<meta charset="utf-8">` -- must appear in the first 1024 bytes of the HTML, before any non-ASCII content.
  - `<meta name="viewport" content="width=device-width, initial-scale=1">` -- tells mobile browsers to render at device width. Never set `user-scalable=no` or `maximum-scale=1`; disabling user zoom breaks WCAG 1.4.4 (Resize Text).
  - `<meta name="color-scheme" content="dark light">` -- prevents the white flash dark-mode users see before CSS loads, and lets the browser style scrollbars and native form controls to match the active scheme.
- **Favicons** -- the following files must be present in `public/` and linked from `src/root.tsx`:
  - `favicon.svg` -- primary favicon; linked as `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
  - `favicon.ico` -- ICO fallback for older browsers and the Windows taskbar. Place at `public/favicon.ico` (browsers request it automatically).
  - `apple-touch-icon.png` -- 180x180 px PNG; linked as `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
  - A maskable icon entry in `site.webmanifest` with `"purpose": "maskable"` for Android home screens.
  - Verify all four are present before shipping any favicon change.
- Add `<link rel="manifest" href="/site.webmanifest" />` to link the web app manifest.
- Add `<meta name="theme-color">` tags for dark and light mode.
- Add JSON-LD structured data as two `<script type="application/ld+json">` blocks: one `@type: "WebSite"` and one `@type: "Organization"`. The `"OffOn"` brand name is hardcoded as a string literal in both (they cannot reference TypeScript constants inside `dangerouslySetInnerHTML`). Update them manually if the brand name ever changes.
- Always include `og:image:width`, `og:image:height`, and `og:image:alt` for all OG image tags.
- Add `og:site_name` and `og:locale` (en_GB) to all global OG tags in `src/root.tsx`.
- Do not add page-specific meta tags to `src/root.tsx`. These must live in each route module's `meta()` export only.

### URL structure

- Keep URLs lowercase, hyphen-separated, and descriptive. Never use underscores or camelCase in URL segments.
- Treat published URLs as a public contract. Once a URL is live, it must keep working. If a URL must change, add a redirect route in `src/routes.ts` pointing the old path to the new one.
- Redirect routes in `src/pages/redirects/` use React Router's `redirect()`. Prefer client-side redirects over broken links. Never chain more than one redirect for the same URL.

### Soft 404s

- Every path that does not correspond to a real page must return HTTP 404, not 200. GitHub Pages serves `404.html` automatically for unmatched paths -- no configuration is needed.
- Never create a catch-all route that renders a "page not found" UI with a 200 status. Search engines and AI crawlers treat a 200 response as indexable content.
- When retiring a URL, add a redirect route to its successor. If there is no successor, redirect to the nearest parent or category page. Reserve 404 for paths that were never valid.

---

## Content and Copy

### Brand Name

- The brand is always written **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".
- The community was previously known as "Open Ecosystem". That name is retired. Never use it anywhere.
- In code, always use the `BRAND_NAME` constant from `src/data/constants.ts` instead of hardcoding the string.
- The domain `offon.dev` is always lowercase.

### Tone

- Direct, positive, and community-focused.
- Write for open source enthusiasts, not a corporate audience.
- Use plain language. Avoid jargon unless it is standard in open source contexts.
- Avoid passive voice where an active one works.
- Keep sentences short and scannable.
- Never enumerate specific difficulty levels (e.g. "Beginner, Intermediate, or Expert") in UI copy. Adventures can have one, two, or three levels at any combination of difficulties. Use broad language instead: "the difficulty that fits where you are", "any difficulty level", or similar.

### Capitalisation

All UI labels use **title case (Chicago style)**. Body copy uses **sentence case**.

**Title case applies to:** button and CTA labels, section headings (h2/h3), card and value titles, navigation labels and footer links, pill and badge text.

**Title case rule:** capitalise every word except articles (a, an, the), prepositions shorter than five letters, and coordinating conjunctions (and, but, or, nor), unless they open or close the label.

**Sentence case applies to:** body paragraphs, meta descriptions, `<p>` elements, hero sub-headings, and card descriptions.

**Exception:** decorative overline labels use CSS `text-transform: uppercase`, so write their source text in plain lowercase.

### Formatting

- Never use em dashes anywhere, including comments and documentation. Use commas, periods, or restructure the sentence instead.
- Maintain a cohesive tone across all pages and components.
- Do not mix formal and casual registers within the same page.

### External URLs

- `LINKEDIN_URL` in `src/data/constants.ts` contains the current LinkedIn company page URL. Update it when the LinkedIn company page URL changes.

---

## Git

- Branch naming: `type/short-description` (e.g. `feat/hero-section`, `fix/nav-scroll`).
- All commits must be signed off: `git commit -s`.
- Never force-push to `main`.
- PR titles follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

### Commit types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | CSS or formatting changes |
| `refactor` | Code restructure, no feature or fix |
| `chore` | Maintenance, dependencies |
| `perf` | Performance improvements |
| `security` | Security fixes |
| `config` | Configuration changes |
| `revert` | Reverting a previous commit |

---

## Site Maintenance

### Well-known files

- `public/.well-known/security.txt` contains an `Expires` field. Update the date annually (current expiry: `2027-06-01`). An expired security.txt is treated as absent by scanners.
- `public/llms.txt` lists key pages and all live adventures. Update it whenever a new adventure is added (step 7 in the adventure checklist above) or a page is significantly renamed.
- `public/robots.txt` lists named AI crawler agents. No routine updates needed; add a new agent entry only when a major crawler publishes a new user-agent string.

### Sitemap

- Every time a new static page is added to `src/pages/` and registered as a route in `src/routes.ts`, its URL must also be added to `public/sitemap.xml` with a `<lastmod>` date.
- Dynamic routes with statically known IDs must also be added to `public/sitemap.xml` with a `<lastmod>` date. Adventure and challenge-tag URLs are generated automatically by `scripts/generate-adventures.mjs` and include `<lastmod>` set to the build date; do not add them by hand.
- `robots.txt` at `public/robots.txt` must include: `Sitemap: https://offon.dev/sitemap.xml`
- **Generator region markers:** `scripts/generate-adventures.mjs` uses two exact sitemap URL strings as anchors when patching adventure and tag entries into `public/sitemap.xml` (see `replaceRegion` calls near line 910 and 952). If you change either anchor URL (including adding, removing, or reordering attributes like `<lastmod>`), you must update the corresponding marker string in the generator. Failing to do so causes `npm run build` to abort with "Region markers not found".

### SSG prerendered routes

- The list of routes React Router v7 prerenders is in the `prerender` array inside `react-router.config.ts`.
- When adding a new static route, add it to **all three** of: `src/routes.ts`, `public/sitemap.xml`, and the `prerender` array in `react-router.config.ts`.

When adding a new route to `src/routes.ts`, follow these rules by route type:

- Static routes: add to `public/sitemap.xml`, the routes table in `README.md`, and the `prerender` array in `react-router.config.ts`.
- Dynamic routes with statically known IDs: add individual URLs to `public/sitemap.xml`, the `prerender` array, and `README.md`. Also create a per-level discussion JSON file if the level has a discussion thread.
- Redirect routes: do not add to `sitemap.xml` or `README.md`.
- Catch-all routes: do not add anywhere.

### When adding a new adventure or a new level to an existing adventure

Adventures and levels are synced from the challenges repo via the `sync-adventure` GitHub Actions workflow (Actions tab → Sync Adventure from Challenges Repo → Run workflow).

Inputs:
- `adventure_url`: URL of the adventure folder in the challenges repo (e.g. `https://github.com/off-on-dev/open-source-challenges/tree/main/adventures/05-lex-imperfecta`)
- `levels`: comma-separated level IDs to make live now (e.g. `beginner` or `beginner,intermediate`). Levels present in the challenges repo but not listed are added as "coming soon" placeholders. Leave blank to sync all levels.

The workflow opens a PR with a checklist. Before merging, complete all items in that checklist, including:

1. Add the adventure detail route and all level routes to `src/routes.ts`.
2. Add all URLs to `public/sitemap.xml` and the `prerender` array in `react-router.config.ts`.
3. Add the adventure to `ADVENTURE_CATEGORIES` in `scripts/refresh-leaderboard.mjs` and run `node scripts/refresh-leaderboard.mjs`.
4. Set `discussionUrl` in each `*-posts.json` using the **Add Discussion URL to Level** GitHub Actions workflow (Actions → Add Discussion URL to Level). The workflow updates `adventure.yaml`, fetches initial posts, regenerates TypeScript, and opens a PR. Run once per level. Do not run `node scripts/refresh-discussions.mjs` manually for this step.
5. Add each level URL to the `ROUTES` array in `e2e/smoke.spec.ts` and `src/test/seo.test.ts`, and to the `pages` array in `src/test/prerender.test.ts` with the expected `<title>` value.
6. Update the routes table in `README.md`.
7. Add the adventure to `public/llms.txt` under the Adventures section so AI agents can discover it.

---

## Deployment

- Push to `main` triggers `deploy.yml` and deploys to GitHub Pages.
- Open PRs trigger `preview.yml` and create a PR preview deployment.
- Only static files in `dist/client/` are deployed. No server config is needed.
- The base path is set via the `VITE_BASE_PATH` environment variable (defaults to `/`). Never change this without verifying GitHub Pages routing.

### GitHub Actions allowlist

The `off-on-dev` organisation restricts which third-party actions can run. Only the following are permitted:

| Action | Pinned version |
|---|---|
| `actions/checkout` | `@v4` only |
| `actions/setup-node` | `@v4` only |
| `actions/create-github-app-token` | `@v3` only |
| `JamesIves/github-pages-deploy-action` | any tag |
| `marocchino/sticky-pull-request-comment` | any tag |
| `rossjrw/pr-preview-action` | any tag |
| Actions owned by `off-on-dev` | any |
| Actions created by GitHub | any |
| Actions verified in the GitHub Marketplace | any |

Before adding any new `uses:` line to a workflow file, verify the action is on this list. If it is not, replace it with an equivalent using `gh` (GitHub CLI) or native shell commands.

---

## Before Submitting Code

Every code change must pass all of these checks before being considered done. State the result of each check explicitly before finishing a task.

### Mandatory checks

1. **Run lint:** `npm run lint` must exit with zero errors.
2. **Run tests:** `npm test` must pass with zero failures.
3. **Run e2e and a11y tests:** `npm run build && npm run test:e2e` must pass with zero failures. The axe audit runs tags `["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]` in both light and dark mode. Never reduce this tag set. Axe catches roughly 30–40% of real issues — treat it as ground truth for mechanical violations, but manual persona testing (see ACCESSIBILITY.md) is always required.
4. **Run build:** `npm run build` must complete with no TypeScript errors or bundling failures.
5. **Re-read every file you changed:** verify the final state is correct. Never assume an edit landed correctly without checking.
6. **Check all call sites:** if you changed a function signature, component props, or exported type, search for all usages and confirm they are updated.
7. **Check imports:** every import must resolve. No unused imports. No circular dependencies introduced.
8. **Verify at three viewports:** 375px, 768px, and 1280px. Always test against the production build, never the dev server.
9. **Check discussion data on every PR:** if the PR adds or modifies adventure levels, verify that a per-level discussion JSON file exists with the correct `discussionUrl`.

### Before writing any code

1. Read the relevant files first. Never edit a file you have not read in this session.
2. If the change touches more than one file, list all affected files before starting.
3. If the change involves a state machine, enumerate all transitions first.
4. If the change involves shared state, confirm a context provider is used.
5. If the change involves a side effect (DOM, localStorage, external scripts), write the test before or alongside the implementation.

### Red flags that require stopping and flagging to the user

- A fix requires changing more than 3 files you did not plan to change.
- A type error requires adding a cast or suppression to resolve.
- A test requires mocking something that was not mocked before.
- The same bug has been fixed more than once in this session.
- A replacement did not change the file (silent no-op).
- The error in the browser console shows a different bundle hash than the latest build output.
- A "fix" has been applied but the same error reproduces unchanged.

---

## Do Not

- Do not add a backend, API routes, or server-side rendering.
- Do not add external font or icon CDN links. All assets must be self-hosted.
- Do not change `vite.config.ts` base path without verifying GitHub Pages routing.
- Do not install new dependencies without checking if shadcn/ui or an existing utility covers the need.
- Do not commit secrets, tokens, or credentials.
- Do not change the `@theme` block in `src/index.css` without verifying the change does not break existing components.
- Do not reinstall `@radix-ui/*` packages that were removed.
- Do not re-derive data from `ADVENTURES` inside component files.
- Do not edit `*.generated.ts`, `src/data/adventures/index.ts`, or `src/data/adventures/summaries.ts` by hand.

---

## When Suggesting Code

- Always read `styleguide.md` before making any UI, copy, or component changes.
- Follow all rules in the Styling and Components sections.
- Flag any accessibility concerns before writing the code, not after. Read `ACCESSIBILITY.md` first.
- Flag any breaking changes explicitly.
- Prefer simple, readable solutions over clever ones.
- If something could be done multiple ways, briefly explain the tradeoff and recommend one approach.

---

## After Making Changes

A task is not done until the relevant docs are updated.

### Always check these four things after any non-trivial change

1. **Did you add or change a component, hook, or utility?** Update `styleguide.md`.
2. **Did you add or change a page or route?** Update the routes table in `README.md`.
3. **Did you add or change an environment variable, constant, or config value?** Document it in `README.md`.
4. **Did you change a build, deploy, or dev workflow?** Update the Commands section in both `CLAUDE.md` and `README.md`.

After completing any task, explicitly state which checks applied, what was updated, or why it was skipped.

| Change | Update |
|---|---|
| New component | styleguide.md: component entry with props and usage |
| New hook | styleguide.md: hook entry with return type and behavior |
| New utility function | styleguide.md: brief entry if it affects patterns |
| New page or route | README.md routes table; sitemap.xml and prerender array for static routes |
| New constant | README.md constants section, styleguide.md if visual |
| New workflow step | README.md commands section, CLAUDE.md if it changes a rule |
| New brand or copy rule | styleguide.md first, then apply across codebase |
| Bug fix that reveals a missing rule | CLAUDE.md: add the rule to prevent recurrence |
| New test pattern | CLAUDE.md: add to Testing section if it sets a precedent |

---

## Implementation Rules

### Shared state

If a hook or piece of state is consumed by more than one sibling component, it must be a React context provider, not a plain hook.

### File extensions

Any file that renders or returns JSX must use the `.tsx` extension. Files that are pure TypeScript logic with no JSX use `.ts`.

### React hooks

Each `useEffect` must have a single responsibility. Never combine side effects with different trigger conditions into one effect. Split them.

### State machines

When implementing any feature with multiple states, enumerate every transition before writing code. For each transition, list every system that must be updated (storage, UI state, external APIs, DOM).

---

## SEO Checklist: Required for Every New Page

Add via the route module's `meta()` export, never in `src/root.tsx`:

- `<title>` (unique) and `<meta name="description">` (under 160 chars)
- `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `og:site_name`, `og:locale` (en_GB)
- `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
- `<link rel="canonical">` set to `${SITE_URL}${pathname}`
- Correct heading hierarchy: one `h1`, `h2` for sections, `h3` for subsections

Static routes only: add to `public/sitemap.xml` and the `prerender` array in `react-router.config.ts`.

One-time `src/root.tsx` check (not per page): manifest link, both theme-color tags, JSON-LD block, `lang="en"` on `<html>`.
