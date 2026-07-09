# Lilishop UI — Vue 3 迁移与上线前检查清单

四个子项目（buyer / seller / manager / im）已完成 **Vue 3 + Element Plus** 迁移，并完成依赖小版本对齐。本文档供上线前统一回归使用。

## 技术栈（四端一致）

| 类别 | 包 | 版本（package.json） |
|------|-----|---------------------|
| 框架 | vue | ^3.5.35 |
| 编译 | @vue/compiler-sfc | ^3.5.35 |
| 路由 | vue-router | ^4.6.4 |
| 状态 | vuex | ^4.1.0 |
| UI | element-plus | ^2.14.1 |
| 图标 | @element-plus/icons-vue | ^2.3.2 |
| 请求 | axios | ^1.7.9 |
| 兼容 | core-js | ^3.49.0 |
| 构建 | @vue/cli-service | ^5.0.9 |

> 使用 `^` 范围，实际安装版本以各目录 `yarn.lock` 为准。  
> 要求 **Node >= 16**，包管理统一 **yarn**。

## 本地启动

```bash
# 买家端
cd buyer && yarn install && yarn dev    # 端口 10000

# 商家端
cd seller && yarn install && yarn dev   # 端口 10002

# 管理端
cd manager && yarn install && yarn dev  # 端口 10003

# IM 客服
cd im && yarn install && yarn dev       # 端口 8000
```

生产构建（上线前必跑）：

```bash
cd buyer   && yarn build
cd seller  && yarn build
cd manager && yarn build
cd im      && yarn build
```

---

## 一、通用检查（四端都要过）

### 1. 认证与请求（axios 1.x 重点）

各端请求封装位置：

| 端 | 文件 |
|----|------|
| buyer | `buyer/src/plugins/request.js` |
| seller | `seller/src/libs/axios.js` |
| manager | `manager/src/libs/axios.js` |
| im | `im/src/utils/request.js` |

- [ ] **登录**：账号密码登录成功，token 写入正常
- [ ] **登出**：清除 token，跳转登录页
- [ ] **401**：token 过期后跳转登录 / 刷新 token（buyer/manager/seller 有刷新逻辑）
- [ ] **403**：无权限时提示文案正确、不白屏
- [ ] **400 / 5xx**：接口报错能弹出 `Message` / `ElMessage` / `Notification`
- [ ] **网络超时**：断网或超时后有错误提示，页面不卡死
- [ ] **GET 带参**：列表筛选、分页参数序列化正常
- [ ] **POST JSON**：`Content-Type: application/json` 请求体正确
- [ ] **POST 表单**：`application/x-www-form-urlencoded` 提交正常（im 等）

### 2. Element Plus UI（2.6 → 2.14 重点）

- [ ] **表格** `el-table`：列展示、排序、空数据、加载态
- [ ] **分页** `el-pagination`：翻页、每页条数切换
- [ ] **表单** `el-form`：必填校验、错误提示位置
- [ ] **弹窗** `el-dialog` / `ElMessageBox`：打开、确认、取消、关闭
- [ ] **下拉** `el-select` / `el-dropdown`：选项、点击外部关闭
- [ ] **消息** `ElMessage` / `$Message` 兼容层：success / error / warning
- [ ] **加载** `ElLoading` / `v-loading`：请求期间遮罩正常消失
- [ ] **日期** `el-date-picker`：选择、清空、范围选择
- [ ] **上传** `el-upload`：选文件、进度、成功 / 失败回调

### 3. 路由与页面

- [ ] 浏览器 **刷新** 当前路由不 404（history 模式 + 服务端配置）
- [ ] **动态路由** 加载正常（seller / manager 菜单权限路由）
- [ ] 浏览器 **前进 / 后退** 正常
- [ ] 各端 **404 页** 可回到首页

### 4. 构建与部署

- [ ] 四端 `yarn build` 无 error（warning 可记录，不阻断）
- [ ] 生产环境 API 地址配置正确（`config` / 环境变量）
- [ ] 静态资源 `publicPath` 与 Nginx / CDN 路径一致
- [ ] gzip 压缩包（如有）可正常访问

---

## 二、分端专项检查

### Buyer 买家端（10000）

详见 [buyer/MIGRATION-VUE3.md](./buyer/MIGRATION-VUE3.md)

- [ ] 首页装修模块渲染（轮播、商品列表、秒杀区等）
- [ ] 商品详情：规格选择、加购、收藏、`el-image` 预览
- [ ] 购物车 → 结算 → 支付流程
- [ ] 用户中心：订单列表、地址、优惠券、售后
- [ ] 登录 / 注册 / 忘记密码
- [ ] 店铺入驻、商户页
- [ ] 地图（高德 `@amap/amap-jsapi-loader`）定位与选点
- [ ] 侧边栏 `el-menu`、头部 `el-dropdown`、动态图标 `iconMap.js`

### Seller 商家端（10002）

详见 [seller/MIGRATION-VUE3.md](./seller/MIGRATION-VUE3.md)

- [ ] 商家登录、店铺信息
- [ ] 商品发布三步流程（`goodsOperation` 步骤条）
- [ ] 订单管理：发货、退款、详情
- [ ] 促销 / 分销 / 统计图表（`@antv/g2`）
- [ ] 页面装修（wap / modelList，从 manager 同步部分）
- [ ] 图片懒加载 `vue-lazyload`
- [ ] Excel 导出 `vue-json-excel`

### Manager 管理端（10003）

详见 [manager/MIGRATION-VUE3.md](./manager/MIGRATION-VUE3.md)

- [ ] 管理员登录、权限菜单、动态路由
- [ ] 系统设置（`sys/setting-manage` 各 Tab）
- [ ] 菜单 / 部门管理
- [ ] 页面装修（PC + H5）
- [ ] 文章管理
- [ ] 商品 / 订单 / 会员 / 促销等核心列表 CRUD
- [ ] 富文本 TinyMCE 编辑、图片上传
- [ ] 多语言 `vue-i18n` 切换（如有启用）

### IM 客服端（8000）

详见 [im/MIGRATION-VUE3.md](./im/MIGRATION-VUE3.md)

- [ ] 带 token 参数进入会话页
- [ ] 对话列表加载、切换会话、未读数
- [ ] 发送文字、表情、图片消息
- [ ] 商品 / 订单卡片链接跳转（`linkToGoods` / `linkToOrders`）
- [ ] 右键菜单（复制、撤回、删除等）
- [ ] WebSocket 连接 / 断线重连 / 新消息通知
- [ ] 最近浏览、订单列表侧栏（商家场景）
- [ ] 用户名片弹层 `$user()`

---

## 三、已知可忽略项

| 项 | 说明 |
|----|------|
| `vue-awesome-swiper` peer warning | 历史依赖，Vue 3 下仍有 peer 告警，功能正常可暂忽略 |
| im 内 `<i class="el-icon-*">` | Element Plus 无字体图标，部分旧图标可能不显示，不影响核心功能 |
| `vue-prism-editor@2.0.0-alpha.2` | im 代码块编辑器刻意锁定 alpha 版 |
| 打包体积 warning | chunk-vendors 偏大，属 Element Plus 全量引入，可后续做按需优化 |

---

## 四、问题记录模板

上线测试时建议按端记录：

```markdown
### [端名] 问题标题
- 页面/路由：
- 操作步骤：
- 预期：
- 实际：
- 控制台报错：
- 优先级：P0 / P1 / P2
```

---

## 五、子项目文档索引

| 端 | 迁移说明 |
|----|----------|
| buyer | [buyer/MIGRATION-VUE3.md](./buyer/MIGRATION-VUE3.md) |
| seller | [seller/MIGRATION-VUE3.md](./seller/MIGRATION-VUE3.md) |
| manager | [manager/MIGRATION-VUE3.md](./manager/MIGRATION-VUE3.md) |
| im | [im/MIGRATION-VUE3.md](./im/MIGRATION-VUE3.md) |

---

## 六、建议上线顺序

1. **manager**（后台配置源头）
2. **seller**（商家经营）
3. **buyer**（C 端流量最大）
4. **im**（客服，依赖前后端 WebSocket）

每上一端，至少完成本文 **第一节通用检查** + 对应 **第二节分端检查** 后再切下一端。
