<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="发生日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="开始"
            end-placeholder="结束"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="params.orderSn" clearable placeholder="订单编号" style="width: 160px" />
        </el-form-item>
        <el-form-item label="买家">
          <el-input v-model="params.memberName" clearable placeholder="买家名称" style="width: 140px" />
        </el-form-item>
        <el-form-item label="商品关键词">
          <el-input v-model="params.keyword" clearable placeholder="商品名称" style="width: 160px" />
        </el-form-item>
        <el-form-item label="店铺">
          <el-select v-model="params.storeId" clearable filterable placeholder="全部店铺" style="width: 180px">
            <el-option v-for="item in shops" :key="item.id" :label="item.storeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ (params.pageNumber - 1) * params.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="orderRefundSn" label="订单编号|售后单号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="occurTime" label="发生时间" width="160" />
        <el-table-column prop="flowTypeName" label="交易类型" width="90" />
        <el-table-column prop="num" label="成交数量" width="90" align="right" />
        <el-table-column label="成交金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.transactionAmount) }}</template>
        </el-table-column>
        <el-table-column label="售价金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.salePriceAmount) }}</template>
        </el-table-column>
        <el-table-column label="优惠金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.discountAmount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentDetail" label="收款明细" width="120" show-overflow-tooltip />
        <el-table-column prop="discountDetail" label="优惠明细" min-width="160" show-overflow-tooltip />
        <el-table-column label="订单来源" width="100">
          <template #default="{ row }">{{ clientTypeText(row.clientType) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        class="mt_10"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Statistics from "@/api/statistics";
import { getShopListData } from "@/api/shops";
import { downloadBlob } from "@/utils/downloadBlob";
import { unitPrice } from "@/utils/filters";

defineOptions({ name: "sales-order-detail-report" });

const loading = ref(false);
const dateRange = ref([]);
const defaultTime = ref([new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]);
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  storeId: "",
  orderSn: "",
  memberName: "",
  keyword: "",
});
const data = ref([]);
const total = ref(0);
const shops = ref([]);

onMounted(() => {
  initDefaultRange();
  loadShops();
  loadData();
});

function initDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  dateRange.value = [formatDate(start, true), formatDate(end, false)];
}
function formatDate(date, startOfDay) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return startOfDay ? `${y}-${m}-${d} 00:00:00` : `${y}-${m}-${d} 23:59:59`;
}
function loadShops() {
  getShopListData({ pageNumber: 1, pageSize: 200 }).then((res) => {
    if (res.success) shops.value = res.result.records || [];
  });
}
function buildParams() {
  const p = { ...params };
  if (dateRange.value && dateRange.value.length === 2) {
    p.startTime = dateRange.value[0];
    p.endTime = dateRange.value[1];
  }
  return p;
}
function handleSearch() {
  params.pageNumber = 1;
  loadData();
}
function loadData() {
  loading.value = true;
  API_Statistics.getSalesOrderDetailReport(buildParams()).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records || [];
      total.value = res.result.total || 0;
    }
  });
}
function handleExport() {
  API_Statistics.exportSalesOrderDetailReport(buildParams()).then((blob) => {
    downloadBlob(blob, "销售订单明细报表.xlsx");
  });
}
function formatMoney(val) {
  return unitPrice(val, "￥");
}
function clientTypeText(val) {
  const map = {
    H5: "移动端",
    PC: "PC端",
    WECHAT_MP: "小程序",
    APP: "移动应用端",
    UNKNOWN: "未知",
  };
  return map[val] || val || "";
}
</script>
