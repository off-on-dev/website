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
- `public/og.png` is 1200 x 630 px (the standard OG image size). If the image is ever recreated, export at those exact dimensions and update `og:image:width`/`og:image:height` in `src/lib/meta.ts`, the tests in `src/test/meta.test.ts` and `src/test/seo.test.ts`, and the brand guidelines page `src/pages/BrandGuidelines.tsx`.

---

## Fonts

- All fonts are self-hosted under `public/fonts/`. Never add an external font CDN link.
- `font-display: optional` is set on all fonts. This means the browser has a very short (~100 ms) window to load a font before permanently falling back to the system font for that page visit. Preloading is therefore required for fonts to render correctly on throttled connections.
- **Global preloads** go in the `links()` export in `src/root.tsx`. Use this for fonts that appear above the fold on every page. Currently preloaded globally: Inter 400, 500, 600 (body text and semibold/bold labels); Syne 700 (h1–h2 via the `@layer base` rule). Inter 700 is **not** preloaded globally. It is used only for h3–h6, which never appear above the fold.
- **Route-level preloads** go in the `links()` export of a specific route module. Use this for fonts that are only used on certain pages to avoid "preloaded but not used" warnings and wasted bandwidth on other pages. Do not add JetBrains Mono to the global preloads.
  - **JetBrains Mono 400 and 600** are preloaded on `Index.tsx`, `Challenges.tsx`, `AdventureDetail.tsx`, and `ChallengeDetail.tsx`. These routes render both normal and semibold mono elements.
  - **JetBrains Mono 400 only** is preloaded on `Adventures.tsx`, `Contribute.tsx`, and `CommunityGuide.tsx`. These routes render mono elements but none use `font-semibold`, so the 600-weight file would be preloaded but unused.
  - **Rule: only preload a font weight if at least one element on that route uses it.** Preloading an unused weight generates a browser warning on every page visit and wastes bandwidth. Before adding a 600-weight preload to a route, confirm a `font-semibold font-mono` element exists in the component tree for that route.

  ```ts
  // Routes with both 400 and semibold (600) mono usage:
  export const links: LinksFunction = () => [
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  ];
  ```

- The `src/index.css` `@font-face` declarations cover only the `latin` and `latin-ext` subsets. Non-English subset declarations (cyrillic, greek, vietnamese) were removed from CSS. The site is English-only and `unicode-range` already prevented those files from being fetched, but the declarations added unnecessary CSS weight. Note: the corresponding `.woff2` files remain in `public/fonts/` but are never declared in CSS and will never be fetched by the browser.
- When adding a new route that uses JetBrains Mono (e.g. a page with code blocks or difficulty badges), add only the weight preloads the route actually needs to that route's `links()` export.

---

## JavaScript and bundle size

- Route-level code splitting is handled automatically by React Router v8. No manual `React.lazy` or `Suspense` wrappers are needed or should be added.
- Never use `will-change` on more than 3 elements simultaneously.
- Before adding any new dependency, run `npm run build` and check the bundle output.
- **Do not introduce a runtime markdown-rendering component into `AdventureCard`, `ChallengesGrid`, or any component they transitively import.** All Markdown is pre-rendered at build time by `scripts/generate-adventures.mjs`. Adventure story fields render as plain text. Adding a runtime renderer (e.g. one wrapping `react-markdown`) would pull `react-markdown` + `remark-gfm` (~46 kB gz) into the home page bundle. The generator warns at build time if any story field contains markdown syntax.

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
- React Router v8 generates `type="module"` scripts automatically. Do not override this.
- See the Analytics and Consent section in `CLAUDE.md` for the pattern used by the `gtag.js` injector. It is appended to `<body>` after consent, never blocking.

---

## Back/forward cache (BFCache)

- Never add `unload` or `beforeunload` event listeners. They disqualify pages from BFCache in most browsers, breaking instant back/forward navigation.
- The site has no `unload` listeners today. Audit any new third-party script for hidden `unload` usage before adding it.

---

## Visibility-aware rendering

- For pages with long lists of off-screen content (e.g. a large challenges grid), consider `content-visibility: auto` with `contain-intrinsic-size` to defer layout and paint for content below the fold.
- Intersection Observer is the correct API for any lazy behaviour tied to scroll position. Create observers inside `useEffect`, never at module level. Guard with `typeof window !== 'undefined'`.
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

- The site uses the Speculation Rules API to prefetch challenge and adventure pages. The rules are defined as `SPECULATION_RULES` in `src/root.tsx` and injected via DOM in a `useEffect`, not as static JSX.
- The DOM-injection approach is intentional. If a `<script type="speculationrules">` element appears in JSX, React's reconciler may touch it after the browser has already processed it, emitting the warning "Inline speculation rules cannot currently be modified after they are processed." DOM injection sidesteps this entirely.
- To update which paths are prefetched, edit the `SPECULATION_RULES` constant in `src/root.tsx`. Do not change the injection approach.
- Do not add a second `<script type="speculationrules">` element anywhere. The `useEffect` guard prevents duplicate injection, but two competing rule sets would cause unpredictable behaviour.

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
2. In Cloudflare Pages, connect the GitHub repo and configure the build command (`npm run build`) and output directory (`dist/client`).
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

- New routes are automatically code-split by Vite. No manual action needed.
- When adding a new static route, add it to `src/routes.ts`, `public/sitemap.xml`, the `prerender` array in `react-router.config.ts`, and the routes table in `README.md`.
- See the Site Maintenance section in `CLAUDE.md` for the full route checklist.
