# Copilot Instructions

Guidance for AI coding agents working in this repository.

---

## Project Overview

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts.
It is fully static with no backend, no SSR, and no database.

Community activity happens on a separate Discourse instance at **community.offon.dev**,
which is not part of this repository. Do not attempt to replicate or integrate
Discourse functionality here.

---

## Stack

- **Framework:** React with TypeScript, bundled via Vite. Check `package.json` for current versions.
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI primitives), live in `src/components/ui/`
- **Routing:** React Router (client-side)
- **Testing:** Vitest + @testing-library/react
- **Hosting:** GitHub Pages
- **PR previews:** pr-preview-action

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
npm run build        # Production build -> dist/
npm run build:dev    # Dev-mode build
npm run lint         # ESLint
npm test             # Run tests once (Vitest)
npm run test:watch   # Tests in watch mode
npm run preview      # Serve the production build locally

npx shadcn@latest add <component>   # Add a shadcn/ui component
```

Always run `npm run lint` and `npm test` before declaring a task done.

---

## Code Quality

- Use explicit return types on all functions and components.
- Prefer named exports for components.
- Keep components small and single-responsibility.
- Use functional components with hooks only. No class components.
- Prefer `const` over `let`, never `var`.
- Use async/await over promise chains. Always handle errors explicitly.
- Never leave unused imports, variables, or dead code.
- Write self-documenting code. Add comments only for non-obvious logic.

---

## Stability Rules

- Never remove or rename existing exports without checking all usages first.
- Never change a component's props interface without updating all call sites.
- Never delete files without confirming they are unused.
- When refactoring, change one thing at a time. Do not mix refactors with feature changes.
- Always verify no TypeScript errors after making changes.
- Prefer extending existing components over rewriting them.
- If a change could break something, flag it explicitly before proceeding.
- Never force-push to `main`.

---

## TypeScript

- `noImplicitAny: false` and `strictNullChecks: false` are intentional. Do not change them.
- Avoid `any` in new code. Use proper types or `unknown` with narrowing.
- Never use `@ts-ignore`.
- Use `@/*` path alias for all imports from `src/`: e.g. `import { cn } from "@/lib/utils"`.
- Prefer `type` over `interface` for object shapes.

---

## Components

- Always check `src/components/ui/` before building a new primitive.
- To add a missing shadcn component: `npx shadcn@latest add <component>`.
- Never modify files inside `src/components/ui/` directly. Extend or wrap them in `src/components/`.
- Page-level components go in `src/pages/`. Reusable components go in `src/components/`.
- Extract sub-components into `src/components/` rather than nesting them inline.

---

## Data

- Static content lives in `src/data/` as typed TypeScript objects/arrays.
- No `fetch` calls at build time or runtime unless explicitly requested.
- Do not install new dependencies without checking if shadcn/ui or an existing utility already covers the need.

---

## Styling

- Use Tailwind utility classes directly on JSX elements.
- Always check `tailwind.config.ts` and `src/index.css` before introducing any new color,
  font, spacing, or border radius value. Never hardcode these.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`,
  `text-foreground`) that shadcn sets up. Never hardcode a color that only works in one mode.
- Never add a `dark:` override without a corresponding base (light) style.
- Mobile first. Write base styles for mobile, then add `sm:`, `md:`, `lg:` breakpoints as needed.
- Font utilities: `font-heading` (Syne), `font-sans` (Inter), `font-mono` (Azeret Mono).
- All fonts are self-hosted under `public/fonts/`. Never add Google Fonts or external font URLs.
- Never write custom CSS unless Tailwind genuinely cannot do the job.
  If you must, add it to `src/index.css` with a comment explaining why.

---

## Accessibility (WCAG 2.1 AA, mandatory)

Check the following on every component you write or modify.

### Color contrast
- Normal text (under 18px / non-bold under 14px): minimum 4.5:1 ratio
- Large text (18px+ or bold 14px+): minimum 3:1 ratio
- UI components and focus indicators: minimum 3:1 against adjacent colors
- Never rely on color alone to convey meaning. Always pair with text, icon, or pattern.
- Always verify contrast in both light and dark mode.

### Keyboard navigation
- Every interactive element must be reachable and operable via keyboard.
- Tab order must follow a logical reading order.
- Never remove focus outlines. Use `focus-visible` utilities to style them.
  Standard pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2`
  (adjust ring offset as needed; use `ring-offset-1` for inline elements, `ring-offset-2` for blocks)
- Modals must trap focus while open and return focus on close. Use shadcn `Dialog`.

### Semantic HTML
- Use the correct element for the job (`<button>` for actions, `<a>` for navigation,
  `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`).
- Never use a `<div>` or `<span>` as an interactive element. Use the right element instead.
- One `<h1>` per page. No skipped heading levels.

### ARIA
- Only add ARIA attributes when semantic HTML is not enough.
- Never use ARIA to paper over bad markup. Fix the markup first.
- Always add `aria-label` or `aria-labelledby` to icon-only buttons.
- Use `aria-expanded` on toggles that open/close UI (e.g., menu buttons).
- Use `aria-live` regions for dynamic content updates.

### Images and media
- Every `<img>` must have an `alt` attribute. Decorative images use `alt=""`.
- Icons that convey meaning need an `aria-label` or accompanying visible text.

---

## Testing

- Use Vitest for all unit and integration tests.
- Use `@testing-library/react` for component tests. Test from the user's perspective,
  not implementation details.
- Test files live in `src/test/` or co-located alongside the module as `*.test.ts(x)`.
- Write tests for all logic in `src/lib/` and `src/hooks/`. Target 80% coverage for
  new utility and hook files.
- Visual components do not require tests unless they contain non-trivial logic.
- Prefer `getByRole` and `getByLabelText` queries over `getByTestId`. They also
  validate accessibility.
- Never ship code that causes test or lint failures.

---

## SEO

This is a fully static React site. Apply these practices on every page.

### Document structure
- Every page must have a unique, descriptive `<title>` tag.
- Every page must have a `<meta name="description">` under 160 characters.
- Add Open Graph tags to every page: `og:title`, `og:description`, `og:url`,
  `og:type`, and `og:image` where an image is available.
- Add Twitter meta tags: always include `twitter:card` (use `summary_large_image` for pages with images),
  `twitter:title`, `twitter:description`, and `twitter:image`.
- Use React Helmet or equivalent to manage head tags per page. Do not rely on
  `index.html` alone.

### Heading hierarchy
- One `<h1>` per page that clearly describes the page topic.
- Headings follow a logical order with no skipped levels.
- Include relevant keywords in headings naturally, not forced.

### Links and navigation
- Internal links use React Router `<Link>`. Never trigger full page reloads.
- Use descriptive link text. Never use "click here" or "read more" alone.
- Canonical URLs must reflect the GitHub Pages base path correctly.

### Performance
- Keep bundle size in check. Avoid large dependencies for small tasks.
- Lazy load page components with `React.lazy` and `Suspense` where practical.
- Avoid layout shift. Set explicit dimensions on images and media.

---

## Content and Copy

All written content, code comments, commit messages, and documentation must follow
these rules.

### Brand Name
- The brand is always written **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".
- In code, always use the `BRAND_NAME` constant from `src/data/constants.ts` instead of hardcoding the string.
- The domain `offon.dev` is always lowercase (it is a URL, not a brand mention).

### Tone
- Direct, positive, and community-focused.
- Write for open source enthusiasts, not a corporate audience.
- Use plain language. Avoid jargon unless it is standard in open source contexts.
- Avoid passive voice where an active one works.
- Keep sentences short and scannable.

### Formatting
- Never use em dashes anywhere, including comments and documentation.
  Use commas, periods, or restructure the sentence instead.
- Maintain a cohesive tone across all pages and components.
- Do not mix formal and casual registers within the same page.

---

## Git

- Branch naming: `type/short-description` (e.g. `feat/hero-section`, `fix/nav-scroll`).
- All commits must be signed off: `git commit -s`.
- Never force-push to `main`.
- PR titles follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

### Commit types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | CSS or formatting changes |
| `refactor` | Code restructure, no feature or fix |
| `chore` | Maintenance, dependencies |
| `perf` | Performance improvements |
| `security` | Security fixes |
| `config` | Configuration changes |
| `revert` | Reverting a previous commit |

---

## Deployment

- Push to `main` triggers `deploy.yml` and deploys to GitHub Pages.
- Open PRs trigger `preview.yml` and create a PR preview deployment.
- Only static files in `dist/` are deployed. No server config is needed.
- Never change `vite.config.ts` base path without verifying GitHub Pages routing.

---

## Do Not

- Do not add a backend, API routes, or server-side rendering.
- Do not add external font or icon CDN links. All assets must be self-hosted.
- Do not change `vite.config.ts` base path without verifying GitHub Pages routing.
- Do not install new dependencies without checking if shadcn/ui or an existing utility covers the need.
- Do not commit secrets, tokens, or credentials.
- Do not use em dashes anywhere in the codebase, content, or documentation.

---

## When Suggesting Code

- Always check `tailwind.config.ts` and `src/index.css` for existing tokens before
  introducing new values.
- Always check `src/components/ui/` for existing shadcn components before building
  something new.
- Flag any accessibility concerns before writing the code, not after.
- Flag any breaking changes explicitly.
- Prefer simple, readable solutions over clever ones.
- If something could be done multiple ways, briefly explain the tradeoff and
  recommend one approach.