<template>
  <div class="panel-notice">
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
        <div class="section-title">图标设置</div>
        <div class="section-tip">支持上传 1 张图片，建议宽度 130*36px</div>
        <div class="icon-row">
          <div class="icon-preview" v-if="item.img">
            <img :src="item.img" alt="" />
          </div>
          <div class="icon-placeholder" v-else>图标</div>
          <el-button plain type="primary" @click="pickImage">上传图标</el-button>
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">公告设置</div>
        <div class="section-tip">最多可添加 10 个版块</div>
        <div class="notice-item" v-for="(notice, index) in item.title" :key="index">
          <div class="notice-item-head">
            <span>版块 {{ index + 1 }}</span>
            <div class="img-item-ops">
              <el-icon :class="{ disabled: index === 0 }" @click="moveItem(index, -1)"><Top /></el-icon>
              <el-icon
                :class="{ disabled: index === item.title.length - 1 }"
                @click="moveItem(index, 1)"
                ><Bottom
              /></el-icon>
              <el-icon class="del" @click="removeItem(index)"><Delete /></el-icon>
            </div>
          </div>
          <div class="field-row">
            <div class="field-label">标题</div>
            <el-input v-model="notice.context" maxlength="50" placeholder="请输入公告内容" />
          </div>
          <div class="field-row">
            <div class="field-label">链接</div>
            <div class="link-text" v-if="notice.url && notice.url.___type">{{ linkText(notice.url) }}</div>
            <el-button plain type="primary" @click="pickLink(notice)">选择链接</el-button>
          </div>
        </div>
        <el-button
          v-if="item.title.length < 10"
          class="add-btn"
          plain
          type="primary"
          @click="addItem"
          >+ 添加模块</el-button
        >
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">文字设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">滚动方向</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: item.direction !== 'horizontal' }"
                @click="item.direction = 'vertical'"
              >
                上下
              </div>
              <div
                class="seg-item"
                :class="{ active: item.direction === 'horizontal' }"
                @click="item.direction = 'horizontal'"
              >
                左右
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">文本位置</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in alignOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: (item.textAlign || 'left') === opt.value }"
                @click="item.textAlign = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <color-field
          v-model="item.color"
          label="文字颜色"
          :default-value="defaults.itemColor"
        />
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
import ways from "@/views/lili-dialog/wap.js";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  paddingTop: 0,
  paddingBottom: 0,
  paddingX: 12,
  pageGap: 0,
  borderRadius: 0,
  itemColor: "#333333",
};

export default {
  name: "PanelNotice",
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
      alignOptions: [
        { value: "left", title: "居左" },
        { value: "center", title: "居中" },
        { value: "right", title: "居右" },
      ],
      picModelFlag: false,
      currentItem: null,
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
      this.res.options.list = [{ title: [], color: "#333333", direction: "vertical", img: "" }];
    }
    const item = this.item;
    if (!Array.isArray(item.title) || !item.title.length) {
      item.title = [{ context: "这是一条公告", url: "" }];
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
    pickLink(notice) {
      this.currentItem = notice;
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
      const list = this.item.title;
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      list.splice(target, 1, ...list.splice(index, 1, list[target]));
    },
    removeItem(index) {
      this.item.title.splice(index, 1);
    },
    addItem() {
      this.item.title.push({ context: "", url: "" });
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
.panel-notice {
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
.notice-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  .notice-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #303133;
    margin-bottom: 8px;
  }
}
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
.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  .field-label {
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;
    width: 32px;
  }
  .el-input {
    flex: 1;
    min-width: 0;
  }
  .el-button {
    flex-shrink: 0;
  }
}
.link-text {
  flex: 1;
  min-width: 0;
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
