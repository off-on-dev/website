/**
 * After the React Router build, each prerendered route with a loader produces
 * a `<path>.data` file for non-trailing-slash single-fetch requests. GitHub
 * Pages normalises every URL to have a trailing slash, so client-side
 * navigation from a GitHub Pages URL triggers `<path>/_.data` instead.
 *
 * This script copies every `*.data` file to `<name>/_.data` so both formats
 * resolve correctly without changing any Link `to` props.
 */
import { readdir, copyFile, mkdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

const buildDir = "dist/client";

let entries;
try {
  entries = await readdir(buildDir, { withFileTypes: true, recursive: true });
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(`create-data-aliases: '${buildDir}' not found — run 'npm run build' first`);
    process.exit(1);
  }
  throw err;
}

// Exclude _.data files so repeated runs don't create _/_.data chains.
const dataFiles = entries
  .filter((e) => e.isFile() && e.name.endsWith(".data") && e.name !== "_.data")
  .map((e) => join(e.parentPath, e.name));

await Promise.all(
  dataFiles.map(async (file) => {
    const aliasDir = join(dirname(file), basename(file, ".data"));
    const alias = join(aliasDir, "_.data");
    await mkdir(aliasDir, { recursive: true });
    await copyFile(file, alias);
  })
);

if (dataFiles.length === 0) {
  console.error("create-data-aliases: no *.data files found in dist/client — loaders may have been accidentally removed");
  process.exit(1);
}

console.log(`Created ${dataFiles.length} _.data alias${dataFiles.length === 1 ? "" : "es"}`);
