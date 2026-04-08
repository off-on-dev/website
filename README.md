# Website

A React web application initially scaffolded with [Lovable](https://lovable.dev) and adapted for deployment on GitHub Pages.

## Tech Stack

- **Vite** — build tooling and dev server
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component library built on Radix UI
- **React Router** — client-side routing
- **Vitest** — unit testing

## Getting Started

Node.js and npm are required. Install Node via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if needed.

```sh
# Clone the repo
git clone https://github.com/off-on-dev/website
cd website

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Deployment

The site is deployed via GitHub Pages. Push to the main branch to trigger a deployment (configure via GitHub Actions or the Pages settings as appropriate for this repo).

## Project Structure

```
src/
  components/   # Reusable UI components
  pages/        # Route-level page components
  data/         # Static data files
  hooks/        # Custom React hooks
  lib/          # Shared utilities
  assets/       # Static assets
```
