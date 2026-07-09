<template>
  <div class="shrinkable-menu">
    <el-menu
      class="nav-menu-dark"
      :default-active="currNav"
      @select="selectNav"
    >
      <el-menu-item v-for="(item, i) in navList" :key="i" :index="item.name">
        {{ item.title }}
      </el-menu-item>
    </el-menu>
    <el-menu
      :key="`${currNav}-${activeMenuName}`"
      class="sub-menu"
      :default-active="activeMenuName"
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
import util from "@/libs/util.js";

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
    activeMenuName() {
      const route = this.$route;
      const routePath = util.normalizeRoutePath(route.path);
      for (const item of this.menuList) {
        for (const menu of item.children || []) {
          const menuPath = util.normalizeRoutePath(menu.path);
          if (menu.name === route.name || (menuPath && menuPath === routePath)) {
            return menu.name;
          }
        }
      }
      return route.name;
    },
  },
  watch: {
    $route(val) {
      if (
        val.meta.firstRouterName &&
        val.meta.firstRouterName !== this.currNav
      ) {
        this.selectNav(val.meta.firstRouterName);
      }
    },
  },
  methods: {
    changeMenu(name) {
      if (!name) return;
      if (this.$router.hasRoute(name)) {
        this.$router.push({ name });
        return;
      }
      const menu = this.findMenuByName(name);
      if (menu?.path) {
        const path = menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
        this.$router.push({ path });
        return;
      }
      util.initRouter(this);
      this.$nextTick(() => {
        if (this.$router.hasRoute(name)) {
          this.$router.push({ name });
        } else {
          this.$Message.warning("菜单路由未就绪，请刷新页面后重试");
        }
      });
    },
    findMenuByName(name) {
      for (const item of this.menuList) {
        for (const menu of item.children || []) {
          if (menu.name === name) {
            return menu;
          }
        }
      }
      return null;
    },
    selectNav(name) {
      this.$store.commit("setCurrNav", name);
      this.setStore("currNav", name);
      util.initRouter(this);
    },
  },
};
</script>

<style lang="scss" scoped>
.shrinkable-menu {
  height: 100%;
  width: 200px;
  display: flex;
}

.nav-menu-dark {
  width: 80px;
  background-color: #191a23;
  border-right: none;

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
  width: 120px;
  overflow-y: auto;
  border-right: none;

  :deep(.el-menu-item-group__title) {
    padding-left: 16px;
    line-height: 40px;
  }
}
</style>
