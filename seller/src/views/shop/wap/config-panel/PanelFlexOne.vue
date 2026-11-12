<template>
  <div class="panel-flex-one">
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
        <div class="section-title">内容设置</div>
        <div class="img-preview" v-if="item.img">
          <img :src="item.img" alt="" />
        </div>
        <div class="img-placeholder" v-else>尺寸不限</div>
        <div class="btn-row">
          <el-button plain type="primary" size="small" @click="pickImage">选择照片</el-button>
          <el-button plain type="primary" size="small" @click="openHotzone">绘制热区</el-button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">颜色设置</div>
        <color-field
          v-model="res.options.bgColor"
          label="背景颜色"
          :default-value="defaults.bgColor"
        />
      </div>
      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field
          v-model="res.options.paddingTop"
          label="上边距"
          :min="0"
          :max="100"
        />
        <slider-field
          v-model="res.options.paddingBottom"
          label="下边距"
          :min="0"
          :max="100"
        />
        <slider-field
          v-model="res.options.paddingX"
          label="左右边距"
          :min="0"
          :max="40"
        />
        <slider-field
          v-model="res.options.pageGap"
          label="页面间距"
          :min="0"
          :max="100"
        />
      </div>
      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field
          v-model="res.options.borderRadius"
          label="背景圆角"
          :min="0"
          :max="30"
        />
        <slider-field
          v-model="res.options.imgRadius"
          label="内容圆角"
          :min="0"
          :max="30"
        />
      </div>
    </template>

    <hotzone ref="hotzone" @changeZone="changeZone"></hotzone>

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
import SliderField from "../controls/SliderField.vue";
import hotzone from "@/views/shop/hotzone";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { ElMessage } from "element-plus";

const DEFAULTS = {
  bgColor: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
  imgRadius: 0,
};

export default {
  name: "PanelFlexOne",
  hideDecorateTitle: true,
  components: { ColorField, SliderField, hotzone, ossManage },
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
    };
  },
  computed: {
    item() {
      return this.res.options.list[0];
    },
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
    if (!Array.isArray(this.res.options.list) || !this.res.options.list.length) {
      this.res.options.list = [
        { img: "", url: "", link: "", size: "750*280", model: "hotzone" },
      ];
    }
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
        this.item.img = val.url;
      }
    },
    openHotzone() {
      if (!this.item.img) {
        ElMessage.warning("请先选择照片");
        return;
      }
      this.$refs.hotzone.open(this.item);
    },
    changeZone(zoneInfo) {
      this.item.zoneInfo = zoneInfo;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/panel-common.scss";
.panel-flex-one {
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
.panel-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
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
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}
.btn-row {
  display: flex;
  gap: 8px;
  :deep(.el-button),
  .el-button {
    flex: 1;
    min-width: 0;
    margin: 0 !important;
  }
}
</style>
