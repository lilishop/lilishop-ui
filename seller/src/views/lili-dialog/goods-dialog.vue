<template>
  <div class="wrapper">
    <div class="wap-content">
      <div class="goods-filter-panel">
      <el-form :model="filterForm" inline label-width="72px" class="goods-filter-form" @keyup.enter="onSearchGoods">
        <el-form-item label-width="0" class="filter-row-item">
          <div class="filter-row">
            <div class="filter-row-field">
              <span class="filter-row-label">商品名称</span>
              <el-input
                v-model="filterForm.goodsName"
                placeholder="请输入商品名称"
                clearable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">SPU编码</span>
              <el-input
                v-model="filterForm.goodsId"
                placeholder="请输入SPU编码"
                clearable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">商品类型</span>
              <el-select
                v-model="filterForm.goodsType"
                placeholder="请选择"
                clearable
                class="filter-control"
                popper-class="goods-dialog-select-popper"
              >
                <el-option label="实物商品" value="PHYSICAL_GOODS" />
                <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
                <el-option label="电子卡券" value="E_COUPON" />
                <el-option label="预约商品" value="APPOINTMENT_GOODS" />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="showAdvanced" label-width="0" class="filter-row-item">
          <div class="filter-row">
            <div class="filter-row-field">
              <span class="filter-row-label">品牌</span>
              <el-select
                v-model="filterForm.brandId"
                :placeholder="filterForm.categoryPath ? '请选择品牌' : '请先选择平台类目'"
                :disabled="!filterForm.categoryPath"
                clearable
                filterable
                class="filter-control"
                popper-class="goods-dialog-select-popper"
              >
                <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">店铺分类</span>
              <el-cascader
                v-model="filterForm.storeCategoryPath"
                :options="shopCategoryList"
                :props="shopCategoryProps"
                placeholder="请选择店铺分类"
                popper-class="goods-dialog-cascader-popper"
                clearable
                filterable
                class="filter-control"
              />
            </div>
            <div class="filter-row-field">
              <span class="filter-row-label">平台类目</span>
              <el-cascader
                v-model="filterForm.categoryPath"
                :options="platformCategoryList"
                :props="platformCategoryProps"
                placeholder="请选择平台类目"
                popper-class="goods-dialog-cascader-popper"
                clearable
                filterable
                class="filter-control"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="showAdvanced" label-width="0" class="range-form-item range-filter-row-item">
          <div class="range-filter-row">
            <div class="range-group">
              <span class="filter-row-label">价格</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.priceMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.priceMax" placeholder="≤" clearable />
              </div>
            </div>
            <div class="range-group">
              <span class="filter-row-label">销量</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.salesMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.salesMax" placeholder="≤" clearable />
              </div>
            </div>
            <div class="range-group">
              <span class="filter-row-label">库存</span>
              <div class="range-group-inputs">
                <el-input v-model="filterForm.stockMin" placeholder="≥" clearable />
                <span class="range-sep">~</span>
                <el-input v-model="filterForm.stockMax" placeholder="≤" clearable />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearchGoods">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button link type="primary" @click="showAdvanced = !showAdvanced">{{ showAdvanced ? '收起筛选' : '更多筛选' }}</el-button>
        </el-form-item>
      </el-form>
      </div>

      <div ref="tableWrapRef" class="goods-table-wrap">
        <el-table
          ref="goodsTableRef"
          v-loading="loading"
          :data="goodsData"
          :height="tableHeight"
          :highlight-current-row="type !== 'multiple'"
          class="goods-sku-table"
          row-key="id"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
        >
        <el-table-column
          v-if="type === 'multiple'"
          type="selection"
          width="48"
          align="center"
          :reserve-selection="true"
        />
        <el-table-column label="商品信息" min-width="320" class-name="goods-name-column">
          <template #default="{ row }">
            <div v-if="row" class="goods-info">
              <el-image :src="row.thumbnail || row.original" fit="contain" class="goods-thumb">
                <template #error><span class="no-image">暂无图片</span></template>
              </el-image>
              <div class="goods-info-copy">
                <div class="goods-name-text">{{ row.goodsName }}</div>
                <div class="goods-code">{{ productMode ? 'SPU' : 'SKU' }}：{{ productMode ? row.id : (row.sn || row.id) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!productMode" label="规格" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row?.simpleSpecs || "-" }}
          </template>
        </el-table-column>
        <el-table-column v-if="showAdvanced" label="平台类目" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ platformCategoryText(row?.categoryPath) }}
          </template>
        </el-table-column>
        <el-table-column v-if="showAdvanced" label="品牌" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ brandText(row?.brandId) }}
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="goods-price">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="80" align="center">
          <template #default="{ row }">
            {{ row?.buyCount ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" width="80" align="center" />
        <el-table-column v-if="productMode" label="审核状态" width="100">
          <template #default="{ row }">
            <span>{{ row.authFlag === 'PASS' ? '审核通过' : row.authFlag === 'REFUSE' ? '审核拒绝' : '待审核' }}</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty v-if="!loading" description="没有符合条件的商品，请调整筛选条件" :image-size="72" />
        </template>
      </el-table>
      </div>

      <el-pagination
        v-model:current-page="goodsParams.pageNumber"
        class="pageration"
        :total="total"
        :page-size="goodsParams.pageSize"
        layout="total, prev, pager, next"
        size="small"
        @current-change="changePageSize"
      />
    </div>
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import * as API_Goods from "@/api/goods";

const defaultFilterForm = () => ({
  goodsName: "",
  goodsId: "",
  storeCategoryPath: "",
  categoryPath: "",
  goodsType: "",
  brandId: "",
  priceMin: "",
  priceMax: "",
  salesMin: "",
  salesMax: "",
  stockMin: "",
  stockMax: "",
});

const props = defineProps({
  productMode: { type: Boolean, default: false },
  marketEnable: { type: String, default: "UPPER" },
  authFlag: { type: String, default: "PASS" },
  selectedWay: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["selected"]);

const type = ref("multiple");
const showAdvanced = ref(false);
const selectedList = ref([]);
const platformCategoryList = ref([]);
const shopCategoryList = ref([]);
const brandList = ref([]);
// 静态配置对象，仅模板读取、从不修改，无需响应式
const platformCategoryProps = {
  value: "id",
  label: "name",
  children: "children",
  checkStrictly: true,
  emitPath: false,
};
const shopCategoryProps = {
  value: "value",
  label: "label",
  children: "children",
  checkStrictly: true,
  emitPath: false,
};
const filterForm = ref(defaultFilterForm());
let brandRequest = 0;
watch(() => filterForm.value.categoryPath, async (categoryId) => {
  const request = ++brandRequest;
  filterForm.value.brandId = "";
  brandList.value = [];
  if (!categoryId) return;
  try {
    const res = await API_Goods.getCategoryBrandListDataSeller(categoryId);
    if (request === brandRequest) brandList.value = Array.isArray(res) ? res : res?.result || [];
  } catch {
    // 请求失败由统一拦截器提示。
  }
});
const total = ref(0);
const goodsParams = reactive({
  pageNumber: 1,
  pageSize: 20,
  order: "desc",
  marketEnable: props.marketEnable,
  authFlag: props.authFlag,
  sort: "createTime",
});
const goodsData = ref([]);
const loading = ref(false);
const tableHeight = ref(400);
const syncingSelection = ref(false);

// 模板 ref：原名 tableWrap/goodsTable，统一改名 xxxRef 避免与变量同名互相覆盖
const tableWrapRef = ref(null);
const goodsTableRef = ref(null);

watch(
  () => props.selectedWay,
  (val) => {
    selectedList.value = Array.isArray(val) ? val.slice() : [];
    syncTableSelectionFromSelected();
  },
  { deep: true, immediate: true }
);

function calcTableHeight() {
  nextTick(() => {
    const wrap = tableWrapRef.value;
    if (wrap) {
      tableHeight.value = Math.max(wrap.clientHeight, 320);
    }
  });
}
function onSearchGoods() {
  goodsParams.pageNumber = 1;
  getQueryGoodsList();
}
function resetFilter() {
  filterForm.value = defaultFilterForm();
  onSearchGoods();
}
function syncTableSelectionFromSelected() {
  nextTick(() => {
    const ids = new Set(selectedList.value.map(item => String(item.id || item.skuId)));
    goodsData.value.forEach(item => { item.selected = ids.has(String(item.id)); });
    syncTableSelection();
  });
}
function changePageSize(v) {
  goodsParams.pageNumber = v;
  getQueryGoodsList();
}
function buildQueryParams() {
  const params = {
    ...goodsParams,
    goodsName: filterForm.value.goodsName || undefined,
    goodsId: filterForm.value.goodsId || undefined,
    goodsType: filterForm.value.goodsType || undefined,
    brandId: filterForm.value.brandId || undefined,
    storeCategoryPath: filterForm.value.storeCategoryPath || undefined,
    categoryPath: filterForm.value.categoryPath || undefined,
    geQuantity: undefined,
    leQuantity: undefined,
    geBuyCount: undefined,
    leBuyCount: undefined,
    price: undefined,
  };

  const { priceMin, priceMax, salesMin, salesMax, stockMin, stockMax } = filterForm.value;
  if (priceMin !== "" && priceMax !== "") {
    params.price = `${priceMin}_${priceMax}`;
  } else if (priceMin !== "") {
    params.price = String(priceMin);
  } else if (priceMax !== "") {
    params.price = `0_${priceMax}`;
  }

  if (stockMin !== "" && stockMin != null) params.geQuantity = Number(stockMin);
  if (stockMax !== "" && stockMax != null) params.leQuantity = Number(stockMax);
  if (salesMin !== "" && salesMin != null) params.geBuyCount = Number(salesMin);
  if (salesMax !== "" && salesMax != null) params.leBuyCount = Number(salesMax);

  return params;
}
function getQueryGoodsList() {
  loading.value = true;
  const query = props.productMode ? API_Goods.getGoodsListData : API_Goods.getGoodsSkuData;
  const params = buildQueryParams();
  if (props.productMode) {
    params.id = params.goodsId;
    delete params.goodsId;
  }
  query(params)
    .then((res) => {
      initGoods(res);
    })
    .finally(() => {
      loading.value = false;
      calcTableHeight();
    });
}
function initGoods(res) {
  const records = res?.result?.records || [];
  total.value = res?.result?.total || 0;
  const selectedIds = new Set(
    (selectedList.value || [])
      .map((e) => e.id || e.skuId)
      .filter((id) => id != null)
      .map(String)
  );
  records.forEach((item) => {
    if (props.productMode) item.goodsId = item.id;
    item.___type = "goods";
    item.selected = selectedIds.has(String(item.id));
  });
  goodsData.value = records;
  syncTableSelection();
}
function syncTableSelection() {
  nextTick(() => {
    const table = goodsTableRef.value;
    if (!table) return;
    if (type.value === "multiple") {
      // clearSelection/toggleRowSelection 都会触发 selection-change，
      // 同步期间忽略，避免把已选状态清掉
      syncingSelection.value = true;
      table.clearSelection();
      goodsData.value.forEach((row) => {
        if (row.selected) {
          table.toggleRowSelection(row, true);
        }
      });
      nextTick(() => {
        syncingSelection.value = false;
      });
      return;
    }
    const selected = goodsData.value.find((item) => item.selected);
    table.setCurrentRow(selected || null);
  });
}
function emitSelected(list) {
  selectedList.value = list;
  emit("selected", selectedList.value);
}
function handleRowClick(row) {
  if (type.value === "multiple") return;
  goodsData.value.forEach((item) => {
    item.selected = false;
  });
  row.selected = true;
  emitSelected([row]);
  goodsTableRef.value?.setCurrentRow(row);
}
function handleSelectionChange(selection) {
  if (type.value !== "multiple" || syncingSelection.value) return;
  const selectedIds = new Set(selection.map((item) => String(item.id)));
  goodsData.value.forEach((item) => {
    item.selected = selectedIds.has(String(item.id));
  });
  const currentPageIds = new Set(goodsData.value.map((item) => String(item.id)));
  const otherPages = selectedList.value.filter((item) => {
    const id = item.id || item.skuId;
    return id != null && !currentPageIds.has(String(id));
  });
  emitSelected([...otherPages, ...selection]);
}
function formatShopCategory(list) {
  return (list || []).map((item) => ({
    value: item.id,
    label: item.labelName,
    children:
      item.children && item.children.length ? formatShopCategory(item.children) : undefined,
  }));
}
function brandText(brandId) {
  if (!brandId) return "-";
  const brand = brandList.value.find((item) => String(item.id) === String(brandId));
  return brand?.name || "-";
}
function findTreeNodeLabel(tree, targetId, valueKey, labelKey) {
  for (const node of tree || []) {
    if (String(node[valueKey]) === String(targetId)) {
      return node[labelKey];
    }
    const childLabel = findTreeNodeLabel(node.children, targetId, valueKey, labelKey);
    if (childLabel) return childLabel;
  }
  return "";
}
function platformCategoryText(path) {
  if (!path) return "-";
  const ids = String(path).split(",").filter(Boolean);
  if (!ids.length) return "-";
  const targetId = ids.length >= 3 ? ids[2] : ids[ids.length - 1];
  const label = findTreeNodeLabel(platformCategoryList.value, targetId, "id", "name");
  return label || "-";
}
function init() {
  getQueryGoodsList();
  API_Goods.getCategoryTree()
    .then((res) => {
      if (res?.success) {
        platformCategoryList.value = res.result || [];
      }
    })
    .catch(() => {});
  API_Goods.getShopGoodsLabelListSeller()
    .then((res) => {
      if (res?.success) {
        shopCategoryList.value = formatShopCategory(res.result || []);
      }
    })
    .catch(() => {});
}

watch(showAdvanced, calcTableHeight);

onMounted(() => {
  init();
  nextTick(calcTableHeight);
  window.addEventListener("resize", calcTableHeight);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", calcTableHeight);
});

// 父组件（lili-dialog/index.vue 的 $refs.goodsDialog、link-dialog.vue 的 $refs["lili-component"]）
// 通过实例写入 type 切换单选/多选；expose 的 ref 外部读写等价于原 data 字段
defineExpose({ type });
</script>
<style scoped lang="scss">
@import "./style.scss";

.wrapper {
  height: 100%;
  flex-direction: column;
}

.wap-content {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.goods-table-wrap {
  flex: 1;
  min-height: 0;
}

.goods-filter-panel {
  background: #f5f7fa;
  padding: 12px 16px 4px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.goods-filter-form {
  margin-bottom: 0;

  :deep(.el-form-item) {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.range-form-item {
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

.range-filter-row-item {
  display: block;
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
  }
}

.filter-row-item {
  display: block;
  width: 100%;

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }
}

.filter-row {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
}

.filter-row-field {
  display: inline-flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
}

.filter-control {
  flex: 1;
  width: 100%;
  min-width: 0;
}

.filter-row-label {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 72px;
  padding-right: 12px;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  box-sizing: border-box;
}

.range-filter-row {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
}

.range-group {
  display: inline-flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
}

.range-group-inputs {
  display: inline-flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  :deep(.el-input) {
    flex: 1;
    width: 100%;
    min-width: 0;
  }
}

.range-sep {
  margin: 0 4px;
  color: #909399;
  user-select: none;
}

.goods-sku-table {
  width: 100%;
}

.goods-name-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-info { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.goods-info-copy { min-width: 0; }
.goods-code { margin-top: 6px; font-size: 12px; color: #909399; overflow-wrap: anywhere; }
.no-image { display: flex; height: 100%; align-items: center; justify-content: center; font-size: 11px; color: #a8abb2; background: #f5f7fa; }

:deep(.goods-name-column .cell) {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.goods-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  vertical-align: middle;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.goods-price {
  color: $theme_color;
}

.empty {
  text-align: center;
  padding: 24px 0;
  color: #909399;
}

.pageration {
  margin-top: 12px;
  justify-content: flex-end;
}

:deep(.el-table__body tr) {
  cursor: pointer;
}
</style>
<style lang="scss">
.goods-dialog-cascader-popper,
.goods-dialog-select-popper {
  z-index: 10001 !important;
}
</style>
