import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";

// offon.dev — Astro (static) + Vue islands. base is overridden for PR previews
// via VITE_BASE_PATH (/pr-preview/pr-N/).
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  site: "https://offon.dev",
  base,
  output: "static",
  // GitHub Pages normalizes to trailing slashes (also removes the need for any
  // RR-style `_.data` alias handling).
  trailingSlash: "always",
  // Native prefetch replaces the hand-injected speculationrules script.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  // Retired URLs → their successor. Astro emits static meta-refresh redirect
  // pages (GitHub Pages-compatible). Mirrors src/pages/redirects/*.
  redirects: {
    "/docs": "/handbook/",
    "/docs/community-guide": "/handbook/",
    "/community-guide": "/handbook/",
  },
  integrations: [vue({ appEntrypoint: "/src/pages/_app" })],
  markdown: {
    // Build-time dual-theme highlighting (retires the custom CodeBlock highlighter).
    // Field-level prose is sanitized separately in src/lib/markdown-pipeline.mjs.
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      // Mirrors THEME_CONTRAST_FIXES in src/lib/markdown-pipeline.mjs: both
      // GitHub themes use #6a737d for comments, which fails WCAG 1.4.3 against
      // our code-block surfaces in either mode.
      colorReplacements: {
        "github-dark": { "#6a737d": "#8b949e" },
        "github-light": { "#6a737d": "#57606a" },
      },
    },
  },
  vite: {
    plugins: [tailwindcss(), Icons({ compiler: "vue3" })],
  },
});
