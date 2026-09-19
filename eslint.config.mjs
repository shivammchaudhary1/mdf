import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/next-env.d.ts"],
  },

  ...tseslint.configs.recommended,

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      /**
       * Imports
       *
       * - Sort import statements consistently.
       * - Keep imports grouped in a predictable order.
       * - Sort named imports alphabetically.
       *
       * Most violations can be fixed automatically with:
       * npm run lint:fix
       */
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      /**
       * Keep imports at the top of the file.
       */
      "no-use-before-define": "off",

      /**
       * Existing TypeScript safety.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
