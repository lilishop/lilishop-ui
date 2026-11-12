<!--
  ~ 商家端出库单详情/新建/编辑页面
  ~ @author Bulbasaur
  ~ @since 2026-11-12
  -->
<template>
  <div class="stock-outbound-operation">
    <el-card>
      <template #header>
        <div class="card-header flex flex-justify-between flex-align-center">
          <span class="font-bold text-lg">{{ pageTitle }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <!-- 详情只读展示 -->
      <template v-if="readonly">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="出库单号">{{ detail.outboundSn || "-" }}</el-descriptions-item>
          <el-descriptions-item label="单据状态">
            <el-tag :type="statusTag(detail.status)">{{ statusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出库原因">{{ detail.reasonName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="出库总数量">{{ detail.totalQuantity ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="制单人">{{ detail.createBy || "-" }}</el-descriptions-item>
          <el-descriptions-item label="制单时间">{{ detail.createTime || "-" }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ detail.auditBy || "-" }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ detail.auditTime || "-" }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.auditRemark" label="审核备注" :span="2">
            <span :class="detail.status === 'REJECTED' ? 'text-danger' : ''">{{ detail.auditRemark }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || "-" }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">出库商品明细</el-divider>

        <el-table :data="items" border class="mt-4" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="skuId" label="SKU ID" width="180" />
          <el-table-column prop="specs" label="规格" width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.specs || "-" }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="出库数量" width="120" align="center" />
          <el-table-column prop="unit" label="单位" width="100" align="center">
            <template #default="{ row }">{{ row.unit || "-" }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="明细备注" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || "-" }}</template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 新建/编辑表单 -->
      <template v-else>
        <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出库原因" prop="reasonId">
                <el-select
                  v-model="form.reasonId"
                  placeholder="请选择出库原因"
                  class="w-full"
                  @change="handleReasonChange"
                >
                  <el-option
                    v-for="item in reasonOptions"
                    :key="item.id"
                    :label="item.reason"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入出库单备注"
              style="max-width: 600px"
            />
          </el-form-item>
        </el-form>

        <div class="flex flex-justify-between flex-align-center mb-4">
          <el-divider content-position="left" class="flex-1 mr-4">出库商品明细</el-divider>
          <el-button type="primary" @click="openSkuPicker">选择商品</el-button>
        </div>

        <el-table :data="items" border style="width: 100%" empty-text="请点击上方按钮添加出库商品">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="skuId" label="SKU ID" width="180" />
          <el-table-column prop="specs" label="规格" width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.specs || "-" }}</template>
          </el-table-column>
          <el-table-column label="出库数量" width="150" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="999999"
                :step="1"
                step-strictly
                controls-position="right"
                style="width: 120px"
              />
            </template>
          </el-table-column>
          <el-table-column label="单位" width="110" align="center">
            <template #default="{ row }">
              <el-input v-model="row.unit" maxlength="10" placeholder="件/个" />
            </template>
          </el-table-column>
          <el-table-column label="明细备注" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.remark" maxlength="100" placeholder="备注" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removeItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="summary mt-4 flex flex-justify-end font-14">
          <span>出库品种数：<b class="text-primary">{{ items.length }}</b></span>
          <span class="ml-6">合计出库数量：<b class="text-primary">{{ totalQuantity }}</b></span>
        </div>

        <div class="footer-actions mt-6 flex flex-justify-center">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSave(false)">保存草稿</el-button>
          <el-button type="success" :loading="submitLoading" @click="handleSave(true)">保存并提交</el-button>
        </div>
      </template>
    </el-card>

    <!-- 商品 SKU 选择弹窗 -->
    <liliDialog ref="liliDialogRef" @selectedGoodsData="onGoodsSelected" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import liliDialog from "@/views/lili-dialog";
import {
  createStockOutbound,
  getStockOutboundDetail,
  getStockReasonList,
  submitStockOutbound,
  updateStockOutbound,
} from "@/api/stock";

defineOptions({ name: "stock-outbound-operation" });

const route = useRoute();
const router = useRouter();

const readonly = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const liliDialogRef = ref(null);

const form = reactive({
  id: "",
  reasonId: "",
  reasonName: "",
  remark: "",
});

const formRules = {
  reasonId: [{ required: true, message: "请选择出库原因", trigger: "change" }],
};

const items = ref([]);
const detail = ref({});
const reasonOptions = ref([]);

const pageTitle = computed(() => {
  if (readonly.value) return "出库单详情";
  return form.id ? "编辑出库单" : "新建出库单";
});

const totalQuantity = computed(() =>
  items.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
);

function statusText(status) {
  const map = {
    DRAFT: "草稿",
    AUDITING: "待审核",
    COMPLETED: "已完成",
    REJECTED: "已驳回",
    CANCELLED: "已作废",
  };
  return map[status] || status || "-";
}

function statusTag(status) {
  const map = {
    DRAFT: "info",
    AUDITING: "warning",
    COMPLETED: "success",
    REJECTED: "danger",
    CANCELLED: "info",
  };
  return map[status] || "";
}

onMounted(() => {
  const isReadonly = route.query.readonly === "1";
  const id = route.query.id;
  readonly.value = isReadonly;
  loadReasons();
  if (id) {
    form.id = id;
    loadDetail(id);
  }
});

function loadReasons() {
  getStockReasonList({ category: "OUTBOUND", pageNumber: 1, pageSize: 100 })
    .then((res) => {
      if (res.success) {
        reasonOptions.value = res.result?.records || res.result || [];
      }
    })
    .catch(() => {});
}

function handleReasonChange(val) {
  const found = reasonOptions.value.find((item) => item.id === val);
  form.reasonName = found ? found.reason : "";
}

function loadDetail(id) {
  getStockOutboundDetail(id).then((res) => {
    if (res.success && res.result) {
      const vo = res.result;
      const outbound = vo.outbound || vo;
      detail.value = outbound;
      form.id = outbound.id;
      form.reasonId = outbound.reasonId;
      form.reasonName = outbound.reasonName;
      form.remark = outbound.remark;
      items.value = (vo.items || []).map((it) => ({
        goodsId: it.goodsId,
        skuId: it.skuId,
        goodsName: it.goodsName,
        specs: it.specs,
        quantity: it.quantity || 1,
        unit: it.unit,
        remark: it.remark,
      }));
    }
  });
}

function openSkuPicker() {
  if (liliDialogRef.value) {
    liliDialogRef.value.goodsData = items.value.map((item) => ({
      id: item.skuId,
      goodsId: item.goodsId,
      goodsName: item.goodsName,
    }));
    liliDialogRef.value.open("goods");
  }
}

function onGoodsSelected(selected) {
  const existingMap = new Map(items.value.map((item) => [item.skuId, item]));
  items.value = selected.map((sku) => {
    const existed = existingMap.get(sku.id);
    if (existed) return existed;
    return {
      goodsId: sku.goodsId,
      skuId: sku.id,
      goodsName: sku.goodsName,
      specs: sku.specs || sku.simpleSpecs || "",
      quantity: 1,
      unit: sku.goodsUnit || "件",
      remark: "",
    };
  });
}

function removeItem(index) {
  items.value.splice(index, 1);
}

async function handleSave(submit = false) {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    if (!items.value.length) {
      ElMessage.warning("请添加至少一种出库商品");
      return;
    }
    for (const item of items.value) {
      if (!item.quantity || item.quantity <= 0) {
        ElMessage.warning(`商品【${item.goodsName}】的出库数量必须大于 0`);
        return;
      }
    }

    submitLoading.value = true;
    try {
      const payload = {
        reasonId: form.reasonId,
        reasonName: form.reasonName,
        remark: form.remark,
        items: items.value.map((it) => ({
          goodsId: it.goodsId,
          skuId: it.skuId,
          goodsName: it.goodsName,
          specs: it.specs,
          quantity: it.quantity,
          unit: it.unit,
          remark: it.remark,
        })),
      };

      let id = form.id;
      if (id) {
        await updateStockOutbound(id, payload);
      } else {
        const res = await createStockOutbound(payload);
        id = res.result?.id || res.result?.outbound?.id || res.result;
      }

      if (submit && id) {
        await submitStockOutbound(id);
        ElMessage.success("出库单保存并提交成功");
      } else {
        ElMessage.success("出库单保存成功");
      }
      goBack();
    } catch (e) {
      console.error(e);
    } finally {
      submitLoading.value = false;
    }
  });
}

function goBack() {
  router.push({ name: "stockOutboundList" });
}
</script>

<style scoped>
.stock-outbound-operation {
  padding: 10px;
}
.card-header {
  min-height: 32px;
}
.summary {
  font-size: 14px;
}
.text-danger {
  color: #f56c6c;
}
.text-primary {
  color: #409eff;
}
</style>
