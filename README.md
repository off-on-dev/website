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

The site uses Google Analytics 4 with Consent Mode v2. No data is collected until the user explicitly accepts via the consent banner.

### Configuration

`GA_MEASUREMENT_ID` in `src/data/constants.ts` holds the GA4 Measurement ID. The gtag snippet in `src/root.tsx` must match this value. If you update the ID, change it in both places.

### How it works

- `src/root.tsx` loads gtag.js with all consent signals set to `denied` by default (Consent Mode v2).
- `src/hooks/useConsent.tsx` manages the user's choice, stored in `localStorage` as `analytics_consent` with a 6-month expiry. On grant, it calls `gtag('consent', 'update', { analytics_storage: 'granted' })`.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice. Once consent is set, it renders a floating cookie icon button (bottom-right) that calls `reset()` to reopen the banner.
- `src/Layout.tsx` fires a `page_view` event on every route change (via `ScrollToTop`), but only when consent is `"granted"`.
- `/privacy` (`src/pages/Privacy.tsx`) is the GDPR Art. 13 privacy policy. Contact: offondev@gmail.com and `${COMMUNITY_URL}/groups/moderators`.

---

## Deployment

Deployment is automated via GitHub Actions:

- **Push to `main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and deploys to GitHub Pages. Production URL: **https://offon.dev**.
- **Open a PR** triggers [`.github/workflows/preview.yml`](.github/workflows/preview.yml), which deploys a preview at `/pr-preview/pr-<n>/`.

`dist/client/404/index.html` (the prerendered 404 page) is copied to `dist/client/404.html` as a fallback for unknown routes. Each valid route has its own prerendered `index.html` so GitHub Pages serves a 200 directly.

PR preview builds set the `VITE_BASE_PATH` environment variable to `/pr-preview/pr-<n>/` so all asset paths resolve correctly under the preview sub-path.

## Further Reading

- [`styleguide.md`](styleguide.md): design system, color tokens, typography, component patterns, and light/dark mode rules.
- [`CLAUDE.md`](CLAUDE.md): contributor conventions, code quality rules, commit format, testing requirements, and accessibility standards.
