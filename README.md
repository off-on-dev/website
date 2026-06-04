# offon.dev

Source for [offon.dev](https://offon.dev/), the home of OffOn: a platform for open source enthusiasts. The site is fully static with no backend. Pages are prerendered at build time using React Router v7 framework mode with `ssr: false`. It hosts hands-on open source challenges, community documentation, and links to the OffOn community.

## Tech Stack

- **React 19** + **TypeScript**: UI and type safety
- **Vite**: build tooling and dev server
- **Tailwind CSS**: utility-first styling
- **shadcn/ui**: minimal component surface (`badge.tsx`, `tooltip.tsx`); most Radix UI packages were intentionally removed
- **React Router v7**: client-side routing with static prerendering
- **Vitest**: unit and component testing
- **Playwright**: browser smoke tests (`e2e/`)
- **GitHub Pages**: hosting and deployment

## Getting Started

```sh
# Clone the repo
git clone https://github.com/off-on-dev/website
cd website

# Install dependencies
npm install

# Start the development server (http://localhost:8080)
npm run dev
```

Node.js **24** is required. Version is pinned in `.nvmrc`, run `nvm use` to switch automatically.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server at http://localhost:8080 |
| `npm run build` | SSG prerender build to `dist/client/` (React Router v7) |
| `npm run build:dev` | Dev-mode build (source maps, no minification) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run the full test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with v8 coverage report |
| `npm run test:e2e` | Playwright smoke and WSG tests (requires `npm run build` first) |
| `npm run generate` | Regenerate TypeScript from adventure YAML files |
| `npm run generate:validate` | Validate adventure YAML against schema without writing files |

Run `npm run lint` and `npm test` before marking any work done.

All UI changes must be verified at mobile (375px), tablet (768px), and desktop (1280px) viewports before being considered done. Always test against the production build (`npm run build && npm run preview`), never the dev server.

## Project Structure

```
src/
  components/     # Reusable UI components (named exports, PascalCase files)
  components/ui/  # shadcn/ui primitives, do not edit directly
  pages/          # Route-level page components
  data/           # Static content as typed TypeScript objects and arrays
  data/adventures/<id>/adventure.yaml  # Adventure YAML source files
  hooks/          # Custom React hooks
  lib/            # Shared utilities
  test/           # Vitest + Testing Library unit and component tests
  root.tsx        # HTML shell rendered by React Router v7 (replaces index.html)
  routes.ts       # Route definitions (React Router v7 config-based routing)
  entry.client.tsx  # Client entry: hydrates the full document via HydratedRouter
  entry.server.tsx  # Server/prerender entry: renderToPipeableStream for static HTML generation
  Layout.tsx      # App shell with all providers and Outlet
e2e/
  smoke.spec.ts   # Playwright smoke tests: route titles, axe a11y audit (requires npm run build first)
  wsg.spec.ts     # Web Sustainability Guidelines checks: page weight, third-party requests, image optimisation
schemas/
  adventure.schema.json  # JSON Schema for adventure YAML validation
scripts/
  generate-adventures.mjs       # YAML -> TypeScript codegen (runs as prebuild hook)
  sync-adventure.mjs            # Fetch and transform adventure YAML from the challenges repo
  set-discussion-url.mjs        # Set a Discourse thread URL on a level (called by add-discussion-url.yml)
public/
  fonts/          # Self-hosted Inter, Syne, and JetBrains Mono font files
  sitemap.xml
  robots.txt
  og.png
```

### Adventure Content Pipeline

Adventures are authored as YAML at `src/data/adventures/<id>/adventure.yaml` and compiled to TypeScript by `scripts/generate-adventures.mjs`. The `prebuild` hook runs the generator automatically before every build.

- **Source of truth:** the YAML files. Never edit `*.generated.ts` or `index.ts` by hand.
- **Schema:** `schemas/adventure.schema.json` (JSON Schema Draft 2020-12). Run `npm run generate:validate` to check.
- **Sync from challenges repo:** use the `sync-adventure` GitHub Actions workflow (see Adding Adventures below).
- **Generated outputs:** `<id>.generated.ts` (one per adventure) + `index.ts` (barrel with `ADVENTURES`, `ALL_TAGS`, `ADVENTURE_CONTRIBUTORS`, `getLevelsByTag`, `tagToSlug`, `slugToTag`).
- **Generated files are committed** so the dev server works without an extra step.

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | `Index.tsx` | Home page |
| `/adventures` | `Adventures.tsx` | All adventures listing |
| `/adventures/:id` | `AdventureDetail.tsx` | Adventure landing |
| `/adventures/:id/levels/:levelId` | `ChallengeDetail.tsx` | Individual challenge |
| `/contribute` | `Contribute.tsx` | How to contribute (technical and non-technical ways) |
| `/sponsors` | `Sponsors.tsx` | Sponsorship info |
| `/about` | `About.tsx` | About the community |
| `/handbook` | `CommunityGuide.tsx` | Community handbook / documentation |
| `/privacy` | `Privacy.tsx` | GDPR-compliant privacy policy |
| `/accessibility` | `Accessibility.tsx` | WCAG accessibility statement |
| `/404` | `NotFound.tsx` | Prerendered 404 page |
| `/community-guide` | redirects to `/handbook` | Legacy alias |
| `/docs` | redirects to `/handbook` | Legacy alias |
| `/docs/community-guide` | redirects to `/handbook` | Legacy alias |
| `/challenges` | `Challenges.tsx` | All adventures; filter by technology tag |
| `/challenges/:tag` | `Challenges.tsx` | Challenges filtered by technology tag (SEO-friendly slug) |
| `*` | `CatchAll.tsx` | Client-side 404 fallback (re-exports `NotFound.tsx`; required because React Router v7 needs unique files per route) |

> **Technology tag filtering** is handled inline on the home page via local `useState`. Adventure detail and challenge detail pages link tags to `/challenges/:tag`. The `/challenges` page uses URL params for shareable filtered views.

## SEO and Metadata

### Web Manifest
`public/site.webmanifest` defines the web app identity, used by browsers and PWA tools. It includes:
- App name, short name, and description
- Icon references (favicon and apple-touch-icon)
- Theme and background colors
- Display mode (standalone)

### Schema.org Structured Data
`src/root.tsx` includes two JSON-LD `<script>` blocks: one with `@type: "WebSite"` and one with `@type: "Organization"`. These help search engines understand the site's identity and content.

### Open Graph Tags
All pages include complete OG tags:
- `og:title`, `og:description`, `og:url`, `og:image`
- `og:image:width`, `og:image:height`, `og:image:alt` (required for proper image rendering in social previews)
- `og:site_name` (brand), `og:locale` (en_GB)
- `og:type` (website or article, depending on page)

All dynamic pages (adventure & challenge details) generate page-specific OG tags via React Router v7 `meta()` exports.

### Twitter Card Tags
All pages include:
- `twitter:card` (summary_large_image)
- `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`

### Canonical Links
Each page declares its canonical URL to prevent duplicate indexing. Handled via React Router v7 `meta()` exports on each route module.

### Sitemap and Robots
- `public/sitemap.xml` lists all static routes with change frequency and priority.
- `public/robots.txt` points search engines to the sitemap.

---

## Analytics and Privacy

The site uses Google Analytics 4 with Consent Mode v2 in **gated-load mode**. No data is sent to Google until the user clicks Accept on the cookie banner. The `gtag.js` script itself is not loaded until that point. Cross-domain measurement between `offon.dev` and `community.offon.dev` is configured in the GA4 admin UI, not in this codebase. See the Analytics and Consent section of `CLAUDE.md` for the full design.

### Configuration

The following constants in `src/data/constants.ts` drive the analytics setup:

| Constant | Purpose |
|---|---|
| `GA_MEASUREMENT_ID` | GA4 Measurement ID. Used by `useConsent.tsx` only, when it injects `gtag.js` on Accept. |
| `CONSENT_STORAGE_KEY` | `localStorage` key for the consent decision. |
| `CONSENT_EXPIRY_MS` | Stored consent expiry (180 days). |

### How it works

- `src/root.tsx` ships a minimal inline `<head>` bootstrap that bootstraps `dataLayer`, defines `window.gtag` as the push shim, and sets all four GDPR consent signals to denied. It does not load gtag.js, does not push `js` or `config`, and does not read `localStorage`.
- `src/hooks/useConsent.tsx` owns the React-side state and the `gtag.js` injector. On Accept (or on mount when localStorage records a granted decision), the injector pushes `consent update granted` + `js` + `config` into `dataLayer` synchronously before appending the `<script src="...gtag/js?id=...">` tag. A module-scoped boolean ensures the script is appended at most once per session.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice. Once consent is set, it renders a floating cookie icon button (bottom-right) that calls `reset()` to reopen the banner.
- `src/Layout.tsx` fires `page_view` on every route change and `click_event` for every `<a>`/`<button>` click via `useClickTracking`. Both gate on `consent === "granted"` so events do not accumulate in `dataLayer` while gtag.js is not loaded.
- On Decline or Reset, the hook clears any `_ga*` cookies that gtag.js may have set during a prior granted session. The script tag is not removed.
- `/privacy` (`src/pages/Privacy.tsx`) is the GDPR Art. 13 privacy policy. Contact: offondev@gmail.com and `${COMMUNITY_URL}/groups/moderators`.

---

## Deployment

Deployment is automated via GitHub Actions:

- **Push to `main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and deploys to GitHub Pages. Production URL: **https://offon.dev**.
- **Open a PR** triggers [`.github/workflows/preview.yml`](.github/workflows/preview.yml), which runs lint, build, unit tests, and the full Playwright suite (axe, a11y, smoke) before deploying a preview at `/pr-preview/pr-<n>/`.
- **PRs touching adventure data** also trigger [`.github/workflows/validate-adventures.yml`](.github/workflows/validate-adventures.yml), which validates YAML schema, checks that generated files are up-to-date (including `public/llms.txt`), and verifies sitemap/prerender/leaderboard consistency.
- **PRs adding components, hooks, utilities, constants, scripts, or workflows** trigger [`.github/workflows/validate-docs.yml`](.github/workflows/validate-docs.yml), which runs `scripts/check-docs.sh` and fails if the relevant documentation (`styleguide.md` or `README.md`) was not updated in the same PR.

`dist/client/404/index.html` (the prerendered 404 page) is copied to `dist/client/404.html` as a fallback for unknown routes. Each valid route has its own prerendered `index.html` so GitHub Pages serves a 200 directly.

PR preview builds set the `VITE_BASE_PATH` environment variable to `/pr-preview/pr-<n>/` so all asset paths resolve correctly under the preview sub-path.

## Adding Adventures and Levels

Adventures are authored in [off-on-dev/open-source-challenges](https://github.com/off-on-dev/open-source-challenges) and pulled into this site via the **Sync Adventure from Challenges Repo** GitHub Actions workflow. The workflow fetches content, generates all TypeScript data files, and opens a PR with a checklist of steps to complete before merging.

See [`ADVENTURES.md`](ADVENTURES.md) for the full guide, including how to complete the PR checklist, how to add a new level to an existing adventure, and what happens when you re-sync a PR that already has manual edits.

## Accessibility

OffOn targets WCAG 2.2 Level AA across every page, in both light and dark mode. Automated axe-core scans run on every pull request preview via [`e2e/smoke.spec.ts`](e2e/smoke.spec.ts). The full statement, supported environments, known limitations, and how to report a barrier are in [`ACCESSIBILITY.md`](ACCESSIBILITY.md). Contributor rules are in the Accessibility section of [`CLAUDE.md`](CLAUDE.md#accessibility-wcag-22-aa-mandatory).

## Further Reading

- [`ADVENTURES.md`](ADVENTURES.md): full guide to syncing, reviewing, and updating adventures and levels via GitHub Actions.
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md): public accessibility statement, supported environments, and how to report a barrier.
- [`PERFORMANCE.md`](PERFORMANCE.md): performance targets, image rules, font preloading, and bundle size guidance.
- [`styleguide.md`](styleguide.md): design system, color tokens, typography, component patterns, and light/dark mode rules.
- [`CLAUDE.md`](CLAUDE.md): contributor conventions, code quality rules, commit format, testing requirements, and accessibility standards.
