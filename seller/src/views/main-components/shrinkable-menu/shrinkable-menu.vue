<!--
  商家单侧栏导航：栏目纵向展开，功能入口按两列排列，沿用当前账号权限与路由定位。
  @author Bulbasaur
  @since 2026-11-08
-->
<template>
  <nav class="seller-navigation" aria-label="商家功能菜单">
    <button type="button" class="nav-heading home-link" :class="{ 'is-active': route.name === 'home_index' }"
      :aria-current="route.name === 'home_index' ? 'page' : undefined" @click="router.push({ name: 'home_index' })">
      <el-icon :size="20"><House /></el-icon><span>首页</span>
    </button>
    <section v-for="section in sections" :key="section.name" class="nav-section">
      <button type="button" class="nav-heading" :class="{ 'is-current': activeItem?.topName === section.name }"
        :aria-label="section.title" :aria-expanded="!closedSections.includes(section.name)"
        :aria-controls="`seller-nav-${section.name}`" @click="toggleSection(section.name)">
        <el-icon :size="19"><component :is="navIcon(section)" /></el-icon>
        <span>{{ section.title }}</span>
        <el-icon class="section-arrow" :class="{ 'is-open': !closedSections.includes(section.name) }" :size="14"><ArrowDown /></el-icon>
      </button>
      <div v-show="!closedSections.includes(section.name)" :id="`seller-nav-${section.name}`" class="nav-grid">
        <button v-for="menu in section.items" :key="menu.name" type="button" class="nav-link"
          :class="{ 'is-active': activeItem?.name === menu.name }"
          :aria-current="activeItem?.name === menu.name ? 'page' : undefined"
          :title="`${menu.groupTitle} / ${menu.title}`" @click="router.push({ name: menu.name })">
          {{ menu.title }}
        </button>
      </div>
    </section>
  </nav>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { House, Goods, Tickets, Wallet, Present, TrendCharts, Shop, Bell, Grid, ArrowDown, User, Box } from "@element-plus/icons-vue";
import { HOME_NAV_NAME } from "@/libs/util.js";
import { flattenNavigation, findNavigationItem } from "@/libs/seller-navigation";
import { setStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "shrinkableMenu" });
const appStore = useAppStore();
const route = useRoute();
const router = useRouter();
const closedSections = ref([]);
const allItems = computed(() => flattenNavigation(appStore.navigationMenus).filter((item) => router.hasRoute(item.name)));
const activeItem = computed(() => findNavigationItem(allItems.value, route.name, route.query));
const sections = computed(() => appStore.navigationMenus.map((top) => ({
  ...top, items: allItems.value.filter((item) => item.topName === top.name),
})).filter((top) => top.items.length));

/** 使用业务栏目图标，新增的未知栏目显示通用图标。 */
function navIcon(item) {
  return ({ 商品: Goods, 订单: Tickets, 财务: Wallet, 营销: Present, 统计: TrendCharts,
    数据: TrendCharts, 设置: Shop, 店铺: Shop, 消息: Bell, 会员: User, 采购: Box })[item.title] || Grid;
}

/** 各栏目独立展开收起，可同时查看多个栏目的功能，不改变当前业务页面。 */
function toggleSection(name) {
  closedSections.value = closedSections.value.includes(name)
    ? closedSections.value.filter((item) => item !== name) : [...closedSections.value, name];
}

/** 刷新、搜索和详情跳转后展开所属栏目；仅定位授权入口，不改变菜单顺序和权限。 */
async function syncRouteMenu() {
  const name = activeItem.value?.topName || HOME_NAV_NAME;
  appStore.setCurrNav(name);
  appStore.updateMenulist(appStore.navigationMenus.find((top) => top.name === name)?.children || []);
  setStore("currNav", name);
  closedSections.value = closedSections.value.filter((item) => item !== name);
  await nextTick();
  document.querySelector('.seller-navigation .nav-link.is-active')?.scrollIntoView({ block: "nearest" });
}

watch(() => appStore.navigationMenus, () => { closedSections.value = []; });
watch([() => route.fullPath, () => appStore.navigationMenus], syncRouteMenu, { immediate: true });
</script>

<style lang="scss" scoped>
// 隐藏滚动条但保留滚轮、触控和键盘滚动，确保下方栏目仍可访问。
.seller-navigation { height: 100%; box-sizing: border-box; padding: 18px 14px 32px; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; background: #fff;
  &::-webkit-scrollbar { display: none; width: 0; height: 0; }
}
.nav-heading { width: 100%; display: flex; align-items: center; gap: 13px; min-height: 46px; padding: 11px 14px; border: 0; border-radius: 6px; background: transparent; color: #242832; text-align: left; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
  &:hover { background: #f7f8fc; }
  &:focus-visible { outline: 2px solid #315efb; outline-offset: -2px; }
  &.is-active { color: #315efb; background: #f0f4ff; }
}
.home-link { margin-bottom: 16px; }
.nav-section { margin-bottom: 22px; }
.section-arrow { margin-left: auto; color: #b8bdc7; transition: transform .15s; &.is-open { transform: rotate(180deg); } }
.nav-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 8px; padding: 2px 5px 0 43px; }
.nav-link { min-width: 0; min-height: 36px; padding: 7px 5px; border: 0; border-radius: 5px; background: transparent; color: #62666f; text-align: left; font: inherit; font-size: 13px; line-height: 22px; overflow-wrap: anywhere; cursor: pointer;
  &:hover { background: #f5f7fc; color: #315efb; }
  &:focus-visible { outline: 2px solid #315efb; outline-offset: -2px; }
  &.is-active { color: #315efb; background: #eef3ff; font-weight: 600; }
}
@media (prefers-reduced-motion: reduce) { .section-arrow { transition: none; } }
</style>
