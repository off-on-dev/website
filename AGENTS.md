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

## URLs and External Organisations

- The GitHub Pages URL for this site is https://off-on-dev.github.io/website
- The custom domain offon.dev is not yet configured. Do not use it in any URLs until it is set up on GitHub Pages.
- og:url, og:image, and all absolute URLs must use https://off-on-dev.github.io/website until the custom domain is live.
- The og:image file is public/og.png and its full URL is https://off-on-dev.github.io/website/og.png.
- The open source challenges content lives in a separate organisation at https://github.com/dynatrace-oss/open-ecosystem-challenges. This is an intentional external link and must never be changed or flagged as a violation.
- The community Discourse instance is at https://community.open-ecosystem.com. Use the COMMUNITY_URL constant from src/data/constants.ts, never hardcode this URL.

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
- Every new hook, utility function, or stateful component must have tests covering:
  - The happy path (expected inputs produce expected outputs)
  - Edge cases (empty state, expired data, missing provider, etc.)
  - All state transitions for any multi-state feature
- Tests must be written as part of the implementation, not as an afterthought.
- If a component or hook has side effects (DOM mutations, localStorage, external scripts),
  mock those side effects in tests and assert they are called correctly.
- When fixing a bug, add a regression test that would have caught it before writing the fix.

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

## Before Submitting Code

Every code change must pass all of these checks before being considered done.
State the result of each check explicitly before finishing a task.

### Mandatory checks (non-negotiable)

1. **Run lint:** `npm run lint` must exit with zero errors. No warnings suppressed
   with eslint-disable unless the reason is documented in a comment on the same line.

2. **Run tests:** `npm test` must pass with zero failures. No tests skipped or
   commented out.

3. **Run build:** `npm run build` must complete with no TypeScript errors or
   bundling failures. Run this for any change that touches types, imports, or
   component interfaces.

4. **Re-read every file you changed:** After making changes, re-read the full
   affected section of each modified file to verify the final state is correct.
   Never assume an edit landed correctly without checking.

5. **Check all call sites:** If you changed a function signature, component props,
   or exported type, search for all usages and confirm they are updated.

6. **Check imports:** Every import must resolve. No unused imports. No circular
   dependencies introduced.

### Before writing any code

1. Read the relevant files first. Never edit a file you have not read in this session.
2. If the change touches more than one file, list all affected files before starting.
3. If the change involves a state machine, enumerate all transitions first.
4. If the change involves shared state, confirm a context provider is used.
5. If the change involves a side effect (DOM, localStorage, external scripts),
   write the test before or alongside the implementation, not after.

### Red flags that require stopping and flagging to the user

- A fix requires changing more than 3 files you did not plan to change
- A type error requires adding a cast or suppression to resolve
- A test requires mocking something that was not mocked before
- The same bug has been fixed more than once in this session
- A replacement did not change the file (silent no-op)

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

- Always read `styleguide.md` before making any UI, copy, or component changes.
  It is the source of truth for typography, color tokens, spacing, and brand rules.
  Never introduce values that contradict it.
- Always check `tailwind.config.ts` and `src/index.css` for existing tokens before
  introducing new values.
- Always check `src/components/ui/` for existing shadcn components before building
  something new.
- Flag any accessibility concerns before writing the code, not after.
- Flag any breaking changes explicitly.
- Prefer simple, readable solutions over clever ones.
- If something could be done multiple ways, briefly explain the tradeoff and
  recommend one approach.

---

## After Making Changes

Documentation updates are not optional. They are part of completing a task.
A task is not done until the relevant docs are updated. Run this checklist
before every commit:

### Always check these four things after any non-trivial change:

1. **Did you add or change a component, hook, or utility?**
   If yes, update `styleguide.md` with a brief entry under the relevant section.
   Include: what it does, its props or return type, and any usage notes.
   Do not skip this even for small hooks.

2. **Did you add or change a page or route?**
   If yes, update the routes table in `README.md` with the path and purpose.

3. **Did you add or change an environment variable, constant, or config value?**
   If yes, document it in `README.md`. If it affects visual output, add it to
   `styleguide.md` too. Never reference a constant value directly in docs,
   point to the file it lives in instead.

4. **Did you change a build, deploy, or dev workflow?**
   If yes, update the Commands section in both `AGENTS.md` and `README.md`.

### After completing any task, explicitly state:
- Which of the four checks above applied
- What was updated in each doc, or why it was skipped
- If nothing needed updating, say so and explain why

### Triggers and what to update:

| Change | Update |
|---|---|
| New component | styleguide.md: component entry with props and usage |
| New hook | styleguide.md: hook entry with return type and behavior |
| New utility function | styleguide.md: brief entry if it affects patterns |
| New page or route | README.md: routes table |
| New constant | README.md: constants section, styleguide.md if visual |
| New workflow step | README.md: commands section, AGENTS.md if it changes a rule |
| New brand or copy rule | styleguide.md first, then apply across codebase |
| Bug fix that reveals a missing rule | AGENTS.md: add the rule to prevent recurrence |
| New test pattern | AGENTS.md: add to Testing section if it sets a precedent |

Do not document trivial fixes (typos, one-line patches) unless they change a
rule or pattern others should follow.

---

## Implementation Rules

These rules exist to prevent specific classes of mistakes. Follow them unconditionally.

### Shared state
- If a hook or piece of state is consumed by more than one sibling component, it must
  be a React context provider, not a plain hook. Verify this at design time before
  writing any code.

### File edits
- After any multi-step or multi-replace file edit, re-read the full affected section
  to verify the final state is correct. Never assume sequential replacements composed
  correctly without checking.

### File extensions
- Any file that renders or returns JSX must use the `.tsx` extension. Files that are
  pure TypeScript logic with no JSX use `.ts`. Catch this before writing, not after lint.

### React hooks
- Each `useEffect` must have a single responsibility. Never combine side effects that
  have different trigger conditions into one effect with a merged dependency array.
  Split them into separate `useEffect` calls.

### State machines
- When implementing any feature with multiple states (e.g. consent: granted / denied /
  null), enumerate every transition before writing code. For each transition, list every
  system that must be updated (storage, UI state, external APIs, DOM). Verify all of
  them are handled before marking the task done.