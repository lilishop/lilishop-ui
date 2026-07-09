<template>
  <el-card>
    <el-tabs v-model="selectedTab">
      <el-tab-pane label="视频号概括" name="WX_CHANNELS_OVERVIEW">
        <WxChannelsOverviewTab v-if="selectedTab === 'WX_CHANNELS_OVERVIEW'" />
      </el-tab-pane>
      <el-tab-pane label="视频号订单" name="WX_CHANNELS_ORDER">
        <WxChannelsOrderTab v-if="selectedTab === 'WX_CHANNELS_ORDER'" />
      </el-tab-pane>
      <el-tab-pane label="视频号退单" name="WX_CHANNELS_REFUND">
        <WxChannelsRefundTab v-if="selectedTab === 'WX_CHANNELS_REFUND'" />
      </el-tab-pane>
      <el-tab-pane label="视频号商品" name="WX_CHANNELS_GOODS">
        <WxChannelsGoodsTab v-if="selectedTab === 'WX_CHANNELS_GOODS'" />
      </el-tab-pane>
      <el-tab-pane label="视频号分类列表" name="WX_CHANNELS_CATEGORY">
        <WxChannelsCategoryTab v-if="selectedTab === 'WX_CHANNELS_CATEGORY'" />
      </el-tab-pane>
      <el-tab-pane label="视频号设置" name="WX_CHANNELS">
        <WxChannelsSettingTab v-if="selectedTab === 'WX_CHANNELS'" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import WxChannelsSettingTab from "./components/WxChannelsSettingTab.vue";
import WxChannelsCategoryTab from "./components/WxChannelsCategoryTab.vue";
import WxChannelsGoodsTab from "./components/WxChannelsGoodsTab.vue";
import WxChannelsOrderTab from "./components/WxChannelsOrderTab.vue";
import WxChannelsOverviewTab from "./components/WxChannelsOverviewTab.vue";
import WxChannelsRefundTab from "./components/WxChannelsRefundTab.vue";

export default {
  name: "wx-channel",
  components: {
    WxChannelsSettingTab,
    WxChannelsCategoryTab,
    WxChannelsGoodsTab,
    WxChannelsOrderTab,
    WxChannelsOverviewTab,
    WxChannelsRefundTab,
  },
  data() {
    return {
      selectedTab: "WX_CHANNELS",
    };
  },
};
</script>
