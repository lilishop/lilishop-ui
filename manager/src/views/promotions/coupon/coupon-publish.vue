<template>
  <div class="coupon-publish-page">
    <!-- 顶部页面标题与操作栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>{{ isOnlyView ? "平台优惠券详情" : (id ? "编辑平台优惠券" : "添加平台优惠券") }}</span>
            <el-tag v-if="isOnlyView" type="info" size="small" effect="plain" class="mode-tag">
              只读模式
            </el-tag>
            <el-tag v-else-if="id" type="warning" size="small" effect="plain" class="mode-tag">
              编辑模式
            </el-tag>
            <el-tag v-else type="success" size="small" effect="plain" class="mode-tag">
              新建模式
            </el-tag>
            <span v-if="id" class="coupon-id-tip font-mono">ID: {{ id }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="closeCurrentPage">返回</el-button>
          <el-button
            v-if="!isOnlyView"
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            保存提交
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 表单卡片 -->
    <el-card shadow="never" class="form-card mt_10">
      <el-form
        ref="formRef"
        :model="form"
        label-width="130px"
        :rules="formRule"
        class="custom-coupon-form"
      >
        <!-- 模块一：基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <span class="section-indicator"></span>
            <span class="section-title">基本信息</span>
            <span class="section-subtitle">配置活动名称、券面额及发放规则</span>
          </div>

          <div class="section-body">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                :disabled="disabled"
                v-model="form.promotionName"
                placeholder="请输入活动名称"
                clearable
                style="width: 360px"
              />
            </el-form-item>

            <el-form-item label="优惠券名称" prop="couponName">
              <el-input
                :disabled="disabled"
                v-model="form.couponName"
                placeholder="请输入优惠券名称"
                clearable
                style="width: 360px"
              />
            </el-form-item>

            <el-form-item label="优惠券类型" prop="couponType">
              <el-select :disabled="disabled" v-model="form.couponType" style="width: 240px">
                <el-option label="打折" value="DISCOUNT" />
                <el-option label="减免现金" value="PRICE" />
              </el-select>
            </el-form-item>

            <el-form-item
              label="折扣"
              prop="couponDiscount"
              v-if="form.couponType == 'DISCOUNT'"
            >
              <el-input-number
                :disabled="disabled"
                placeholder="折扣"
                :max="9.9"
                :min="0.1"
                :step="0.1"
                :precision="1"
                v-model="form.couponDiscount"
                style="width: 240px"
              />
              <span class="form-describe">请输入 0.1 ~ 9.9 之间的数值（1位小数）</span>
            </el-form-item>

            <el-form-item label="面额" prop="price" v-if="form.couponType == 'PRICE'">
              <el-input
                :disabled="disabled"
                v-model="form.price"
                placeholder="请输入减免面额"
                clearable
                style="width: 240px"
              >
                <template #prefix>¥</template>
              </el-input>
            </el-form-item>

            <el-form-item label="活动类型" prop="getType">
              <el-select :disabled="disabled" v-model="form.getType" style="width: 240px">
                <el-option label="免费领取" value="FREE" />
                <el-option label="活动赠送" value="ACTIVITY" />
              </el-select>
            </el-form-item>

            <el-form-item label="店铺承担比例" prop="storeCommission">
              <el-input
                :disabled="disabled"
                v-model="form.storeCommission"
                placeholder="店铺承担比例"
                style="width: 240px"
              >
                <template #append>%</template>
              </el-input>
              <span class="form-describe">店铺承担的资金比例，范围 0-100</span>
            </el-form-item>

            <el-form-item label="发放数量" prop="publishNum" v-if="form.getType === 'FREE'">
              <el-input
                :disabled="disabled"
                v-model="form.publishNum"
                placeholder="请输入发放数量"
                style="width: 240px"
              />
              <span class="form-describe">若设置为 0，则代表不限制发放数量</span>
            </el-form-item>

            <el-form-item
              label="领取数量限制"
              prop="couponLimitNum"
              v-if="form.getType === 'FREE'"
            >
              <el-input
                :disabled="disabled"
                v-model="form.couponLimitNum"
                placeholder="每人限领张数"
                clearable
                style="width: 240px"
              />
              <span class="form-describe">若设置为 0，则代表不限制每人领取数量</span>
            </el-form-item>

            <el-form-item label="范围描述" prop="description">
              <el-input
                :disabled="disabled"
                v-model="form.description"
                type="textarea"
                :rows="3"
                maxlength="50"
                show-word-limit
                placeholder="请输入优惠券适用范围或简要说明"
                style="width: 480px"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 模块二：使用限制 -->
        <div class="form-section mt_10">
          <div class="section-header">
            <span class="section-indicator"></span>
            <span class="section-title">使用限制</span>
            <span class="section-subtitle">配置消费门槛、有效时间以及指定适用商品范围</span>
          </div>

          <div class="section-body">
            <el-form-item label="消费门槛" prop="consumeThreshold">
              <el-input
                :disabled="disabled"
                v-model="form.consumeThreshold"
                placeholder="请输入消费门槛金额"
                clearable
                style="width: 240px"
              >
                <template #prefix>¥</template>
              </el-input>
              <span class="form-describe">订单满此金额方可使用该优惠券</span>
            </el-form-item>

            <el-form-item label="有效期" prop="rangeTime">
              <div v-if="form.getType == 'ACTIVITY'" class="mb_10">
                <el-radio-group v-model="rangeTimeType">
                  <el-radio :disabled="disabled" :value="1" v-if="form.getType !== 'ACTIVITY'">起止时间</el-radio>
                  <el-radio :disabled="disabled" :value="0">固定有效天数</el-radio>
                </el-radio-group>
              </div>

              <div v-if="rangeTimeType == 1">
                <el-date-picker
                  :disabled="disabled"
                  type="datetimerange"
                  v-model="form.rangeTime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  :disabled-date="options.disabledDate"
                  style="width: 380px"
                />
              </div>

              <div class="effectiveDays-row" v-if="rangeTimeType == 0">
                <span class="days-label">领取当天开始</span>
                <el-input-number
                  :disabled="disabled"
                  v-model="form.effectiveDays"
                  :min="1"
                  :max="365"
                  style="width: 130px"
                />
                <span class="days-unit">天内有效（1-365天的整数）</span>
              </div>
            </el-form-item>

            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType">
                <el-radio-button :disabled="disabled" value="ALL">全品类通用</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS">指定商品</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS_CATEGORY">部分商品分类</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- 指定适用商品表格 -->
            <el-form-item
              v-if="form.scopeType == 'PORTION_GOODS'"
              label="指定商品"
              style="width: 100%"
            >
              <div class="portion-goods-wrapper">
                <div v-if="!isOnlyView" class="portion-goods-toolbar">
                  <el-button type="primary" @click="openSkuList">选择商品</el-button>
                  <el-button
                    type="danger"
                    plain
                    :disabled="selectedGoods.length === 0"
                    @click="delSelectGoods"
                  >
                    批量删除 ({{ selectedGoods.length }})
                  </el-button>
                </div>

                <el-table
                  border
                  stripe
                  :data="form.promotionGoodsList"
                  style="width: 100%"
                  empty-text="暂无指定商品数据"
                  class="portion-goods-table"
                  @selection-change="changeSelect"
                >
                  <el-table-column
                    v-if="!isOnlyView"
                    type="selection"
                    width="50"
                    align="center"
                  />
                  <el-table-column label="商品图片" width="76" align="center">
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
                  <el-table-column
                    prop="goodsName"
                    label="商品名称"
                    min-width="220"
                    show-overflow-tooltip
                  />
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
                      <el-button
                        type="danger"
                        size="small"
                        link
                        @click="delGoods($index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>

            <!-- 部分商品分类 -->
            <el-form-item v-if="form.scopeType == 'PORTION_GOODS_CATEGORY'" label="指定分类">
              <el-cascader
                :disabled="disabled"
                :options="goodsCategoryList"
                placeholder="请选择适用的商品分类"
                style="width: 360px"
                v-model="form.scopeIdGoods"
                clearable
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 底部固定操作栏 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button @click="closeCurrentPage">返回列表</el-button>
        <el-button
          v-if="!isOnlyView"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存提交
        </el-button>
      </div>
    </el-card>

    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
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
  } else if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("面额设置超过上限值"));
  } else {
    callback();
  }
};
const checkWeight = (rule, value, callback) => {
  if (!value && typeof value !== "number") {
    callback(new Error("消费门槛不能为空"));
  } else if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("消费门槛设置超过上限值"));
  } else {
    callback();
  }
};

const isOnlyView = computed(() => route.query.onlyView === "true" || route.query.onlyView === true);
const disabled = computed(() => isOnlyView.value);

const rangeTimeType = ref(1);
const modalType = ref(0);
const form = ref({
  storeCommission: 0,
  publishNum: 0,
  scopeType: "ALL",
  couponLimitNum: 1,
  couponType: "PRICE",
  couponName: "",
  promotionName: "",
  getType: "FREE",
  promotionGoodsList: [],
  scopeIdGoods: [],
  rangeDayType: "",
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

watch(
  () => form.value.getType,
  (val) => {
    if (val == "FREE") {
      rangeTimeType.value = 1;
    } else {
      rangeTimeType.value = 0;
    }
    if (rangeTimeType.value == 0) {
      delete formRule.rangeTime;
    }
  },
  { deep: true }
);

watch(
  () => route.query,
  (e) => {
    id.value = e.id;
    if (id.value) {
      getCoupon();
    } else {
      formRef.value?.resetFields();
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
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const params = JSON.parse(JSON.stringify(form.value));
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
  padding-bottom: 20px;

  .header-card {
    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .mode-tag {
            font-weight: normal;
          }

          .coupon-id-tip {
            font-size: 13px;
            font-weight: normal;
            color: #909399;
            background-color: #f4f4f5;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .form-card {
    .custom-coupon-form {
      padding: 10px 10px 0;
    }

    .form-section {
      border: 1px solid #ebeef5;
      border-radius: 6px;
      padding: 18px 20px;
      background-color: #ffffff;

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 14px;
        margin-bottom: 16px;
        border-bottom: 1px solid #f0f2f5;

        .section-indicator {
          width: 4px;
          height: 16px;
          border-radius: 2px;
          background-color: #409eff;
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }

        .section-subtitle {
          font-size: 12px;
          color: #909399;
          margin-left: 6px;
        }
      }

      .section-body {
        max-width: 900px;
      }
    }
  }

  .form-describe {
    font-size: 12px;
    margin-left: 10px;
    color: #909399;
  }

  .effectiveDays-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .days-label,
    .days-unit {
      font-size: 13px;
      color: #606266;
    }
  }

  .portion-goods-wrapper {
    width: 100%;

    .portion-goods-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .portion-goods-table {
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
        background-color: #fafafa;
      }

      .price-text {
        color: #f56c6c;
      }
    }
  }

  .footer-card {
    .footer-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
    }
  }

  .font-mono {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }
}
</style>
