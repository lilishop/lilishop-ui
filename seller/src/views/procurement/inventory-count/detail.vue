<template>
  <div class="search">
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="section-title">盘点单信息</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions v-if="detail.id" :column="2" border>
        <el-descriptions-item label="盘点单号">{{ detail.sn }}</el-descriptions-item>
        <el-descriptions-item label="商品总数">{{ detail.itemTotal }}</el-descriptions-item>
        <el-descriptions-item label="盘点时间">{{ detail.countTime }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="制单人">{{ detail.makerName }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="goods-card mt_10" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="section-title">盘点商品明细</span>
          <el-button type="primary" :loading="exporting" @click="handleExport">导出 Excel</el-button>
        </div>
      </template>

      <div @keyup.enter="handleSearch">
        <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px" class="search-form">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input
              v-model="searchForm.goodsName"
              placeholder="请输入商品名称"
              clearable
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
            <el-button class="search-btn" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="280" show-overflow-tooltip />
        <el-table-column prop="skuName" label="规格" width="120" show-overflow-tooltip />
        <el-table-column prop="skuId" label="SKU ID" width="180" show-overflow-tooltip />
        <el-table-column label="上架状态" width="90" align="center">
          <template #default="{ row }">{{ MARKET_ENABLE[row.marketEnable] || row.marketEnable }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="100" align="center" />
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
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
import { useRoute } from "vue-router";
import {
  getInventoryCountDetail,
  getInventoryCountItemsPage,
  exportInventoryCountItems,
} from "@/api/procurement";
import { MARKET_ENABLE } from "../constants";
import { downloadBlob } from "@/utils/downloadBlob";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "procurement-inventory-count-detail" });

const route = useRoute();

const loading = ref(false);
const exporting = ref(false);
const detail = ref({});
const data = ref([]);
const total = ref(0);
const sn = ref("");
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  goodsName: "",
});

onMounted(() => {
  sn.value = route.query.sn || "";
  const id = route.query.id;
  if (id) {
    getInventoryCountDetail(id).then((res) => {
      if (res.success) {
        detail.value = res.result || {};
        sn.value = detail.value.sn || sn.value;
      }
    });
    getDataList();
  }
});

function getDataList() {
  const id = route.query.id;
  if (!id) return;
  loading.value = true;
  getInventoryCountItemsPage(id, searchForm.value)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleReset() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 20,
    goodsName: "",
  };
  getDataList();
}
function handleExport() {
  const id = route.query.id;
  if (!id) return;
  exporting.value = true;
  exportInventoryCountItems(id)
    .then((blob) => {
      downloadBlob(blob, `盘点单_${sn.value || id}.xlsx`);
    })
    .finally(() => {
      exporting.value = false;
    });
}
function goBack() {
  customRouterPush({ name: "procurementInventoryCountList" });
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.info-card :deep(.el-card__header) {
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
.goods-card :deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}
.mt_10 {
  margin-top: 10px;
}
</style>
