// eslint.config.js
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'tmp/',
      'package-lock.json',
      'node_modules/ ',
    ],
  },
  {
    // 通用配置（适用于所有 JS 文件）
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js 全局变量
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    // 仅测试文件：添加 Mocha 全局变量
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        context: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        run: 'readonly',
      },
    },
  },
  eslint.configs.recommended,
  prettier,
];
