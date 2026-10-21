<template>
  <div class="panel-coupon">
    <div class="panel-header">
      <span class="panel-name">{{ res.name }}</span>
      <div class="panel-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="panel-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.title }}
        </div>
      </div>
    </div>

    <template v-if="activeTab === 'content'">
      <div class="panel-card panel-card-fill">
        <div class="section-title">展示设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题</div>
          <div class="ctrl-body">
            <el-input v-model="firstItem.title" />
          </div>
        </div>
        <slider-field v-model="firstItem.count" label="展示数量" :min="1" :max="10" />
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">布局设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                v-for="opt in layoutOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: (res.options.layoutStyle || '1') === opt.value }"
                @click="res.options.layoutStyle = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">颜色设置</div>
        <gradient-field
          v-model:start="res.options.bgColor1"
          v-model:end="res.options.bgColor2"
          :default-start="defaults.bgColor1"
          :default-end="defaults.bgColor2"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.contentGap" label="内容间距" :min="0" :max="20" />
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
      </div>
    </template>
  </div>
</template>

<script>
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  layoutStyle: "1",
  bgColor: "#FFFFFF",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  contentGap: 5,
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
};
const DEFAULT_ITEM = { title: "优惠券", count: 5 };

export default {
  name: "PanelCoupon",
  hideDecorateTitle: true,
  components: { GradientField, SliderField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return {
      defaults: DEFAULTS,
      activeTab: "content",
      tabs: [
        { key: "content", title: "内容" },
        { key: "style", title: "样式" },
      ],
      layoutOptions: [
        { value: "1", title: "样式一" },
        { value: "2", title: "样式二" },
        { value: "3", title: "样式三" },
        { value: "4", title: "样式四" },
      ],
    };
  },
  computed: {
    firstItem() {
      return this.res.options.list[0];
    },
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
    if (!Array.isArray(this.res.options.list) || !this.res.options.list[0]) {
      this.res.options.list = [{ ...DEFAULT_ITEM }];
    }
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-coupon {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
