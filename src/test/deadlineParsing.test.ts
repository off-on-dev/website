import { describe, expect, it } from "vitest";
import { parseDeadline } from "../../scripts/lib/deadline.mjs";

describe("parseDeadline", () => {
  it("converts the full human-readable format with weekday prefix", () => {
    expect(parseDeadline("Tuesday, 23 June 2026 at 23:59 CET")).toBe("2026-06-23T23:59:00+01:00");
  });

  it("converts the human-readable format without weekday prefix", () => {
    expect(parseDeadline("23 June 2026 at 23:59 CET")).toBe("2026-06-23T23:59:00+01:00");
  });

  it("converts CEST timezone to +02:00", () => {
    expect(parseDeadline("10 August 2026 at 09:00 CEST")).toBe("2026-08-10T09:00:00+02:00");
  });

  it("pads single-digit day to two digits", () => {
    expect(parseDeadline("1 March 2026 at 00:00 UTC")).toBe("2026-03-01T00:00:00+00:00");
  });

  it("passes through an already-ISO-8601 string unchanged", () => {
    expect(parseDeadline("2026-06-23T23:59:00+01:00")).toBe("2026-06-23T23:59:00+01:00");
  });

  it("passes through the TODO placeholder unchanged", () => {
    expect(parseDeadline("TODO")).toBe("TODO");
  });

  it("passes through null and undefined unchanged", () => {
    expect(parseDeadline(null)).toBeNull();
    expect(parseDeadline(undefined)).toBeUndefined();
  });

  it("passes through an unrecognised format unchanged", () => {
    expect(parseDeadline("sometime next year")).toBe("sometime next year");
  });

  it("passes through an unrecognised timezone unchanged", () => {
    expect(parseDeadline("23 June 2026 at 23:59 PST")).toBe("23 June 2026 at 23:59 PST");
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(parseDeadline("  23 June 2026 at 23:59 CET  ")).toBe("2026-06-23T23:59:00+01:00");
  });

  it("rejects strings with trailing junk after the timezone", () => {
    expect(parseDeadline("23 June 2026 at 23:59 CET extra")).toBe("23 June 2026 at 23:59 CET extra");
  });

  it("rejects strings with leading junk before the date", () => {
    expect(parseDeadline("deadline: 23 June 2026 at 23:59 CET")).toBe("deadline: 23 June 2026 at 23:59 CET");
  });

  it("throws when passed a non-string (e.g. a Date from a YAML 1.1 parser)", () => {
    expect(() => parseDeadline(new Date("2026-06-23T23:59:00+01:00"))).toThrow(
      /Expected a string but got object/
    );
  });
});
