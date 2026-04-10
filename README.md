# offon.dev

The source for [offon.dev](https://off-on-dev.github.io/website/) — a static React website for the Open Ecosystem community. Hands-on challenges, documentation, and community links.

## Tech Stack

- **Vite** — build tooling and dev server
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component library built on Radix UI
- **React Router** — client-side routing
- **Vitest** — unit testing

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

- **Push to `main`** → [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys to GitHub Pages (`gh-pages` branch).
- **Open a PR** → [`.github/workflows/preview.yml`](.github/workflows/preview.yml) builds a preview at `/website/pr-preview/pr-<n>/`.

The `dist/index.html` is copied to `dist/404.html` so that React Router's client-side routing works on direct URL loads.

## Project Structure

```
src/
  components/   # Reusable UI components (named exports, PascalCase)
  components/ui # shadcn/ui primitives — do not edit directly
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

## Contributing

See [`AGENTS.md`](AGENTS.md) for coding conventions, design tokens, and contribution guidelines.
