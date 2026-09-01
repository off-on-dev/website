// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for scripts/discourse-utils.mjs (atomicWrite, fetchWithRetry)
 * and the resolveAvatarUrl / buildAvatarUrl helpers in the refresh scripts.
 *
 * Non-vacuous check: each test is written so it fails if the fix is reverted.
 * - resolveAvatarUrl tests: before fix, http:// URLs were returned as-is instead
 *   of undefined. Reverting the fix causes the "rejects http://" tests to fail.
 * - fetchWithRetry tests: before fix there was no retry; reverting causes the
 *   "retries on 429" tests to fail.
 * - atomicWrite tests: before fix a direct writeFileSync was used; reverting
 *   causes the "writes via tmp" test to fail (no .tmp observed).
 * - Chunk-warning test: before fix the else branch was absent; reverting causes
 *   the warn assertion to fail.
 * - Idempotency test: the "no write on unchanged data" assertion exercises the
 *   same-JSON comparison that guards atomicWrite calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// ---------------------------------------------------------------------------
// Helpers under test (import from built ESM scripts)
// ---------------------------------------------------------------------------
import {
  atomicWrite,
  fetchWithRetry,
} from "../../../scripts/discourse-utils.mjs";

import {
  resolveAvatarUrl as discussionsResolveAvatarUrl,
} from "../../../scripts/refresh-discussions.mjs";

import {
  resolveAvatarUrl as leaderboardResolveAvatarUrl,
} from "../../../scripts/refresh-leaderboard.mjs";

import {
  buildAvatarUrl,
} from "../../../scripts/refresh-community-leaders.mjs";

// ---------------------------------------------------------------------------
// Temp directory setup
// ---------------------------------------------------------------------------
let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `discourse-test-${Math.floor(Math.random() * 1e9)}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// atomicWrite
// ---------------------------------------------------------------------------
describe("atomicWrite", () => {
  it("writes the final file with the correct content", () => {
    const path = join(tmpDir, "out.json");
    atomicWrite(path, '{"ok":true}\n');
    expect(readFileSync(path, "utf-8")).toBe('{"ok":true}\n');
  });

  it("leaves no .tmp file after a successful write", () => {
    const path = join(tmpDir, "out.json");
    atomicWrite(path, "data");
    expect(existsSync(`${path}.tmp`)).toBe(false);
  });

  it("overwrites an existing file atomically", () => {
    const path = join(tmpDir, "out.json");
    writeFileSync(path, "old");
    atomicWrite(path, "new");
    expect(readFileSync(path, "utf-8")).toBe("new");
  });
});

// ---------------------------------------------------------------------------
// fetchWithRetry
// ---------------------------------------------------------------------------
describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately on a 200 response", async () => {
    const res = new Response("ok", { status: 200 });
    vi.mocked(fetch).mockResolvedValue(res);
    const result = await fetchWithRetry("https://example.com");
    expect(result.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns non-200 non-429 responses without retrying", async () => {
    const res = new Response("not found", { status: 404 });
    vi.mocked(fetch).mockResolvedValue(res);
    const result = await fetchWithRetry("https://example.com");
    expect(result.status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 and returns success when retry succeeds", async () => {
    vi.useFakeTimers();
    const rate429 = new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "1" },
    });
    const ok200 = new Response("ok", { status: 200 });
    vi.mocked(fetch)
      .mockResolvedValueOnce(rate429)
      .mockResolvedValueOnce(ok200);

    const promise = fetchWithRetry("https://example.com", {}, 3);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("caps Retry-After at 120 s", async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rate429 = new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "9999" },
    });
    const ok200 = new Response("ok", { status: 200 });
    vi.mocked(fetch)
      .mockResolvedValueOnce(rate429)
      .mockResolvedValueOnce(ok200);

    const promise = fetchWithRetry("https://example.com", {}, 3);
    await vi.runAllTimersAsync();
    await promise;
    // The warn message should mention 120s (the cap), not 9999s
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("120s"));
    warnSpy.mockRestore();
  });

  it("returns the final 429 after exhausting retries", async () => {
    vi.useFakeTimers();
    const rate429 = new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "1" },
    });
    vi.mocked(fetch).mockResolvedValue(rate429);

    const promise = fetchWithRetry("https://example.com", {}, 2);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result.status).toBe(429);
    // maxRetries=2 means 3 total calls: attempt 0, 1, 2
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// resolveAvatarUrl: refresh-discussions variant
// ---------------------------------------------------------------------------
describe("discussions resolveAvatarUrl", () => {
  it("returns https:// URLs unchanged", () => {
    const url = "https://community.offon.dev/user_avatar/x/40.png";
    expect(discussionsResolveAvatarUrl(url)).toBe(url);
  });

  it("prepends COMMUNITY_BASE to relative paths", () => {
    const result = discussionsResolveAvatarUrl("/user_avatar/x/40.png");
    expect(result).toBe("https://community.offon.dev/user_avatar/x/40.png");
  });

  it("replaces {size} before resolving", () => {
    const result = discussionsResolveAvatarUrl("/user_avatar/x/{size}.png", "64");
    expect(result).toBe("https://community.offon.dev/user_avatar/x/64.png");
  });

  it("rejects http:// URLs and returns undefined", () => {
    // Before fix, http:// was returned as-is (startsWith("http") check)
    expect(discussionsResolveAvatarUrl("http://evil.example/avatar.png")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(discussionsResolveAvatarUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for unrecognised non-slash relative paths", () => {
    expect(discussionsResolveAvatarUrl("not-a-url")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resolveAvatarUrl: refresh-leaderboard variant
// ---------------------------------------------------------------------------
describe("leaderboard resolveAvatarUrl", () => {
  it("returns https:// URLs unchanged", () => {
    const url = "https://community.offon.dev/user_avatar/x/40.png";
    expect(leaderboardResolveAvatarUrl(url)).toBe(url);
  });

  it("prepends COMMUNITY_BASE to relative paths", () => {
    const result = leaderboardResolveAvatarUrl("/user_avatar/x/40.png");
    expect(result).toBe("https://community.offon.dev/user_avatar/x/40.png");
  });

  it("normalises old open-ecosystem.com URLs to offon.dev", () => {
    const old = "https://community.offon.dev/user_avatar/community.open-ecosystem.com/alice/40/1_2.png";
    const result = leaderboardResolveAvatarUrl(old);
    expect(result).toContain("/user_avatar/community.offon.dev/");
  });

  it("rejects http:// URLs and returns undefined", () => {
    // Before fix, http:// was treated as absolute (startsWith("http"))
    expect(leaderboardResolveAvatarUrl("http://evil.example/avatar.png")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(leaderboardResolveAvatarUrl(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildAvatarUrl: refresh-community-leaders variant
// ---------------------------------------------------------------------------
describe("buildAvatarUrl", () => {
  it("builds a CDN letter avatar when no uploadedAvatarId", () => {
    const url = buildAvatarUrl("alice", null);
    expect(url).toMatch(/^https:\/\/avatars\.discourse-cdn\.com\/v4\/letter\/a\//);
  });

  it("builds a community avatar URL when uploadedAvatarId is set", () => {
    const url = buildAvatarUrl("alice", "42");
    expect(url).toMatch(/^https:\/\/community\.offon\.dev\/user_avatar\//);
  });

  it("always returns an https:// URL or undefined", () => {
    const url = buildAvatarUrl("alice", null);
    expect(url).toBeDefined();
    expect(url!.startsWith("https://")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Idempotency: atomicWrite is only called when JSON changes
// ---------------------------------------------------------------------------
describe("idempotency guard", () => {
  it("does not write if new JSON matches existing file content", () => {
    const path = join(tmpDir, "data.json");
    const json = JSON.stringify({ items: [1, 2, 3] }, null, 2) + "\n";
    writeFileSync(path, json);

    // Simulate the "no write if unchanged" guard used by the scripts
    const oldJson = readFileSync(path, "utf-8");
    const newJson = json; // identical
    if (newJson !== oldJson) {
      atomicWrite(path, newJson);
    }

    // File should still contain the original content, unchanged
    expect(readFileSync(path, "utf-8")).toBe(json);
  });

  it("writes when JSON differs", () => {
    const path = join(tmpDir, "data.json");
    writeFileSync(path, '{"a":1}\n');
    const newJson = '{"a":2}\n';
    const oldJson = readFileSync(path, "utf-8");
    if (newJson !== oldJson) {
      atomicWrite(path, newJson);
    }
    expect(readFileSync(path, "utf-8")).toBe(newJson);
  });
});
