<template>
  <div class="gift-card-activity-page" :class="{ 'pickup-page': form.cardType === 'PICKUP', 'view-page': onlyView }">
    <!-- 礼品卡基础信息卡片 -->
    <el-card shadow="never" v-loading="detailLoading" class="info-card">
      <template #header>
        <div class="page-header-row">
          <div class="header-left">
            <div class="header-title">
              <span>{{ pageTitle }}</span>
              <el-tag
                v-if="onlyView || isEditMode"
                size="small"
                effect="plain"
                :type="onlyView ? 'info' : (isEditMode ? 'warning' : 'primary')"
                class="mode-tag"
              >
                {{ onlyView ? "查看模式" : "编辑模式" }}
              </el-tag>
              <span v-if="route.query.id" class="activity-id font-mono">
                ID: {{ route.query.id }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <!-- 查看模式：以结构化描述列表呈现 -->
      <template v-if="onlyView">
        <el-descriptions :column="2" border class="custom-descriptions">
          <el-descriptions-item label="礼品卡名称">
            <span class="font-semibold text-dark">{{ form.giftCardName || "-" }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="礼品卡类型">
            <el-tag size="small" effect="plain" type="primary">
              {{ form.cardType === "CASH" ? "现金卡" : "提货卡" }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item v-if="form.cardType === 'CASH'" label="礼品卡面值">
            <span class="price-highlight font-mono font-semibold">
              {{ form.faceValue ? $filters.unitPrice(form.faceValue, "￥") : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总库存">
            <span class="font-mono text-dark font-semibold">
              {{ form.stockTotal != null ? `${form.stockTotal} 张` : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="有效期限" :span="2">
            <span class="font-mono text-dark">{{ validityDisplayText }}</span>
          </el-descriptions-item>

          <el-descriptions-item v-if="activityDetail.createTime" label="创建时间">
            <span class="font-mono text-secondary">{{ activityDetail.createTime }}</span>
          </el-descriptions-item>

          <el-descriptions-item v-if="route.query.id" label="活动ID">
            <span class="font-mono text-secondary">{{ route.query.id }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <template v-if="form.cardType === 'PICKUP'">
          <p>兑换规则：{{ {ONE:'任选一种',ALL:'全部兑换',ANY:'任选 ' + form.pickupCount + ' 种'}[form.pickupMode] }}，每种一件</p>
          <el-table :data="pickupGoods">
            <el-table-column prop="id" label="SKU ID" />
            <el-table-column prop="goodsName" label="商品" />
            <el-table-column label="规格" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ formatSkuSpecs(row.specs, row.simpleSpecs) }}</template>
            </el-table-column>
            <el-table-column prop="storeName" label="店铺" />
          </el-table>
        </template>
      </template>

      <!-- 编辑 / 新增模式：表单输入 -->
      <template v-else>
        <el-form
          ref="formRef"
          :model="form"
          label-position="top"
          size="large"
          :rules="formRule"
          class="edit-form"
        >
          <el-form-item label="礼品卡名称" prop="giftCardName" class="full-row">
            <el-input
              v-model="form.giftCardName"
              type="text"
              placeholder="请输入礼品卡名称"
              clearable
              maxlength="64"
              show-word-limit
              class="form-control"
            />
          </el-form-item>

          <el-form-item v-if="form.cardType === 'CASH'" label="面值" prop="faceValue">
            <el-input
              v-model="form.faceValue"
              :disabled="coreLocked"
              type="number"
              placeholder="请填写面值金额"
              clearable
              class="form-control"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>

          <template v-if="form.cardType === 'PICKUP'">
            <el-form-item label="兑换方式" required class="full-row">
              <el-radio-group v-model="form.pickupMode" :disabled="coreLocked">
                <el-radio value="ONE">任选一种</el-radio>
                <el-radio value="ALL">全部兑换</el-radio>
                <el-radio value="ANY">任选 N 种</el-radio>
              </el-radio-group>
              <el-input-number v-if="form.pickupMode === 'ANY'" v-model="form.pickupCount" :min="1" :max="50" :precision="0" :controls="false" :disabled="coreLocked" style="width:100px;margin-left:12px" />
            </el-form-item>
            <el-form-item label="兑换商品" required class="full-row">
              <el-button :disabled="coreLocked" @click="openPickupGoods">选择商品</el-button>
              <span class="input-tip-text">最多 50 个 SKU，每种一件，每卡一次兑完</span>
            </el-form-item>
            <el-table :data="pickupGoods" border class="full-row" style="margin-bottom:4px">
              <el-table-column prop="id" label="SKU ID" min-width="160" />
              <el-table-column prop="goodsName" label="商品名称" min-width="220" />
              <el-table-column label="规格" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">{{ formatSkuSpecs(row.specs, row.simpleSpecs) }}</template>
              </el-table-column>
              <el-table-column prop="storeName" label="店铺" min-width="140" />
              <el-table-column label="销售价（元）" width="130"><template #default="{row}">{{ row.price }}</template></el-table-column>
              <el-table-column label="操作" width="90"><template #default="{row}"><el-button link :disabled="coreLocked" @click="pickupGoods = pickupGoods.filter(g => g.id !== row.id)">移除</el-button></template></el-table-column>
            </el-table>
          </template>
          <el-form-item label="总库存" prop="stockTotal" class="stock-form-item">
            <div class="form-control unit-control">
              <el-input-number
                v-model="form.stockTotal"
                :min="1"
                :precision="0"
                :controls="false"
                placeholder="请输入总库存"
              />
              <span class="unit-addon">张</span>
            </div>
          </el-form-item>

          <el-form-item label="有效期限" required class="validity-form-item full-row">
            <div class="validity-control">
              <el-radio-group v-model="form.validityType" :disabled="coreLocked" class="validity-radio-group">
                <el-radio value="LONG_TERM">长期有效</el-radio>
                <el-radio value="AFTER_ACTIVATE_MONTHS">激活后有效</el-radio>
                <el-radio value="FIXED_UNTIL">指定到期</el-radio>
              </el-radio-group>
              <div v-if="form.validityType === 'AFTER_ACTIVATE_MONTHS'" class="validity-detail">
                <div class="unit-control month-control">
                  <el-input-number
                    v-model="form.validMonthsAfterActivate"
                    :min="1"
                    :max="99"
                    :precision="0"
                    :controls="false"
                    :disabled="coreLocked"
                    placeholder="1-99"
                  />
                  <span class="unit-addon">个月</span>
                </div>
              </div>
              <div v-else-if="form.validityType === 'FIXED_UNTIL'" class="validity-detail">
              <el-date-picker
                v-model="form.validEndTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择有效截止时间"
                clearable
                :disabled="coreLocked"
                class="validity-date-control"
              />
              </div>
            </div>
          </el-form-item>
        </el-form>
      </template>
      <div class="footer-actions">
        <el-button
          v-if="!onlyView"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ isEditMode ? "保存修改" : (form.cardType === "PICKUP" ? "创建提货卡" : "创建现金卡") }}
        </el-button>
        <el-button @click="closeCurrentPage">{{ onlyView ? "返回" : "取消" }}</el-button>
      </div>
    </el-card>

    <lili-dialog ref="pickupSelector" :query-params="{ goodsType: 'PHYSICAL_GOODS', marketEnable: 'UPPER', authFlag: 'PASS' }" @selectedGoodsData="confirmPickupGoods" />

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  saveGiftCardCashActivity,
  getGiftCardCashActivity,
  updateGiftCardCashActivity,
} from "@/api/promotion";
import { regular } from "@/utils";
import { unixToDate } from "@/utils/filters";
import { formatSkuSpecs } from "@/utils/specs";
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";
import LiliDialog from "@/components/lili-dialog/index.vue";

defineOptions({ name: "addGiftCardCashActivity" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const detailLoading = ref(false);
const submitLoading = ref(false);
const activityDetail = ref({});

const form = reactive({
  giftCardName: "",
  cardType: route.query.cardType === "PICKUP" ? "PICKUP" : "CASH",
  pickupMode: "ONE",
  pickupCount: 1,
  faceValue: "",
  stockTotal: null,
  validityType: "LONG_TERM",
  validEndTime: null,
  validMonthsAfterActivate: null,
});

const formRef = ref(null);
const pickupGoods = ref([]);
const pickupSelector = ref(null);
const coreLocked = computed(() => Number(activityDetail.value.stockTotal || 0) - Number(activityDetail.value.remainingStock ?? activityDetail.value.stockTotal ?? 0) > 0);
/** 复用公共 SKU 选择器，取消不改变已确认商品。 */
function openPickupGoods() {
  pickupSelector.value.goodsData = pickupGoods.value.map(g => ({ ...g }));
  pickupSelector.value.open('goods');
}
/** 选择确认时校验数量并按 SKU 去重，服务端仍执行完整校验。 */
function confirmPickupGoods(rows) {
  if (rows.length > 50) return Message.warning('最多选择 50 个 SKU');
  pickupGoods.value = Array.from(new Map(rows.map(row => [String(row.id || row.skuId), { ...row, id: String(row.id || row.skuId) }])).values());
}

const onlyView = computed(() => {
  const q = route.query.onlyView;
  return q === "true" || q === true;
});

const isEditMode = computed(() => {
  return !!route.query.id && !onlyView.value;
});

const pageTitle = computed(() => {
  const name = form.cardType === "PICKUP" ? "提货卡" : "现金卡";
  if (onlyView.value) {
    return `查看${name}`;
  }
  if (isEditMode.value) {
    return `编辑${name}`;
  }
  return `添加${name}`;
});

const validityDisplayText = computed(() => {
  const type = String(form.validityType || "").toUpperCase();
  if (type === "LONG_TERM") {
    return "长期有效";
  }
  if (type === "AFTER_ACTIVATE_MONTHS") {
    const m = form.validMonthsAfterActivate;
    return m != null && m !== "" ? `自激活后 ${m} 个月内有效` : "自激活后指定月数有效";
  }
  if (type === "FIXED_UNTIL") {
    return form.validEndTime ? `指定有效期至 ${form.validEndTime}` : "指定时间有效";
  }
  return "-";
});

const checkFaceValue = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("面额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("面额设置超过上限值"));
  } else if (parseFloat(value) < 0.01) {
    callback(new Error("面值必须大于 0"));
  } else {
    callback();
  }
};

const validateStock = (rule, value, callback) => {
  if (value === null || value === undefined || value === "") {
    callback(new Error("请填写总库存"));
    return;
  }
  if (Number(value) < 1) {
    callback(new Error("活动库存至少为 1"));
    return;
  }
  callback();
};

const formRule = {
  giftCardName: [
    { required: true, message: "活动名称不能为空", trigger: "blur" },
    { type: "string", max: 64, message: "活动名称过长", trigger: "blur" },
  ],
  faceValue: [{ validator: (rule, value, cb) => form.cardType === "PICKUP" ? cb() : checkFaceValue(rule, value, cb) }],
  stockTotal: [{ required: true, validator: validateStock, trigger: "blur" }],
};

const parseDetailDate = (val) => {
  if (!val) {
    return null;
  }
  if (val instanceof Date) {
    return val;
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

const loadDetail = (id) => {
  detailLoading.value = true;
  getGiftCardCashActivity(id)
    .then((res) => {
      if (!res.success || !res.result) {
        return;
      }
      activityDetail.value = res.result;
      const d = res.result;
      form.giftCardName = d.giftCardName || "";
      form.cardType = d.cardType || "CASH";
      form.pickupMode = d.pickupMode || "ONE"; form.pickupCount = d.pickupCount || 1;
      pickupGoods.value = d.pickupGoods || [];
      form.faceValue =
        d.faceValue !== null && d.faceValue !== undefined ? String(d.faceValue) : "";
      form.stockTotal =
        d.stockTotal !== null && d.stockTotal !== undefined ? d.stockTotal : null;
      form.validityType = d.validityType || "LONG_TERM";
      const endDate = parseDetailDate(d.validEndTime);
      form.validEndTime = endDate ? unixToDate(endDate.getTime() / 1000) : null;
      form.validMonthsAfterActivate =
        d.validMonthsAfterActivate !== null &&
        d.validMonthsAfterActivate !== undefined &&
        d.validMonthsAfterActivate !== ""
          ? d.validMonthsAfterActivate
          : null;
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

const closeCurrentPage = () => {
  const name = route.name;
  if (name && appStore?.removeTag) {
    appStore.removeTag(name);
  }
  if (localStorage?.pageOpenedList && appStore?.pageOpenedList) {
    localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  }
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push({ name: "manager-gift-card-cash" });
  }
};

const validateByValidityType = () => {
  const t = form.validityType;
  if (t === "FIXED_UNTIL") {
    if (!form.validEndTime) {
      Message.warning("请选择结束时间");
      return false;
    }
  }
  if (t === "AFTER_ACTIVATE_MONTHS") {
    const m = form.validMonthsAfterActivate;
    if (m === null || m === undefined || m === "" || Number(m) < 1 || Number(m) > 99) {
      Message.warning("请输入1-99的整数");
      return false;
    }
  }
  return true;
};

const buildPayload = () => {
  const payload = {
    giftCardName: (form.giftCardName || "").trim(),
    cardType: form.cardType || "CASH",
    faceValue: form.cardType === "PICKUP" ? 0 : parseFloat(form.faceValue),
    pickupMode: form.cardType === "PICKUP" ? form.pickupMode : null,
    pickupCount: form.pickupMode === "ALL" ? pickupGoods.value.length : form.pickupMode === "ONE" ? 1 : form.pickupCount,
    pickupSkuIds: form.cardType === "PICKUP" ? pickupGoods.value.map(g => g.id) : null,
    validityType: form.validityType || "LONG_TERM",
    stockTotal: form.stockTotal,
  };
  if (payload.validityType === "FIXED_UNTIL") {
    const endDate = new Date(form.validEndTime);
    payload.validEndTime = Number.isNaN(endDate.getTime())
      ? form.validEndTime
      : endDate.getTime();
  }
  if (payload.validityType === "AFTER_ACTIVATE_MONTHS") {
    payload.validMonthsAfterActivate = form.validMonthsAfterActivate;
  }
  return payload;
};

const handleSubmit = () => {
  if (onlyView.value) {
    return;
  }
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    if (!validateByValidityType()) {
      return;
    }
    if (form.cardType === 'PICKUP' && (!pickupGoods.value.length || (form.pickupMode === 'ANY' && (!Number.isInteger(form.pickupCount) || form.pickupCount < 1 || form.pickupCount > pickupGoods.value.length)))) {
      Message.warning('请选择兑换商品，并填写不超过商品种数的兑换数量'); return;
    }
    submitLoading.value = true;
    const req = isEditMode.value
      ? updateGiftCardCashActivity(route.query.id, buildPayload())
      : saveGiftCardCashActivity(buildPayload());
    req
      .then((res) => {
        if (res.success) {
          Message.success(isEditMode.value ? "礼品卡活动已更新" : "礼品卡活动创建成功");
          closeCurrentPage();
        }
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
};

watch(
  () => form.validityType,
  (v) => {
    if (v !== "FIXED_UNTIL") {
      form.validEndTime = null;
    }
    if (v !== "AFTER_ACTIVATE_MONTHS") {
      form.validMonthsAfterActivate = null;
    }
  }
);

watch(
  () => route.query.cardType,
  (type) => {
    if (!route.query.id) form.cardType = type === "PICKUP" ? "PICKUP" : "CASH";
  }
);

watch(
  () => route.query.id,
  (id) => {
    if (id) {
      loadDetail(id);
    }
  }
);

onMounted(() => {
  if (route.query.id) {
    loadDetail(route.query.id);
  }
});
</script>

<style lang="scss" scoped>
.gift-card-activity-page {
  padding: 28px 24px;
  box-sizing: border-box;
  .info-card { width: 100%; max-width: 1040px; margin: 0 auto; border: 1px solid var(--el-border-color-extra-light); border-radius: 8px; }
  .info-card :deep(.el-card__header) { padding: 30px 40px 0; border-bottom: 0; }
  .info-card :deep(.el-card__body) { padding: 28px 40px 32px; }
  .page-header-row { max-width: 640px; margin: 0 auto; }
  .header-title { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; color: var(--el-text-color-primary); font-size: 20px; font-weight: 600; line-height: 28px; }
  .mode-tag { font-weight: normal; }
  .activity-id { color: var(--el-text-color-secondary); font-size: 12px; font-weight: normal; }
  .edit-form { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px 20px; max-width: 640px; margin: 0 auto; }
  .full-row { grid-column: 1 / -1; }
  .edit-form :deep(.el-form-item) { min-width: 0; margin: 0; }
  .edit-form :deep(.el-form-item__label) { margin-bottom: 10px; padding: 0; font-size: 14px; line-height: 20px; color: var(--el-text-color-regular); }
  .edit-form :deep(.el-form-item__content) { min-width: 0; }
  .edit-form :deep(.el-input__wrapper) { border-radius: 5px; }
  .form-control { width: 100%; max-width: 100%; }
  .input-tip-text { margin-left: 12px; font-size: 12px; color: var(--el-text-color-secondary); }
  .unit-control { display: flex; align-items: stretch; }
  .unit-control :deep(.el-input-number) { flex: 1; width: 0; min-width: 0; }
  .unit-control :deep(.el-input__wrapper) { border-radius: 5px 0 0 5px; }
  .unit-control :deep(.el-input__inner) { text-align: left; }
  .unit-addon { display: flex; align-items: center; flex-shrink: 0; padding: 0 14px; border: 1px solid var(--el-border-color); border-left: 0; border-radius: 0 5px 5px 0; color: var(--el-text-color-regular); background: var(--el-fill-color-light); box-sizing: border-box; font-size: 14px; }
  .validity-control { width: 100%; min-width: 0; }
  .validity-radio-group { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; width: 100%; }
  .validity-radio-group :deep(.el-radio) { display: flex; justify-content: center; height: 48px; margin: 0; padding: 0 12px; border: 1px solid var(--el-border-color); border-radius: 6px; box-sizing: border-box; transition: border-color .15s, background-color .15s; }
  .validity-radio-group :deep(.el-radio:hover:not(.is-disabled)) { border-color: var(--el-color-primary-light-5); }
  .validity-radio-group :deep(.el-radio.is-checked) { border-color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  .validity-radio-group :deep(.el-radio__label) { font-size: 14px; }
  .validity-detail { display: flex; margin-top: 12px; padding: 16px; background: #f7f9fc; border: 1px solid var(--el-border-color-extra-light); border-radius: 6px; }
  .month-control { width: 200px; max-width: 100%; }
  .validity-date-control { width: 100%; max-width: 360px; }
  .footer-actions { display: flex; flex-wrap: wrap; gap: 12px; max-width: 640px; margin: 32px auto 0; padding-top: 24px; border-top: 1px solid var(--el-border-color-lighter); }
  .footer-actions :deep(.el-button) { min-width: 88px; height: 36px; border-radius: 5px; }
  .footer-actions :deep(.el-button + .el-button) { margin-left: 0; }
  .font-mono { font-variant-numeric: tabular-nums; }
  .font-semibold { font-weight: 600; }
  .text-dark { color: var(--el-text-color-primary); }
  .text-secondary { color: var(--el-text-color-regular); }
  .custom-descriptions :deep(.el-descriptions__label) { width: 130px; font-weight: normal; }
  .price-highlight { color: var(--el-text-color-primary); }
  &.pickup-page .info-card { max-width: 1200px; }
  &.pickup-page .page-header-row, &.pickup-page .edit-form, &.pickup-page .footer-actions { max-width: none; }
  &.pickup-page .stock-form-item { max-width: 420px; }
}
@media (max-width: 760px) {
  .gift-card-activity-page {
    padding: 16px 12px;
    .info-card :deep(.el-card__header) { padding: 24px 20px 0; }
    .info-card :deep(.el-card__body) { padding: 24px 20px; }
    .edit-form { grid-template-columns: minmax(0, 1fr); }
    .validity-radio-group { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .validity-radio-group :deep(.el-radio) { justify-content: flex-start; height: 40px; }
    .validity-detail { padding: 12px; }
  }
}
</style>
