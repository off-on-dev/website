# AGENTS.md

Guidance for AI coding agents (Codex, Claude, Copilot, etc.) working in this repository.

---

## Project Overview

A React website scaffolded with Lovable and deployed to GitHub Pages. The site is fully
static — there is no backend, no server-side rendering, and no database.

**Stack:**
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI)
- React Router (client-side routing)
- Vitest (unit tests)

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
public/
  fonts/        # Self-hosted fonts (Inter, Syne, Azeret Mono)
.github/
  workflows/
    deploy.yml  # Production deploy to GitHub Pages (push to main)
    preview.yml # PR preview deploy
```

---

## Commands

```sh
npm run dev          # Start local dev server (http://localhost:8080)
npm run build        # Production build → dist/
npm run build:dev    # Dev-mode build
npm run lint         # ESLint
npm test             # Run tests once (Vitest)
npm run test:watch   # Tests in watch mode
npm run preview      # Serve the production build locally
```

Always run `npm run lint` and `npm test` before declaring a task done.

---

## Code Conventions

### TypeScript
- `noImplicitAny: false` and `strictNullChecks: false` are intentional — do not change them.
- Use `@/*` path alias for all imports from `src/`: e.g. `import { cn } from "@/lib/utils"`.
- Prefer `type` over `interface` for object shapes.

### React
- All components are functional — no class components.
- Named exports only (`export function MyComponent`), not default exports.
- Component files use PascalCase (`MyComponent.tsx`).
- Keep components small; extract sub-components into `components/` rather than inline nesting.

### Styling
- Use Tailwind utility classes directly on JSX elements.
- Follow the token system in `styleguide.md` — do not hardcode hex colors or pixel values.
- Dark mode is the default; the design is dark-first. Do not add a light-mode toggle unless asked.
- Font utilities: `font-heading` → Syne, `font-sans` → Inter, `font-mono` → Azeret Mono.
- All fonts are self-hosted under `public/fonts/`. Do not add Google Fonts or external font URLs.

### Components
- Use shadcn/ui components from `src/components/ui/` for all generic UI primitives.
- To add a new shadcn component: `npx shadcn@latest add <component>`.
- Do not modify files inside `src/components/ui/` directly unless fixing a bug.

### Data
- Static content lives in `src/data/` as typed TypeScript objects/arrays.
- No `fetch` calls at build time or runtime unless explicitly requested.

---

## Testing

- Test files live in `src/test/` or co-located alongside the module as `*.test.ts(x)`.
- Write tests for any logic in `src/lib/` and `src/hooks/`.
- Visual components do not require tests unless they contain non-trivial logic.
- Target ≥ 80% coverage for new utility/hook files.

---

## Git

- Branch naming: `type/short-description` (e.g. `feat/hero-section`, `fix/nav-scroll`).
- All commits must be signed off: use `git commit -s`.
- Never force-push to `main`.
- PR titles should follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

---

## Deployment

- `main` triggers `deploy.yml` → production GitHub Pages.
- Open PRs trigger `preview.yml` → preview deployment.
- Only static files in `dist/` are deployed; no server config needed.

---

## Do Not

- Do not add a backend, API routes, or server-side rendering.
- Do not add external font or icon CDN links — all assets must be self-hosted.
- Do not change `vite.config.ts` base path without verifying GitHub Pages routing.
- Do not install new dependencies without checking if a shadcn/ui or existing utility already covers the need.
- Do not commit secrets, tokens, or credentials.
