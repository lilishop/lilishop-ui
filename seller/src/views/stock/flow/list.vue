<!--
  ~ 商家端商品库存流水列表页面
  ~ @author Bulbasaur
  ~ @since 2026-11-12
  -->
<template>
  <div class="stock-flow-list">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="SKU ID">
          <el-input
            v-model="searchForm.skuId"
            placeholder="请输入SKU ID"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="流水类型">
          <el-select
            v-model="searchForm.flowType"
            placeholder="全部类型"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in flowTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变动方向">
          <el-select
            v-model="searchForm.direction"
            placeholder="全部方向"
            clearable
            style="width: 120px"
          >
            <el-option label="入库" value="IN" />
            <el-option label="出库" value="OUT" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号">
          <el-input
            v-model="searchForm.bizSn"
            placeholder="订单号/出库单号等"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="变动时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="createTime" label="发生时间" width="170" align="center" />
        <el-table-column prop="goodsName" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="skuId" label="SKU ID" width="180" />
        <el-table-column prop="specs" label="规格" width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.specs || "-" }}</template>
        </el-table-column>
        <el-table-column prop="flowType" label="业务类型" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="flowTypeTag(row.flowType)">{{ flowTypeText(row.flowType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="direction" label="方向" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.direction === 'IN' ? 'success' : 'danger'" effect="light">
              {{ row.direction === 'IN' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" width="110" align="center">
          <template #default="{ row }">
            <span :class="row.direction === 'IN' ? 'text-success font-bold' : 'text-danger font-bold'">
              {{ row.direction === 'IN' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeStock" label="变动前库存" width="110" align="center">
          <template #default="{ row }">{{ row.beforeStock ?? "-" }}</template>
        </el-table-column>
        <el-table-column prop="afterStock" label="变动后库存" width="110" align="center">
          <template #default="{ row }">{{ row.afterStock ?? "-" }}</template>
        </el-table-column>
        <el-table-column prop="bizSn" label="关联业务单号" width="190" show-overflow-tooltip>
          <template #default="{ row }">{{ row.bizSn || "-" }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.operator || "-" }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || "-" }}</template>
        </el-table-column>
      </el-table>

      <div class="mt_10 flex flex-justify-end">
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
import { onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { getStockFlowPage } from "@/api/stock";

defineOptions({ name: "stock-flow-list" });

const searchFormRef = ref(null);
const dateRange = ref([]);

const flowTypeOptions = [
  { label: "销售出库", value: "ORDER_PAID" },
  { label: "退货入库", value: "ORDER_CANCEL" },
  { label: "采购入库", value: "PROCUREMENT_INBOUND" },
  { label: "领用/调拨出库", value: "STOCK_OUTBOUND" },
  { label: "报损出库", value: "DAMAGE" },
  { label: "手动调整", value: "MANUAL_ADJUST" },
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

function flowTypeText(type) {
  const item = flowTypeOptions.find((it) => it.value === type);
  return item ? item.label : type || "-";
}

function flowTypeTag(type) {
  const map = {
    ORDER_PAID: "danger",
    ORDER_CANCEL: "success",
    PROCUREMENT_INBOUND: "success",
    STOCK_OUTBOUND: "warning",
    DAMAGE: "danger",
    MANUAL_ADJUST: "info",
  };
  return map[type] || "";
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

onMounted(() => {
  // useTable with immediate: true automatically fetches data
});
</script>

<style scoped>
.stock-flow-list {
  padding: 10px;
}
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>
