<template>
  <div class="shrinkable-menu">
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
      this.$router.push({ name });
    },
    selectNav(name) {
      this.$store.commit("childrenMenu", this.$refs.childrenMenu);
      this.$store.commit("setCurrNav", name);
      this.setStore("currNav", name);
      util.initRouter(this);
    },
  },
};
</script>

<style lang="scss" scoped>
.shrinkable-menu {
  height: calc(100% - 60px);
  width: 180px;
  display: flex;
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
  }

  :deep(.el-menu-item.is-active) {
    background-color: #fff !important;
    color: $theme_color !important;
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
