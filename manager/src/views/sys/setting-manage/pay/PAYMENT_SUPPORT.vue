<template>
  <div class="layout">
    <div class="row" v-for="(item, index) in formValidate" :key="index">
      <div class="col">
        <el-card shadow="never" :body-style="{ padding: '0 16px' }">
          <div class="icon-item" v-if="item.client == 'APP'">
            <img class="icon" src="../../../../assets/setting/app.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.client == 'PC'">
            <img class="icon" src="../../../../assets/setting/pc.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.client == 'WECHAT_MP'">
            <img class="icon" src="../../../../assets/setting/wechat_mp.svg" alt="" />
          </div>
          <div class="icon-item" v-if="item.client == 'H5'">
            <img class="icon" src="../../../../assets/setting/h5.svg" alt="" />
          </div>
          <div class="pay-title">{{ way[item.client] }}</div>

          <div>
            <el-divider content-position="left">支付设置</el-divider>

            <div class="pay-list">
              <el-checkbox-group v-model="item.supports" @change="handleChangePayType">
                <el-checkbox
                  v-for="(support, i) in supportForm.payments"
                  :key="i"
                  :value="support"
                >
                  {{ payWay[support] || support }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";
import { getPaymentSupportForm } from "@/api/setting";

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
  APP: "移动应用端",
  H5: "移动端",
  WECHAT_MP: "小程序端",
  PC: "PC端",
};
const formValidate = ref([]);
const payWay = {
  ALIPAY: "支付宝支付",
  WECHAT: "微信支付",
  WALLET: "余额支付",
};
const supportForm = ref("");
const checkSupport = ref({});

function submit(name) {
  handleSubmit(proxy, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}
function handleChangePayType(val) {
  ElMessageBox.confirm("您是否修改此项？", "修改支付设置", { type: "warning" }).then(() => {
    setupSetting();
  }).catch(() => {
    formValidate.value = JSON.parse(JSON.stringify(checkSupport.value));
  });
}
function setupSetting() {
  setSetting(props.type, { paymentSupportItems: formValidate.value }).then((res) => {
    if (res.success) {
      checkSupport.value = JSON.parse(JSON.stringify(formValidate.value));
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
  checkSupport.value = JSON.parse(JSON.stringify(formValidate.value));

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
.pay-title {
  text-align: center;
  margin: 10px 0;
}
.layout {
  padding: 20px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.row {
  width: 300px;
  margin-right: 20px;
  display: flex;
  margin-bottom: 20px;
}

.label-item {
  display: flex;
  align-items: center;
}
.pay-list {
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}
.icon-item {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.el-form-item {
  display: flex;
  align-items: center;
}
.icon {
  width: 100px;
  height: 100px;
}
</style>
