import { describe, it, expect, vi } from "vitest";
import { parseDeadline, UNRESOLVABLE_DEADLINE } from "@/lib/deadline.mjs";

describe("parseDeadline", () => {
  describe("null and undefined passthrough", () => {
    it("returns null for null input", () => {
      expect(parseDeadline(null)).toBeNull();
    });

    it("returns undefined for undefined input", () => {
      expect(parseDeadline(undefined)).toBeUndefined();
    });
  });

  describe("string passthrough cases", () => {
    it("passes through an ISO 8601 string with offset unchanged", () => {
      const iso = "2024-06-05T14:30:00+01:00";
      expect(parseDeadline(iso)).toBe(iso);
    });

    it("passes through an ISO 8601 string with Z offset unchanged", () => {
      const iso = "2024-01-01T00:00:00Z";
      expect(parseDeadline(iso)).toBe(iso);
    });

    it('passes through "TODO" unchanged', () => {
      expect(parseDeadline("TODO")).toBe("TODO");
    });
  });

  describe("natural language format to ISO conversion", () => {
    it("converts a CET deadline to ISO 8601 with +01:00 offset", () => {
      expect(parseDeadline("5 June 2024 at 14:30 CET")).toBe(
        "2024-06-05T14:30:00+01:00"
      );
    });

    it("converts a CEST deadline to ISO 8601 with +02:00 offset", () => {
      expect(parseDeadline("15 August 2024 at 09:00 CEST")).toBe(
        "2024-08-15T09:00:00+02:00"
      );
    });

    it("converts a UTC deadline to ISO 8601 with +00:00 offset", () => {
      expect(parseDeadline("1 January 2025 at 00:00 UTC")).toBe(
        "2025-01-01T00:00:00+00:00"
      );
    });

    it("converts a GMT deadline to ISO 8601 with +00:00 offset", () => {
      expect(parseDeadline("31 December 2024 at 23:59 GMT")).toBe(
        "2024-12-31T23:59:00+00:00"
      );
    });

    it("pads single-digit day to two digits", () => {
      expect(parseDeadline("1 March 2024 at 08:00 UTC")).toBe(
        "2024-03-01T08:00:00+00:00"
      );
    });

    it("handles a two-digit day without double-padding", () => {
      expect(parseDeadline("25 December 2024 at 12:00 UTC")).toBe(
        "2024-12-25T12:00:00+00:00"
      );
    });

    it("handles a weekday prefix before the date", () => {
      expect(parseDeadline("Monday, 5 June 2024 at 14:30 CET")).toBe(
        "2024-06-05T14:30:00+01:00"
      );
    });

    it("handles a full weekday name with trailing comma", () => {
      expect(parseDeadline("Wednesday, 1 January 2025 at 00:00 UTC")).toBe(
        "2025-01-01T00:00:00+00:00"
      );
    });

    it("converts all twelve months correctly", () => {
      const cases: [string, string][] = [
        ["1 January 2024 at 00:00 UTC", "2024-01-01T00:00:00+00:00"],
        ["1 February 2024 at 00:00 UTC", "2024-02-01T00:00:00+00:00"],
        ["1 March 2024 at 00:00 UTC", "2024-03-01T00:00:00+00:00"],
        ["1 April 2024 at 00:00 UTC", "2024-04-01T00:00:00+00:00"],
        ["1 May 2024 at 00:00 UTC", "2024-05-01T00:00:00+00:00"],
        ["1 June 2024 at 00:00 UTC", "2024-06-01T00:00:00+00:00"],
        ["1 July 2024 at 00:00 UTC", "2024-07-01T00:00:00+00:00"],
        ["1 August 2024 at 00:00 UTC", "2024-08-01T00:00:00+00:00"],
        ["1 September 2024 at 00:00 UTC", "2024-09-01T00:00:00+00:00"],
        ["1 October 2024 at 00:00 UTC", "2024-10-01T00:00:00+00:00"],
        ["1 November 2024 at 00:00 UTC", "2024-11-01T00:00:00+00:00"],
        ["1 December 2024 at 00:00 UTC", "2024-12-01T00:00:00+00:00"],
      ];
      for (const [input, expected] of cases) {
        expect(parseDeadline(input)).toBe(expected);
      }
    });
  });

  describe("unrecognized timezone abbreviation", () => {
    it("returns the far-future sentinel date for an unrecognized timezone", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = parseDeadline("5 June 2024 at 14:30 BST");
      expect(result).toBe("9999-12-31T23:59:59Z");
      errorSpy.mockRestore();
    });

    it("calls console.error containing the unknown abbreviation", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      parseDeadline("5 June 2024 at 14:30 BST");
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain("BST");
      errorSpy.mockRestore();
    });

    it("calls console.error for EST (not in TZ_OFFSETS)", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      parseDeadline("5 June 2024 at 14:30 EST");
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(errorSpy.mock.calls[0][0]).toContain("EST");
      errorSpy.mockRestore();
    });

    it("exports the sentinel it returns, so callers can compare against it", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(parseDeadline("5 June 2024 at 14:30 BST")).toBe(UNRESOLVABLE_DEADLINE);
      errorSpy.mockRestore();
    });

    it("gates rather than guesses: the sentinel is far enough out to never be past", () => {
      expect(new Date(UNRESOLVABLE_DEADLINE).getTime()).toBeGreaterThan(Date.now());
    });

    // The sync script writes its result back into adventure.yaml. Replacing an
    // author's human-readable deadline with the sentinel would destroy the source
    // text, so that path opts out. Rendering keeps the strict default, so an
    // unparseable deadline still gates whatever depends on it.
    describe('onUnknownTimezone: "preserve"', () => {
      const PRESERVE = { onUnknownTimezone: "preserve" } as const;

      it("returns the original string instead of the sentinel", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const raw = "5 June 2024 at 14:30 BST";
        expect(parseDeadline(raw, PRESERVE)).toBe(raw);
        warnSpy.mockRestore();
      });

      it("warns instead of erroring, naming the abbreviation", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        parseDeadline("5 June 2024 at 14:30 BST", PRESERVE);
        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0][0]).toContain("BST");
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      });

      it("still converts a recognised timezone normally", () => {
        expect(parseDeadline("5 June 2024 at 14:30 CET", PRESERVE)).toBe("2024-06-05T14:30:00+01:00");
      });

      it("a preserved value still hits the sentinel when parsed with the default", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const preserved = parseDeadline("5 June 2024 at 14:30 BST", PRESERVE);
        expect(parseDeadline(preserved)).toBe(UNRESOLVABLE_DEADLINE);
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      });
    });
  });

  describe("unrecognized format and unknown month", () => {
    it("returns the value unchanged and calls console.warn for an unrecognized format", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const raw = "sometime next year";
      expect(parseDeadline(raw)).toBe(raw);
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it("returns the value unchanged and calls console.warn for an unknown month name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const raw = "5 Octember 2024 at 14:30 CET";
      expect(parseDeadline(raw)).toBe(raw);
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it("returns the value unchanged for a date missing the 'at' keyword", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const raw = "5 June 2024 14:30 CET";
      expect(parseDeadline(raw)).toBe(raw);
      warnSpy.mockRestore();
    });
  });

  describe("non-string input", () => {
    it("throws an error describing the type for a number", () => {
       
      expect(() => parseDeadline(42 as any)).toThrow("[deadline]");
    });

    it("throws an error for an object", () => {
       
      expect(() => parseDeadline({} as any)).toThrow("[deadline]");
    });

    it("throws an error for a boolean", () => {
       
      expect(() => parseDeadline(true as any)).toThrow("[deadline]");
    });
  });
});
