<template>
  <div>
    <el-card v-if="disabled">
      <h4>基本信息</h4>
      <el-descriptions border :column="2" class="desc-block">
        <el-descriptions-item label="活动名称">{{ form.promotionName }}</el-descriptions-item>
        <el-descriptions-item label="优惠券名称">{{ form.couponName }}</el-descriptions-item>
        <el-descriptions-item label="优惠券类型">
          {{ form.couponType === "DISCOUNT" ? "打折" : "减免现金" }}
        </el-descriptions-item>
        <el-descriptions-item v-if="form.couponType === 'DISCOUNT'" label="折扣">
          {{ form.couponDiscount }} 折
        </el-descriptions-item>
        <el-descriptions-item v-else label="面额">
          {{ $filters.unitPrice(form.price, "￥") }}
        </el-descriptions-item>
        <el-descriptions-item label="活动类型">
          {{ form.getType === "FREE" ? "免费领取" : "活动赠送" }}
        </el-descriptions-item>
        <template v-if="form.getType === 'FREE'">
          <el-descriptions-item label="发放数量">
            {{ form.publishNum ? form.publishNum : "不限" }}
          </el-descriptions-item>
          <el-descriptions-item label="领取数量限制">
            {{ form.couponLimitNum ? form.couponLimitNum : "不限" }}
          </el-descriptions-item>
        </template>
      </el-descriptions>

      <h4>使用限制</h4>
      <el-descriptions border :column="2" class="desc-block">
        <el-descriptions-item label="消费门槛">
          {{ $filters.unitPrice(form.consumeThreshold, "￥") }}
        </el-descriptions-item>
        <el-descriptions-item label="有效期">
          <span v-if="rangeTimeType === 1 && form.rangeTime && form.rangeTime.length === 2">
            {{ formatTime(form.rangeTime[0]) }} ~ {{ formatTime(form.rangeTime[1]) }}
          </span>
          <span v-else>领取当天开始 {{ form.effectiveDays }} 天内有效</span>
        </el-descriptions-item>
        <el-descriptions-item label="使用范围">{{ scopeTypeText }}</el-descriptions-item>
        <el-descriptions-item
          v-if="form.scopeType === 'PORTION_GOODS_CATEGORY'"
          label="商品分类"
          :span="2"
        >
          {{ scopeCategoryText }}
        </el-descriptions-item>
      </el-descriptions>

      <template v-if="form.scopeType === 'PORTION_GOODS'">
        <h4>指定商品</h4>
        <el-table border :data="form.promotionGoodsList" style="width: 100%">
          <el-table-column label="商品名称" min-width="220">
            <template #default="{ row }">
              <div v-if="row" class="goods-cell">
                <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                <span class="goods-name">{{ row.goodsName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row?.sn || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="规格" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row?.simpleSpecs || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="商品价格" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="90" align="right">
            <template #default="{ row }">
              <span v-if="row">{{ row.quantity }}</span>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <div class="foot-btn">
        <el-button @click="closeCurrentPage">返回</el-button>
      </div>
    </el-card>
    <el-card v-else>
      <el-form ref="formRef" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                :disabled="disabled"
                v-model="form.promotionName"
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="优惠券名称" prop="couponName">
              <el-input
                :disabled="disabled"
                v-model="form.couponName"
                placeholder="优惠券名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="优惠券类型" prop="couponType">
              <el-select :disabled="disabled" v-model="form.couponType" style="width: 260px">
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
                style="width: 260px"
              />
              <span class="describe">请输入0-10的数字,可有一位小数</span>
            </el-form-item>
            <el-form-item label="面额" prop="price" v-if="form.couponType == 'PRICE'">
              <el-input
                :disabled="disabled"
                v-model="form.price"
                placeholder="面额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动类型" prop="getType">
              <el-select :disabled="disabled" v-model="form.getType" style="width: 260px">
                <el-option label="免费领取" value="FREE" />
                <el-option label="活动赠送" value="ACTIVITY" />
              </el-select>
            </el-form-item>

            <el-form-item label="发放数量" prop="publishNum" v-if="form.getType === 'FREE'">
              <div class="form-field-block">
                <el-input
                  :disabled="disabled"
                  v-model="form.publishNum"
                  placeholder="发放数量"
                  style="width: 260px"
                />
                <div class="form-tip">如果发放数量为0时,则代表不限制发放数量</div>
              </div>
            </el-form-item>
            <el-form-item
              label="领取数量限制"
              prop="couponLimitNum"
              v-if="form.getType === 'FREE'"
            >
              <div class="form-field-block">
                <el-input
                  :disabled="disabled"
                  v-model="form.couponLimitNum"
                  placeholder="领取限制"
                  clearable
                  style="width: 260px"
                />
                <div class="form-tip">如果领取数量为0时,则代表不限制领取数量</div>
              </div>
            </el-form-item>
          </div>
          <h4>使用限制</h4>
          <div class="form-item-view">
            <el-form-item label="消费门槛" prop="consumeThreshold">
              <el-input
                :disabled="disabled"
                v-model="form.consumeThreshold"
                placeholder="消费门槛"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="有效期" prop="rangeTime">
              <div v-if="form.getType == 'ACTIVITY'">
                <el-radio-group v-model="rangeTimeType">
                  <el-radio :disabled="disabled" :value="1" v-if="form.getType !== 'ACTIVITY'">起止时间</el-radio>
                  <el-radio :disabled="disabled" :value="0">固定时间</el-radio>
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
                  style="width: 260px"
                />
              </div>
              <div class="effectiveDays" v-if="rangeTimeType == 0">
                领取当天开始
                <el-input-number
                  :disabled="disabled"
                  v-model="form.effectiveDays"
                  :min="1"
                  style="width: 100px"
                  :max="365"
                />
                天内有效(1-365间的整数)
              </div>
            </el-form-item>

            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType">
                <el-radio-button :disabled="disabled" value="ALL">全品类</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS">指定商品</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS_CATEGORY">部分商品分类</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="width: 100%" v-if="form.scopeType == 'PORTION_GOODS'">
              <div style="display: flex; margin-bottom: 10px">
                <el-button :disabled="disabled" type="primary" @click="openSkuList">选择商品</el-button>
                <el-button
                  :disabled="disabled"
                  type="danger"
                  plain
                  style="margin-left: 10px"
                  @click="delSelectGoods"
                >批量删除</el-button>
              </div>
              <el-table
                border
                :data="form.promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column label="商品名称" min-width="220">
                  <template #default="{ row }">
                    <div v-if="row" class="goods-cell">
                      <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                      <span class="goods-name">{{ row.goodsName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row?.sn || "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="规格" min-width="140" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row?.simpleSpecs || "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="商品价格" width="110" align="right">
                  <template #default="{ row }">
                    <span v-if="row" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="90" align="right">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="right">
                  <template #default="{ $index }">
                    <el-button
                      :disabled="disabled"
                      type="danger"
                      size="small"
                      plain
                      @click="delGoods($index)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item v-if="form.scopeType == 'PORTION_GOODS_CATEGORY'">
              <el-cascader
                :disabled="disabled"
                :options="goodsCategoryList"
                style="width: 260px"
                v-model="form.scopeIdGoods"
              />
            </el-form-item>
            <div>
              <el-button :disabled="disabled" link @click="closeCurrentPage">返回</el-button>
              <el-button
                :disabled="disabled"
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
              >提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { saveShopCoupon, getShopCoupon, editShopCoupon } from "@/api/promotion";
import { getGoodsCategoryAll } from "@/api/goods";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";
import skuSelect from "@/views/lili-dialog";

defineOptions({ name: "add-coupon" });

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

const disabled = ref(route.query.onlyView);
const rangeTimeType = ref(1);
const modalType = ref(0);
const form = ref({
  storeCommission: 100,
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
  publishNum: [
    { required: true, message: "请输入发放数量" },
    { pattern: regular.Integer, message: "请输入正整数" },
  ],
  couponLimitNum: [
    { required: true, message: "领取限制不能为空" },
    { pattern: regular.Integer, message: "请输入正整数" },
  ],
});
const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const scopeTypeText = computed(() => {
  const map = {
    ALL: "全品类",
    PORTION_GOODS: "指定商品",
    PORTION_GOODS_CATEGORY: "部分商品分类",
  };
  return map[form.value.scopeType] || form.value.scopeType;
});
const scopeCategoryText = computed(() => {
  const findLabel = (list, value) => {
    for (const item of list) {
      if (item.value === value) return item.label;
      if (item.children) {
        const hit = findLabel(item.children, value);
        if (hit) return hit;
      }
    }
    return null;
  };
  return (form.value.scopeIdGoods || [])
    .map((path) => {
      const ids = Array.isArray(path) ? path : [path];
      return ids.map((i) => findLabel(goodsCategoryList.value, i)).filter(Boolean).join(" / ");
    })
    .filter(Boolean)
    .join("；");
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
      formRef.value.resetFields();
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
  getShopCoupon(id.value).then((res) => {
    let data = res.result;
    if (!data.promotionGoodsList) data.promotionGoodsList = [];
    rangeTimeType.value = data.rangeDayType === "DYNAMICTIME" ? 0 : 1;
    if (data.scopeType == "PORTION_GOODS_CATEGORY") {
      let prevCascader = data.scopeId.split(",");
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

        saveShopCoupon(params).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("优惠券发送成功");
            closeCurrentPage();
          }
        });
      } else {
        delete params.consumeLimit;
        delete params.updateTime;

        editShopCoupon(params).then((res) => {
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
  appStore.removeTag("add-coupon");
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
      thumbnail: e.small,
      goodsType: e.goodsType,
      goodsId: e.goodsId,
      originPrice: e.price,
      sn: e.sn,
      simpleSpecs: e.simpleSpecs,
    });
  });
  form.value.promotionGoodsList = list;
}
async function getCagetoryList() {
  let data = await getGoodsCategoryAll();
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
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}

.describe {
  font-size: 12px;
  margin-left: 10px;
  color: #999;
}

.desc-block {
  margin-bottom: 10px;
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

.foot-btn {
  margin-top: 16px;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-tip {
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  color: #999;
}

.effectiveDays {
  font-size: 12px;
  color: #999;

  > * {
    margin: 0 4px;
  }
}
</style>
