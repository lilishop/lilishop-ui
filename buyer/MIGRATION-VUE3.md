# Buyer 买家端 Vue 3 迁移说明

## 技术栈

- Vue 3 + Vue Router 4 + Vuex 4
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

## 批量脚本

- `scripts/migrate-iview-to-element.js` — iView → Element 模板替换
- `scripts/fix-filters.js` — Vue 2 过滤器语法修复
- `scripts/replace-page.js` — `<Page>` → `el-pagination`
- `scripts/replace-icon.js` — 静态 `<Icon type>` → `el-icon`
- `scripts/fix-el-icon-click.js` — 修复 `@click` 绑定
- `scripts/fix-broken-tags.js` — 闭合标签修复

## 上线前检查

四端统一清单（认证、axios、Element Plus、分端专项）：[../MIGRATION-VUE3.md](../MIGRATION-VUE3.md)
