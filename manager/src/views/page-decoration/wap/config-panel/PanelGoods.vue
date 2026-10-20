<template>
  <div class="panel-goods">
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

    <!-- 旧版数据提示：保留原渲染，手动升级后才按新版配置 -->
    <div v-if="legacy" class="panel-card panel-card-fill">
      <div class="section-title">商品列表</div>
      <div class="section-tip">
        该楼层为旧版商品列表（分类标签 + 绑定商品），当前仍按旧版展示。
        升级后可使用展现形式、购物车按钮、商品筛选等新版功能，旧的分类与商品绑定将被清空。
      </div>
      <el-button type="primary" plain @click="upgradeLegacy">升级为新版</el-button>
    </div>

    <template v-else-if="activeTab === 'content'">
      <div class="panel-card">
        <div class="section-title">展现形式</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展现形式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                v-for="opt in layoutOptions"
                :key="opt.value"
                class="seg-item seg-icon"
                :class="{ active: firstItem.layout === opt.value }"
                @click="changeLayout(opt.value)"
              >
                <span class="ly-ico" :class="'ly-' + opt.value"><i></i><i></i><i></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">显示内容</div>
        <div class="ctrl-row">
          <div class="ctrl-label">展示信息</div>
          <div class="ctrl-body">
            <el-checkbox v-model="firstItem.showName">商品名称</el-checkbox>
            <el-checkbox v-model="firstItem.showPrice">商品价格</el-checkbox>
            <el-checkbox v-model="firstItem.showSales">已售数量</el-checkbox>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="section-title">购物车按钮</div>
        <div class="ctrl-row">
          <div class="ctrl-label">是否显示</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: firstItem.cartShow !== false }"
                @click="firstItem.cartShow = true"
              >
                显示
              </div>
              <div
                class="seg-item"
                :class="{ active: firstItem.cartShow === false }"
                @click="firstItem.cartShow = false"
              >
                隐藏
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row" v-if="firstItem.cartShow !== false">
          <div class="ctrl-label">按钮样式</div>
          <div class="ctrl-body">
            <div class="seg layout-seg-3">
              <div
                v-for="opt in cartStyleOptions"
                :key="opt.value"
                class="seg-item seg-icon"
                :class="{ active: firstItem.cartStyle === opt.value }"
                @click="firstItem.cartStyle = opt.value"
              >
                <span v-if="opt.value === 'text'" class="cart-text-ico">加购</span>
                <span v-else-if="opt.value === 'plus'" class="cart-plus-ico">+</span>
                <span v-else class="cart-cart-ico">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path
                      d="M7 4h-2l-1 2h2l2.4 9.6a2 2 0 0 0 1.9 1.4h7.9a2 2 0 0 0 1.9-1.5l1.6-6.5h-12l-.8-3h11.5l.5-2h-13.4l-.0-.0zM10 20a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="ctrl-row" v-if="firstItem.cartShow !== false">
          <div class="ctrl-label">按钮效果</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: firstItem.cartAction !== 'add' }"
                @click="firstItem.cartAction = 'detail'"
              >
                进入商品详情页
              </div>
              <div
                class="seg-item"
                :class="{ active: firstItem.cartAction === 'add' }"
                @click="firstItem.cartAction = 'add'"
              >
                商品加购
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">商品设置</div>
        <div class="ctrl-row">
          <div class="ctrl-label">选择方式</div>
          <div class="ctrl-body">
            <el-radio-group v-model="firstItem.dataMode">
              <el-radio value="category">商品分类</el-radio>
              <el-radio value="brand">商品品牌</el-radio>
              <el-radio value="store">指定商户</el-radio>
              <el-radio value="goods">指定商品</el-radio>
            </el-radio-group>
          </div>
        </div>

        <template v-if="firstItem.dataMode === 'category'">
          <div class="ctrl-row">
            <div class="ctrl-label">商品分类</div>
            <div class="ctrl-body">
              <el-cascader
                v-model="firstItem.categoryId"
                :options="categoryTree"
                :props="cascaderProps"
                placeholder="全部分类"
                clearable
              />
            </div>
          </div>
          <slider-field v-model="firstItem.count" label="商品数量" :min="1" :max="50" />
          <div class="ctrl-row">
            <div class="ctrl-label">商品排序</div>
            <div class="ctrl-body">
              <div class="seg layout-seg-3">
                <div
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="seg-item"
                  :class="{ active: firstItem.sortType === opt.value }"
                  @click="firstItem.sortType = opt.value"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="firstItem.dataMode === 'brand'">
          <div class="ctrl-row">
            <div class="ctrl-label">商品品牌</div>
            <div class="ctrl-body">
              <el-select v-model="firstItem.brandId" placeholder="全部品牌" clearable filterable>
                <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </div>
          </div>
          <slider-field v-model="firstItem.count" label="商品数量" :min="1" :max="50" />
          <div class="ctrl-row">
            <div class="ctrl-label">商品排序</div>
            <div class="ctrl-body">
              <div class="seg layout-seg-3">
                <div
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="seg-item"
                  :class="{ active: firstItem.sortType === opt.value }"
                  @click="firstItem.sortType = opt.value"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="firstItem.dataMode === 'store'">
          <div class="ctrl-row">
            <div class="ctrl-label">指定商户</div>
            <div class="ctrl-body">
              <el-select v-model="firstItem.storeId" placeholder="全部商户" clearable filterable>
                <el-option
                  v-for="s in storeList"
                  :key="s.id"
                  :label="s.storeName"
                  :value="s.id"
                />
              </el-select>
            </div>
          </div>
          <slider-field v-model="firstItem.count" label="商品数量" :min="1" :max="50" />
          <div class="ctrl-row">
            <div class="ctrl-label">商品排序</div>
            <div class="ctrl-body">
              <div class="seg layout-seg-3">
                <div
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="seg-item"
                  :class="{ active: firstItem.sortType === opt.value }"
                  @click="firstItem.sortType = opt.value"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="goods-wall">
            <div class="goods-wall-item" v-for="(g, i) in firstItem.goodsList" :key="g.id">
              <img :src="g.thumbnail" alt="" />
              <div class="goods-wall-del" @click="firstItem.goodsList.splice(i, 1)">
                <el-icon><Close /></el-icon>
              </div>
            </div>
            <div class="goods-wall-add" @click="pickGoods">
              <el-icon><Plus /></el-icon>
            </div>
          </div>
          <div class="section-tip">最多选择 50 个商品，展示顺序与选择顺序一致</div>
        </template>
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
        <color-field
          v-model="res.options.titleColor"
          label="商品标题颜色"
          :default-value="defaults.titleColor"
        />
        <div class="ctrl-row">
          <div class="ctrl-label">色调</div>
          <div class="ctrl-body">
            <div class="seg layout-seg">
              <div
                class="seg-item"
                :class="{ active: res.options.toneMode !== 'custom' }"
                @click="res.options.toneMode = 'theme'"
              >
                跟随主题风格
              </div>
              <div
                class="seg-item"
                :class="{ active: res.options.toneMode === 'custom' }"
                @click="res.options.toneMode = 'custom'"
              >
                自定义
              </div>
            </div>
          </div>
        </div>
        <color-field
          v-if="res.options.toneMode === 'custom'"
          v-model="res.options.priceColor"
          label="价格颜色"
          :default-value="defaults.priceColor"
        />
        <color-field
          v-model="res.options.salesColor"
          label="已售数量颜色"
          :default-value="defaults.salesColor"
        />
      </div>

      <div class="panel-card">
        <div class="section-title">边距设置</div>
        <slider-field v-model="res.options.paddingTop" label="上边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingBottom" label="下边距" :min="0" :max="100" />
        <slider-field v-model="res.options.paddingX" label="左右边距" :min="0" :max="40" />
        <slider-field v-model="res.options.contentGap" label="内容间距" :min="0" :max="50" />
        <slider-field v-model="res.options.pageGap" label="页面间距" :min="0" :max="100" />
      </div>

      <div class="panel-card panel-card-fill">
        <div class="section-title">圆角设置</div>
        <slider-field v-model="res.options.borderRadius" label="背景圆角" :min="0" :max="30" />
        <slider-field v-model="res.options.contentRadius" label="内容圆角" :min="0" :max="30" />
      </div>
    </template>

    <liliDialog ref="liliDialogRef" @selectedGoodsData="onGoodsSelected"></liliDialog>
  </div>
</template>

<script>
import { Close, Plus } from "@element-plus/icons-vue";
import GradientField from "../controls/GradientField.vue";
import ColorField from "../controls/ColorField.vue";
import SliderField from "../controls/SliderField.vue";
import { getCategoryTree, getBrandListData } from "@/api/goods";
import { getShopListData } from "@/api/shops";

const DEFAULTS = {
  bgColor1: "#FFFFFF",
  bgColor2: "#FFFFFF",
  titleColor: "#282828",
  toneMode: "theme",
  priceColor: "#FF5C58",
  salesColor: "#666666",
  paddingTop: 10,
  paddingBottom: 10,
  paddingX: 12,
  contentGap: 10,
  pageGap: 10,
  borderRadius: 0,
  contentRadius: 7,
};
const DEFAULT_ITEM = {
  layout: "list",
  showName: true,
  showPrice: true,
  showSales: true,
  cartShow: true,
  cartStyle: "plus",
  cartAction: "detail",
  dataMode: "category",
  categoryId: "",
  brandId: "",
  storeId: "",
  goodsList: [],
  count: 6,
  sortType: "default",
};

export default {
  name: "PanelGoods",
  hideDecorateTitle: true,
  components: { GradientField, ColorField, SliderField, Close, Plus },
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
      legacy: false,
      layoutOptions: [
        { value: "card", label: "卡片" },
        { value: "list", label: "列表" },
        { value: "three", label: "三列" },
        { value: "big", label: "大图" },
      ],
      sortOptions: [
        { value: "default", label: "综合" },
        { value: "sales", label: "销量" },
        { value: "price", label: "价格" },
      ],
      cascaderProps: {
        label: "name",
        value: "id",
        children: "children",
        checkStrictly: true,
        emitPath: false,
      },
      categoryTree: [],
      brandList: [],
      storeList: [],
    };
  },
  computed: {
    firstItem() {
      return this.res.options.list[0];
    },
    // 卡片/大图支持文字按钮，两列/三列只有图标按钮
    cartStyleOptions() {
      const base = [
        { value: "plus", label: "圆形加号" },
        { value: "cart", label: "购物车" },
      ];
      if (this.firstItem.layout === "card" || this.firstItem.layout === "big") {
        return [{ value: "text", label: "加购文字" }, ...base];
      }
      return base;
    },
  },
  created() {
    this.res.options = Object.assign({}, DEFAULTS, this.res.options);
    if (!Array.isArray(this.res.options.list) || !this.res.options.list[0]) {
      this.res.options.list = [{ ...DEFAULT_ITEM }];
    }
    const item = this.firstItem;
    if (item.layout === undefined && Array.isArray(item.titleWay)) {
      this.legacy = true;
      return;
    }
    this.fillItemDefaults(item);
    getCategoryTree().then((res) => {
      if (res && res.success) this.categoryTree = res.result || [];
    });
    getBrandListData().then((res) => {
      this.brandList = Array.isArray(res) ? res : (res && res.result) || [];
    });
    getShopListData({ pageNumber: 1, pageSize: 100, status: "OPEN" }).then((res) => {
      if (res && res.success) this.storeList = (res.result && res.result.records) || [];
    });
  },
  methods: {
    fillItemDefaults(item) {
      Object.keys(DEFAULT_ITEM).forEach((key) => {
        if (item[key] === undefined) {
          item[key] = Array.isArray(DEFAULT_ITEM[key])
            ? [...DEFAULT_ITEM[key]]
            : DEFAULT_ITEM[key];
        }
      });
    },
    upgradeLegacy() {
      const item = this.firstItem;
      delete item.titleWay;
      delete item.listWay;
      this.fillItemDefaults(item);
      this.legacy = false;
      getCategoryTree().then((res) => {
        if (res && res.success) this.categoryTree = res.result || [];
      });
      getBrandListData().then((res) => {
        this.brandList = Array.isArray(res) ? res : (res && res.result) || [];
      });
      getShopListData({ pageNumber: 1, pageSize: 100, status: "OPEN" }).then((res) => {
        if (res && res.success) this.storeList = (res.result && res.result.records) || [];
      });
    },
    changeLayout(val) {
      this.firstItem.layout = val;
      // 两列/三列不支持文字按钮，切布局时兜底
      if (
        (val === "list" || val === "three") &&
        this.firstItem.cartStyle === "text"
      ) {
        this.firstItem.cartStyle = "plus";
      }
    },
    pickGoods() {
      const dialog = this.$refs.liliDialogRef;
      dialog.clearGoodsSelected();
      dialog.goodsFlag = true;
      dialog.flag = true;
    },
    onGoodsSelected(val) {
      if (!Array.isArray(val) || !val.length) return;
      const list = val.map((item) => ({
        id: item.id,
        goodsName: item.goodsName,
        price: item.price,
        thumbnail: item.thumbnail,
      }));
      const exist = new Set(this.firstItem.goodsList.map((g) => g.id));
      const merged = this.firstItem.goodsList.concat(
        list.filter((g) => !exist.has(g.id))
      );
      this.firstItem.goodsList = merged.slice(0, 50);
    },
  },
};
</script>

<style scoped lang="scss">
@import "../controls/field-common.scss";
@import "../controls/panel-common.scss";

.seg-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 6px 10px;
}

// 展现形式小图标
.ly-ico {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 14px;
  i {
    display: block;
    background: currentColor;
    border-radius: 1px;
  }
}
.ly-card {
  i:first-child {
    width: 8px;
    height: 10px;
  }
  i:not(:first-child) {
    width: 12px;
    height: 2px;
  }
  flex-wrap: wrap;
  width: 24px;
  align-content: center;
}
.ly-list {
  i {
    width: 8px;
    height: 10px;
    &:nth-child(3) {
      display: none;
    }
  }
}
.ly-three {
  i {
    width: 6px;
    height: 10px;
  }
}
.ly-big {
  i:first-child {
    width: 22px;
    height: 10px;
  }
  i:not(:first-child) {
    display: none;
  }
}

// 购物车按钮样式小图标
.cart-text-ico {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 8px;
  background: #c0c4cc;
  color: #fff;
  font-size: 11px;
  line-height: 14px;
}
.cart-plus-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}
.seg-item.active .cart-text-ico,
.seg-item.active .cart-plus-ico {
  background: #409eff;
}
.cart-cart-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.goods-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.goods-wall-item {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .goods-wall-del {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
  }
}
.goods-wall-add {
  width: 72px;
  height: 72px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 22px;
  cursor: pointer;
  &:hover {
    border-color: #409eff;
    color: #409eff;
  }
}
</style>
