# manager Vue 3 + Element Plus 迁移说明

## 已完成（P1–P3 骨架）

- 依赖升级：`vue@3`、`vue-router@4`、`vue-i18n@9`、`element-plus`、`pinia@4`
- 入口：`src/main.js`（`createApp` + `createPinia`）
- 路由、动态路由、全局 `$Message` / `$Modal` / `$Notice`、`$filters`、`priceColorScheme`、`vue-qr@5`
- TinyMCE：移除已弃用 `template` 插件

## 组合式 API 迁移（2026-10 完成）

全部 280 个 `.vue` 组件已从 Options API 转换为 `<script setup>`，并完成 vuex → pinia：

- **状态管理**：`src/stores/` 下 4 个 store（app/user/setting/dict）。app store 合并了原 vuex 根 state（`openStyleStore/openStoreId/notices`）+ 原 app 模块；mutation 全部转为同名 action，两个例外：`pageOpenedList` mutation 改名 `updateOpenedList`（避免与 state 同名）；`clearOtherTags` 改收路由 name 字符串（不再传组件实例 vm）。原 `src/store/` 已删除，package.json 不再依赖 vuex。
- **util.js 去 vm 化**：`src/libs/util.js` 的 `openNewPage(name, argu, query)` / `initRouter()` / `initMenuData(data)` 已去掉 vm 首参，内部直接用 `useAppStore()`。
- **defineExpose 清单**（被外部通过 ref 访问的组件，改其内部成员时注意保持暴露面）：
  - `components/lili-dialog/index.vue`：`open` / `singleGoods` / `clearGoodsSelected` / `goodsData` / `goodsFlag` / `flag` / `close`
  - `components/lili-dialog/goods-dialog.vue`：`type`
  - `components/verify/index.vue`：`show` / `init`
  - `components/lili/config-drawer.vue`：`open` / `close`
  - `components/lili/department-tree-choose.vue`：`setData` / `clearSelect`
  - `components/map/multiple-map.vue`：`open`
  - `components/editor/index.vue`（Tinymce）：`getEditor` / `setContent` / `getContent`
  - `sys/oss-manage/ossManage.vue`：`selectImage` / `fileType` / `changeFileType`
  - `components/hotzone/index.vue`：`open` / `close`；`hotzone/components/Hotzone.vue`：`zones` / `addItem` / `eraseItem` / `isOverRange` / `overRange` / `changeItem`（被自定义指令经 `binding.instance` / `$parent` 访问）；`hotzone/components/Zone.vue`：`showModalFn` / `delItem` / `handlehideZone` / `changeInfo`
  - `page-decoration/modelForm.vue`：`navList` / `topAdvert`
  - `promotions/coupon/coupon.vue`：`check` / `getSelection` / `clearSelectAll`
  - `live/components/LivePurchaseRecords.vue`：`refresh`
- **i18n**：script 内 `this.$t` 统一改为 `i18n.global.t`（`@/locale`），模板 `$t` 不变。
- **修复的编译级问题**：`page-decoration/wap/index.vue` 的 `function package()` 改名 `packageModel`（保留字）。

## P5 批量修复（Table / 过滤器）

列表页 **60+** 已 `el-table`；过滤器已改为 `$filters.*`；全项目已无 `$set` / `$options.filters`。

## P6 表单 / 弹窗（已完成模块）

| 模块 | 状态 |
|------|------|
| 地区、秒杀设置、分销设置、修改密码、编辑器、链接弹窗 | ✅ |
| 店铺详情 / 店铺编辑 `shopOperation.vue` | ✅ |
| 售后详情 `afterSaleOrderDetail.vue` | ✅ |
| **系统设置** `sys/setting-manage/**`（19 个 vue + template.js） | ✅ |
| **菜单 / 部门** `sys/menu-manage/`、`sys/department-manage/` | ✅ |
| **页面装修** `views/page-decoration/**`（PC + H5 装修、modelList、wap 模板） | ✅ |
| **文章管理** `views/page/article-manage/**` | ✅ |
| **零散页面** 礼品卡、个人中心、热区、促销编辑、视频号、错误页、短信签名等 | ✅ |

### 系统设置包含

- `settingManage.vue`（Tab 壳）
- `platformSetting.vue`
- `setting/`：基础、商品、订单、积分、提现、物流、OSS、短信、客服
- `pay/`：支付开关、支付宝、微信
- `authLogin/`：登录、QQ、微信
- `smsSettingManage.vue`

`template.js` 中动态组件已 `markRaw`。

## 可选后续

- `components/tree-table`：旧 JSX 表格，当前路由未引用；`Spin` 已改 `v-loading`，`beforeUnmount` 已对齐 Vue 3
- 样式文件中残留的 `.ivu-*` 类名可随页面改版逐步清理（不影响运行）

## 编译告警处理（2026-05）

- 全项目 `::v-deep` 已改为 Vue 3 推荐的 `:deep(...)`
- `common.scss` 合并 `table-common.scss`，去掉全局 `@import` 注入告警
- `vue.config.js` 配置 `sassOptions.silenceDeprecations` 抑制 Sass legacy API 提示
- `common.scss`：`.search > .el-card + .el-card` 恢复列表页双 Card 间距（原 `.ivu-card` 规则已失效）
- `element.scss`：全局 `el-table--border` 去掉列竖线

## 本地运行

```bash
cd manager
yarn install
yarn run dev
```

Node **16+**，包管理统一 **yarn**。

## 上线前检查

四端统一清单（认证、axios、Element Plus、分端专项）：[../MIGRATION-VUE3.md](../MIGRATION-VUE3.md)
