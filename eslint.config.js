import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".opencode/**", ".crowepilot/**"],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "off",
    },
  },
]
