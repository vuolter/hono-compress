import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importX from 'eslint-plugin-import-x'
import markdown from 'eslint-plugin-markdown'
import perfectionist from 'eslint-plugin-perfectionist'
import regexp from 'eslint-plugin-regexp'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import tsdoc from 'eslint-plugin-tsdoc'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...markdown.configs.recommended,
  unicorn.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  perfectionist.configs['recommended-natural'],
  security.configs.recommended,
  sonarjs.configs.recommended,
  prettier,
  { ignores: ['dist'] },
  { plugins: { tsdoc } },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'warn',
      'no-undef': 'off',
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': 'off',
      'tsdoc/syntax': 'warn',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    settings: { 'import-x/resolver': { typescript: true } },
  },
)
