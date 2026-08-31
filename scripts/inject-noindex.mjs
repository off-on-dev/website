#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024 OffOn contributors
// SPDX-License-Identifier: MIT

import { readFileSync, writeFileSync } from 'node:fs'

const [, , target] = process.argv
if (!target) {
  console.error('Usage: inject-noindex.mjs <path-to-index.html>')
  process.exit(1)
}

const html = readFileSync(target, 'utf8')
const tag = '<meta name="robots" content="noindex, nofollow">'

if (html.includes(tag)) {
  console.log('noindex already present, skipping.')
  process.exit(0)
}

const patched = html.replace('</head>', `  ${tag}\n</head>`)
writeFileSync(target, patched, 'utf8')
console.log(`Injected noindex into ${target}`)
