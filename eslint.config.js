import jseslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      'coverage/**',
      '.turbo/**',
      '.cache/**',
      '.vite/**',
      '**/*.d.ts',
      '**/*.config.{js,ts,mjs,cjs}',
      '**/*.log',
      '.idea/**',
      '.vscode/**',
      '*.tsbuildinfo',
      'public/**',
      '.git/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.env*',
      '*.min.js',
      '*.min.css',
      'playwright-report/**',
      '.playwright/**',
      '.artifacts/**',
      '.serena/**',
      'changes/**',
      'playwright/**',
      'scripts/**',
      'test-results/**',
    ],
  },
  jseslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  promise.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      react,
      'simple-import-sort': pluginSimpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
      // FSD: Import sort groups
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports (CSS, polyfills, etc.)
            [String.raw`^\u0000`],
            // React and external packages
            ['^react', String.raw`^@?\w`],
            // Internal monorepo packages
            ['^(@|~)(/.*|$)'],
            // FSD Layers (top → bottom)
            ['^@/app', '^~/app'],
            ['^@/pages', '^~/pages'],
            ['^@/widgets', '^~/widgets'],
            ['^@/features', '^~/features'],
            ['^@/entities', '^~/entities'],
            ['^@/shared', '^~/shared'],
            // Parent imports
            [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],
            // Same folder imports
            [String.raw`^\./(?=.*/)(?!/?$)`, String.raw`^\.(?!/?$)`, String.raw`^\./?$`],
            // Style imports
            [String.raw`^.+\.s?css$`],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-unused-prop-types': 'warn',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      // TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
      // Code quality
      'prefer-destructuring': [
        'error',
        { array: true, object: true },
        { enforceForRenamedProperties: false },
      ],
      'no-mixed-operators': [
        'error',
        {
          groups: [
            ['+', '-', '*', '/', '%', '**'],
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: true,
        },
      ],
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'off',
      'no-param-reassign': 'off',
      'no-bitwise': ['error', { allow: ['~'] }],
      'no-undef': 'off',
      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: [],
          labelAttributes: [],
          controlComponents: [],
          assert: 'both',
          depth: 25,
        },
      ],
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    },
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettierConfig
);
