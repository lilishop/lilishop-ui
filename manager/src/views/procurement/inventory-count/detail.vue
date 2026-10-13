<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>盘点单明细 - {{ sn }}</span>
          <div>
            <el-button type="primary" :loading="exporting" @click="handleExport">导出 Excel</el-button>
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="data" border class="item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
          <template #default="{ row }">{{ row.goodsName }}</template>
        </el-table-column>
        <el-table-column prop="skuName" label="规格" width="120" show-overflow-tooltip />
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="100" align="center" />
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="getDataList"
          @size-change="getDataList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { getInventoryCountItemsPage, exportInventoryCountItems } from "@/api/procurement";
import { downloadBlob } from "@/utils/downloadBlob";

defineOptions({ name: "manager-inventory-count-detail" });

const route = useRoute();

const loading = ref(false);
const exporting = ref(false);
const data = ref([]);
const total = ref(0);
const sn = ref("");
const searchForm = reactive({ pageNumber: 1, pageSize: 20 });

onMounted(() => {
  sn.value = route.query.sn || "";
  getDataList();
});

function getDataList() {
  const id = route.query.id;
  if (!id) return;
  loading.value = true;
  getInventoryCountItemsPage(id, searchForm)
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
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-table :deep(.sku-id-col .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.4;
}
.item-table :deep(.goods-name-col .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.4;
}
</style>
