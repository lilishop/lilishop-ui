<template>
  <div class="shrinkable-menu" :class="{ 'no-sub-menu': !menuList.length }">
    <el-menu
      ref="sideMenu"
      class="nav-menu-dark"
      :default-active="currNav"
      @select="selectNav"
    >
      <el-menu-item v-for="(item, i) in navList" :key="i" :index="item.name">
        {{ item.title }}
      </el-menu-item>
    </el-menu>
    <el-menu
      v-if="menuList.length"
      ref="childrenMenu"
      :key="currNav"
      class="sub-menu"
      :default-active="$route.name"
      @select="changeMenu"
    >
      <template v-for="item in menuList" :key="item.id">
        <el-menu-item-group :title="item.title">
          <el-menu-item
            v-for="menu in item.children"
            :key="menu.name"
            :index="menu.name"
          >
            {{ menu.title }}
          </el-menu-item>
        </el-menu-item-group>
      </template>
    </el-menu>
  </div>
</template>

<script>
import util, { HOME_NAV_NAME, HOME_NAV_ITEM } from "@/libs/util.js";

export default {
  name: "shrinkableMenu",
  computed: {
    menuList() {
      return this.$store.state.app.menuList;
    },
    navList() {
      return this.$store.state.app.navList;
    },
    currNav() {
      return this.$store.state.app.currNav;
    },
  },
  watch: {
    $route(val) {
      this.syncRouteMenu(val);
    },
  },
  methods: {
    syncRouteMenu(route) {
      if (!route?.name) {
        return;
      }
      if (route.name === "home_index") {
        this.activateHomeNav();
        return;
      }
      const firstRouterName =
        route.meta?.firstRouterName || util.getFirstRouterName(route.name);
      if (firstRouterName && firstRouterName !== this.currNav) {
        this.selectNav(firstRouterName);
      }
    },
    activateHomeNav() {
      this.$store.commit("setCurrNav", HOME_NAV_NAME);
      this.$store.commit("setCurrNavTitle", HOME_NAV_ITEM.title);
      this.setStore("currNav", HOME_NAV_NAME);
      this.$store.commit("updateMenulist", []);
    },
    changeMenu(name) {
      if (!name) return;
      this.$router.push({ name });
    },
    selectNav(name) {
      this.$store.commit("childrenMenu", this.$refs.childrenMenu);
      this.$store.commit("setCurrNav", name);
      this.setStore("currNav", name);
      if (name === HOME_NAV_NAME) {
        this.$store.commit("updateMenulist", []);
        this.$store.commit("setCurrNavTitle", HOME_NAV_ITEM.title);
        if (this.$route.name !== "home_index") {
          this.$router.push({ name: "home_index" });
        }
        return;
      }
      util.initRouter(this);
    },
  },
  mounted() {
    this.syncRouteMenu(this.$route);
  },
};
</script>

<style lang="scss" scoped>
.shrinkable-menu {
  height: calc(100% - 60px);
  width: 180px;
  display: flex;
  transition: width 0.3s;

  &.no-sub-menu {
    width: 80px;
  }
}

.nav-menu-dark {
  width: 80px;
  background-color: #191a23;
  border-right: none;
  overflow-y: auto;

  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.7);
    justify-content: center;
    padding: 0 8px !important;
    text-align: center;
    line-height: 1.3;
    height: auto;
    min-height: 56px;
    white-space: normal;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  :deep(.el-menu-item:not(.is-active):hover),
  :deep(.el-menu-item:not(.is-active):focus) {
    background-color: #43444d !important;
    color: #fff !important;
  }

  :deep(.el-menu-item.is-active) {
    background-color: #fff !important;
    color: var(--el-color-primary) !important;
  }

  :deep(.el-menu-item.is-active:hover),
  :deep(.el-menu-item.is-active:focus) {
    background-color: #fff !important;
    color: var(--el-color-primary) !important;
  }
}

.sub-menu {
  width: 100px;
  overflow-y: auto;
  border-right: none;

  :deep(.el-menu-item-group__title) {
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
  }
}
</style>
