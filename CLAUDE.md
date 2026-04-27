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
It is fully static with no backend and no database. Pages are prerendered at build time using vite-react-ssg.

Community activity happens on a separate Discourse instance. Its display name is **community.offon.dev**, but the real URL is managed via the `COMMUNITY_URL` constant in `src/data/constants.ts`. Do not hardcode it. Do not attempt to replicate or integrate Discourse functionality here.

---

## Stack

- **Framework:** React with TypeScript, bundled via Vite. Check `package.json` for current versions.
- **Styling:** Tailwind CSS, configured via `tailwind.config.ts` and `src/index.css`.
- **Components:** shadcn/ui (Radix UI primitives), live in `src/components/ui/`
- **Routing:** React Router v6 (client-side with SSG prerendering via vite-react-ssg)
- **Testing:** Vitest + @testing-library/react
- **Hosting:** GitHub Pages
- **PR previews:** pr-preview-action
- **Node.js:** 22 is required. Version is pinned in `.nvmrc`. Run `nvm use` to switch automatically.

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
public/
  fonts/        # Self-hosted fonts (Inter, Syne, JetBrains Mono)
.github/
  workflows/
    deploy.yml  # Production deploy to GitHub Pages (push to main)
    preview.yml # PR preview deploy
```

---

## Commands

```sh
nvm use              # Switch to Node 22 (required)
npm run dev          # Start local dev server (http://localhost:8080)
npm run build        # Production SSG build (vite-react-ssg) -> dist/
npm run build:dev    # Dev-mode build
npm run build:ssg-dev  # SSG build in development mode (unminified, for hydration debugging)
npm run lint         # ESLint
npm test             # Run tests once (Vitest)
npm run test:watch   # Tests in watch mode
npm run preview      # Serve the production build locally

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
- Never force-push to `main`.

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
- To add a missing shadcn component: `npx shadcn@latest add <component>`.
- Never modify files inside `src/components/ui/` directly. Extend or wrap them in `src/components/`.
- Page-level components go in `src/pages/`. Reusable components go in `src/components/`.
- Extract sub-components into `src/components/` rather than nesting them inline.

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
- Always check `tailwind.config.ts` and `src/index.css` before introducing any new color, font, spacing, or border radius value. Never hardcode these.
- Both light and dark mode must work. Use the CSS variable pairs (`bg-background`,
  `text-foreground`) that shadcn sets up. Never hardcode a color that only works in one mode.
- Never add a `dark:` override without a corresponding base (light) style.
- Mobile first. Write base styles for mobile, then add `sm:`, `md:`, `lg:` breakpoints as needed.
- For font utilities, type scale, component class patterns (buttons, pills, badges, overline labels), and animations, see `styleguide.md`. It is the source of truth. Do not duplicate those details here.
- All fonts are self-hosted under `public/fonts/`.
- Never write custom CSS unless Tailwind genuinely cannot do the job.
  If you must, add it to `src/index.css` with a comment explaining why.
- When adding light mode overrides for Tailwind utility classes (e.g. `text-primary`,
  `bg-primary`), do NOT put them inside `@layer base`. Rules in `@layer base` are always
  overridden by `@layer utilities` regardless of specificity. Instead, add unlayered rules
  to the "Light mode overrides" section at the bottom of `src/index.css`, scoped to the
  `.light` selector.

### Design system rules

- Light mode uses `.light` class on `<html>`, set by the `useTheme` hook.

- Yellow `#ffc034` is accent-only in light mode. Never use it as a text color.
- All light mode color overrides are unlayered rules at the bottom of `src/index.css`, scoped to `.light`.
- Do NOT put light mode overrides inside `@layer base`. They will be silently overridden by `@layer utilities`.
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
| `GA_MEASUREMENT_ID` | GA4 Measurement ID. Must match the gtag snippet in `index.html`. If you update it, change both places. |
| `BRAND_NAME` | Always `"OffOn"`. Never hardcode the string. |
| `COMMUNITY_URL` | Real URL of the Discourse instance. Never hardcode. |
| `COMMUNITY_DISPLAY_NAME` | User-facing display name for the community URL. Use for visible text. |
| `SITE_URL` | `"https://offon.dev"`. Use for canonical URLs and OG tags. |
| `SITE_NAME` | `"offon.dev"`. |
| `LINKEDIN_URL` | LinkedIn company page URL. |

### How it works

- `index.html` loads gtag.js with all consent signals set to `denied` by default (Consent Mode v2).
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
- The `<html lang="en">` attribute is set in `index.html`. Never remove or change it.

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
- When fixing a bug caused by an incorrect import, file path, or configuration
  value, add a regression test that asserts on the file's contents. Behavior
  tests can miss silent bugs where the wrong dependency is pulled in. For
  example, after fixing a component that imported from the wrong theme library,
  add a test that reads the component file and asserts it imports from the
  correct path and does not import from the wrong one.
- Prerender tests live in `src/test/prerender.test.ts` and require a production build to exist. Always run `npm run build` before `npm test` if prerender tests are included. These tests assert that each prerendered index.html contains exactly one `<title>` tag with the correct page-specific content.

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
- Route-level code splitting uses explicit `React.lazy` + `Suspense` in `src/App.tsx`. This is intentional and required by the `vite-react-ssg` SSG architecture — do not remove or replace with static imports.
- Avoid layout shift by setting explicit `width` and `height` attributes on every `<img>` element.
- For all other performance requirements including font preloading, LCP image handling, and Lighthouse baselines, see the Performance Checklist section.

### Global head setup (index.html)
- Add `<link rel="manifest" href="/site.webmanifest" />` to link the web app manifest.
- Add `<meta name="theme-color">` tags for dark and light mode: `content="#0a0a0a" media="(prefers-color-scheme: dark)"` and `content="#f5f5ff" media="(prefers-color-scheme: light)"`.
- Add JSON-LD structured data as a `<script type="application/ld+json">` with `@type: "WebSite"`. Note: `index.html` is a static file and cannot import TypeScript constants, so the `"OffOn"` brand name is hardcoded in the JSON-LD blocks. Update them manually if the brand name ever changes.
- Always include `og:image:width`, `og:image:height`, and `og:image:alt` for all OG image tags.
- Add `og:site_name` and `og:locale` (en_GB) to all global OG tags in `index.html`.
- Do not add page-specific meta tags (description, og:*, twitter:*) to index.html. These must live in each page's `<Helmet>` block only. Hardcoded tags in index.html are not replaced by react-helmet-async during SSG and will produce duplicate meta tags in every prerendered page.

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
- Every time a new static page is added to `src/pages/` and registered as a route in `src/App.tsx`, its URL must also be added to `public/sitemap.xml`.
- Dynamic routes with **statically known IDs** (e.g. adventure and challenge detail pages) must also be added to `public/sitemap.xml`. All adventure and level routes are statically known at build time.
- Dynamic routes whose IDs are not known at build time must not be added to the sitemap.
- The sitemap lives at `public/sitemap.xml` and is served at `https://offon.dev/sitemap.xml`.
- `robots.txt` at `public/robots.txt` must include: `Sitemap: https://offon.dev/sitemap.xml`

### SSG prerendered routes
- The list of routes that vite-react-ssg prerenders is in `ssgOptions.includedRoutes` inside `vite.config.ts`.
- When adding a new static route, add it to **all three** of: `src/App.tsx`, `public/sitemap.xml`, and `ssgOptions.includedRoutes` in `vite.config.ts`.
- Dynamic routes with statically known IDs (e.g. adventure and challenge detail pages) must also be listed in `ssgOptions.includedRoutes` individually and in `public/sitemap.xml`.
- Routes not listed in `ssgOptions.includedRoutes` will not have a prerendered `index.html` and will fall back to the client-side 404 flow on GitHub Pages.

When adding a new route to `src/App.tsx`, follow these rules by route type:

- Static routes (e.g. `/about`, `/privacy`): add to `public/sitemap.xml`, the routes table in `README.md`, and `ssgOptions.includedRoutes` in `vite.config.ts`.
- Dynamic routes with statically known IDs (e.g. `/adventures/:id` when IDs are fixed): add individual URLs to `public/sitemap.xml`, `ssgOptions.includedRoutes` in `vite.config.ts`, and the routes table in `README.md`. Also add the topic ID and URL to `DISCUSSION_TOPICS` in `vite.config.ts` if the level has a discussion thread.
- Redirect routes (`<Navigate>`): do not add to `sitemap.xml` or `README.md`.
- Catch-all routes (`*`): do not add anywhere.

### When adding a new adventure

Adventures are defined in `src/data/adventures.ts`. The Discourse API does not expose the structured data needed (Codespace URLs, technology tags, learnings), so this file is the authoritative source of truth. Update it manually when a new adventure is published on the community.

Complete checklist for every new adventure:

1. Add the adventure object to the `ADVENTURES` array in `src/data/adventures.ts`. Required fields: `id`, `title`, `month`, `story`, `tags`, and `levels`. Each level needs `id`, `name`, `difficulty`, `learnings`, `codespacesUrl`, and `discussionUrl`.
2. Add the adventure detail route and all level routes to `src/App.tsx`.
3. Add the adventure landing page URL and every level URL to `public/sitemap.xml`.
4. Add the adventure landing page URL and every level URL to `ssgOptions.includedRoutes` in `vite.config.ts`.
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

7. **Verify at three viewports:** All UI changes must be verified at mobile (375px), tablet (768px), and desktop (1280px). Always test against the production build (`npm run build && npx serve dist`), never the dev server.

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
- Do not use em dashes anywhere in the codebase, content, or documentation.
- Do not change `tailwind.config.ts` theme values without verifying the change does not break existing components.

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
| New page or route | README.md routes table for all non-redirect routes; `public/sitemap.xml` and `ssgOptions.includedRoutes` in `vite.config.ts` for static routes only. |
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

---

## SEO Checklist: Required for Every New Page

- Add a unique `<title>` and a `<meta name="description">` under 160 characters via react-helmet-async
- Add `og:title`, `og:description`, `og:url`, `og:type`, and `og:image` meta tags
- Add `og:image:width` (1200) and `og:image:height` (630) for proper image rendering
- Add `og:image:alt`, `og:site_name`, and `og:locale` (en_GB) meta tags
- Add `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, and `twitter:image:alt` meta tags
- Add canonical link tag
- Add the page URL to `public/sitemap.xml` (static routes only)
- Add the page URL to `ssgOptions.includedRoutes` in `vite.config.ts` (static routes only)
- Use correct heading hierarchy: one `h1` per page, `h2` for sections, `h3` for subsections
- Dynamic routes are not added to `sitemap.xml` unless IDs are statically known
- Verify `index.html` includes `<link rel="manifest" href="/site.webmanifest" />`
- Verify `index.html` includes both `<meta name="theme-color">` tags for dark and light mode
- Verify `index.html` includes a `<script type="application/ld+json">` block with `@type: WebSite`
- Do not add page-specific meta tags (`description`, `og:*`, `twitter:*`) to `index.html`. They must live in each page's `<Helmet>` block only.
- Confirm `<html lang="en">` is present in `index.html` and has not been removed.

---

## WCAG AA Checklist: Required for Every New Component

- All text must meet 4.5:1 contrast ratio for normal text, 3:1 for large text (18px+ or 14px+ bold)
- Never rely on color alone to convey meaning. Always pair color with text, icon, or pattern.
- Never use `hsl(41 100% 60%)` (`#ffc034` yellow) as text color in light mode. It fails contrast.
- Never place `text-primary` or any text on a `bg-primary` background without verifying the contrast combination in light mode
- All interactive elements must have visible focus-visible styles. Block elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm`. Inline elements: use `ring-offset-1` instead of `ring-offset-2`.
- All images must have descriptive `alt` text (empty `alt` only for decorative images)
- Verify hover states do not change layout properties (padding, border, font-weight, width). Use color and opacity changes only.
- Use semantic HTML: `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>` landmarks where appropriate
- Heading hierarchy must not skip levels
- Do not rely on `<br />` to split heading text across lines in `h1`/`h2`.
  Prefer block spans and keep the text directly readable without adding a redundant `aria-label`
  or `aria-hidden` on the line-split spans.
- Always test both light and dark mode when adding or modifying any component
- Every new page must include `id="main-content"` on its `<main>` element (required for the skip navigation link in `Layout.tsx`)
- Every `<a target="_blank">` must include `<span className="sr-only"> (opens in new tab)</span>` as its last child
- Never add `target="_blank"` to a link without the above span
- Do not use raw Unicode arrow or symbol characters (`→`, `♥`, `✓`, `★`) in visible content. Use lucide-react icons with `aria-hidden="true"` instead, or wrap the character in `aria-hidden="true"` and pair with visible text or an sr-only label.
- Decorative Unicode separators (e.g. `·`) that appear between words of visible text must be wrapped in `<span aria-hidden="true">·</span>` so screen readers do not announce them.
- Every decorative icon next to visible text must have `aria-hidden="true"`. Never omit it.
- All page content (including `PageHero` and `BottomCTA`) must be inside the single `<main id="main-content">` element
- Use `aria-live` regions for any content that updates dynamically after page load.

---

## Performance Checklist: Required When Adding Fonts, Images, or New Routes

- Preload critical fonts in `index.html` with `<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous">`
- Only preload fonts used above the fold. Check `index.html` for the current preload list and update it whenever above-the-fold typography changes.
- Do not lazy-load LCP images. Remove `loading="lazy"` from any above-the-fold image.
- Add `loading="lazy"` to all `<img>` elements that are not visible in the initial viewport.
- Add `fetchpriority="high"` to the LCP image.
- Add `width` and `height` attributes to every `<img>` element to prevent layout shift (CLS).
- New routes are automatically code-split by Vite. No manual action needed.
- Always run Lighthouse against the production build: `npm run build && npx serve dist`. Never run it against the dev server.
- Current baseline scores (production): Performance 96, Accessibility 100, Best Practices 100, SEO 100
