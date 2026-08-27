// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Shiki failures must be loud.
//
// Every Shiki error used to be caught and turned into `return null`, which the
// caller renders as a plain <pre><code>. So a broken highlighter setup did not
// fail anything: the build stayed green, the tests stayed green, and syntax
// highlighting just quietly vanished from the whole site. That happened for real
// while fixing the comment-contrast colours.
//
// The only failure allowed to stay quiet is an unknown language, which is a
// content question rather than a setup bug.
//
// Each case reloads the module so the lazy highlighter singleton and the
// per-module abbr scope start clean.

import { describe, it, expect, vi, afterEach } from "vitest";

const CODE_BLOCK = "```js\nconst a = 1;\n```";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("shiki");
});

async function loadPipeline(): Promise<typeof import("@/lib/markdown-pipeline.mjs")> {
  const mod = await import("@/lib/markdown-pipeline.mjs");
  mod.beginAbbrScope();
  return mod;
}

describe("Shiki failures are fatal, not silent", () => {
  it("throws when the highlighter cannot be created", async () => {
    vi.resetModules();
    vi.doMock("shiki", async (importOriginal) => {
      const actual = await importOriginal<typeof import("shiki")>();
      return {
        ...actual,
        createHighlighter: vi.fn(async () => {
          throw new Error("boom: bad theme option");
        }),
      };
    });

    const { mdToBlock } = await loadPipeline();
    await expect(mdToBlock(CODE_BLOCK)).rejects.toThrow(/Shiki initialisation failed/);
  });

  it("surfaces the original cause so the real error is not lost", async () => {
    vi.resetModules();
    vi.doMock("shiki", async (importOriginal) => {
      const actual = await importOriginal<typeof import("shiki")>();
      return {
        ...actual,
        createHighlighter: vi.fn(async () => {
          throw new Error("boom: bad theme option");
        }),
      };
    });

    const { mdToBlock } = await loadPipeline();
    await expect(mdToBlock(CODE_BLOCK)).rejects.toThrow(/boom: bad theme option/);
  });

  it("throws when rendering fails, rather than emitting unhighlighted code", async () => {
    // The exact shape of the real incident: createHighlighter succeeds but
    // codeToHtml rejects the options, so every block fell back to plain text.
    vi.resetModules();
    vi.doMock("shiki", async (importOriginal) => {
      const actual = await importOriginal<typeof import("shiki")>();
      return {
        ...actual,
        createHighlighter: vi.fn(async () => ({
          loadLanguage: vi.fn(async () => {}),
          codeToHtml: vi.fn(() => {
            throw new Error("boom: theme not registered");
          }),
        })),
      };
    });

    const { mdToBlock } = await loadPipeline();
    await expect(mdToBlock(CODE_BLOCK)).rejects.toThrow(/Shiki rendering failed for language "js"/);
  });

  it("throws when a bundled grammar fails to load", async () => {
    vi.resetModules();
    vi.doMock("shiki", async (importOriginal) => {
      const actual = await importOriginal<typeof import("shiki")>();
      return {
        ...actual,
        createHighlighter: vi.fn(async () => ({
          loadLanguage: vi.fn(async () => {
            throw new Error("boom: grammar missing");
          }),
          codeToHtml: vi.fn(() => "<pre><code></code></pre>"),
        })),
      };
    });

    const { mdToBlock } = await loadPipeline();
    await expect(mdToBlock(CODE_BLOCK)).rejects.toThrow(/Shiki grammar load failed for language "js"/);
  });

  it("throws if Shiki's output shape changes and no <code> can be extracted", async () => {
    vi.resetModules();
    vi.doMock("shiki", async (importOriginal) => {
      const actual = await importOriginal<typeof import("shiki")>();
      return {
        ...actual,
        createHighlighter: vi.fn(async () => ({
          loadLanguage: vi.fn(async () => {}),
          codeToHtml: vi.fn(() => "<div>no code element here</div>"),
        })),
      };
    });

    const { mdToBlock } = await loadPipeline();
    await expect(mdToBlock(CODE_BLOCK)).rejects.toThrow(/Shiki output parsing failed/);
  });
});

describe("the one quiet fallback", () => {
  it("renders an unknown language as plain code without throwing", async () => {
    vi.resetModules();
    const { mdToBlock } = await loadPipeline();
    const html = await mdToBlock("```not-a-real-language\nhello\n```");
    expect(html).toContain("<code");
    expect(html).toContain("hello");
  });

  it("still highlights normally when Shiki is healthy", async () => {
    vi.resetModules();
    const { mdToBlock } = await loadPipeline();
    const html = await mdToBlock(CODE_BLOCK);
    // Real highlighting emits per-token inline colours; plain output would not.
    expect(html).toMatch(/--shiki-dark:|color:#/);
  });
});
