# offon.dev

The source for [offon.dev](https://off-on-dev.github.io/website/), a static React website for the Open Ecosystem community. Hands-on challenges, documentation, and community links.

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
- **Open a PR** → [`.github/workflows/preview.yml`](.github/workflows/preview.yml) builds a preview at `/website/pr-preview/pr-<n>/`.

The `dist/index.html` is copied to `dist/404.html` so that React Router's client-side routing works on direct URL loads.

## Custom Domain Migration Checklist

Complete these steps in order when switching offon.dev to GitHub Pages.

### 1. GoDaddy DNS
- Log into GoDaddy and go to DNS Management for offon.dev
- Add 4 A records pointing the apex domain to GitHub Pages IPs:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- Add a CNAME record: name www, value off-on-dev.github.io
- Save and allow up to 24 hours for DNS propagation

### 2. GitHub Pages settings
- Go to the repository Settings, then Pages
- Under Custom domain, enter offon.dev and click Save
- Wait for the DNS check to pass and the Let's Encrypt certificate to be provisioned (can take up to 24 hours)
- Once the certificate is issued, enable Enforce HTTPS

### 3. Verify the domain is live
- Visit https://offon.dev and confirm the site loads over HTTPS
- Visit https://www.offon.dev and confirm it redirects to https://offon.dev
- Check the browser padlock to confirm the certificate is valid

### 4. Update vite.config.ts
- Change base: "/website/" to base: "/"
- This is required because GitHub Pages serves from the root with a custom domain, not a subdirectory

### 5. Update PR preview paths
- In .github/workflows/preview.yml, update the build step base path from /website/pr-preview/pr-${{ github.event.number }}/ to /pr-preview/pr-${{ github.event.number }}/
- Verify PR previews still work after the change

### 6. Update constants.ts
- In `src/data/constants.ts`, change `SITE_URL` from `https://off-on-dev.github.io/website` to `https://offon.dev`
- Update `GA_MEASUREMENT_ID` if a new property is needed for the custom domain (the GA4 data stream must include both the old and new hostnames, or you create a new property)

### 7. Update index.html manually
- Update og:url content to https://offon.dev/
- Update og:image content to https://offon.dev/og.png
- Update twitter:image content to https://offon.dev/og.png
- Remove the TODO comment above og:url

### 8. Update AGENTS.md
- In the URLs and External Organisations section, update the GitHub Pages URL to https://offon.dev
- Update the og:image URL
- Update the community.offon.dev reference if the Discourse URL has changed

### 9. Update README.md
- Update any remaining references to off-on-dev.github.io/website to offon.dev
- Update the Getting Started and Deployment sections if anything changed

### 10. Run a full audit
- Run npm run lint and npm test
- Check all pages for correct canonical URLs, og:url, og:image, and twitter:image
- Run a Lighthouse audit on the live site and check for SEO and performance regressions
- Verify PR previews still deploy and route correctly

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
| `/topics/:tag` | `TopicPage.tsx` | Topic / tag filtered view |
| `/privacy` | `Privacy.tsx` | GDPR-compliant privacy policy |
| `*` | `NotFound.tsx` | 404 fallback |

## Analytics and Privacy

The site uses Google Analytics 4 with Consent Mode v2. No data is collected until the user explicitly accepts via the consent banner.

### Configuration

`GA_MEASUREMENT_ID` in `src/data/constants.ts` holds the GA4 Measurement ID (`G-YEYE9DFHWE`). The gtag snippet in `index.html` must match this value. If you update the ID, change it in both places.

### How it works

- `index.html` loads gtag.js with all consent signals set to `denied` by default (Consent Mode v2).
- `src/hooks/useConsent.ts` manages the user's choice, stored in `localStorage` as `analytics_consent` with a 6-month expiry. On grant, it calls `gtag('consent', 'update', { analytics_storage: 'granted' })`.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice.
- `src/components/CookiePreferencesLink.tsx` is placed in the Footer and calls `reset()` from `useConsent` to re-show the banner.
- `src/App.tsx` fires a `page_view` event on every route change, but only when consent is `"granted"`.
- `/privacy` (`src/pages/Privacy.tsx`) is the GDPR Art. 13 privacy policy. Contact: offondev@gmail.com and `${COMMUNITY_URL}/groups/moderators`.

## Contributing

See [`AGENTS.md`](AGENTS.md) for coding conventions, design tokens, and contribution guidelines.
