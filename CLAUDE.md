# CLAUDE.md

Guidance for AI coding agents working in this repository.

---

## Icons

- Always use **lucide-react** for all icons. Do not add any other icon library.
- Decorative icons next to visible text: `aria-hidden="true"`, no `aria-label`.
- Icon-only interactive elements: add `aria-label` to the parent element, do not use `aria-hidden`.
- When placing an icon next to text in a link or button, always add `inline-flex items-center gap-1` to the container. A lone icon inside a plain `inline` element drops below the text baseline.
- See the Icons section of `styleguide.md` for the full icon map, size conventions, and current usage.
- **Brand/social icon exception:** Official brand SVGs (e.g. the LinkedIn "in" mark) are exempt from the lucide-react-only rule when no equivalent exists in lucide-react. Place the SVG inline, set `aria-hidden="true"` on the `<svg>` element, and put `aria-label` on the parent interactive element. Use `fill="currentColor"` so hover and theme color changes apply. Document every brand SVG addition in the Icon map table in `styleguide.md`. Current exceptions: LinkedIn icon in `Footer.tsx`.

---

## Project Overview

**offon.dev** is the main website for OffOn, a platform for open source enthusiasts.
It is fully static with no backend and no database. Pages are prerendered at build time using React Router v7 framework mode (`ssr: false`).

Community activity happens on a separate Discourse instance. Its display name is **community.offon.dev**, but the real URL is managed via the `COMMUNITY_URL` constant in `src/data/constants.ts`. Do not hardcode it. Do not attempt to replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** React 19 with TypeScript, bundled via Vite. Check `package.json` for current versions.
- **Styling:** Tailwind CSS 4, configured CSS-first via `src/index.css` (`@theme` block). There is no `tailwind.config.ts` — it was deleted as part of the Tailwind 4 migration.
- **Components:** Minimal shadcn/ui surface. `src/components/ui/` contains only `badge.tsx`, `sonner.tsx`, and `tooltip.tsx`. Most Radix UI packages were intentionally removed.
- **Routing:** React Router v7 framework mode (static prerendering with `ssr: false`)
- **Testing:** Vitest + @testing-library/react (unit/component); Playwright (smoke tests in `e2e/`)
- **Hosting:** GitHub Pages
- **PR previews:** pr-preview-action
- **Node.js:** 22 is required. Version is pinned in `.nvmrc`. Run `nvm use` to switch automatically.

---

## Conventions

### Naming

| Thing | Convention | Example |
|---|---|---|
| Component files and exports | PascalCase | `FilteredLevelCard.tsx`, `export const FilteredLevelCard` |
| Hook files and exports | camelCase, `use` prefix | `useTheme.tsx`, `export function useTheme` |
| Module-level constants from static data | SCREAMING_SNAKE_CASE | `ADVENTURES`, `ALL_TAGS` |
| Route segments | kebab-case | `community-guide`, `adventure-detail` |

### What lives where

- Logic derived from `ADVENTURES` belongs in `src/data/adventures.ts`, exported, and imported everywhere. Do not re-derive it in component files.
- Reusable card or list markup belongs in `src/components/`, not duplicated inline. Extract before the second copy appears.
- Redirect routes that share a destination share a single file in `src/pages/redirects/`. The filename describes the destination, not the source (e.g. `HandbookRedirect.tsx`).

---

## URLs and External Organisations

- The canonical domain for this site is https://offon.dev.
- og:url, og:image, and all absolute URLs must use https://offon.dev.
- The og:image file is public/og.png and its full URL is https://offon.dev/og.png.
- PR preview deployments are served from the gh-pages branch under /pr-preview/pr-{number}/.
- The open source challenges content lives in a separate organisation at https://github.com/dynatrace-oss/open-ecosystem-challenges. This is an intentional external link and must never be changed or flagged as a violation.
- The community Discourse instance is at https://community.open-ecosystem.com. Use the COMMUNITY_URL constant from src/data/constants.ts, never hardcode this URL.
- COMMUNITY_DISPLAY_NAME is defined in src/data/constants.ts as the user-facing display name for the community URL. Use it for visible text, use COMMUNITY_URL for href attributes.

---

## Repository Layout

```
src/
  components/   # Reusable UI components (named exports, PascalCase files)
  pages/        # Route-level page components
  data/         # Static data files (TypeScript objects/arrays)
  hooks/        # Custom React hooks
  lib/          # Shared utilities
  utils/        # Additional utility functions (e.g. stripHtml)
  assets/       # Static assets bundled by Vite
  Layout.tsx    # App shell: providers, skip nav, scroll-to-top, consent banner, and Outlet
e2e/
  smoke.spec.ts # Playwright smoke tests (requires npm run build first)
public/
  fonts/        # Self-hosted fonts (Inter, Syne, JetBrains Mono)
.github/
  workflows/
    deploy.yml  # Production deploy to GitHub Pages (push to main)
    preview.yml # PR preview deploy (runs smoke tests before deploying)
```

---

## Commands

```sh
nvm use              # Switch to Node 22 (required)
npm run dev          # Start local dev server (http://localhost:8080)
npm run build        # Production SSG build (React Router v7) -> dist/client/
npm run build:dev    # Dev-mode build
npm run lint         # ESLint
npm test             # Run tests once (Vitest)
npm run test:watch   # Tests in watch mode
npm run test:coverage  # Run tests with v8 coverage (uses @vitest/coverage-v8)
npm run test:e2e     # Playwright smoke tests (requires npm run build first)
npm run preview      # Copy 404 fallback and serve the production build locally

npx shadcn@latest add <component>   # Add a shadcn/ui component
```

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

---

## Debugging Rules

When diagnosing a bug, especially in the production build, follow these rules
without exception. They exist to prevent debugging by accumulation.

### Evidence rules

- Never claim a fix worked based on source inspection alone. The only signal
  that counts is the expected behavior observed in a real browser against the
  current bundle hash.
- Before acting on any error message, verify the error came from the current
  build. Compare the bundle hash in the error stack trace (e.g. `index-XXXX.js`)
  against the latest build output. If they differ, the browser is serving
  cached code and the error is stale.
- Before acting on any diagnostic output, state what evidence supports the
  conclusion. "Only X was left in the DOM" is not evidence of what the DOM
  looked like at error time. React's error recovery can tear down the tree
  before the diagnostic runs.
- When a grep claims to confirm something, verify the grep pattern is specific
  enough to exclude false positives. Strings like "hydrateRoot" exist in
  production React too, so their presence proves nothing about whether the
  build is minified.

### One-fix-at-a-time rule

- Never stack fixes. One change, rebuild, verify in a real browser, then the
  next. If you apply two fixes before verifying, you cannot tell which one
  worked or if either did.
- Commit after every verified fix. Each commit should have a clear before/after.
- If the same bug has been "fixed" more than once in a session and still
  reproduces, stop. The diagnosis is wrong. Go back to first principles.

### Build cache rules

- Always run `rm -rf dist node_modules/.vite` before any rebuild you intend to
  verify against. Vite's cache can silently produce stale output.
- After rebuilding, always compare the new bundle hash to the previous one. If
  the hash is identical, the cache was reused. Clear it and rebuild.

### Getting unminified React errors

- The `--mode development` flag alone does not produce a dev React build with
  Vite's SWC plugin. Proof: a dev React bundle is roughly 1.4 MB; a production
  bundle is roughly 330 KB.
- To force a dev React build, add to vite.config.ts inside defineConfig:
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    build: { minify: false, sourcemap: true }
- Verify the dev build actually happened: `ls -lh dist/assets/index-*.js`.
  Size should be ~1.4 MB, not ~330 KB.
- Revert this change before merging to main.

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
- `src/components/ui/` contains three files: `badge.tsx`, `sonner.tsx`, `tooltip.tsx`. Adding a new shadcn component requires an immediate use case in the same PR. Unused components are removed. To add one: `npx shadcn@latest add <component>`.
- Never modify files inside `src/components/ui/` directly. Extend or wrap them in `src/components/`.
- Page-level components go in `src/pages/`. Reusable components go in `src/components/`.
- Extract sub-components into `src/components/` rather than nesting them inline.
- Do not duplicate card or list markup across components. If the same JSX structure appears in two places, extract a shared component. `FilteredLevelCard` is the established pattern.
- **Buttons:** use raw `<button>` elements with the CSS utility classes defined in `src/index.css` (`.btn-primary`, `.btn-ghost`, `.btn-inverse`, `.btn-ghost-inverse`). There is no `Button` component wrapper and no `@radix-ui/react-slot` dependency. See `styleguide.md` for which class to use on which background color.
- **Toasts:** use Sonner via `import { toast } from "@/components/ui/sonner"`. The Radix-based toast stack (`react-toast`, `use-toast`) was removed. Do not reinstall it.
- **Sonner (`<Toaster>`) and TooltipProvider are intentionally not mounted in `Layout.tsx`** until a call site exists. Do not add them back to `Layout.tsx` speculatively. Mount `<Toaster>` in the nearest layout that actually triggers a toast, and wrap only the subtree that uses `<Tooltip>` with `<TooltipProvider>` at that point.

### Component CSS patterns

- `hero-badge` class on the hero pill `<div>` in `Hero.tsx`. It is used for CSS scoping of light mode overrides.
- `logo-link` class on the Navbar logo `<Link>`. It is used to exclude the logo from nav link hover styles.
- `data-difficulty` attribute on `DifficultyBadge`. It is used for CSS targeting of badge text color.

---

## Data

- Static content lives in `src/data/` as typed TypeScript objects/arrays.
- No runtime `fetch` calls in components. All network data must be fetched at build time.
- **Build-time fetching:** External data may be fetched inside a Vite plugin (`buildStart` hook, guard with `config.command === "build"`). Write results to `src/data/<name>.json`. Components import the JSON statically. See `vite.config.ts` (`discourseDataPlugin`) and `src/data/discussion-data.json` for the reference implementation.
- When adding a new adventure level, add its topic ID and URL to the `DISCUSSION_TOPICS` map in `vite.config.ts`.
- `vite.config.ts` contains a `COMMUNITY_BASE` constant that is a necessary duplicate of `COMMUNITY_URL` in `src/data/constants.ts`. Vite config runs in Node and cannot import from `src/`, so the value must be maintained manually in both places. Always update them together.
- The domain `community.open-ecosystem.com` in both `vite.config.ts` and `src/data/constants.ts` is the actual Discourse server URL used for API calls at build time. It is not a brand inconsistency. Do not change it to `community.offon.dev` or any other display name. `COMMUNITY_DISPLAY_NAME` in `src/data/constants.ts` is the separate user-facing label shown in the UI.

---

## Styling

- Use Tailwind utility classes directly on JSX elements.
- Always check the `@theme` block in `src/index.css` before introducing any new color, font, spacing, or border radius value. Never hardcode these. There is no `tailwind.config.ts` — all theme values live in the `@theme` block in `src/index.css`.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`,
  `text-foreground`) that shadcn sets up. Never hardcode a color that only works in one mode.
- Never add a `dark:` override without a corresponding base (light) style.
- Mobile first. Write base styles for mobile, then add `sm:`, `md:`, `lg:` breakpoints as needed.
- For font utilities, type scale, component class patterns (buttons, pills, badges, overline labels), and animations, see `styleguide.md`. It is the source of truth. Do not duplicate those details here.
- All fonts are self-hosted under `public/fonts/`.
- Never write custom CSS unless Tailwind genuinely cannot do the job.
  If you must, add it to `src/index.css` with a comment explaining why.
- Light mode overrides: do NOT put them inside `@layer base` — rules there are always overridden by `@layer utilities`. Add unlayered rules to the "Light mode overrides" section at the bottom of `src/index.css`, scoped to `.light`.

### Design system rules

- Light mode uses `.light` class on `<html>`, set by the `useTheme` hook.
- Yellow `#ffc034` is accent-only in light mode. Never use it as a text color.
- Dark mode uses `:root` and `.dark`. Never modify these when fixing light mode issues.
- Tailwind `group-hover:*` and `group-focus:*` utilities are not matched by `.light .classname` selectors. Always add explicit `.light .group:hover` rules in the unlayered light mode overrides section of `src/index.css`.
- Avatar palette colors must not be used directly as text colors in light mode — they fail contrast on near-white surfaces. Use `hsl(var(--foreground))` as the text color for avatar initials in all modes.

---

## Analytics and Consent

The site uses Google Analytics 4 with Consent Mode v2. No data is collected until the user explicitly accepts.

### Constants

All analytics-related constants live in `src/data/constants.ts`:

| Constant | Purpose |
|---|---|
| `GA_MEASUREMENT_ID` | GA4 Measurement ID. Must match the gtag snippet in `src/root.tsx`. If you update it, change both places. |
| `BRAND_NAME` | Always `"OffOn"`. Never hardcode the string. |
| `COMMUNITY_URL` | Real URL of the Discourse instance. Never hardcode. |
| `COMMUNITY_DISPLAY_NAME` | User-facing display name for the community URL. Use for visible text. |
| `SITE_URL` | `"https://offon.dev"`. Use for canonical URLs and OG tags. |
| `SITE_NAME` | `"offon.dev"`. |
| `LINKEDIN_URL` | LinkedIn company page URL. |

### How it works

- `src/root.tsx` loads gtag.js with all consent signals set to `denied` by default (Consent Mode v2).
- `src/hooks/useConsent.tsx` manages consent state. It exports `ConsentProvider` and `useConsent`.
  - Consent is stored in `localStorage` under key `analytics_consent` with a 6-month expiry.
  - States: `null` (not yet decided, show banner), `"granted"`, `"denied"`.
  - On grant: calls `loadGtag()` and `gtag('consent', 'update', { analytics_storage: 'granted' })`.
  - On deny or reset: removes the gtag script, clears `dataLayer`, and replaces `window.gtag` with a no-op.
  - `reset()` clears storage and re-shows the banner (called by the floating cookie button in `ConsentBanner`).
- `useConsent` throws if called outside `ConsentProvider`. The provider is mounted in `Layout.tsx`.
- `src/components/ConsentBanner.tsx` renders a fixed bottom bar until the user makes a choice. Once consent is set, it renders a floating cookie icon button (bottom-right) that calls `reset()` to reopen the banner.
- `src/hooks/useTheme.tsx` manages the light/dark toggle. Theme is stored in `localStorage` under key `theme`. `ThemeProvider` is mounted in `Layout.tsx`.

### Consent state machine: enumerate all transitions before touching this code

| From | To | Trigger | Systems updated |
|---|---|---|---|
| `null` | `"granted"` | User clicks Accept | localStorage, React state, gtag loaded |
| `null` | `"denied"` | User clicks Decline | localStorage, React state, gtag revoked |
| `"granted"` | `null` | User clicks Cookie Preferences | localStorage cleared, React state, gtag revoked |
| `"denied"` | `null` | User clicks Cookie Preferences | localStorage cleared, React state |
| `null` | `"granted"` or `"denied"` | Page reload with stored value | React state restored, gtag reloaded if granted |

---

## Accessibility (WCAG 2.2 AA, mandatory)

Check the following on every component you write or modify.

### Skip navigation
- Every page must have a skip link as the first focusable element so keyboard users can bypass the nav bar.
- The skip link in `Layout.tsx` targets `#main-content`. Every page's `<main>` element must carry `id="main-content"`.
- The skip link is styled with the `.skip-nav` class in `src/index.css`. Never remove this class or its focus rules.
- When adding a new page, always add `id="main-content"` to its `<main>` element.

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
  Standard pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  (adjust ring offset as needed; use `ring-offset-1` for inline elements, `ring-offset-2` for blocks)
- Always use `ring-ring` for focus rings, never `ring-primary/xx`. `--ring` is set per theme: dark mode amber (`41 100% 60%`), light mode dark amber (`41 100% 35%`) to ensure WCAG AA contrast in both modes.
- Modals must trap focus while open and return focus on close. Use shadcn `Dialog`.

### External links
- Every `<a target="_blank">` link must include `<span className="sr-only"> (opens in new tab)</span>` as its last child.
- Never add `target="_blank"` without this span. Keyboard and screen reader users must know the link opens a new tab.
- Exception: icon-only buttons with `aria-label` already state the new-tab behavior in the label.

### Semantic HTML
- Use the correct element for the job (`<button>` for actions, `<a>` for navigation,
  `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`).
- Never use a `<div>` or `<span>` as an interactive element. Use the right element instead.
- One `<h1>` per page. No skipped heading levels.
- Never apply overline/label typography (`text-sm uppercase tracking-widest`) to a heading tag (`<h1>`–`<h6>`). Overline styling signals a decorative caption, not a structural heading, and a sighted user will not recognise it as a heading. If the text is a genuine section heading, give it heading-appropriate typography from `styleguide.md`. If it is purely decorative, use `<span>` or `<p>` instead.
- Never use a non-heading tag (`<p>`, `<span>`, `<div>`) for text that is visually styled as a heading (e.g. `text-lg font-semibold` or larger, `font-heading`, `font-bold`). Promote it to the correct heading level that fits the page outline.
- Every page's primary content must live inside a single `<main id="main-content">` element. Do not split the page content across multiple `<main>` elements or leave major sections (e.g. `PageHero`, `BottomCTA`) outside `<main>`.
- The `<html lang="en">` attribute is set in `src/root.tsx`. Never remove or change it.

### Forms
- Every `<input>`, `<select>`, and `<textarea>` must have an associated `<label>` via `for`/`id` pairing or `aria-label`. Never use placeholder text as a substitute for a label.

### Icons and special characters
- Decorative icons paired with visible text: always add `aria-hidden="true"`. Do not omit it.
- Never use raw Unicode characters (e.g. `→`, `♥`, `✓`) to convey meaning. Use proper text, lucide-react icons with `aria-hidden`, or an `aria-label`/`<span className="sr-only">` for screen readers.

### ARIA
- Only add ARIA attributes when semantic HTML is not enough.
- Never use ARIA to paper over bad markup. Fix the markup first.
- Always add `aria-label` or `aria-labelledby` to icon-only buttons.
- Use `aria-expanded` on toggles that open/close UI (e.g., menu buttons).
- Use `aria-live` regions for dynamic content updates.

### Images and media
- Every `<img>` must have an `alt` attribute. No exceptions.
- Meaningful images: `alt` must describe the content or purpose (e.g. `alt="offon.dev"` for a logo, `alt={sponsor.name}` for a sponsor logo).
- Decorative images (no informational value at all): use `alt=""` AND `aria-hidden="true"` together.
- Brand mascots and illustrations: use a brief descriptive `alt` (e.g. `alt="The OffOn firefly mascot waving hello"`). Do not use `aria-hidden="true"` when alt text is present — it overrides the alt and hides the image from AT entirely.
- Never omit the `alt` attribute entirely.
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
- When fixing a bug caused by an incorrect import, file path, or configuration
  value, add a regression test that asserts on the file's contents. Behavior
  tests can miss silent bugs where the wrong dependency is pulled in. For
  example, after fixing a component that imported from the wrong theme library,
  add a test that reads the component file and asserts it imports from the
  correct path and does not import from the wrong one.
- Prerender tests live in `src/test/prerender.test.ts` and require a production build to exist. Always run `npm run build` before `npm test` if prerender tests are included. These tests assert that each prerendered index.html contains exactly one `<title>` tag with the correct page-specific content.
- Playwright smoke tests live in `e2e/smoke.spec.ts` and also require a production build. Run `npm run build` then `npm run test:e2e`. These tests verify each prerendered route loads in a real browser without JS errors, that `main#main-content` is present, that hydration completed (theme toggle, consent banner, client-side navigation all work), and that the skip nav is the first Tab stop. When adding a new prerendered route, add it to the `ROUTES` array in `e2e/smoke.spec.ts`. Do not add Playwright tests for logic that Vitest already covers.
- SEO tests live in `src/test/seo.test.ts` and require a production build. They assert that every prerendered route has a `<meta name="description">` within 160 chars, all `og:*` tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:site_name`, `og:locale`), all `twitter:*` tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`), and a correct `<link rel="canonical">`. When adding a new prerendered route, add it to the `ROUTES` array in `src/test/seo.test.ts`.
- When a page renders multiple navigation landmarks (e.g. `Navbar`, `Footer`, and an in-page nav), use `within` from `@testing-library/react` to scope queries to the correct landmark before asserting link destinations. This prevents false positives when the same link text appears in more than one `<nav>`. Example: `const nav = screen.getByRole("navigation", { name: "Helpful links" }); within(nav).getByRole("link", { name: /Adventures/ })`.
- **Testing hooks with dynamic imports:** Vitest's dynamic-import mock runner (`vi.mock("@/data/...")`) has a multi-second first-call initialization cost per test run. Never use `vi.mock` for a dynamic import that is called inside a hook and then test that hook directly — the first async tests will time out. The pattern that works: export a `DiscussionDataLoader`-style type and a default loader from the hook; accept it as an optional second argument; tests inject `vi.fn().mockResolvedValue(data)` via that argument. `vi.spyOn` on a same-module export does NOT intercept internal calls in ES module context and is not a valid alternative. See `src/hooks/useDiscussionPosts.ts` for the reference implementation.
- **Coverage:** run `npm run test:coverage` for v8 coverage reports. The `coverage/` directory is gitignored. `@vitest/coverage-v8` is installed as a dev dependency.

---

## Hydration and Prerender Safety

Whether or not the site is prerendered today, these patterns cause bugs.
They produce visible flashes in client-only apps and break hydration entirely
if the site is ever prerendered. Never introduce them.

### Do not read browser-only globals during render

- Never read `window`, `document`, `navigator`, `localStorage`, or
  `sessionStorage` in a component function body.
- Never read them in a `useState` lazy initializer. Initializers run on every
  render, including the first, and the first render must be deterministic
  without browser APIs.
- Correct pattern: initialize state with a safe default, then update it in
  `useEffect` or `useLayoutEffect`.

### Do not use non-deterministic values during render

- Never call `Math.random()`, `Date.now()`, `new Date()`, `crypto.randomUUID()`,
  or `performance.now()` in a render body.
- If you need a timestamp in rendered output, capture it at module load or in
  an effect, not at render.
- `new Date().getFullYear()` in JSX is a common mistake. Use a module-level
  constant instead.

### Client-only behavior must be gated

- Anything that depends on `localStorage`, `matchMedia`, or similar must
  produce the same initial render as a fresh visitor with no stored state.
- For theme and consent state, this means: always render the default (dark,
  no-consent) on first render, then update in an effect. To avoid a visible
  flash, apply the stored value via an inline script in `<head>` before React
  runs.

### No IntersectionObserver or ResizeObserver at render time

- Always create observers inside `useEffect`, never at the top level of a
  component or module.
- Creating observers inside `useEffect` is safe. The risk is only when an observer fires during a prerender pass and changes rendered output, causing a hydration mismatch. Guard any observer that affects rendered content with a `typeof window !== 'undefined'` check.
- Use `useIsomorphicLayoutEffect` instead of `useLayoutEffect` in any component that renders during SSG. Define it as `const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect` and guard any localStorage or browser API access inside the callback with `if (typeof window === "undefined") return`.

### entry.server.tsx must use renderToPipeableStream, not renderToString

- `renderToString` emits `<!--$!-->` (failed Suspense fallback) markers for any Suspense boundary that suspends during prerender, including React Router v7's own internal Suspense for route loading.
- These markers appear outside `</html>` in the prerendered HTML. When `hydrateRoot(document, ...)` runs, it encounters DOM nodes with no matching React component output, causing hydration to fail silently. All event handlers (button clicks, theme toggle, consent banner) are never attached.
- `entry.server.tsx` must always use `renderToPipeableStream` with `onAllReady` callback. This waits for all Suspense boundaries to resolve before writing output, producing clean HTML with no `<!--$!-->` markers.
- Never revert to `renderToString` in `entry.server.tsx`. The prerender test in `src/test/prerender.test.ts` asserts that no `<!--$!-->` markers appear in the built HTML.

### Do not add Suspense wrappers around Outlet in Layout.tsx

- React Router v7 handles its own Suspense internally for lazy route loading. Adding `<Suspense>` around `<Outlet />` in Layout.tsx creates an extra Suspense boundary that React Router does not resolve during prerender.
- Result: `<!--$!-->` marker outside `</html>`, broken hydration, and non-functional interactivity in the production build.
- If you need loading states for routes, configure them in the route module itself, not in the layout.

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
- For multi-line hero or section headings, do not use `<br />` inside `h1`/`h2`.
  Use block-level `<span>` elements for visual line breaks so parsers read predictable text.
- When splitting heading text across multiple visual lines, keep the text directly readable
  in the heading via normal block `<span>` elements. Do not add a redundant `aria-label`
  or `aria-hidden` on the line-split spans.

### Links and navigation
- Internal links use React Router `<Link>`. Never trigger full page reloads.
- Use descriptive link text. Never use "click here" or "read more" alone.
- Set the canonical URL for each page as `${SITE_URL}${pathname}` using the `SITE_URL` constant from `src/data/constants.ts`. Do not derive canonical URLs from `window.location` or `VITE_BASE_PATH`.

### Performance
- Before adding any new dependency, run `npm run build` and check the bundle size in the Vite output. If it adds more than 10 KB to the main bundle, evaluate whether a lighter alternative exists.
- Route-level code splitting is handled automatically by React Router v7's build pipeline. No manual `React.lazy` or `Suspense` wrappers are needed or should be added.
- Avoid layout shift by setting explicit `width` and `height` attributes on every `<img>` element.
- For all other performance requirements including font preloading, LCP image handling, and Lighthouse baselines, see the Performance Checklist section.

### Global head setup (root.tsx)
- Add `<link rel="manifest" href="/site.webmanifest" />` to link the web app manifest.
- Add `<meta name="theme-color">` tags for dark and light mode: `content="#0a0a0a" media="(prefers-color-scheme: dark)"` and `content="#f5f5ff" media="(prefers-color-scheme: light)"`.
- Add JSON-LD structured data as a `<script type="application/ld+json">` with `@type: "WebSite"`. Note: the `"OffOn"` brand name is hardcoded as a string literal in the JSON-LD inline script in `src/root.tsx` (it cannot reference TypeScript constants inside `dangerouslySetInnerHTML`). Update it manually if the brand name ever changes.
- Always include `og:image:width`, `og:image:height`, and `og:image:alt` for all OG image tags.
- Add `og:site_name` and `og:locale` (en_GB) to all global OG tags in `src/root.tsx`.
- Do not add page-specific meta tags (description, og:*, twitter:*) to `src/root.tsx`. These must live in each route module's `meta()` export only. Tags in `root.tsx` are rendered on every page and will produce duplicate meta tags.

---

## Content and Copy

All written content, code comments, commit messages, and documentation must follow
these rules.

### Brand Name
- The brand is always written **OffOn** (camelCase). Never "offon", "Offon", or "OFFON".
- The community was previously known as "Open Ecosystem". That name is retired. Never use it anywhere in code, copy, comments, or documentation.
- In code, always use the `BRAND_NAME` constant from `src/data/constants.ts` instead of hardcoding the string.
- The domain `offon.dev` is always lowercase (it is a URL, not a brand mention).

### Tone
- Direct, positive, and community-focused.
- Write for open source enthusiasts, not a corporate audience.
- Use plain language. Avoid jargon unless it is standard in open source contexts.
- Avoid passive voice where an active one works.
- Keep sentences short and scannable.

### Capitalisation

All UI labels use **title case (Chicago style)**. Body copy uses **sentence case**.

**Title case applies to:**
- Button and CTA labels: `"Join the Community"`, `"Start a Challenge"`, `"Get in Touch"`
- Section headings (h2/h3): `"Choose Your Adventure"`, `"Find Challenges by Technology"`
- Card and value titles: `"Learn by Doing"`, `"Open Source First"`, `"Events & Meetups"`
- Navigation labels and footer links: `"Propose an Adventure Idea"`
- Pill and badge text

**Title case rule:** capitalise every word except articles (a, an, the), prepositions shorter than five letters (by, in, on, of, to, for, at, up), and coordinating conjunctions (and, but, or, nor) — unless they open or close the label.
- Correct: `"Join the Community"`, `"Share and Learn Together"`, `"Find Challenges by Technology"`
- Incorrect: `"Join The Community"`, `"Share And Learn Together"`, `"Find challenges by technology"`

**Sentence case applies to:** body paragraphs, meta descriptions, `<p>` elements, hero sub-headings, and card descriptions. Capitalise the first word and proper nouns only.

**Exception:** decorative overline labels (spans with `section-label` / `uppercase tracking-widest`) use CSS `text-transform: uppercase`, so write their source text in plain lowercase — `"adventures"` not `"Adventures"` or `"ADVENTURES"`.

### Formatting
- Never use em dashes anywhere, including comments and documentation.
  Use commas, periods, or restructure the sentence instead.
- Maintain a cohesive tone across all pages and components.
- Do not mix formal and casual registers within the same page.

### External URLs
- `LINKEDIN_URL` in `src/data/constants.ts` contains the current LinkedIn company page URL. The slug currently reflects a legacy brand name but is controlled by LinkedIn. Update `LINKEDIN_URL` in `src/data/constants.ts` when the LinkedIn company page URL changes.

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

## Site Maintenance

### Sitemap
- Every time a new static page is added to `src/pages/` and registered as a route in `src/routes.ts`, its URL must also be added to `public/sitemap.xml`.
- Dynamic routes with **statically known IDs** (e.g. adventure and challenge detail pages) must also be added to `public/sitemap.xml`. All adventure and level routes are statically known at build time.
- Dynamic routes whose IDs are not known at build time must not be added to the sitemap.
- The sitemap lives at `public/sitemap.xml` and is served at `https://offon.dev/sitemap.xml`.
- `robots.txt` at `public/robots.txt` must include: `Sitemap: https://offon.dev/sitemap.xml`

### SSG prerendered routes
- The list of routes that React Router v7 prerenders is in the `prerender` array inside `react-router.config.ts`.
- When adding a new static route, add it to **all three** of: `src/routes.ts`, `public/sitemap.xml`, and the `prerender` array in `react-router.config.ts`.
- Dynamic routes with statically known IDs (e.g. adventure and challenge detail pages) must also be listed in the `prerender` array individually and in `public/sitemap.xml`.
- Routes not listed in the `prerender` array will not have a prerendered `index.html` and will fall back to the client-side 404 flow on GitHub Pages.

When adding a new route to `src/routes.ts`, follow these rules by route type:

- Static routes (e.g. `/about`, `/privacy`): add to `public/sitemap.xml`, the routes table in `README.md`, and the `prerender` array in `react-router.config.ts`.
- Dynamic routes with statically known IDs (e.g. `/adventures/:id` when IDs are fixed): add individual URLs to `public/sitemap.xml`, the `prerender` array in `react-router.config.ts`, and the routes table in `README.md`. Also add the topic ID and URL to `DISCUSSION_TOPICS` in `vite.config.ts` if the level has a discussion thread.
- Redirect routes (clientLoader returning redirect()): do not add to `sitemap.xml` or `README.md`.
- Catch-all routes (`*`): do not add anywhere.

### When adding a new adventure

Adventures are defined in `src/data/adventures.ts`. The Discourse API does not expose the structured data needed (Codespace URLs, technology tags, learnings), so this file is the authoritative source of truth. Update it manually when a new adventure is published on the community.

Complete checklist for every new adventure:

1. Add the adventure object to the `ADVENTURES` array in `src/data/adventures.ts`. Required fields: `id`, `title`, `month`, `story`, `tags`, and `levels`. Each level needs `id`, `name`, `difficulty`, `learnings`, `codespacesUrl`, and `discussionUrl`.
2. Add the adventure detail route and all level routes to `src/routes.ts`.
3. Add the adventure landing page URL and every level URL to `public/sitemap.xml`.
4. Add the adventure landing page URL and every level URL to the `prerender` array in `react-router.config.ts`.
5. Add each level's Discourse topic ID and full topic URL to the `DISCUSSION_TOPICS` map in `vite.config.ts`. The key is the numeric topic ID extracted from the discussion URL (e.g. `"117"` from `.../t/.../117/...`).
6. Run `npm run build` to fetch fresh discussion data for the new topic IDs and verify that `src/data/discussion-data.json` was updated.
7. Update the routes table in `README.md`.

---

## Deployment

- Push to `main` triggers `deploy.yml` and deploys to GitHub Pages.
- Open PRs trigger `preview.yml` and create a PR preview deployment.
- Only static files in `dist/` are deployed. No server config is needed.
- The base path is set via the `VITE_BASE_PATH` environment variable (defaults to `/`). PR previews set this automatically in `preview.yml`. Never change this without verifying GitHub Pages routing.

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
   bundling failures. Run this for every non-trivial change, not just those that touch types or interfaces.

4. **Re-read every file you changed:** After making changes, re-read the full
   affected section of each modified file to verify the final state is correct.
   Never assume an edit landed correctly without checking.

5. **Check all call sites:** If you changed a function signature, component props,
   or exported type, search for all usages and confirm they are updated.

6. **Check imports:** Every import must resolve. No unused imports. No circular
   dependencies introduced.

7. **Verify at three viewports:** All UI changes must be verified at mobile (375px), tablet (768px), and desktop (1280px). Always test against the production build (`npm run build && npx serve dist/client`), never the dev server.

8. **Check discussion data on every PR:** If the PR adds or modifies adventure levels, verify that every level's Discourse topic ID and URL are present in the `DISCUSSION_TOPICS` map in `vite.config.ts`. Run `npm run build` so `src/data/discussion-data.json` is regenerated with any new topics. A missing entry means the discussion feed will silently show no posts for that level.

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
- The error in the browser console shows a different bundle hash than the
  latest build output
- A "fix" has been applied but the same error reproduces unchanged
- Debugging requires making a diagnostic script more complex instead of
  reading what the simpler diagnostic already said

---

## Do Not

- Do not add a backend, API routes, or server-side rendering.
- Do not add external font or icon CDN links. All assets must be self-hosted.
- Do not change `vite.config.ts` base path without verifying GitHub Pages routing.
- Do not install new dependencies without checking if shadcn/ui or an existing utility covers the need.
- Do not commit secrets, tokens, or credentials.
- Do not change the `@theme` block in `src/index.css` without verifying the change does not break existing components.
- Do not reinstall `@radix-ui/*` packages that were removed. If a Radix primitive is genuinely needed, check whether raw HTML with Tailwind solves the problem first.
- Do not re-derive data from `ADVENTURES` inside component files. Any computed value that belongs to the data layer (e.g. a deduplicated tag list) should be exported from `src/data/adventures.ts` and imported. `ALL_TAGS` is the established pattern.

---

## When Suggesting Code

- Always read `styleguide.md` before making any UI, copy, or component changes.
  It is the source of truth for typography, color tokens, spacing, and brand rules.
  Never introduce values that contradict it.
- Follow all rules in the Styling and Components sections.
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
   If yes, update the Commands section in both `CLAUDE.md` and `README.md`.

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
| New page or route | README.md routes table for all non-redirect routes; `public/sitemap.xml` and `prerender` array in `react-router.config.ts` for static routes only. |
| New constant | README.md: constants section, styleguide.md if visual |
| New workflow step | README.md: commands section, CLAUDE.md if it changes a rule |
| New brand or copy rule | styleguide.md first, then apply across codebase |
| Bug fix that reveals a missing rule | CLAUDE.md: add the rule to prevent recurrence |
| New test pattern | CLAUDE.md: add to Testing section if it sets a precedent |

Do not document trivial fixes (typos, one-line patches) unless they change a
rule or pattern others should follow.

---

## Implementation Rules

These rules exist to prevent specific classes of mistakes. Follow them unconditionally.

### Shared state
- If a hook or piece of state is consumed by more than one sibling component, it must
  be a React context provider, not a plain hook. Verify this at design time before
  writing any code.

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

---

## SEO Checklist: Required for Every New Page

Add via the route module's `meta()` export — never in `src/root.tsx`:
- `<title>` (unique) and `<meta name="description">` (under 160 chars)
- `og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `og:site_name`, `og:locale` (en_GB)
- `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
- `<link rel="canonical">` set to `${SITE_URL}${pathname}`
- Correct heading hierarchy: one `h1`, `h2` for sections, `h3` for subsections

Static routes only — add to both:
- `public/sitemap.xml`
- `prerender` array in `react-router.config.ts`

One-time `src/root.tsx` check (not per page): manifest link, both theme-color tags, JSON-LD block, `lang="en"` on `<html>`. See SEO > Global head setup for the full requirements.

---

## WCAG AA Checklist: Required for Every New Component

- Text contrast: 4.5:1 for normal, 3:1 for large (18px+). Test both light and dark modes. (See Accessibility > Color contrast.)
- Never use `hsl(41 100% 60%)` (`#ffc034` yellow) as text in light mode — fails contrast.
- Never place text on `bg-primary` without verifying light mode contrast.
- Focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm`. Inline elements: `ring-offset-1`. (See Accessibility > Keyboard navigation.)
- Every `<img>` needs `alt`. Meaningful/brand images: describe content. Purely decorative: `alt=""` + `aria-hidden="true"` together. Never use `aria-hidden="true"` when alt text is present. (See Accessibility > Images and media.)
- Hover states must not change layout properties (padding, border, font-weight, width). Use color and opacity only.
- Semantic landmarks: `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`. Every page: `<main id="main-content">`. (See Accessibility > Semantic HTML.)
- One `<h1>` per page, no skipped levels. No `<br />` in headings — use block `<span>` elements.
- Every `<a target="_blank">` needs `<span className="sr-only"> (opens in new tab)</span>`. (See Accessibility > External links.)
- Decorative icons: `aria-hidden="true"`. No raw Unicode symbols (`→`, `♥`, `✓`, `★`) for meaning. Decorative separators (e.g. `·`): `<span aria-hidden="true">·</span>`. (See Accessibility > Icons and special characters.)
- All page content (including `PageHero` and `BottomCTA`) inside `<main id="main-content">`.
- Dynamic content updates: use `aria-live` regions. (See Accessibility > ARIA.)

---

## Performance Checklist: Required When Adding Fonts, Images, or New Routes

- Preload critical fonts via the `links()` export in `src/root.tsx` (not as hardcoded `<link>` tags in the JSX). React Router's `<Links />` component manages these correctly during SSR and hydration, preventing the "preloaded but not used" browser warning that hardcoded preloads cause. Example: `{ rel: "preload", href: \`${import.meta.env.BASE_URL}fonts/inter-latin-400-normal.woff2\`, as: "font", type: "font/woff2", crossOrigin: "anonymous" }`.
- Only preload fonts used above the fold. Check the `links()` export in `src/root.tsx` for the current preload list and update it whenever above-the-fold typography changes.
- Do not lazy-load LCP images. Remove `loading="lazy"` from any above-the-fold image.
- Add `loading="lazy"` to all `<img>` elements that are not visible in the initial viewport.
- Add `fetchpriority="high"` to the LCP image.
- Add `width` and `height` attributes to every `<img>` element to prevent layout shift (CLS).
- New routes are automatically code-split by Vite. No manual action needed.
- Always run Lighthouse against the production build: `npm run build && npx serve dist/client`. Never run it against the dev server.
