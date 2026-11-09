<!--
  商家端地址管理页面：集中维护店铺发货地址与退货（售后）地址。
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <el-card>
    <div class="setting-page">
      <el-form
        ref="formRef"
        label-width="150px"
        label-position="right"
        :model="form"
        :rules="formRules"
      >
        <div class="setting-section">
          <div class="section-title">发货地址</div>
          <el-form-item label="发货人姓名" prop="salesConsignorName">
            <el-input
              v-model="form.salesConsignorName"
              maxlength="11"
              clearable
              placeholder="请输入发货人姓名"
            />
          </el-form-item>
          <el-form-item label="发货人手机号" prop="salesConsignorMobile">
            <el-input
              v-model="form.salesConsignorMobile"
              maxlength="11"
              clearable
              placeholder="请输入发货人手机号"
            />
          </el-form-item>
          <el-form-item label="地址" prop="salesConsignorAddressId">
            <span v-if="form.salesConsignorAddressPath" class="address-text">
              {{ form.salesConsignorAddressPath }}
            </span>
            <el-button @click="handleChangeAddress('addressGoods')">选择</el-button>
          </el-form-item>
          <el-form-item label="详细地址" prop="salesConsignorDetail">
            <el-input
              v-model="form.salesConsignorDetail"
              clearable
              maxlength="50"
              placeholder="请输入详细地址"
            />
          </el-form-item>
        </div>

        <div class="setting-section">
          <div class="section-title">退货地址</div>
          <el-form-item label="收货人" prop="salesConsigneeName">
            <el-input
              v-model="form.salesConsigneeName"
              maxlength="11"
              clearable
              placeholder="请输入收货人姓名"
            />
          </el-form-item>
          <el-form-item label="收货人电话" prop="salesConsigneeMobile">
            <el-input
              v-model="form.salesConsigneeMobile"
              maxlength="11"
              clearable
              placeholder="请输入收货人电话"
            />
          </el-form-item>
          <el-form-item label="售后地址" prop="salesConsigneeAddressId">
            <span v-if="form.salesConsigneeAddressPath" class="address-text">
              {{ form.salesConsigneeAddressPath }}
            </span>
            <el-button @click="handleChangeAddress('salesConsigneeAddressPath')">选择</el-button>
          </el-form-item>
          <el-form-item label="详细地址" prop="salesConsigneeDetail">
            <el-input
              v-model="form.salesConsigneeDetail"
              clearable
              maxlength="50"
              placeholder="请输入详细地址"
            />
          </el-form-item>
        </div>

        <div class="submit-bar">
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            保存
          </el-button>
        </div>
      </el-form>
    </div>

    <multipleMap ref="mapRef" @callback="callbackAddress" />
  </el-card>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Shop from "@/api/shops";
import multipleMap from "@/views/my-components/map/multiple-map";
import * as RegExp from "@/libs/RegExp.js";
import { Message } from "@/utils/message";

defineOptions({ name: "addressManage" });

const currentKey = ref("");
const submitLoading = ref(false);

const form = ref({
  salesConsignorName: "",
  salesConsignorMobile: "",
  salesConsignorAddressId: "",
  salesConsignorAddressPath: "",
  salesConsignorDetail: "",
  salesConsigneeName: "",
  salesConsigneeMobile: "",
  salesConsigneeAddressId: "",
  salesConsigneeAddressPath: "",
  salesConsigneeDetail: "",
});

const formRules = {
  salesConsignorName: [
    { required: true, message: "请输入发货人姓名", trigger: "blur" },
  ],
  salesConsignorMobile: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
  salesConsignorDetail: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
  salesConsigneeName: [
    { required: true, message: "请输入收货人", trigger: "blur" },
  ],
  salesConsigneeMobile: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
  salesConsigneeDetail: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
};

const formRef = ref(null);
const mapRef = ref(null);

/**
 * 接收地图/行政区选择器回传的地址数据。
 * @param {object} val 地址选择结果
 */
function callbackAddress(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    const ids = val.data.map((item) => item.id).join(",");

    if (currentKey.value === "addressGoods") {
      form.value.salesConsignorAddressPath = paths;
      form.value.salesConsignorAddressId = ids;
    }
    if (currentKey.value === "salesConsigneeAddressPath") {
      form.value.salesConsigneeAddressPath = paths;
      form.value.salesConsigneeAddressId = ids;
    }
  } else {
    if (currentKey.value === "addressGoods") {
      form.value.salesConsignorAddressPath = val.data.addr;
      form.value.salesConsignorAddressId = val.data.addrId;
    }
    if (currentKey.value === "salesConsigneeAddressPath") {
      form.value.salesConsigneeAddressPath = val.data.addr;
      form.value.salesConsigneeAddressId = val.data.addrId;
    }
  }
}

/**
 * 打开地址选择弹窗。
 * @param {string} key 当前编辑的地址类型标识
 */
function handleChangeAddress(key) {
  currentKey.value = key;
  mapRef.value.open();
}

/**
 * 拉取店铺发货地址配置。
 */
function getDeliverAddress() {
  API_Shop.getDeliverAddress().then((res) => {
    if (res.success && res.result) {
      form.value.salesConsignorName = res.result.salesConsignorName || "";
      form.value.salesConsignorMobile = res.result.salesConsignorMobile || "";
      form.value.salesConsignorAddressId = res.result.salesConsignorAddressId || "";
      form.value.salesConsignorAddressPath = res.result.salesConsignorAddressPath || "";
      form.value.salesConsignorDetail = res.result.salesConsignorDetail || "";
    }
  });
}

/**
 * 拉取商家退货地址配置。
 */
function getRefundGoodsAddress() {
  API_Shop.getRefundGoodsAddress().then((res) => {
    if (res.success && res.result) {
      form.value.salesConsigneeName = res.result.salesConsigneeName || "";
      form.value.salesConsigneeMobile = res.result.salesConsigneeMobile || "";
      form.value.salesConsigneeAddressId = res.result.salesConsigneeAddressId || "";
      form.value.salesConsigneeAddressPath = res.result.salesConsigneeAddressPath || "";
      form.value.salesConsigneeDetail = res.result.salesConsigneeDetail || "";
    }
  });
}

/**
 * 统一校验并保存发货地址与退货地址配置。
 */
function handleSubmit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const deliverParams = {
        salesConsignorName: form.value.salesConsignorName,
        salesConsignorMobile: form.value.salesConsignorMobile,
        salesConsignorAddressId: form.value.salesConsignorAddressId,
        salesConsignorAddressPath: form.value.salesConsignorAddressPath,
        salesConsignorDetail: form.value.salesConsignorDetail,
      };
      const refundParams = {
        salesConsigneeName: form.value.salesConsigneeName,
        salesConsigneeMobile: form.value.salesConsigneeMobile,
        salesConsigneeAddressId: form.value.salesConsigneeAddressId,
        salesConsigneeAddressPath: form.value.salesConsigneeAddressPath,
        salesConsigneeDetail: form.value.salesConsigneeDetail,
      };
      const [deliverRes, refundRes] = await Promise.all([
        API_Shop.editDeliverAddress(deliverParams),
        API_Shop.saveRefundGoodsAddress(refundParams),
      ]);
      if (deliverRes?.success && refundRes?.success) {
        Message.success("保存成功");
        init();
      }
    } finally {
      submitLoading.value = false;
    }
  });
}

function init() {
  getDeliverAddress();
  getRefundGoodsAddress();
}

onMounted(() => {
  init();
});
</script>

<style scoped lang="scss">
.setting-page {
  padding: 16px 0;
}

.setting-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 24px 4px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.el-form-item {
  padding: 10px 0;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  display: flex;
  align-items: center;
}

:deep(.el-input) {
  width: 400px !important;
}

.address-text {
  margin-right: 10px;
  color: #606266;
}

.submit-bar {
  text-align: center;
  margin: 24px 0 8px;
}
</style>
