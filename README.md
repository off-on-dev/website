# offon.dev

Source for [offon.dev](https://offon.dev/), the home of OffOn: a platform for open source enthusiasts. The site is fully static with no backend. Pages are prerendered at build time using React Router v7 framework mode with `ssr: false`. It hosts hands-on open source challenges, community documentation, and links to the OffOn community.

## Tech Stack

- **React 19** + **TypeScript**: UI and type safety
- **Vite**: build tooling and dev server
- **Tailwind CSS**: utility-first styling
- **shadcn/ui**: accessible component primitives built on Radix UI
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

Node.js **22** is required. Version is pinned in `.nvmrc`, run `nvm use` to switch automatically.

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
| `npm run test:e2e` | Playwright smoke tests (requires `npm run build` first) |

Run `npm run lint` and `npm test` before marking any work done.

All UI changes must be verified at mobile (375px), tablet (768px), and desktop (1280px) viewports before being considered done. Always test against the production build (`npm run build && npm run preview`), never the dev server.

## Project Structure

```
src/
  components/     # Reusable UI components (named exports, PascalCase files)
  components/ui/  # shadcn/ui primitives, do not edit directly
  pages/          # Route-level page components
  data/           # Static content as typed TypeScript objects and arrays
  hooks/          # Custom React hooks
  lib/            # Shared utilities
  test/           # Vitest + Testing Library unit and component tests
  root.tsx        # HTML shell rendered by React Router v7 (replaces index.html)
  routes.ts       # Route definitions (React Router v7 config-based routing)
  entry.client.tsx  # Client entry: hydrates the full document via HydratedRouter
  entry.server.tsx  # Server/prerender entry: renderToPipeableStream for static HTML generation
  Layout.tsx      # App shell with all providers and Outlet
e2e/
  smoke.spec.ts   # Playwright smoke tests (requires npm run build first)
public/
  fonts/          # Self-hosted Inter, Syne, and JetBrains Mono font files
  sitemap.xml
  robots.txt
  og.png
```

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | `Index.tsx` | Home page |
| `/adventures` | `Adventures.tsx` | All adventures listing |
| `/adventures/:id` | `AdventureDetail.tsx` | Adventure landing |
| `/adventures/:id/levels/:levelId` | `ChallengeDetail.tsx` | Individual challenge |
| `/sponsors` | `Sponsors.tsx` | Sponsorship info |
| `/about` | `About.tsx` | About the community |
| `/handbook` | `CommunityGuide.tsx` | Community handbook / documentation |
| `/privacy` | `Privacy.tsx` | GDPR-compliant privacy policy |
| `/404` | `NotFound.tsx` | Prerendered 404 page |
| `/community-guide` | redirects to `/handbook` | Legacy alias |
| `/docs` | redirects to `/handbook` | Legacy alias |
| `/docs/community-guide` | redirects to `/handbook` | Legacy alias |
| `/topics/:tag` | redirects to `/#challenges` | Tag filter shortlink |
| `*` | `CatchAll.tsx` | Client-side 404 fallback (re-exports `NotFound.tsx`; required because React Router v7 needs unique files per route) |

> **Technology tag filtering** is handled inline on the home page, adventure detail, and challenge detail pages via local `useState`. Topics are filtered inline. `/topics/:tag` redirects to `/#challenges`.

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
- **Open a PR** triggers [`.github/workflows/preview.yml`](.github/workflows/preview.yml), which deploys a preview at `/pr-preview/pr-<n>/`.

`dist/client/404/index.html` (the prerendered 404 page) is copied to `dist/client/404.html` as a fallback for unknown routes. Each valid route has its own prerendered `index.html` so GitHub Pages serves a 200 directly.

PR preview builds set the `VITE_BASE_PATH` environment variable to `/pr-preview/pr-<n>/` so all asset paths resolve correctly under the preview sub-path.

## Adding Adventures and Levels

New adventures and levels can be scaffolded via GitHub Actions (recommended) or locally via scripts.

### Via GitHub Actions

Go to the repository's **Actions** tab, select the workflow, click **Run workflow**, and fill in the form inputs.

| Workflow | Inputs | What it does |
|---|---|---|
| **New Adventure** | `id`, `title`, `month`, `levels` (comma-separated) | Scaffolds a full adventure: TS file with TODOs, discussion JSON stubs, patches `react-router.config.ts` and `sitemap.xml`, opens a PR |
| **New Level** | `adventure` (existing ID), `level` (beginner/intermediate/expert) | Adds a level to an existing adventure: discussion JSON stub, patches config and sitemap, opens a PR with a TS snippet to paste |

Both workflows create a branch and open a PR automatically via `peter-evans/create-pull-request`. The PR description includes next steps (fill in content TODOs, run verification, etc.).

### Via local scripts

```sh
# Scaffold a new adventure with all required files
node scripts/new-adventure.mjs --id "signal-in-the-storm" --title "Signal in the Storm" --month "JUL 2026" --levels beginner,intermediate,expert

# Add a level to an existing adventure
node scripts/new-level.mjs --adventure "blind-by-design" --level expert
```

After running either script, fill in the TODO placeholders in the generated TS file, then:

1. Add the `discussionUrl` in `src/data/adventures/<id>/<level>.json`
2. Run `node scripts/refresh-discussions.mjs` to fetch posts
3. Run `npm run lint && npm test && npm run build && npm run test:e2e`

## Accessibility

OffOn targets WCAG 2.2 Level AA across every page, in both light and dark mode. Automated axe-core scans run on every pull request preview via [`e2e/smoke.spec.ts`](e2e/smoke.spec.ts). The full statement, supported environments, known limitations, and how to report a barrier are in [`ACCESSIBILITY.md`](ACCESSIBILITY.md). Contributor rules are in the Accessibility section of [`CLAUDE.md`](CLAUDE.md#accessibility-wcag-22-aa-mandatory).

## Further Reading

- [`ACCESSIBILITY.md`](ACCESSIBILITY.md): public accessibility statement, supported environments, and how to report a barrier.
- [`styleguide.md`](styleguide.md): design system, color tokens, typography, component patterns, and light/dark mode rules.
- [`CLAUDE.md`](CLAUDE.md): contributor conventions, code quality rules, commit format, testing requirements, and accessibility standards.
