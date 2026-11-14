<!--
  ~ 商家端商品库存流水列表页面
  ~ @author Bulbasaur
  ~ @since 2026-11-12
  -->
<template>
  <div class="search stock-flow-list">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        label-width="80px"
        class="search-form stock-flow-search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="SKU ID">
          <el-input
            v-model="searchForm.skuId"
            placeholder="请输入SKU ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select
            v-model="searchForm.flowType"
            placeholder="全部类型"
            clearable
          >
            <el-option
              v-for="item in flowTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号">
          <el-input
            v-model="searchForm.bizSn"
            placeholder="订单号/出库单号等"
            clearable
          />
        </el-form-item>
        <el-form-item label="变动时间" class="date-range-field">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="order-tab">
        <el-tabs v-model="directionTab" @tab-change="handleSearch">
          <el-tab-pane label="全部" name="ALL" />
          <el-tab-pane label="入库" name="IN" />
          <el-tab-pane label="出库" name="OUT" />
        </el-tabs>
      </div>
      <el-table v-loading="loading" :data="data" class="mt_10" row-key="id" style="width: 100%">
        <el-table-column label="商品信息" min-width="320" class-name="goods-info-column">
          <template #default="{ row }">
            <div class="goods-info">
              <el-image :src="row.thumbnail" fit="contain" class="goods-thumb">
                <template #error><span class="no-image">暂无图片</span></template>
              </el-image>
              <div class="goods-info-copy">
                <div class="goods-name">{{ row.goodsName || "-" }}</div>
                <div class="goods-code">SKU ID：{{ row.skuId || "-" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="specs" label="规格" width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ formatGoodsSpecs(row.specs) }}</template>
        </el-table-column>
        <el-table-column prop="flowType" label="业务类型" width="130" align="center">
          <template #default="{ row }">
            {{ flowTypeText(row.flowType) }}
          </template>
        </el-table-column>
        <el-table-column prop="direction" label="方向" width="90" align="center">
          <template #default="{ row }">
            {{ row.direction === 'IN' ? '入库' : '出库' }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" width="110" align="right">
          <template #default="{ row }">
            <span class="stock-quantity" :class="row.direction === 'IN' ? 'text-success' : 'text-danger'">
              {{ row.direction === 'IN' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterStock" label="变动后库存" width="110" align="right">
          <template #default="{ row }">{{ row.afterStock ?? "-" }}</template>
        </el-table-column>
        <el-table-column prop="bizSn" label="关联业务单号" min-width="210" class-name="biz-sn-column">
          <template #default="{ row }">{{ row.bizSn || "-" }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.operator || "-" }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="发生时间" width="170" />
      </el-table>

      <div class="pagination-wrapper mt_10">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { formatGoodsSpecs } from "@/utils/goodsSpecs";
import { getStockFlowPage } from "@/api/stock";

defineOptions({ name: "stock-flow-list" });

const searchFormRef = ref(null);
const dateRange = ref([]);

const flowTypeOptions = [
  { label: "订单销售", value: "ORDER_PAID" },
  { label: "订单取消回滚", value: "ORDER_CANCEL" },
  { label: "采购入库", value: "PROCUREMENT_INBOUND" },
  { label: "手工出库", value: "STOCK_OUTBOUND" },
  { label: "商品报损", value: "DAMAGE" },
  { label: "盘点调整", value: "INVENTORY_COUNT" },
  { label: "手工调整", value: "MANUAL_ADJUST" },
];

function buildSearchParams(params) {
  const p = { ...params };
  if (dateRange.value && dateRange.value.length === 2) {
    p.startDate = dateRange.value[0];
    p.endDate = dateRange.value[1];
  } else {
    delete p.startDate;
    delete p.endDate;
  }
  return p;
}

const {
  loading,
  data,
  total,
  searchForm,
  getDataList,
  handleSearch: search,
  resetSearch: reset,
} = useTable(getStockFlowPage, {
  form: {
    goodsName: "",
    skuId: "",
    flowType: "",
    direction: "",
    bizSn: "",
  },
  immediate: true,
  beforeRequest: (p) => buildSearchParams(p),
});

// Tab 与实际查询条件共用方向状态；全部对应空条件，重置后自动回到全部。
const directionTab = computed({
  get: () => searchForm.direction || "ALL",
  set: (value) => {
    searchForm.direction = value === "ALL" ? "" : value;
  },
});

/** 按后端库存流水枚举展示业务来源，出入库方向由独立字段表示。 */
function flowTypeText(type) {
  const item = flowTypeOptions.find((it) => it.value === type);
  return item ? item.label : type || "-";
}

function handleSearch() {
  searchForm.pageNumber = 1;
  search();
}

function resetSearch() {
  dateRange.value = [];
  searchForm.goodsName = "";
  searchForm.skuId = "";
  searchForm.flowType = "";
  searchForm.direction = "";
  searchForm.bizSn = "";
  reset();
}

</script>

<style scoped>
.stock-flow-search-form {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  align-items: start;
}
.stock-flow-search-form > :deep(.el-form-item) {
  display: flex;
  width: auto;
  min-width: 0;
  margin: 8px 0 !important;
}
.stock-flow-search-form :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}
.stock-flow-search-form :deep(.el-input),
.stock-flow-search-form :deep(.el-select),
.stock-flow-search-form :deep(.el-date-editor) {
  width: 100% !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.date-range-field {
  grid-column: span 2;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  overflow-x: auto;
}
.stock-quantity {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 1440px) {
  .stock-flow-search-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .stock-flow-search-form {
    grid-template-columns: minmax(0, 1fr);
  }
  .date-range-field {
    grid-column: auto;
  }
}
.goods-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.goods-info-copy {
  min-width: 0;
}
.goods-name {
  overflow-wrap: anywhere;
}
.goods-code {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  overflow-wrap: anywhere;
}
.goods-thumb {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.no-image {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #a8abb2;
  background: #f5f7fa;
}
:deep(.goods-info-column .cell) {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}
/* 关联单号保留完整内容，窄屏或超长单号自动换行。 */
:deep(.biz-sn-column .cell) {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>
