import { describe, it, expect } from "vitest";
import { formatDeadline, isDeadlinePast, escapeHtmlAttr } from "@/lib/utils";

// ---------------------------------------------------------------------------
// formatDeadline
// ---------------------------------------------------------------------------
describe("formatDeadline", () => {
  describe("known timezone offsets", () => {
    it("formats a +01:00 offset as CET", () => {
      expect(formatDeadline("2024-06-05T14:30:00+01:00")).toBe(
        "5 June 2024 at 14:30 CET"
      );
    });

    it("formats a +02:00 offset as CEST", () => {
      expect(formatDeadline("2024-08-15T09:00:00+02:00")).toBe(
        "15 August 2024 at 09:00 CEST"
      );
    });

    it("formats a Z offset as UTC", () => {
      expect(formatDeadline("2024-01-01T00:00:00Z")).toBe(
        "1 January 2024 at 00:00 UTC"
      );
    });
  });

  describe("unknown timezone offsets", () => {
    it("formats an unrecognized positive offset as UTC+HH:MM", () => {
      expect(formatDeadline("2024-12-31T23:59:00+05:30")).toBe(
        "31 December 2024 at 23:59 UTC+05:30"
      );
    });

    it("formats a negative offset as UTC-HH:MM", () => {
      expect(formatDeadline("2024-07-04T12:00:00-05:00")).toBe(
        "4 July 2024 at 12:00 UTC-05:00"
      );
    });
  });

  describe("day formatting", () => {
    it("does not pad single-digit days with a leading zero", () => {
      const result = formatDeadline("2024-03-01T00:00:00Z");
      expect(result.startsWith("1 March")).toBe(true);
    });

    it("displays two-digit days correctly", () => {
      const result = formatDeadline("2024-12-25T12:00:00Z");
      expect(result.startsWith("25 December")).toBe(true);
    });
  });

  describe("all twelve months", () => {
    const cases: [string, string][] = [
      ["2024-01-01T00:00:00Z", "January"],
      ["2024-02-01T00:00:00Z", "February"],
      ["2024-03-01T00:00:00Z", "March"],
      ["2024-04-01T00:00:00Z", "April"],
      ["2024-05-01T00:00:00Z", "May"],
      ["2024-06-01T00:00:00Z", "June"],
      ["2024-07-01T00:00:00Z", "July"],
      ["2024-08-01T00:00:00Z", "August"],
      ["2024-09-01T00:00:00Z", "September"],
      ["2024-10-01T00:00:00Z", "October"],
      ["2024-11-01T00:00:00Z", "November"],
      ["2024-12-01T00:00:00Z", "December"],
    ];

    for (const [iso, monthName] of cases) {
      it(`formats month ${monthName} correctly`, () => {
        expect(formatDeadline(iso)).toContain(monthName);
      });
    }
  });

  describe("fractional seconds", () => {
    it("formats ISO strings with fractional seconds", () => {
      expect(formatDeadline("2024-06-05T14:30:00.000Z")).toBe(
        "5 June 2024 at 14:30 UTC"
      );
    });
  });

  describe("non-matching input", () => {
    it("returns the input unchanged when it does not match ISO 8601", () => {
      expect(formatDeadline("not-a-date")).toBe("not-a-date");
    });

    it("returns an empty string unchanged", () => {
      expect(formatDeadline("")).toBe("");
    });

    it("returns the far-future sentinel date in human-readable form", () => {
      // parseDeadline produces this for unknown TZ abbreviations
      expect(formatDeadline("9999-12-31T23:59:59Z")).toBe(
        "31 December 9999 at 23:59 UTC"
      );
    });
  });
});

// ---------------------------------------------------------------------------
// isDeadlinePast
// ---------------------------------------------------------------------------
describe("isDeadlinePast", () => {
  it("returns false when deadline is undefined", () => {
    expect(isDeadlinePast(undefined)).toBe(false);
  });

  it("returns false when deadline is an empty string", () => {
    expect(isDeadlinePast("")).toBe(false);
  });

  it("returns true for a deadline clearly in the past", () => {
    expect(isDeadlinePast("2020-01-01T00:00:00Z")).toBe(true);
  });

  it("returns false for a deadline clearly in the future", () => {
    expect(isDeadlinePast("2099-12-31T23:59:59Z")).toBe(false);
  });

  it('returns false for "TODO" (not a valid date)', () => {
    expect(isDeadlinePast("TODO")).toBe(false);
  });

  it("returns false for the far-future sentinel produced by unknown timezones", () => {
    expect(isDeadlinePast("9999-12-31T23:59:59Z")).toBe(false);
  });

  it("returns false for a completely invalid date string", () => {
    expect(isDeadlinePast("not-a-date")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// escapeHtmlAttr
// ---------------------------------------------------------------------------
describe("escapeHtmlAttr", () => {
  it("escapes & to &amp;", () => {
    expect(escapeHtmlAttr("a & b")).toBe("a &amp; b");
  });

  it('escapes " to &quot;', () => {
    expect(escapeHtmlAttr('say "hi"')).toBe("say &quot;hi&quot;");
  });

  it("escapes < to &lt;", () => {
    expect(escapeHtmlAttr("<tag>")).toBe("&lt;tag&gt;");
  });

  it("escapes > to &gt;", () => {
    expect(escapeHtmlAttr(">")).toBe("&gt;");
  });

  it("escapes multiple special characters in a single string", () => {
    expect(escapeHtmlAttr('<a href="/x" class="y">link & anchor</a>')).toBe(
      "&lt;a href=&quot;/x&quot; class=&quot;y&quot;&gt;link &amp; anchor&lt;/a&gt;"
    );
  });

  it("returns the string unchanged when there is nothing to escape", () => {
    expect(escapeHtmlAttr("plain text")).toBe("plain text");
  });

  it("returns an empty string unchanged", () => {
    expect(escapeHtmlAttr("")).toBe("");
  });

  it("does NOT escape single quotes (only the four listed chars are escaped)", () => {
    expect(escapeHtmlAttr("it's")).toBe("it's");
  });

  it("handles a string that is already-escaped HTML (double-escapes &)", () => {
    // The function does a simple string replace, so &amp; becomes &amp;amp;
    expect(escapeHtmlAttr("&amp;")).toBe("&amp;amp;");
  });
});
