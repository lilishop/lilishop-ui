
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
<script>
import { getSetting } from "@/api/index.js";
import templateSetting from "./template";

export default {
  data() {
    return {
      templateSetting, // 设置模板
      selected: "", // 已选
      settingData: "", // 模板数据
      show: true, // 是否显示
      setting: [
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
      ],
      authLogin: [
        // 登录设置
        { type: "CONNECT_SETTING", name: "登录设置" },
        // 微信设置
        { type: "WECHAT_CONNECT", name: "微信设置" },
        // QQ设置
        { type: "QQ_CONNECT", name: "QQ设置" },
      ],
      pay: [
        //支付宝支付设置
        { type: "PAYMENT_SUPPORT", name: "支付开启/关闭" },
        //支付宝支付设置
        { type: "ALIPAY_PAYMENT", name: "支付宝支付设置" },
        //微信支付设置
        { type: "WECHAT_PAYMENT", name: "微信支付设置" },
      ],
      tabWay: [], // tab数据
      settingRequestSeq: 0,
    };
  },

  watch: {
    $route(to, from) {
      this.selected = "";
      this.show = false;
      this.getSettingData(this.selected);
      this.$nextTick(() => {
        this.show = true;
      });
    },
  },
  mounted() {
    this.clickTab(this.selected);
  },
  methods: {
    // tab切换
    clickTab(name) {
      this.selected = name;
      this.getSettingData(name);
    },
    resolveTabWay() {
      const tabMap = {
        setting: this.setting,
        authLogin: this.authLogin,
        pay: this.pay,
      };
      this.tabWay = tabMap[this.$route.name] || [];
    },
    normalizeSettingResult(res) {
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
    },
    /**
     * 进入页面请求第一个配置
     */
    getSettingData(name) {
      this.settingData = "";
      this.resolveTabWay();

      if (!name) {
        if (!this.tabWay.length) {
          return;
        }
        name = this.tabWay[0].type;
        this.selected = name;
      }

      const requestId = ++this.settingRequestSeq;
      getSetting(name)
        .then((res) => {
          if (requestId !== this.settingRequestSeq) {
            return;
          }
          this.settingData = JSON.stringify(this.normalizeSettingResult(res));
        })
        .catch(() => {
          if (requestId !== this.settingRequestSeq) {
            return;
          }
          this.settingData = "{}";
        });
    },
  },
};
</script>
