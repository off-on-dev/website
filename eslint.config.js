import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import pluginVue from "eslint-plugin-vue";
import vueA11y from "eslint-plugin-vuejs-accessibility";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "coverage/",
      // Playwright creates this directory only after an e2e run; it is gitignored
      // but ESLint's tree walk happens before ignores are applied, so it must be
      // listed here to prevent an ENOENT crash on fresh checkouts.
      "test-results/",
      // Static/vendored assets served as-is (reveal.js, decks, minified libs).
      "public/",
      // Presentation-template generators are standalone Node scripts.
      ".claude/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  ...vueA11y.configs["flat/recommended"],
  ...astro.configs.recommended,
  // Static accessibility rules for .astro templates. Astro maps the jsx-a11y
  // ruleset onto its own template syntax; without this nothing checks markup in
  // .astro files, which is most of the site.
  ...astro.configs["flat/jsx-a11y-recommended"],
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

      // Safari VoiceOver strips list semantics when list-style is removed, which
      // Tailwind's reset does everywhere. Explicit role="list" on <ul>/<ol>
      // restores them and is intentional throughout. Allow that one redundant
      // role and keep the rule on, so role="button" on a <button> is still caught.
      "astro/jsx-a11y/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],

      // <abbr> is a tooltip trigger here: it must be focusable or the expansion
      // is mouse-only (WCAG 2.1.1). Allow tabindex on abbr specifically; every
      // other non-interactive element stays flagged.
      //
      // <pre> is the other case: a horizontally scrollable code block is not
      // keyboard-scrollable unless it is focusable (WCAG 2.1.1).
      "astro/jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: ["abbr", "pre"], roles: ["tabpanel"], allowExpressionValues: true },
      ],

      // Same Safari list-semantics reasoning as the Astro rule above.
      "vuejs-accessibility/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
    },
  },
);
