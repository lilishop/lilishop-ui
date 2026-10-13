const globals = require('globals')
const js = require('@eslint/js')
const pluginVue = require('eslint-plugin-vue')

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      // tree-table 是 JSX 写的旧组件，全项目无引用，待删除，暂不纳入检查
      'src/views/my-components/tree-table/**',
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // webpack 构建环境注入
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        // public/config.js 通过 <script> 注入，见 public/index.html
        BASE: 'readonly',
        // 高德地图 loader 动态注入
        AMapUI: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-undef': 'error',
      // 存量代码大量使用 ==，先告警，逐步治理
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      // 项目依赖 v-html 渲染服务端内容，由 xss 过滤兜底，不在此处拦截
      'vue/no-v-html': 'off',
      // 页面组件多为单词命名且被路由引用，改名成本高
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      // 存量 49 处直接改 prop，先告警，逐步治理
      'vue/no-mutating-props': 'warn',
      // 全端已完成 Options API → <script setup> 迁移，防止新代码回退（tpl_* 装修模板的自定义选项普通 script 块等有意保留的除外，故用 warn）
      'vue/component-api-style': ['warn', ['script-setup']],
    },
  },
  {
    // 根目录构建配置 + scripts 工具：CommonJS + Node
    files: ['*.config.js', 'scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // scripts 下是一次性迁移脚本，已执行完毕，不做变量层面的约束
      'no-unused-vars': 'off',
    },
  },
]

