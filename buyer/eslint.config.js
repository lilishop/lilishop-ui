const globals = require('globals')
const pluginVue = require('eslint-plugin-vue')

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      'config/**',
      'src/scripts/**', // 一次性迁移脚本，不参与 lint
    ],
  },
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'vue/no-parsing-error': ['error', { 'x-invalid-end-tag': false }],
      // 页面组件通过路由按文件路径引用，组件名不参与解析，存量单词组件名不再强制多词
      'vue/multi-word-component-names': 'off',
      // 存量代码大量使用与 HTML 保留名同名的组件（element-plus 图标 Search/View/Camera/Link 及全局注册的 empty/drawer 等），重命名成本高，暂不启用
      'vue/no-reserved-component-names': 'off',
    },
  },
]
