<template>
  <div class="panel-ad-cube">
    <div class="panel-header">
      <span class="panel-name">图片魔方</span>
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
        <div class="section-title">图片设置</div>
        <div class="section-tip">当前风格：{{ res.name }}，请按布局区域配置对应图片</div>
        <div class="img-item" v-for="(item, index) in res.options.list" :key="index">
          <div class="img-item-head">
            <span>图片 {{ index + 1 }}</span>
            <span class="img-size" v-if="item.size">建议尺寸 {{ item.size }}</span>
          </div>
          <div class="img-preview" v-if="item.img">
            <img :src="item.img" alt="" />
          </div>
          <div class="img-placeholder" v-else>尺寸 {{ item.size || "不限" }}</div>
          <div class="field-row" v-if="item.title !== undefined">
            <div class="field-label">文字</div>
            <el-input v-model="item.title" maxlength="10" />
          </div>
          <div class="btn-row">
            <el-button plain type="primary" @click="pickImage(item)">选择照片</el-button>
            <el-button plain type="primary" @click="pickLink(item)">选择链接</el-button>
          </div>
          <div class="link-view" v-if="item.url && item.url.___type">
            已选链接：{{ linkText(item.url) }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">风格选择</div>
        <div class="section-tip">切换风格将重置当前已配置的图片内容</div>
        <div class="style-grid">
          <div
            v-for="style in styleList"
            :key="style.type"
            class="style-item"
            :class="{ active: res.type === style.type }"
            @click="changeStyle(style)"
          >
            {{ style.name }}
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
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
        <slider-field v-model="res.options.contentGap" label="内容间距" :min="0" :max="20" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.imgRadius" label="内容圆角" :min="0" :max="30" />
      </div>
    </template>

    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>

    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        @callback="callbackSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        ref="ossManage"
      />
    </el-dialog>
  </div>
</template>

<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";
import { modelData } from "../config";
import ColorField from "../controls/ColorField.vue";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  pageGap: 0,
  contentGap: 0,
  borderRadius: 0,
  imgRadius: 0,
};

export default {
  name: "PanelAdCube",
  hideDecorateTitle: true,
  components: { ossManage, ColorField, GradientField, SliderField },
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
      picModelFlag: false,
      currentItem: null,
    };
  },
  computed: {
    // 图片魔方的可选风格（config 中 drawer 标记的条目）
    styleList() {
      return modelData.filter((m) => m.drawer);
    },
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
  },
  methods: {
    linkText(url) {
      const way = ways.find((e) => e.name === url.___type);
      const typeTitle = way ? way.title : "发现";
      const name =
        url.name || url.goodsName || url.memberName || url.title || "";
      return name ? `${typeTitle} - ${name}` : typeTitle;
    },
    changeStyle(style) {
      if (style.type === this.res.type) return;
      this.$emit("handleDrawer", style);
    },
    pickImage(item) {
      this.currentItem = item;
      this.picModelFlag = true;
      this.$nextTick(() => {
        const oss = this.$refs.ossManage;
        if (!oss) return;
        oss.selectImage = true;
        oss.fileType = "pic";
        oss.changeFileType();
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      if (val && val.url && this.currentItem) {
        this.currentItem.img = val.url;
      }
    },
    pickLink(item) {
      this.currentItem = item;
      const dialog = this.$refs.liliDialog;
      dialog.clearGoodsSelected();
      dialog.goodsFlag = false;
      dialog.flag = true;
    },
    selectedLink(val) {
      if (!this.currentItem) return;
      delete val.selected;
      delete val.intro;
      delete val.mobileIntro;
      this.currentItem.url = val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/panel-common.scss";
.panel-ad-cube {
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
.section-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}
.img-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  .img-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #303133;
    margin-bottom: 8px;
    .img-size {
      font-size: 12px;
      color: #909399;
    }
  }
}
.img-preview {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 6px;
  margin-bottom: 10px;
  img {
    width: 100%;
    display: block;
    border-radius: 4px;
  }
}
.img-placeholder {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}
.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .field-label {
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;
  }
}
.btn-row {
  display: flex;
  gap: 10px;
}
.link-view {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  .style-item {
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    padding: 10px 4px;
    text-align: center;
    font-size: 12px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
    &.active {
      border-color: #409eff;
      background: #ecf5ff;
      color: #409eff;
      font-weight: 600;
    }
  }
}
</style>
