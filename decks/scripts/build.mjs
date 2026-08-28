/**
 * Build a Slidev deck and post-process the output:
 * - Inject noindex meta (Slidev's bare index.html hook didn't work in v52)
 * - Replace the default Slidev CDN favicon with the local OffOn SVG favicon
 * - Stamp the built index.html with the current git SHA for CI drift detection
 * Usage: node decks/scripts/build.mjs <deck-name>
 * Output: public/slides/<deck-name>/
 */
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DECKS = resolve(__dir, '..')
const ROOT  = resolve(DECKS, '..')

const deck = process.argv[2]
if (!deck) {
  console.error('Usage: node decks/scripts/build.mjs <deck-name>')
  process.exit(1)
}

const deckDir = resolve(DECKS, deck)
if (!existsSync(deckDir)) {
  console.error(`Deck not found: ${deckDir}`)
  process.exit(1)
}

const outDir    = resolve(ROOT, 'public/slides', deck)
const relOut    = `../../public/slides/${deck}`
const slidevBin = resolve(DECKS, 'node_modules/.bin/slidev')

const sha = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim()

console.log(`Building ${deck} @ ${sha.slice(0, 8)}...`)
execSync(`${slidevBin} build --base ./ --out ${relOut}`, {
  cwd: deckDir,
  stdio: 'inherit',
})

// Copy OffOn favicon into the output (Slidev's default points to an external CDN)
const faviconSrc = resolve(ROOT, 'public/brand/offon-favicon.svg')
const faviconDst = resolve(outDir, 'favicon.svg')
copyFileSync(faviconSrc, faviconDst)

// Copy brand/offon-favicon.svg so the theme's #deck-logo img resolves correctly.
// GlobalTop.vue references `${base}brand/offon-favicon.svg`; with --base ./
// that becomes ./brand/offon-favicon.svg relative to the served index.html.
const brandOutDir = resolve(outDir, 'brand')
mkdirSync(brandOutDir, { recursive: true })
copyFileSync(faviconSrc, resolve(brandOutDir, 'offon-favicon.svg'))

// Post-process the built index.html
const indexPath = resolve(outDir, 'index.html')
let html = readFileSync(indexPath, 'utf8')

// 1. Replace external CDN favicon with local copy
html = html.replace(
  /<link rel="icon" href="https?:\/\/[^"]*">/,
  '<link rel="icon" type="image/svg+xml" href="./favicon.svg">',
)

// 2. Inject noindex after <meta charset> (Slidev v52 bare index.html hook not reliable)
html = html.replace(
  /(<meta charset="utf-8">)/,
  '$1\n<meta name="robots" content="noindex, nofollow">',
)

// 3. Stamp with git SHA for CI drift detection
html = html.replace('</body>', `<!-- deck-built-from: ${sha} -->\n</body>`)

writeFileSync(indexPath, html)

console.log(`Done → public/slides/${deck}/`)
