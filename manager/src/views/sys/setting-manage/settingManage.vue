
<template>
  <el-card v-if="show">
    <el-tabs v-model="selected" @tab-change="clickTab">
      <el-tab-pane
        v-for="(tabItem, tabIndex) in tabWay"
        :key="tabIndex"
        :label="tabItem.name"
        :name="tabItem.type"
      >
        <component
          v-if="settingData && selected === tabItem.type"
          :is="templateSetting[tabItem.type]"
          :res="settingData"
          :type="tabItem.type"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getSetting } from "@/api/index.js";
import templateSetting from "./template";

const route = useRoute();

const selected = ref(""); // 已选
const settingData = ref(""); // 模板数据
const show = ref(true); // 是否显示
const setting = ref([
  //基础配置
  {
    type: "BASE_SETTING",
    name: "基础配置",
  },
  //商品设置
  {
    type: "GOODS_SETTING",
    name: "商品设置",
  },
  //订单配置
  {
    type: "ORDER_SETTING",
    name: "订单配置",
  },
  //积分设置
  { type: "POINT_SETTING", name: "积分设置" },
  {
    type: "WITHDRAWAL_SETTING",
    name: "提现设置",
  },
  //  快递查询设置
  {
    type: "LOGISTICS_SETTING",
    name: "快递查询设置",
  },
  //静态资源配置
  {
    type: "OSS_SETTING",
    name: "静态资源配置",
  },
  //短信配置
  {
    type: "SMS_SETTING",
    name: "短信配置",
  },
  //阿里短信配置
  {
    type: "IM_SETTING",
    name: "客服设置",
  },
  {
    type: "LIVE_SETTING",
    name: "直播设置",
  },
]);
const authLogin = ref([
  // 登录设置
  { type: "CONNECT_SETTING", name: "登录设置" },
  // 微信设置
  { type: "WECHAT_CONNECT", name: "微信设置" },
  // QQ设置
  { type: "QQ_CONNECT", name: "QQ设置" },
]);
const pay = ref([
  //支付宝支付设置
  { type: "PAYMENT_SUPPORT", name: "支付开启/关闭" },
  //支付宝支付设置
  { type: "ALIPAY_PAYMENT", name: "支付宝支付设置" },
  //微信支付设置
  { type: "WECHAT_PAYMENT", name: "微信支付设置" },
]);
const tabWay = ref([]); // tab数据
const settingRequestSeq = ref(0);

watch(route, (to, from) => {
  selected.value = "";
  show.value = false;
  getSettingData(selected.value);
  nextTick(() => {
    show.value = true;
  });
});

onMounted(() => {
  clickTab(selected.value);
});

// tab切换
function clickTab(name) {
  selected.value = name;
  getSettingData(name);
}

function resolveTabWay() {
  const tabMap = {
    setting: setting.value,
    authLogin: authLogin.value,
    pay: pay.value,
  };
  tabWay.value = tabMap[route.name] || [];
}

function normalizeSettingResult(res) {
  if (!res || res.result == null) {
    return {};
  }
  const raw = res.result;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }
  if (typeof raw === "object") {
    return raw;
  }
  return {};
}

/**
 * 进入页面请求第一个配置
 */
function getSettingData(name) {
  settingData.value = "";
  resolveTabWay();

  if (!name) {
    if (!tabWay.value.length) {
      return;
    }
    name = tabWay.value[0].type;
    selected.value = name;
  }

  const requestId = ++settingRequestSeq.value;
  getSetting(name)
    .then((res) => {
      if (requestId !== settingRequestSeq.value) {
        return;
      }
      settingData.value = JSON.stringify(normalizeSettingResult(res));
    })
    .catch(() => {
      if (requestId !== settingRequestSeq.value) {
        return;
      }
      settingData.value = "{}";
    });
}
</script>
