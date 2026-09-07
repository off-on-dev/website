/**
 * Bundles the pre-built Slidev template from public/decks/template/ into a
 * self-contained zip. Users download, unzip, and open index.html locally.
 *
 * The zip uses relative paths so it works unpacked anywhere.
 *
 * Run: node .ai/templates/generate-slidev-zip.mjs
 *
 * Requires jszip (devDependency). The Slidev output must already be built:
 *   cd decks/template && pnpm build
 */

import JSZip from 'jszip'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '../..')
const SRC = resolve(ROOT, 'public/decks/template')
const OUT = resolve(ROOT, 'public/downloads/offon-slidev-template.zip')

function addDir(zip, fsDir) {
  for (const entry of readdirSync(fsDir)) {
    const fsPath = resolve(fsDir, entry)
    const zipPath = relative(SRC, fsPath)
    if (statSync(fsPath).isDirectory()) {
      addDir(zip, fsPath)
    } else {
      zip.file(zipPath, readFileSync(fsPath))
    }
  }
}

const zip = new JSZip()
const dir = zip.folder('offon-slidev-template')
addDir(dir, SRC)

const output = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
})
writeFileSync(OUT, output)
console.log('Done → public/downloads/offon-slidev-template.zip')
