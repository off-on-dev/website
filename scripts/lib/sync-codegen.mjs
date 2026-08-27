// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Codegen helpers for sync-adventure.mjs.
 * Extracted so they can be unit-tested independently.
 */

/** Escape a string for safe use inside a double-quoted JS/TS string literal. */
export function escapeTsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Escape a string for safe use inside new RegExp(...). */
export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Insert or replace a GENERATED block in a source file string.
 *
 * - Both markers present  → replace the block in-place.
 * - Exactly one marker present → throws; names the missing marker and file.
 * - Neither marker present → find sectionAnchor + closingMarker and insert before closing.
 */
export function upsertRoutesBlock(src, blockStart, blockEnd, blockContent, closingMarker, sectionAnchor, filePath) {
  const bsi = src.indexOf(blockStart);
  const bei = src.indexOf(blockEnd);

  if (bsi !== -1 && bei !== -1) {
    return src.slice(0, bsi) + blockContent + src.slice(bei + blockEnd.length);
  }

  if (bsi !== -1) {
    throw new Error(
      `Closing marker "${blockEnd}" is missing from ${filePath} — the block is corrupt. Restore it before re-running sync.`
    );
  }
  if (bei !== -1) {
    throw new Error(
      `Opening marker "${blockStart}" is missing from ${filePath} — the block is corrupt. Restore it before re-running sync.`
    );
  }

  const anchorPos = src.indexOf(sectionAnchor);
  if (anchorPos === -1) {
    console.warn(`Warning: "${sectionAnchor}" not found in ${filePath} — routes not updated`);
    return src;
  }
  const closingPos = src.indexOf(closingMarker, anchorPos);
  if (closingPos === -1) {
    console.warn(`Warning: closing "${closingMarker}" not found in ${filePath} — routes not updated`);
    return src;
  }
  return src.slice(0, closingPos) + "\n" + blockContent + src.slice(closingPos);
}
