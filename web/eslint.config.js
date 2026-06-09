const angular = require("@angular-eslint/eslint-plugin");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: [
      ".angular/",
      "dist/",
      "node_modules/",
      "out-tsc/",
      "src/**/*.d.ts",
    ],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@angular-eslint": angular,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/directive-class-suffix": "error",

      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-inferrable-types": ["error", { ignoreParameters: true }],
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/unified-signatures": "error",

      "curly": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "max-len": ["error", { code: 140 }],
      "no-bitwise": "error",
      "no-console": ["error", { allow: ["log", "warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-new-wrappers": "error",
      "no-var": "error",
      "prefer-const": "error",
      "quotes": ["error", "double"],
      "radix": "error",
      "semi": ["error", "always"],
    },
  },
  {
    files: ["src/**/*.spec.ts", "src/test.ts"],
    languageOptions: {
      globals: {
        ...globals.jasmine,
      },
    },
  },
];
