/**
 * ==============================================================================
 * Babel 转译器配置文件 (babel.config.js)
 * ==============================================================================
 * 
 * 主要功能：
 * 1. 采用 Vue CLI 官方预设进行现代 JavaScript (ES6+) 向下兼容转译
 * 2. 集成 PrismJS 插件，用于在 IM 聊天对话框中展示富文本代码块时的多语言语法高亮
 */

module.exports = {
  // Vue CLI 官方 Babel 预设，自动包含常用语法转换与 polyfill 支持
  presets: ["@vue/cli-plugin-babel/preset"],

  plugins: [
    /**
     * PrismJS 语法高亮插件配置
     * babel-plugin-prismjs: 按需加载 PrismJS 的语言包和样式主题，优化打包体积
     */
    [
      "prismjs",
      {
        // 需要按需引入并支持语法高亮的编程/标记语言列表
        languages: [
          "html",         // HTML 标记语言
          "css",          // CSS 样式表
          "less",         // Less 预处理样式
          "javascript",   // JavaScript 脚本语言
          "typescript",   // TypeScript
          "json",         // JSON 数据格式
          "xml",          // XML 文档
          "bash",         // Bash 脚本
          "nginx",        // Nginx 服务器配置文件
          "sql",          // 数据库 SQL 语句
          "docker",       // Dockerfile 配置
          "php",          // PHP 语言
          "java",         // Java 语言
          "go",           // Go 语言
          "python",       // Python 语言
          "ruby",         // Ruby 语言
          "rust",         // Rust 语言
          "objectivec",   // Objective-C 语言
          "c",            // C 语言
          "csharp",       // C# 语言
          "cpp",          // C++ 语言
          "lua",          // Lua 脚本
          "shell",        // Shell 命令行脚本
          "vim",          // Vim 配置与脚本
          "yaml",         // YAML 配置
          "yml",          // YML 配置
          "md",           // Markdown 文本
          "erlang",       // Erlang 语言
          "ini",          // INI 配置文件
        ],
        // 代码高亮使用的默认主题 (采用深色风格的 okaidia 主题)
        theme: "okaidia",
      },
    ],
  ],
};
