<style lang="scss" scoped>
@import "./styles/menu.scss";
</style>
<template>
  <div class="ivu-shrinkable-menu">
    <!-- 一级菜单 -->
    <Menu ref="sideMenu" width="80px" theme="dark"  :active-name="currNav" @on-select="selectNav">
      <MenuItem v-for="(item, i) in navList" :key="i" :name="item.name">
        {{item.title}}
      </MenuItem>
    </Menu>
    <!-- 二级菜单 -->
    <Menu
      ref="childrenMenu"
      :active-name="$route.name"
      width="100px"
      @on-select="changeMenu"
    >
      <template v-for="item in menuList">
        <MenuGroup :title="item.title" :key="item.id" style="padding-left:0;">
          <MenuItem :name="menu.name" v-for="menu in item.children" :key="menu.name">
            {{menu.title}}
          </MenuItem>
        </MenuGroup>

      </template>
    </Menu>
  </div>
</template>

<script>
import util from "@/libs/util.js";
export default {
  name: "shrinkableMenu",
  computed: {
    // 二级菜单列表
    menuList() {
      return this.$store.state.app.menuList;
    },
    // 一级菜单
    navList() {
      return this.$store.state.app.navList;
    },
    // 当前一级菜单
    currNav() {
      return this.$store.state.app.currNav;
    }
  },
  methods: {
    changeMenu(name) { //二级路由点击
      this.$router.push({
        name: name
      });
    },
    selectNav(name) { // 一级路由点击
      this.$store.commit("setCurrNav", name);
      this.setStore("currNav", name);
      util.initRouter(this);
    },
  }
};
</script>
