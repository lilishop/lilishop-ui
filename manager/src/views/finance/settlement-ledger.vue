<template>
  <div class="search">
    <el-card>
      <el-button type="primary" @click="loadData">刷新</el-button>
      <el-button @click="handleExport">导出</el-button>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data">
        <el-table-column prop="storeName" label="店铺" min-width="140" />
        <el-table-column prop="pendingFlowAmount" label="待结算流水" width="130" />
        <el-table-column prop="outUnpaidAmount" label="已出账未付" width="130" />
        <el-table-column prop="checkUnpaidAmount" label="已对账未付" width="130" />
        <el-table-column prop="paidAmount" label="已付款累计" width="130" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "finance-settlement-ledger" });

const loading = ref(false);
const data = ref([]);

onMounted(() => {
  loadData();
});

function loadData() {
  loading.value = true;
  API_Finance.getSettlementLedger({}).then((res) => {
    loading.value = false;
    if (res.success) data.value = res.result || [];
  });
}
function handleExport() {
  API_Finance.exportSettlementLedger({}).then((blob) => {
    downloadBlob(blob, "结算台账.xlsx");
  });
}
</script>
