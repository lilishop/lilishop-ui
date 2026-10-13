# seller Vue 3 + Element Plus 迁移说明

## 已完成

- 依赖升级：`vue@3`、`vue-router@4`、`element-plus`、`vue-lazyload@3`、`pinia@4`
- 入口：`src/main.js`（`createApp` + `createPinia`）
- 路由、动态路由、全局 `$Message` / `$Modal` / `$Notice`、`$filters`
- 移除 `view-design`，`axios` 已改用 `@/utils/message`
- 页面装修模块从 manager 同步（`shop/wap`、`shop/modelList` 等）
- 订单、促销、分销、统计等业务页从 manager 迁移并适配商家 API
- `yarn run build` 编译通过

## 组合式 API 迁移（2026-10 完成）

全部 169 个 `.vue` 组件已从 Options API 转换为 `<script setup>`，并完成 vuex → pinia：

- **状态管理**：`src/stores/` 下 4 个 store（`app` / `user` / `setting` / `dict`），原 `src/store/`（vuex）已删除，package.json 不再依赖 vuex。原 mutation 全部转为同名 action，两个例外：`storeOpenedList` mutation 改名 `updateOpenedList`（避免与 state 同名）；`clearOtherTags` 改收路由 name 字符串（不再传组件实例 vm）。
- **util.js 去 vm 化**：`src/libs/util.js` 所有函数的 `vm` 首参已删除，内部直接用 `useAppStore()`。调用方式从 `util.openNewPage(this, name)` 变为 `util.openNewPage(name)`。
- **defineExpose 清单**（被外部通过 ref 访问的公共组件，改动其内部成员时注意保持暴露面）：
  - `lili-dialog/index.vue`：`open` / `goodsData` / `goodsFlag` / `flag` / `clearGoodsSelected` / `singleGoods`
  - `lili-dialog/goods-dialog.vue`：`type`
  - `sys/oss-manage/ossManage.vue`：`selectImage`
  - `my-components/verify/index.vue`：`show` / `init`
  - `my-components/map/multiple-map.vue`：`open`
  - `lili-components/editor/index.vue`（Tinymce）：`getEditor` / `setContent` / `getContent`
  - `my-components/lili/department-tree-choose.vue`：`setData` / `clearSelect`
  - `lili-components/multiple-region.vue`：`clear` / `open`
  - `main-components/config-drawer.vue`：`open` / `close`
  - `shop/hotzone/index.vue`：`open` / `close`；`shop/hotzone/components/Zone.vue`：`showModalFn` / `delItem`；`shop/hotzone/components/Hotzone.vue`：`addItem` / `isOverRange` / `overRange` / `changeItem` / `eraseItem` / `zones`（被自定义指令经 `binding.instance` 访问）
  - `shop/modelForm.vue`：`navList` / `topAdvert`；`goods-seller/goodsOperation.vue`：`activestep`；`goods-seller/goodsOperationFirst.vue`：`selectGoodsType`；`goods-seller/components/AppointmentPublishPanel.vue`：全部 20 个方法
- **保留 `export default` 普通 script 块的文件**（统计 Options API 残留时需排除）：`shop/wap/template/` 下 3 个 `tpl_*` 组件（保留自定义 `title` 选项）。
- **修复的历史笔误**：多处 `this.$message`（小写）修正为 `Message`（全局只注册了 `$Message`，原写法运行时会抛 TypeError）——appointment 模块 4 处、goods.vue 1 处等。
- **其余两端（manager / im）仍为 Options API + vuex**，迁移时参照本端与 buyer 端模式。

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
