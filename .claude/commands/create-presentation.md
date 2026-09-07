---
name: create-presentation
description: >
  Create a presentation deck for an OffOn event or challenge.
  Supports Slidev (Markdown, builds to static HTML) and editable PowerPoint PPTX.
---

# Create Presentation Command

Generate a presentation that matches the OffOn design system, in the format of your choice.

## What this command does

1. Asks which output format the user wants.
2. Reads the appropriate template or reference files.
3. Generates slide content and fills in the placeholders.
4. Writes the output and (for Slidev) runs the build.
5. Does not touch `src/pages/sitemap.xml.ts`, `astro.config.mjs` redirects, or test route lists.

---

## Step 0: Gather inputs

Ask for anything not already provided:

- **Format**: which output format?
  - `slidev`: Markdown deck built to self-contained static HTML, served from GitHub Pages under `/decks/<slug>/`
  - `pptx`: Editable Microsoft PowerPoint (edit and run `node .ai/templates/generate-pptx.mjs`)
- **Topic**: event intro, challenge walkthrough, or other
- **Event slug**: a kebab-case name used as the directory name (e.g. `open-source-talks`). Slidev output goes to `public/decks/<slug>/`.
- **Slides outline**: list of topics to cover, or free-form description
- **Speakers / contributors**: names, talk titles, short bios, and photos if applicable (photos go in `public/speakers/` for event speakers, `public/team/` for board members)

If the user is creating an event deck, read `decks/offon-x-dynatrace/deck.md` for the existing event intro structure as a reference and to reuse already-written slide content where relevant.

---

## Design system

Read the template for the chosen format; it contains all boilerplate. Do not reconstruct fonts, colors, or config from memory.

| Format | Template / reference |
| --- | --- |
| Slidev | `decks/template/deck-template.md` (all layouts), `decks/template/offon/` (theme) |
| PowerPoint | `.ai/templates/generate-pptx.mjs` (edit and run to regenerate) |

Brand token reference (for writing slide content):

| Token | Value |
| --- | --- |
| Background | `#0a0a0a` |
| Foreground | `#faf9f2` |
| Muted text | `#f0ede5` |
| Accent (amber) | `#ffc034` |
| Card bg | `#141419` |
| Border | `#1e2535` |

### Type scale (Slidev theme)

| Role | Element | Size |
| --- | --- | --- |
| Display | `h1` | `3.2em` |
| Section | `h2` | `2.4em` |
| Sub | `h3` | `1.4em` |
| Body | `p` | `0.78em` baseline |
| Label | `.label` overline | `0.6em`, `text-transform: uppercase` |

---

## Slidev workflow

### Step 1: Create the deck directory

```sh
cp -r decks/template decks/<slug>
```

Then update `decks/<slug>/package.json`: change the `dev` and `build` scripts so `deck-template.md` becomes the correct filename (keep it `deck-template.md` unless the user prefers a different name, in which case rename the file too).

### Step 2: Author the deck

Edit `decks/<slug>/deck-template.md` (or your renamed file). Key rules:

- Each slide is a Markdown section separated by `---`.
- Use the layout classes from `decks/template/deck-template.md` verbatim (`.sh`, `.brow`, `.split`, `.split-even`, `.card`, `.speaker-card`, `.board`, `.board-sm`, `.person`). Do not invent new classes.
- Refer to `decks/offon-x-dynatrace/deck.md` for real completed slide examples.
- Inline `<style>` blocks in `deck.md` are scoped to that slide only; global overrides go in `decks/<slug>/offon/style.css`.
- Photo images referenced in the deck must exist in `public/speakers/` or `public/team/`. Reference them with a root-relative path: `/speakers/name.webp`. Slidev copies `public/` into the build.
- Frontmatter `title` becomes the browser tab title and the `<title>` element.

### Step 3: Preview locally

```sh
# VSCODE_CWD= is mandatory: without it, VS Code sets VSCODE_CWD="/", which
# disables the UnoCSS icon loader and makes all nav/control icons invisible.
VSCODE_CWD= pnpm --dir decks/<slug> dev
```

First-time setup (run once per machine):

```sh
pnpm --dir decks/<slug> install
pnpm --dir decks/<slug> approve-builds   # pnpm 11+ security policy: approve esbuild postinstall
```

Dev server runs at `http://localhost:3030`. Changes hot-reload.

### Step 4: Build

```sh
rm -rf public/decks/<slug>
VSCODE_CWD= pnpm --dir decks/<slug> build
```

The build script injects a `<meta name="robots" content="noindex">` into the output `index.html` automatically. Built output lands in `public/decks/<slug>/`.

### Step 5: Commit

Built output is committed alongside source (same pattern as `decks/template/` and `decks/offon-x-dynatrace/`). Stage everything:

```sh
git ls-files --deleted | xargs git rm --cached -q   # remove old hashed assets
git add decks/<slug>/ public/decks/<slug>/
git commit -s
```

### Step 6: Register the route

The built deck is a self-contained Slidev app, not an Astro page. Add it to the exclusion list so the test suite knows it exists but does not require full coverage:

In `e2e/routes.ts`, add the path to `ROUTES_WITHOUT_FULL_COVERAGE`:

```typescript
"/decks/<slug>/",
```

---

## Slide layouts (Slidev)

All layouts below are in `decks/template/deck-template.md`. Read that file before writing any slide.

| Slide | Key classes / elements |
| --- | --- |
| Cover | `layout: cover` in frontmatter, `.offon-logo` div, `# Title`, subtitle `<p>` |
| Agenda | `.sh` header, `<table class="agenda">`, `.hi` for highlighted rows |
| Bullet rows | `.sh` header, `.brow` rows with `.dot` and `.bt` |
| Two-column split | `.split` (1.15fr / 0.85fr) or `.split-even` (1fr / 1fr) |
| Cards grid | `.cards-grid`, `.card` with `h4` and `p` |
| Speaker cards | `.speakers`, `.speaker-card` with `.sp-av`, `.sp-info`, `.sp-name`, `.sp-talk`, `.sp-bio` |
| Board members | `.board` (3-col) or `.board-sm` (compact), `.person` with `.pname` and `.prole` |
| Final / join | `.center` layout, `.final-actions`, `.final-community-link` |

### Persistent elements

Two elements appear on every slide. They are injected by the theme layout; do not add them to individual slides.

- **OffOn logo mark**: top-right corner (`.logo-mark` in the theme's `default.vue`)
- **Slide number**: bottom-right, styled by `.slidev-layout .page-number` in `style.css`

---

## PowerPoint workflow

The PPTX generator is `.ai/templates/generate-pptx.mjs`. Edit slide content directly in that file, then run:

```sh
# pptxgenjs is not in devDependencies (not needed in CI). Install locally first:
npm install pptxgenjs
node .ai/templates/generate-pptx.mjs
```

Output: `public/downloads/offon-deck-template.pptx`. Fonts (Inter 18pt, Syne) are embedded automatically. The slide background (`bg.png`) is the pre-rendered firefly gradient; do not regenerate it unless the design changes.

---

## Canonical slide order for an event intro deck

Follow this order unless there is a specific reason to deviate. `decks/offon-x-dynatrace/deck.md` is the reference implementation.

1. Cover (event title + co-brand logo)
2. What is OffOn (brief intro)
3. Agenda (table with times, speakers, breaks)
4. Tonight's format / house rules
5. Speaker cards (one row of 1–3 speaker cards per talk)
6–N. Talk-specific slides (one set per talk)
N+1. Who's behind OffOn (board grid)
N+2. Community / how to join
N+3. Final / join slide with QR and links

---

## Do not

- Do not use bare asset paths (`brand/...`, `fonts/...`) in Slidev slide markdown; Slidev copies `public/` at build time but resolves from root, so use `/brand/...` (absolute from public root).
- Do not reference `public/deck/index.html` or `public/deck-template/index.html` -- those are removed. The canonical reference is `decks/offon-x-dynatrace/deck.md` for real slide content and `decks/template/deck-template.md` for layout reference.
- Do not skip the `VSCODE_CWD=` prefix; without it, all nav/control icons render invisible in VS Code-launched processes.
- Do not skip `pnpm approve-builds` on a fresh clone; pnpm 11+ blocks esbuild's postinstall otherwise.
- Do not commit only source without the built output -- the built deck in `public/decks/<slug>/` is what GitHub Pages serves.
