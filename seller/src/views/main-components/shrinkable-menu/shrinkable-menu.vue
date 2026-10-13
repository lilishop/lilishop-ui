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

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import util, { HOME_NAV_NAME, HOME_NAV_ITEM } from "@/libs/util.js";
import { setStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "shrinkableMenu" });

const appStore = useAppStore();
const route = useRoute();
const router = useRouter();

const childrenMenu = ref(null);

const menuList = computed(() => appStore.menuList);
const navList = computed(() => appStore.navList);
const currNav = computed(() => appStore.currNav);

watch(
  () => route.name,
  () => {
    syncRouteMenu(route);
  }
);

function syncRouteMenu(route) {
  if (!route?.name) {
    return;
  }
  if (route.name === "home_index") {
    activateHomeNav();
    return;
  }
  const firstRouterName =
    route.meta?.firstRouterName || util.getFirstRouterName(route.name);
  if (firstRouterName && firstRouterName !== currNav.value) {
    selectNav(firstRouterName);
  }
}

function activateHomeNav() {
  appStore.setCurrNav(HOME_NAV_NAME);
  appStore.setCurrNavTitle(HOME_NAV_ITEM.title);
  setStore("currNav", HOME_NAV_NAME);
  appStore.updateMenulist([]);
}

function changeMenu(name) {
  if (!name) return;
  router.push({ name });
}

function selectNav(name) {
  appStore.childrenMenu(childrenMenu.value);
  appStore.setCurrNav(name);
  setStore("currNav", name);
  if (name === HOME_NAV_NAME) {
    appStore.updateMenulist([]);
    appStore.setCurrNavTitle(HOME_NAV_ITEM.title);
    if (route.name !== "home_index") {
      router.push({ name: "home_index" });
    }
    return;
  }
  util.initRouter();
}

onMounted(() => {
  syncRouteMenu(route);
});
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
