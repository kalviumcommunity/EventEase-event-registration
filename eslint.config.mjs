import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // ✅ Ignore build + config files
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      'next.config.ts',
      'test-env.js',
    ],
  },

  // ✅ Base config for JS + TS
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,

      // ✅ React
      'react/react-in-jsx-scope': 'off',

      // ✅ Prettier formatting errors
      'prettier/prettier': 'error',

      // ✅ Console warnings only (won’t fail CI)
      'no-console': 'warn',

      // ✅ Important: turn off JS unused-vars (TS rule will handle it)
      'no-unused-vars': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // ✅ TypeScript rules (type-aware)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // ✅ Ignore unused variables starting with "_"
      // ✅ Works for: _req, _request, _error
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // ✅ Jest/Test files override
  {
    files: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];
