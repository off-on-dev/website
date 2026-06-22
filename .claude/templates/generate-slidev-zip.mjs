/**
 * Bundles the Slidev template source files into a zip for download.
 * Users unzip, run pnpm install, then pnpm dev to preview locally.
 *
 * Run: node .claude/templates/generate-slidev-zip.mjs
 */

import JSZip from 'jszip';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const __dir  = dirname(fileURLToPath(import.meta.url));
const SLIDEV = resolve(__dir, 'slidev');
const PUB    = resolve(__dir, '../..');
const OUT    = resolve(PUB, 'public/downloads/offon-slidev-template.zip');

const zip = new JSZip();
const dir = zip.folder('offon-slidev-template');

function add(zipPath, fsPath) {
  dir.file(zipPath, readFileSync(fsPath));
}

add('deck-template.md',                       resolve(SLIDEV, 'deck-template.md'));
add('package.json',                           resolve(SLIDEV, 'package.json'));
add('pnpm-lock.yaml',                         resolve(SLIDEV, 'pnpm-lock.yaml'));
add('public/brand/offon-logo-dark-color.svg', resolve(SLIDEV, 'public/brand/offon-logo-dark-color.svg'));

// QR codes (referenced by the final slide)
add('public/qr/offon-dev.png',           resolve(PUB, 'public/qr/offon-dev.png'));
add('public/qr/community-offon-dev.png', resolve(PUB, 'public/qr/community-offon-dev.png'));

// Nyx mascot (referenced by the asymmetric split slide)
add('public/nyx_peek.webp', resolve(PUB, 'public/nyx_peek.webp'));

// Team photos (referenced by the board members slide)
for (const f of readdirSync(resolve(PUB, 'public/team'))) {
  add(`public/team/${f}`, resolve(PUB, `public/team/${f}`));
}

// Local theme (follows slidev-theme-* convention)
add('offon/package.json',                     resolve(SLIDEV, 'offon/package.json'));
add('offon/style.css',                        resolve(SLIDEV, 'offon/style.css'));
add('offon/components/GlobalTop.vue',         resolve(SLIDEV, 'offon/components/GlobalTop.vue'));

const output = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
writeFileSync(OUT, output);
console.log('Done → public/downloads/offon-slidev-template.zip');
