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
        <el-table-column v-if="!readonly" label="操作" width="70" align="right" fixed="right">
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

    <liliDialog ref="liliDialogRef" @selectedGoodsData="onGoodsSelected" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
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
import { Message } from "@/utils/message";
import { customRouterPush } from "@/utils/filters";

defineOptions({ name: "procurement-purchase-order-operation" });

const route = useRoute();

const form = reactive({ remark: "", stockReasonId: "" });
const items = ref([]);
const orderDetail = ref({});
const reasonOptions = ref([]);
const submitLoading = ref(false);
const readonly = ref(false);

// liliDialogRef：模板 ref 改名避免与 import 的组件同名互相覆盖
const liliDialogRef = ref(null);

const pageTitle = computed(() => {
  if (readonly.value) return "采购单详情";
  return route.query.id ? "编辑采购单" : "新建采购单";
});
const totalQuantity = computed(() =>
  items.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
);
const totalAmount = computed(() =>
  items.value.reduce((sum, item) => sum + calcSubtotal(item), 0)
);

onMounted(() => {
  loadReasons();
  if (route.query.id) {
    readonly.value = true;
    loadDetail(route.query.id);
  }
});

function loadReasons() {
  getStockReasonList({ category: "INBOUND", pageNumber: 1, pageSize: 100 }).then((res) => {
    if (res.success) {
      reasonOptions.value = res.result.records || [];
    }
  });
}
function calcSubtotal(row) {
  return (Number(row.unitPriceWithTax) || 0) * (Number(row.quantity) || 0);
}
function recalcRow() {}
function onQuantityBlur(row) {
  const val = parseInt(row.quantity, 10);
  row.quantity = Number.isNaN(val) || val < 1 ? 1 : val;
  recalcRow(row);
}
function onTaxRateBlur(row) {
  const val = parseInt(row.taxRate, 10);
  if (Number.isNaN(val) || val < 0) {
    row.taxRate = 0;
  } else if (val > 100) {
    row.taxRate = 100;
  } else {
    row.taxRate = val;
  }
  recalcRow(row);
}
function onDecimalBlur(row, field) {
  const val = parseFloat(row[field]);
  row[field] = Number.isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
  recalcRow(row);
}
function loadDetail(id) {
  getProcurementOrderDetail(id).then((res) => {
    if (res.success && res.result) {
      orderDetail.value = res.result;
      form.remark = res.result.remark || "";
      form.stockReasonId = res.result.stockReasonId || "";
      items.value = (res.result.items || []).map((item) => ({ ...item }));
    }
  });
}
function openSkuPicker() {
  liliDialogRef.value.goodsData = items.value.map((item) => ({
    id: item.skuId,
    goodsId: item.goodsId,
    goodsName: item.goodsName,
    price: item.retailPrice,
  }));
  liliDialogRef.value.open("goods");
}
function onGoodsSelected(selected) {
  const map = new Map(items.value.map((item) => [item.skuId, item]));
  items.value = selected.map((sku) => {
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
}
function removeItem(index) {
  items.value.splice(index, 1);
}
function validateItems() {
  if (!form.stockReasonId) {
    Message.warning("请选择出入库原因");
    return false;
  }
  if (!items.value.length) {
    Message.warning("请至少添加一个商品");
    return false;
  }
  for (const item of items.value) {
    if (!item.quantity || item.quantity < 1) {
      Message.warning("采购数量必须大于0");
      return false;
    }
    if (item.unitPriceWithTax == null || item.unitPriceWithTax < 0) {
      Message.warning("请填写含税单价");
      return false;
    }
  }
  return true;
}
function handleSave(andSubmit) {
  if (!validateItems()) return;
  submitLoading.value = true;
  const payload = {
    remark: form.remark,
    stockReasonId: form.stockReasonId,
    items: items.value.map((item) => ({
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
            Message.success("保存并提交成功");
            goBack();
          }
        });
      }
      Message.success("保存成功");
      goBack();
    })
    .finally(() => {
      submitLoading.value = false;
    });
}
function handleAudit(pass) {
  auditProcurementOrder(orderDetail.value.id, { pass, remark: "" }).then((res) => {
    if (res.success) {
      Message.success("操作成功");
      goBack();
    }
  });
}
function goBack() {
  customRouterPush({ name: "procurementPurchaseOrderList" });
}
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
