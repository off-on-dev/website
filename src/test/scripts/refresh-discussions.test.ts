// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for the failure threshold in scripts/refresh-discussions.mjs.
 *
 * Before this gate, main() returned normally no matter what: every per-topic
 * failure was console.warn + continue. Discourse being down produced exit 0, the
 * untouched files still passed the workflow's structural validation, and the site
 * served stale data indefinitely. These tests fail if that behaviour returns.
 *
 * Non-vacuous checks:
 * - "fails when every attempted topic failed" fails if rule 1 is removed.
 * - "fails when 2 of 5 topics failed" fails if the tolerance is loosened back to
 *   a >50% rule, under which 2 of 5 passes silently.
 * - "passes with a warning on exactly one failure" fails in both directions: if
 *   tolerance drops to zero it errors instead, and if the warning is dropped a
 *   persistent single failure goes back to being absorbed silently every hour.
 * - The naming tests fail if the error stops listing which topic failed and why,
 *   which is the difference between "one bad URL" and "Discourse is down" for
 *   whoever opens the workflow failure.
 */

import { describe, it, expect } from "vitest";
import {
  evaluateRefreshOutcome,
  MAX_TOLERATED_FAILURES,
} from "../../../scripts/refresh-discussions.mjs";

const fail = (topicUrl: string, reason: string) => ({ topicUrl, reason });

describe("MAX_TOLERATED_FAILURES", () => {
  it("tolerates exactly one failure", () => {
    // Zero tolerance would let one deleted thread block every other topic's
    // update from being committed, which is likelier than the case it guards.
    expect(MAX_TOLERATED_FAILURES).toBe(1);
  });
});

describe("evaluateRefreshOutcome", () => {
  describe("healthy runs", () => {
    it("passes when every topic succeeded", () => {
      const result = evaluateRefreshOutcome({ attempted: 18, failures: [] });
      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
      expect(result.warning).toBeNull();
    });

    it("passes when nothing was attempted", () => {
      // No level has a discussion URL yet. An absence, not a failure.
      const result = evaluateRefreshOutcome({ attempted: 0, failures: [] });
      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
    });

    it("passes when all topics succeeded but no file content changed", () => {
      // The normal hourly outcome over static threads. Failing here would fire
      // most hours and train everyone to ignore the alarm.
      const result = evaluateRefreshOutcome({ attempted: 18, failures: [] });
      expect(result.ok).toBe(true);
      expect(result.warning).toBeNull();
    });
  });

  describe("rule 1: every attempted topic failed", () => {
    it("fails when the only attempted topic failed", () => {
      const result = evaluateRefreshOutcome({
        attempted: 1,
        failures: [fail("https://community.offon.dev/t/a/1", "HTTP 404")],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("All 1 attempted topic(s) failed");
    });

    it("fails when every one of many topics failed", () => {
      const failures = Array.from({ length: 18 }, (_, i) =>
        fail(`https://community.offon.dev/t/x/${i}`, "fetch failed"),
      );
      const result = evaluateRefreshOutcome({ attempted: 18, failures });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("All 18 attempted topic(s) failed");
    });

    it("names Discourse being unreachable as a likely cause", () => {
      const result = evaluateRefreshOutcome({
        attempted: 3,
        failures: [
          fail("https://community.offon.dev/t/a/1", "fetch failed"),
          fail("https://community.offon.dev/t/b/2", "fetch failed"),
          fail("https://community.offon.dev/t/c/3", "fetch failed"),
        ],
      });
      expect(result.error).toMatch(/unreachable|rate-limiting/);
    });
  });

  describe("rule 2: more failures than tolerated", () => {
    it("fails when 2 of 5 topics failed", () => {
      // The case a >50% rule would have passed silently during a degraded Discourse.
      const result = evaluateRefreshOutcome({
        attempted: 5,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 500"),
          fail("https://community.offon.dev/t/b/2", "HTTP 500"),
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("2 of 5 topics failed");
    });

    it("fails when 3 of 5 topics failed", () => {
      const result = evaluateRefreshOutcome({
        attempted: 5,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 500"),
          fail("https://community.offon.dev/t/b/2", "HTTP 500"),
          fail("https://community.offon.dev/t/c/3", "HTTP 500"),
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("3 of 5 topics failed");
    });

    it("fails on 2 failures even across many successful topics", () => {
      const result = evaluateRefreshOutcome({
        attempted: 18,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 429"),
          fail("https://community.offon.dev/t/b/2", "HTTP 429"),
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("2 of 18 topics failed");
    });

    it("states the tolerance in the error so the threshold is discoverable", () => {
      const result = evaluateRefreshOutcome({
        attempted: 10,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 500"),
          fail("https://community.offon.dev/t/b/2", "HTTP 500"),
        ],
      });
      expect(result.error).toContain(`at most ${MAX_TOLERATED_FAILURES}`);
    });
  });

  describe("tolerated single failure", () => {
    it("passes with a warning when exactly one of many topics failed", () => {
      const result = evaluateRefreshOutcome({
        attempted: 18,
        failures: [fail("https://community.offon.dev/t/deleted/99", "HTTP 404")],
      });
      expect(result.ok).toBe(true);
      expect(result.error).toBeNull();
      expect(result.warning).not.toBeNull();
    });

    it("names the failing topic in the warning", () => {
      // A persistent single failure must stay visible rather than being absorbed
      // silently every hour.
      const result = evaluateRefreshOutcome({
        attempted: 18,
        failures: [fail("https://community.offon.dev/t/deleted/99", "HTTP 404")],
      });
      expect(result.warning).toContain("https://community.offon.dev/t/deleted/99");
      expect(result.warning).toContain("HTTP 404");
    });

    it("says the run still succeeded, so the warning is not read as a failure", () => {
      const result = evaluateRefreshOutcome({
        attempted: 18,
        failures: [fail("https://community.offon.dev/t/deleted/99", "HTTP 404")],
      });
      expect(result.warning).toMatch(/within tolerance/i);
    });

    it("escalates to an error when a second topic fails in the same run", () => {
      const one = evaluateRefreshOutcome({
        attempted: 18,
        failures: [fail("https://community.offon.dev/t/a/1", "HTTP 404")],
      });
      const two = evaluateRefreshOutcome({
        attempted: 18,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 404"),
          fail("https://community.offon.dev/t/b/2", "HTTP 404"),
        ],
      });
      expect(one.ok).toBe(true);
      expect(two.ok).toBe(false);
    });
  });

  describe("diagnostics name every failed topic and its reason", () => {
    it("lists each failing URL and reason in the error", () => {
      const result = evaluateRefreshOutcome({
        attempted: 4,
        failures: [
          fail("https://community.offon.dev/t/alpha/1", "HTTP 404"),
          fail("https://community.offon.dev/t/beta/2", "malformed JSON in topic response"),
          fail("https://community.offon.dev/t/gamma/3", "fetch failed"),
        ],
      });
      expect(result.error).toContain("https://community.offon.dev/t/alpha/1: HTTP 404");
      expect(result.error).toContain(
        "https://community.offon.dev/t/beta/2: malformed JSON in topic response",
      );
      expect(result.error).toContain("https://community.offon.dev/t/gamma/3: fetch failed");
    });

    it("distinguishes one bad URL from Discourse being down by the reasons listed", () => {
      const oneBadUrl = evaluateRefreshOutcome({
        attempted: 5,
        failures: [
          fail("https://community.offon.dev/t/a/1", "HTTP 404"),
          fail("https://community.offon.dev/t/b/2", "HTTP 404"),
        ],
      });
      const discourseDown = evaluateRefreshOutcome({
        attempted: 5,
        failures: Array.from({ length: 5 }, (_, i) =>
          fail(`https://community.offon.dev/t/x/${i}`, "fetch failed"),
        ),
      });
      expect(oneBadUrl.error).toContain("HTTP 404");
      expect(discourseDown.error).toContain("fetch failed");
      expect(discourseDown.error).toContain("All 5 attempted");
    });

    it("reports a malformed local file with its path and reason", () => {
      const result = evaluateRefreshOutcome({
        attempted: 2,
        failures: [
          fail("src/data/adventures/x/beginner-posts.json", "malformed local JSON (Unexpected token)"),
          fail("src/data/adventures/y/expert-posts.json", "malformed local JSON (Unexpected token)"),
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("src/data/adventures/x/beginner-posts.json");
      expect(result.error).toContain("malformed local JSON");
    });
  });
});
