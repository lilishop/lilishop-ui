<template>
  <div class="gift-card-activity-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>{{ pageTitle }}</span>
            <el-tag
              size="small"
              effect="plain"
              :type="onlyView ? 'info' : (isEditMode ? 'warning' : 'primary')"
              class="mode-tag"
            >
              {{ onlyView ? "查看模式" : (isEditMode ? "编辑模式" : "新建模式") }}
            </el-tag>
            <el-tag
              v-if="form.cardType"
              size="small"
              effect="dark"
              type="primary"
              class="type-tag"
            >
              {{ form.cardType === "CASH" ? "现金卡" : "提货卡" }}
            </el-tag>
            <span v-if="route.query.id" class="activity-id font-mono">
              ID: {{ route.query.id }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="closeCurrentPage">返回礼品卡列表</el-button>
        </div>
      </div>
    </el-card>

    <!-- 礼品卡基础信息卡片 -->
    <el-card shadow="never" v-loading="detailLoading" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">礼品卡配置信息</span>
      </div>

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

          <el-descriptions-item label="礼品卡面值">
            <span class="price-highlight font-mono font-semibold">
              {{ form.faceValue ? $filters.unitPrice(form.faceValue, "￥") : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="总库存">
            <span class="font-mono text-dark font-semibold">
              {{ form.stockTotal != null ? `${form.stockTotal} 张` : "-" }}
            </span>
            <span class="hint-inline">（最多可制发凭证张数）</span>
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
      </template>

      <!-- 编辑 / 新增模式：表单输入 -->
      <template v-else>
        <el-form
          ref="formRef"
          :model="form"
          label-width="120px"
          :rules="formRule"
          class="edit-form"
        >
          <el-form-item label="礼品卡名称" prop="giftCardName">
            <el-input
              v-model="form.giftCardName"
              type="text"
              placeholder="请输入礼品卡名称"
              clearable
              maxlength="64"
              show-word-limit
              style="width: 380px"
            />
          </el-form-item>

          <el-form-item label="礼品卡类型" prop="cardType">
            <el-radio-group v-model="form.cardType">
              <el-radio value="CASH">现金卡</el-radio>
              <el-radio value="PICKUP" disabled>提货卡（暂未开放）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="面值" prop="faceValue">
            <el-input
              v-model="form.faceValue"
              type="number"
              placeholder="请填写面值金额"
              clearable
              style="width: 260px"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="总库存" prop="stockTotal">
            <el-input-number
              v-model="form.stockTotal"
              :min="1"
              :precision="0"
              placeholder="最多可制发凭证张数"
              style="width: 220px"
            />
            <span class="input-tip-text">张（最多可制发凭证张数）</span>
          </el-form-item>

          <el-form-item label="有效期限" required class="validity-form-item">
            <el-radio-group v-model="form.validityType" class="validity-radio-group">
              <div class="validity-row">
                <el-radio value="LONG_TERM">长期有效</el-radio>
              </div>

              <div class="validity-row">
                <el-radio value="AFTER_ACTIVATE_MONTHS">
                  <span class="radio-inline-text">自激活后</span>
                  <el-input-number
                    v-model="form.validMonthsAfterActivate"
                    :min="1"
                    :max="99"
                    :precision="0"
                    placeholder="1-99"
                    :disabled="form.validityType !== 'AFTER_ACTIVATE_MONTHS'"
                    class="validity-input-num"
                  />
                  <span class="radio-inline-text">个月内有效</span>
                </el-radio>
              </div>

              <div class="validity-row">
                <el-radio value="FIXED_UNTIL">
                  <span class="radio-inline-text">指定有效期至</span>
                  <el-date-picker
                    v-model="form.validEndTime"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择有效截止时间"
                    clearable
                    :disabled="form.validityType !== 'FIXED_UNTIL'"
                    class="validity-date-picker"
                    style="width: 220px"
                  />
                </el-radio>
              </div>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </el-card>

    <!-- 底部操作栏 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button @click="closeCurrentPage">
          {{ onlyView ? "返回" : "取消" }}
        </el-button>
        <el-button
          v-if="!onlyView"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ isEditMode ? "保存修改" : "提交创建" }}
        </el-button>
      </div>
    </el-card>
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
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "addGiftCardCashActivity" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const detailLoading = ref(false);
const submitLoading = ref(false);
const activityDetail = ref({});

const form = reactive({
  giftCardName: "",
  cardType: "CASH",
  faceValue: "",
  stockTotal: null,
  validityType: "LONG_TERM",
  validEndTime: null,
  validMonthsAfterActivate: null,
});

const formRef = ref(null);

const onlyView = computed(() => {
  const q = route.query.onlyView;
  return q === "true" || q === true;
});

const isEditMode = computed(() => {
  return !!route.query.id && !onlyView.value;
});

const pageTitle = computed(() => {
  if (onlyView.value) {
    return "查看礼品卡";
  }
  if (isEditMode.value) {
    return "编辑礼品卡";
  }
  return "添加礼品卡";
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
  faceValue: [{ required: true, message: "请输入面额" }, { validator: checkFaceValue }],
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
    faceValue: parseFloat(form.faceValue),
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
  padding: 16px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  box-sizing: border-box;

  .mt_10 {
    margin-top: 12px;
  }

  .font-mono {
    font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-secondary {
    color: #606266;
  }

  .header-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .page-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2d3d;

          .mode-tag,
          .type-tag {
            font-weight: normal;
          }

          .activity-id {
            font-size: 13px;
            color: #909399;
            font-weight: normal;
          }
        }
      }
    }
  }

  .info-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .section-indicator {
        width: 4px;
        height: 16px;
        background-color: #409eff;
        border-radius: 2px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 130px;
        background-color: #f8f9fb;
        color: #606266;
        font-weight: 500;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }

      .price-highlight {
        color: #f56c6c;
        font-size: 16px;
      }

      .hint-inline {
        font-size: 12px;
        color: #909399;
        margin-left: 6px;
      }
    }

    .edit-form {
      padding: 8px 12px;

      .input-tip-text {
        font-size: 13px;
        color: #909399;
        margin-left: 10px;
      }

      .validity-radio-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        width: 100%;

        .validity-row {
          display: flex;
          align-items: center;

          :deep(.el-radio) {
            margin-right: 0;
            display: inline-flex;
            align-items: center;
          }

          :deep(.el-radio__label) {
            display: inline-flex;
            align-items: center;
          }

          .radio-inline-text {
            font-size: 14px;
          }

          .validity-input-num {
            width: 130px;
            margin: 0 10px;
          }

          .validity-date-picker {
            margin-left: 10px;
          }
        }
      }
    }
  }

  .footer-card {
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}
</style>
