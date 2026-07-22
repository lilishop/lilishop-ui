<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="出入库原因" required>
          <el-select
            v-model="form.stockReasonId"
            :disabled="readonly"
            placeholder="请选择出入库原因"
            style="width: 300px"
          >
            <el-option
              v-for="item in reasonOptions"
              :key="item.id"
              :label="item.reason"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            :disabled="readonly"
            placeholder="备注信息"
            style="max-width: 600px"
          />
        </el-form-item>
      </el-form>

      <div v-if="!readonly" class="operation padding-row">
        <el-button type="primary" @click="openSkuPicker">添加商品</el-button>
      </div>

      <el-table :data="items" border class="mt_10 item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="240" show-overflow-tooltip />
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" :width="readonly ? 200 : 170">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>
        <el-table-column label="零售价" width="110" align="center">
          <template #default="{ row }">
            <el-input
              v-if="!readonly"
              v-model="row.retailPrice"
              class="cell-input"
              @blur="onDecimalBlur(row, 'retailPrice')"
            />
            <span v-else>￥{{ formatMoney(row.retailPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采购数量" width="100" align="center">
          <template #default="{ row }">
            <el-input
              v-if="!readonly"
              v-model="row.quantity"
              class="cell-input"
              @blur="onQuantityBlur(row)"
            />
            <span v-else>{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="税率(%)" width="90" align="center">
          <template #default="{ row }">
            <el-input
              v-if="!readonly"
              v-model="row.taxRate"
              class="cell-input"
              @blur="onTaxRateBlur(row)"
            />
            <span v-else>{{ row.taxRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="含税单价" width="110" align="center">
          <template #default="{ row }">
            <el-input
              v-if="!readonly"
              v-model="row.unitPriceWithTax"
              class="cell-input"
              @blur="onDecimalBlur(row, 'unitPriceWithTax')"
            />
            <span v-else>￥{{ formatMoney(row.unitPriceWithTax) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="含税小计" width="100" align="right">
          <template #default="{ row }">￥{{ formatMoney(calcSubtotal(row)) }}</template>
        </el-table-column>
        <el-table-column v-if="orderDetail.id" label="已入库" width="80" align="center">
          <template #default="{ row }">{{ row.receivedQuantity || 0 }}</template>
        </el-table-column>
        <el-table-column v-if="!readonly" label="操作" width="70" align="center" fixed="right">
          <template #default="{ $index }">
            <a class="link-text" @click="removeItem($index)">删除</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="summary mt_10">
        <span>合计数量：<b>{{ totalQuantity }}</b></span>
        <span class="ml_20">合计金额：<b>￥{{ formatMoney(totalAmount) }}</b></span>
        <span v-if="orderDetail.status" class="ml_20">
          状态：<el-tag :type="procurementStatusTag(orderDetail.status)">{{ procurementStatusText(orderDetail.status) }}</el-tag>
        </span>
        <span v-if="orderDetail.auditorName" class="ml_20">审核人：<b>{{ orderDetail.auditorName }}</b></span>
      </div>

      <div v-if="!readonly" class="footer-actions mt_20">
        <el-button type="primary" :loading="submitLoading" @click="handleSave(false)">保存草稿</el-button>
        <el-button type="success" :loading="submitLoading" @click="handleSave(true)">保存并提交</el-button>
      </div>

      <div v-if="readonly && orderDetail.status === 'SUBMITTED'" class="footer-actions mt_20">
        <el-button type="primary" @click="handleAudit(true)">审核通过</el-button>
        <el-button type="danger" @click="handleAudit(false)">审核驳回</el-button>
      </div>
    </el-card>

    <liliDialog ref="liliDialog" @selectedGoodsData="onGoodsSelected" />
  </div>
</template>

<script>
import liliDialog from "@/views/lili-dialog";
import {
  createProcurementOrder,
  getProcurementOrderDetail,
  submitProcurementOrder,
  auditProcurementOrder,
  getStockReasonList,
} from "@/api/procurement";
import {
  procurementStatusText,
  procurementStatusTag,
  formatMoney,
} from "../constants";

export default {
  name: "procurement-purchase-order-operation",
  components: { liliDialog },
  data() {
    return {
      form: { remark: "", stockReasonId: "" },
      items: [],
      orderDetail: {},
      reasonOptions: [],
      submitLoading: false,
      readonly: false,
    };
  },
  computed: {
    pageTitle() {
      if (this.readonly) return "采购单详情";
      return this.$route.query.id ? "编辑采购单" : "新建采购单";
    },
    totalQuantity() {
      return this.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    },
    totalAmount() {
      return this.items.reduce((sum, item) => sum + this.calcSubtotal(item), 0);
    },
  },
  mounted() {
    this.loadReasons();
    if (this.$route.query.id) {
      this.readonly = true;
      this.loadDetail(this.$route.query.id);
    }
  },
  methods: {
    procurementStatusText,
    procurementStatusTag,
    formatMoney,
    loadReasons() {
      getStockReasonList({ category: "INBOUND", pageNumber: 1, pageSize: 100 }).then((res) => {
        if (res.success) {
          this.reasonOptions = res.result.records || [];
        }
      });
    },
    calcSubtotal(row) {
      return (Number(row.unitPriceWithTax) || 0) * (Number(row.quantity) || 0);
    },
    recalcRow() {},
    onQuantityBlur(row) {
      const val = parseInt(row.quantity, 10);
      row.quantity = Number.isNaN(val) || val < 1 ? 1 : val;
      this.recalcRow(row);
    },
    onTaxRateBlur(row) {
      const val = parseInt(row.taxRate, 10);
      if (Number.isNaN(val) || val < 0) {
        row.taxRate = 0;
      } else if (val > 100) {
        row.taxRate = 100;
      } else {
        row.taxRate = val;
      }
      this.recalcRow(row);
    },
    onDecimalBlur(row, field) {
      const val = parseFloat(row[field]);
      row[field] = Number.isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
      this.recalcRow(row);
    },
    loadDetail(id) {
      getProcurementOrderDetail(id).then((res) => {
        if (res.success && res.result) {
          this.orderDetail = res.result;
          this.form.remark = res.result.remark || "";
          this.form.stockReasonId = res.result.stockReasonId || "";
          this.items = (res.result.items || []).map((item) => ({ ...item }));
        }
      });
    },
    openSkuPicker() {
      this.$refs.liliDialog.goodsData = this.items.map((item) => ({
        id: item.skuId,
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        price: item.retailPrice,
      }));
      this.$refs.liliDialog.open("goods");
    },
    onGoodsSelected(selected) {
      const map = new Map(this.items.map((item) => [item.skuId, item]));
      this.items = selected.map((sku) => {
        const existed = map.get(sku.id);
        if (existed) return existed;
        return {
          goodsId: sku.goodsId,
          skuId: sku.id,
          goodsName: sku.goodsName,
          retailPrice: sku.price || 0,
          quantity: 1,
          taxRate: 0,
          unitPriceWithTax: sku.cost || sku.price || 0,
        };
      });
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    validateItems() {
      if (!this.form.stockReasonId) {
        this.$Message.warning("请选择出入库原因");
        return false;
      }
      if (!this.items.length) {
        this.$Message.warning("请至少添加一个商品");
        return false;
      }
      for (const item of this.items) {
        if (!item.quantity || item.quantity < 1) {
          this.$Message.warning("采购数量必须大于0");
          return false;
        }
        if (item.unitPriceWithTax == null || item.unitPriceWithTax < 0) {
          this.$Message.warning("请填写含税单价");
          return false;
        }
      }
      return true;
    },
    handleSave(andSubmit) {
      if (!this.validateItems()) return;
      this.submitLoading = true;
      const payload = {
        remark: this.form.remark,
        stockReasonId: this.form.stockReasonId,
        items: this.items.map((item) => ({
          goodsId: item.goodsId,
          skuId: item.skuId,
          goodsName: item.goodsName,
          retailPrice: item.retailPrice,
          quantity: item.quantity,
          taxRate: item.taxRate || 0,
          unitPriceWithTax: item.unitPriceWithTax,
        })),
      };
      createProcurementOrder(payload)
        .then((res) => {
          if (!res.success) return;
          const orderId = res.result.id;
          if (andSubmit) {
            return submitProcurementOrder(orderId).then((subRes) => {
              if (subRes.success) {
                this.$Message.success("保存并提交成功");
                this.goBack();
              }
            });
          }
          this.$Message.success("保存成功");
          this.goBack();
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
    handleAudit(pass) {
      auditProcurementOrder(this.orderDetail.id, { pass, remark: "" }).then((res) => {
        if (res.success) {
          this.$Message.success("操作成功");
          this.goBack();
        }
      });
    },
    goBack() {
      this.$filters.customRouterPush({ name: "procurementPurchaseOrderList" });
    },
  },
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary {
  padding: 12px 0;
  font-size: 14px;
}
.ml_20 {
  margin-left: 20px;
}
.footer-actions {
  display: flex;
  gap: 12px;
}
.item-table :deep(.cell-input) {
  width: 100%;
}
.item-table :deep(.cell-input .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 8px;
}
.item-table :deep(.sku-id-col .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.4;
}
</style>
