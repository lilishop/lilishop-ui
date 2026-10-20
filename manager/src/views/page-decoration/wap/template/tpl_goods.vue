<template>
  <div class="tpl-goods" :class="{ 'legacy-mode': !isNew }" :style="wrapperStyle">
    <!-- 新版商品列表 -->
    <template v-if="isNew">
      <div v-if="displayGoods.length" class="g-list" :class="'mode-' + layout" :style="listStyle">
        <div class="g-item" v-for="(g, i) in displayGoods" :key="i" :style="itemStyle">
          <div class="g-imgbox">
            <img :src="g.img" alt="" />
          </div>
          <div class="g-info">
            <div v-if="showName" class="g-name" :style="nameStyle">{{ g.name }}</div>
            <div v-if="showPrice" class="g-price" :style="priceStyle">
              ¥{{ $filters.unitPrice(g.price) }}
            </div>
            <div class="g-bottom">
              <span
                v-if="showSales && g.sales != null"
                class="g-sales"
                :style="salesStyle"
                >已售 {{ g.sales }} 件</span
              >
              <span
                v-if="cartShow"
                class="g-cart"
                :class="'cart-' + cartStyle"
                :style="cartStyleObj"
              >
                <template v-if="cartStyle === 'text'">加购</template>
                <template v-else-if="cartStyle === 'plus'">+</template>
                <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path
                    d="M7 4h-2l-1 2h2l2.4 9.6a2 2 0 0 0 1.9 1.4h7.9a2 2 0 0 0 1.9-1.5l1.6-6.5h-12l-.8-3h11.5l.5-2h-13.4zM10 20a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="g-empty">暂无商品</div>
    </template>

    <!-- 旧版：分类标签 + 绑定商品 -->
    <template v-else-if="goodsBlock">
      <div class="goods-cell-title">
        <div
          class="goods-item-title"
          :class="{ selected: selected.index == index }"
          @click="handleClickTitle(title, index)"
          v-for="(title, index) in goodsBlock.titleWay"
          :key="index"
        >
          <h4>{{ title.title }}</h4>
          <div>{{ title.desc }}</div>
        </div>
      </div>
      <div class="goods-list">
        <template v-for="(item, item_index) in goodsBlock.listWay" :key="item_index">
          <div v-if="isGoodsVisible(item)" class="goods-item">
            <div class="goods-img">
              <img :src="item.img" alt />
            </div>
            <div class="goods-desc">
              <div class="goods-title">
                {{ item.title }}
              </div>
              <div class="goods-bottom">
                <div class="goods-price">￥{{ $filters.unitPrice(item.price) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { getGoodsListData } from "@/api/goods";

export default {
  name: "tpl_goods",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      selected: { index: 0, val: "" },
      goodsData: [],
    };
  },
  computed: {
    first() {
      return (this.res.list && this.res.list[0]) || {};
    },
    // 新版标记：面板写入过 layout 字段
    isNew() {
      return this.first.layout !== undefined;
    },
    layout() {
      return this.first.layout || "list";
    },
    showName() {
      return this.first.showName !== false;
    },
    showPrice() {
      return this.first.showPrice !== false;
    },
    showSales() {
      return this.first.showSales !== false;
    },
    cartShow() {
      return this.first.cartShow !== false;
    },
    cartStyle() {
      return this.first.cartStyle || "plus";
    },
    themePrice() {
      return "#FF5C58";
    },
    priceColor() {
      return this.res.toneMode === "custom" && this.res.priceColor
        ? this.res.priceColor
        : this.themePrice;
    },
    priceStyle() {
      return { color: this.priceColor };
    },
    nameStyle() {
      return this.res.titleColor ? { color: this.res.titleColor } : {};
    },
    salesStyle() {
      return this.res.salesColor ? { color: this.res.salesColor } : {};
    },
    cartStyleObj() {
      return { background: this.priceColor };
    },
    px() {
      return (v) => `${(Number(v) || 0) / 2}px`;
    },
    wrapperStyle() {
      const res = this.res;
      if (!this.isNew) {
        return {};
      }
      const bg =
        !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      return {
        background: bg,
        padding: `${this.px(res.paddingTop)} ${this.px(res.paddingX)} ${this.px(res.paddingBottom)}`,
        marginBottom: this.px(res.pageGap),
        borderRadius: this.px(res.borderRadius),
        overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
      };
    },
    listStyle() {
      return { gap: this.px(this.res.contentGap) };
    },
    itemStyle() {
      const r = this.px(this.res.contentRadius);
      return { borderRadius: r, overflow: Number(this.res.contentRadius) > 0 ? "hidden" : "visible" };
    },
    displayGoods() {
      if (this.first.dataMode === "goods") {
        return (this.first.goodsList || []).map((g) => ({
          name: g.goodsName,
          price: g.price,
          img: g.thumbnail,
          sales: g.buyCount != null ? g.buyCount : null,
        }));
      }
      return this.goodsData;
    },
    goodsBlock() {
      return this.res && this.res.list && this.res.list[0] ? this.res.list[0] : null;
    },
  },
  watch: {
    "first.dataMode": "loadGoods",
    "first.categoryId": "loadGoods",
    "first.brandId": "loadGoods",
    "first.storeId": "loadGoods",
    "first.count": "loadGoods",
    "first.sortType": "loadGoods",
  },
  created() {
    if (this.isNew) {
      this.loadGoods();
    } else {
      const block = this.goodsBlock;
      if (block) {
        const firstGoods = (block.listWay || []).find(Boolean);
        if (firstGoods) {
          this.selected.val = firstGoods.type;
        } else if (block.titleWay && block.titleWay[0]) {
          this.selected.val = block.titleWay[0].title;
        }
      }
    }
  },
  methods: {
    loadGoods() {
      const item = this.first;
      if (!this.isNew || item.dataMode === "goods") {
        return;
      }
      const params = {
        pageNumber: 1,
        pageSize: item.count || 6,
        goodsStatus: "UPPER",
      };
      if (item.dataMode === "category" && item.categoryId) {
        // category_path 以逗号包裹，前后补逗号避免误匹配
        params.categoryPath = `,${item.categoryId},`;
      }
      if (item.dataMode === "brand" && item.brandId) {
        params.brandId = item.brandId;
      }
      if (item.dataMode === "store" && item.storeId) {
        params.storeId = item.storeId;
      }
      if (item.sortType === "sales") {
        params.sort = "buyCount";
        params.order = "desc";
      } else if (item.sortType === "price") {
        params.sort = "price";
        params.order = "asc";
      }
      getGoodsListData(params)
        .then((res) => {
          const records = (res && res.result && res.result.records) || [];
          this.goodsData = records.map((g) => ({
            name: g.goodsName,
            price: g.price,
            img: g.thumbnail || g.small || g.original,
            sales: g.buyCount != null ? g.buyCount : null,
          }));
        })
        .catch(() => {
          this.goodsData = [];
        });
    },
    isGoodsVisible(item) {
      if (!item) {
        return false;
      }
      if (item.___index != undefined) {
        return this.selected.index == item.___index;
      }
      return this.selected.val == item.type;
    },
    handleClickTitle(val, index) {
      this.selected.index = index;
      this.selected.val = val.title;
    },
  },
};
</script>

<style lang="scss" scoped>
.tpl-goods {
  background: #fff;
}

.legacy-mode {
  background: #e8e8e8;
  padding: 8px 0;
}

.g-empty {
  padding: 30px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.g-list {
  display: flex;
  flex-wrap: wrap;
}

.g-item {
  background: #fff;
  display: flex;
  box-sizing: border-box;
}

.g-imgbox {
  flex-shrink: 0;
  background: #f5f5f5;
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.g-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.g-name {
  font-size: 12px;
  color: #282828;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.g-bottom {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.g-price {
  color: $theme_color;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.g-sales {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: #666;
}

.g-cart {
  flex-shrink: 0;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  &.cart-plus,
  &.cart-cart {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 13px;
    line-height: 1;
  }
  &.cart-text {
    border-radius: 9px;
    padding: 2px 8px;
    font-size: 11px;
  }
}

/* 卡片：左图右文 */
.mode-card {
  flex-direction: column;
  .g-item {
    flex-direction: row;
    align-items: center;
    padding: 6px;
  }
  .g-imgbox {
    width: 55px;
    height: 55px;
    margin-right: 8px;
  }
  .g-name {
    margin-bottom: 4px;
  }
}

/* 列表：两列网格 */
.mode-list {
  .g-item {
    width: calc(50% - 3px);
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    aspect-ratio: 1;
  }
  .g-info {
    padding: 6px;
    min-height: 52px;
  }
  .g-name {
    margin-bottom: 4px;
  }
}

/* 三列 */
.mode-three {
  .g-item {
    width: calc(33.33% - 4px);
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    aspect-ratio: 1;
  }
  .g-info {
    padding: 4px;
    min-height: 44px;
  }
  .g-name {
    -webkit-line-clamp: 1;
    font-size: 11px;
    margin-bottom: 2px;
  }
  .g-price {
    font-size: 12px;
  }
  .g-sales {
    font-size: 10px;
  }
}

/* 大图：一行一个 */
.mode-big {
  flex-direction: column;
  .g-item {
    width: 100%;
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    aspect-ratio: 3 / 2;
  }
  .g-info {
    padding: 6px;
    min-height: 44px;
  }
  .g-name {
    margin-bottom: 4px;
  }
}

/* 旧版样式 */
.selected {
  > h4 {
    color: #000 !important;
  }
  > div {
    font-weight: bold;
    color: $theme_color !important;
  }
}
.goods-cell-title {
  padding: 10px;
  transition: 0.35s;
  display: flex;
  > .goods-item-title {
    flex: 1;
    text-align: center;
    > h4 {
      font-size: 16px;
      color: #666;
    }
    > div {
      color: #999;
      font-size: 12px;
    }
  }
}
.goods-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}
.goods-img {
  position: relative;
  margin: 0 auto;
  width: 158px;
  height: 150px;
  border-top-left-radius: 0.4em;
  border-top-right-radius: 0.4em;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
  }
}
.goods-desc {
  border-bottom-left-radius: 0.4em;
  border-bottom-right-radius: 0.4em;
  width: 158px;
  background: #fff;
  padding: 4px;
  margin: 0 auto;
  > .goods-title {
    font-size: 12px;
    height: 38px;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  > .goods-bottom {
    display: flex;
    > .goods-price {
      line-height: 2;
      color: $theme_color;
    }
  }
}
</style>
