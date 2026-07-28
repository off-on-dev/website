import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.test.{ts,mts,js,mjs}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/stores/**", "src/components/**"],
      exclude: ["src/lib/community-data.ts", "src/lib/solutions.ts"],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
