<template>
  <div class="panel-rich-text">
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
        <div class="section-title">富文本内容</div>
        <editor v-model="res.options.content" height="300px" />
      </div>
    </template>

    <template v-else>
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
import editor from "@/views/lili-components/editor";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  content: "",
  bgColor: "#FFFFFF",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
};

export default {
  name: "PanelRichText",
  hideDecorateTitle: true,
  components: { editor, GradientField, SliderField },
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
    };
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
  },
};
</script>

<style scoped lang="scss">
@import "../controls/panel-common.scss";

.panel-rich-text {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
