/**
 * Generates an editable OffOn presentation PPTX.
 *
 * Strategy:
 *  - Solid #0a0a0a slide background matches the website dark mode
 *  - All text, shapes, and images are native PPT elements (fully editable)
 *  - Fonts (Inter 18pt, Syne) are embedded via JSZip post-processing (OOXML)
 *  - Optional firefly background: insert public/downloads/offon-firefly-bg.svg
 *    as a full-slide image on any slide that needs the visual effect
 *
 * Before running: place the four TTF files in tmp/ (gitignored at project root):
 *   Inter_18pt-Regular.ttf, Inter_18pt-SemiBold.ttf, Syne-Regular.ttf, Syne-Bold.ttf
 *
 * Run: node .claude/templates/generate-pptx.mjs
 */

import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';

const __dir = dirname(fileURLToPath(import.meta.url));
const FONTS = resolve(__dir, '../../tmp');
const BRAND = resolve(__dir, '../../public/brand');
const OUT   = resolve(__dir, '../../public/downloads/offon-deck-template.pptx');

// ── Brand tokens ─────────────────────────────────────────────────────────────

const BG    = '0a0a0a';
const FG    = 'faf9f2';
const MUTED = 'f0ede5';
const AMBER = 'ffc034';
const CARD  = '141419';
const BORD  = '1e2535';

// Font family names as declared in the TTF name table (name ID 1)
const INTER = 'Inter 18pt';
const SYNE  = 'Syne';

// ── Slide dimensions (16:9, 10" × 5.625") ────────────────────────────────────

const W  = 10;
const H  = 5.625;
const PX = 0.9;   // horizontal padding
const PY = 0.6;   // vertical padding
const CW = W - PX * 2;

// ── Asset paths ───────────────────────────────────────────────────────────────

const LOGO    = `${BRAND}/offon-logo-dark-color.png`;
const FAVICON = `${BRAND}/offon-favicon.png`;

// ── pptxgenjs init ────────────────────────────────────────────────────────────

const pptx  = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'OffOn';

// ── Slide helpers ─────────────────────────────────────────────────────────────

function addBg(s) {
  s.background = { color: BG };
}

function addSlide() {
  const s = pptx.addSlide();
  addBg(s);
  s.addImage({ path: FAVICON, x: W - PX - 0.24, y: 0.18, w: 0.24, h: 0.31 });
  return s;
}

// Overline label (amber, uppercase, letter-spaced)
function label(s, text, y) {
  s.addText(text.toUpperCase(), {
    x: PX, y, w: CW, h: 0.22,
    fontFace: INTER, fontSize: 9, bold: true,
    color: AMBER, charSpacing: 2,
  });
}

// Section heading
function heading(s, text, y, opts = {}) {
  s.addText(text, {
    x: opts.x ?? PX,
    y,
    w: opts.w ?? CW,
    h: opts.h ?? 0.56,
    fontFace: SYNE,
    fontSize: opts.size ?? 26,
    bold: true,
    color: opts.color ?? FG,
    align: opts.align ?? 'left',
  });
}

// Bullet line — uses ▸ arrow marker for reliability across PPT renderers
function bullet(s, parts, y) {
  // parts: string | Array<{text, bold?, color?}>
  const textParts = [
    { text: '▸  ', options: { color: AMBER, bold: false } },
    ...(typeof parts === 'string'
      ? [{ text: parts, options: { color: MUTED } }]
      : parts.map(p => ({ text: p.text, options: { color: p.color ?? MUTED, bold: p.bold ?? false } }))),
  ];
  s.addText(textParts, {
    x: PX, y, w: CW, h: 0.46,
    fontFace: INTER, fontSize: 14,
    paraSpaceBefore: 2,
  });
}

// Horizontal rule
function rule(s, y) {
  s.addShape(pptx.ShapeType.line, {
    x: PX, y, w: CW, h: 0,
    line: { color: BORD, width: 0.75 },
  });
}

// Rounded card background
function cardBg(s, x, y, w, h) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: CARD },
    line: { color: BORD, width: 1.5 },
    rectRadius: 0.08,
  });
}

// ── Slide 1: Cover ────────────────────────────────────────────────────────────

{
  const s = pptx.addSlide();
  addBg(s);
  s.addImage({ path: LOGO,    x: PX,            y: PY,   w: 1.6, h: 0.4 });
  s.addImage({ path: FAVICON, x: W - PX - 0.24, y: 0.18, w: 0.24, h: 0.31 });

  s.addText('Presentation Title', {
    x: PX, y: PY + 0.72, w: CW, h: 0.76,
    fontFace: SYNE, fontSize: 42, bold: true, color: AMBER,
  });
  s.addText('Subtitle or tagline goes here.', {
    x: PX, y: PY + 1.56, w: CW, h: 0.38,
    fontFace: INTER, fontSize: 18, color: MUTED,
  });
  s.addText('DD Month YYYY  ·  Venue', {
    x: PX, y: PY + 2.04, w: CW, h: 0.3,
    fontFace: INTER, fontSize: 13, color: MUTED, transparency: 50,
  });
}

// ── Slide 2: Agenda ───────────────────────────────────────────────────────────

{
  const s  = addSlide();
  heading(s, 'The Agenda', PY);

  const TY  = PY + 0.72;
  const COL = [PX, PX + 1.05, PX + 6.7];
  const CWS = [0.95, 5.55, 1.52];

  // Header row
  rule(s, TY - 0.04);
  [
    { text: 'Time',     align: 'left'  },
    { text: 'Session',  align: 'left'  },
    { text: 'Duration', align: 'right' },
  ].forEach(({ text, align }, i) =>
    s.addText(text, {
      x: COL[i], y: TY, w: CWS[i], h: 0.26,
      fontFace: SYNE, fontSize: 11, bold: true, color: AMBER, align,
    }),
  );
  rule(s, TY + 0.28);

  const rows = [
    ['18:00', 'Welcome and intro',           '10 min'],
    ['18:10', 'First talk — Speaker Name',   '25 min + Q&A'],
    ['18:40', 'Break',                       '15 min'],
    ['18:55', 'Second talk — Speaker Name',  '25 min + Q&A'],
    ['19:25', 'Networking',                  'Open-ended'],
  ];

  rows.forEach(([time, session, dur], ri) => {
    const ry = TY + 0.34 + ri * 0.46;
    s.addText(time, { x: COL[0], y: ry, w: CWS[0], h: 0.4, fontFace: INTER, fontSize: 12, color: MUTED });
    s.addText(session, { x: COL[1], y: ry, w: CWS[1], h: 0.4, fontFace: INTER, fontSize: 13, bold: true, color: FG, wrap: true });
    s.addText(dur,     { x: COL[2], y: ry, w: CWS[2], h: 0.4, fontFace: INTER, fontSize: 12, color: MUTED, align: 'right' });
    rule(s, ry + 0.42);
  });
}

// ── Slide 3: Bullet list ──────────────────────────────────────────────────────

{
  const s = addSlide();
  label(s, 'Section Label', PY);
  heading(s, 'Slide Title', PY + 0.26);

  const by = PY + 0.26 + 0.64;
  bullet(s, [{ text: 'Key point.', bold: true, color: FG }, { text: '  Supporting detail goes here.' }], by);
  bullet(s, [{ text: 'Another point.', bold: true, color: FG }, { text: '  Keep bullets tight, one idea each.' }], by + 0.5);
  bullet(s, [{ text: 'Third point.', bold: true, color: FG }, { text: '  Use speaker notes to expand.' }], by + 1.0);
  bullet(s, 'Plain bullet without emphasis.', by + 1.5);
}

// ── Slide 4: Bullets + technology tags ───────────────────────────────────────

{
  const s = addSlide();
  label(s, 'Section Label', PY);
  heading(s, 'Slide Title', PY + 0.26);

  const by = PY + 0.26 + 0.64;
  bullet(s, [{ text: 'Key point.', bold: true, color: FG }, { text: '  Supporting detail goes here.' }], by);
  bullet(s, [{ text: 'Another point.', bold: true, color: FG }, { text: '  Keep bullets tight.' }], by + 0.5);
  bullet(s, [{ text: 'Third point.', bold: true, color: FG }, { text: '  Use speaker notes to expand.' }], by + 1.0);

  // Tag pills row
  const tags = [
    { text: 'Tag One' }, { text: 'Tag Two' }, { text: 'Tag Three' },
    { text: 'Tag Four' }, { text: 'your project?', hi: true },
  ];
  let tx = PX, ty = by + 1.62;
  tags.forEach(({ text, hi }) => {
    const tw = Math.max(text.length * 0.084 + 0.36, 0.9);
    s.addShape(pptx.ShapeType.roundRect, {
      x: tx, y: ty, w: tw, h: 0.3,
      fill: { color: hi ? '120e00' : CARD },
      line: { color: hi ? AMBER : BORD, width: hi ? 1 : 0.75, dashType: hi ? 'dash' : 'solid' },
      rectRadius: 0.05,
    });
    s.addText(text, { x: tx, y: ty, w: tw, h: 0.3, fontFace: INTER, fontSize: 10, color: hi ? AMBER : FG, align: 'center' });
    tx += tw + 0.14;
  });
}

// ── Slide 5: Two columns ──────────────────────────────────────────────────────

{
  const s   = addSlide();
  label(s, 'Section Label', PY);
  heading(s, 'Two Columns', PY + 0.26);

  const colW = CW / 2 - 0.22;
  const cy   = PY + 0.26 + 0.64;

  [[PX, 'Left column', ['Left bullet one', 'Left bullet two', 'Left bullet three']],
   [PX + colW + 0.44, 'Right column', ['Right bullet one', 'Right bullet two', 'Right bullet three']]]
    .forEach(([x, title, items]) => {
      s.addText(title, { x, y: cy, w: colW, h: 0.3, fontFace: INTER, fontSize: 13, bold: true, color: FG });
      items.forEach((b, i) =>
        s.addText([
          { text: '▸  ', options: { color: AMBER } },
          { text: b, options: { color: MUTED } },
        ], { x, y: cy + 0.36 + i * 0.44, w: colW, h: 0.4, fontFace: INTER, fontSize: 13 }),
      );
    });
}

// ── Slide 6: Three cards ──────────────────────────────────────────────────────

{
  const s  = addSlide();
  label(s, 'Section Label', PY);
  heading(s, 'Slide Title', PY + 0.26);

  const cy  = PY + 0.26 + 0.64;
  const cw  = CW / 3 - 0.14;
  const ch  = H - cy - 0.44;

  ['Card One', 'Card Two', 'Card Three'].forEach((title, i) => {
    const cx = PX + i * (cw + 0.21);
    cardBg(s, cx, cy, cw, ch);
    s.addText(title, { x: cx + 0.2, y: cy + 0.2, w: cw - 0.4, h: 0.3, fontFace: SYNE, fontSize: 14, bold: true, color: FG });
    s.addText('Short description. One or two sentences maximum.', {
      x: cx + 0.2, y: cy + 0.56, w: cw - 0.4, h: ch - 0.72,
      fontFace: INTER, fontSize: 11, color: MUTED, wrap: true,
    });
  });
}

// ── Slide 7: Speakers ─────────────────────────────────────────────────────────

{
  const s  = addSlide();
  label(s, "Tonight's Speakers", PY);
  heading(s, "Who's Presenting", PY + 0.26);

  const cy  = PY + 0.26 + 0.64;
  const cw  = CW / 3 - 0.14;
  const ch  = H - cy - 0.44;

  Array.from({ length: 3 }).forEach((_, i) => {
    const cx = PX + i * (cw + 0.21);
    cardBg(s, cx, cy, cw, ch);
    s.addText('Speaker Name', { x: cx + 0.2, y: cy + 0.2,  w: cw - 0.4, h: 0.28, fontFace: SYNE, fontSize: 14, bold: true, color: FG });
    s.addText('Talk Title',   { x: cx + 0.2, y: cy + 0.52, w: cw - 0.4, h: 0.24, fontFace: INTER, fontSize: 11, color: AMBER });
    s.addText('Role, affiliation, notable contribution.', {
      x: cx + 0.2, y: cy + 0.8, w: cw - 0.4, h: ch - 0.96,
      fontFace: INTER, fontSize: 11, color: MUTED, wrap: true,
    });
  });
}

// ── Slide 8: Join Us ──────────────────────────────────────────────────────────

{
  const s = pptx.addSlide();
  addBg(s);
  s.addImage({ path: FAVICON, x: W - PX - 0.24, y: 0.18, w: 0.24, h: 0.31 });
  s.addImage({ path: LOGO, x: W / 2 - 0.8, y: PY, w: 1.6, h: 0.4 });

  heading(s, 'Join Us', PY + 0.64, { size: 38, color: AMBER, align: 'center' });
  s.addText(
    'Attend an event, propose a talk, start a challenge, or just say hello in the community.',
    { x: PX + 0.8, y: PY + 1.38, w: CW - 1.6, h: 0.5, fontFace: INTER, fontSize: 13, color: MUTED, align: 'center', wrap: true },
  );

  const pills = [
    { text: 'Join the community', hi: true },
    { text: 'offon.dev' },
    { text: 'offondev@gmail.com' },
    { text: '@off-on-dev.bsky.social' },
    { text: 'offondev (LinkedIn)' },
    { text: '@OffonDev (X)' },
  ];

  // Center-aligned pill layout
  const ROW_H = 0.42;
  const GAP   = 0.14;
  let rows = [[]];
  let rowW  = 0;
  pills.forEach(p => {
    const pw = Math.max(p.text.length * 0.082 + 0.36, 1.0);
    p.pw = pw;
    if (rowW + pw + (rows[rows.length - 1].length ? GAP : 0) > CW) { rows.push([]); rowW = 0; }
    rows[rows.length - 1].push(p);
    rowW += pw + (rows[rows.length - 1].length > 1 ? GAP : 0);
  });

  let py2 = PY + 2.08;
  rows.forEach(row => {
    const totalW = row.reduce((s, p) => s + p.pw, 0) + (row.length - 1) * GAP;
    let px2 = (W - totalW) / 2;
    row.forEach(({ text, hi, pw }) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: px2, y: py2, w: pw, h: 0.3,
        fill: { color: hi ? '120e00' : CARD },
        line: { color: hi ? AMBER : BORD, width: hi ? 1 : 0.75 },
        rectRadius: 0.06,
      });
      s.addText(text, { x: px2, y: py2, w: pw, h: 0.3, fontFace: INTER, fontSize: 10, color: hi ? AMBER : MUTED, align: 'center' });
      px2 += pw + GAP;
    });
    py2 += ROW_H;
  });
}

// ── Write initial PPTX ────────────────────────────────────────────────────────

await pptx.writeFile({ fileName: OUT });
console.log('PPTX written, embedding fonts...');

// ── Font embedding via JSZip (OOXML) ─────────────────────────────────────────

// OOXML obfuscation: XOR first 32 bytes of font with reversed GUID bytes
function obfuscateFont(fontBuffer, guid) {
  const hex     = guid.replace(/-/g, '');
  const keyBytes = Buffer.from(hex, 'hex').reverse(); // 16 bytes, reversed
  const out      = Buffer.from(fontBuffer);
  for (let i = 0; i < Math.min(32, out.length); i++) {
    out[i] ^= keyBytes[i % 16];
  }
  return out;
}

const EMBED = [
  { ttf: 'Inter_18pt-Regular.ttf',  typeface: INTER, variant: 'regular' },
  { ttf: 'Inter_18pt-SemiBold.ttf', typeface: INTER, variant: 'bold' },
  { ttf: 'Syne-Regular.ttf',        typeface: SYNE,  variant: 'regular' },
  { ttf: 'Syne-Bold.ttf',           typeface: SYNE,  variant: 'bold' },
];

const zip  = await JSZip.loadAsync(readFileSync(OUT));

// Read and update presentation.xml + rels
let presXml = await zip.file('ppt/presentation.xml').async('string');
let relsXml = await zip.file('ppt/_rels/presentation.xml.rels').async('string');

// Find the highest existing rId
const existingIds = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map(m => parseInt(m[1], 10));
let nextId = (existingIds.length ? Math.max(...existingIds) : 0) + 1;

// Group by typeface
const byFace = {};
EMBED.forEach(f => {
  if (!byFace[f.typeface]) byFace[f.typeface] = {};
  byFace[f.typeface][f.variant] = f.ttf;
});

const newRels  = [];
const fontXmls = [];

for (const [typeface, variants] of Object.entries(byFace)) {
  const variantRids = {};

  for (const [variant, ttfFile] of Object.entries(variants)) {
    const ttfPath = resolve(FONTS, ttfFile);
    if (!existsSync(ttfPath)) { console.warn(`Skipping missing font: ${ttfFile}`); continue; }

    const guid     = randomUUID();
    const rId      = `rId${nextId++}`;
    const fileName = `${typeface.replace(/\s+/g, '-')}-${variant}.fntdata`;

    const obfuscated = obfuscateFont(readFileSync(ttfPath), guid);
    zip.file(`ppt/fonts/${fileName}`, obfuscated);

    newRels.push(
      `<Relationship Id="${rId}" ` +
      `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" ` +
      `Target="fonts/${fileName}"/>`,
    );
    variantRids[variant] = rId;
  }

  const parts = [
    variantRids.regular    ? `<p:regular r:id="${variantRids.regular}"/>` : '',
    variantRids.bold       ? `<p:bold r:id="${variantRids.bold}"/>` : '',
    variantRids.italic     ? `<p:i r:id="${variantRids.italic}"/>` : '',
    variantRids.boldItalic ? `<p:boldItalic r:id="${variantRids.boldItalic}"/>` : '',
  ].join('');

  fontXmls.push(
    `<p:embeddedFont><p:font typeface="${typeface}"/>${parts}</p:embeddedFont>`,
  );
}

// Inject into rels
relsXml = relsXml.replace('</Relationships>', newRels.join('\n') + '\n</Relationships>');
zip.file('ppt/_rels/presentation.xml.rels', relsXml);

// Inject embedded font list before </p:presentation>
// Must be wrapped in <p:embeddedFontLst>; bare <p:embeddedFont> elements are invalid here
presXml = presXml.replace(
  '</p:presentation>',
  `<p:embeddedFontLst>${fontXmls.join('')}</p:embeddedFontLst>\n</p:presentation>`,
);
zip.file('ppt/presentation.xml', presXml);

// Fix [Content_Types].xml:
//  1. Add .fntdata extension (required for embedded fonts)
//  2. Remove Override entries for parts pptxgenjs declares but never creates
//     (e.g. slideMaster2-8.xml when only slideMaster1.xml exists).
//     PowerPoint triggers repair when it finds declared parts with no backing file.
let contentTypesXml = await zip.file('[Content_Types].xml').async('string');

if (!contentTypesXml.includes('fntdata')) {
  contentTypesXml = contentTypesXml.replace(
    '</Types>',
    '<Default Extension="fntdata" ContentType="application/x-fontdata"/></Types>',
  );
}

contentTypesXml = contentTypesXml.replace(
  /<Override PartName="([^"]+)"[^>]*\/>/g,
  (match, partName) => {
    const zipPath = partName.replace(/^\//, '');
    return zip.files[zipPath] ? match : '';
  },
);

zip.file('[Content_Types].xml', contentTypesXml);

// Write final PPTX
const output = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
writeFileSync(OUT, output);
console.log(`Done → public/downloads/offon-deck-template.pptx`);
