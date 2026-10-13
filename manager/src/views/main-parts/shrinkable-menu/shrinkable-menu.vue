<template>
  <div class="shrinkable-menu" :class="{ 'no-sub-menu': !menuList.length }">
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
      v-if="menuList.length"
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

<script setup>
import { computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { setStore } from "@/libs/storage";
import { Message } from "@/utils/message";
import util from "@/libs/util.js";

defineOptions({ name: "shrinkableMenu" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const menuList = computed(() => appStore.menuList);
const navList = computed(() => appStore.navList);
const currNav = computed(() => appStore.currNav);
const activeMenuName = computed(() => {
  const routePath = util.normalizeRoutePath(route.path);
  for (const item of menuList.value) {
    for (const menu of item.children || []) {
      const menuPath = util.normalizeRoutePath(menu.path);
      if (menu.name === route.name || (menuPath && menuPath === routePath)) {
        return menu.name;
      }
    }
  }
  return route.name;
});

watch(
  () => route.fullPath,
  () => {
    if (
      route.meta.firstRouterName &&
      route.meta.firstRouterName !== currNav.value
    ) {
      selectNav(route.meta.firstRouterName);
    }
  }
);

const changeMenu = (name) => {
  if (!name) return;
  if (router.hasRoute(name)) {
    router.push({ name });
    return;
  }
  const menu = findMenuByName(name);
  if (menu?.path) {
    const path = menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
    router.push({ path });
    return;
  }
  util.initRouter();
  nextTick(() => {
    if (router.hasRoute(name)) {
      router.push({ name });
    } else {
      Message.warning("菜单路由未就绪，请刷新页面后重试");
    }
  });
};

const findMenuByName = (name) => {
  for (const item of menuList.value) {
    for (const menu of item.children || []) {
      if (menu.name === name) {
        return menu;
      }
    }
  }
  return null;
};

const selectNav = (name) => {
  appStore.setCurrNav(name);
  setStore("currNav", name);
  if (name === 'home_index') {
    appStore.updateMenulist([]);
    router.push({ name: 'home_index' });
    return;
  }
  util.initRouter();
};
</script>

<style lang="scss" scoped>
.shrinkable-menu {
  height: 100%;
  width: 200px;
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
