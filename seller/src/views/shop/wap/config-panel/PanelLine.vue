<template>
  <div class="panel-line">
    <div class="panel-header">
      <span class="panel-name">{{ res.name }}</span>
    </div>

    <div class="panel-card">
      <div class="section-title">颜色设置</div>
      <gradient-field
        v-model:start="res.options.bgColor1"
        v-model:end="res.options.bgColor2"
        :default-start="defaults.bgColor1"
        :default-end="defaults.bgColor2"
      />
      <color-field
        v-model="res.options.lineColor"
        label="线条颜色"
        :default-value="defaults.lineColor"
      />
    </div>

    <div class="panel-card panel-card-fill">
      <div class="section-title">样式设置</div>
      <segment-field
        v-model="res.options.lineStyle"
        label="线条样式"
        :options="lineStyleOptions"
      />
      <slider-field v-model="res.options.lineHeight" label="线条高度" :min="1" :max="100" />
      <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
      <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
    </div>
  </div>
</template>

<script>
import ColorField from "../controls/ColorField.vue";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";
import SegmentField from "../controls/SegmentField.vue";

const DEFAULTS = {
  bgColor: "#FFFFFF",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  lineColor: "#979797",
  lineStyle: "dashed",
  lineHeight: 1,
  paddingX: 0,
  pageGap: 0,
};

export default {
  name: "PanelLine",
  hideDecorateTitle: true,
  components: { ColorField, GradientField, SliderField, SegmentField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return {
      defaults: DEFAULTS,
      lineStyleOptions: [
        { label: "虚线", value: "dashed" },
        { label: "实线", value: "solid" },
        { label: "点状线", value: "dotted" },
      ],
    };
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
  },
};
</script>

<style scoped lang="scss">
@import "../controls/panel-common.scss";

.panel-line {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
