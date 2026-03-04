import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nxEslintPlugin from "@nx/eslint-plugin";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettier from "eslint-plugin-prettier";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ["**/dist", "**/out-tsc"],
  },
  js.configs.recommended,
  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ),
  {
    plugins: {
      "@nx": nxEslintPlugin,
      "@typescript-eslint": typescriptEslintEslintPlugin,
      prettier: eslintPluginPrettier,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "no-console": ["error"],
      "prettier/prettier": ["warn"],
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
  ...compat
    .config({
      extends: ["plugin:@nx/typescript"],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts"],
      rules: {
        ...config.rules,
      },
    })),
  ...compat
    .config({
      extends: ["plugin:@nx/javascript"],
    })
    .map((config) => ({
      ...config,
      files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
      rules: {
        ...config.rules,
      },
    })),
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.js", "**/*.test.jsx"],
      rules: {
        ...config.rules,
      },
    })),
];
