// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { canonicalUrl, SITE_URL } from "@/lib/site";

describe("canonicalUrl", () => {
  it("appends a trailing slash to a path that lacks one", () => {
    expect(canonicalUrl("/about")).toBe(`${SITE_URL}/about/`);
  });

  it("does not double the trailing slash when one is already present", () => {
    expect(canonicalUrl("/about/")).toBe(`${SITE_URL}/about/`);
  });

  it("handles the root path", () => {
    expect(canonicalUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("handles nested paths", () => {
    expect(canonicalUrl("/adventures/echoes-lost-in-orbit/levels/beginner")).toBe(
      `${SITE_URL}/adventures/echoes-lost-in-orbit/levels/beginner/`
    );
  });

  it("returns a string that starts with SITE_URL", () => {
    expect(canonicalUrl("/sponsors/")).toMatch(/^https:\/\/offon\.dev/);
  });
});
