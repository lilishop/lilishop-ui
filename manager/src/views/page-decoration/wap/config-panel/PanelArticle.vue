<template>
  <div class="panel-article">
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
        <div class="section-title">文章设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题</div>
          <div class="ctrl-body">
            <el-input v-model="firstItem.title" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">文章分类</div>
          <div class="ctrl-body">
            <el-select
              v-model="firstItem.categoryId"
              placeholder="全部分类"
              clearable
             
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </div>
        </div>
        <slider-field
          v-model="firstItem.count"
          label="文章数量"
          :min="1"
          :max="10"
        />
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
        <color-field
          v-model="res.options.titleColor"
          label="标题颜色"
          :default-value="defaults.titleColor"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.contentGap" label="文章间距" :min="0" :max="50" />
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
import { getArticleCategory } from "@/api/pages";
import ColorField from "../controls/ColorField.vue";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  titleColor: "#282828",
  paddingTop: 10,
  paddingBottom: 10,
  contentGap: 10,
  paddingX: 0,
  pageGap: 10,
  borderRadius: 0,
};
const DEFAULT_ITEM = { title: "文章列表", categoryId: "", count: 6 };

function flattenCategories(tree, level = 0) {
  const result = [];
  (tree || []).forEach((node) => {
    result.push({ id: node.id, name: "　".repeat(level) + node.articleCategoryName });
    if (node.children && node.children.length) {
      result.push(...flattenCategories(node.children, level + 1));
    }
  });
  return result;
}

export default {
  name: "PanelArticle",
  hideDecorateTitle: true,
  components: { ColorField, GradientField, SliderField },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return {
      defaults: DEFAULTS,
      categories: [],
      activeTab: "content",
      tabs: [
        { key: "content", title: "内容" },
        { key: "style", title: "样式" },
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
    getArticleCategory().then((res) => {
      if (res.success) {
        this.categories = flattenCategories(res.result);
      }
    });
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
</style>
