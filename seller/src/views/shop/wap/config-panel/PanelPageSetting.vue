<template>
  <div class="panel-page-setting">
    <div class="panel-header">
      <span class="panel-name">页面设置</span>
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
        <div class="section-title">基础设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label"><span class="required-star">*</span>模板名称</div>
          <div class="ctrl-body">
            <el-input v-model="res.name" maxlength="30" placeholder="请输入模板名称" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label"><span class="required-star">*</span>页面标题</div>
          <div class="ctrl-body">
            <el-input v-model="res.title" maxlength="30" placeholder="请输入页面标题" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card panel-card-fill">
        <div class="section-title">颜色设置</div>
        <segment-field v-model="res.bgType" label="背景设置" :options="bgTypeOptions" />
        <color-field
          v-if="res.bgType === 'color'"
          v-model="res.bgColor"
          label="背景颜色"
          :default-value="defaults.bgColor"
        />
        <template v-else>
          <div class="ctrl-row">
            <div class="ctrl-label">背景图片</div>
            <div class="ctrl-body bg-image-body">
              <div class="bg-image-preview" v-if="res.bgImage">
                <img :src="res.bgImage" alt="" />
                <el-icon class="bg-image-clear" @click="clearImage"><Close /></el-icon>
              </div>
              <el-button plain type="primary" @click="pickImage">上传图片</el-button>
            </div>
          </div>
          <div class="section-tip upload-tip">上传图片 建议：宽度750px</div>
          <segment-field v-model="res.bgFill" label="填充方式" :options="bgFillOptions" />
        </template>
        <color-field
          v-model="res.topColor"
          label="顶部颜色"
          :default-value="defaults.topColor"
        />
        <segment-field v-model="res.titleColor" label="标题颜色" :options="titleColorOptions" />
      </div>
    </template>

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
import ColorField from "../controls/ColorField.vue";
import SegmentField from "../controls/SegmentField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { Close } from "@element-plus/icons-vue";

const DEFAULTS = {
  name: "",
  title: "",
  bgType: "color",
  bgColor: "#F5F5F5",
  bgImage: "",
  bgFill: "stretch",
  topColor: "#ffffff",
  titleColor: "black",
};

export default {
  name: "PanelPageSetting",
  components: { ColorField, SegmentField, ossManage, Close },
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
      bgTypeOptions: [
        { label: "背景色", value: "color" },
        { label: "背景图", value: "image" },
      ],
      bgFillOptions: [
        { label: "拉伸", value: "stretch" },
        { label: "缩放", value: "contain" },
        { label: "填充", value: "cover" },
      ],
      titleColorOptions: [
        { label: "白色", value: "white" },
        { label: "黑色", value: "black" },
      ],
      picModelFlag: false,
    };
  },
  created() {
    Object.keys(DEFAULTS).forEach((key) => {
      if (this.res[key] === undefined) {
        this.res[key] = DEFAULTS[key];
      }
    });
  },
  methods: {
    pickImage() {
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
      if (val && val.url) {
        this.res.bgImage = val.url;
      }
    },
    clearImage() {
      this.res.bgImage = "";
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-page-setting {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
.required-star {
  color: #f56c6c;
  margin-right: 2px;
}
.bg-image-body {
  align-items: center;
}
.bg-image-preview {
  position: relative;
  width: 88px;
  height: 48px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 3px;
  box-sizing: border-box;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .bg-image-clear {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #909399;
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background: #f56c6c;
    }
  }
}
.upload-tip {
  margin: -8px 0 12px 102px;
}
</style>
