# seller Vue 3 + Element Plus 迁移说明

## 已完成

- 依赖升级：`vue@3`、`vue-router@4`、`vuex@4`、`element-plus`、`vue-lazyload@3`
- 入口：`src/main.js`（`createApp`）
- 路由、动态路由、全局 `$Message` / `$Modal` / `$Notice`、`$filters`
- 移除 `view-design`，`axios` 已改用 `@/utils/message`
- 页面装修模块从 manager 同步（`shop/wap`、`shop/modelList` 等）
- 订单、促销、分销、统计等业务页从 manager 迁移并适配商家 API
- `yarn run build` 编译通过

## 本地运行

```bash
cd seller
yarn install
yarn run dev
```

Node **16+**，包管理统一 **yarn**。商家后台默认端口见 `src/config/index.js`（10002）。

## 本轮补充（样式 / 商品发布）

- `goodsOperation.vue`：`el-steps` 步骤条
- `goodsOperationFirst.vue` / `goodsOperationSec.vue`：去除 iView 图标、`ButtonGroup`
- `shop/hotzone/index.vue`：`el-dialog` 热区弹窗
- `common.scss` / `table-common.scss`：列表页双 Card 间距、`el-form-item` 对齐
- `addGoods.scss` / `home.scss` 等：`:deep()` 语法修复

## 可选后续

- 业务代码中仍可使用 `this.$Message` / `this.$Modal`（兼容层映射到 Element Plus）
- 样式文件中残留的 `.ivu-*` 类名可逐步清理
- 商品发布三步流程建议上线前重点回归测试

## 迁移脚本

- `scripts/migrate-iview-to-element.js` — 从 manager 复制装修模板 + 批量替换
- `scripts/copy-manager-migrations.js` — 从 manager 复制已迁移业务页

## 上线前检查

四端统一清单（认证、axios、Element Plus、分端专项）：[../MIGRATION-VUE3.md](../MIGRATION-VUE3.md)
