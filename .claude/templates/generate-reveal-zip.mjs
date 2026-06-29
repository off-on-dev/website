/**
 * Bundles deck-template/index.html with all local assets into a self-contained zip.
 * Users download, unzip, rename the deck-template folder, and open index.html in any browser.
 *
 * Run: node .claude/templates/generate-reveal-zip.mjs
 *
 * Re-vendor note: public/reveal/ is a hand-vendored four-file subset of reveal.js@6.0.1.
 * The full dist/ tree is NOT copied. When updating Reveal, copy only these four files from
 * node_modules/reveal.js/dist/ to public/reveal/ — do not copy the whole directory, as
 * that would restore deleted themes and plugins along with their OFL and BSD attribution
 * obligations. The four required files are: reset.css, reveal.css, reveal.js,
 * plugin/notes.js.
 */

import JSZip from 'jszip';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '../..');
const PUB   = resolve(ROOT, 'public');
const OUT   = resolve(PUB, 'downloads/offon-reveal-template.zip');

const zip = new JSZip();
const dir = zip.folder('offon-reveal-template');

function add(zipPath, fsPath) {
  dir.file(zipPath, readFileSync(fsPath));
}

// Main template (in its own subfolder to match the /deck-template/ URL; paths inside use ../)
add('deck-template/index.html', resolve(PUB, 'deck-template/index.html'));

// Reveal.js library (only files the template actually uses)
add('reveal/reset.css',       resolve(PUB, 'reveal/reset.css'));
add('reveal/reveal.css',      resolve(PUB, 'reveal/reveal.css'));
add('reveal/reveal.js',       resolve(PUB, 'reveal/reveal.js'));
add('reveal/plugin/notes.js', resolve(PUB, 'reveal/plugin/notes.js'));

// Fonts
const FONTS = [
  'syne-latin-700-normal.woff2',
  'inter-latin-400-normal.woff2',
  'inter-latin-500-normal.woff2',
  'inter-latin-600-normal.woff2',
];
for (const f of FONTS) {
  add(`fonts/${f}`, resolve(PUB, `fonts/${f}`));
}

// Brand assets
add('brand/offon-favicon.svg',        resolve(PUB, 'brand/offon-favicon.svg'));
add('brand/offon-logo-dark-color.svg', resolve(PUB, 'brand/offon-logo-dark-color.svg'));

// Nyx mascot
add('nyx_peek.webp', resolve(PUB, 'nyx_peek.webp'));

// QR codes
add('qr/offon-dev.png',           resolve(PUB, 'qr/offon-dev.png'));
add('qr/community-offon-dev.png', resolve(PUB, 'qr/community-offon-dev.png'));

// Team photos
for (const f of readdirSync(resolve(PUB, 'team'))) {
  add(`team/${f}`, resolve(PUB, `team/${f}`));
}

const output = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
writeFileSync(OUT, output);
console.log('Done → public/downloads/offon-reveal-template.zip');
