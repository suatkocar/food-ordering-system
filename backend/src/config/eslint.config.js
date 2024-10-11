import prettier from 'eslint-plugin-prettier';
import complexity from 'eslint-plugin-complexity';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import nodePlugin from 'eslint-plugin-node';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    plugins: {
      prettier,
      complexity,
      promise: promisePlugin,
      security: securityPlugin,
      node: nodePlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      complexity: ['warn', { max: 15 }],
      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'error',
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
  },
];
