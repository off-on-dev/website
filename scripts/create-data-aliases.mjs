/**
 * After the React Router build, each prerendered route with a loader produces
 * a `<path>.data` file for non-trailing-slash single-fetch requests. GitHub
 * Pages normalises every URL to have a trailing slash, so client-side
 * navigation from a GitHub Pages URL triggers `<path>/_.data` instead.
 *
 * This script copies every `*.data` file to `<name>/_.data` so both formats
 * resolve correctly without changing any Link `to` props.
 */
import { readdir, cp, mkdir } from "fs/promises";
import { join, dirname, basename } from "path";

async function collectDataFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectDataFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".data")) {
      files.push(full);
    }
  }
  return files;
}

const buildDir = "dist/client";
const dataFiles = await collectDataFiles(buildDir);

await Promise.all(
  dataFiles.map(async (file) => {
    const aliasDir = join(dirname(file), basename(file, ".data"));
    const alias = join(aliasDir, "_.data");
    await mkdir(aliasDir, { recursive: true });
    await cp(file, alias);
  })
);

console.log(`Created ${dataFiles.length} _.data alias${dataFiles.length === 1 ? "" : "es"}`);
