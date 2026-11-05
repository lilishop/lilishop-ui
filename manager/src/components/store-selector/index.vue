<template>
  <component :is="embedded ? 'div' : ElDrawer" v-bind="embedded ? {} : { modelValue: visible, title, size, direction: 'rtl', appendToBody: true, destroyOnClose: true }" :class="embedded ? 'store-selector-inline' : 'store-picker-drawer'" @update:model-value="visible = $event" @close="request++">
    <el-form class="picker-search" inline @submit.prevent="search">
      <el-form-item label="店铺名称"><el-input v-model="keyword" clearable placeholder="请输入店铺名称" /></el-form-item>
      <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="reset">重置</el-button></el-form-item>
    </el-form>
    <div class="picker-content">
      <div class="picker-results">
        <el-alert v-if="error" title="加载失败，请重试" type="error" :closable="false"><el-button link type="primary" @click="load">重新加载</el-button></el-alert>
        <el-table ref="table" v-loading="loading" :data="rows" row-key="id" border :height="tableHeight || (embedded ? '340px' : 'max(300px, calc(100vh - 270px))')" :empty-text="error ? '加载失败' : '暂无匹配结果'" @select="selectStore" @select-all="selectPage" @row-click="toggleStore">
          <el-table-column v-if="multiple" type="selection" :reserve-selection="false" width="48" align="center" />
          <el-table-column v-else label="选择" width="60" align="center"><template #default="{row}"><el-radio :model-value="selectedStores[0]?.id" :value="row.id" :aria-label="'选择' + row.storeName" @click.stop @change="chooseSingle(row)" /></template></el-table-column>
            <el-table-column label="店铺信息" min-width="265"><template #default="{row}"><div class="store-info"><el-avatar :size="40" shape="square" :src="row.storeLogo || ''">店</el-avatar><div class="store-copy"><div class="store-name" :title="row.storeName">{{ row.storeName || '未命名店铺' }}</div><div class="store-id">ID：{{ row.id }}</div></div></div></template></el-table-column>
            <el-table-column label="店铺类型" width="96" align="center"><template #default="{row}">{{ selfOperated(row) ? '自营' : '非自营' }}</template></el-table-column>
            <el-table-column label="状态" width="100" align="center"><template #default="{row}">{{ storeStatus(row.storeDisable) }}</template></el-table-column>
        </el-table>
        <el-pagination v-model:current-page="page" :total="total" :page-size="10" layout="total, prev, pager, next" @current-change="load" />
      </div>
    </div>
    <template v-if="!embedded" #footer><div class="picker-footer"><span class="selected-count">已选择 <b>{{ selectedStores.length }}</b> 家店铺</span><div><el-button @click="visible = false">取消</el-button><el-button type="primary" :disabled="loading" @click="confirm">确定</el-button></div></div></template>
  </component>
</template>
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { ElDrawer } from 'element-plus';
import { getShopListData } from '@/api/shops';
// Author: Bulbasaur; 2026-11-05.
const props = defineProps({
  multiple: { type: Boolean, default: true },
  embedded: { type: Boolean, default: false },
  selectedWay: { type: Array, default: () => [] },
  queryParams: { type: Object, default: () => ({}) },
  title: { type: String, default: '选择店铺' },
  size: { type: [String, Number], default: '1080px' },
  tableHeight: { type: String, default: '' },
});
const emit = defineEmits(['selected']);
const visible = ref(false), keyword = ref(''), rows = ref([]), total = ref(0), page = ref(1), loading = ref(false), error = ref(false), table = ref();
const storeSelection = ref({});
const selectedStores = computed(() => Object.values(storeSelection.value));
let request = 0;
const selfOperated = row => [true, 1, 'true', '1'].includes(row.selfOperated);
const storeStatus = value => ({OPEN:'营业中',CLOSED:'已关闭',APPLY:'待审核',APPLYING:'待审核',REFUSED:'审核拒绝',EXPIRED:'已过期'}[value] || value || '—');
async function syncStores() {
  await nextTick();
  if (!table.value) return;
  table.value.clearSelection();
  rows.value.forEach(row => { if (storeSelection.value[String(row.id)]) table.value.toggleRowSelection(row, true); });
}
function notifyEmbedded() { if (props.embedded) emit('selected', selectedStores.value.map(row => ({...row}))); }
function chooseSingle(row) { storeSelection.value = { [String(row.id)]: {...row} }; notifyEmbedded(); }
function selectStore(selected, row) {
  const key = String(row.id);
  if (selected.some(item => String(item.id) === key)) storeSelection.value[key] = row;
  else delete storeSelection.value[key];
  notifyEmbedded();
}
function selectPage(selected) {
  const ids = new Set(selected.map(row => String(row.id)));
  rows.value.forEach(row => { if (ids.has(String(row.id))) storeSelection.value[String(row.id)] = row; else delete storeSelection.value[String(row.id)]; });
  notifyEmbedded();
}
function toggleStore(row, column) {
  if (column?.type === 'selection') return;
  if (!props.multiple) { chooseSingle(row); return; }
  const key = String(row.id);
  if (storeSelection.value[key]) delete storeSelection.value[key]; else storeSelection.value[key] = row;
  syncStores();
  notifyEmbedded();
}
async function load() {
  const id = ++request; loading.value = true; error.value = false;
  try {
    const res = await getShopListData({ ...props.queryParams, pageNumber: page.value, pageSize: 10, storeName: keyword.value.trim() });
    if (id !== request || !visible.value) return;
    if (!res.success) throw new Error('load');
    rows.value = res.result.records || []; total.value = res.result.total || 0;
    rows.value.forEach(row => { if (storeSelection.value[String(row.id)]) storeSelection.value[String(row.id)] = row; });
    await syncStores();
  } catch { if (id === request) { error.value = true; rows.value = []; total.value = 0; } }
  finally { if (id === request) loading.value = false; }
}
function search() { page.value = 1; load(); }
function reset() { keyword.value = ''; search(); }
async function open(selected = props.selectedWay) {
  request++; keyword.value = ''; rows.value = []; total.value = 0; page.value = 1; error.value = false;
  setSelection(selected);
  visible.value = true;
  await nextTick(); table.value?.clearSelection();
  await load();
}
function setSelection(selected) {
  const valid = (Array.isArray(selected) ? selected : []).filter(row => row && row.id != null);
  storeSelection.value = Object.fromEntries((props.multiple ? valid : valid.slice(0,1)).map(row => [String(row.id), {...row}]));
}
function confirm() { emit('selected', selectedStores.value.map(row => ({...row}))); visible.value = false; }
watch(() => props.selectedWay, selected => { if (props.embedded) { setSelection(selected); syncStores(); } }, { deep: true });
watch(() => props.queryParams, () => { if (visible.value) search(); }, { deep: true });
onMounted(() => { if (props.embedded) open(); });
defineExpose({ open });
</script>
<style scoped>
:global(.store-picker-drawer) { max-width: 100vw; }
:global(.store-picker-drawer .el-drawer__header) { margin-bottom: 0; padding: 20px; border-bottom: 1px solid #ebeef5; }
:global(.store-picker-drawer .el-drawer__body) { padding: 20px; }
:global(.store-picker-drawer .el-drawer__footer) { padding: 0 20px 20px; }
.picker-search { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px 18px 0; margin-bottom: 18px; background: #f7f8fa; border-radius: 6px; }
.picker-search .el-form-item { margin-right: 0; margin-bottom: 16px; }.picker-search .el-input { width: 240px; }
.picker-content { min-width: 0; }.picker-results { min-width: 0; }
.el-pagination { margin-top: 18px; }.store-info { display: flex; align-items: center; gap: 12px; min-height: 50px; }.el-avatar { flex-shrink: 0; background: #edf2f8; color: #7b8da6; }
.store-copy { min-width: 0; flex: 1; }.store-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; color: #303133; }.store-id { margin-top: 3px; font-size: 12px; color: #909399; overflow-wrap: anywhere; }
.selected-count b { color: var(--el-color-primary); }
.picker-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ebeef5; padding-top: 16px; }.selected-count { color: #909399; }
@media(max-width: 800px) { .picker-search .el-input { width: 180px; } }
</style>
