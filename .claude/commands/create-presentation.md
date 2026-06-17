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

### Value rows (for two-column feature lists)
```html
<div class="vrow hi">
  <h4>Feature name</h4>
  <p>Description.</p>
</div>
```
Use `.hi` to highlight with amber left border. Omit `.hi` for muted items.

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
```html
<section>
  <div class="title-slide">
    <div class="cobrand">
      <img src="/brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner Name</span>
    </div>
    <h1>Presentation Title</h1>
    <p style="font-size: 0.7em; margin-top: 0.45em;">Subtitle or tagline.</p>
    <p style="font-size: 0.52em; margin-top: 0.35em; opacity: 0.5;">Event or context.</p>
    <p style="position: absolute; bottom: 1.8em; right: 2.2em; font-size: 0.38em; opacity: 0.28; letter-spacing: 0.04em;">Press S for speaker notes</p>
  </div>
  <aside class="notes">Speaker notes here.</aside>
</section>
```

If there is no co-brand partner, omit the `.cobrand` div and place the OffOn logo directly above the `h1`.

### Final / join slide
```html
<section>
  <div class="final">
    <div class="cobrand">
      <img src="/brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner</span>
    </div>
    <h2>Join us</h2>
    <p style="font-size: 0.65em; max-width: 22em; margin: 0.35em auto 0;">CTA sentence.</p>
    <div class="link-row">
      <a href="https://offon.dev" class="pill hi">offon.dev</a>
      <a href="https://community.offon.dev" class="pill">community.offon.dev</a>
    </div>
  </div>
  <aside class="notes">Speaker notes here.</aside>
</section>
```

### Agenda table
```html
<table class="agenda">
  <tr><td>18:00</td><td>Item</td><td>Duration</td></tr>
  <tr class="hi"><td>18:10</td><td>Highlighted item</td><td>25 min</td></tr>
</table>
```

### Quiz rounds
```html
<div class="qrow">
  <span class="rnum">Round 1</span>
  <h4>Round title</h4>
  <p>Round description.</p>
</div>
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

---

## Speaker notes

Every `<section>` must have an `<aside class="notes">` block. Notes should:

- State what to say out loud that is not on the slide.
- Flag transitions: "This leads into the demo on the next slide."
- Call out anything time-sensitive or audience-dependent.
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
