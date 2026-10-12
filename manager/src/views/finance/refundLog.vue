<template>
  <div class="search">
    <el-card>
      <el-form inline @keyup.enter="handleSearch">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderSn" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mt_10">
      <el-table v-loading="loading" border :data="data">
        <el-table-column prop="afterSaleNo" label="售后单号" min-width="160" />
        <el-table-column prop="orderSn" label="订单号" min-width="160" />
        <el-table-column prop="totalAmount" label="退款金额" width="110" />
        <el-table-column prop="paymentName" label="退款方式" width="120" />
        <el-table-column prop="isRefund" label="已退款" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Finance from "@/api/finance";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "finance-refund-log" });

const loading = ref(false);
const searchForm = reactive({ pageNumber: 1, pageSize: 20, orderSn: "" });
const data = ref([]);
const total = ref(0);

onMounted(() => {
  getDataList();
});

function handleSearch() {
  searchForm.pageNumber = 1;
  getDataList();
}
function getDataList() {
  loading.value = true;
  API_Finance.refundLogPage(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function handleExport() {
  const { pageNumber, pageSize, ...rest } = searchForm;
  API_Finance.exportRefundFlow(rest).then((blob) => {
    downloadBlob(blob, "退款流水.xlsx");
  });
}
</script>
