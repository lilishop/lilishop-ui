<template>
  <div class="panel-rich-text">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="内容" name="content">
        <editor v-model="res.options.content" height="300px" />
      </el-tab-pane>
      <el-tab-pane label="样式" name="style">
        <color-field
          v-model="res.options.bgColor"
          label="背景颜色"
          :default-value="defaults.bgColor"
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
        <slider-field
          v-model="res.options.borderRadius"
          label="背景圆角"
          :min="0"
          :max="30"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import editor from "@/components/editor";
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  content: "",
  bgColor: "#FFFFFF",
  paddingX: 12,
  pageGap: 10,
  borderRadius: 0,
};

export default {
  name: "PanelRichText",
  components: { editor, ColorField, SliderField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return { defaults: DEFAULTS, activeTab: "content" };
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
  },
};
</script>
