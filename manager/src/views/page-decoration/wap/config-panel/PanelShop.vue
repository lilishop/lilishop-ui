<template>
  <div class="panel-shop">
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
        <div class="section-tip">支持上传 1 张图片，建议 124*32px</div>
        <div class="icon-row">
          <div class="icon-preview" v-if="firstItem.icon">
            <img :src="firstItem.icon" alt="" />
          </div>
          <div class="icon-placeholder" v-else>图标</div>
          <el-button plain type="primary" @click="pickImage">上传图标</el-button>
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">标题设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">标题内容</div>
          <div class="ctrl-body">
            <el-input v-model="firstItem.title" />
          </div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-label">更多链接</div>
          <div class="ctrl-body">
            <span class="link-text" v-if="firstItem.moreUrl && firstItem.moreUrl.___type">
              {{ linkText(firstItem.moreUrl) }}
            </span>
            <el-button plain type="primary" @click="pickLink">选择链接</el-button>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">显示内容</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示信息</div>
          <div class="ctrl-body">
            <el-checkbox v-model="firstItem.showLogo">店铺logo</el-checkbox>
            <el-checkbox v-model="firstItem.showName">店铺名称</el-checkbox>
          </div>
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">店铺数据</div>
        <div class="ctrl-row">
          <div class="ctrl-label">店铺数据</div>
          <div class="ctrl-body">
            <el-radio-group v-model="firstItem.dataMode">
              <el-radio value="default">默认规则</el-radio>
              <el-radio value="custom">自定义</el-radio>
            </el-radio-group>
          </div>
        </div>
        <slider-field
          v-if="firstItem.dataMode !== 'custom'"
          v-model="firstItem.count"
          label="展示数量"
          :min="1"
          :max="20"
        />
        <template v-else>
          <div class="ctrl-row">
            <div class="ctrl-label">选择店铺</div>
            <div class="ctrl-body">
              <el-button plain type="primary" @click="shopDialogVisible = true">选择店铺</el-button>
            </div>
          </div>
          <div class="shop-chips" v-if="firstItem.shopList && firstItem.shopList.length">
            <el-tag
              v-for="(shop, i) in firstItem.shopList"
              :key="shop.id"
              closable
              class="shop-chip"
              @close="removeShop(i)"
            >
              {{ shop.storeName }}
            </el-tag>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="panel-card">
        <div class="section-title">布局设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: (firstItem.shopStyle || 'one') === 'one' }"
                @click="firstItem.shopStyle = 'one'"
              >
                样式一
              </div>
              <div
                class="seg-item"
                :class="{ active: firstItem.shopStyle === 'two' }"
                @click="firstItem.shopStyle = 'two'"
              >
                样式二
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
          v-model="res.options.nameColor"
          label="店铺名称颜色"
          :default-value="defaults.nameColor"
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

    <el-dialog
      v-model="shopDialogVisible"
      title="选择店铺"
      width="720px"
      append-to-body
      destroy-on-close
      @open="loadShops"
    >
      <el-table
        :data="shopOptions"
        v-loading="shopLoading"
        max-height="400"
        @selection-change="onShopSelection"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="店铺" min-width="220">
          <template #default="{ row }">
            <div class="shop-cell">
              <img :src="row.storeLogo" class="shop-cell-logo" alt="" />
              <span>{{ row.storeName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ row.selfOperated ? "自营" : "旗舰店" }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="shopDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShops">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import GradientField from "../controls/GradientField.vue";
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import ways from "@/components/lili-dialog/wap.js";
import { getShopListData } from "@/api/shops";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  titleColor: "#282828",
  nameColor: "#282828",
  moreColor: "#282828",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 0,
  pageGap: 10,
  borderRadius: 0,
  imgRadius: 7,
};
const DEFAULT_ITEM = {
  title: "店铺列表",
  count: 4,
  icon: "",
  moreUrl: "",
  showLogo: true,
  showName: true,
  shopStyle: "one",
  dataMode: "default",
  shopList: [],
};

export default {
  name: "PanelShop",
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
      shopDialogVisible: false,
      shopLoading: false,
      shopOptions: [],
      selectedShops: [],
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
    const item = this.firstItem;
    if (item.showLogo === undefined) item.showLogo = true;
    if (item.showName === undefined) item.showName = true;
    if (!item.shopStyle) item.shopStyle = "one";
    if (!item.dataMode) item.dataMode = "default";
    if (!Array.isArray(item.shopList)) item.shopList = [];
  },
  methods: {
    // 加载店铺列表供选择
    loadShops() {
      this.shopLoading = true;
      this.selectedShops = [];
      getShopListData({ pageNumber: 1, pageSize: 100, status: "OPEN" })
        .then((res) => {
          this.shopOptions = (res && res.result && res.result.records) || [];
        })
        .finally(() => {
          this.shopLoading = false;
        });
    },
    onShopSelection(rows) {
      this.selectedShops = rows;
    },
    confirmShops() {
      this.firstItem.shopList = this.selectedShops.map((s) => ({
        id: s.id,
        storeName: s.storeName,
        storeLogo: s.storeLogo,
        selfOperated: s.selfOperated,
        storeBanner: s.storeBanner || "",
      }));
      this.shopDialogVisible = false;
    },
    removeShop(index) {
      this.firstItem.shopList.splice(index, 1);
    },
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
        this.firstItem.icon = val.url;
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
      this.firstItem.moreUrl = val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

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
.shop-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.shop-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  .shop-cell-logo {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    object-fit: cover;
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
  margin-right: 10px;
}
</style>
