---
name: create-presentation
description: >
  Create a Reveal.js presentation deck for an OffOn event or challenge.
  Follows the established design system from public/deck.html.
  Outputs a self-contained HTML file in public/ with speaker notes.
---

# Create Presentation Command

Generate a Reveal.js presentation that matches the OffOn design system.

## What this command does

1. Gathers the presentation topic, audience, and slide outline from the user.
2. Writes a self-contained HTML file to `public/<filename>.html`.
3. Populates slides using the established CSS patterns and design tokens.
4. Adds speaker notes to every slide.
5. Does not touch `public/sitemap.xml`, `react-router.config.ts`, or `src/routes.ts` — these files are outside the React bundle.

---

## Step 0: Gather inputs

Ask for anything not already provided:

- **Topic** — event intro, challenge walkthrough, or other
- **Output filename** — e.g. `deck.html`, `challenge-intro.html`
- **Slides outline** — list of topics to cover, or free-form description
- **Speakers / contributors** — names and photos if applicable (photos go in `public/team/`)

If the user is creating an event deck, check `public/deck.html` for the existing event intro structure as a reference and to reuse already-written slide content where relevant.

---

## Design system

**Always copy the `<style>` block and `<head>` (fonts, Reveal.js links) verbatim from `public/deck.html`.** Do not reconstruct tokens or CSS from memory — the file is the source of truth and drifts over time.

Current token reference (verify against `public/deck.html` before use):

```css
--bg:         #0a0a0a;
--card:       #141419;
--border:     #1e2535;
--fg:         #faf9f2;          /* headings, Syne 700 */
--muted:      #f0ede5;          /* body text, Inter — matches site's hsl(43, 27%, 92%) */
--amber:      #ffc034;
--amber-glow: rgba(255, 192, 52, 0.14);
```

Fonts: Syne 700 (headings), Inter 400/500/600 (body). Self-hosted from `/fonts/`. No CDN links.

Reveal.js: self-hosted from `/reveal/`. Initialize with `RevealNotes` plugin, `width: 1280`, `height: 720`.

### Type scale

Four tiers — do not introduce intermediate sizes:

- **Heading** — `2.2em` (h1), `1.4em` (h2): slide titles only
- **Body** — `0.78em`: `.reveal p` baseline
- **Component** — `0.6em` (h4 equivalents), `0.54em` (body): card titles, bullet text, bios, descriptions
- **Label** — `0.38em`: overlines, tags, col-labels, metadata

Pills are `0.44em` — slightly above label tier because they are interactive.

### Amber discipline

Amber (`--amber`) signals two things only: **structure** (`.sh` overline label) and **active/current state** (highlighted rows, links, pills on hover). Do not use amber for bullet arrows or decorative dots — those use `var(--muted)` at 50% opacity.

All inline URL references (e.g. `offon.dev/contribute`) must use `style="color: #ffc034;"`. Do not rely on opacity to style links — opacity dims the amber and makes it unreadable.

---

## Layout rules

### `.sh` is always full-width — never nested inside a split column

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

**Wrong — never do this:**
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

`col-label` is a section label above a column's content. It is always smaller (`0.38em`) than the content items below it (`0.6em` h4). This is intentional — amber uppercase provides the hierarchy, size does not. Do not try to make `col-label` bigger than the items it labels. Trust the color and spacing.

The current CSS values (copied from `public/deck.html`):

- `.sh .label { margin-bottom: 0.55em }` — gap before the h2
- `.sh { margin-bottom: 1.1em }` — gap after the full header block
- `.col-label { margin-bottom: 0.9em }` — gap before column content

Do not override these inline unless there is a specific layout reason.

---

## Slide structure patterns

Copy these patterns from `public/deck.html`. Do not invent new CSS.

### Slide header (every content slide)

The `.sh` header uses amber on the overline label and bold Syne on the h2. No border or bar — the color and size contrast creates hierarchy on its own.

```html
<div class="sh">
  <span class="label">overline label</span>
  <h2>Slide Title</h2>
</div>
```

Overline label text is lowercase in HTML — CSS applies `text-transform: uppercase`.

### Layout grids
- `.g2` — 2-column equal grid
- `.g3` — 3-column equal grid
- `.g4` — 4-column equal grid
- `.split` — 1.15fr / 0.85fr (content + aside)
- `.split-even` — 1fr / 1fr

### Content cards
```html
<div class="card">
  <h4>Card Title</h4>
  <p>Card body text.</p>
</div>
```

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

Sub-text (`<p>`) inside a vrow is optional. Headings-only vrows are valid and intentional when the heading is self-explanatory — move the detail to speaker notes instead. Use `.hi` to highlight with amber left border.

### Quiz topic cards

Use `.g2` + `.card` for quiz topic categories. Do not use `.qrow` with round number badges — that pattern implies structured rounds and should not appear in event decks where rounds aren't the focus.

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
```html
<!-- Speaker (used in "Who's presenting" slides) -->
<div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
  <div style="display: flex; gap: 0.65em; align-items: center;">
    <div class="sp-av"><img src="/team/name.webp" alt="Full Name"></div>
    <div>
      <p class="sp-name">Full Name</p>
      <p class="sp-talk" style="margin: 0;">Talk title</p>
    </div>
  </div>
  <p class="sp-bio">One or two sentence bio.</p>
</div>

<!-- Board member (used in team grids) -->
<div class="person">
  <div class="av"><img src="/team/name.webp" alt="Full Name"></div>
  <div class="pi">
    <p class="pn">Full Name</p>
    <p class="pr">Role and affiliation.</p>
  </div>
</div>
```

Photos go in `public/team/<name>.webp`. If a photo is not available, use initials as text inside the avatar div.

### Title slide

`justify-content: flex-start` places cobrand and h1 at the top. The tagline paragraphs sit below with a fixed `margin-top` — do not use `flex: 1` spacers between the title and taglines, as that pushes them to the bottom of the slide.

```html
<section>
  <div class="title-slide">
    <div class="cobrand">
      <img src="/brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner Name</span>
    </div>
    <h1 style="color: #ffc034;">Presentation Title</h1>
    <p style="font-size: 0.7em; margin-top: 2.8em;">Subtitle or tagline.</p>
    <p style="font-size: 0.52em; margin-top: 0.35em; opacity: 0.5;">Event or context.</p>
    <p style="position: absolute; bottom: 1.8em; right: 2.2em; font-size: 0.38em; opacity: 0.28; letter-spacing: 0.04em;">Press S for speaker notes</p>
  </div>
  <aside class="notes">Speaker notes here.</aside>
</section>
```

If there is no co-brand partner, omit the `.cobrand` div and place the OffOn logo directly above the `h1`.

### Final / join slide

Include a 3-column QR code grid for the three main links before the pill row. Generate QR code PNGs with `npx qrcode -t png -o public/qr/<name>.png "<url>"` and reference them via `src="qr/<name>.png"`. The `onerror` handler hides the image box gracefully if the file is missing.

```html
<section>
  <div class="final">
    <div class="cobrand">
      <img src="/brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner</span>
    </div>
    <h2>Join us</h2>
    <p style="font-size: 0.65em; max-width: 26em; margin: 0.35em auto 0.8em;">CTA sentence.</p>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2em; margin-bottom: 0.8em; max-width: 28em;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em;">
        <div style="width: 5.5em; height: 5.5em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          <img src="qr/offon-dev.png" alt="QR code for offon.dev" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'; this.parentElement.style.opacity='0.3';">
        </div>
        <span style="font-size: 0.38em; color: #ffc034;">offon.dev</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em;">
        <div style="width: 5.5em; height: 5.5em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          <img src="qr/community-offon-dev.png" alt="QR code for community.offon.dev" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'; this.parentElement.style.opacity='0.3';">
        </div>
        <span style="font-size: 0.38em; color: #ffc034;">community.offon.dev</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em;">
        <div style="width: 5.5em; height: 5.5em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          <img src="qr/offon-dev-contribute.png" alt="QR code for offon.dev/contribute" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;" onerror="this.style.display='none'; this.parentElement.style.opacity='0.3';">
        </div>
        <span style="font-size: 0.38em; color: #ffc034;">offon.dev/contribute</span>
      </div>
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

After generating QR PNGs, add `cp -r dist/client/qr "${PREVIEW_DIR}/"` to the copy step in `.github/workflows/preview.yml` if it is not already there.

### Agenda table

```html
<table class="agenda">
  <tr><td>18:00</td><td>Item</td><td>Duration</td></tr>
  <tr class="hi"><td>18:10</td><td>Highlighted item</td><td>25 min</td></tr>
</table>
```

### Column label (above a column in split layouts)
```html
<span class="col-label">column heading</span>
```

Column label text is lowercase in HTML — CSS applies `text-transform: uppercase`.

---

## Copy and tone rules

- No em dashes anywhere. Use commas or periods.
- "always" is lowercase — never "Always" in the tagline.
- Overline labels and column labels: write source text in lowercase (CSS uppercases them).
- Title case for slide titles and card headings. Sentence case for body copy.
- Brand is always "OffOn" (camelCase). Domain is always "offon.dev" (lowercase).
- Do not enumerate difficulty levels by name.
- Keep slides tight. One idea per slide. Fewer words per bullet are better.
- Do not add filler qualifiers like "accessible to everyone" or "rewards people who were paying attention" to quiz or card descriptions.
- Do not mention "Propose a sponsor" as a contribution action.

---

## Speaker notes

Every `<section>` must have an `<aside class="notes">` block. Notes should:

- State what to say out loud that is not on the slide.
- Flag transitions: "This leads into the demo on the next slide."
- Call out anything time-sensitive or audience-dependent.
- When slide content is intentionally sparse (e.g. vrow headings-only), expand in notes with the sub-text that was omitted from the slide.
- Be written in plain sentences, not bullets.

Press S in the browser opens Reveal.js speaker view (current + next slide, notes, timer).

---

## Challenge presentation specifics

When creating a deck for a challenge walkthrough:

- Slide 1: Title + challenge name + difficulty badge (use a `.tag` styled pill inline).
- Slide 2: Scenario — what problem the user is solving. Use `.split`: scenario text left, architecture diagram or screenshot right.
- Slides 3–N: One slide per major step. Use `.sh` header with step number as overline label.
- Final slide: What the learner accomplished + link to the challenge on offon.dev.

For scenario and architecture text, pull from the adventure's generated TypeScript in `src/data/adventures/<id>/<id>.generated.ts`. The `scenario`, `architecture`, `backstory`, and `objective` fields are pre-rendered HTML — strip tags or paraphrase for slide copy; do not paste raw HTML into the deck.

---

## File output

- Write to `public/<filename>.html`.
- Do not add the file to `src/routes.ts`, `public/sitemap.xml`, or `react-router.config.ts`.
- Copy the full `<style>` block and `<head>` (fonts, Reveal.js links) verbatim from `public/deck.html` to keep the decks in sync.
- After writing the file, confirm: `ls -lh public/<filename>.html` and open `http://localhost:8080/<filename>.html` if the dev server is running.
