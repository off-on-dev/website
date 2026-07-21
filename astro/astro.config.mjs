import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// Migration scaffold (Phase 1). Nested app during migration; the final swap
// moves it to repo root. Reads the real app's assets/data via ../public and
// ../src/data while nested.
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  site: "https://offon.dev",
  base,
  output: "static",
  // GitHub Pages normalizes to trailing slashes; this replaces the RR `_.data`
  // alias hack (create-data-aliases.mjs) entirely.
  trailingSlash: "always",
  // Serve the real public/ (favicons, fonts, manifest, well-known, brand, etc.)
  // without duplication while the app is nested.
  publicDir: "../public",
  // Native prefetch replaces the hand-injected speculationrules script.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [vue({ appEntrypoint: "/src/pages/_app" }), icon()],
  markdown: {
    // Build-time dual-theme highlighting (retires the custom CodeBlock highlighter).
    // Field-level prose is sanitized separately in src/lib/md.ts.
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
