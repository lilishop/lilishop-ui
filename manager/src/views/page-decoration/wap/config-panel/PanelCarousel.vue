<template>
  <div class="panel-carousel">
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
        <div class="section-title">图片设置</div>
        <div class="img-item" v-for="(item, index) in res.options.list" :key="index">
          <div class="img-item-head">
            <span>图片 {{ index + 1 }}</span>
            <div class="img-item-ops">
              <el-icon
                :class="{ disabled: index === 0 }"
                @click="moveItem(index, -1)"
                ><Top
              /></el-icon>
              <el-icon
                :class="{ disabled: index === res.options.list.length - 1 }"
                @click="moveItem(index, 1)"
                ><Bottom
              /></el-icon>
              <el-icon class="del" @click="removeItem(index)"><Delete /></el-icon>
            </div>
          </div>
          <div class="img-item-body">
            <div class="img-thumb" v-if="item.img">
              <img :src="item.img" alt="" />
            </div>
            <div class="img-thumb placeholder" v-else>750*350</div>
            <div class="img-item-fields">
              <div class="btn-row">
                <el-button plain type="primary" @click="pickImage(item)">选择照片</el-button>
                <el-button plain type="primary" @click="pickLink(item)">选择链接</el-button>
              </div>
              <div class="link-view" v-if="item.url && item.url.___type">
                已选链接：{{ linkText(item.url) }}
              </div>
              <div class="link-view empty" v-else>未设置链接</div>
            </div>
          </div>
        </div>
        <el-button
          v-if="res.options.list.length < 10"
          class="add-btn"
          plain
          type="primary"
          @click="addItem"
          >添加图片</el-button
        >
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">轮播风格</div>
        <div class="ctrl-row">
          <div class="ctrl-label">风格</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                v-for="opt in swiperStyleOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: res.options.swiperStyle === opt.value }"
                @click="res.options.swiperStyle = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="section-tip" v-if="res.options.swiperStyle === 'card'">
          卡片风格下，两侧会露出前后图片的一部分
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">指示器设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">指示器样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in indicatorStyleOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: res.options.indicatorStyle === opt.value }"
                @click="res.options.indicatorStyle = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row" v-if="res.options.indicatorStyle !== 'none'">
          <div class="ctrl-label">指示器位置</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in indicatorPositionOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: res.options.indicatorPosition === opt.value }"
                @click="res.options.indicatorPosition = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row" v-if="res.options.indicatorStyle !== 'none'">
          <div class="ctrl-label">色调</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.indicatorColorMode">
              <el-radio value="theme">跟随主题风格</el-radio>
              <el-radio value="custom">自定义</el-radio>
            </el-radio-group>
          </div>
        </div>
        <template
          v-if="
            res.options.indicatorStyle !== 'none' &&
            res.options.indicatorColorMode === 'custom'
          "
        >
          <color-field
            v-model="res.options.indicatorColor"
            label="指示器颜色"
            :default-value="defaults.indicatorColor"
          />
        </template>
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
import { Top, Bottom, Delete } from "@element-plus/icons-vue";
import ColorField from "../controls/ColorField.vue";
import GradientField from "../controls/GradientField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";

const DEFAULTS = {
  swiperStyle: "full",
  indicatorStyle: "round",
  indicatorPosition: "center",
  indicatorColorMode: "theme",
  indicatorColor: "#409eff",
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
  imgRadius: 7,
};

export default {
  name: "PanelCarousel",
  hideDecorateTitle: true,
  components: { ColorField, GradientField, SliderField, ossManage, Top, Bottom, Delete },
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
      swiperStyleOptions: [
        { value: "full", title: "通栏" },
        { value: "card", title: "卡片" },
      ],
      indicatorStyleOptions: [
        { value: "round", title: "圆形" },
        { value: "line", title: "长条" },
        { value: "none", title: "无" },
      ],
      indicatorPositionOptions: [
        { value: "left", title: "居左" },
        { value: "center", title: "居中" },
        { value: "right", title: "居右" },
      ],
      picModelFlag: false,
      currentItem: null,
    };
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
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
    moveItem(index, dir) {
      const list = this.res.options.list;
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      list.splice(target, 1, ...list.splice(index, 1, list[target]));
    },
    removeItem(index) {
      this.res.options.list.splice(index, 1);
    },
    addItem() {
      this.res.options.list.push({
        img: "",
        url: "",
        link: "",
        size: "750*350",
        model: "link",
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
.panel-carousel {
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
    .img-item-ops {
      display: flex;
      gap: 4px;
      .el-icon {
        padding: 4px;
        cursor: pointer;
        color: #606266;
        &:hover {
          color: #409eff;
        }
        &.del:hover {
          color: #e1251b;
        }
        &.disabled {
          color: #dcdfe6;
          cursor: not-allowed;
        }
      }
    }
  }
}
.img-item-body {
  display: flex;
  gap: 10px;
}
.img-thumb {
  width: 132px;
  height: 62px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 3px;
  box-sizing: border-box;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 4px;
    object-fit: cover;
  }
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
  }
}
.img-item-fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  .link-view {
    margin-top: 0;
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
.add-btn {
  width: 100%;
}
</style>
