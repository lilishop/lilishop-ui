<template>
  <div class="panel-blank">
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
    </div>

    <div class="panel-card">
      <div class="section-title">高度设置</div>
      <slider-field v-model="res.options.height" label="空白高度" :min="1" :max="100" />
    </div>

    <div class="panel-card panel-card-fill">
      <div class="section-title">边距设置</div>
      <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
      <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
    </div>
  </div>
</template>

<script>
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  bgColor: "#f5f5f5",
  bgColor1: "#f5f5f5",
  bgColor2: "#f5f5f5",
  height: 10,
  paddingX: 0,
  pageGap: 10,
};

export default {
  name: "PanelBlank",
  hideDecorateTitle: true,
  components: { GradientField, SliderField },
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

<style scoped lang="scss">
@import "../controls/panel-common.scss";

.panel-blank {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
