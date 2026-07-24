# offon.dev

Source for [offon.dev](https://offon.dev/), the home of OffOn: a platform for open source enthusiasts. The site is fully static with no backend. Pages are prerendered at build time by **Astro**; interactivity is layered on as **Vue islands**. It hosts hands-on open source challenges, community documentation, and links to the OffOn community.

## Tech Stack

- **Astro 7** (`output: 'static'`) + **TypeScript**: prerendered pages, zero JS by default
- **Vue 3** islands via `@astrojs/vue`: interactivity hydrated with `client:*` directives
- **nanostores**: shared state across islands (theme, consent)
- **Tailwind CSS 4**: CSS-first via `src/styles/index.css` (`@theme`) and `@tailwindcss/vite`
- **astro-icon** (lucide) in `.astro`, **lucide-vue-next** in islands; **Reka UI** for the tooltip
- **Astro Content Collections** (Zod): adventure content authored as YAML, validated + rendered at build time
- **Playwright** + **axe**: accessibility and SEO/smoke tests (`e2e/`)
- **GitHub Pages**: hosting and deployment

## Getting Started

```sh
git clone https://github.com/off-on-dev/website
cd website
npm install
npm run dev        # Astro dev server (http://localhost:4321)
```

Node.js **26** is required (pinned in `.nvmrc`; `nvm use`).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Astro dev server at <http://localhost:4321> |
| `npm run build` | Static build to `dist/` |
| `npm run preview` | Serve the built `dist/` (`astro preview`) |
| `npm run sync` | `astro sync` — runs the Zod content schema over adventure YAML; fails on invalid content |
| `npm run test:e2e` | Playwright (a11y + SEO/smoke). Starts `astro preview` itself; no separate build needed |
| `npm run lint:reuse` | REUSE licence compliance check (requires `pip install reuse` once) |
| `node .claude/templates/generate-reveal-zip.mjs` | Regenerate `public/downloads/offon-reveal-template.zip` |
| `node .claude/templates/generate-pptx.mjs` | Regenerate `public/downloads/offon-deck-template.pptx` |

There is no content generator — routes and rendered prose come from the content collection at build time.

Always verify UI changes at mobile (375px), tablet (768px), and desktop (1280px) against the production build (`npm run build && npm run preview`), never the dev server.

## Project Structure

```text
src/
  pages/          # File-based routes (.astro); dynamic routes use getStaticPaths()
    index.astro, adventures/[id].astro, adventures/[id]/levels/[levelId].astro,
    adventures/[id]/levels/[levelId]/solution.astro, challenges/[...tag].astro,
    404.astro, the static pages, and _app.ts (Vue appEntrypoint)
  layouts/Layout.astro  # App shell: <head> (SEO, CSP, favicons, theme + GA4 bootstrap,
                        # JSON-LD), ClientRouter, skip-nav, Navbar, <slot/>, Footer, ConsentBanner
  components/      # *.astro (static, zero-JS) and *.vue islands (ThemeToggle, ChallengesFilter, ConsentBanner)
  content.config.ts  # Content collection: Zod schema + custom loader + build-time markdown rendering
  data/           # adventures/<id>/adventure.yaml + *-posts.json + leaderboard.json,
                  # solutions/<id>/<level>.ts, contributors.ts, types.ts, sponsors.ts, team.ts
  lib/            # markdown-pipeline.mjs, adventure-derive.mjs, community-data.ts, solutions.ts,
                  # challenges.ts, difficulty.ts, markdown.ts, utils.ts, site.ts (constants), deadline.mjs
  stores/         # nanostores: theme.ts ($theme), consent.ts ($consent + gtag injector)
  styles/index.css  # Tailwind @theme, component classes, light-mode overrides
  assets/diagrams/  # Architecture SVGs (imported per-level via import.meta.glob)
e2e/
  a11y.spec.ts    # axe (dark/light/forced-colors) + touch targets + focus rings + 200% zoom
  smoke.spec.ts   # per-route title/canonical/OG/h1 + island hydration
scripts/          # refresh-*.mjs (community data), sync-adventure.mjs, set-discussion-url.mjs,
                  # generate-community-sitemap.mjs, check-docs.sh, lib/
public/           # copied verbatim to dist/ (fonts, favicons, brand, well-known, decks, sitemap.xml, og.png)
astro.config.mjs, tsconfig.json, playwright.config.ts, package.json
```

### Adventure Content Pipeline

Adventures are authored as YAML at `src/data/adventures/<id>/adventure.yaml` and loaded by `src/content.config.ts` (Astro Content Collection):

- **Source of truth:** the YAML files. There are no generated `*.ts` files to commit.
- **Validation:** a Zod schema (`.strict()`) runs via `npm run sync`; invalid YAML fails the build.
- **Rendering:** author markdown fields are converted to sanitised HTML in the collection loader (`src/lib/markdown-pipeline.mjs`) at build time. `getCollection('adventures')` returns data with HTML fields ready to render via `set:html`.
- **Discussion/leaderboard** JSON is read at build time (`src/lib/community-data.ts`) and rendered statically. **Solutions** are pre-built TS objects loaded via `import.meta.glob`.
- **Sync from challenges repo:** the `sync-adventure` GitHub Actions workflow writes the YAML + discussion stubs; routes appear automatically via `getStaticPaths()`.

## Routes

| Path | Page | Purpose |
| --- | --- | --- |
| `/` | `index.astro` | Home page |
| `/adventures/` | `adventures/index.astro` | Adventures list |
| `/adventures/:id/` | `adventures/[id].astro` | Adventure detail |
| `/adventures/:id/levels/:levelId/` | `adventures/[id]/levels/[levelId].astro` | Individual challenge |
| `/adventures/:id/levels/:levelId/solution/` | `.../solution.astro` | Solution walkthrough (post-deadline) |
| `/challenges/` and `/challenges/:tag/` | `challenges/[...tag].astro` | All challenges; filter by technology tag (Vue island) |
| `/contribute/`, `/sponsors/`, `/about/`, `/handbook/` | static `.astro` pages | Contribute, sponsors, about, handbook |
| `/privacy/`, `/accessibility/`, `/brand/` | static `.astro` pages | Privacy (noindex), accessibility statement, brand guidelines |
| `/presentation-templates/` | static `.astro` page | Slide template downloads (noindex) |
| `/404/` | `404.astro` | 404 page (`dist/404.html`, served by GitHub Pages) |
| `/docs`, `/docs/community-guide`, `/community-guide` | redirects → `/handbook/` | Legacy aliases (`redirects` in `astro.config.mjs`) |

> The `/challenges` filter is a Vue island: it renders the full grid server-side (works without JS) and hydrates for topic/difficulty filtering, syncing `?topics`/`?difficulty` to the URL. Adventure and challenge pages link tags to `/challenges/:tag/`.

## SEO and Metadata

- **Per-page meta** comes from the `<SEO>` component (`src/components/SEO.astro`), fed by `Layout.astro` props: `<title>`, `<meta name="description">`, canonical (`${SITE_URL}${path}`), Open Graph (`og:title/description/type/url/image` + width/height/`OG_IMAGE_ALT`, `og:site_name`, `og:locale` en_GB), and Twitter card tags. Legal pages pass `noindex`.
- **Global head** (`Layout.astro`): charset, viewport, `color-scheme`, favicons, manifest, both `theme-color` tags, CSP meta, and two JSON-LD blocks (`WebSite` + `Organization`).
- **Web manifest:** `public/site.webmanifest` (name, icons, theme/background colors, standalone display).
- **Sitemap/robots:** `public/sitemap.xml` (static; a `sitemap.xml.ts` endpoint is a planned follow-up) and `public/robots.txt`.

## Analytics and Privacy

Google Analytics 4 with Consent Mode v2 in **gated-load mode**: no data is sent to Google until the user clicks Accept; `gtag.js` is not loaded until then. Cross-domain measurement is configured in the GA4 admin UI. See the Analytics and Consent section of `CLAUDE.md` for the full design.

| Constant (`src/lib/site.ts`) | Purpose |
| --- | --- |
| `GA_MEASUREMENT_ID` | GA4 Measurement ID (used by the consent store's gtag injector). |
| `CONSENT_STORAGE_KEY` | `localStorage` key for the consent decision. |
| `CONSENT_EXPIRY_MS` | Stored consent expiry (180 days). |

- `Layout.astro` ships the minimal inline `<head>` bootstrap (dataLayer + `gtag` shim + all four signals denied; no gtag.js, no `js`/`config`, no localStorage read).
- `src/stores/consent.ts` owns the state (`$consent` nanostore) and the gtag injector; `src/components/ConsentBanner.vue` is the island. `page_view` fires on `astro:page-load` only when consent is granted. On Decline/Reset, `_ga*` cookies are cleared.

## Deployment

- **Push to `main`** → [`deploy.yml`](.github/workflows/deploy.yml) builds `dist/` and deploys to GitHub Pages (<https://offon.dev>) via `JamesIves/github-pages-deploy-action`.
- **Open a PR** → [`preview.yml`](.github/workflows/preview.yml) runs the content gate (`astro sync`), build, and the full Playwright suite, then deploys a preview at `/pr-preview/pr-<n>/`.
- **PRs touching adventure data** → [`validate-adventures.yml`](.github/workflows/validate-adventures.yml) validates the YAML (Zod via `astro sync`), per-level discussion JSON, and `ADVENTURE_CATEGORIES` registration.
- **PRs adding components/utilities/constants/scripts/workflows** → [`validate-docs.yml`](.github/workflows/validate-docs.yml) requires `styleguide.md`/`README.md` updates.

Astro emits `dist/404.html` natively. PR preview builds set `VITE_BASE_PATH=/pr-preview/pr-<n>/` (→ Astro `base`) so assets resolve under the sub-path; `Layout.astro` marks such builds `noindex`.

## Adding Adventures and Levels

Adventures are authored in [off-on-dev/open-source-challenges](https://github.com/off-on-dev/open-source-challenges) and pulled in via the **Sync Adventure from Challenges Repo** workflow, which writes the YAML + discussion stubs and opens a PR. See [`ADVENTURES.md`](ADVENTURES.md) for the full guide.

## Accessibility

OffOn targets WCAG 2.2 Level AA across every page, in both light and dark mode. Automated axe scans run on every PR preview via [`e2e/a11y.spec.ts`](e2e/a11y.spec.ts). The full statement is in [`ACCESSIBILITY.md`](ACCESSIBILITY.md); contributor rules are in the Accessibility section of [`CLAUDE.md`](CLAUDE.md#accessibility).

## Further Reading

- [`ADVENTURES.md`](ADVENTURES.md): syncing, reviewing, and updating adventures and levels.
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md): public accessibility statement and how to report a barrier.
- [`PERFORMANCE.md`](PERFORMANCE.md): performance targets, image rules, font preloading, bundle size.
- [`styleguide.md`](styleguide.md): design system, color tokens, typography, component patterns.
- [`CLAUDE.md`](CLAUDE.md): contributor conventions, code quality, commit format, testing, accessibility.

## License

- Source code: [MIT](LICENSE)
- Written content (docs, copy, curriculum data): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Factual scraped data (community-leaders.json): [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- Bundled fonts (Inter, Syne, JetBrains Mono): [SIL OFL 1.1](https://openfontlicense.org/)

Per-file licensing is declared via the [REUSE](https://reuse.software) spec (`REUSE.toml`, `LICENSES/`).
The **OffOn** name and logo are reserved. See [TRADEMARK.md](TRADEMARK.md).

[![REUSE status](https://api.reuse.software/badge/github.com/off-on-dev/website)](https://api.reuse.software/info/github.com/off-on-dev/website)
