# Performance

This file applies to all work on offon.dev. Read it before adding fonts, images, dependencies, or new routes.

---

## Targets

- Lighthouse performance score target is 95. Current score is 93. Do not regress below 93 and aim to close the gap before adding new dependencies or fonts.
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
- Preload critical fonts via the `links()` export in `src/root.tsx` (not as hardcoded `<link>` tags in the JSX). React Router's `<Links />` manages these correctly and prevents the "preloaded but not used" browser warning.
  ```ts
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/inter-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" }
  ```
- Only preload fonts used above the fold. Check the `links()` export in `src/root.tsx` and update it whenever above-the-fold typography changes.

---

## JavaScript and bundle size

- Route-level code splitting is handled automatically by React Router v7. No manual `React.lazy` or `Suspense` wrappers are needed or should be added.
- Never use `will-change` on more than 3 elements simultaneously.
- Before adding any new dependency, run `npm run build` and check the bundle output.

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