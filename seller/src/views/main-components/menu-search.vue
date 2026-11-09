<!--
  商家功能搜索：仅检索当前账号已授权且已注册的菜单，支持键盘选择。
  @author Bulbasaur
  @since 2026-11-08
-->
<template>
  <button type="button" class="menu-search-trigger" aria-label="搜索功能菜单" @click="openSearch">
    <el-icon :size="17"><Search /></el-icon><span>搜索功能菜单</span><kbd>/</kbd>
  </button>
  <el-dialog v-model="visible" class="seller-menu-search" title="搜索功能" width="560px" align-center
    @opened="focusInput" @closed="keyword = ''">
    <el-input ref="inputRef" v-model="keyword" placeholder="搜索菜单，例如：商品、订单、优惠券" size="large" clearable
      aria-label="搜索菜单" @keydown.down.prevent="moveSelection(1)" @keydown.up.prevent="moveSelection(-1)"
      @keydown.enter.prevent="navigate(results[selected])">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>
    <div class="search-summary">{{ keyword.trim() ? `找到 ${results.length} 个功能` : '全部可用功能' }}</div>
    <div ref="resultsRef" class="search-results">
      <button v-for="(item, index) in results" :key="`${item.topName}-${item.name}`" type="button"
        class="search-result" :class="{ selected: selected === index }" @click="navigate(item)" @mouseenter="selected = index">
        <div><strong>{{ item.title }}</strong><span>{{ item.topTitle }} / {{ item.groupTitle }}</span></div>
        <el-icon><ArrowRight /></el-icon>
      </button>
      <el-empty v-if="!results.length" :image-size="72" description="没有匹配的功能，试试其他关键词" />
    </div>
    <template #footer><div class="search-help"><span>↑ ↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></div></template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Search, ArrowRight } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { flattenNavigation, searchNavigation } from "@/libs/seller-navigation";

const router = useRouter();
const appStore = useAppStore();
const visible = ref(false);
const keyword = ref("");
const selected = ref(0);
const inputRef = ref(null);
const resultsRef = ref(null);
const items = computed(() => flattenNavigation(appStore.navigationMenus).filter((item) => router.hasRoute(item.name)));
const results = computed(() => searchNavigation(items.value, keyword.value));

/** 每次打开清空上次关键词，避免残留搜索状态。 */
function openSearch() { keyword.value = ""; selected.value = 0; visible.value = true; }
/** 等弹层完成动画后聚焦输入框。 */
function focusInput() { inputRef.value?.focus(); }
/** 键盘移动候选项并滚动到可见区域；空列表不产生无效索引。 */
async function moveSelection(step) {
  if (!results.value.length) return;
  selected.value = (selected.value + step + results.value.length) % results.value.length;
  await nextTick();
  resultsRef.value?.children[selected.value]?.scrollIntoView({ block: "nearest" });
}
/** 只允许打开当前权限搜索结果；清空关闭的弹层避免遮挡业务页面。 */
function navigate(item) {
  if (!item || !items.value.some((entry) => entry.name === item.name)) return;
  visible.value = false;
  router.push({ name: item.name });
}
/** 仅在非编辑区域按 / 唤起搜索，不截获输入框、富文本和其他弹窗内的按键。 */
function handleShortcut(event) {
  if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || visible.value ||
    event.target.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
  event.preventDefault();
  openSearch();
}
watch(results, () => { selected.value = 0; });
watch(() => appStore.navigationMenus, () => { visible.value = false; keyword.value = ""; });
onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));
</script>

<style lang="scss" scoped>
.menu-search-trigger { width: 240px; height: 34px; display: flex; align-items: center; gap: 9px; padding: 0 12px; border: 1px solid #eceef3; border-radius: 7px; background: #f7f8fb; color: #969cab; font: inherit; font-size: 12px; cursor: pointer;
  &:hover { border-color: #c5d2ff; color: #315efb; }
  &:focus-visible { outline: 2px solid #315efb; }
  kbd { margin-left: auto; padding: 0 5px; border: 1px solid #e0e4ed; border-radius: 3px; background: #fff; font-family: inherit; }
}
.search-summary { padding: 18px 2px 8px; font-size: 12px; color: #969cab; }
.search-results { max-height: 380px; overflow-y: auto; }
.search-result { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px; margin: 3px 0; border: 0; border-radius: 7px; background: #fff; text-align: left; cursor: pointer; color: #858c9c;
  strong { display: block; font-size: 14px; font-weight: 500; color: #303749; }
  span { display: block; margin-top: 5px; font-size: 12px; }
  &.selected, &:focus-visible { background: #eef2ff; strong { color: #315efb; } }
}
.search-help { display: flex; gap: 20px; color: #969cab; font-size: 12px; }
@media (max-width: 1100px) { .menu-search-trigger { width: 180px; } }
</style>
