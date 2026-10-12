<template>
  <div>
    <el-card>
      <el-form ref="formRef" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                :disabled="fieldDisabled"
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动时间" prop="rangeTime">
              <el-date-picker
                class="full-discount-range-picker"
                type="datetimerange"
                v-model="form.rangeTime"
                :disabled="fieldDisabled"
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择"
                :disabled-date="options.disabledDate"
              />
            </el-form-item>
            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="form.description"
                :disabled="fieldDisabled"
                type="textarea"
                :rows="4"
                clearable
                style="width: 260px"
              />
            </el-form-item>
          </div>

          <h4>优惠设置</h4>
          <div class="form-item-view">
            <el-form-item label="优惠门槛" prop="fullMoney">
              <el-input
                v-model="form.fullMoney"
                :disabled="fieldDisabled"
                placeholder="优惠门槛"
                clearable
                style="width: 260px"
              />
              <span class="describe">消费达到当前金额可以参与优惠</span>
            </el-form-item>
            <el-form-item label="优惠方式">
              <el-radio-group v-model="form.discountType" :disabled="fieldDisabled">
                <el-radio-button value="fullMinusFlag">减现金</el-radio-button>
                <el-radio-button value="fullRateFlag">打折</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="form.discountType == 'fullMinusFlag'"
              label="优惠金额"
              prop="fullMinus"
            >
              <el-input
                :disabled="fieldDisabled"
                v-model="form.fullMinus"
                placeholder="优惠金额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item
              v-if="form.discountType == 'fullRateFlag'"
              label="优惠折扣"
              prop="fullRate"
            >
              <el-input-number
                :disabled="fieldDisabled"
                v-model="form.fullRate"
                placeholder="优惠折扣"
                :min="0.1"
                :max="9.9"
                :step="0.1"
                :precision="1"
                style="width: 260px"
              />
              <span class="describe">优惠折扣为0-10之间数字，可有一位小数</span>
            </el-form-item>
            <el-form-item label="额外赠送">
              <el-checkbox v-model="form.freeFreightFlag" :disabled="fieldDisabled">免邮费</el-checkbox>
              <el-checkbox v-model="form.couponFlag" :disabled="fieldDisabled">送优惠券</el-checkbox>
              <el-checkbox v-model="form.giftFlag" :disabled="fieldDisabled">送赠品</el-checkbox>
              <el-checkbox v-model="form.pointFlag" :disabled="fieldDisabled">送积分</el-checkbox>
            </el-form-item>
            <el-form-item v-if="form.couponFlag" label="赠送优惠券" prop="couponId">
              <el-select
                v-model="form.couponId"
                :disabled="fieldDisabled"
                filterable
                remote
                :remote-method="getCouponList"
                placeholder="输入优惠券名称搜索"
                :loading="couponLoading"
                style="width: 280px"
              >
                <el-option
                  v-for="item in couponList"
                  :value="item.id"
                  :key="item.id"
                  :label="item.couponName"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.giftFlag" label="赠品" prop="giftId">
              <div class="gift-field">
                <el-select
                  v-model="form.giftId"
                  filterable
                  remote
                  :remote-method="getGiftList"
                  placeholder="输入赠品名称搜索"
                  :disabled="fieldDisabled"
                  :loading="giftLoading"
                  style="width: 260px"
                >
                  <el-option
                    v-for="item in giftList"
                    :value="item.id"
                    :key="item.id"
                    :label="giftOptionLabel(item)"
                  />
                </el-select>
                <p class="describe describe-block">电子卡券赠品支付后自动发卡；卡池不足时仅取消赠品子单，不影响主订单。</p>
              </div>
            </el-form-item>
            <el-form-item v-if="form.pointFlag" label="赠积分" prop="point">
              <el-input
                v-model="form.point"
                type="number"
                :disabled="fieldDisabled"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType" :disabled="fieldDisabled">
                <el-radio-button value="ALL">全品类</el-radio-button>
                <el-radio-button value="PORTION_GOODS">指定商品</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="width: 100%" v-if="form.scopeType == 'PORTION_GOODS'">
              <div v-if="!fieldDisabled" style="display: flex; margin-bottom: 10px">
                <el-button type="primary" @click="openSkuList">选择商品</el-button>
                <el-button type="danger" plain style="margin-left: 10px" @click="delSelectGoods">
                  批量删除
                </el-button>
              </div>
              <el-table
                border
                :data="form.promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column
                  v-if="!fieldDisabled"
                  type="selection"
                  width="60"
                  align="center"
                />
                <el-table-column label="商品名称" min-width="120" show-overflow-tooltip>
                  <template #default="{ row }">
                    <template v-if="row">
                      <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{
                        row.goodsName
                      }}</a>
                      <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                        <template #reference>
                          <img
                            src="../../../assets/qrcode.svg"
                            style="vertical-align: middle"
                            class="hover-pointer"
                            width="20"
                            height="20"
                            alt=""
                          />
                        </template>
                        <vue-qr
                          :text="wapLinkTo(row.goodsId, row.skuId)"
                          :margin="0"
                          color-dark="#000"
                          color-light="#fff"
                          :size="150"
                        />
                      </el-popover>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column label="商品价格" width="110">
                  <template #default="{ row }">
                    <span v-if="row" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="90">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="!fieldDisabled" label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <a class="link-text" @click="delGoods($index)">删除</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <div>
              <el-button @click="closeCurrentPage">返回</el-button>
              <el-button
                v-if="!fieldDisabled"
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
              >
                提交
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    <liliDialog ref="liliDialogRef" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getShopCouponList,
  getFullDiscountById,
  newFullDiscount,
  editFullDiscount,
} from "@/api/promotion";
import { getGoodsSkuListDataSeller } from "@/api/goods";
import { regular } from "@/utils";
import { goodsTypeLabel } from "@/constants/goodsType";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "add-full-discount" });

const route = useRoute();
const router = useRouter();

const checkWeight = (rule, value, callback) => {
  if (!value && typeof value !== "number") {
    callback(new Error("优惠门槛不能为空"));
  } else if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("优惠门槛设置超过上限值"));
  } else {
    callback();
  }
};
const checkDiscount = (rule, value, callback) => {
  if (value === null || value === undefined || value === "") {
    callback(new Error("请填写优惠折扣"));
  } else if (value < 0.1 || value > 9.9) {
    callback(new Error("请输入0-10的数字,可有一位小数"));
  } else {
    callback();
  }
};

const form = ref({
  discountType: "fullMinusFlag",
  scopeType: "ALL",
  promotionGoodsList: [],
  promotionStatus: "NEW",
});
const id = ref(route.query.id);
const submitLoading = ref(false);
const selectedGoods = ref([]);
const couponList = ref([]);
const giftList = ref([]);
const giftLoading = ref(false);
const couponLoading = ref(false);
const formRule = {
  promotionName: [{ required: true, message: "活动名称不能为空" }],
  rangeTime: [{ required: true, message: "请选择活动时间" }],
  description: [{ required: true, message: "请填写活动描述" }],
  fullMoney: [{ required: true, validator: checkWeight }],
  fullMinus: [
    { required: true, message: "请填写优惠金额" },
    { pattern: regular.money, message: "请输入正确金额" },
  ],
  fullRate: [{ required: true, validator: checkDiscount }],
};
const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

// formRef：模板 ref 改名避免与顶层变量互相覆盖
const formRef = ref(null);
const liliDialogRef = ref(null);

const fieldDisabled = computed(() => {
  return !!id.value && form.value.promotionStatus !== "NEW";
});

onMounted(() => {
  if (id.value) {
    getDetail();
  }
  getCouponList();
  getGiftList();
});

function giftOptionLabel(item) {
  if (!item) return "";
  const typeLabel =
    item.goodsType === "E_COUPON" ? ` [${goodsTypeLabel(item.goodsType)}]` : "";
  const stock =
    item.goodsType === "E_COUPON" && item.quantity != null
      ? ` · 库存${item.quantity}`
      : "";
  return `${item.goodsName || ""}${typeLabel}${stock}`;
}
function closeCurrentPage() {
  router.back();
}
function openSkuList() {
  const data = JSON.parse(JSON.stringify(form.value.promotionGoodsList || []));
  data.forEach((e) => {
    e.id = e.skuId || e.id;
  });
  // 先写入已选商品，再打开选择器，保证回显时 selectedWay 已就绪
  liliDialogRef.value.goodsData = data;
  liliDialogRef.value.open("goods");
}
function getDetail() {
  getFullDiscountById(id.value).then((res) => {
    const data = res.result;
    if (data.scopeType === "ALL") {
      data.promotionGoodsList = [];
    }
    if (data.fullMinusFlag) {
      data.discountType = "fullMinusFlag";
      delete data.fullMinusFlag;
    } else {
      data.discountType = "fullRateFlag";
      delete data.fullRateFlag;
    }
    data.rangeTime = [new Date(data.startTime), new Date(data.endTime)];
    if (data.fullRate !== null && data.fullRate !== undefined && data.fullRate !== "") {
      data.fullRate = parseFloat(Number(data.fullRate).toFixed(1));
    }
    form.value = data;
  });
}
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    const params = JSON.parse(JSON.stringify(form.value));
    params.startTime = unixToDate(form.value.rangeTime[0] / 1000);
    params.endTime = unixToDate(form.value.rangeTime[1] / 1000);

    if (params.couponFlag && !params.couponId) {
      Message.warning("请选择优惠券");
      return;
    }
    if (params.giftFlag && !params.giftId) {
      Message.warning("请选择赠品");
      return;
    }
    if (params.pointFlag && !params.point) {
      Message.warning("请填写积分");
      return;
    }

    if (
      params.scopeType === "PORTION_GOODS" &&
      (!params.promotionGoodsList || params.promotionGoodsList.length === 0)
    ) {
      Message.warning("请选择指定商品");
      return;
    }
    if (params.scopeType === "ALL") {
      delete params.promotionGoodsList;
      params.number = -1;
    } else {
      const scopeId = [];
      params.number = 1;
      params.promotionGoodsList.forEach((e) => {
        e.startTime = params.startTime;
        e.endTime = params.endTime;
        scopeId.push(e.skuId);
      });
      params.scopeId = scopeId.toString();
    }
    if (params.discountType === "fullMinusFlag") {
      params.fullMinusFlag = true;
    } else {
      params.fullRateFlag = true;
    }
    delete params.discountType;
    delete params.rangeTime;
    if (!id.value) {
      delete params.id;
    } else {
      delete params.updateTime;
    }

    submitLoading.value = true;
    const request = id.value ? editFullDiscount(params) : newFullDiscount(params);
    request.then((res) => {
      submitLoading.value = false;
      if (res.success) {
        Message.success(id.value ? "编辑活动成功" : "添加活动成功");
        closeCurrentPage();
      }
    });
  });
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
      const ids = selectedGoods.value.map((e) => e.skuId || e.id);
      form.value.promotionGoodsList = form.value.promotionGoodsList.filter(
        (item) => !ids.includes(item.skuId)
      );
    },
  });
}
function delGoods(index) {
  form.value.promotionGoodsList.splice(index, 1);
}
function selectedGoodsData(item) {
  const list = [];
  item.forEach((e) => {
    list.push({
      goodsName: e.goodsName,
      price: e.price,
      quantity: e.quantity,
      storeId: e.storeId,
      storeName: e.storeName,
      thumbnail: e.thumbnail,
      skuId: e.id,
      goodsId: e.goodsId,
      goodsType: e.goodsType,
    });
  });
  form.value.promotionGoodsList = list;
}
function getCouponList(query) {
  const params = {
    pageSize: 20,
    pageNumber: 1,
    getType: "ACTIVITY",
    couponName: query,
    promotionStatus: "START",
  };
  couponLoading.value = true;
  getShopCouponList(params).then((res) => {
    couponLoading.value = false;
    if (res.success) {
      couponList.value = res.result.records;
    }
  });
}
function getGiftList(query) {
  const params = {
    pageSize: 20,
    pageNumber: 1,
    id: query === form.value.giftId ? form.value.giftId : null,
    goodsName: query === form.value.giftId ? null : query,
    marketEnable: "UPPER",
    authFlag: "PASS",
  };
  giftLoading.value = true;
  getGoodsSkuListDataSeller(params).then((res) => {
    giftLoading.value = false;
    if (res.success) {
      giftList.value = res.result.records;
    }
  });
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
.describe-block {
  margin-left: 0;
  margin-top: 4px;
  line-height: 1.5;
  max-width: 260px;
}
.gift-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

:deep(.full-discount-range-picker.el-date-editor--datetimerange) {
  width: 380px;
  max-width: 380px;
  flex-grow: 0;
  --el-date-editor-width: 380px;
}
</style>
