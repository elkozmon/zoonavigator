const eslint = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const playwright = require("eslint-plugin-playwright");

const playwrightRecommended = playwright.configs["flat/recommended"];

module.exports = [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "playwright-report/",
      "test-results/",
      "*.js",
      "*.d.ts",
      ".vscode/",
      ".idea/",
      ".DS_Store",
      "Thumbs.db",
    ],
  },
  eslint.configs.recommended,
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["**/*.ts"],
    languageOptions: {
      ...playwrightRecommended.languageOptions,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...playwrightRecommended.languageOptions.globals,
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      ...playwrightRecommended.plugins,
    },
    rules: {
      ...playwrightRecommended.rules,

      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],

      "playwright/missing-playwright-await": "error",
      "playwright/no-conditional-in-test": "error",
      "playwright/no-nested-step": "error",
      "playwright/no-skipped-test": "warn",
      "playwright/no-focused-test": "error",
      "playwright/valid-expect": "error",
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "no-console": "off",
    },
  },
];
