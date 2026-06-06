import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "src/components/ui/**", ".react-router/types/**"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", {
        allowConstantExport: true,
        allowExportNames: ["meta", "links", "loader", "clientLoader", "action", "clientAction", "headers", "handle", "shouldRevalidate"],
      }],
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Safari VoiceOver strips list semantics when list-style is removed (Tailwind list-none).
      // Explicit role="list" on <ul>/<ol> restores them. This is intentional throughout the codebase.
      "jsx-a11y/no-redundant-roles": "off",
      // tabIndex={0} on overflow-scrollable <pre> code blocks makes them keyboard-reachable,
      // which is required by WCAG 2.1 SC 2.1.1. This is intentional in ChallengeDetail.
      "jsx-a11y/no-noninteractive-tabindex": "off",
    },
  },
);
