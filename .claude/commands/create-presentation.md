---
name: create-presentation
description: >
  Create a presentation deck for an OffOn event or challenge.
  Supports Reveal.js HTML and editable PowerPoint PPTX.
  Uses format-specific templates from public/ and .claude/templates/.
---

# Create Presentation Command

Generate a presentation that matches the OffOn design system, in the format of your choice.

## What this command does

1. Asks which output format the user wants.
2. Reads the appropriate template file.
3. Generates slide content and fills in the placeholders.
4. Writes the output file to `public/`.
5. Does not touch `public/sitemap.xml`, `react-router.config.ts`, or `src/routes.ts`.

---

## Step 0: Gather inputs

Ask for anything not already provided:

- **Format**: which output format?
  - `html`: Reveal.js (self-contained HTML, opens in any browser, served from GitHub Pages)
  - `pptx`: Editable Microsoft PowerPoint (run `node .claude/templates/generate-pptx.mjs` and customise the output)
- **Topic**: event intro, challenge walkthrough, or other
- **Output filename**: Reveal.js — an event slug that becomes the folder name, e.g. `open-source-talks` (written to `public/open-source-talks/index.html`). PPTX — a `.md` outline is not written as a file; edit `.claude/templates/generate-pptx.mjs` directly.
- **Slides outline**: list of topics to cover, or free-form description
- **Speakers / contributors**: names and photos if applicable (photos go in `public/team/` for board members, `public/speakers/` for event speakers)

If the user is creating an event deck, check `public/deck/index.html` for the existing event intro structure as a reference and to reuse already-written slide content where relevant.

---

## Design system

Read the template for the chosen format; it contains all boilerplate. Do not reconstruct fonts, colors, or config from memory.

| Format | Template file |
| --- | --- |
| Reveal.js (`html`) | `public/deck-template/index.html` |
| PowerPoint (`pptx`) | `.claude/templates/generate-pptx.mjs` (edit and run to regenerate) |

Brand token reference (for writing slide content):

| Token | Value |
| --- | --- |
| Background | `#0a0a0a` |
| Foreground | `#faf9f2` |
| Muted text | `#f0ede5` |
| Accent (amber) | `#ffc034` |
| Card bg | `#141419` |
| Border | `#1e2535` |

### Type scale

Four tiers; do not introduce intermediate sizes:

- **Heading** (`2.2em` h1, `1.4em` h2): slide titles only
- **Body** (`0.78em`): `.reveal p` baseline
- **Component** (`0.65em` h4, `0.58em` body): card titles, bullet text, bios, descriptions. Exception: `.ctext` inside `.contrib .citem` is `0.52em`, one step smaller so contribute-card lists read as secondary detail.
- **Label** (`0.42em`): overlines, tags, col-labels, metadata

Pills are `0.44em`: slightly above label tier because they are interactive.

### Amber discipline

Amber (`--amber`) is used for: **structure labels** (`.sh` overline, `.col-label`), **active/current state** (highlighted rows, links, pills on hover), **category headings** (`.contrib h4` only), and **final slide CTA headings** (`.final h2`).

Do not use amber on `.card h4`, `.vrow h4`, or `.person .pn`: those are informational headings and names, not labels or CTAs. Using amber on them dilutes its signal.

Do not use amber for bullet arrows or decorative dots; those use `var(--muted)` at 50% opacity.

All inline URL references (e.g. `offon.dev/contribute`) must use `style="color: #ffc034;"`. Do not rely on opacity to style links; opacity dims the amber and makes it unreadable.

---

## Layout rules

### `.sh` is always full-width; never nested inside a split column

Every slide's primary heading block (`.sh`) must sit **outside** any split or grid container, spanning the full slide width. Content columns come after it.

**Correct:**

```html
<div class="sh">
  <span class="label">overline</span>
  <h2>Slide Title</h2>
</div>
<div class="split-even">
  <div><!-- left column content --></div>
  <div><!-- right column content --></div>
</div>
```

**Wrong; never do this:**

```html
<div class="split-even">
  <div>
    <div class="sh">...</div>  <!-- ← nested inside column -->
    ...
  </div>
  <div>
    <span class="col-label">...</span>
    ...
  </div>
</div>
```

When a slide has two sub-sections (e.g. "What makes a good talk" left + "Want to present?" right), the **primary** `.sh` goes full-width above the split. Secondary section headings inside columns use their own `.sh` at the column level.

### Section labels vs. content headings

`col-label` is a section label above a column's content. It is always smaller (`0.42em`) than the content items below it (`0.65em` h4). This is intentional; amber uppercase provides the hierarchy, size does not. Do not try to make `col-label` bigger than the items it labels. Trust the color and spacing.

The current CSS values (copied from `public/deck/index.html`):

- `.sh .label { font-size: 0.42em; margin-bottom: 0.6em }`: overline size and gap before the h2
- `.sh { margin-bottom: 1.2em }`: gap after the full header block
- `.col-label { font-size: 0.42em; margin-bottom: 0.9em }`: gap before column content

Do not override these inline unless there is a specific layout reason.

---

## Slide structure patterns

Copy these patterns from `public/deck/index.html`. Do not invent new CSS.

### Slide header (every content slide)

The `.sh` header uses amber on the overline label and bold Syne on the h2. No border or bar; the color and size contrast creates hierarchy on its own.

```html
<div class="sh">
  <span class="label">overline label</span>
  <h2>Slide Title</h2>
</div>
```

Overline label text is lowercase in HTML; CSS applies `text-transform: uppercase`.

### Layout grids

- `.g2`: 2-column equal grid
- `.g3`: 3-column equal grid
- `.g4`: 4-column equal grid
- `.split`: 1.15fr / 0.85fr (content + aside)
- `.split-even`: 1fr / 1fr

### Content cards

```html
<div class="card">
  <h4>Card Title</h4>
  <p>Card body text.</p>
</div>
```

To show an exclusion or "not a good fit" note without using red or warning colours, use a dimmed card:

```html
<div class="card" style="margin-top: 0.6em; opacity: 0.55;">
  <p>Not a good fit: product demos, vendor pitches, or talks that require a commercial tool.</p>
</div>
```

The `opacity: 0.55` visually recedes the card so the exclusion reads as secondary to the positive list above it. Do not use `rgba(200,80,80,...)` backgrounds or red-tinted text; there is no red colour token in the design system.

### Bullet rows (use this, not `<ul>/<li>`)

```html
<div class="brow">
  <span class="dot">→</span>
  <span class="bt">Bullet text. <strong>Bold part</strong> if needed.</span>
</div>
```

The dot is muted, not amber. The `<strong>` inside `.bt` renders in `--fg` (near-white).

### Value rows (for feature lists in a column)

```html
<div class="vrow">
  <h4>Feature name</h4>
</div>
```

Each vrow has a `2px solid var(--border)` left border. Add `.hi` to turn that border amber, drawing the eye to one highlighted item:

```html
<div class="vrow hi">
  <h4>Venue, food, and drinks</h4>
</div>
```

Sub-text (`<p>`) inside a vrow is optional. Headings-only vrows are valid and intentional when the heading is self-explanatory; move the detail to speaker notes instead.

### Quiz topic cards

Use `.g2` + `.card` for quiz topic categories. Do not use `.qrow` with round number badges; that pattern implies structured rounds and should not appear in event decks where rounds aren't the focus.

```html
<div class="g2" style="margin-top: 0.5em;">
  <div class="card">
    <h4>OSS History and Culture</h4>
    <p>General open source knowledge.</p>
  </div>
  <div class="card">
    <h4>Tonight's Topics</h4>
    <p>Based on the two talks.</p>
  </div>
</div>
```

Do not add "accessible to everyone", "rewards people who were paying attention", or similar filler qualifiers to quiz card descriptions.

### Contribute-style cards (icon + title + arrow list)

```html
<div class="contrib">
  <span class="ci">⚡</span>
  <h4>Card Title</h4>
  <div class="citem"><span class="cdot">→</span><span class="ctext">Item text</span></div>
</div>
```

### Tech tags

```html
<div class="tags">
  <span class="tag">OpenTelemetry</span>
  <span class="tag" style="border-style: dashed; color: var(--amber); border-color: rgba(255,192,52,0.3);">your project?</span>
</div>
```

### Person / speaker cards

Event speaker photos go in `public/speakers/<name>.webp`. Board member photos go in `public/team/<name>.webp`. Never mix the two directories. If a photo is not available, use initials as text inside the avatar div.

```html
<!-- Event speaker (used in "Who's presenting" slides; photos from public/speakers/) -->
<div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
  <div style="display: flex; gap: 0.65em; align-items: center;">
    <div class="sp-av"><img src="../speakers/name.webp" alt="Full Name"></div>
    <div class="sp-info">
      <p class="sp-name">Full Name</p>
      <p class="sp-talk" style="margin: 0;">Talk title</p>
    </div>
  </div>
  <p class="sp-bio">One or two sentence bio.</p>
</div>

<!-- Board member (used in team grids; photos from public/team/) -->
<div class="person">
  <div class="av"><img src="../team/name.webp" alt="Full Name"></div>
  <div class="pi">
    <p class="pn">Full Name</p>
    <p class="pr">Role and affiliation.</p>
  </div>
</div>
```

### Team / board slide

Wrap `.person` cards in `.board` for the team grid. The CSS provides a 3-column layout automatically.

```html
<div class="board">
  <div class="person">
    <div class="av"><img src="../team/name.webp" alt="Full Name"></div>
    <div class="pi">
      <p class="pn">Full Name</p>
      <p class="pr">Role and affiliation.</p>
    </div>
  </div>
  <!-- repeat for each board member -->
  <div class="person tba">
    <div class="av">?</div>
    <div class="pi">
      <p class="pn">To be announced</p>
      <p class="pr">Board seat open</p>
    </div>
  </div>
</div>
```

Use `class="person tba"` for unfilled seats; this applies `opacity: 0.55` and a dashed border.

### Title slide

`justify-content: flex-start` places cobrand and h1 at the top. The tagline paragraphs sit below with a fixed `margin-top`: do not use `flex: 1` spacers between the title and taglines, as that pushes them to the bottom of the slide.

```html
<section>
  <div class="title-slide">
    <div class="cobrand">
      <img src="../brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner Name</span>
    </div>
    <h1 style="color: #ffc034;">Presentation Title</h1>
    <p style="font-size: 0.7em; margin-top: 2.8em;">Subtitle or tagline.</p>
    <p style="font-size: 0.52em; margin-top: 0.35em; opacity: 0.7;">Event or context.</p>
    <p style="position: absolute; bottom: 1.8em; right: 2.2em; font-size: 0.38em; opacity: 0.28; letter-spacing: 0.04em;">Press S for speaker notes</p>
  </div>
  <aside class="notes">Speaker notes here.</aside>
</section>
```

If there is no co-brand partner, omit the `.cobrand` div and place the OffOn logo directly above the `h1`.

### Final / join slide

Include a centered QR code for the primary signup link before the pill row. The current reference deck (`public/deck/index.html`) uses a single QR for `community.offon.dev/signup`. Choose which URLs to show QR codes for based on the event; the `qr/` directory in `public/` contains the available PNGs. Generate new QR code PNGs with `npx qrcode -t png -o public/qr/<name>.png "<url>"`. The `onerror` handler on each image hides it gracefully if the file is missing. The `public/qr/` directory is already included in the preview copy step in `.github/workflows/preview.yml`.

```html
<section>
  <div class="final">
    <div class="cobrand">
      <img src="../brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner</span>
    </div>
    <h2>Join Us</h2>
    <p style="font-size: 0.65em; max-width: 26em; margin: 0.35em auto 0.8em;">CTA sentence.</p>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em; margin-bottom: 0.8em;">
      <div style="width: 7em; height: 7em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
        <img src="../qr/community-offon-dev-signup.png" alt="QR code for community.offon.dev/signup" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'">
      </div>
      <span style="font-size: 0.38em; color: #ffc034;">community.offon.dev/signup</span>
    </div>
    <div class="link-row">
      <a href="mailto:offondev@gmail.com" class="pill">offondev@gmail.com</a>
      <a href="https://bsky.app/profile/off-on-dev.bsky.social" class="pill">Bluesky</a>
      <a href="https://www.linkedin.com/company/offondev" class="pill">LinkedIn</a>
      <a href="https://x.com/OffonDev" class="pill">X</a>
    </div>
  </div>
  <aside class="notes">Speaker notes here.</aside>
</section>
```

### Agenda table

```html
<table class="agenda">
  <tr><td>17:30</td><td>Doors open, networking</td><td>30 min</td></tr>
  <tr class="hi"><td>18:00</td><td>Welcome, OffOn.dev intro</td><td>10 min</td></tr>
</table>
```

Rows without `.hi` render text in `var(--muted)` (dimmed). Rows with `.hi` render text in `var(--fg)` (bright/foregrounded); use it for the active segments of the evening. The time column stays amber regardless. Note: `.hi` behaves differently on agenda rows (text brightness) vs `.vrow.hi` (border colour); they share the class name but different CSS rules apply.

### Column label (above a column in split layouts)

```html
<span class="col-label">column heading</span>
```

Column label text is lowercase in HTML; CSS applies `text-transform: uppercase`.

---

## Brand and image assets

The deck lives in a subfolder (`public/<event-slug>/index.html`), so all asset paths must be prefixed with `../` to resolve the sibling directories in `public/`. This matches how `deck/index.html` and `deck-template/index.html` already work, and ensures paths resolve correctly regardless of trailing-slash normalisation. Never use bare paths (e.g. `brand/...`) — they would resolve relative to the deck's own subfolder, which contains no assets.

| Asset | Path | Where used |
| --- | --- | --- |
| OffOn logo (dark bg) | `../brand/offon-logo-dark-color.svg` | `.cobrand` in title and final slides |
| OffOn favicon icon | `../brand/offon-favicon.svg` | Persistent `#deck-logo` top-right corner |
| Nyx mascot (peek) | `../nyx_peek.webp` | About OffOn slide, right column, decorative |
| Board member photos | `../team/<name>.webp` | `.board .person .av img` |
| Event speaker photos | `../speakers/<name>.webp` | `.speaker-card .sp-av img` |
| QR codes | `../qr/<slug>.png` | Final slide QR grid |

The Nyx mascot image is always decorative; use `alt=""` and `aria-hidden="true"`. Apply `opacity: 0.6` and a fixed `height` (e.g. `230px`) so it doesn't compete with the slide content:

```html
<img src="../nyx_peek.webp" alt="" aria-hidden="true"
     style="height: 230px; object-fit: contain; opacity: 0.6;">
```

---

## Persistent elements (outside `.reveal`)

Two elements sit outside the `.reveal` div and appear on every slide. Copy them verbatim from the template; do not move them inside `.reveal` or modify their structure.

### Favicon logo (`#deck-logo`)

```html
<img id="deck-logo" src="../brand/offon-favicon.svg" alt="" aria-hidden="true" width="34" height="44">
```

CSS (already in the template `<style>` block):

```css
#deck-logo { position: fixed; top: 20px; right: 28px; height: 44px; pointer-events: none; z-index: 200; }
```

`z-index: 200` is required; Reveal.js internal overlays go up to z-index 100. Use explicit `width`/`height` attributes so the browser sizes the SVG correctly (the source uses mm units which some browsers don't auto-scale from CSS alone).

### Firefly particle effect (`#ff-wave`, `#ff-mist`)

An amber particle cluster in the lower portion of the viewport, with an ambient glow gradient. All CSS and HTML is in the template. Key rules:

```css
html, body { background: var(--bg); }
.reveal-viewport { background: transparent; }

#ff-wave, #ff-mist { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
#ff-wave { background:
  radial-gradient(ellipse 200% 28% at 50% 100%, rgba(255,192,52,.042) 0%, transparent 65%),
  radial-gradient(ellipse 48% 52% at 14% 100%, rgba(255,192,52,.042) 0%, transparent 72%),
  radial-gradient(ellipse 42% 42% at 48% 100%, rgba(255,192,52,.029) 0%, transparent 68%),
  radial-gradient(ellipse 46% 50% at 80% 100%, rgba(255,192,52,.037) 0%, transparent 70%); }
/* Wide base layer (200%) ensures full-width coverage; three narrower bumps at 14%, 48%, 80% create a mountain-range height variation. Do not replace with a single centred ellipse; the base+bumps structure is what prevents dark gaps at the edges. */

.fw    { position: absolute; border-radius: 50%; background: #ffc034; }
.fw-hi { width:2.5px; height:2.5px; box-shadow: 0 0 1.8px 0px rgba(255,192,52,.95), 0 0 4px 0px rgba(255,192,52,.28); }
.fw-md { width:2px;   height:2px;   box-shadow: 0 0 1.2px 0px rgba(255,192,52,.80), 0 0 3.2px 0px rgba(255,192,52,.20); }
.fw-lo { width:1.5px; height:1.5px; box-shadow: 0 0 0.8px 0px rgba(255,192,52,.65), 0 0 2.5px 0px rgba(255,192,52,.14); }
```

**Why `body` holds the background:** `.reveal-viewport` is added to `<body>` by Reveal.js at runtime. Setting `background: transparent` on `.reveal-viewport` lets the dark `html, body` background show through, while `#ff-wave` (position fixed, z-index 0) appears behind opaque slide content but shows through dark/empty slide areas.

**Particle layout rules:**

- Particles live in the `top: 85–94%` zone. `fw-hi` solos sit highest (85–87%); `fw-lo` can dip to 94%. Vary `top` values within each cluster across the full range so particles scatter vertically rather than aligning on a single horizontal line.
- Use 5 clusters of 4 dots (2–4% apart horizontally) with deliberate gaps between clusters. Inter-cluster gaps should be irregular (not all ~20%); vary them so one gap reads as a wide clearing and others as tighter separations.
- Place a lone `fw-hi` dot in each gap between clusters; the brighter solo reads as an individual firefly against the dark gap.
- Do not arrange particles in a wave, arc, or any mathematically regular pattern.
- `#ff-mist` holds 7–8 very faint (`opacity: .08–.11`) `fw-lo` particles in the 93–97% zone, grouped as pairs and solos with uneven spacing — not evenly distributed. They add depth without structure.
- The ambient glow gradient is on `#ff-wave`'s `background` property (not on `.reveal .slides section`) so it always fills the full viewport width.

---

## Copy and tone rules

- No em dashes anywhere. Use commas or periods.
- "always" is lowercase; never "Always" in the tagline.
- Overline labels and column labels: write source text in lowercase (CSS uppercases them).
- Title case for slide titles and card headings. Sentence case for body copy.
- Brand is always "OffOn" (camelCase). Domain is always "offon.dev" (lowercase).
- Do not enumerate difficulty levels by name.
- Keep slides tight. One idea per slide. Fewer words per bullet are better.
- Do not add filler qualifiers like "accessible to everyone" or "rewards people who were paying attention" to quiz or card descriptions.
- Do not mention "Propose a sponsor" as a contribution action.

---

## Speaker notes

Every `<section>` must have an `<aside class="notes">` block.

Use a `<ul><li>` list inside the notes block; Reveal.js renders the notes panel as HTML, so this produces real bullet points that are easy to read aloud:

```html
<aside class="notes">
  <ul>
    <li>First thing to say out loud that is not on the slide.</li>
    <li>Second point; expand on something the slide left sparse.</li>
    <li>End with a transition: "Next: what this means in practice."</li>
  </ul>
</aside>
```

Notes must:

- State what to say out loud, not repeat what is already on the slide.
- End every slide's notes with a transition line: "Next: …"
- Expand on intentionally sparse content (e.g. vrow headings-only slides).
- Call out anything time-sensitive, audience-dependent, or only relevant to the host.

Press S in the browser opens Reveal.js speaker view (current + next slide, notes, timer).

---

## Event intro deck structure

The canonical slide order for an Open Source Talks event intro deck. Follow this order unless there is a specific reason to deviate. `public/deck/index.html` is the reference implementation.

| # | Title | Layout | Key content |
| --- | ------- | --------- | ----------- |
| 1 | Title slide | `.title-slide` + `.cobrand` | Event name, partners, tagline, city, "Press S" hint |
| 2 | What are Open Source Talks? | `.g3` cards | Venues, format, quiz |
| 3 | The Agenda | `.agenda` table | Full evening schedule with `.hi` on active rows |
| 4 | Who's Presenting | `.g3` speaker cards | One `.speaker-card` per speaker |
| 5 | About OffOn | `.split` | Mission bullets left, Nyx mascot image right |
| 6 | Adventures | Bullet rows + `.tags` | Codespaces, difficulty, Credly badges, tool tags |
| 7 | Community | Bullet rows | community.offon.dev, categories |
| 8 | Every Contribution Counts | `.g4` `.contrib` cards | Community / Challenges / Content / Community Building |
| 9 | What Makes a Good Talk | `.split` | Talk types left + dimmed exclusion card; "Want to present?" card right |
| 10 | OffOn Board Members | `.board` | `.person` cards, `.person tba` for open seats |
| 11 | Why Dynatrace Cares | `.split-even` | Rationale bullets left; `.vrow` list right with `.hi` on venue row |
| 12 | Open Source Pub Quiz | `.g2` cards | Two round topics |
| 13 | Join Us | `.final` | Cobrand, QR grid, `.link-row` pills |

Slides 6 and 7 are intentionally split; don't merge Adventures and Community back into one slide. Each needs room to breathe.

---

## Challenge presentation specifics

When creating a deck for a challenge walkthrough:

- Slide 1: Title + challenge name + difficulty badge (use a `.tag` styled pill inline).
- Slide 2: Scenario; what problem the user is solving. Use `.split`: scenario text left, architecture diagram or screenshot right.
- Slides 3–N: One slide per major step. Use `.sh` header with step number as overline label.
- Final slide: What the learner accomplished + link to the challenge on offon.dev.

For scenario and architecture text, pull from the adventure's generated TypeScript in `src/data/adventures/<id>/<id>.generated.ts`. The `scenario`, `architecture`, `backstory`, and `objective` fields are pre-rendered HTML; strip tags or paraphrase for slide copy; do not paste raw HTML into the deck.

---

## File output

1. Read the template for the chosen format.
2. Generate all slide content (see slide structure patterns above for Reveal.js; see Slidev and Marp patterns below for those formats).
3. In the output file, replace the example placeholder slides with the generated content. Keep the boilerplate (head, style, scripts for HTML) intact.
4. Update the title in `<title>` (Reveal.js).
5. Write to:
   - Reveal.js: `public/<event-slug>/index.html` (create the subfolder if it does not exist)
6. Do not add any of these files to `src/routes.ts`, `public/sitemap.xml`, or `react-router.config.ts`.
7. Confirm: `ls -lh <output-path>`

**For PowerPoint (`pptx`):** edit `.claude/templates/generate-pptx.mjs` with the presentation content, then run:

```sh
node .claude/templates/generate-pptx.mjs
```

This outputs `public/downloads/offon-deck-template.pptx`. Fonts (Inter 18pt, Syne) are embedded automatically. The slide background (`bg.png`) is the pre-rendered firefly gradient; do not regenerate it unless the design changes.
