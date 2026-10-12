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
        <el-form-item label="商品ID" prop="goodsId">
          <el-input
            v-model="searchForm.goodsId"
            placeholder="请输入商品ID"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="SKU货号" prop="sn">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入SKU货号"
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
      <el-alert
        type="info"
        show-icon
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
        class="mt_10"
        style="width: 100%"
        @sort-change="changeSort"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="SKU ID" width="180" show-overflow-tooltip />
        <el-table-column prop="goodsId" label="商品ID" width="180" show-overflow-tooltip />
        <el-table-column label="商品信息" min-width="360">
          <template #default="{ row }">
            <div v-if="row" class="goods-info">
              <img
                v-if="row.thumbnail"
                :src="row.thumbnail"
                class="goods-thumbnail"
                alt=""
              />
              <div class="goods-text">
                <div class="div-zoom">{{ row.goodsName }}</div>
                <div v-if="row.simpleSpecs" class="sub-title">
                  规格：{{ row.simpleSpecs.trim() || "-" }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="真实销量" width="110">
          <template #default="{ row }">
            <span v-if="row">{{ row.buyCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="虚拟销量" width="110">
          <template #default="{ row }">
            <span v-if="row">{{ row.virtualSalesInput || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总销量" width="110">
          <template #default="{ row }">
            <span v-if="row">{{ getTotalSales(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.marketEnable === 'UPPER' ? 'success' : 'warning'">
              {{ row.marketEnable === "UPPER" ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
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

    <el-dialog
      v-model="editModalVisible"
      :title="modalMode === 'batch' ? '批量设置虚拟销量' : '设置虚拟销量'"
      width="480px"
      :close-on-click-modal="false"
      :close-on-press-escape="!modalSubmitting"
      :show-close="!modalSubmitting"
      destroy-on-close
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
        <el-button :disabled="modalSubmitting" @click="handleCancelVirtualSales">取消</el-button>
        <el-button type="primary" :loading="modalSubmitting" @click="handleSubmitVirtualSales">
          提交
        </el-button>
      </template>
    </el-dialog>
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
  loading.value = true;
  getGoodsSkuData(searchForm.value)
    .then((res) => {
      if (res && res.success && res.result) {
        data.value = (res.result.records || []).map((item) => ({
          ...item,
          virtualSalesInput: getVirtualSalesValue(item),
          saving: false,
        }));
        total.value = res.result.total || 0;
        selectedRows.value = [];
      } else {
        data.value = [];
        total.value = 0;
        selectedRows.value = [];
        ElMessage.error((res && res.message) || "加载规格列表失败");
      }
    })
    .catch(() => {
      data.value = [];
      total.value = 0;
      selectedRows.value = [];
      ElMessage.error("加载规格列表失败");
    })
    .finally(() => {
      loading.value = false;
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
.sub-title {
  margin-top: 6px;
  color: #808695;
  font-size: 12px;
}

.goods-info {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px 0;
}

.goods-thumbnail {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-text {
  min-width: 0;
}

.div-zoom {
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
  color: #808695;
  flex-shrink: 0;
}

.mt_10 {
  margin-top: 10px;
}
</style>
