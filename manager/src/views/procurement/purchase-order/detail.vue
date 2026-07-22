<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>采购单详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      <el-descriptions v-if="detail.id" :column="2" border>
        <el-descriptions-item label="采购单号">{{ detail.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="店铺">{{ detail.storeName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="procurementStatusTag(detail.status)">{{ procurementStatusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="制单人">{{ detail.makerName }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detail.auditorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ detail.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ detail.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="总金额">￥{{ formatMoney(detail.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="出入库原因">{{ stockReasonText }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail.items || []" border class="mt_10 item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
          <template #default="{ row }">{{ row.goodsName }}</template>
        </el-table-column>
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="采购数量" width="90" align="center" />
        <el-table-column prop="receivedQuantity" label="已入库" width="80" align="center" />
        <el-table-column label="含税单价" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.unitPriceWithTax) }}</template>
        </el-table-column>
        <el-table-column label="含税小计" width="100" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.subtotalWithTax) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getProcurementOrderDetail, getStockReasonPage } from "@/api/procurement";
import { procurementStatusText, procurementStatusTag, formatMoney } from "../constants";

export default {
  name: "manager-procurement-order-detail",
  data() {
    return { detail: {}, reasonOptions: [] };
  },
  computed: {
    stockReasonText() {
      const reason = this.reasonOptions.find((item) => item.id === this.detail.stockReasonId);
      return reason ? reason.reason : "-";
    },
  },
  mounted() {
    getStockReasonPage({ category: "INBOUND", pageNumber: 1, pageSize: 100 }).then((res) => {
      if (res.success) {
        this.reasonOptions = res.result.records || [];
      }
    });
    const id = this.$route.query.id;
    if (id) {
      getProcurementOrderDetail(id).then((res) => {
        if (res.success) this.detail = res.result || {};
      });
    }
  },
  methods: { procurementStatusText, procurementStatusTag, formatMoney },
};
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
