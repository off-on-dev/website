# Performance

This file applies to all work on offon.dev. Read it before adding fonts, images, dependencies, or new routes.

---

## Targets

- Lighthouse performance score target is 95. Do not regress below 93 and aim to close the gap before adding new dependencies or fonts.
- Always run Lighthouse against `npm run build && npm run preview`. Never against the dev server.
- Check bundle size in Vite output after every `npm run build`. If a new dependency adds more than 10 KB to the main bundle, evaluate whether a lighter alternative exists.

---

## Core Web Vitals

Target these thresholds at the 75th percentile of real users:

| Metric | Target | Description |
|---|---|---|
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

---

## Fonts

- All fonts are self-hosted under `public/fonts/`. Never add an external font CDN link.
- `font-display: optional` is set on all fonts. This means the browser has a very short (~100 ms) window to load a font before permanently falling back to the system font for that page visit. Preloading is therefore required for fonts to render correctly on throttled connections.
- **Global preloads** go in the `links()` export in `src/root.tsx`. Use this for fonts that appear above the fold on every page. Currently preloaded globally: Inter 400, 500, 600, 700 (body text and semibold/bold labels); Syne 700 (h1–h6 via the `@layer base` rule).
- **Route-level preloads** go in the `links()` export of a specific route module. Use this for fonts that are only used on certain pages to avoid "preloaded but not used" warnings and wasted bandwidth on other pages. JetBrains Mono (400 and 600) is preloaded at route level on `Index.tsx`, `Challenges.tsx`, `AdventureDetail.tsx`, and `ChallengeDetail.tsx`. These are the routes that render `font-mono` elements. Do not add JetBrains Mono to the global preloads.
  ```ts
  export const links: LinksFunction = () => [
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  ];
  ```
- The `src/index.css` `@font-face` declarations cover only the `latin` and `latin-ext` subsets. Non-English subsets (cyrillic, greek, vietnamese) were removed. The site is English-only and `unicode-range` already prevented those files from being fetched, but the declarations added unnecessary CSS weight.
- When adding a new route that uses JetBrains Mono (e.g. a page with code blocks or difficulty badges), add the JetBrains Mono preloads to that route's `links()` export.

---

## JavaScript and bundle size

- Route-level code splitting is handled automatically by React Router v7. No manual `React.lazy` or `Suspense` wrappers are needed or should be added.
- Never use `will-change` on more than 3 elements simultaneously.
- Before adding any new dependency, run `npm run build` and check the bundle output.
- **`react-markdown` must not appear in the home page or `/challenges` bundle.** `AdventureCard` renders `adventure.story` as plain text (not through `MarkdownInline`) to keep the `react-markdown` + `remark-gfm` dependency (~46 kB gz) off the home page critical path. The generator warns at build time if any story contains markdown syntax. If `MarkdownInline` is ever imported in `AdventureCard`, `ChallengesGrid`, or any component they transitively import, verify the home page `index.html` does not reference the `MarkdownInline` chunk.

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
- React Router v7 generates `type="module"` scripts automatically. Do not override this.
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

## New routes

- New routes are automatically code-split by Vite. No manual action needed.
- When adding a new static route, add it to `public/sitemap.xml`, the `prerender` array in `react-router.config.ts`, and the routes table in `README.md`.
- See the Site Maintenance section in `CLAUDE.md` for the full route checklist.