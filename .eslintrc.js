/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off'
  }
};


