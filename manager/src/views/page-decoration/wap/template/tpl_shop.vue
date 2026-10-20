<template>
  <div class="tpl-shop" :style="wrapperStyle">
    <div class="shop-head" v-if="headIcon || title || hasMore">
      <img v-if="headIcon" class="shop-head-icon" :src="headIcon" alt="" />
      <div class="shop-title" :style="titleStyle">{{ title }}</div>
      <div v-if="hasMore" class="shop-more" :style="moreStyle">更多 &gt;</div>
    </div>

    <!-- 老数据：两列网格 -->
    <div v-if="!styled" class="shop-grid-legacy">
      <div class="shop-item" v-for="i in 4" :key="i">
        <div class="shop-logo"></div>
        <div class="shop-name">店铺名称</div>
      </div>
    </div>

    <!-- 样式一：店铺卡片三列 -->
    <div v-else-if="shopStyle === 'one'" class="shop-grid">
      <div class="shop-card" v-for="(shop, i) in previewShops" :key="i">
        <img
          v-if="shop.goodsImage"
          class="shop-card-bg"
          :style="logoStyle"
          :src="shop.goodsImage"
          alt=""
        />
        <div v-else class="shop-card-bg shop-card-bg-empty" :style="logoStyle"></div>
        <div class="shop-card-body">
          <img v-if="showLogo" class="shop-card-logo" :src="shop.logo" alt="" />
          <div v-if="showName" class="shop-card-name" :style="nameStyle">{{ shop.name }}</div>
        </div>
      </div>
    </div>

    <!-- 样式二：店铺卡片 + 商品列表 -->
    <div v-else class="shop-street-list">
      <div class="shop-street-card" v-for="(shop, i) in previewShops" :key="i">
        <div class="shop-street-head">
          <img v-if="showLogo" class="shop-street-logo" :src="shop.logo" alt="" />
          <div v-if="showName" class="shop-street-name" :style="nameStyle">{{ shop.name }}</div>
          <img
            v-if="shop.goodsImage"
            class="shop-street-banner"
            :style="logoStyle"
            :src="shop.goodsImage"
            alt=""
          />
        </div>
        <div class="shop-street-goods">
          <div
            class="street-goods-item"
            v-for="(goods, goodsIndex) in shop.goods"
            :key="goodsIndex"
          >
            <img class="street-goods-img" :src="goods.img" alt="" />
            <div class="street-goods-name">{{ goods.name }}</div>
            <div class="street-goods-price">¥{{ $filters.unitPrice(goods.price) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getGoodsListData } from "@/api/goods";

export default {
  name: "tpl_shop",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      goodsMap: {},
    };
  },
  computed: {
    first() {
      return (this.res.list && this.res.list[0]) || {};
    },
    title() {
      return this.first.title || "";
    },
    headIcon() {
      return this.first.icon || "";
    },
    hasMore() {
      return !!this.first.moreUrl;
    },
    showLogo() {
      return this.first.showLogo !== false;
    },
    showName() {
      return this.first.showName !== false;
    },
    shopStyle() {
      return this.first.shopStyle || "one";
    },
    // 自定义模式展示已选店铺，默认模式用示例店铺
    previewShops() {
      const DEMO = [
        {
          name: "Apple",
          logo: "/demo/apple.png",
          goodsImage: "/demo/apple-phone.png",
          goods: [
            { name: "iPhone 16 Pro", price: 8999, img: "/demo/apple-phone.png" },
            { name: "iPhone 16", price: 7999, img: "/demo/apple-phone.png" },
            { name: "iPhone 15", price: 6999, img: "/demo/apple-phone.png" },
          ],
        },
        {
          name: "小米",
          logo: "/demo/xiaomi.png",
          goodsImage: "/demo/xiaomi-phone.png",
          goods: [
            { name: "Xiaomi 15 Pro", price: 5299, img: "/demo/xiaomi-phone.png" },
            { name: "Xiaomi 15", price: 3999, img: "/demo/xiaomi-phone.png" },
            { name: "Xiaomi 14", price: 3299, img: "/demo/xiaomi-phone.png" },
          ],
        },
        {
          name: "VIVO",
          logo: "/demo/vivo.png",
          goodsImage: "/demo/vivo-phone.png",
          goods: [
            { name: "vivo X200 Pro", price: 5299, img: "/demo/vivo-phone.png" },
            { name: "vivo X200", price: 4299, img: "/demo/vivo-phone.png" },
            { name: "vivo X100 Pro", price: 3999, img: "/demo/vivo-phone.png" },
          ],
        },
      ];
      if (this.first.dataMode === "custom" && this.first.shopList && this.first.shopList.length) {
        return this.first.shopList.map((s) => {
          const goods = this.goodsMap[s.id] || [];
          return {
            id: s.id,
            name: s.storeName,
            logo: s.storeLogo,
            goods,
            goodsImage: goods[0]?.img || s.goodsImage || s.storeBanner || "",
          };
        });
      }
      return DEMO;
    },
    // 面板保存过样式字段才启用自定义样式，老数据保持原样
    styled() {
      return this.res && this.res.paddingTop !== undefined;
    },
    titleStyle() {
      return this.styled && this.res.titleColor
        ? { color: this.res.titleColor }
        : {};
    },
    nameStyle() {
      return this.styled && this.res.nameColor
        ? { color: this.res.nameColor }
        : {};
    },
    moreStyle() {
      return this.styled && this.res.moreColor
        ? { color: this.res.moreColor }
        : {};
    },
    logoStyle() {
      return this.styled
        ? { borderRadius: `${(Number(this.res.imgRadius) || 0) / 2}px` }
        : {};
    },
    wrapperStyle() {
      if (!this.styled) {
        return {
          background: this.res.bgColor || "#FFFFFF",
          padding: `10px ${this.res.paddingX || 0}px`,
          marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 10}px`,
          borderRadius: `${this.res.borderRadius || 0}px`,
          overflow: "hidden",
        };
      }
      const res = this.res;
      const bg =
        !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      const px = (v) => `${(Number(v) || 0) / 2}px`;
      return {
        background: bg,
        padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
        marginBottom: px(res.pageGap),
        borderRadius: px(res.borderRadius),
        overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
      };
    },
  },
  watch: {
    "first.dataMode": "loadGoodsImages",
    "first.shopList": {
      handler: "loadGoodsImages",
      deep: true,
    },
  },
  created() {
    this.loadGoodsImages();
  },
  methods: {
    loadGoodsImages() {
      if (this.first.dataMode !== "custom") return;
      (this.first.shopList || []).forEach((shop) => {
        if (!shop.id || this.goodsMap[shop.id]) return;
        getGoodsListData({
          storeId: shop.id,
          pageNumber: 1,
          pageSize: 3,
          goodsStatus: "UPPER",
        })
          .then((res) => {
            const records = (res && res.result && res.result.records) || [];
            this.goodsMap[shop.id] = records
              .map((goods) => ({
                name: goods.goodsName,
                price: goods.price,
                img: goods.thumbnail || goods.small || goods.original,
              }))
              .filter((goods) => goods.img);
          })
          .catch(() => {});
      });
    },
  },
};
</script>

<style scoped lang="scss">
.shop-head {
  display: flex;
  align-items: center;
  padding: 4px 12px 10px;
}
.shop-head-icon {
  width: 62px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
  margin-right: 6px;
}
.shop-title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-more {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
}
.shop-grid-legacy {
  display: flex;
  flex-wrap: wrap;
  padding: 0 12px;
}
.shop-item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.shop-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}
.shop-name {
  font-size: 13px;
  color: #333;
  margin-left: 8px;
}
/* 样式一 */
.shop-grid {
  display: flex;
  gap: 8px;
  padding: 0 12px;
}
.shop-card {
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f7f7f7;
}
.shop-card-bg {
  width: 100%;
  height: 56px;
  display: block;
  object-fit: cover;
  background: #eee;
}
.shop-card-bg-empty {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
.shop-card-body {
  padding: 4px;
  text-align: center;
}
.shop-card-logo {
  position: relative;
  z-index: 1;
  display: block;
  width: 60px;
  height: 24px;
  margin: -12px auto 0;
  object-fit: contain;
  background: #fff;
}
.shop-card-name {
  font-size: 12px;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 样式二：店铺卡片 + 商品列表 */
.shop-street-list {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shop-street-card {
  border-radius: 6px;
  overflow: hidden;
  background: #f7f7f7;
}
.shop-street-head {
  position: relative;
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  box-sizing: border-box;
  background: $theme_color;
  overflow: hidden;
}
.shop-street-logo {
  flex-shrink: 0;
  width: 44px;
  height: 16px;
  padding: 1px 3px;
  box-sizing: border-box;
  object-fit: contain;
  background: #fff;
  border-radius: 2px;
}
.shop-street-name {
  max-width: calc(100% - 110px);
  margin-left: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-street-banner {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 34px;
  object-fit: cover;
}
.shop-street-goods {
  display: flex;
  gap: 6px;
  padding: 6px;
  box-sizing: border-box;
}
.street-goods-item {
  flex: 1;
  min-width: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.street-goods-img {
  width: 100%;
  height: 58px;
  display: block;
  object-fit: cover;
  background: #eee;
}
.street-goods-name {
  padding: 4px 4px 0;
  color: #282828;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.street-goods-price {
  padding: 2px 4px 5px;
  color: $theme_color;
  font-size: 11px;
  font-weight: 600;
}
</style>
