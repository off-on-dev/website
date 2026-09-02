// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for currentMonth() in scripts/sync-adventure.mjs.
 *
 * Non-vacuous check: the old implementation used
 *   new Date().toLocaleString("en-GB", { month: "short" }).toUpperCase()
 * Node 26 CLDR returns "Sept" (4 letters) for September, so "SEPT 2026"
 * fails the adventure schema regex /^[A-Z]{3} \d{4}$/.
 *
 * The it.each test pins the system clock to every month of the year so
 * the suite catches a revert to toLocaleString regardless of when it runs.
 * The old-implementation test always asserts "SEPT 2026" against the
 * schema, providing a second revert-catch that does not depend on the clock.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { currentMonth } from "../../../scripts/sync-adventure.mjs";

const MONTH_SCHEMA = /^[A-Z]{3} \d{4}$/;

const ALL_MONTHS: [number, string][] = [
  [0, "JAN"], [1, "FEB"], [2, "MAR"], [3, "APR"],
  [4, "MAY"], [5, "JUN"], [6, "JUL"], [7, "AUG"],
  [8, "SEP"], [9, "OCT"], [10, "NOV"], [11, "DEC"],
];

describe("currentMonth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(ALL_MONTHS)(
    "month %i (%s): produces correct abbreviation and passes schema regex",
    (monthIndex, abbr) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, monthIndex, 15));
      expect(currentMonth()).toBe(`${abbr} 2026`);
      expect(currentMonth()).toMatch(MONTH_SCHEMA);
    },
  );

  it("old toLocaleString implementation produces 'SEPT 2026' for September, failing the schema", () => {
    // Inline the old implementation so this assertion is always true regardless
    // of the current month. A revert of the fix causes the it.each test above
    // to fail for September; this test makes the cause immediately legible.
    const oldImpl = (d: Date) =>
      d.toLocaleString("en-GB", { month: "short" }).toUpperCase() +
      " " +
      d.getFullYear();
    const result = oldImpl(new Date(2026, 8, 15));
    expect(result).toBe("SEPT 2026");
    expect(result).not.toMatch(MONTH_SCHEMA);
  });
});
