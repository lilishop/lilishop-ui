<template>
  <div class="coupon-publish-page">
    <div class="page-heading">
      <div>
        <h1>{{ isOnlyView ? "平台优惠券详情" : id ? "编辑平台优惠券" : "添加平台优惠券" }}</h1>
        <p>设置优惠内容、领取规则及适用范围</p>
      </div>
      <el-button @click="closeCurrentPage">返回优惠券列表</el-button>
    </div>
    <el-form
      :disabled="disabled"
      ref="formRef"
      :model="form"
      label-position="top"
      :rules="formRule"
      class="coupon-form"
    >
      <el-card shadow="never" class="type-card">
        <div class="type-heading">选择优惠券类型</div>
        <el-radio-group
          v-model="couponKind"
          class="coupon-type-options"
          @change="changeCouponKind"
          aria-label="优惠券类型"
        >
          <el-radio-button value="FULL_REDUCTION"
            ><span class="type-name">满减优惠券</span
            ><span class="type-description">消费满指定金额，减免现金</span></el-radio-button
          >
          <el-radio-button value="DISCOUNT"
            ><span class="type-name">满折优惠券</span
            ><span class="type-description">消费满指定金额，享受折扣</span></el-radio-button
          >
          <el-radio-button value="DIRECT_REDUCTION"
            ><span class="type-name">立减优惠券</span
            ><span class="type-description">无消费金额门槛，直接减免</span></el-radio-button
          >
        </el-radio-group>
      </el-card>
      <div class="coupon-layout">
        <el-card shadow="never" class="editor-card">
          <section class="form-section">
            <div class="section-heading">
              <span class="section-number">01</span>
              <h2>基本信息</h2>
            </div>
            <div class="form-grid">
              <el-form-item label="活动名称" prop="promotionName"
                ><el-input
                  v-model="form.promotionName"
                  placeholder="例如：双十一平台优惠"
                  clearable
              /></el-form-item>
              <el-form-item label="优惠券名称" prop="couponName"
                ><el-input v-model="form.couponName" placeholder="例如：新客专享优惠券" clearable
              /></el-form-item>
            </div>
          </section>
          <section class="form-section">
            <div class="section-heading">
              <span class="section-number">02</span>
              <h2>优惠规则</h2>
            </div>
            <div class="form-grid">
              <el-form-item
                v-if="couponKind !== 'DIRECT_REDUCTION'"
                label="消费门槛"
                prop="consumeThreshold"
              >
                <el-input
                  v-model="form.consumeThreshold"
                  :validate-event="false"
                  @blur="formRef?.validateField('consumeThreshold').catch(() => {})"
                  placeholder="请输入最低消费金额"
                  clearable
                  ><template #append>元</template></el-input
                >
                <div class="form-tip">适用商品金额达到门槛后可使用</div>
              </el-form-item>
              <el-form-item v-if="form.couponType === 'PRICE'" label="减免金额" prop="price">
                <el-input v-model="form.price" placeholder="请输入减免金额" clearable
                  ><template #append>元</template></el-input
                >
                <div class="form-tip">最多支持两位小数</div>
              </el-form-item>
              <el-form-item v-else label="优惠折扣" prop="couponDiscount">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="form.couponDiscount"
                    :min="0.1"
                    :max="9.9"
                    :step="0.1"
                    :precision="1"
                    controls-position="right"
                    placeholder="请输入折扣"
                  /><span>折</span>
                </div>
                <div class="form-tip">例如：8.5 折，即按原价的 85% 支付</div>
              </el-form-item>
              <div v-if="couponKind === 'DIRECT_REDUCTION'" class="no-threshold-note">
                <span class="no-threshold-badge">无门槛</span
                ><span>适用商品可直接抵扣，最多抵扣商品金额。</span>
              </div>
              <el-form-item label="店铺承担比例" prop="storeCommission">
                <el-input v-model="form.storeCommission" placeholder="请输入店铺承担比例"
                  ><template #append>%</template></el-input
                >
                <div class="form-tip">店铺承担优惠金额的比例，范围 0–100</div>
              </el-form-item>
            </div>
          </section>
          <section class="form-section">
            <div class="section-heading">
              <span class="section-number">03</span>
              <h2>发放与使用</h2>
            </div>
            <div class="form-grid">
              <template v-if="form.getType === 'FREE'">
                <el-form-item label="发放数量" prop="publishNum"
                  ><el-input v-model="form.publishNum" placeholder="请输入发放数量"
                    ><template #append>张</template></el-input
                  >
                  <div class="form-tip">设为 0 表示不限发放数量</div></el-form-item
                >
                <el-form-item label="每人限领" prop="couponLimitNum"
                  ><el-input
                    v-model="form.couponLimitNum"
                    placeholder="请输入每人可领取张数"
                    clearable
                    ><template #append>张</template></el-input
                  >
                  <div class="form-tip">设为 0 表示不限领取数量</div></el-form-item
                >
              </template>
              <el-form-item label="有效期" prop="rangeTime" class="full-width">
                <el-date-picker
                  v-if="rangeTimeType === 1"
                  type="datetimerange"
                  v-model="form.rangeTime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  range-separator="至"
                  :disabled-date="options.disabledDate"
                  class="validity-picker"
                />
                <div v-else class="effective-days">
                  <span>领取当天起</span
                  ><el-input-number
                    v-model="form.effectiveDays"
                    :min="1"
                    :max="365"
                    controls-position="right"
                  /><span>天内有效</span>
                </div>
                <div v-if="rangeTimeType === 0" class="form-tip">有效天数为 1–365 天的整数</div>
              </el-form-item>
              <el-form-item label="使用范围" prop="scopeType" class="full-width"
                ><el-radio-group v-model="form.scopeType" class="scope-options"
                  ><el-radio-button value="ALL">全平台商品</el-radio-button
                  ><el-radio-button value="PORTION_GOODS">指定商品</el-radio-button
                  ><el-radio-button value="PORTION_GOODS_CATEGORY"
                    >指定分类</el-radio-button
                  ></el-radio-group
                ></el-form-item
              >
              <el-form-item
                v-if="form.scopeType == 'PORTION_GOODS'"
                :label-width="0"
                class="portion-goods-form-item full-width"
              >
                <div class="portion-goods-wrapper">
                  <div class="portion-goods-toolbar">
                    <div class="portion-goods-heading">
                      <h3>指定商品</h3>
                      <span>已选 {{ form.promotionGoodsList.length }} 件商品</span>
                    </div>
                    <div
                      v-if="!isOnlyView && form.promotionGoodsList.length"
                      class="goods-toolbar-actions"
                    >
                      <el-button
                        v-if="selectedGoods.length"
                        type="danger"
                        plain
                        @click="delSelectGoods"
                      >
                        批量删除 ({{ selectedGoods.length }})
                      </el-button>
                      <el-button type="primary" :icon="Plus" @click="openSkuList"
                        >选择商品</el-button
                      >
                    </div>
                  </div>

                  <el-table
                    v-if="form.promotionGoodsList.length"
                    :data="form.promotionGoodsList"
                    style="width: 100%"
                    empty-text="暂无指定商品数据"
                    class="portion-goods-table"
                    row-key="skuId"
                    scrollbar-always-on
                    @selection-change="changeSelect"
                  >
                    <el-table-column
                      v-if="!isOnlyView"
                      type="selection"
                      width="50"
                      align="center"
                    />
                    <el-table-column label="图片" width="76" align="center">
                      <template #default="{ row }">
                        <el-image
                          v-if="row && row.thumbnail"
                          :src="row.thumbnail"
                          fit="cover"
                          class="table-goods-thumb"
                          preview-teleported
                          :preview-src-list="[row.thumbnail]"
                        >
                          <template #error>
                            <div class="thumb-slot">无图</div>
                          </template>
                        </el-image>
                        <div v-else class="table-goods-thumb thumb-slot">无图</div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="goodsName" label="商品名称" min-width="280">
                      <template #default="{ row }">
                        <div class="selected-goods-name" :title="row.goodsName">
                          {{ row.goodsName || "-" }}
                        </div>
                        <div class="selected-goods-sku">SKU：{{ row.skuId }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column label="商品单价" width="130" align="right">
                      <template #default="{ row }">
                        <span v-if="row" class="price-text font-mono font-semibold">
                          {{ $filters.unitPrice(row.price, "￥") }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column label="库存" width="100" align="right">
                      <template #default="{ row }">
                        <span v-if="row" class="font-mono">{{ row.quantity ?? "-" }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      v-if="!isOnlyView"
                      label="操作"
                      width="90"
                      align="center"
                      fixed="right"
                    >
                      <template #default="{ $index }">
                        <el-button type="danger" size="small" link @click="delGoods($index)">
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div v-else class="portion-goods-empty">
                    <div class="empty-icon">
                      <el-icon :size="28"><ShoppingBag /></el-icon>
                    </div>
                    <h3>选择优惠券适用的商品</h3>
                    <p>
                      {{
                        isOnlyView
                          ? "暂无指定商品"
                          : "仅选中的商品可使用该优惠券，可一次添加多个商品"
                      }}
                    </p>
                    <el-button v-if="!isOnlyView" type="primary" :icon="Plus" @click="openSkuList"
                      >选择商品</el-button
                    >
                  </div>
                </div>
              </el-form-item>

              <el-form-item
                v-if="form.scopeType === 'PORTION_GOODS_CATEGORY'"
                label="适用分类"
                class="full-width"
                ><el-cascader
                  :options="goodsCategoryList"
                  v-model="form.scopeIdGoods"
                  placeholder="请选择适用的商品分类"
                  clearable
              /></el-form-item>
              <el-form-item label="范围描述" prop="description" class="full-width"
                ><el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  maxlength="50"
                  show-word-limit
                  placeholder="请输入优惠券适用范围或简要说明"
              /></el-form-item>
            </div>
          </section>
        </el-card>
        <aside class="preview-panel" aria-label="优惠券预览">
          <div class="preview-heading">券面预览<span>随填写实时更新</span></div>
          <div class="coupon-ticket">
            <div class="ticket-benefit">
              <span class="ticket-type">{{ couponTypeName }}</span>
              <div class="ticket-amount">
                <span v-if="form.couponType === 'PRICE'" class="amount-unit">¥</span
                >{{ previewAmount
                }}<span v-if="form.couponType === 'DISCOUNT'" class="amount-unit">折</span>
              </div>
              <div class="ticket-condition">{{ previewCondition }}</div>
            </div>
            <div class="ticket-details">
              <div class="ticket-name">{{ form.couponName || "优惠券名称" }}</div>
              <div>{{ previewScope }}</div>
              <div v-if="form.description">{{ form.description }}</div>
              <div>{{ previewValidity }}</div>
            </div>
          </div>
          <div class="preview-note">预览仅供参考，实际展示以买家端为准。</div>
        </aside>
      </div>
    </el-form>
    <div class="form-footer">
      <span>{{
        isOnlyView ? "只读模式" : form.getType === "ACTIVITY" ? "活动赠送券" : "买家可主动领取"
      }}</span>
      <div class="footer-buttons">
        <el-button @click="closeCurrentPage">{{ isOnlyView ? "返回列表" : "取消" }}</el-button
        ><el-button v-if="!isOnlyView" type="primary" :loading="submitLoading" @click="handleSubmit"
          >保存优惠券</el-button
        >
      </div>
    </div>
    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>
<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { Plus, ShoppingBag } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import {
  savePlatformCoupon,
  getPlatformCoupon,
  editPlatformCoupon,
} from "@/api/promotion";
import { getCategoryTree } from "@/api/goods";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";
import skuSelect from "@/components/lili-dialog";

defineOptions({ name: "edit-platform-coupon" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const formRef = ref(null);
const skuSelectRef = ref(null);

const checkPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("面额不能为空"));
  } else if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value))) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (Number(value) <= 0) {
    callback(new Error("面额必须大于0"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("面额设置超过上限值"));
  } else {
    callback();
  }
};
const checkWeight = (rule, value, callback) => {
  if (!value && typeof value !== "number") {
    callback(new Error("消费门槛不能为空"));
  } else if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value))) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (Number(value) <= 0) {
    callback(new Error("消费门槛必须大于0"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("消费门槛设置超过上限值"));
  } else {
    callback();
  }
};

const isOnlyView = computed(() => route.query.onlyView === "true" || route.query.onlyView === true);
const disabled = computed(() => isOnlyView.value);

const couponKind = ref("FULL_REDUCTION");
const couponTypeName = computed(() => form.value.couponType === "DISCOUNT" ? "满折优惠券" : (Number(form.value.consumeThreshold) === 0 ? "立减优惠券" : "满减优惠券"));
function changeCouponKind(kind) {
  form.value.couponType = kind === "DISCOUNT" ? "DISCOUNT" : "PRICE";
  if (kind === "DIRECT_REDUCTION") {
    form.value.consumeThreshold = 0;
  } else if (!(Number(form.value.consumeThreshold) > 0)) {
    form.value.consumeThreshold = undefined;
  }
  if (kind === "DISCOUNT") form.value.price = undefined;
  else form.value.couponDiscount = undefined;
  nextTick(() => formRef.value?.clearValidate());
}

const rangeTimeType = ref(1);
const modalType = ref(0);
function defaultCouponRangeTime() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start, end].map((date) => unixToDate(date.getTime() / 1000));
}

const form = ref({
  storeCommission: 0,
  publishNum: 0,
  scopeType: "ALL",
  couponLimitNum: 1,
  couponType: "PRICE",
  couponName: "",
  promotionName: "",
  getType: route.query.getType === "ACTIVITY" ? "ACTIVITY" : "FREE",
  promotionGoodsList: [],
  scopeIdGoods: [],
  rangeDayType: "",
  rangeTime: route.query.id ? [] : defaultCouponRangeTime(),
  effectiveDays: 1,
});
const id = ref(route.query.id);
const submitLoading = ref(false);
const selectedGoods = ref([]);
const goodsCategoryList = ref([]);

const formRule = reactive({
  promotionName: [{ required: true, message: "活动名称不能为空" }],
  couponName: [{ required: true, message: "优惠券名称不能为空" }],
  price: [{ required: true, message: "请输入面额" }, { validator: checkPrice }],
  rangeTime: [{ required: true, message: "请选择优惠券有效期" }],
  consumeThreshold: [
    { required: true, message: "请输入消费门槛" },
    { validator: checkWeight },
  ],
  couponDiscount: [
    { required: true, message: "请输入折扣" },
    {
      pattern: regular.discount,
      message: "请输入0-10的数字,可有一位小数",
    },
  ],
  storeCommission: [
    { required: true, message: "请输入店铺承担比例" },
    { pattern: regular.rate, message: "请输入0-100的正整数" },
  ],
  publishNum: [
    { required: true, message: "请输入发放数量" },
    { pattern: regular.Integer, message: "请输入正整数" },
  ],
  couponLimitNum: [
    { required: true, message: "领取限制不能为空" },
    { pattern: regular.Integer, message: "请输入正整数" },
  ],
  description: [{ required: true, message: "请输入范围描述" }],
});

const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const previewAmount = computed(() => {
  const value = form.value.couponType === "DISCOUNT" ? form.value.couponDiscount : form.value.price;
  return value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value)) ? value : "—";
});
const previewCondition = computed(() => {
  if (couponKind.value === "DIRECT_REDUCTION") return "无消费金额门槛";
  return Number(form.value.consumeThreshold) > 0 ? "满 " + form.value.consumeThreshold + " 元可用" : "达到指定消费金额后可用";
});
const previewScope = computed(() => {
  if (form.value.scopeType === "PORTION_GOODS") return "指定商品可用 · 已选 " + form.value.promotionGoodsList.length + " 件";
  return form.value.scopeType === "ALL" ? "全平台商品通用" : "指定商品分类可用";
});
const previewValidity = computed(() => {
  if (rangeTimeType.value === 0) return "领取当天起 " + (form.value.effectiveDays || "—") + " 天内有效";
  const range = form.value.rangeTime;
  if (!range || range.length !== 2) return "请设置有效期";
  return formatTime(range[0]).slice(0, 10) + " 至 " + formatTime(range[1]).slice(0, 10);
});


function formatTime(val) {
  if (!val) return "-";
  const d = val instanceof Date ? val : new Date(val);
  return unixToDate(d.getTime() / 1000);
}

watch(
  () => form.value.getType,
  (val) => {
    if (val == "FREE") {
      rangeTimeType.value = 1;
      formRule.rangeTime = [{ required: true, message: "请选择优惠券有效期" }];
    } else {
      rangeTimeType.value = 0;
    }
    if (rangeTimeType.value == 0) {
      delete formRule.rangeTime;
    }
  },
  { immediate: true }
);

watch(
  () => route.query,
  (e) => {
    id.value = e.id;
    if (id.value) {
      modalType.value = 1;
      getCoupon();
    } else {
      formRef.value?.resetFields();
      couponKind.value = "FULL_REDUCTION";
      changeCouponKind(couponKind.value);
      modalType.value = 0;
      form.value.getType = e.getType === "ACTIVITY" ? "ACTIVITY" : "FREE";
      form.value.rangeTime = defaultCouponRangeTime();
    }
  }
);

onMounted(async () => {
  await getCagetoryList();
  if (id.value) {
    getCoupon();
    modalType.value = 1;
  }
});

function getCoupon() {
  getPlatformCoupon(id.value).then((res) => {
    let data = res.result;
    if (!data.promotionGoodsList) data.promotionGoodsList = [];
    rangeTimeType.value = data.rangeDayType === "DYNAMICTIME" ? 0 : 1;
    if (data.scopeType == "PORTION_GOODS_CATEGORY") {
      let prevCascader = data.scopeId ? data.scopeId.split(",") : [];
      function next(params, prev) {
        for (let i = 0; i < params.length; i++) {
          const item = params[i];
          if (item.children) {
            next(item.children, [...prev, item]);
          } else {
            if (prevCascader.includes(item.id)) {
              prevCascader = prevCascader.map((key) => {
                if (key === item.id) {
                  let result = prev.map((item) => item.id);
                  return [...result, item.id];
                } else {
                  return key;
                }
              });
            } else {
              i === params.length - 1 && (prev = []);
            }
          }
        }
      }

      next(goodsCategoryList.value, []);
      data.scopeIdGoods = prevCascader;
    }
    data.rangeTime = [];
    if (data.startTime && data.endTime) {
      data.rangeTime.push(new Date(data.startTime), new Date(data.endTime));
    }
    form.value = data;
    couponKind.value = data.couponType === "DISCOUNT" ? "DISCOUNT" : (Number(data.consumeThreshold) === 0 ? "DIRECT_REDUCTION" : "FULL_REDUCTION");
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(form.value));
      if (couponKind.value === "DIRECT_REDUCTION") params.consumeThreshold = 0;
      if (params.couponType === "DISCOUNT") delete params.price;
      else delete params.couponDiscount;
      params.getType != "ACTIVITY" ? delete params.effectiveDays : "";

      if (rangeTimeType.value == 1) {
        params.rangeDayType = "FIXEDTIME";
        const rangeTime = form.value.rangeTime;
        const start = rangeTime[0] instanceof Date ? rangeTime[0] : new Date(rangeTime[0]);
        const end = rangeTime[1] instanceof Date ? rangeTime[1] : new Date(rangeTime[1]);
        params.startTime = unixToDate(start.getTime() / 1000);
        params.endTime = unixToDate(end.getTime() / 1000);
        delete params.effectiveDays;
      } else {
        params.rangeDayType = "DYNAMICTIME";
        delete params.rangeTime;
      }

      let scopeId = [];

      if (
        params.scopeType == "PORTION_GOODS" &&
        (!params.promotionGoodsList || params.promotionGoodsList.length == 0)
      ) {
        Modal.warning({ title: "提示", content: "请选择指定商品" });
        return;
      }

      if (
        params.scopeType == "PORTION_GOODS_CATEGORY" &&
        (!params.scopeIdGoods || params.scopeIdGoods.length == 0)
      ) {
        Modal.warning({ title: "提示", content: "请选择商品分类" });
        return;
      }

      if (params.scopeType == "PORTION_GOODS") {
        params.promotionGoodsList.forEach((item) => {
          scopeId.push(item.skuId);
        });
        params.scopeId = scopeId.toString();
      } else if (params.scopeType == "ALL") {
        delete params.promotionGoodsList;
      } else if (params.scopeType == "PORTION_GOODS_CATEGORY") {
        scopeId = filterCategoryId(params.scopeIdGoods, []);
        params.scopeId = scopeId.toString();
        delete params.promotionGoodsList;
      }
      delete params.scopeIdGoods;

      submitLoading.value = true;
      if (modalType.value === 0) {
        delete params.id;

        savePlatformCoupon(params).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("优惠券创建成功");
            closeCurrentPage();
          }
        });
      } else {
        delete params.consumeLimit;
        delete params.updateTime;

        editPlatformCoupon(params).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("优惠券修改成功");
            closeCurrentPage();
          }
        });
      }
    }
  });
}

function closeCurrentPage() {
  appStore.removeTag("edit-platform-coupon");
  appStore.removeTag("add-platform-coupon");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}

function openSkuList() {
  skuSelectRef.value.open("goods");
  let data = JSON.parse(JSON.stringify(form.value.promotionGoodsList));
  data.forEach((e) => {
    e.id = e.skuId;
  });
  skuSelectRef.value.goodsData = data;
}

function changeSelect(e) {
  selectedGoods.value = e;
}

function delSelectGoods() {
  if (selectedGoods.value.length <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选商品吗?",
    onOk: () => {
      let ids = [];
      selectedGoods.value.forEach(function (e) {
        ids.push(e.skuId);
      });

      form.value.promotionGoodsList = form.value.promotionGoodsList.filter((item) => {
        return !ids.includes(item.skuId);
      });
    },
  });
}

function delGoods(index) {
  form.value.promotionGoodsList.splice(index, 1);
}

function selectedGoodsData(item) {
  let list = [];
  item.forEach((e) => {
    list.push({
      goodsName: e.goodsName,
      price: e.price,
      originalPrice: e.price,
      quantity: e.quantity,
      storeId: e.storeId,
      storeName: e.storeName,
      skuId: e.id,
      categoryPath: e.categoryPath,
      thumbnail: e.thumbnail || e.small,
      goodsType: e.goodsType,
      goodsId: e.goodsId,
      originPrice: e.price,
    });
  });
  form.value.promotionGoodsList = list;
}

async function getCagetoryList() {
  let data = await getCategoryTree();
  goodsCategoryList.value = data.result;
  goodsCategoryList.value = goodsCategoryList.value.map((item) => {
    if (item.children) {
      item.children = item.children.map((child) => {
        if (child.children) {
          child.children = child.children.map((son) => {
            return {
              value: son.id,
              label: son.name,
            };
          });
          return {
            value: child.id,
            label: child.name,
            children: child.children,
          };
        } else {
          return {
            value: child.id,
            label: child.name,
          };
        }
      });
    }
    return { value: item.id, label: item.name, children: item.children };
  });
}

function filterCategoryId(list, idArr) {
  list.forEach((e) => {
    if (e instanceof Array) {
      filterCategoryId(e, idArr);
    } else {
      if (!idArr.includes(e)) idArr.push(e);
    }
  });
  return idArr;
}
</script>

<style lang="scss" scoped>
.coupon-publish-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 8px 12px 20px;
  color: #303133;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  h1 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
  }
  p {
    margin: 0;
    color: #909399;
    font-size: 13px;
  }
}
.type-card,
.editor-card,
.detail-card {
  border-radius: 8px;
  border-color: #e6e8eb;
}
.type-card {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding: 16px 20px 20px;
  }
}
.type-heading {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
}
.coupon-type-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  gap: 16px;
  :deep(.el-radio-button) {
    min-width: 0;
  }
  :deep(.el-radio-button__inner) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #e4e7ed;
    border-radius: 6px !important;
    background: #fff;
    text-align: left;
    box-shadow: none !important;
    white-space: normal;
  }
  :deep(.el-radio-button.is-active .el-radio-button__inner) {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
  :deep(.el-radio-button__original-radio:focus-visible + .el-radio-button__inner) {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 3px;
  }
}
.type-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
}
.type-description {
  font-size: 12px;
  line-height: 18px;
  color: #909399;
}
.coupon-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: start;
  gap: 24px;
}
.editor-card :deep(.el-card__body) {
  padding: 0 28px;
}
.form-section {
  padding: 20px 0 4px;
  & + & {
    border-top: 1px solid #ebeef5;
  }
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  h2 {
    margin: 0;
    font-size: 15px;
    line-height: 24px;
    font-weight: 600;
  }
}
.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f2f5f9;
  color: #7b8798;
  font-size: 12px;
  font-weight: 600;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  :deep(.el-form-item) {
    min-width: 0;
    margin-bottom: 24px;
  }
  :deep(.el-form-item__label) {
    color: #606266;
    font-weight: 500;
    margin-bottom: 8px;
    line-height: 20px;
  }
  :deep(.el-input),
  :deep(.el-cascader),
  :deep(.el-input-number) {
    width: 100%;
  }
  :deep(.el-input__wrapper) {
    min-height: 36px;
    box-sizing: border-box;
  }
  :deep(.el-form-item__content) {
    align-content: flex-start;
  }
}
.full-width {
  grid-column: 1 / -1;
}
.form-tip {
  width: 100%;
  font-size: 12px;
  line-height: 18px;
  margin-top: 7px;
  color: #909399;
}
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  color: #909399;
}
.no-threshold-note {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
.no-threshold-badge {
  color: #339978;
  background: #edf8f3;
  padding: 3px 9px;
  border-radius: 4px;
  font-size: 12px;
}
.validity-picker {
  width: 100% !important;
  max-width: 530px;
  min-height: 36px;
}
.effective-days {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  :deep(.el-input-number) {
    width: 130px;
  }
}
.scope-options {
  flex-wrap: wrap;
}
.goods-selection-content {
  width: 100%;
}
.goods-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.goods-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.goods-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
.goods-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-panel {
  position: sticky;
  top: 20px;
  padding-top: 4px;
}
.preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  span {
    font-size: 12px;
    font-weight: normal;
    color: #909399;
  }
}
.coupon-ticket {
  overflow: hidden;
  border: 1px solid #dce9fa;
  border-radius: 10px;
  background: #fff;
}
.ticket-benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 26px;
  background: #eef5ff;
  color: #3176d2;
}
.ticket-type {
  padding: 3px 10px;
  border: 1px solid #c9ddfa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
}
.ticket-amount {
  margin: 18px 0 8px;
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -1px;
}
.amount-unit {
  font-size: 20px;
  font-weight: 500;
  margin: 0 4px;
}
.ticket-condition {
  font-size: 13px;
  text-align: center;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.ticket-details {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px dashed #c9ddfa;
  padding: 22px 20px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border: 1px solid #dce9fa;
    border-radius: 50%;
    background: #f5f7fa;
    top: -9px;
  }
  &::before {
    left: -10px;
  }
  &::after {
    right: -10px;
  }
}
.ticket-name {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}
.preview-note {
  padding: 12px 4px;
  color: #a0a6af;
  font-size: 12px;
  line-height: 20px;
}
.form-footer {
  position: sticky;
  z-index: 5;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  box-shadow: 0 -4px 16px rgb(31 45 61 / 3%);
  > span {
    color: #909399;
    font-size: 13px;
  }
}
.footer-buttons {
  display: flex;
  gap: 12px;
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
.detail-card {
  h4 {
    font-size: 15px;
    margin: 8px 0 16px;
  }
  .desc-block {
    margin-bottom: 24px;
  }
  .foot-btn {
    margin-top: 20px;
  }
}
@media (max-width: 1100px) {
  .coupon-layout {
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 16px;
  }
  .editor-card :deep(.el-card__body) {
    padding: 0 20px;
  }
  .form-grid {
    column-gap: 16px;
  }
}
@media (max-width: 900px) {
  .coupon-layout {
    grid-template-columns: 1fr;
  }
  .preview-panel {
    display: none;
  }
  .coupon-type-options {
    gap: 10px;
    :deep(.el-radio-button__inner) {
      padding: 14px 12px;
    }
  }
}
@media (max-width: 600px) {
  .coupon-publish-page {
    padding: 4px 0 12px;
  }
  .page-heading {
    align-items: flex-start;
    h1 {
      font-size: 18px;
    }
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .coupon-type-options {
    grid-template-columns: 1fr;
  }
  .type-card :deep(.el-card__body) {
    padding: 16px;
  }
  .form-footer {
    padding: 14px 16px;
    > span {
      display: none;
    }
  }
  .footer-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

.portion-goods-wrapper {
  width: 100%;
}
.portion-goods-form-item :deep(.el-form-item__content) {
  min-width: 0;
}
.portion-goods-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.portion-goods-heading,
.goods-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.portion-goods-heading h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}
.portion-goods-heading span {
  color: #909399;
  font-size: 12px;
}
.goods-toolbar-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.table-goods-thumb {
  display: block;
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
.thumb-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  color: #c0c4cc;
  background: #fafafa;
}
.price-text {
  color: #f56c6c;
}
.selected-goods-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}
.selected-goods-sku {
  margin-top: 4px;
  color: #909399;
  font: 12px/1.5 Consolas, monospace;
  overflow-wrap: anywhere;
}
.portion-goods-table :deep(.el-table__cell) {
  padding: 12px 0;
}
.portion-goods-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 180px;
  padding: 24px 20px;
  box-sizing: border-box;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background: #fafbfc;
  text-align: center;
}
.portion-goods-empty h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}
.portion-goods-empty p {
  margin: 8px 0 20px;
  font-size: 12px;
  color: #909399;
}
.empty-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  border-radius: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.font-mono {
  font-family: Consolas, monospace;
}
.font-semibold {
  font-weight: 600;
}
</style>
