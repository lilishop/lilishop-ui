<template>
  <div class="panel-menu">
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
        <div class="section-title">菜单设置</div>
        <div class="section-tip">推荐尺寸：88*88px（1:1）</div>
        <div class="menu-item-card" v-for="(item, index) in res.options.list" :key="index">
          <div class="img-item-head">
            <span>菜单 {{ index + 1 }}</span>
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
          <div class="menu-item-body">
            <div class="icon-preview" v-if="item.img">
              <img :src="item.img" alt="" />
            </div>
            <div class="icon-placeholder" v-else>图标</div>
            <div class="menu-item-fields">
              <el-input v-model="item.title" maxlength="6" placeholder="菜单名称" />
              <div class="btn-row">
                <el-button plain type="primary" @click="pickImage(item)">选择图标</el-button>
                <el-button plain type="primary" @click="pickLink(item)">选择链接</el-button>
              </div>
            </div>
          </div>
          <div class="link-view" v-if="item.url && item.url.___type">
            已选链接：{{ linkText(item.url) }}
          </div>
        </div>
        <el-button class="add-btn" plain type="primary" @click="addItem">添加菜单</el-button>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">展示设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: res.options.menuDisplay === 'single' }"
                @click="res.options.menuDisplay = 'single'"
              >
                单行
              </div>
              <div
                class="seg-item"
                :class="{ active: res.options.menuDisplay !== 'single' }"
                @click="res.options.menuDisplay = 'multi'"
              >
                多行
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row" v-if="res.options.menuDisplay !== 'single'">
          <div class="ctrl-label">显示行数</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="n in [2, 3, 4]"
                :key="n"
                class="seg-item"
                :class="{ active: res.options.menuRows === n }"
                @click="res.options.menuRows = n"
              >
                {{ n }}行
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">显示个数</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="n in [3, 4, 5]"
                :key="n"
                class="seg-item"
                :class="{ active: res.options.menuCols === n }"
                @click="res.options.menuCols = n"
              >
                {{ n }}个
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
          v-model="res.options.textColor"
          label="文字颜色"
          :default-value="defaults.textColor"
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
  menuDisplay: "single",
  menuRows: 3,
  menuCols: 4,
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  textColor: "#282828",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  contentGap: 10,
  pageGap: 0,
  borderRadius: 0,
  imgRadius: 30,
};

export default {
  name: "PanelMenu",
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
        title: "标题",
        size: "88*88 (1:1)",
        model: "link",
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";
.panel-menu {
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
.menu-item-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}
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
.menu-item-body {
  display: flex;
  gap: 12px;
  align-items: stretch;
}
.icon-preview {
  width: 56px;
  height: 56px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  padding: 4px;
  box-sizing: border-box;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 6px;
  }
}
.icon-placeholder {
  width: 56px;
  height: 56px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
}
.menu-item-fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}
.btn-row {
  display: flex;
  gap: 10px;
  .el-button {
    flex: 1;
    margin: 0;
  }
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
