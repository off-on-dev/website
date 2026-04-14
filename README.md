# offon.dev

The source for [offon.dev](https://offon.dev/), a static React website for the OffOn community. Hands-on challenges, documentation, and community links.

## Tech Stack

- **Vite** - build tooling and dev server
- **React 18** + **TypeScript**
- **Tailwind CSS** - utility-first styling
- **shadcn/ui** - accessible component library built on Radix UI
- **React Router** - client-side routing
- **Vitest** - unit testing

## Getting Started

Node.js version is specified in .nvmrc. Use nvm use to switch to the correct version automatically, or check .nvmrc for the required version.

```sh
# Clone the repo
git clone https://github.com/off-on-dev/website
cd website

# Install dependencies
npm install

# Start the development server (http://localhost:8080)
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

Run `npm run lint` and `npm test` before marking any work done.

## Deployment

Deployment is fully automated via GitHub Actions:

- **Push to `main`** → [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds with `npm run build`, uploads artifacts, and deploys to GitHub Pages using the official [`actions/deploy-pages`](https://github.com/actions/deploy-pages).
- **Open a PR** → [`.github/workflows/preview.yml`](.github/workflows/preview.yml) builds a preview at `/pr-preview/pr-<n>/`.

The `dist/index.html` is copied to `dist/404.html` so that React Router's client-side routing works on direct URL loads.


## Project Structure

```
src/
  components/   # Reusable UI components (named exports, PascalCase)
  components/ui # shadcn/ui primitives, do not edit directly
  pages/        # Route-level page components
                # All page components are lazy-loaded via React.lazy + Suspense in App.tsx
  data/         # Static data (TypeScript objects/arrays)
  hooks/        # Custom React hooks
  lib/          # Shared utilities (cn())
  assets/       # Static assets bundled by Vite
public/
  fonts/        # Self-hosted Inter, Syne, Azeret Mono
  robots.txt
  og.png
.github/
  workflows/
    deploy.yml  # Production deploy on push to main
    preview.yml # PR preview deploy
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

## Contributing

See [`AGENTS.md`](AGENTS.md) for coding conventions, design tokens, and contribution guidelines.
