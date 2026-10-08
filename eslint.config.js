import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const MOCKS_IMPORT = {
  regex: '(^|/)mocks(/|$)',
  message:
    'src/mocks stands in for the server. The client reaches it only over HTTP.',
};

const FEATURE_IMPORT = {
  regex: '(^|/)features(/|$)',
  message:
    'Shared code must not depend on a feature. Pass what it needs as props or arguments.',
};

const OTHER_FEATURE_IMPORT = {
  regex: '^@/features/',
  message:
    'A feature never imports another feature. Import files of this feature with ./ and move shared code to components/, hooks/ or lib/.',
};

const PARENT_IMPORT = {
  regex: '^\\.\\./',
  message:
    'Inside a feature, import its own files with ./ and anything else with @/.',
};

export default defineConfig([
  globalIgnores([
    'dist',
    'src/routeTree.gen.ts',
    'public/mockServiceWorker.js',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/mocks/**', 'src/main.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [MOCKS_IMPORT] }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [MOCKS_IMPORT, OTHER_FEATURE_IMPORT, PARENT_IMPORT] },
      ],
    },
  },
  {
    files: ['src/{components,hooks,lib}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [MOCKS_IMPORT, FEATURE_IMPORT] },
      ],
    },
  },
]);
