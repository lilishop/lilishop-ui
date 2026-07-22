<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报损单详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      <el-descriptions v-if="detail.id" :column="2" border>
        <el-descriptions-item label="报损单号">{{ detail.sn }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="damageStatusTag(detail.status)">{{ damageStatusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.makerName || detail.createBy || "-" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime || "-" }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ detail.auditorName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ detail.auditTime || "-" }}</el-descriptions-item>
        <el-descriptions-item label="报损日期">{{ detail.damageDate }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ detail.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="总金额">￥{{ formatMoney(detail.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="items" border class="mt_10 item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
          <template #default="{ row }">{{ row.goodsName }}</template>
        </el-table-column>
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="报损数量" width="90" align="center" />
        <el-table-column label="单价" width="110" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getDamageReportDetail, getDamageReportItems } from "@/api/procurement";
import { damageStatusText, damageStatusTag, formatMoney } from "../constants";

export default {
  name: "manager-damage-report-detail",
  data() {
    return { detail: {}, items: [] };
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) {
      getDamageReportDetail(id).then((res) => {
        if (res.success) this.detail = res.result || {};
      });
      getDamageReportItems(id).then((res) => {
        if (res.success) this.items = res.result || [];
      });
    }
  },
  methods: { damageStatusText, damageStatusTag, formatMoney },
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
