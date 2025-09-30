# LILISHOP-UI

# LiliShop UI Seller 的 Node.js 版本兼容性

本文档概述了 LiliShop UI seller 项目的 Node.js 版本兼容性。

## 摘要

| Node.js 版本 | npm 版本 | 兼容性 | 备注 |
|-----------------|-------------|--------------|-------|
| v20.13.1 (当前 LTS) | 10.8.0 | ✅ 需要解决方案 | 安装需要 `--legacy-peer-deps` 参数，运行需要 `NODE_OPTIONS=--openssl-legacy-provider` |
| v18.20.8 (LTS) | 10.8.2 | ✅ 需要解决方案 | 安装需要 `--legacy-peer-deps` 参数，运行需要 `NODE_OPTIONS=--openssl-legacy-provider` |
| v16.20.2 (LTS) | 8.19.4 | ✅ 有轻微警告 | 安装需要 `--legacy-peer-deps` 参数，整体运行良好 |
| v14.x (最低版本) | - | ❌ 不兼容 | 无法在 ARM64 架构上安装 (M系列 Mac) |

## 详细发现

### Node.js v20.13.1 (当前 LTS)
- **安装**: 使用 `--legacy-peer-deps` 参数可以正常安装
- **开发服务器**: 需要设置 `NODE_OPTIONS=--openssl-legacy-provider` 环境变量
- **构建**: 需要设置 `NODE_OPTIONS=--openssl-legacy-provider` 环境变量
- **问题**:
  - vue-awesome-swiper 和 swiper 之间的依赖冲突
  - 由于 Node.js v20 移除了旧版加密算法导致的 OpenSSL 相关错误
  - 部分包报告不支持的引擎警告
- **验证**: 已成功构建并验证 dist/index.html 可以正常运行

### Node.js v18.20.8 (LTS)
- **安装**: 使用 `--legacy-peer-deps` 参数可以正常安装
- **开发服务器**: 需要设置 `NODE_OPTIONS=--openssl-legacy-provider` 环境变量
- **构建**: 需要设置 `NODE_OPTIONS=--openssl-legacy-provider` 环境变量
- **问题**:
  - 部分包报告不支持的引擎警告 (v-click-outside-x, @achrinza/node-ipc)
- **验证**: 已成功构建并验证 dist/index.html 可以正常运行

### Node.js v16.20.2 (LTS)
- **安装**: 使用 `--legacy-peer-deps` 参数可以正常安装
- **开发服务器**: 无需额外参数即可运行
- **构建**: 可以正常构建
- **问题**:
  - v-click-outside-x 包有轻微警告 (需要 npm 6.4.1)

### Node.js v14.x
- **安装**: 在 ARM64 架构 (M系列 Mac) 上无法安装
- **开发服务器**: 未测试
- **构建**: 可以正常构建
- **问题**:
  - Node.js v14 没有 ARM64 架构的二进制文件

## 建议

1. **最佳版本**: Node.js v16.20.2 配合 npm 8.19.4
   - 与项目依赖最兼容
   - 需要的解决方案最少
   - 性能稳定

2. **安装命令**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **开发命令**:
   ```bash
   # 对于 Node.js v16
   npm run dev
   
   # 对于 Node.js v18 或 v20
   NODE_OPTIONS=--openssl-legacy-provider npm run dev
   或者 npm run dev:18
   ```

4. **生产构建命令**:
   ```bash
   # 对于 Node.js v16
   npm run build
   
   # 对于 Node.js v18 或 v20
   NODE_OPTIONS=--openssl-legacy-provider npm run build
   或者 npm run dev:18
   ```

## 未来考虑

1. 更新依赖以兼容较新的 Node.js 版本
2. 解决对等依赖冲突
3. 更新 package.json 以指定推荐的 Node.js 版本范围


### Customize configuration
详情点击 [https://cli.vuejs.org/zn/config/](https://cli.vuejs.org/zn/config/).

####  login.vue页面，测试时不走权限，直接return  318行
####  util.initRouter 方法，开发时注释掉登录验证，调用路由接口验证
####  Main.vue 页面，241行，修改，避免报错

#### main-components  头部，左侧所有内容

#### lili-floor-renovation  楼层装修模块
     
