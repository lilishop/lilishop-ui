<template>
  <div class="panel-home-comb">
    <div class="panel-header">
      <span class="panel-name">{{ res.name || "头部组件" }}</span>
    </div>

    <!-- 顶部子组件切换：搜索框 / 选项卡 / 轮播图 -->
    <div class="panel-card">
      <div class="section-title">设置内容</div>
      <div class="ctrl-row">
        <div class="ctrl-label">选择组件</div>
        <div class="ctrl-body">
          <div class="seg layout-seg-3">
            <div
              v-for="tab in subTabs"
              :key="tab.key"
              class="seg-item"
              :class="{ active: activeSub === tab.key }"
              @click="activeSub = tab.key"
            >
              {{ tab.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 1. 搜索框 ==================== -->
    <template v-if="activeSub === 'search'">
      <div class="panel-card">
        <div class="section-title">布局设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选择模板</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: res.options.searType !== 'logo' }"
                @click="res.options.searType = 'full'"
              >
                通栏
              </div>
              <div
                class="seg-item"
                :class="{ active: res.options.searType === 'logo' }"
                @click="res.options.searType = 'logo'"
              >
                logo
              </div>
            </div>
          </div>
        </div>

        <template v-if="res.options.searType === 'logo'">
          <div class="logo-row">
            <div class="logo-label">
              <div>默认logo图</div>
              <div class="logo-tip">建议 138*48px</div>
            </div>
            <div class="logo-box" @click="pickLogo('logoUrl')">
              <img v-if="res.options.logoUrl" :src="res.options.logoUrl" alt="logo" />
              <span v-else class="logo-add">+ 选择图片</span>
            </div>
          </div>
          <div class="logo-row">
            <div class="logo-label">
              <div>吸顶logo图</div>
              <div class="logo-tip">建议 138*48px</div>
            </div>
            <div class="logo-box" @click="pickLogo('logoFixUrl')">
              <img v-if="res.options.logoFixUrl" :src="res.options.logoFixUrl" alt="logo" />
              <span v-else class="logo-add">+ 选择图片</span>
            </div>
          </div>
        </template>
      </div>

      <div class="panel-card">
        <div class="section-title">提示文字设置</div>
        <div class="field-row">
          <div class="field-label">提示文字</div>
          <el-input
            v-model="res.options.placeWords"
            maxlength="20"
            placeholder="搜索商品名称"
          />
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">搜索热词</div>
        <div class="section-tip">最多可设置 20 个热词，前端按切换时间轮播显示</div>
        <div
          class="hot-word"
          v-for="(word, index) in res.options.hotWords"
          :key="index"
        >
          <el-input
            v-model="res.options.hotWords[index]"
            maxlength="10"
            placeholder="选填，不超过10个字"
          />
          <el-icon class="del" @click="removeHotWord(index)"><CircleClose /></el-icon>
        </div>
        <el-button
          v-if="res.options.hotWords.length < 20"
          class="add-btn"
          plain
          type="primary"
          @click="addHotWord"
        >
          + 添加热词
        </el-button>
        <div class="field-row interval-row">
          <div class="field-label">切换时间</div>
          <el-input-number
            class="interval-input"
            v-model="res.options.hotInterval"
            :min="1"
            :max="60"
            controls-position="right"
          />
          <span class="unit">秒</span>
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">样式设置</div>
        <color-field
          v-model="res.options.textColor"
          label="文字颜色"
          :default-value="defaults.textColor"
        />
        <color-field
          v-model="res.options.boxColor"
          label="框体颜色"
          :default-value="defaults.boxColor"
        />
        <div class="ctrl-row">
          <div class="ctrl-label">文本位置</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in textAlignOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: res.options.textAlign === opt.value }"
                @click="res.options.textAlign = opt.value"
              >
                {{ opt.title }}
              </div>
            </div>
          </div>
        </div>
        <slider-field
          v-model="res.options.searchRadius"
          label="内容圆角"
          :min="0"
          :max="60"
        />
      </div>
    </template>

    <!-- ==================== 2. 选项卡 ==================== -->
    <template v-else-if="activeSub === 'tabs'">
      <div class="panel-card">
        <div class="section-title">选项卡设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选项卡</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.showTabs">
              <el-radio :value="true">显示</el-radio>
              <el-radio :value="false">隐藏</el-radio>
            </el-radio-group>
          </div>
        </div>
        <color-field
          v-model="res.options.tabColor"
          label="文字颜色"
          :default-value="defaults.tabColor"
        />
        <color-field
          v-model="res.options.tabActiveColor"
          label="选中颜色"
          :default-value="defaults.tabActiveColor"
        />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">分类导航列表</div>
        <div class="section-tip">首项默认固定为「首页」，最多可添加 10 个分类选项卡</div>
        <div
          class="tab-card"
          v-for="(tab, index) in res.options.tabList"
          :key="index"
        >
          <div class="tab-card-head">
            <span>选项卡 {{ index + 1 }}</span>
            <div class="tab-card-ops">
              <el-icon
                :class="{ disabled: index === 0 }"
                @click="moveTab(index, -1)"
                ><Top
              /></el-icon>
              <el-icon
                :class="{ disabled: index === res.options.tabList.length - 1 }"
                @click="moveTab(index, 1)"
                ><Bottom
              /></el-icon>
              <el-icon class="del" @click="removeTab(index)"><Delete /></el-icon>
            </div>
          </div>

          <div class="ctrl-row">
            <div class="ctrl-label">显示文字</div>
            <div class="ctrl-body">
              <el-input
                v-model="tab.title"
                maxlength="5"
                placeholder="请输入标签名称，5字以内"
              />
            </div>
          </div>

          <div class="ctrl-row">
            <div class="ctrl-label">数据类型</div>
            <div class="ctrl-body">
              <el-radio-group v-model="tab.dataType" @change="tab.value = ''">
                <el-radio value="special">微页面</el-radio>
                <el-radio value="category">商品分类</el-radio>
              </el-radio-group>
            </div>
          </div>

          <div class="ctrl-row" v-if="tab.dataType === 'special'">
            <div class="ctrl-label">微页面</div>
            <div class="ctrl-body">
              <el-select
                v-model="tab.value"
                placeholder="请选择专题微页面"
                clearable
                filterable
              >
                <el-option
                  v-for="sp in specialList"
                  :key="sp.id"
                  :label="sp.name"
                  :value="sp.id"
                />
              </el-select>
            </div>
          </div>

          <div class="ctrl-row" v-else>
            <div class="ctrl-label">商品分类</div>
            <div class="ctrl-body">
              <el-cascader
                v-model="tab.value"
                :options="categoryTree"
                :props="cascaderProps"
                placeholder="请选择商品分类"
                clearable
              />
            </div>
          </div>
        </div>

        <el-button
          v-if="res.options.tabList.length < 10"
          class="add-btn"
          plain
          type="primary"
          @click="addTab"
        >
          + 添加模块
        </el-button>
      </div>
    </template>

    <!-- ==================== 3. 轮播图 ==================== -->
    <template v-else>
      <div class="panel-card">
        <div class="section-title">内容设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选择风格</div>
          <div class="ctrl-body">
            <el-radio-group v-model="res.options.swiperStyle">
              <el-radio value="card">样式1（卡片露边）</el-radio>
              <el-radio value="full">样式2（通栏）</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="section-tip">最多可添加 10 张图片，建议尺寸 750*332px</div>

        <div
          class="img-item"
          v-for="(item, index) in res.options.list"
          :key="index"
        >
          <div class="img-item-head">
            <span>图片 {{ index + 1 }}</span>
            <div class="img-item-ops">
              <el-icon
                :class="{ disabled: index === 0 }"
                @click="moveBanner(index, -1)"
                ><Top
              /></el-icon>
              <el-icon
                :class="{ disabled: index === res.options.list.length - 1 }"
                @click="moveBanner(index, 1)"
                ><Bottom
              /></el-icon>
              <el-icon class="del" @click="removeBanner(index)"><Delete /></el-icon>
            </div>
          </div>
          <div class="img-item-body">
            <div class="img-thumb" v-if="item.img">
              <img :src="item.img" alt="" />
            </div>
            <div class="img-thumb placeholder" v-else>750*332</div>
            <div class="img-item-fields">
              <div class="btn-row">
                <el-button plain type="primary" @click="pickBannerImage(item)"
                  >选择照片</el-button
                >
                <el-button plain type="primary" @click="pickBannerLink(item)"
                  >选择链接</el-button
                >
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
          @click="addBanner"
        >
          + 添加图片
        </el-button>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">样式设置</div>
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
        <color-field
          v-if="res.options.indicatorStyle !== 'none'"
          v-model="res.options.indicatorColor"
          label="指示器颜色"
          :default-value="defaults.indicatorColor"
        />
        <slider-field
          v-model="res.options.bannerRadius"
          label="内容圆角"
          :min="0"
          :max="40"
        />
        <slider-field
          v-model="res.options.pageGap"
          label="下边距"
          :min="0"
          :max="60"
        />
      </div>
    </template>

    <liliDialog ref="liliDialogRef" @selectedLink="onSelectedLink" />

    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        @callback="onOssSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        ref="ossManageRef"
      />
    </el-dialog>
  </div>
</template>

<script>
import { Top, Bottom, Delete, CircleClose } from "@element-plus/icons-vue";
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";
import { getCategoryTree } from "@/api/goods";
import { getHomeList } from "@/api/other";

const DEFAULTS = {
  // 搜索框
  searType: "full", // "full" 通栏 | "logo" logo
  logoUrl: "",
  logoFixUrl: "",
  placeWords: "搜索商品名称",
  hotWords: ["兰蔻小黑瓶"],
  hotInterval: 3,
  textColor: "#303133",
  boxColor: "#FFFFFF",
  textAlign: "left",
  searchRadius: 30,
  // 选项卡
  showTabs: true,
  tabColor: "#FFFFFF",
  tabActiveColor: "#E93323",
  tabList: [
    { title: "精选", dataType: "category", value: "" },
    { title: "靓丽美妆", dataType: "category", value: "" },
  ],
  // 轮播图
  swiperStyle: "card", // "card" 样式1 | "full" 样式2
  indicatorStyle: "round", // "round" | "line" | "none"
  indicatorPosition: "center", // "left" | "center" | "right"
  indicatorColor: "#E93323",
  bannerRadius: 14,
  pageGap: 0,
};

export default {
  name: "PanelHomeComb",
  hideDecorateTitle: true,
  components: { ColorField, SliderField, ossManage, Top, Bottom, Delete, CircleClose },
  props: {
    res: { type: Object, required: true },
  },
  data() {
    return {
      defaults: DEFAULTS,
      activeSub: "search",
      subTabs: [
        { key: "search", title: "搜索框" },
        { key: "tabs", title: "选项卡" },
        { key: "banner", title: "轮播图" },
      ],
      textAlignOptions: [
        { value: "left", title: "居左" },
        { value: "center", title: "居中" },
        { value: "right", title: "居右" },
      ],
      indicatorStyleOptions: [
        { value: "round", title: "圆形" },
        { value: "line", title: "直线" },
        { value: "none", title: "无" },
      ],
      indicatorPositionOptions: [
        { value: "left", title: "居左" },
        { value: "center", title: "居中" },
        { value: "right", title: "居右" },
      ],
      cascaderProps: {
        value: "id",
        label: "name",
        children: "children",
        emitPath: false,
        checkStrictly: true,
      },
      categoryTree: [],
      specialList: [],
      picModelFlag: false,
      picTarget: null, // { type: 'logo', key } | { type: 'banner', item }
      currentBannerItem: null,
    };
  },
  created() {
    this.res.options = Object.assign(
      {},
      JSON.parse(JSON.stringify(DEFAULTS)),
      this.res.options
    );
    if (!Array.isArray(this.res.options.hotWords)) {
      this.res.options.hotWords = ["兰蔻小黑瓶"];
    }
    if (!Array.isArray(this.res.options.tabList)) {
      this.res.options.tabList = JSON.parse(JSON.stringify(DEFAULTS.tabList));
    }
    if (!Array.isArray(this.res.options.list) || !this.res.options.list.length) {
      this.res.options.list = [
        {
          img: "https://i.loli.net/2020/12/05/fKH4CwImpbuD5Xj.png",
          url: "",
          link: "",
          size: "750*332",
          model: "link",
        },
        {
          img: "https://i.loli.net/2020/12/05/12kleCgrSLfKoQs.png",
          url: "",
          link: "",
          size: "750*332",
          model: "link",
        },
      ];
    }
    this.loadSelectData();
  },
  methods: {
    loadSelectData() {
      getCategoryTree()
        .then((res) => {
          if (res && res.success) {
            this.categoryTree = res.result || [];
          }
        })
        .catch(() => {});
      getHomeList({
        pageClientType: "H5",
        pageType: "SPECIAL",
        pageNumber: 1,
        pageSize: 100,
      })
        .then((res) => {
          if (res && res.success && res.result) {
            this.specialList = res.result.records || [];
          }
        })
        .catch(() => {});
    },
    // 热词操作
    addHotWord() {
      this.res.options.hotWords.push("");
    },
    removeHotWord(index) {
      this.res.options.hotWords.splice(index, 1);
    },
    // 选项卡操作
    addTab() {
      this.res.options.tabList.push({
        title: "新分类",
        dataType: "category",
        value: "",
      });
    },
    removeTab(index) {
      this.res.options.tabList.splice(index, 1);
    },
    moveTab(index, dir) {
      const list = this.res.options.tabList;
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      list.splice(target, 1, ...list.splice(index, 1, list[target]));
    },
    // 轮播图操作
    addBanner() {
      this.res.options.list.push({
        img: "",
        url: "",
        link: "",
        size: "750*332",
        model: "link",
      });
    },
    removeBanner(index) {
      this.res.options.list.splice(index, 1);
    },
    moveBanner(index, dir) {
      const list = this.res.options.list;
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      list.splice(target, 1, ...list.splice(index, 1, list[target]));
    },
    // 图片选择（Logo 或 轮播图）
    pickLogo(key) {
      this.picTarget = { type: "logo", key };
      this.openOssDialog();
    },
    pickBannerImage(item) {
      this.picTarget = { type: "banner", item };
      this.openOssDialog();
    },
    openOssDialog() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        const oss = this.$refs.ossManageRef;
        if (!oss) return;
        oss.selectImage = true;
        oss.fileType = "pic";
        oss.changeFileType();
      });
    },
    onOssSelected(val) {
      this.picModelFlag = false;
      if (!val || !val.url || !this.picTarget) return;
      if (this.picTarget.type === "logo") {
        this.res.options[this.picTarget.key] = val.url;
      } else if (this.picTarget.type === "banner" && this.picTarget.item) {
        this.picTarget.item.img = val.url;
      }
    },
    // 链接选择
    pickBannerLink(item) {
      this.currentBannerItem = item;
      const dialog = this.$refs.liliDialogRef;
      dialog.clearGoodsSelected();
      dialog.goodsFlag = false;
      dialog.flag = true;
    },
    onSelectedLink(val) {
      if (!this.currentBannerItem || !val) return;
      delete val.selected;
      delete val.intro;
      delete val.mobileIntro;
      this.currentBannerItem.url = val;
    },
    linkText(url) {
      const way = ways.find((e) => e.name === url.___type);
      const typeTitle = way ? way.title : "链接";
      const name =
        url.name || url.goodsName || url.memberName || url.title || "";
      return name ? `${typeTitle} - ${name}` : typeTitle;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.panel-home-comb {
  background: #f5f7fa;
  margin: 0 -20px;
  padding: 0 12px 12px;
  min-height: 100%;
  box-sizing: border-box;
}

.logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  .logo-label {
    font-size: 13px;
    color: #606266;
    .logo-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
  .logo-box {
    width: 120px;
    height: 44px;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    background: #fafafa;
    &:hover {
      border-color: #409eff;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .logo-add {
      font-size: 12px;
      color: #409eff;
    }
  }
}

.field-row {
  display: flex;
  align-items: center;
  .field-label {
    font-size: 14px;
    color: #606266;
    margin-right: 10px;
    flex-shrink: 0;
  }
}

.hot-word {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  .del {
    cursor: pointer;
    color: #909399;
    font-size: 18px;
    flex-shrink: 0;
    &:hover {
      color: #e1251b;
    }
  }
}

.interval-row {
  margin-top: 12px;
  .interval-input {
    flex: 1;
    min-width: 0;
  }
  .unit {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
  }
}

.tab-card,
.img-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fafafa;
}

.tab-card-head,
.img-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.tab-card-ops,
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
  background: #fff;
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
}

.btn-row {
  display: flex;
  gap: 8px;
}

.link-view {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-btn {
  width: 100%;
  margin-top: 4px;
}
</style>
