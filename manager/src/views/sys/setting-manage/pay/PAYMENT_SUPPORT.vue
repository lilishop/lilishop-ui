<template>
  <div class="setting-page">
    <div class="setting-section" v-for="(item, index) in formValidate" :key="index">
      <div class="section-title">
        <img class="client-icon" :src="clientIcons[item.client]" alt="" />
        <span>{{ way[item.client] || item.client }}</span>
      </div>
      <div class="pay-options">
        <el-checkbox
          v-for="payment in paymentOptions"
          :key="payment"
          :model-value="item.supports.includes(payment)"
          :label="payWay[payment] || payment"
          @change="(val) => togglePay(item, payment, val)"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";
import { getPaymentSupportForm } from "@/api/setting";
import iconApp from "../../../../assets/setting/app.svg";
import iconPc from "../../../../assets/setting/pc.svg";
import iconWechatMp from "../../../../assets/setting/wechat_mp.svg";
import iconH5 from "../../../../assets/setting/h5.svg";

const DEFAULT_PAYMENT_SUPPORT_ITEMS = [
  { client: "PC", supports: [] },
  { client: "H5", supports: [] },
  { client: "APP", supports: [] },
  { client: "WECHAT_MP", supports: [] },
];

const props = defineProps(["res", "type"]);

// validate.js 未去 vm 化，handleSubmit 仍需组件实例读取 $refs
const { proxy } = getCurrentInstance();

const ruleValidate = ref({});
const way = {
  APP: "APP",
  H5: "手机网页",
  WECHAT_MP: "微信小程序",
  PC: "电脑网页",
};
const clientIcons = {
  APP: iconApp,
  PC: iconPc,
  WECHAT_MP: iconWechatMp,
  H5: iconH5,
};
const formValidate = ref([]);
const payWay = {
  ALIPAY: "支付宝支付",
  WECHAT: "微信支付",
  WALLET: "余额支付",
};
const supportForm = ref("");

const paymentOptions = computed(() => supportForm.value.payments || []);

function submit(name) {
  handleSubmit(proxy, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}
function togglePay(row, payment, checked) {
  ElMessageBox.confirm("您是否修改此项？", "修改支付设置", { type: "warning" })
    .then(() => {
      if (checked) {
        row.supports.push(payment);
      } else {
        row.supports = row.supports.filter((p) => p !== payment);
      }
      setupSetting();
    })
    .catch(() => {});
}
function setupSetting() {
  setSetting(props.type, { paymentSupportItems: formValidate.value }).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}
function init() {
  const setting = JSON.parse(props.res || "{}");
  const items = setting.paymentSupportItems;
  formValidate.value =
    Array.isArray(items) && items.length ? items : DEFAULT_PAYMENT_SUPPORT_ITEMS;
  // 清理历史已保存的失效支付方式，下次保存时一并去除
  formValidate.value.forEach((item) => {
    item.supports = (item.supports || []).filter((p) => p in payWay);
  });

  getPaymentSupportForm().then((res) => {
    if (res.success && res.result) {
      supportForm.value = res.result;
    }
  });
}

init();
</script>

<style lang="scss" scoped>
@import "../setting/style.scss";

.setting-page {
  padding: 16px;
}

.setting-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.client-icon {
  width: 28px;
  height: 28px;
}

.pay-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}
</style>
