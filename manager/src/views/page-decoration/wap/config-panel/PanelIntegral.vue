<template>
  <div class="panel-integral">
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
        <div class="section-title">头部设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选择风格</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.headBgType">
              <el-radio value="image">背景图片</el-radio>
              <el-radio value="color">背景色</el-radio>
            </el-radio-group>
          </div>
        </div>
        <gradient-field
          v-if="res.options.headBgType === 'color'"
          v-model:start="res.options.headBg1"
          v-model:end="res.options.headBg2"
          label="背景颜色"
          :default-start="defaults.headBg1"
          :default-end="defaults.headBg2"
        />
        <div class="ctrl-row" v-else>
          <div class="ctrl-label">背景图片</div>
          <div class="ctrl-body">
            <div class="bg-preview" v-if="res.options.headBgImage">
              <img :src="res.options.headBgImage" alt="" />
            </div>
            <el-button plain type="primary" @click="pickFile('headBgImage')">上传背景图</el-button>
          </div>
        </div>
        <div class="section-tip" v-if="res.options.headBgType !== 'color'">建议 710px*96px</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题类型</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.titleType">
              <el-radio value="image">图片</el-radio>
              <el-radio value="text">文字</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="ctrl-row" v-if="res.options.titleType === 'image'">
          <div class="ctrl-label">标题图片</div>
          <div class="ctrl-body">
            <div class="icon-preview" v-if="res.options.titleImage">
              <img :src="res.options.titleImage" alt="" />
            </div>
            <el-button plain type="primary" @click="pickFile('titleImage')">上传标题图</el-button>
          </div>
        </div>
        <div class="ctrl-row" v-else>
          <div class="ctrl-label">标题文字</div>
          <div class="ctrl-body">
            <el-input v-model="firstItem.title" maxlength="10" placeholder="积分兑好礼" />
          </div>
        </div>
        <slider-field v-model="firstItem.count" label="展示数量" :min="1" :max="20" />
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">布局设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in layoutOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: (res.options.layoutStyle || '1') === opt.value }"
                @click="res.options.layoutStyle = opt.value"
              >
                {{ opt.title }}
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
          label="内容背景"
          :default-start="defaults.bgColor1"
          :default-end="defaults.bgColor2"
        />
        <color-field
          v-model="res.options.pointColor"
          label="积分价格颜色"
          :default-value="defaults.pointColor"
        />
        <div class="ctrl-row">
          <div class="ctrl-label">标题文字</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in titleStyleOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: (res.options.titleStyle || 'bold') === opt.value }"
                @click="res.options.titleStyle = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <color-field
          v-model="res.options.titleColor"
          label="标题颜色"
          :default-value="defaults.titleColor"
        />
        <color-field
          v-model="res.options.moreColor"
          label="更多按钮颜色"
          :default-value="defaults.moreColor"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.contentGap" label="内容间距" :min="0" :max="20" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.imgRadius" label="图片圆角" :min="0" :max="30" />
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
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";

const DEFAULTS = {
  layoutStyle: "1",
  pointColor: "#F5483A",
  headBgType: "color",
  headBg1: "#FF6A00",
  headBg2: "#FF2200",
  headBgImage: "",
  titleType: "text",
  titleImage: "",
  titleStyle: "bold",
  titleColor: "#FFFFFF",
  moreColor: "#FFFFFF",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  contentGap: 12,
  pageGap: 0,
  borderRadius: 7,
  imgRadius: 5,
};
const DEFAULT_ITEM = { title: "积分兑好礼", count: 3 };

export default {
  name: "PanelIntegral",
  hideDecorateTitle: true,
  components: { GradientField, ColorField, SliderField, ossManage },
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
      titleStyleOptions: [
        { value: "bold", title: "加粗" },
        { value: "normal", title: "正常" },
        { value: "italic", title: "倾斜" },
      ],
      layoutOptions: [
        { value: "1", title: "样式一" },
        { value: "2", title: "样式二" },
        { value: "3", title: "样式三" },
      ],
      picModelFlag: false,
      currentField: "",
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
  },
  methods: {
    pickFile(field) {
      this.currentField = field;
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
      if (val && val.url && this.currentField) {
        this.res.options[this.currentField] = val.url;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-integral {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
.bg-preview {
  width: 132px;
  height: 30px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 2px;
  box-sizing: border-box;
  margin-right: 10px;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 4px;
  }
}
.icon-preview {
  width: 88px;
  height: 24px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 2px;
  box-sizing: border-box;
  margin-right: 10px;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
}
</style>
