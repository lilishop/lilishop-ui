<template>
  <div class="panel-search">
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
      <div class="panel-card">
        <div class="section-title">提示文字设置</div>
        <div class="field-row">
          <div class="field-label">提示文字</div>
          <el-input
            v-model="res.options.list[0].title"
            size="default"
            maxlength="20"
            placeholder="搜索商品名称"
          />
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">搜索热词</div>
        <div class="hot-word" v-for="(word, index) in res.options.hotWords" :key="index">
          <el-input
            v-model="res.options.hotWords[index]"
            size="default"
            maxlength="10"
            placeholder="选填，不超过十个字"
          />
          <el-icon class="del" @click="removeWord(index)"><CircleClose /></el-icon>
        </div>
        <el-button class="add-btn" plain type="primary" @click="addWord">
          + 添加热词
        </el-button>
        <div class="field-row interval-row">
          <div class="field-label">切换时间</div>
          <el-input-number
            class="interval-input"
            v-model="res.options.hotInterval"
            :min="1"
            :max="60"
            size="default"
            controls-position="right"
          />
          <span class="unit">秒</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">文本位置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">文本位置</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: res.options.textAlign !== 'center' }"
                @click="res.options.textAlign = 'left'"
              >
                居左
              </div>
              <div
                class="seg-item"
                :class="{ active: res.options.textAlign === 'center' }"
                @click="res.options.textAlign = 'center'"
              >
                居中
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
        <color-field
          v-model="res.options.boxColor"
          label="框体颜色"
          :default-value="defaults.boxColor"
        />
        <color-field
          v-model="res.options.textColor"
          label="输入文字颜色"
          :default-value="defaults.textColor"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="20" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.boxRadius" label="内容圆角" :min="0" :max="30" />
      </div>
    </template>
  </div>
</template>

<script>
import ColorField from "../controls/ColorField.vue";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";
import { CircleClose } from "@element-plus/icons-vue";

const DEFAULTS = {
  textAlign: "left",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  boxColor: "#EDEDED",
  textColor: "#999999",
  paddingX: 12,
  borderRadius: 0,
  boxRadius: 15,
  hotWords: [],
  hotInterval: 3,
};

export default {
  name: "PanelSearch",
  hideDecorateTitle: true,
  components: { ColorField, GradientField, SliderField, CircleClose },
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
    if (!Array.isArray(this.res.options.list) || !this.res.options.list.length) {
      this.res.options.list = [{ title: "搜索" }];
    }
    if (!Array.isArray(this.res.options.hotWords)) {
      this.res.options.hotWords = [];
    }
  },
  methods: {
    addWord() {
      this.res.options.hotWords.push("");
    },
    removeWord(index) {
      this.res.options.hotWords.splice(index, 1);
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
.panel-search {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  margin-bottom: 12px;
  padding: 0 14px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  .panel-name {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }
}
.panel-tabs {
  display: inline-flex;
  background: #f4f4f5;
  border-radius: 8px;
  padding: 3px;
  .panel-tab {
    padding: 5px 14px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    color: #606266;
    transition: all 0.2s ease;
    &.active {
      background: #ffffff;
      color: #409eff;
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
    }
  }
}
.panel-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}
.field-row {
  display: flex;
  align-items: center;
  .field-label {
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;
  }
}
.hot-word {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  .del {
    cursor: pointer;
    color: #909399;
    font-size: 18px;
    flex-shrink: 0;
    &:hover {
      color: #e1251b;
    }
  }
}
.add-btn {
  width: 100%;
  margin-bottom: 14px;
}
.interval-row {
  .interval-input {
    flex: 1;
    min-width: 0;
    :deep(.el-input__inner) {
      text-align: center;
    }
  }
  .unit {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
  }
}
</style>
