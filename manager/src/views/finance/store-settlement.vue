<template>
  <div class="search">
    <el-card>
      <el-form inline>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data">
        <el-table-column prop="storeName" label="店铺" min-width="140" />
        <el-table-column prop="orderPrice" label="订单实付" width="110" />
        <el-table-column prop="refundPrice" label="退款" width="110" />
        <el-table-column prop="commissionPrice" label="佣金" width="100" />
        <el-table-column prop="billPrice" label="应结" width="110" />
        <el-table-column prop="outBillAmount" label="已出账" width="110" />
        <el-table-column prop="checkBillAmount" label="已对账" width="110" />
        <el-table-column prop="completeBillAmount" label="已付款" width="110" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "finance-store-settlement" });

const loading = ref(false);
const dateRange = ref([]);
const data = ref([]);

onMounted(() => {
  loadData();
});

function buildParams() {
  const p = {};
  if (dateRange.value?.length === 2) {
    p.startDate = dateRange.value[0];
    p.endDate = dateRange.value[1];
  }
  return p;
}
function loadData() {
  loading.value = true;
  API_Finance.getStoreSettlementReport(buildParams()).then((res) => {
    loading.value = false;
    if (res.success) data.value = res.result || [];
  });
}
function handleExport() {
  API_Finance.exportStoreSettlementReport(buildParams()).then((blob) => {
    downloadBlob(blob, "店铺结算汇总.xlsx");
  });
}
</script>
