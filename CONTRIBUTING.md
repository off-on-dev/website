# Contributing to offon.dev

Thanks for your interest in contributing. This guide covers everything you need to get started.

---

## Prerequisites

- **Node.js 26** (pinned in `.nvmrc`). Run `nvm use` to switch automatically.
- No backend setup required. The site is fully static.

## Local setup

1. Fork the repo on GitHub, then clone your fork:

```sh
git clone https://github.com/<your-username>/website.git
cd website
nvm use
npm install
npm run dev        # http://localhost:8080
```

1. Add the upstream remote so you can pull in future changes:

```sh
git remote add upstream https://github.com/off-on-dev/website.git
```

Open PRs from your fork against `main` on the upstream repo.

## Running checks

```sh
npm run lint             # ESLint
npm test                 # Vitest unit tests
npm run build && npm run test:e2e  # Playwright smoke, SSG, a11y, and hydration tests
```

All three must pass with zero failures before opening a PR.

## Conventions

**Branch naming:** `type/short-description` (e.g. `feat/hero-section`, `fix/nav-scroll`)

**Commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `perf`, `security`, `config`, `revert`

**Commit sign-off:** Every commit must include a sign-off:

```sh
git commit -s -m "feat: add contributor badge"
```

**PR titles** follow the same conventional commit format: `feat: ...`, `fix: ...`, etc.

## Code style

- TypeScript with explicit return types on all functions and components.
- Functional components with hooks only. No class components.
- Tailwind utility classes directly on JSX. No inline styles.
- Both light and dark mode must work for every UI change.

Full rules are in [CLAUDE.md](CLAUDE.md) and [styleguide.md](styleguide.md).

## Accessibility

Every component must meet WCAG 2.2 AA. Read [ACCESSIBILITY.md](ACCESSIBILITY.md) before writing or modifying any component. The axe audit runs automatically on every PR.

## Adventure content

Adventures are authored as YAML and compiled to TypeScript. Do not edit `*.generated.ts` files by hand. See [ADVENTURES.md](ADVENTURES.md) for the full content pipeline.

## Need help?

Open an issue or start a discussion on [community.offon.dev](https://community.offon.dev).
