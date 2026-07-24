import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "coverage/",
      // Static/vendored assets served as-is (reveal.js, decks, minified libs).
      "public/",
      // Presentation-template generators are standalone Node scripts.
      ".claude/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Vue SFC <script lang="ts"> is parsed by the TS parser.
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // The content pipeline / loaders use loosely-typed data; allow explicit any there.
      "@typescript-eslint/no-explicit-any": "off",
      // Purely stylistic Vue template formatting — handled by the editor, not lint.
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/first-attribute-linebreak": "off",
      // set:html/v-html render pre-sanitised, build-time author prose (see CLAUDE.md).
      "vue/no-v-html": "off",
    },
  },
);
