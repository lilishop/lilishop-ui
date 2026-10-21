<template>
  <div class="panel-title">
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
        <div class="section-title">文本标题</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题名称</div>
          <div class="ctrl-body">
            <el-input v-model="item.title" maxlength="20" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">副标题</div>
          <div class="ctrl-body">
            <el-input v-model="item.title1" maxlength="20" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">右侧按钮</div>
          <div class="ctrl-body">
            <el-radio-group v-model="item.showMore">
              <el-radio :value="true">显示</el-radio>
              <el-radio :value="false">隐藏</el-radio>
            </el-radio-group>
          </div>
        </div>
        <template v-if="item.showMore">
          <div class="ctrl-row">
            <div class="ctrl-label">右侧文字</div>
            <div class="ctrl-body">
              <el-input v-model="item.moreText" maxlength="6" placeholder="更多" />
            </div>
          </div>
          <div class="ctrl-row">
            <div class="ctrl-label">链接</div>
            <div class="ctrl-body">
              <span class="link-text" v-if="item.moreUrl && item.moreUrl.___type">
                {{ linkText(item.moreUrl) }}
              </span>
              <el-button plain type="primary" @click="pickLink">选择链接</el-button>
            </div>
          </div>
        </template>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">选择风格</div>
        <div class="ctrl-row">
          <div class="ctrl-label">风格</div>
          <div class="ctrl-body">
            <el-radio-group v-model="item.bgType">
              <el-radio value="image">背景图片</el-radio>
              <el-radio value="color">背景色</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="ctrl-row" v-if="item.bgType === 'color'">
          <div class="ctrl-label">背景色</div>
          <div class="ctrl-body">
            <el-color-picker v-model="item.bk_color" />
            <el-input v-model="item.bk_color" class="ctrl-color-input" />
          </div>
        </div>
        <div class="ctrl-row" v-else>
          <div class="ctrl-label">上传背景图</div>
          <div class="ctrl-body">
            <div class="bg-preview" v-if="item.bgImage">
              <img :src="item.bgImage" alt="" />
            </div>
            <el-button plain type="primary" @click="pickImage">上传背景图</el-button>
          </div>
        </div>
        <div class="section-tip" v-if="item.bgType !== 'color'">建议 910px*86px</div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">文字设置</div>
        <color-field v-model="item.color" label="标题颜色" :default-value="defaults.color" />
        <slider-field v-model="item.fontSize" label="标题文字" :min="12" :max="40" />
        <div class="ctrl-row">
          <div class="ctrl-label">文本样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in textStyleOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: (item.textStyle || 'normal') === opt.value }"
                @click="item.textStyle = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <color-field v-model="item.color1" label="副标题颜色" :default-value="defaults.color1" />
        <slider-field v-model="item.subFontSize" label="副标题文字" :min="10" :max="30" />
        <template v-if="item.showMore">
          <color-field v-model="item.moreColor" label="按钮颜色" :default-value="defaults.moreColor" />
          <slider-field v-model="item.moreFontSize" label="按钮文字" :min="10" :max="24" />
        </template>
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
        <slider-field v-model="res.options.radiusTop" label="上圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.radiusBottom" label="下圆角" :min="0" :max="30" />
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
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";

const DEFAULTS = {
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  pageGap: 0,
  radiusTop: 0,
  radiusBottom: 0,
  color: "#282828",
  color1: "#282828",
  moreColor: "#282828",
};

export default {
  name: "PanelTitle",
  hideDecorateTitle: true,
  components: { ColorField, SliderField, ossManage },
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
      textStyleOptions: [
        { value: "normal", title: "正常" },
        { value: "italic", title: "斜体" },
        { value: "bold", title: "加粗" },
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
        {
          title: "标题",
          title1: "副标题",
          color: "#282828",
          color1: "#282828",
          bk_color: "#FFFFFF",
          textAlign: "left",
        },
      ];
    }
    const item = this.item;
    if (item.showMore === undefined) item.showMore = true;
    if (!item.moreText) item.moreText = "更多";
    if (!item.bgType) item.bgType = "color";
    if (!item.fontSize) item.fontSize = 20;
    if (!item.subFontSize) item.subFontSize = 14;
    if (!item.moreFontSize) item.moreFontSize = 12;
    if (!item.moreColor) item.moreColor = "#282828";
  },
  methods: {
    linkText(url) {
      const way = ways.find((e) => e.name === url.___type);
      const typeTitle = way ? way.title : "发现";
      const name =
        url.name || url.goodsName || url.memberName || url.title || "";
      return name ? `${typeTitle} - ${name}` : typeTitle;
    },
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
        this.item.bgImage = val.url;
      }
    },
    pickLink() {
      const dialog = this.$refs.liliDialog;
      dialog.clearGoodsSelected();
      dialog.goodsFlag = false;
      dialog.flag = true;
    },
    selectedLink(val) {
      delete val.selected;
      delete val.intro;
      delete val.mobileIntro;
      this.item.moreUrl = val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-title {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
.link-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
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
</style>
