/**
 * @type {import('eslint').Linter.Config}
 * @see https://eslint.org/docs/user-guide/configuring/
 */
const config = {
  extends: '@antfu',
  ignorePatterns: ['dist', 'public', 'tsconfig*.json'],
  overrides: [
    {
      files: ['*.js', '*.ts', '*.vue'],
      rules: {
        'no-console': ['off'],
        '@typescript-eslint/no-unused-vars': ['off'],
        '@typescript-eslint/brace-style': [
          'error',
          '1tbs' /* , { allowSingleLine: true } */,
        ],
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          { prefer: 'no-type-imports' },
        ],
        'curly': ['error', 'all'],
        // 'no-useless-call': 'off',
      },
    },
  ],
}

module.exports = config
