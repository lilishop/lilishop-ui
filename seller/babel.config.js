module.exports = {
  presets: [
    // 按实际用到的语法特性按需注入 polyfill，替代 main.js 的全量 core-js/stable
    ["@vue/cli-plugin-babel/preset", { useBuiltIns: "usage", corejs: 3 }],
  ],
};
