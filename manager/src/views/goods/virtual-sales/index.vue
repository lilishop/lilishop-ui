<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="SPU编码" prop="goodsId">
          <el-input
            v-model="searchForm.goodsId"
            placeholder="请输入SPU编码"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="SKU编码" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入SKU编码"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button style="margin-left: 8px" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-tabs v-model="salesTab" @tab-change="handleSalesTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="已设置" name="configured" />
        <el-tab-pane label="未设置" name="unconfigured" />
      </el-tabs>
      <el-alert
        type="info"
        :closable="false"
        title="支持按规格逐条设置虚拟销量，列表总销量 = 真实销量 + 虚拟销量。"
        style="margin-bottom: 10px"
      />

      <div class="batch-operations">
        <el-button
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="openBatchVirtualSalesModal"
        >
          批量设置虚拟销量
        </el-button>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data"
        border
        class="mt_10"
        style="width: 100%"
        @sort-change="changeSort"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品信息" min-width="320">
          <template #default="{ row }">
            <div v-if="row" class="goods-info">
              <div class="goods-thumb-box">
                <el-image
                  v-if="row.thumbnail"
                  :src="row.thumbnail"
                  fit="cover"
                  preview-teleported
                  :preview-src-list="[row.thumbnail]"
                  class="goods-thumbnail"
                >
                  <template #error>
                    <div class="thumb-slot">无图</div>
                  </template>
                </el-image>
                <div v-else class="thumb-slot">无图</div>
              </div>
              <div class="goods-text">
                <div class="goods-title" :title="row.goodsName">{{ row.goodsName || "-" }}</div>
                <div v-if="row.simpleSpecs" class="goods-specs">
                  规格：{{ row.simpleSpecs.trim() || "-" }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsId" label="SPU编码" width="220" show-overflow-tooltip />
        <el-table-column prop="id" label="SKU ID" width="220" show-overflow-tooltip />
        <el-table-column label="真实销量" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ row.buyCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="虚拟销量" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ row.virtualSalesInput || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总销量" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row">{{ getTotalSales(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row">
              {{ row.marketEnable === "UPPER" ? "上架" : "下架" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row, $index }">
            <a
              v-if="row"
              class="link-text"
              :class="{ disabled: row.saving }"
              @click="!row.saving && openVirtualSalesModal(row, $index)"
            >
              设置
            </a>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="editModalVisible"
      :title="modalMode === 'batch' ? '批量设置虚拟销量' : '设置虚拟销量'"
      class="virtual-sales-drawer"
      direction="rtl"
      size="min(480px, 100vw)"
      append-to-body
      :before-close="handleBeforeCloseVirtualSales"
      :close-on-click-modal="false"
      :close-on-press-escape="!modalSubmitting"
      :show-close="!modalSubmitting"
      destroy-on-close
      @closed="resetVirtualSalesModal"
    >
      <div v-if="modalMode === 'single' && currentSku" class="virtual-sales-modal">
        <div class="sku-info-item">
          <span class="sku-info-label">商品名称：</span>
          <span>{{ currentSku.goodsName || "-" }}</span>
        </div>
        <div class="sku-info-item">
          <span class="sku-info-label">规格信息：</span>
          <span>{{ currentSku.simpleSpecs || "-" }}</span>
        </div>
        <div class="sku-info-item">
          <span class="sku-info-label">SKU ID：</span>
          <span>{{ currentSku.id || "-" }}</span>
        </div>
        <el-form label-width="90px" class="mt_10">
          <el-form-item label="虚拟销量">
            <el-input-number
              v-model="editForm.virtualSales"
              :min="0"
              :max="99999999"
              :precision="0"
              style="width: 200px"
            />
          </el-form-item>
        </el-form>
      </div>
      <div v-else-if="modalMode === 'batch'" class="virtual-sales-modal">
        <div class="sku-info-item">
          <span class="sku-info-label">已选规格：</span>
          <span>{{ selectedRows.length }} 个</span>
        </div>
        <el-form label-width="90px" class="mt_10">
          <el-form-item label="虚拟销量">
            <el-input-number
              v-model="editForm.virtualSales"
              :min="0"
              :max="99999999"
              :precision="0"
              style="width: 200px"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="drawer-actions">
          <el-button :disabled="modalSubmitting" @click="handleCancelVirtualSales">取消</el-button>
          <el-button type="primary" :loading="modalSubmitting" @click="handleSubmitVirtualSales">
            提交
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  batchUpdateGoodsSkuVirtualSales,
  getGoodsSkuData,
  updateGoodsSkuVirtualSales,
} from "@/api/goods";
import { ElMessage } from "element-plus";

const VIRTUAL_SALES_FIELDS = [
  "virtualSales",
  "fictitiousSales",
  "fakeBuyCount",
  "fictitiousBuyCount",
  "mockBuyCount",
  "salesVolume",
];

defineOptions({ name: "goodsVirtualSales" });

// 模板 ref（避免与同名数据字段冲突而改名）
const searchFormRef = ref(null);
const tableRef = ref(null);

const loading = ref(true);
const editModalVisible = ref(false);
const modalSubmitting = ref(false);
const modalMode = ref("single");
const currentSku = ref(null);
const currentIndex = ref(-1);
const selectedRows = ref([]);
const salesTab = ref("all");
const editForm = reactive({
  virtualSales: 0,
});
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
  goodsName: "",
  goodsId: "",
  sn: "",
  storeName: "",
});
const data = ref([]);
const total = ref(0);
let dataRequestId = 0;

function init() {
  getDataList();
}
function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleSalesTabChange() {
  searchForm.value.pageNumber = 1;
  selectedRows.value = [];
  tableRef.value?.clearSelection();
  getDataList();
}
function handleReset() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 20,
    sort: "create_time",
    order: "desc",
    goodsName: "",
    goodsId: "",
    sn: "",
    storeName: "",
  };
  getDataList();
}
function changeSort({ prop, order }) {
  if (!order) {
    searchForm.value.sort = "create_time";
    searchForm.value.order = "desc";
  } else {
    searchForm.value.sort = prop;
    searchForm.value.order = order === "ascending" ? "asc" : "desc";
  }
  getDataList();
}
function handleSelectionChange(selection) {
  selectedRows.value = selection;
}
function getDataList() {
  const requestId = ++dataRequestId;
  loading.value = true;
  const params = { ...searchForm.value };
  if (salesTab.value !== "all") {
    params.virtualSalesSet = salesTab.value === "configured";
  }
  getGoodsSkuData(params)
    .then((res) => {
      if (requestId !== dataRequestId) return;
      if (res && res.success && res.result) {
        data.value = (res.result.records || []).map((item) => ({
          ...item,
          virtualSalesInput: getVirtualSalesValue(item),
          saving: false,
        }));
        total.value = res.result.total || 0;
        if (data.value.length === 0 && total.value > 0 && searchForm.value.pageNumber > 1) {
          searchForm.value.pageNumber = Math.max(1, Math.ceil(total.value / searchForm.value.pageSize));
          getDataList();
        }
        selectedRows.value = [];
      } else {
        data.value = [];
        total.value = 0;
        selectedRows.value = [];
        ElMessage.error((res && res.message) || "加载规格列表失败");
      }
    })
    .catch(() => {
      if (requestId !== dataRequestId) return;
      data.value = [];
      total.value = 0;
      selectedRows.value = [];
      ElMessage.error("加载规格列表失败");
    })
    .finally(() => {
      if (requestId === dataRequestId) loading.value = false;
    });
}
function getVirtualSalesValue(row) {
  const field = VIRTUAL_SALES_FIELDS.find(
    (item) => row[item] !== undefined && row[item] !== null && row[item] !== ""
  );
  return field ? Number(row[field]) || 0 : 0;
}
function openVirtualSalesModal(row, index) {
  modalMode.value = "single";
  currentSku.value = { ...row };
  currentIndex.value = index;
  editForm.virtualSales = getVirtualSalesValue(row);
  editModalVisible.value = true;
}
function openBatchVirtualSalesModal() {
  if (!selectedRows.value.length) {
    ElMessage.warning("请先选择要设置的商品规格");
    return;
  }
  modalMode.value = "batch";
  currentSku.value = null;
  currentIndex.value = -1;
  editForm.virtualSales = 0;
  editModalVisible.value = true;
}
function handleCancelVirtualSales() {
  if (modalSubmitting.value) return;
  resetVirtualSalesModal();
}
function handleBeforeCloseVirtualSales(done) {
  if (modalSubmitting.value) return;
  done();
}
function resetVirtualSalesModal() {
  editModalVisible.value = false;
  modalMode.value = "single";
  currentSku.value = null;
  currentIndex.value = -1;
  editForm.virtualSales = 0;
}
function handleSubmitVirtualSales() {
  const virtualSales = Number(editForm.virtualSales);
  if (!Number.isInteger(virtualSales) || virtualSales < 0) {
    ElMessage.warning("请输入大于等于 0 的整数虚拟销量");
    return;
  }
  if (modalMode.value === "batch") {
    handleBatchSubmitVirtualSales(virtualSales);
    return;
  }
  if (!currentSku.value || currentIndex.value < 0) return;

  const curIndex = currentIndex.value;
  const currentSkuId = currentSku.value.id;
  modalSubmitting.value = true;
  if (data.value[curIndex]) {
    data.value[curIndex].saving = true;
  }
  updateGoodsSkuVirtualSales(currentSkuId, { virtualSales })
    .then((res) => {
      if (res && res.success) {
        if (data.value[curIndex]) {
          data.value[curIndex].virtualSales = virtualSales;
          data.value[curIndex].virtualSalesInput = virtualSales;
        }
        ElMessage.success("虚拟销量设置成功");
        resetVirtualSalesModal();
        getDataList();
      } else {
        ElMessage.error((res && res.message) || "规格虚拟销量设置失败");
      }
    })
    .catch(() => {
      ElMessage.error("规格虚拟销量设置失败");
    })
    .finally(() => {
      if (data.value[curIndex]) {
        data.value[curIndex].saving = false;
      }
      modalSubmitting.value = false;
    });
}
function handleBatchSubmitVirtualSales(virtualSales) {
  const skuIds = selectedRows.value.map((item) => item.id).filter(Boolean);
  if (!skuIds.length) {
    ElMessage.warning("请先选择要设置的商品规格");
    return;
  }
  modalSubmitting.value = true;
  batchUpdateGoodsSkuVirtualSales({ skuIds, virtualSales })
    .then((res) => {
      if (res && res.success) {
        data.value = data.value.map((item) => {
          if (!skuIds.includes(item.id)) return item;
          return {
            ...item,
            virtualSales,
            virtualSalesInput: virtualSales,
          };
        });
        selectedRows.value = [];
        tableRef.value?.clearSelection();
        ElMessage.success("虚拟销量设置成功");
        resetVirtualSalesModal();
        getDataList();
      } else {
        ElMessage.error((res && res.message) || "虚拟销量设置失败");
      }
    })
    .catch(() => {
      ElMessage.error("虚拟销量设置失败");
    })
    .finally(() => {
      modalSubmitting.value = false;
    });
}
function getTotalSales(row) {
  return (Number(row.buyCount) || 0) + (Number(row.virtualSalesInput) || 0);
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.virtual-sales-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-drawer__footer) {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.goods-info {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.goods-thumb-box {
  width: 44px;
  height: 44px;
  min-width: 44px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goods-thumbnail {
  width: 44px;
  height: 44px;
  display: block;
}

.thumb-slot {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
}

.goods-text {
  min-width: 0;
  flex: 1;
}

.goods-title {
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
  font-weight: normal;
}

.goods-specs {
  margin-top: 4px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-operations {
  margin-top: 10px;
}

.virtual-sales-modal {
  padding-top: 8px;
}

.sku-info-item {
  display: flex;
  line-height: 24px;
  margin-bottom: 8px;
  word-break: break-all;
}

.sku-info-label {
  width: 90px;
  flex-shrink: 0;
}

.mt_10 {
  margin-top: 10px;
}

.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  line-height: 1;
  display: inline-block;

  &:hover {
    color: #57a3f3;
  }

  &.disabled {
    color: #c5c8ce;
    cursor: not-allowed;
  }
}
</style>
