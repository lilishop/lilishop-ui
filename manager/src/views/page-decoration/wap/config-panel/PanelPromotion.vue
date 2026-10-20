<template>
  <div class="panel-promotion">
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
      <div class="panel-card" v-if="!isPintuan">
        <div class="section-title">图标设置</div>
        <div class="section-tip">支持上传 1 张图片，建议 124*32px</div>
        <div class="icon-row">
          <div class="icon-preview" v-if="res.options.icon">
            <img :src="res.options.icon" alt="" />
          </div>
          <div class="icon-placeholder" v-else>图标</div>
          <el-button plain type="primary" @click="pickImage">上传图标</el-button>
        </div>
      </div>

      <div class="panel-card" v-if="isPintuan">
        <div class="section-title">头部设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选择风格</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.headBgType">
              <el-radio value="color">背景色</el-radio>
              <el-radio value="image">背景图片</el-radio>
            </el-radio-group>
          </div>
        </div>
        <template v-if="res.options.headBgType === 'image'">
          <div class="ctrl-row">
            <div class="ctrl-label">背景图片</div>
            <div class="ctrl-body">
              <div class="bg-preview" v-if="res.options.headBgImage">
                <img :src="res.options.headBgImage" alt="" />
              </div>
              <el-button plain type="primary" @click="pickImage('headBg')">上传背景图</el-button>
            </div>
          </div>
          <div class="section-tip">建议 710px*96px</div>
        </template>
        <gradient-field
          v-else
          v-model:start="res.options.headBgColor1"
          v-model:end="res.options.headBgColor2"
          :default-start="defaults.headBgColor1"
          :default-end="defaults.headBgColor2"
          label="头部背景"
        />
        <div class="ctrl-row">
          <div class="ctrl-label">标题类型</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.headTitleType">
              <el-radio value="text">文字</el-radio>
              <el-radio value="image">图片</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="ctrl-row" v-if="res.options.headTitleType !== 'image'">
          <div class="ctrl-label">标题文字</div>
          <div class="ctrl-body">
            <el-input v-model="firstItem.title" maxlength="10" placeholder="超值拼团" />
          </div>
        </div>
        <template v-else>
          <div class="ctrl-row">
            <div class="ctrl-label">标题图片</div>
            <div class="ctrl-body">
              <div class="bg-preview" v-if="res.options.headTitleImage">
                <img :src="res.options.headTitleImage" alt="" />
              </div>
              <el-button plain type="primary" @click="pickImage('headTitle')">上传标题图</el-button>
            </div>
          </div>
          <div class="section-tip">建议 200px*40px</div>
        </template>
      </div>

      <div class="panel-card" v-if="!isPintuan">
        <div class="section-title">标题设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题内容</div>
          <div class="ctrl-body">
            <el-input
              v-model="firstItem.title1"
              maxlength="10"
              :placeholder="isSeckill ? '邀请你的好友来参与' : (isKanjia ? '邀请好友来砍价' : '精彩抢先看')"
            />
          </div>
        </div>
        <div class="ctrl-row" v-if="!isLive && !isSeckill && !isKanjia">
          <div class="ctrl-label">更多链接</div>
          <div class="ctrl-body">
            <span class="link-text" v-if="res.options.moreUrl && res.options.moreUrl.___type">
              {{ linkText(res.options.moreUrl) }}
            </span>
            <el-button plain type="primary" @click="pickLink">选择链接</el-button>
          </div>
        </div>
      </div>

      <div class="panel-card panel-card-fill" v-if="!isLive">
        <div class="section-title">显示内容</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示信息</div>
          <div class="ctrl-body">
            <el-checkbox v-model="res.options.showGoodsName">商品名称</el-checkbox>
            <el-checkbox v-model="res.options.showGoodsPrice">商品价格</el-checkbox>
            <template v-if="isPintuan">
              <el-checkbox v-model="res.options.showGroupTag">活动标签</el-checkbox>
              <el-checkbox v-model="res.options.showOriginalPrice">商品原价</el-checkbox>
            </template>
          </div>
        </div>
        <div class="ctrl-row" v-if="isPintuan">
          <div class="ctrl-label">拼团按钮</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.showGroupBtn">
              <el-radio :value="true">显示</el-radio>
              <el-radio :value="false">隐藏</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="panel-card" v-if="isPintuan || isLive || isSeckill || isKanjia">
        <div class="section-title">布局设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg" :class="{ 'layout-seg-3': isLive && !isPintuan }">
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
          :default-start="defaults.bgColor1"
          :default-end="defaults.bgColor2"
        />
        <color-field
          v-model="res.options.titleColor"
          label="标题颜色"
          :default-value="defaults.titleColor"
        />
        <color-field
          v-if="!isSeckill && !isKanjia"
          v-model="res.options.moreColor"
          label="更多按钮颜色"
          :default-value="defaults.moreColor"
        />
        <color-field
          v-model="res.options.nameColor"
          label="商品名称颜色"
          :default-value="defaults.nameColor"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.contentGap" label="内容间距" :min="0" :max="20" />
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.imgRadius" label="图片圆角" :min="0" :max="30" />
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
import GradientField from "../controls/GradientField.vue";
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";

const DEFAULTS = {
  layoutStyle: "1",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  titleColor: "#282828",
  moreColor: "#282828",
  nameColor: "#282828",
  paddingTop: 10,
  paddingBottom: 10,
  contentGap: 10,
  paddingX: 12,
  pageGap: 10,
  borderRadius: 0,
  imgRadius: 10,
  showGoodsName: true,
  showGoodsPrice: true,
  showGroupTag: true,
  showOriginalPrice: true,
  showGroupBtn: true,
  headBgType: "color",
  headBgColor1: "#F5483A",
  headBgColor2: "#FF7E3D",
  headTitleType: "text",
};

// 秒杀参考 CRMEB 默认：背景红→白渐变、标题白色、圆角 背景 7 / 内容 5
const SECKILL_DEFAULTS = {
  ...DEFAULTS,
  bgColor1: "#FF2200",
  bgColor2: "#FFFFFF",
  titleColor: "#FFFFFF",
  borderRadius: 7,
  imgRadius: 5,
};

export default {
  name: "PanelPromotion",
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
      picModelFlag: false,
      pickTarget: "icon",
    };
  },
  computed: {
    firstItem() {
      return (this.res.options.list && this.res.options.list[0]) || {};
    },
    isPintuan() {
      return this.res.promotionsType === "PINTUAN" || this.firstItem.type === "PINTUAN";
    },
    isLive() {
      return this.res.promotionsType === "LIVE" || this.firstItem.type === "LIVE";
    },
    isSeckill() {
      return (
        this.res.promotionsType === "SECKILL" || this.firstItem.type === "SECKILL"
      );
    },
    isKanjia() {
      return (
        this.res.promotionsType === "KANJIA" || this.firstItem.type === "KANJIA"
      );
    },
    layoutOptions() {
      if (this.isLive && !this.isPintuan) {
        return [
          { value: "1", title: "单行" },
          { value: "2", title: "多行" },
          { value: "3", title: "双排" },
        ];
      }
      if ((this.isSeckill || this.isKanjia) && !this.isPintuan) {
        return [
          { value: "1", title: "样式一" },
          { value: "2", title: "样式二" },
        ];
      }
      return [
        { value: "1", title: "样式一" },
        { value: "2", title: "样式二" },
        { value: "3", title: "样式三" },
        { value: "4", title: "样式四" },
      ];
    },
  },
  created() {
    const defaults =
      ["SECKILL", "KANJIA"].includes(this.res.promotionsType)
        ? SECKILL_DEFAULTS
        : DEFAULTS;
    this.defaults = defaults;
    this.res.options = Object.assign({}, defaults, this.res.options);
    if (!Array.isArray(this.res.options.list)) {
      this.res.options.list = [];
    }
  },
  methods: {
    linkText(url) {
      const way = ways.find((e) => e.name === url.___type);
      const typeTitle = way ? way.title : "发现";
      const name =
        url.name || url.goodsName || url.memberName || url.title || "";
      return name ? `${typeTitle} - ${name}` : typeTitle;
    },
    pickImage(target = "icon") {
      this.pickTarget = target;
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
        const target = this.pickTarget || "icon";
        if (target === "headBg") {
          this.res.options.headBgImage = val.url;
        } else if (target === "headTitle") {
          this.res.options.headTitleImage = val.url;
        } else {
          this.res.options.icon = val.url;
        }
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
      this.res.options.moreUrl = val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-promotion {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}
.icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon-preview {
  width: 88px;
  height: 32px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 3px;
  box-sizing: border-box;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }
}
.icon-placeholder {
  width: 88px;
  height: 32px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
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
