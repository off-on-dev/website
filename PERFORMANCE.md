# Performance

This file applies to all work on offon.dev. Read it before adding fonts, images, dependencies, or new routes.

> **Post-migration note:** the site is now Astro + Vue islands, not React Router. The performance *principles* below (image rules, font subsetting/preloading, self-hosting, "ship less JS") still hold, but some mechanics are superseded: global font preloads live in `src/layouts/Layout.astro` (not `root.tsx`); code-splitting and "zero JS by default" come from Astro islands (not React Router / `React.lazy`); markdown is pre-rendered by the content collection (`src/content.config.ts` + `src/lib/markdown-pipeline.mjs`), not a generator; prefetching uses Astro's native `prefetch` config (not a `SPECULATION_RULES` script); the build outputs `dist/` (not `dist/client/`); routes come from `getStaticPaths()` (no `react-router.config.ts` prerender array). Where this doc and `CLAUDE.md` disagree, `CLAUDE.md` wins.

---

## Targets

- Lighthouse performance score target is 95. Do not regress below 93 and aim to close the gap before adding new dependencies or fonts.
- Always run Lighthouse against `npm run build && npm run preview`. Never against the dev server.
- Check bundle size in Vite output after every `npm run build`. If a new dependency adds more than 10 KB to the main bundle, evaluate whether a lighter alternative exists.

---

## Core Web Vitals

Target these thresholds at the 75th percentile of real users:

| Metric | Target | Description |
| --- | --- | --- |
| LCP (Largest Contentful Paint) | ≤ 2.5 s | Time until the largest visible element is painted |
| INP (Interaction to Next Paint) | ≤ 200 ms | Responsiveness of click, tap, and keyboard interactions |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability; elements must not shift unexpectedly |

- Verify LCP, INP, and CLS in Lighthouse. For production traffic, use Google Search Console's Core Web Vitals report.
- LCP is most commonly caused by a hero image, large text block, or video poster. Identify the LCP element with Chrome DevTools and confirm it is not lazy-loaded.
- CLS is most commonly caused by images without explicit dimensions, late-loading fonts (use `font-display: optional` + preload), or injected banners that push existing layout.
- INP replaces FID as of March 2024. Keep JavaScript event handlers short; avoid long tasks on the main thread.

---

## Images

- Set explicit `width` and `height` attributes on every `<img>` to prevent layout shift (CLS).
- Add `loading="lazy"` to all `<img>` elements not visible in the initial viewport.
- Add `decoding="async"` to all `<img>` elements that are not the LCP image.
- Do not lazy-load the LCP image. Remove `loading="lazy"` from any above-the-fold image.
- Add `fetchpriority="high"` to the LCP image.
- If bitmap images are added to the site, prefer WebP over JPEG/PNG. For maximum compression, serve AVIF with a WebP fallback via `<picture>`. `public/og.png` must stay as PNG -- Open Graph crawlers do not reliably support modern formats.
- `public/og.png` is 1200 x 630 px (the standard OG image size). If the image is ever recreated, export at those exact dimensions and update `og:image:width`/`og:image:height` in `src/components/SEO.astro`.

---

## Fonts

- All fonts are self-hosted under `public/fonts/`. Never add an external font CDN link.
- `font-display: optional` is set on all fonts. This means the browser has a very short (~100 ms) window to load a font before permanently falling back to the system font for that page visit. Preloading is therefore required for fonts to render correctly on throttled connections.
- **Global preloads** go in `src/layouts/Layout.astro`'s `<head>` section as `<link rel="preload">` tags. Currently preloaded globally: Inter 400, 500, 600 (body text and semibold/bold labels); Syne 700 (h1–h2 via the `@layer base` rule). Inter 700 is **not** preloaded globally — it is used only for h3–h6, which never appear above the fold.
- There are no route-level preload exports (no `links()` function). Fonts needed only on specific pages must be added as `<link rel="preload">` in that page's frontmatter or in a layout variant.
  - **Rule: only preload a font weight if at least one element on that page uses it.** Preloading an unused weight generates a browser warning on every page visit and wastes bandwidth.
- The `src/styles/index.css` `@font-face` declarations cover only the `latin` and `latin-ext` subsets. The corresponding `.woff2` files for non-English subsets remain in `public/fonts/` but are never declared in CSS and will never be fetched.

---

## JavaScript and bundle size

- Astro ships zero JS by default. Code splitting only matters for Vue islands, which Vite handles automatically — no manual `defineAsyncComponent` needed.
- Never use `will-change` on more than 3 elements simultaneously.
- Before adding any new dependency, run `npm run build` and check the bundle output.
- **Do not introduce a runtime markdown-rendering component into `AdventureCard`, `ChallengesGrid`, or any component they transitively import.** All markdown in adventure YAML is pre-rendered to sanitised HTML at build time by the content collection (`src/content.config.ts` + `src/lib/markdown-pipeline.mjs`). Story fields render as plain text via `stripHtml`. Adding a runtime markdown renderer would bloat the main bundle with packages that the build already uses only once at build time.

---

## Critical CSS and render-blocking resources

- Never add a synchronous `<script>` in `<head>` without `defer` or `async`. Parser-blocking scripts halt HTML parsing and delay first paint.
- Avoid importing large CSS files not needed for above-the-fold content. Check Lighthouse's "Eliminate render-blocking resources" audit after adding any new stylesheet.
- Tailwind 4 purges unused classes at build time. Do not add CSS `@import` statements that Tailwind cannot tree-shake.

---

## Script loading

- Use `defer` for app scripts that depend on the DOM and on relative execution order.
- Use `async` for independent third-party scripts (analytics loaders, chat widgets) that have no execution-order dependencies.
- Never place a bare `<script src="...">` in `<head>` without `defer` or `async`.
- Astro generates `type="module"` scripts for islands automatically. Inline `.astro` scripts are hoisted and bundled. Do not override this.
- See the Analytics and Consent section in `CLAUDE.md` for the pattern used by the `gtag.js` injector. It is appended to `<body>` after consent, never blocking.

---

## Back/forward cache (BFCache)

- Never add `unload` or `beforeunload` event listeners. They disqualify pages from BFCache in most browsers, breaking instant back/forward navigation.
- The site has no `unload` listeners today. Audit any new third-party script for hidden `unload` usage before adding it.

---

## Visibility-aware rendering

- For pages with long lists of off-screen content (e.g. a large challenges grid), consider `content-visibility: auto` with `contain-intrinsic-size` to defer layout and paint for content below the fold.
- Intersection Observer is the correct API for any lazy behaviour tied to scroll position. Create observers inside `astro:page-load` (for `.astro` scripts) or `onMounted` (for Vue islands), never at module level.
- Never use scroll or resize listeners for visibility detection. They run on the main thread every frame and should be replaced with Intersection Observer.

---

## Scrollbar gutter

- Add `scrollbar-gutter: stable` to the `html` or `body` element in `src/index.css` to reserve scrollbar space. This prevents a horizontal layout shift when navigating between pages where content overflows vs. pages where it does not.

---

## Viewport units

- Use `min-h-dvh` (dynamic viewport height) instead of `min-h-screen` (100vh) on hero sections and full-page wrappers. On mobile browsers, `100vh` includes the address bar height, causing the section to appear taller than the visible area. `dvh` tracks the actual visible viewport and shrinks when the browser chrome is visible.
- Tailwind v4 exposes `min-h-dvh`, `min-h-svh`, and `min-h-lvh` as first-class utilities. Do not use `min-h-[100dvh]` arbitrary syntax -- use `min-h-dvh`.
- Similarly, prefer `h-dvh` over `h-screen` for any element that should fill the exact visible viewport.

---

## Prefetching

- Astro's native `prefetch` option (configured in `astro.config.mjs`) handles prefetching. No custom Speculation Rules script is needed or present.
- Do not add a `<script type="speculationrules">` element manually. If broader prefetch coverage is needed, extend the Astro `prefetch` config instead.

---

## Iframes and embeds

- Lazy-load `<iframe>` embeds with `loading="lazy"`.

---

## Motion

- Wrap all animations and transitions in `@media (prefers-reduced-motion: no-preference)` so they are disabled by default for users who prefer reduced motion.
- See [ACCESSIBILITY.md](ACCESSIBILITY.md) for the full motion rule.

---

## Hosting: Cloudflare Migration

The site is currently hosted on GitHub Pages. GitHub Pages cannot set arbitrary HTTP response headers, which blocks several security and performance improvements. Migrating to Cloudflare Pages (or proxying through Cloudflare) would unlock all of the following:

### Security headers (currently missing, cannot be set on GitHub Pages)

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS, Required per web spec)
- `X-Content-Type-Options: nosniff` (Required per web spec)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Recommended)
- `Content-Security-Policy` as an HTTP header with `frame-ancestors 'none'` (meta-tag CSP cannot block framing)
- `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (cross-origin isolation)
- `Referrer-Policy: strict-origin-when-cross-origin` (currently only set as an HTML meta tag)
- `Reporting-Endpoints` for CSP violation reporting

### Performance (currently limited by GitHub Pages CDN)

- **Brotli compression:** GitHub Pages only serves gzip. Brotli is 15-20% smaller on text assets. Cloudflare serves Brotli by default.
- **Immutable Cache-Control:** GitHub Pages caps `max-age` at 600s even for content-hashed assets. Cloudflare allows `Cache-Control: public, max-age=31536000, immutable` on fingerprinted files, dramatically improving repeat-visit load times.
- **HTTP/3 / QUIC:** Cloudflare enables HTTP/3 for all sites without configuration.
- **`No-Vary-Search`:** Cloudflare supports custom response headers needed for this caching hint.

### How to migrate

1. Add the site to a Cloudflare account and point DNS to Cloudflare nameservers.
2. In Cloudflare Pages, connect the GitHub repo and configure the build command (`npm run build`) and output directory (`dist/`).
3. Add a `_headers` file to `public/` (Cloudflare Pages reads it automatically) with the security and cache-control headers.
4. Remove the `deploy.yml` GitHub Actions workflow or repurpose it to trigger a Cloudflare Pages deploy hook.
5. Submit the domain to the HSTS preload list at <https://hstspreload.org> once HSTS is confirmed working.

### Sample `public/_headers` for Cloudflare Pages

```text
/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## New routes

- Routes come from file-based pages and `getStaticPaths()`. No prerender array exists.
- See the "Routes" section in `CLAUDE.md` for the full checklist: add new static pages to `PAGES` in `e2e/a11y.spec.ts`, `ROUTES` in `e2e/smoke.spec.ts`, `staticPaths` in `src/pages/sitemap.xml.ts`, and the routes table in `README.md`.
