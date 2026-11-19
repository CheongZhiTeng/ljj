import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'browser-artifacts']),
  js.configs.recommended,
  {
    files: ['tests/**/*.mjs'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        process: 'readonly',
        document: 'readonly',
        getComputedStyle: 'readonly',
        innerWidth: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
    },
  },
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
]);
