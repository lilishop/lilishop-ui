# IM 客服端 Vue 3 迁移说明

## 技术栈

- Vue 3.5 + Vue Router 4 + Vuex 4
- Element Plus（替代 element-ui）
- 自研右键菜单 `src/plugins/contextmenu.js`（替代 vue-contextmenujs）
- `vue-virtual-scroller@3`、`vue-cropper@1.x`、`vue-prism-editor@2.0.0-alpha.2`

## 启动

```bash
cd im
yarn install
yarn dev    # 端口 8000
yarn build
```

## 迁移要点

1. **入口** `src/main.js` — `createApp`，全局过滤器 `$filters`
2. **路由** `createRouter` + `createWebHistory`，404 路由 `/:pathMatch(.*)*`
3. **通知** `im-server/event/talk.js` 通过 `app-bridge` 发 `ElNotification`，避免循环引用
4. **用户卡片** `$user()` 插件用 `createApp` 挂载
5. **指令** `v-focus` / `v-paste` / `v-drag` / `v-outside` 已改为 Vue 3 钩子
6. **SVG** `svg-sprite-loader` + `svg-icon` 全局组件
7. **生命周期** `destroyed` → `beforeUnmount`；`$set` / `$delete` 已移除

## 上线前检查

统一清单见仓库根目录：[../MIGRATION-VUE3.md](../MIGRATION-VUE3.md)  
IM 专项见该文档 **「IM 客服端」** 一节。
