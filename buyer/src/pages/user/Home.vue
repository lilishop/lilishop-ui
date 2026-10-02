<template>
  <div class="user-home-page">
    <BaseHeader></BaseHeader>

    <div class="container width_1200">
      <div class="layoutAll">
        <el-aside class="side-bar" width="200px">
          <el-menu
            class="side-menu"
            :default-active="$route.name"
            :default-openeds="['订单中心', '会员中心']"
            @select="onSelect"
          >
            <div class="user-icon">
              <div class="user-img">
                <img
                  :src="userInfo.face"
                  style="width: 100%; height: 100%"
                  v-if="userInfo.face"
                  alt
                />
                <el-avatar v-else :size="96" class="mb_10"><el-icon><User /></el-icon></el-avatar>
              </div>
              <p>{{ userInfo.nickName }}</p>
            </div>

            <el-menu-item index="UserCenter">
              <el-icon><House /></el-icon>
              <span>我的主页</span>
            </el-menu-item>
            <template v-for="(menu, index) in menuList" :key="index">
              <el-sub-menu v-if="menu.display" :index="menu.title">
                <template #title>
                  <el-icon><component :is="menuIcon(menu.icon)" /></el-icon>
                  <span>{{ menu.title }}</span>
                </template>
                <el-menu-item
                  v-for="(chlidren, i) in menu.menus"
                  :key="i"
                  :index="chlidren.path"
                >
                  <el-icon><component :is="menuIcon(chlidren.icon)" /></el-icon>
                  <span>{{ chlidren.title }}</span>
                  <span v-if="chlidren.path === 'MsgList' && unreadMsg > 0" class="menu-badge">{{ unreadLabel }}</span>
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </el-aside>
        <el-main class="content ml_10">
          <router-view></router-view>
        </el-main>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Bell,
  ChatDotRound,
  Clock,
  Coin,
  Goods,
  House,
  List,
  Location,
  Lock,
  Present,
  RefreshLeft,
  Star,
  Ticket,
  Trophy,
  User,
  Wallet,
  Warning,
} from '@element-plus/icons-vue';
import menuList from "./menu";
import Storage from "@/plugins/storage.js";
import { refreshUnreadMessage } from "@/utils/unreadMessage";

const MENU_ICONS = {
  Bell,
  ChatDotRound,
  Clock,
  Coin,
  Goods,
  House,
  List,
  Location,
  Lock,
  Present,
  RefreshLeft,
  Star,
  Ticket,
  Trophy,
  User,
  Wallet,
  Warning,
};

export default {
  components: { House, User },
  name: "Home",
  data() {
    return {
      menuList,
    };
  },
  computed: {
    userInfo() {
      if (Storage.getItem("userInfo")) {
        return JSON.parse(Storage.getItem("userInfo"));
      }
      return {};
    },
    unreadMsg() {
      return Number(this.$store.state.unreadMsg) || 0;
    },
    unreadLabel() {
      return this.unreadMsg > 99 ? "99+" : String(this.unreadMsg);
    },
  },
  mounted() {
    document.body.classList.add("buyer-user-center");
    refreshUnreadMessage();
  },
  beforeUnmount() {
    document.body.classList.remove("buyer-user-center");
  },
  methods: {
    menuIcon(name) {
      return MENU_ICONS[name] || Goods;
    },
    onSelect(name) {
      this.$router.push({ name });
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  padding: 15px 50px;
}

.header {
  @include background_color($light_background_color);
}

.side-menu,
.side-bar,
.content {
  @include white_background_color();
  @include title_color($light_title_color);
}

.side-bar {
  min-height: 600px;
  height: auto;
}

.layoutAll {
  display: flex;
  min-height: 1200px;
  @include background_color($light_background_color);
}

.container {
  margin: 0 auto;
  padding: 20px 0;
}

.side-bar a {
  @include title_color($light_title_color);
}

.user-icon {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.user-img {
  margin-bottom: 15px;
  width: 96px;
  height: 96px;
  border-radius: 48px;
  overflow: hidden;
}

.side-menu {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    display: flex;
    align-items: center;
  }

  :deep(.el-menu-item .el-icon),
  :deep(.el-sub-menu__title .el-icon) {
    margin-right: 6px;
  }
}

.menu-badge {
  margin-left: auto;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
  text-align: center;
}

/* 选中项会把文字设成主题红。角标用 span，避免 i 继承成红底红字 */
.side-menu :deep(.el-menu-item.is-active) .menu-badge {
  color: #fff;
}

.layout-footer-center {
  padding: 0px 15px;
  padding-bottom: 15px;
  text-align: center;
}
</style>

<style lang="scss">
/* 会员中心按钮统一放大一号：small→默认，默认→large，large→48px。弹窗挂到 body，靠页面 class 一起放大。 */
body.buyer-user-center {
  .user-home-page .content .el-button.el-button--small:not(.is-link):not(.is-text),
  .el-overlay .el-button.el-button--small:not(.is-link):not(.is-text) {
    height: 32px;
    padding: 8px 15px;
    font-size: var(--el-font-size-base);
    border-radius: var(--el-border-radius-base);
  }

  .user-home-page .content .el-button:not(.el-button--small):not(.el-button--large):not(.is-link):not(.is-text),
  .el-overlay .el-button:not(.el-button--small):not(.el-button--large):not(.is-link):not(.is-text) {
    height: 40px;
    padding: 12px 19px;
    font-size: var(--el-font-size-base);
    border-radius: var(--el-border-radius-base);
  }

  .user-home-page .content .el-button.el-button--large:not(.is-link):not(.is-text),
  .el-overlay .el-button.el-button--large:not(.is-link):not(.is-text) {
    --el-button-size: 48px;
    height: var(--el-button-size);
    padding: 16px 23px;
    font-size: var(--el-font-size-base);
    border-radius: var(--el-border-radius-base);
  }

  .user-home-page .content .el-button.is-link.el-button--small,
  .el-overlay .el-button.is-link.el-button--small {
    font-size: var(--el-font-size-base);
  }
}
</style>
