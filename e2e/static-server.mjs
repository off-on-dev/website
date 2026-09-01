// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT
//
// Foreground static file server for Playwright's webServer.
//
// Mirrors the GitHub Pages serving behaviour the tests rely on:
//   - trailing-slash paths resolve to index.html (e.g. /about/ → dist/about/index.html)
//   - a bare .html file is tried next for paths with no index.html (e.g. /404/ → dist/404.html, 200)
//   - unknown paths fall back to dist/404.html with a 404 status
//
// If deploy-side routing ever changes (e.g. GitHub Pages config, a CDN rewrite,
// a custom 404 page at a different path), this server must be updated to match
// so the tests continue to reflect real production behaviour.
//
// Used instead of `astro preview` because Astro 7's preview command always
// daemonises (the parent exits 0 immediately). Playwright kills its webServer
// process to signal end-of-suite; a daemonised parent cannot receive that
// signal, so the daemon outlives the suite. Worse, if the daemon stops
// producing log output mid-suite, the keep-alive process (formerly
// `astro preview logs --follow`) exits, Playwright interprets that as the
// server dying, and abandons all queued tests without recording failures.
// A plain blocking HTTP server avoids all of this.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const PORT = 4321;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".xsl": "application/xslt+xml",
  ".txt": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

async function tryFile(filePath) {
  try {
    const content = await readFile(filePath);
    return { content, type: MIME[extname(filePath)] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const urlPath = new URL(req.url ?? "/", `http://localhost:${PORT}`).pathname;

  // Reject path traversal attempts
  const base = resolve(join(DIST, urlPath));
  if (!base.startsWith(DIST)) {
    res.writeHead(403);
    res.end();
    return;
  }

  let result = null;

  if (urlPath.endsWith("/")) {
    // Trailing-slash path → index.html, then the bare .html file.
    // GitHub Pages (and astro preview) serve dist/foo.html at /foo/ with 200
    // when no dist/foo/index.html exists (e.g. the /404/ page).
    const stem = urlPath.slice(0, -1); // "/404/" → "/404"
    result =
      (await tryFile(join(DIST, urlPath, "index.html"))) ??
      (stem ? await tryFile(join(DIST, stem + ".html")) : null);
  } else {
    // Try exact path, then .html extension, then directory index
    result =
      (await tryFile(join(DIST, urlPath))) ??
      (await tryFile(join(DIST, urlPath + ".html"))) ??
      (await tryFile(join(DIST, urlPath, "index.html")));
  }

  if (result) {
    res.writeHead(200, { "Content-Type": result.type });
    res.end(result.content);
    return;
  }

  // 404 fallback — mirrors GitHub Pages: serve dist/404.html with a 404 status
  const notFound = await tryFile(join(DIST, "404.html"));
  if (notFound) {
    res.writeHead(404, { "Content-Type": notFound.type });
    res.end(notFound.content);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found\n");
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Static server → http://localhost:${PORT}\n`);
});
