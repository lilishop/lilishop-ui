<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <template v-if="readonly">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报损单号">{{ detail.sn || "-" }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="damageStatusTag(detail.status)">{{ damageStatusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detail.makerName || detail.createBy || "-" }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || "-" }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ detail.auditorName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ detail.auditTime || "-" }}</el-descriptions-item>
          <el-descriptions-item label="报损日期">{{ detail.damageDate || "-" }}</el-descriptions-item>
          <el-descriptions-item label="报损原因">{{ reasonText }}</el-descriptions-item>
          <el-descriptions-item label="报损数量">{{ detail.totalQuantity ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="报损金额">￥{{ formatMoney(detail.totalAmount) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || "-" }}</el-descriptions-item>
        </el-descriptions>
        <el-form label-width="100px" class="mt_10">
          <el-form-item label="凭证图片">
            <upload-pic-thumb
              v-if="evidenceImageList.length"
              v-model="evidenceImageList"
              :limit="5"
              :disable="true"
              :remove="false"
              :is-view="true"
            />
            <span v-else class="empty-text">暂无凭证</span>
          </el-form-item>
        </el-form>
        <el-table :data="items" border class="mt_10 item-table" style="width: 100%">
          <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
            <template #default="{ row }">{{ row.goodsName }}</template>
          </el-table-column>
          <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
            <template #default="{ row }">{{ row.skuId }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="报损数量" width="100" align="center" />
          <el-table-column label="单价" width="110" align="right">
            <template #default="{ row }">￥{{ formatMoney(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="金额" width="100" align="right">
            <template #default="{ row }">￥{{ formatMoney(row.amount) }}</template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
      <el-form :model="form" label-width="100px">
        <el-form-item label="报损日期">
          <el-date-picker
            v-model="form.damageDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled="readonly"
            placeholder="报损日期"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="报损原因">
          <el-select
            v-model="form.damageReasonId"
            :disabled="readonly"
            placeholder="请选择报损原因"
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
            style="max-width: 600px"
          />
        </el-form-item>
        <el-form-item label="凭证图片">
          <upload-pic-thumb v-model="form.evidence" :limit="5" :disable="readonly" :is-view="readonly" />
        </el-form-item>
      </el-form>

      <div v-if="!readonly" class="operation padding-row">
        <el-button type="primary" @click="openSkuPicker">添加商品</el-button>
      </div>

      <el-table :data="items" border class="mt_10 item-table" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
          <template #default="{ row }">{{ row.goodsName }}</template>
        </el-table-column>
        <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
          <template #default="{ row }">{{ row.skuId }}</template>
        </el-table-column>        <el-table-column label="报损数量" width="100" align="center">
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
        <el-table-column label="单价" width="110" align="center">
          <template #default="{ row }">
            <el-input
              v-if="!readonly"
              v-model="row.unitPrice"
              class="cell-input"
              @blur="onUnitPriceBlur(row)"
            />
            <span v-else>￥{{ formatMoney(row.unitPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">￥{{ formatMoney(row.amount) }}</template>
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
      </div>

      <div class="footer-actions mt_20">
        <el-button type="primary" :loading="submitLoading" @click="handleSave(false)">保存草稿</el-button>
        <el-button type="success" :loading="submitLoading" @click="handleSave(true)">保存并提交</el-button>
      </div>
      </template>
    </el-card>

    <liliDialog ref="liliDialog" @selectedGoodsData="onGoodsSelected" />
  </div>
</template>

<script>
import liliDialog from "@/views/lili-dialog";
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import {
  createDamageReport,
  getDamageReportDetail,
  getDamageReportItems,
  getStockReasonList,
  submitDamageReport,
} from "@/api/procurement";
import { damageStatusText, damageStatusTag, formatMoney } from "../constants";

export default {
  name: "procurement-damage-report-operation",
  components: { liliDialog, uploadPicThumb },
  data() {
    return {
      readonly: false,
      submitLoading: false,
      form: {
        damageDate: "",
        damageReasonId: "",
        remark: "",
        evidence: [],
      },
      items: [],
      detail: {},
      reasonOptions: [],
      evidenceImageList: [],
    };
  },
  computed: {
    pageTitle() {
      return this.readonly ? "报损单详情" : "新建报损单";
    },
    reasonText() {
      const reason = this.reasonOptions.find((item) => item.id === this.detail.damageReasonId);
      return reason ? reason.reason : "-";
    },
    totalQuantity() {
      return this.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    },
    totalAmount() {
      return this.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    },
  },
  mounted() {
    this.readonly = this.$route.query.readonly === "1" || !!this.$route.query.id;
    this.loadReasons();
    if (this.$route.query.id) {
      this.loadDetail(this.$route.query.id);
    }
  },
  methods: {
    damageStatusText,
    damageStatusTag,
    formatMoney,
    loadReasons() {
      getStockReasonList({ category: "DAMAGE", pageNumber: 1, pageSize: 100 }).then((res) => {
        if (res.success) {
          this.reasonOptions = res.result.records || [];
        }
      });
    },
    recalcRow(row) {
      row.amount = (Number(row.unitPrice) || 0) * (Number(row.quantity) || 0);
    },
    onQuantityBlur(row) {
      const val = parseInt(row.quantity, 10);
      row.quantity = Number.isNaN(val) || val < 1 ? 1 : val;
      this.recalcRow(row);
    },
    onUnitPriceBlur(row) {
      const val = parseFloat(row.unitPrice);
      row.unitPrice = Number.isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
      this.recalcRow(row);
    },
    loadDetail(id) {
      getDamageReportDetail(id).then((res) => {
        if (res.success && res.result) {
          this.detail = res.result;
          this.form.damageDate = res.result.damageDate;
          this.form.damageReasonId = res.result.damageReasonId;
          this.form.remark = res.result.remark;
          this.form.evidence = res.result.evidence;
          this.evidenceImageList = this.parseEvidenceImages(res.result.evidence);
        }
      });
      getDamageReportItems(id).then((res) => {
        if (res.success) {
          this.items = res.result || [];
        }
      });
    },
    parseEvidenceImages(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      return String(val)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    },
    openSkuPicker() {
      this.$refs.liliDialog.goodsData = this.items.map((item) => ({
        id: item.skuId,
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        price: item.unitPrice,
        cost: item.unitPrice,
      }));
      this.$refs.liliDialog.open("goods");
    },
    onGoodsSelected(selected) {
      const map = new Map(this.items.map((item) => [item.skuId, item]));
      this.items = selected.map((sku) => {
        const existed = map.get(sku.id);
        if (existed) return existed;
        const unitPrice = sku.cost || sku.price || 0;
        return {
          goodsId: sku.goodsId,
          skuId: sku.id,
          goodsName: sku.goodsName,
          quantity: 1,
          unitPrice,
          amount: unitPrice,
        };
      });
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    validateForm() {
      if (!this.form.damageReasonId) {
        this.$Message.warning("请选择报损原因");
        return false;
      }
      if (!this.items.length) {
        this.$Message.warning("请添加报损商品");
        return false;
      }
      return true;
    },
    handleSave(andSubmit) {
      if (!this.validateForm()) return;
      this.submitLoading = true;
      const payload = {
        damageDate: this.form.damageDate || undefined,
        damageReasonId: this.form.damageReasonId,
        remark: this.form.remark,
        evidence: Array.isArray(this.form.evidence)
          ? this.form.evidence.join(",")
          : this.form.evidence || "",
        items: this.items.map((item) => ({
          goodsId: item.goodsId,
          skuId: item.skuId,
          goodsName: item.goodsName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      createDamageReport(payload)
        .then((res) => {
          if (!res.success) return;
          const reportId = res.result.id;
          if (andSubmit) {
            return submitDamageReport(reportId).then((subRes) => {
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
    goBack() {
      this.$filters.customRouterPush({ name: "procurementDamageReportList" });
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
.item-table :deep(.goods-name-col .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.4;
}
.empty-text {
  color: #909399;
}
</style>
