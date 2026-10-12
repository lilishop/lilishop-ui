# Buyer 买家端 Vue 3 迁移说明

## 技术栈

- Vue 3 + Vue Router 4 + Pinia（vuex 已移除，见下文"组合式 API 迁移"）
- Element Plus（替代 view-design / iView）
- 保留 `$Message` / `$Modal` / `$Notice` 兼容层（`src/utils/message.js`）

## 启动

```bash
cd buyer
yarn install
yarn dev    # 默认端口 10000
yarn build
```

## 迁移要点

1. **入口** `src/main.js` 使用 `createApp`，全局过滤器改为 `$filters`
2. **路由** `src/router/index.js` 使用 `createRouter` + 动态 `import()`
3. **请求** `src/plugins/request.js` 使用 Element Plus `ElLoading`
4. **iView 组件已全部替换**：轮播 `el-carousel`、下拉 `el-dropdown`、侧栏 `el-menu`、头像 `el-avatar` 等
5. **图标映射** `src/utils/iconMap.js` — 动态图标（如侧边栏菜单）通过 `resolveIcon()` 使用
6. **自定义字体图标** `icomoon` 保留为 `<i class="icomoon icon-*">`（购物车步骤条、钱包等）
7. **首页装修** `indexDecorate/modelList` 保留买家端展示逻辑（非 manager 编辑版）
8. **特殊替换**
   - `vue-piczoom` → `el-image` 预览
   - `mv-count-down` → 内置倒计时
   - 秒杀轮播 → 横向滚动列表

## 组合式 API 迁移（2026-10 完成）

全部 95 个 `.vue` 组件已从 Options API 转换为 `<script setup>`，同时完成 vuex → pinia：

- **状态管理**：`src/stores/app.js`（`useAppStore`：navList / cartNum / unreadMsg / logoImg / siteName / hotWordsList / category + 对应 setXxx actions）。原 `src/vuex/` 已删除，package.json 不再依赖 vuex。
- **路由守卫**：`beforeRouteEnter` 无组合式等价物，5 个页面（`GoodsList` / `GoodsDetail` / `PointGoodsDetail` / `Cart` / `ShoppingCart`）保留普通 `<script>` 块存放 `export default { name, beforeRouteEnter }`——这是官方支持的合并写法，统计 Options API 残留时需排除。
- **defineExpose**：以下组件的方法/状态被父组件通过模板 ref 调用，已显式暴露：`verify`（init / close）、`multiple-map`（open）、`addressManage`（show / hide）、`invoiceModal`（invoiceAvailable）。新增此类父子调用时必须加 `defineExpose`。
- **模板 ref 与响应式变量同名会互相覆盖**：同名时模板 ref 统一改名 `xxxRef`（如 `formRef` / `verifyRef`）。
- **mixin 已消除**：原 `components/mixes/talkIm.vue` 的 IM 客服逻辑已内联进 `Merchant.vue` 和 `goodsDetail/StoreSide.vue`，文件已删除。
- **全局属性照旧**：模板中的 `$filters.*` / `linkTo` / `connectCs` / `$inputMaxLength` 是 `main.js` 注册的全局属性，`<script setup>` 下模板可直接使用；script 内使用 `$filters` 函数需从 `@/plugins/filters.js` 具名导入，`this.Cookies` 等同 `storage`（`@/plugins/storage`）。
- **其余三端（seller / manager / im）仍为 Options API + vuex**，迁移时参照本端模式。

## 批量脚本

- `scripts/migrate-iview-to-element.js` — iView → Element 模板替换
- `scripts/fix-filters.js` — Vue 2 过滤器语法修复
- `scripts/replace-page.js` — `<Page>` → `el-pagination`
- `scripts/replace-icon.js` — 静态 `<Icon type>` → `el-icon`
- `scripts/fix-el-icon-click.js` — 修复 `@click` 绑定
- `scripts/fix-broken-tags.js` — 闭合标签修复

## 上线前检查

四端统一清单（认证、axios、Element Plus、分端专项）：[../MIGRATION-VUE3.md](../MIGRATION-VUE3.md)
