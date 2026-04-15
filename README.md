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

Node.js version is specified in `.nvmrc`. Run `nvm use` to switch automatically.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server at http://localhost:8080 |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run the full test suite once |

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
  fonts/          # Self-hosted Inter, Syne, and Azeret Mono font files
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
| `/privacy` | `Privacy.tsx` | Privacy policy |
| `*` | `NotFound.tsx` | 404 fallback |

## Deployment

Deployment is automated via GitHub Actions:

- **Push to `main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and deploys to GitHub Pages. Production URL: **https://offon.dev**.
- **Open a PR** triggers [`.github/workflows/preview.yml`](.github/workflows/preview.yml), which deploys a preview at `/pr-preview/pr-<n>/`.

`dist/index.html` is copied to `dist/404.html` so React Router's client-side routing works on direct URL loads.

## Further Reading

- [`styleguide.md`](styleguide.md) — design system: color tokens, typography, component patterns, and light/dark mode rules.
- [`AGENTS.md`](AGENTS.md) — contributor conventions: code quality rules, commit format, testing requirements, and accessibility standards.
