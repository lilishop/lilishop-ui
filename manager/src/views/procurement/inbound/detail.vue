<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入库单详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      <el-descriptions v-if="detail.id" :column="2" border>
        <el-descriptions-item label="入库单号">{{ detail.inboundSn }}</el-descriptions-item>
        <el-descriptions-item label="采购单ID">{{ detail.procurementOrderId }}</el-descriptions-item>
        <el-descriptions-item label="本次入库数量">{{ totalInboundQuantity }}</el-descriptions-item>
        <el-descriptions-item label="入库成本">￥{{ formatMoney(detail.totalCost) }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detail.operatorName }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="items" border class="mt_10 item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
          <template #default="{ row }">{{ row.goodsName }}</template>
        </el-table-column>
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>
        <el-table-column prop="inboundQuantity" label="入库数量" width="90" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getProcurementInboundDetail, getProcurementInboundItems } from "@/api/procurement";
import { formatMoney } from "../constants";

defineOptions({ name: "manager-procurement-inbound-detail" });

const route = useRoute();

const detail = ref({});
const items = ref([]);

const totalInboundQuantity = computed(() => {
  return (items.value || []).reduce(
    (sum, item) => sum + (Number(item.inboundQuantity) || 0),
    0
  );
});

onMounted(() => {
  const id = route.query.id;
  if (id) {
    getProcurementInboundDetail(id).then((res) => {
      if (res.success) detail.value = res.result || {};
    });
    getProcurementInboundItems(id).then((res) => {
      if (res.success) items.value = res.result || [];
    });
  }
});
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
