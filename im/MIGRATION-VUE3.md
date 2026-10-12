# IM 客服端 Vue 3 迁移说明

## 技术栈

- Vue 3.5 + Vue Router 4 + Pinia 4
- Element Plus（替代 element-ui）
- 自研右键菜单 `src/plugins/contextmenu.js`（替代 vue-contextmenujs）
- `vue-virtual-scroller@3`、`vue-cropper@1.x`、`vue-prism-editor@2.0.0-alpha.2`

## 组合式 API 迁移（2026-10 完成）

全部 53 个 `.vue` 组件已从 Options API 转换为 `<script setup>`，并完成 vuex → pinia：

- **状态管理**：`src/stores/` 下 8 个 store（app/user/talk/notify/settings/emoticon/dialogue/note），对应原 vuex 根 state + 7 个模块；mutation 全部转为同名 SCREAMING_CASE action。原 `src/store/` 已删除。
- **全局 mixin 保留**：`main.js` 的 `app.mixin(MainMixin)` 依然生效（对 `<script setup>` 组件同样注入），mixin 内部已改用 pinia。**注意**：mixin 经 `this` 回调组件成员时，`<script setup>` 的绑定不会出现在公共实例上——`views/message/index.vue` 采用了 ctx 桥接（`Object.defineProperties(instance.ctx, ...)`）方案，后续若有组件被全局 mixin 回调需用同样方案。
- **socket 事件层**（`im-server/event/*`、`plugins/ws-socket.js`、`utils/talk.js` 等纯 JS）：vuex 引用全部改为函数内部 `useXxxStore()`。
- **$user() 名片弹层**（`components/user/user-card/index.js`）：独立子 app 改用独立 `createPinia()`。
- **app-bridge.js**：保留了 `$store.state.talks.items` 兼容门面（惰性 getter），供旧调用形态使用。

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
