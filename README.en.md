<div align="center">
  <img src="./manager/src/assets/logo.png" width="180" alt="Lilishop Logo" />
  <h1>Lilishop(PickMall) - Web Frontend (Vue 3)</h1>

  <p>
    <a href="https://github.com/lilishop/lilishop"><img src="https://img.shields.io/github/stars/lilishop/lilishop.svg?style=social&logo=github" alt="GitHub Stars" /></a>
    <a href="https://gitee.com/beijing_hongye_huicheng/lilishop"><img src="https://gitee.com/beijing_hongye_huicheng/lilishop/badge/star.svg?theme=dark" alt="Gitee Stars" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-brightgreen.svg" alt="Vue 3" /></a>
    <a href="https://element-plus.org/"><img src="https://img.shields.io/badge/Element%20Plus-2.x-409EFF.svg" alt="Element Plus" /></a>
    <a href="https://pinia.vuejs.org/"><img src="https://img.shields.io/badge/Pinia-4.x-yellow.svg" alt="Pinia" /></a>
  </p>

  <p>
    <a href="https://pickmall.cn">🏠 Official Website</a> ·
    <a href="https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home">📖 Product Documentation</a> ·
    <a href="#2-online-demo">💻 Online Demo</a> ·
    <a href="https://github.com/lilishop/lilishop">💻 GitHub</a>
  </p>

  <p>
    <a href="./README.md">简体中文</a> | <b>English</b>
  </p>
</div>

> ⭐ **If you like this project, please click `Star` in the top-right corner to support us! Your Star is our greatest motivation for continuous open-source iteration!**

**LILISHOP** is an open-source e-commerce system built with Spring Boot, Vue 3, and uni-app. It supports B2B2C multi-vendor marketplaces, WeChat Mini Programs, H5, Android/iOS Apps, live-streaming e-commerce, affiliate distribution, and flash sales.

### ✨ Why Choose Lilishop
- 🟢 **True MIT License**: Free for commercial use and private secondary development without licensing concerns.
- 🚀 **Modern Vue 3 Stack**: Built on `Vue 3.5 + Pinia 4 + Vue Router 4 + Element Plus`, leaving legacy Vue 2 templates behind.
- 🧩 **4-in-1 Production Suite**: Covers **PC Buyer Mall (`buyer`)**, **Seller Portal (`seller`)**, **Platform Admin Panel (`manager`)**, and **IM Customer Service Web (`im`)**, complete with drag-and-drop visual storefront decoration and rich analytics.

---

## 1. Overview

This repository (`lilishop-ui`) is the **Web Frontend Suite** of Lilishop, containing four standalone **Vue 3** web applications: **PC Buyer Mall, Seller Panel, Platform Admin Panel, and IM Customer Service Web**.

- **Official Website**: <https://pickmall.cn>
- **Documentation**: [Product Documentation](https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)
- **Gitee Repository**: <https://gitee.com/beijing_hongye_huicheng>
- **GitHub Main Repository**: <https://github.com/lilishop/lilishop>

---

## 2. Online Demo

> **Note**: The verification code for the demo environment is `111111`.

| Portal | URL | Demo Credentials |
| :--- | :--- | :--- |
| **Platform Admin Panel (`manager`)** | <https://admin-b2b2c.pickmall.cn> | `admin` / `123456` |
| **Seller / Store Panel (`seller`)** | <https://store-b2b2c.pickmall.cn> | `13011111111` / `111111` |
| **PC Buyer Mall (`buyer`)** | <https://pc-b2b2c.pickmall.cn> | SMS code: `111111` |
| **Mobile H5 (`uni-app`)** | <https://m-b2b2c.pickmall.cn> | SMS code: `111111` |

| WeChat Mini Program | Mobile H5 ([Visit Directly](https://m-b2b2c.pickmall.cn)) |
| :---: | :---: |
| <img src="https://static.pickmall.cn/images/h5-qrcode.png" width="180" alt="WeChat Mini Program QR Code" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/h5-qrcode.png" width="180" alt="Mobile H5 QR Code" /> |
| Scan with WeChat | Scan or visit <https://m-b2b2c.pickmall.cn> |

---

## 3. Core Features & Tech Stack

### Core Features
- **Four-Portal Synergy**: Includes Platform Admin, Seller Panel, PC Buyer Mall, and IM Web Workbench with clear role boundaries.
- **Drag-and-Drop Visual Decoration**: Built-in visual floor editor (`vuedraggable`) for customizing both PC and mobile storefronts.
- **Multi-Vendor B2B2C Operations**: Merchant onboarding, product auditing, split-order fulfillment, promotions, and financial settlement ledgers.
- **Rich Business Analytics**: Powered by `@antv/g2` for sales overview, YoY/MoM product reports, member analytics, and distribution metrics.
- **IM Customer Service**: Integrated with Tencent Cloud IM / WebSocket customer service for real-time communication.

### Web Tech Stack
| Category | Technology | Description |
| :--- | :--- | :--- |
| Core Framework | `Vue 3.5` + `Vue Router 4` | Modern reactive frontend framework |
| State Management | `Pinia 4` | Official Vue 3 state management library |
| UI Library | `Element Plus 2.x` | Enterprise desktop UI component library |
| HTTP Client | `Axios 1.x` | Unified request/response interceptors & auth handling |
| Data Visualization | `@antv/g2` | Interactive charts and business analytics |
| Visual Decoration | `vuedraggable 4` | Drag-and-drop page floor builder |
| Messaging & IM | `@tencentcloud/chat` / `sockjs-client` | Real-time customer service messaging |
| Video Player | `dplayer` + `hls.js` | Product video and live streaming playback |
| Build & Styling | `Vue CLI 5` + `Webpack 5` + `Sass / Less` | Modular build pipeline and theme customization |

---

## 4. Directory Structure

```text
lilishop-ui
├── buyer/                    # [PC Buyer Mall]
│   ├── public/               # Static assets & global config (config.js)
│   └── src/
│       ├── api/              # Buyer API modules (goods, cart, order, member, promotion)
│       ├── components/       # Shared components (floor renderer, navbar, goods card)
│       ├── pages/            # PC Mall pages (Home, Product Detail, Checkout, User Center)
│       ├── router/           # Route definitions & guards
│       ├── stores/           # Pinia stores
│       └── utils/            # Request interceptors & helpers
├── seller/                   # [Seller / Store Management Portal]
│   ├── public/               # Static assets & global config
│   └── src/
│       ├── api/              # Seller API modules
│       ├── components/       # Seller shared & decoration components
│       ├── views/            # Seller views (goods, orders, after-sales, promotions, store settings)
│       ├── router/           # Dynamic permission routes
│       └── stores/           # Pinia stores
├── manager/                  # [Platform Admin Portal]
│   ├── public/               # Static assets & global config
│   └── src/
│       ├── api/              # Admin API modules
│       ├── components/       # Admin components, rich-text editor, visual floor builder
│       ├── views/            # Admin views (member, goods, order, seller, marketing, finance, stats, system)
│       ├── router/           # Menu & permission routes
│       └── stores/           # Pinia stores
├── im/                       # [IM Customer Service Web Client]
│   └── src/
│       ├── api/              # Chat session & message APIs
│       ├── components/       # Chat window, message list, product/order cards
│       ├── im-server/        # WebSocket / IM connection manager
│       └── views/            # Customer service workbench
├── build.sh                  # Unified build script
└── docker-build.sh           # Docker image build script
```

---

## 5. Related Repositories

| Repository | Description | Links |
| :--- | :--- | :--- |
| **`lilishop`** | Backend Services (Spring Boot 4 / Java 21) | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop) · [GitHub](https://github.com/lilishop/lilishop) |
| **`lilishop-ui`** | PC Mall / Seller / Admin / IM Web Frontend | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-ui) |
| **`lilishop-uniapp`** | Mobile Buyer Client (H5 / Mini Program / App) | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-uniapp) |
| **`docker`** | Docker Compose, Images & SQL Init Scripts | [Gitee](https://gitee.com/beijing_hongye_huicheng/docker) · [MySQL Scripts](https://gitee.com/beijing_hongye_huicheng/docker/tree/master/init/mysql) |

---

## 6. License

Lilishop is licensed under the [MIT](./LICENSE) License. Copyright © 2020-2026 **Beijing Hongye Huicheng Technology Co., Ltd.**
