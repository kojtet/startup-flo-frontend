import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'off',
    }
    
  }),
]

export default eslintConfig
