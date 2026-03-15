<template>
  <Card>
    <Tabs v-model="selectedTab">
      <TabPane label="视频号概括" name="WX_CHANNELS_OVERVIEW">
        <WxChannelsOverviewTab v-if="selectedTab === 'WX_CHANNELS_OVERVIEW'" />
      </TabPane>
      <TabPane label="视频号订单" name="WX_CHANNELS_ORDER">
        <WxChannelsOrderTab v-if="selectedTab === 'WX_CHANNELS_ORDER'" />
      </TabPane>
      <TabPane label="视频号退单" name="WX_CHANNELS_REFUND">
        <WxChannelsRefundTab v-if="selectedTab === 'WX_CHANNELS_REFUND'" />
      </TabPane>
      <TabPane label="视频号商品" name="WX_CHANNELS_GOODS">
        <WxChannelsGoodsTab v-if="selectedTab === 'WX_CHANNELS_GOODS'" />
      </TabPane>
      <TabPane label="视频号分类列表" name="WX_CHANNELS_CATEGORY">
        <WxChannelsCategoryTab v-if="selectedTab === 'WX_CHANNELS_CATEGORY'" />
      </TabPane>
      <TabPane label="视频号设置" name="WX_CHANNELS">
        <WxChannelsSettingTab v-if="selectedTab === 'WX_CHANNELS'" />
      </TabPane>
    </Tabs>
  </Card>
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
