<template>
  <div class="search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <template v-if="!readonly">
        <el-form label-width="100px">
          <el-form-item label="采购单" required>
            <el-select
              v-model="form.procurementOrderId"
              filterable
              placeholder="请选择待入库采购单"
              style="width: 400px"
              @change="onOrderChange"
            >
              <el-option
                v-for="item in orderOptions"
                :key="item.id"
                :label="`${item.orderSn}（${procurementStatusText(item.status)}）`"
                :value="item.id"
              />
            </el-select>
            <el-button class="ml_10" @click="loadPendingOrders">刷新</el-button>
          </el-form-item>
          <el-form-item label="入库凭证">
            <upload-pic-thumb v-model="form.certificateImages" :limit="5" />
          </el-form-item>
        </el-form>

        <el-table :data="items" border class="item-table" style="width: 100%">
          <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
            <template #default="{ row }">{{ row.goodsName }}</template>
          </el-table-column>
          <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
            <template #default="{ row }">{{ row.skuId }}</template>
          </el-table-column>
          <el-table-column label="采购数量" width="90" align="center">
            <template #default="{ row }">{{ row.quantity }}</template>
          </el-table-column>
          <el-table-column label="已入库" width="80" align="center">
            <template #default="{ row }">{{ row.receivedQuantity || 0 }}</template>
          </el-table-column>
          <el-table-column label="剩余可入" width="90" align="center">
            <template #default="{ row }">{{ remainQty(row) }}</template>
          </el-table-column>
          <el-table-column label="本次入库" width="110" align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.inboundQuantity"
                class="cell-input"
                @blur="onInboundQtyBlur(row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <div class="footer-actions mt_20">
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确认入库</el-button>
        </div>
      </template>

      <template v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="入库单号">{{ detail.inboundSn }}</el-descriptions-item>
          <el-descriptions-item label="采购单ID">{{ detail.procurementOrderId }}</el-descriptions-item>
          <el-descriptions-item label="本次入库数量">{{ totalInboundQuantity }}</el-descriptions-item>
          <el-descriptions-item label="入库成本">￥{{ formatMoney(detail.totalCost) }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detail.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="入库时间">{{ detail.inboundTime }}</el-descriptions-item>
        </el-descriptions>
        <el-form label-width="100px" class="mt_10">
          <el-form-item label="入库凭证">
            <upload-pic-thumb
              v-if="certificateImageList.length"
              v-model="certificateImageList"
              :limit="5"
              :disable="true"
              :remove="false"
              :is-view="true"
            />
            <span v-else class="empty-text">暂无凭证</span>
          </el-form-item>
        </el-form>
        <el-table :data="inboundItems" border class="mt_10 item-table" style="width: 100%">
          <el-table-column prop="goodsName" label="商品名称" class-name="goods-name-col" width="200">
            <template #default="{ row }">{{ row.goodsName }}</template>
          </el-table-column>
          <el-table-column prop="skuId" label="SKU ID" class-name="sku-id-col" width="200">
            <template #default="{ row }">{{ row.skuId }}</template>
          </el-table-column>
          <el-table-column prop="inboundQuantity" label="本次入库" width="90" align="center" />
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import {
  getProcurementOrderPage,
  getProcurementOrderDetail,
  createProcurementInbound,
  getProcurementInboundDetail,
  getProcurementInboundItems,
} from "@/api/procurement";
import { procurementStatusText, formatMoney } from "../constants";

export default {
  name: "procurement-inbound-operation",
  components: { uploadPicThumb },
  data() {
    return {
      readonly: false,
      submitLoading: false,
      form: {
        procurementOrderId: "",
        certificateImages: [],
      },
      orderOptions: [],
      items: [],
      detail: {},
      inboundItems: [],
      certificateImageList: [],
    };
  },
  computed: {
    pageTitle() {
      return this.readonly ? "入库单详情" : "新建入库单";
    },
    totalInboundQuantity() {
      return (this.inboundItems || []).reduce(
        (sum, item) => sum + (Number(item.inboundQuantity) || 0),
        0
      );
    },
  },
  mounted() {
    this.readonly = this.$route.query.readonly === "1";
    if (this.$route.query.id) {
      this.loadInboundDetail(this.$route.query.id);
    } else {
      this.loadPendingOrders();
      if (this.$route.query.procurementOrderId) {
        this.form.procurementOrderId = this.$route.query.procurementOrderId;
        this.onOrderChange(this.$route.query.procurementOrderId);
      }
    }
  },
  methods: {
    procurementStatusText,
    formatMoney,
    remainQty(row) {
      return (row.quantity || 0) - (row.receivedQuantity || 0);
    },
    onInboundQtyBlur(row) {
      const max = this.remainQty(row);
      const val = parseInt(row.inboundQuantity, 10);
      if (Number.isNaN(val) || val < 0) {
        row.inboundQuantity = 0;
      } else if (val > max) {
        row.inboundQuantity = max;
      } else {
        row.inboundQuantity = val;
      }
    },
    loadPendingOrders() {
      getProcurementOrderPage({
        pageNumber: 1,
        pageSize: 100,
        status: "",
      }).then((res) => {
        if (res.success) {
          this.orderOptions = (res.result.records || []).filter((o) =>
            ["PENDING_INBOUND", "PARTIAL_INBOUND"].includes(o.status)
          );
        }
      });
    },
    onOrderChange(orderId) {
      if (!orderId) {
        this.items = [];
        return;
      }
      getProcurementOrderDetail(orderId).then((res) => {
        if (res.success && res.result) {
          this.items = (res.result.items || [])
            .filter((item) => this.remainQty(item) > 0)
            .map((item) => ({
              ...item,
              procurementOrderItemId: item.id,
              inboundQuantity: this.remainQty(item),
            }));
        }
      });
    },
    loadInboundDetail(id) {
      getProcurementInboundDetail(id).then((res) => {
        if (res.success) {
          this.detail = res.result || {};
          this.certificateImageList = this.parseCertificateImages(this.detail.certificateImages);
        }
      });
      getProcurementInboundItems(id).then((res) => {
        if (res.success) this.inboundItems = res.result || [];
      });
    },
    parseCertificateImages(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      return String(val)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    },
    handleSubmit() {
      if (!this.form.procurementOrderId) {
        this.$Message.warning("请选择采购单");
        return;
      }
      const validItems = this.items.filter((item) => item.inboundQuantity > 0);
      if (!validItems.length) {
        this.$Message.warning("请填写本次入库数量");
        return;
      }
      this.submitLoading = true;
      createProcurementInbound({
        procurementOrderId: this.form.procurementOrderId,
        certificateImages: Array.isArray(this.form.certificateImages)
          ? this.form.certificateImages.join(",")
          : this.form.certificateImages || "",
        items: validItems.map((item) => ({
          procurementOrderItemId: item.procurementOrderItemId || item.id,
          goodsId: item.goodsId,
          skuId: item.skuId,
          goodsName: item.goodsName,
          inboundQuantity: item.inboundQuantity,
        })),
      })
        .then((res) => {
          if (res.success) {
            this.$Message.success("入库成功");
            this.goBack();
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
    goBack() {
      this.$filters.customRouterPush({ name: "procurementInboundList" });
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
.ml_10 {
  margin-left: 10px;
}
.footer-actions {
  margin-top: 20px;
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
