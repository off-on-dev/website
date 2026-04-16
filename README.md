# offon.dev

Source for [offon.dev](https://offon.dev/), the home of OffOn: a platform for open source enthusiasts. The site is fully static with no backend or SSR. It hosts hands-on open source challenges, community documentation, and links to the OffOn community.

## Tech Stack

- **React 18** + **TypeScript** — UI and type safety
- **Vite** — build tooling and dev server
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component primitives built on Radix UI
- **React Router v6** — client-side routing
- **Vitest** — unit testing
- **GitHub Pages** — hosting and deployment

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

Node.js **22** is required. Version is pinned in `.nvmrc` — run `nvm use` to switch automatically.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server at http://localhost:8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Dev-mode build (source maps, no minification) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run the full test suite once |
| `npm run test:watch` | Run tests in watch mode |

Run `npm run lint` and `npm test` before marking any work done.

## Project Structure

```
src/
  components/     # Reusable UI components (named exports, PascalCase files)
  components/ui/  # shadcn/ui primitives — do not edit directly
  pages/          # Route-level page components (lazy-loaded via React.lazy)
  data/           # Static content as typed TypeScript objects and arrays
  hooks/          # Custom React hooks
  lib/            # Shared utilities
  test/           # Vitest + Testing Library test files
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
| `/adventures/:id` | `AdventureDetail.tsx` | Adventure landing |
| `/adventures/:id/levels/:levelId` | `ChallengeDetail.tsx` | Individual challenge |
| `/sponsors` | `Sponsors.tsx` | Sponsorship info |
| `/about` | `About.tsx` | About the community |
| `/docs` | redirects to `/docs/community-guide` | |
| `/docs/community-guide` | `CommunityGuide.tsx` | Community documentation |
| `/privacy` | `Privacy.tsx` | GDPR-compliant privacy policy |
| `*` | `NotFound.tsx` | 404 fallback |

> **Technology tag filtering** is handled inline on the home page, adventure detail, and challenge detail pages via local `useState`. There is no dedicated `/topics/:tag` route.

## SEO and Metadata

### Web Manifest
`public/site.webmanifest` defines the web app identity, used by browsers and PWA tools. It includes:
- App name, short name, and description
- Icon references (favicon and apple-touch-icon)
- Theme and background colors
- Display mode (standalone)

### Schema.org Structured Data
`index.html` includes a JSON-LD `<script>` block with `@type: "WebSite"` for semantic web indexing. This helps search engines understand the site's purpose and content.

### Open Graph Tags
All pages include complete OG tags:
- `og:title`, `og:description`, `og:url`, `og:image`
- `og:image:width`, `og:image:height`, `og:image:alt` (required for proper image rendering in social previews)
- `og:site_name` (brand), `og:locale` (en_GB)
- `og:type` (website or article, depending on page)

All dynamic pages (adventure & challenge details) generate page-specific OG tags via react-helmet-async.

### Twitter Card Tags
All pages include:
- `twitter:card` (summary_large_image)
- `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`

### Canonical Links
Each page declares its canonical URL to prevent duplicate indexing. Handled via react-helmet-async Helmet on each page.

### Sitemap and Robots
- `public/sitemap.xml` lists all static routes with change frequency and priority.
- `public/robots.txt` points search engines to the sitemap.

---

## Analytics and Privacy

The site uses Google Analytics 4 with Consent Mode v2. No data is collected until the user explicitly accepts via the consent banner.

### Configuration

`GA_MEASUREMENT_ID` in `src/data/constants.ts` holds the GA4 Measurement ID. The gtag snippet in `index.html` must match this value. If you update the ID, change it in both places.

### How it works

- `index.html` loads gtag.js with all consent signals set to `denied` by default (Consent Mode v2).
- `src/hooks/useConsent.tsx` manages the user's choice, stored in `localStorage` as `analytics_consent` with a 6-month expiry. On grant, it calls `gtag('consent', 'update', { analytics_storage: 'granted' })`.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice.
- `src/components/CookiePreferencesLink.tsx` is placed in the Footer and calls `reset()` from `useConsent` to re-show the banner.
- `src/App.tsx` fires a `page_view` event on every route change, but only when consent is `"granted"`.
- `/privacy` (`src/pages/Privacy.tsx`) is the GDPR Art. 13 privacy policy. Contact: offondev@gmail.com and `${COMMUNITY_URL}/groups/moderators`.

---

## Deployment

Deployment is automated via GitHub Actions:

- **Push to `main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and deploys to GitHub Pages. Production URL: **https://offon.dev**.
- **Open a PR** triggers [`.github/workflows/preview.yml`](.github/workflows/preview.yml), which deploys a preview at `/pr-preview/pr-<n>/`.

`dist/index.html` is copied to `dist/404.html` so React Router's client-side routing works on direct URL loads.

## Further Reading

- [`styleguide.md`](styleguide.md) — design system: color tokens, typography, component patterns, and light/dark mode rules.
- [`AGENTS.md`](AGENTS.md) — contributor conventions: code quality rules, commit format, testing requirements, and accessibility standards.
