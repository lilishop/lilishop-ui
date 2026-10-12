<template>
  <div>
    <el-card>
      <el-form ref="formRef" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <div class="form-item-view">
            <h4>商品信息</h4>
            <el-form-item label="商品名称">
              <div>{{ form.goodsName }}</div>
            </el-form-item>
            <el-form-item label="SKU编码">
              <div>{{ form.skuId }}</div>
            </el-form-item>
            <el-form-item label="店铺名称">
              <div>{{ form.goodsSku.storeName }}</div>
            </el-form-item>
            <el-form-item label="商品价格">
              <div>
                <priceColorScheme :value="form.goodsSku.price" :color="$mainColor" />
              </div>
            </el-form-item>
            <el-form-item label="商品库存">
              <div>{{ form.goodsSku.quantity }}</div>
            </el-form-item>
            <el-form-item label="结算价格" prop="settlementPrice">
              <el-input
                :disabled="onlyView"
                type="number"
                v-model="form.settlementPrice"
                placeholder="请填写结算价格"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="最低可砍" prop="lowestPrice">
              <el-input
                :disabled="onlyView"
                type="number"
                v-model="form.lowestPrice"
                placeholder="请填写最低可砍金额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="最高可砍" prop="highestPrice">
              <el-input
                :disabled="onlyView"
                type="number"
                v-model="form.highestPrice"
                placeholder="请填写最高可砍金额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动库存" prop="stock">
              <el-input
                :disabled="onlyView"
                type="number"
                v-model="form.stock"
                placeholder="请填写活动库存"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动时间" prop="rangeTime" class="kanjia-activity-time-form-item">
              <el-date-picker
                :disabled="onlyView"
                v-model="form.rangeTime"
                type="datetimerange"
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择"
                :disabled-date="options.disabledDate"
              />
            </el-form-item>
            <div>
              <el-button link @click="closeCurrentPage">返回</el-button>
              <el-button v-if="!onlyView" type="primary" :loading="submitLoading" @click="handleSubmit">
                提交
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getKanJiaActivityGoodsById, editKanJiaActivityGoods } from "@/api/promotion";
import { regular } from "@/utils";
import { isECoupon } from "@/constants/goodsType";
import { Message as $Message } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "editKanjiaActivityGoods" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const checkSettlementPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("结算金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("结算金额设置超过上限值"));
  } else {
    callback();
  }
};
const checkLowestPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("最低可砍金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("最低可砍金额设置超过上限值"));
  } else {
    callback();
  }
};
const checkHighestPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("最高可砍金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("最高可砍金额设置超过上限值"));
  } else {
    callback();
  }
};

const modalType = ref(0);
const form = ref({
  purchasePrice: 0,
  goodsSku: {},
  rangeTime: [],
});
const id = route.query.id;
const onlyView = route.query.onlyView;
const submitLoading = ref(false);
const formRule = {
  settlementPrice: [
    { required: true, message: "请输入结算金额" },
    { validator: checkSettlementPrice },
  ],
  lowestPrice: [
    { required: true, message: "请输入最低可砍金额" },
    { validator: checkLowestPrice },
  ],
  highestPrice: [
    { required: true, message: "请输入最高可砍金额" },
    { validator: checkHighestPrice },
  ],
  rangeTime: [
    {
      type: "array",
      required: true,
      message: "请选择活动时间",
      trigger: "change",
    },
  ],
  stock: [{ required: true, message: "请输入活动库存" }],
};
const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const formRef = ref(null);

onMounted(async () => {
  if (id) {
    getKanJiaActivityGoods();
    modalType.value = 1;
  }
});

function getKanJiaActivityGoods() {
  getKanJiaActivityGoodsById(id).then((res) => {
    form.value = res.result;
    form.value.rangeTime = [res.result.startTime, res.result.endTime];
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    const params = JSON.parse(JSON.stringify(form.value));
    const [start, end] = form.value.rangeTime || [];
    if (!start || !end) {
      $Message.error("请选择活动时间");
      return;
    }
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    params.startTime = unixToDate(startDate.getTime() / 1000);
    params.endTime = unixToDate(endDate.getTime() / 1000);
    delete params.rangeTime;

    const eCoupon = isECoupon(params.goodsType || params.goodsSku?.goodsType);

    if (params.stock <= 0 || params.stock > params.goodsSku.quantity) {
      $Message.error("活动库存不能为0且不能超过商品库存");
      return;
    }
    if (!regular.money.test(params.settlementPrice)) {
      $Message.error("结算价格金额格式不正确");
      return;
    }
    if (
      (eCoupon ? params.settlementPrice < 0 : params.settlementPrice <= 0) ||
      params.settlementPrice > params.price
    ) {
      $Message.error(
        eCoupon
          ? "结算价格不能小于0且不能超过商品价格"
          : "结算价格金额不能为0且不能超过商品价格"
      );
      return;
    }
    if (!regular.money.test(params.highestPrice)) {
      $Message.error("最高可砍金额格式错误");
      return;
    }
    if (params.highestPrice <= 0 || params.highestPrice > params.price) {
      $Message.error("最高可砍金额不能为0且不能超过商品价格");
      return;
    }
    if (!regular.money.test(params.lowestPrice)) {
      $Message.error("最低可砍金额格式错误");
      return;
    }
    if (
      params.lowestPrice < 0 ||
      (!eCoupon && params.lowestPrice <= 0) ||
      params.lowestPrice > params.price
    ) {
      $Message.error(eCoupon ? "最低可砍金额不能小于0" : "最低可砍金额不能为0");
      return;
    }
    if (params.lowestPrice > params.highestPrice) {
      $Message.error("最低砍价金额不能大于最高砍价金额");
      return;
    }

    submitLoading.value = true;
    editKanJiaActivityGoods(params).then((res) => {
      submitLoading.value = false;
      if (res.success) {
        $Message.success("砍价活动修改成功");
        closeCurrentPage();
      }
    });
  });
}

function closeCurrentPage() {
  appStore.removeTag("add-kan-jia-goods");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
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

.kanjia-activity-time-form-item {
  :deep(.el-date-editor) {
    width: 360px !important;
    max-width: 360px;
    flex-grow: 0;
  }
}
</style>
