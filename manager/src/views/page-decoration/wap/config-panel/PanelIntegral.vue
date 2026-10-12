<template>
  <div class="panel-integral">
    <div class="ctrl-row">
      <div class="ctrl-label">标题</div>
      <div class="ctrl-body">
        <el-input v-model="firstItem.title" style="width: 200px" />
      </div>
    </div>
    <slider-field
      v-model="firstItem.count"
      label="显示数量"
      :min="1"
      :max="20"
    />
    <color-field
      v-model="res.options.bgColor"
      label="背景颜色"
      :default-value="defaults.bgColor"
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
    <slider-field
      v-model="res.options.borderRadius"
      label="背景圆角"
      :min="0"
      :max="30"
    />
  </div>
</template>

<script>
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  bgColor: "#FFFFFF",
  paddingX: 0,
  pageGap: 10,
  borderRadius: 0,
};
const DEFAULT_ITEM = { title: "积分商城", count: 3 };

export default {
  name: "PanelIntegral",
  components: { ColorField, SliderField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return { defaults: DEFAULTS };
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
</style>
