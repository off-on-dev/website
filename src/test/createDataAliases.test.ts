import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const SCRIPT = path.resolve(__dirname, "../../scripts/create-data-aliases.mjs");

function runScript(cwd: string): ReturnType<typeof spawnSync> {
  return spawnSync("node", [SCRIPT], { cwd, encoding: "utf-8" });
}

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "data-alias-test-"));
}

describe("create-data-aliases.mjs", () => {
  it("exits 1 with a helpful error message when dist/client does not exist", () => {
    const dir = makeTempDir();
    try {
      const result = runScript(dir);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("dist/client");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("creates a sibling _.data alias with identical content for each *.data file", () => {
    const dir = makeTempDir();
    const client = path.join(dir, "dist", "client");
    fs.mkdirSync(client, { recursive: true });
    fs.writeFileSync(path.join(client, "foo.data"), "payload-a");
    fs.writeFileSync(path.join(client, "bar.data"), "payload-b");

    try {
      const result = runScript(dir);
      expect(result.status).toBe(0);

      const fooAlias = path.join(client, "foo", "_.data");
      const barAlias = path.join(client, "bar", "_.data");
      expect(fs.existsSync(fooAlias)).toBe(true);
      expect(fs.readFileSync(fooAlias, "utf-8")).toBe("payload-a");
      expect(fs.existsSync(barAlias)).toBe(true);
      expect(fs.readFileSync(barAlias, "utf-8")).toBe("payload-b");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("is idempotent — running twice does not create _/_.data chains", () => {
    const dir = makeTempDir();
    const client = path.join(dir, "dist", "client");
    fs.mkdirSync(client, { recursive: true });
    fs.writeFileSync(path.join(client, "foo.data"), "payload");

    try {
      runScript(dir);
      const second = runScript(dir);
      expect(second.status).toBe(0);

      expect(fs.existsSync(path.join(client, "foo", "_.data"))).toBe(true);
      // A chain would mean the _.data itself was treated as a *.data source.
      expect(fs.existsSync(path.join(client, "foo", "_", "_.data"))).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});
