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
      // Explicit role="list" on <ul>/<ol> restores them. This is intentional throughout the codebase
      // (30+ instances), so a global off is more practical than per-site suppression comments.
      "jsx-a11y/no-redundant-roles": "off",
    },
  },
);
