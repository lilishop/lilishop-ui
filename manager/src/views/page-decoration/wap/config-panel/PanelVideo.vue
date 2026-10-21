<template>
  <div class="panel-video">
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
        <div class="section-title">视频内容设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">上传视频</div>
          <div class="ctrl-body">
            <div class="upload-state" :class="{ filled: item.videoUrl }">
              {{ item.videoUrl ? "已选择视频" : "未选择视频" }}
            </div>
            <el-button plain type="primary" @click="pickFile('videoUrl')">
              {{ item.videoUrl ? "重新选择" : "上传视频" }}
            </el-button>
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">视频封面</div>
          <div class="ctrl-body">
            <div class="cover-preview" v-if="item.poster">
              <img :src="item.poster" alt="" />
            </div>
            <div class="cover-placeholder" v-else>封面</div>
            <el-button plain type="primary" @click="pickFile('poster')">
              {{ item.poster ? "重新选择" : "上传封面" }}
            </el-button>
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">自动播放</div>
          <div class="ctrl-body">
            <el-switch v-model="item.autoplay" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">画面比例</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in aspectOptions"
                :key="opt"
                class="seg-item"
                :class="{ active: (item.aspectRatio || '16:9') === opt }"
                @click="item.aspectRatio = opt"
              >
                {{ opt }}
              </div>
            </div>
          </div>
        </div>
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
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.imgRadius" label="内容圆角" :min="0" :max="30" />
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
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
  imgRadius: 0,
};

export default {
  name: "PanelVideo",
  hideDecorateTitle: true,
  components: { GradientField, SliderField, ossManage },
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
      aspectOptions: ["16:9", "4:3", "1:1"],
      picModelFlag: false,
      currentField: "videoUrl",
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
        { videoUrl: "", poster: "", autoplay: false, aspectRatio: "16:9" },
      ];
    }
  },
  methods: {
    pickFile(field) {
      this.currentField = field;
      this.picModelFlag = true;
      this.$nextTick(() => {
        const oss = this.$refs.ossManage;
        if (!oss) return;
        oss.selectImage = true;
        oss.fileType = field === "videoUrl" ? "video" : "pic";
        oss.changeFileType();
      });
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      if (val && val.url) {
        this.item[this.currentField] = val.url;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
.panel-video {
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
.upload-state {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.filled {
    color: #409eff;
  }
}
.cover-preview {
  width: 88px;
  height: 44px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 3px;
  box-sizing: border-box;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 4px;
  }
}
.cover-placeholder {
  width: 88px;
  height: 44px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
}
.seg {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  .seg-item {
    padding: 6px 14px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    border-left: 1px solid #dcdfe6;
    transition: all 0.2s ease;
    &:first-child {
      border-left: none;
    }
    &.active {
      background: #ecf5ff;
      color: #409eff;
      font-weight: 600;
    }
  }
}
</style>
