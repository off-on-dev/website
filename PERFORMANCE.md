# Performance

This file applies to all work on offon.dev. Read it before adding fonts, images, dependencies, or new routes.

---

## Targets

- Lighthouse performance score target is 95. Do not regress below 93 and aim to close the gap before adding new dependencies or fonts.
- Always run Lighthouse against `npm run build && npm run preview`. Never against the dev server.
- Check bundle size in Vite output after every `npm run build`. If a new dependency adds more than 10 KB to the main bundle, evaluate whether a lighter alternative exists.

---

## Images

- Set explicit `width` and `height` attributes on every `<img>` to prevent layout shift (CLS).
- Add `loading="lazy"` to all `<img>` elements not visible in the initial viewport.
- Add `decoding="async"` to all `<img>` elements that are not the LCP image.
- Do not lazy-load the LCP image. Remove `loading="lazy"` from any above-the-fold image.
- Add `fetchpriority="high"` to the LCP image.

---

## Fonts

- All fonts are self-hosted under `public/fonts/`. Never add an external font CDN link.
- `font-display: optional` is set on all fonts. This means the browser has a very short (~100 ms) window to load a font before permanently falling back to the system font for that page visit. Preloading is therefore required for fonts to render correctly on throttled connections.
- **Global preloads** go in the `links()` export in `src/root.tsx`. Use this for fonts that appear above the fold on every page. Currently preloaded globally: Inter 400, 500, 600, 700 (body text and semibold/bold labels); Syne 700 (h1–h6 via the `@layer base` rule).
- **Route-level preloads** go in the `links()` export of a specific route module. Use this for fonts that are only used on certain pages to avoid "preloaded but not used" warnings and wasted bandwidth on other pages. JetBrains Mono (400 and 600) is preloaded at route level on `Index.tsx`, `Challenges.tsx`, `AdventureDetail.tsx`, and `ChallengeDetail.tsx` — these are the routes that render `font-mono` elements. Do not add JetBrains Mono to the global preloads.
  ```ts
  export const links: LinksFunction = () => [
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  ];
  ```
- The `src/index.css` `@font-face` declarations cover only the `latin` and `latin-ext` subsets. Non-English subsets (cyrillic, greek, vietnamese) were removed — the site is English-only and `unicode-range` already prevented those files from being fetched, but the declarations added unnecessary CSS weight.
- When adding a new route that uses JetBrains Mono (e.g. a page with code blocks or difficulty badges), add the JetBrains Mono preloads to that route's `links()` export.

---

## JavaScript and bundle size

- Route-level code splitting is handled automatically by React Router v7. No manual `React.lazy` or `Suspense` wrappers are needed or should be added.
- Never use `will-change` on more than 3 elements simultaneously.
- Before adding any new dependency, run `npm run build` and check the bundle output.
- **`react-markdown` must not appear in the home page or `/challenges` bundle.** `AdventureCard` renders `adventure.story` as plain text (not through `MarkdownInline`) to keep the `react-markdown` + `remark-gfm` dependency (~46 kB gz) off the home page critical path. The generator warns at build time if any story contains markdown syntax. If `MarkdownInline` is ever imported in `AdventureCard`, `ChallengesGrid`, or any component they transitively import, verify the home page `index.html` does not reference the `MarkdownInline` chunk.

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