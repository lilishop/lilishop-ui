<template>
  <div class="panel-blank">
    <color-field
      v-model="res.options.bgColor"
      label="背景颜色"
      :default-value="defaults.bgColor"
    />
    <slider-field
      v-model="res.options.height"
      label="空白高度"
      :min="1"
      :max="100"
    />
    <slider-field
      v-model="res.options.paddingX"
      label="左右边距"
      :min="0"
      :max="30"
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

const DEFAULTS = {
  bgColor: "#f5f5f5",
  height: 10,
  paddingX: 0,
  pageGap: 10,
};

export default {
  name: "PanelBlank",
  components: { ColorField, SliderField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return { defaults: DEFAULTS };
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
  },
};
</script>
