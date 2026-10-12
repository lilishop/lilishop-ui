<template>
  <div class="panel-line">
    <color-field
      v-model="res.options.bgColor"
      label="背景颜色"
      :default-value="defaults.bgColor"
    />
    <color-field
      v-model="res.options.lineColor"
      label="线条颜色"
      :default-value="defaults.lineColor"
    />
    <segment-field
      v-model="res.options.lineStyle"
      label="线条样式"
      :options="lineStyleOptions"
    />
    <slider-field
      v-model="res.options.lineHeight"
      label="线条高度"
      :min="1"
      :max="100"
    />
    <slider-field
      v-model="res.options.paddingX"
      label="左右边距"
      :min="0"
      :max="100"
    />
    <slider-field
      v-model="res.options.pageGap"
      label="页面间距"
      :min="0"
      :max="100"
    />
  </div>
</template>

<script>
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import SegmentField from "../controls/SegmentField.vue";

const DEFAULTS = {
  bgColor: "#FFFFFF",
  lineColor: "#979797",
  lineStyle: "dashed",
  lineHeight: 1,
  paddingX: 0,
  pageGap: 10,
};

export default {
  name: "PanelLine",
  components: { ColorField, SliderField, SegmentField },
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
