# manager Vue 3 + Element Plus 迁移说明

## 已完成（P1–P3 骨架）

- 依赖升级：`vue@3`、`vue-router@4`、`vuex@4`、`vue-i18n@9`、`element-plus`
- 入口：`src/main.js`（`createApp`）
- 路由、动态路由、全局 `$Message` / `$Modal` / `$Notice`、`$filters`、`priceColorScheme`、`vue-qr@5`
- TinyMCE：移除已弃用 `template` 插件

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
