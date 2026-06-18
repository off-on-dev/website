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

**Always copy the `<style>` block, `<head>` (fonts, Reveal.js links), `#ff-wave` div, `#ff-mist` div, and `<script>` init block verbatim from `public/deck.html`.** Do not reconstruct tokens, CSS, or config from memory — the file is the source of truth and drifts over time.

The full `<body>` frame looks like this (copy the exact content):

```html
<body>
<div id="ff-wave" aria-hidden="true">
  <!-- firefly wave dots — copy all <span> elements verbatim from deck.html -->
</div>
<div id="ff-mist" aria-hidden="true" style="position:fixed;inset:0;pointer-events:none;z-index:0">
  <!-- dense dim mist dots — copy all <span> elements verbatim from deck.html -->
</div>
<div class="reveal">
  <div class="slides">
    <!-- slides go here -->
  </div>
</div>
<script src="reveal/reveal.js"></script>
<script src="reveal/plugin/notes.js"></script>
<script>
  Reveal.initialize({
    hash: true,
    slideNumber: 'c/t',
    transition: 'slide',
    backgroundTransition: 'fade',
    controls: true,
    progress: true,
    center: false,
    width: 1280,
    height: 720,
    margin: 0.04,
    plugins: [ RevealNotes ]
  });
</script>
</body>
```

Copy both the `#ff-wave` and `#ff-mist` span lists verbatim — do not regenerate positions or opacities by hand.

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

To show an exclusion or "not a good fit" note without using red or warning colours, use a dimmed card:

```html
<div class="card" style="margin-top: 0.6em; opacity: 0.55;">
  <p>Not a good fit: product demos, vendor pitches, or talks that require a commercial tool.</p>
</div>
```

The `opacity: 0.55` visually recedes the card so the exclusion reads as secondary to the positive list above it. Do not use `rgba(200,80,80,...)` backgrounds or red-tinted text — there is no red colour token in the design system.

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

Sub-text (`<p>`) inside a vrow is optional. Headings-only vrows are valid and intentional when the heading is self-explanatory — move the detail to speaker notes instead.

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

Event speaker photos go in `public/speakers/<name>.webp`. Board member photos go in `public/team/<name>.webp`. Never mix the two directories. If a photo is not available, use initials as text inside the avatar div.

```html
<!-- Event speaker (used in "Who's presenting" slides — photos from public/speakers/) -->
<div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
  <div style="display: flex; gap: 0.65em; align-items: center;">
    <div class="sp-av"><img src="speakers/name.webp" alt="Full Name"></div>
    <div class="sp-info">
      <p class="sp-name">Full Name</p>
      <p class="sp-talk" style="margin: 0;">Talk title</p>
    </div>
  </div>
  <p class="sp-bio">One or two sentence bio.</p>
</div>

<!-- Board member (used in team grids — photos from public/team/) -->
<div class="person">
  <div class="av"><img src="team/name.webp" alt="Full Name"></div>
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
    <div class="av"><img src="team/name.webp" alt="Full Name"></div>
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

Use `class="person tba"` for unfilled seats — this applies `opacity: 0.32` and a dashed border.

### Title slide

`justify-content: flex-start` places cobrand and h1 at the top. The tagline paragraphs sit below with a fixed `margin-top` — do not use `flex: 1` spacers between the title and taglines, as that pushes them to the bottom of the slide.

```html
<section>
  <div class="title-slide">
    <div class="cobrand">
      <img src="brand/offon-logo-dark-color.svg" alt="OffOn">
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
      <img src="brand/offon-logo-dark-color.svg" alt="OffOn">
      <span class="xsep">×</span>
      <span class="partner">Partner</span>
    </div>
    <h2>Join Us</h2>
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
  <tr><td>17:30</td><td>Doors open, networking</td><td>30 min</td></tr>
  <tr class="hi"><td>18:00</td><td>Welcome, OffOn.dev intro</td><td>10 min</td></tr>
</table>
```

Rows without `.hi` render text in `var(--muted)` (dimmed). Rows with `.hi` render text in `var(--fg)` (bright/foregrounded) — use it for the active segments of the evening. The time column stays amber regardless. Note: `.hi` behaves differently on agenda rows (text brightness) vs `.vrow.hi` (border colour) — they share the class name but different CSS rules apply.

### Column label (above a column in split layouts)

```html
<span class="col-label">column heading</span>
```

Column label text is lowercase in HTML — CSS applies `text-transform: uppercase`.

---

## Brand and image assets

All paths are relative to `public/` and must be written without a leading slash (e.g. `brand/offon-logo-dark-color.svg`, not `/brand/...`). Reveal.js is served directly from `public/` so relative paths resolve correctly.

| Asset | Path | Where used |
| --- | --- | --- |
| OffOn logo (dark bg) | `brand/offon-logo-dark-color.svg` | `.cobrand` in title and final slides |
| Nyx mascot (peek) | `brand/offon-nyx-peek.png` | About OffOn slide, right column, decorative |
| Board member photos | `team/<name>.webp` | `.board .person .av img` |
| Event speaker photos | `speakers/<name>.webp` | `.speaker-card .sp-av img` |
| QR codes | `qr/<slug>.png` | Final slide QR grid |

The Nyx mascot image is always decorative — use `alt=""` and `aria-hidden="true"`. Apply `opacity: 0.6` and a fixed `height` (e.g. `230px`) so it doesn't compete with the slide content:

```html
<img src="brand/offon-nyx-peek.png" alt="" aria-hidden="true"
     style="height: 230px; object-fit: contain; opacity: 0.6;">
```

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

Every `<section>` must have an `<aside class="notes">` block.

Use a `<ul><li>` list inside the notes block — Reveal.js renders the notes panel as HTML, so this produces real bullet points that are easy to read aloud:

```html
<aside class="notes">
  <ul>
    <li>First thing to say out loud that is not on the slide.</li>
    <li>Second point — expand on something the slide left sparse.</li>
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

The canonical slide order for an Open Source Talks event intro deck. Follow this order unless there is a specific reason to deviate. `public/deck.html` is the reference implementation.

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

Slides 6 and 7 are intentionally split — don't merge Adventures and Community back into one slide. Each needs room to breathe.

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
- Copy the `<head>`, `<style>` block, `#ff-wave` div, `#ff-mist` div, and `<script>` init block verbatim from `public/deck.html` (see body frame in Design system section above).
- After writing the file, confirm: `ls -lh public/<filename>.html` and open `http://localhost:8080/<filename>.html` if the dev server is running.
