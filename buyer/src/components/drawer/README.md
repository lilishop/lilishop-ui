# 右侧侧边栏组件

基于 Element Plus `el-drawer` 封装的右侧悬浮栏。

## 项目结构

- `Main.vue` — 挂载右侧横栏的容器
- `Drawer.vue` — 横栏展开后的内容面板
- `config.js` — 尺寸与菜单配置

## config 设置

```js
/**
 * menuList  菜单项列表
 * display   是否显示该项
 * badge     徽标数字
 * titleShow 是否显示标题
 */
width: 50,
menuList: [{ icon: '...' }]
```

## 功能模块

账户信息、购物车、我的订单、优惠券、我的资产、我的足迹、我的收藏、邮箱订阅

## 使用

在页面中注册全局组件 `<drawer />` 即可（已在 `global.js` 中注册）。
