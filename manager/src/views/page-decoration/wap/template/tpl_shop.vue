<template>
  <div class="tpl-shop" :style="wrapperStyle">
    <div class="shop-head" v-if="headIcon || title || hasMore">
      <img v-if="headIcon" class="shop-head-icon" :src="headIcon" alt="" />
      <div class="shop-title" :style="titleStyle">{{ title }}</div>
      <div v-if="hasMore" class="shop-more" :style="moreStyle">更多 ></div>
    </div>

    <!-- 老数据：两列网格 -->
    <div v-if="!styled" class="shop-grid-legacy">
      <div class="shop-item" v-for="i in 4" :key="i">
        <div class="shop-logo"></div>
        <div class="shop-name">店铺名称</div>
      </div>
    </div>

    <!-- 样式一：店铺卡片三列（全景大片橱窗） -->
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
        <div class="shop-card-badge" v-if="isSelf(shop)">自营</div>
        <div class="shop-card-body">
          <img v-if="showLogo" class="shop-card-logo" :src="shop.logo" alt="" />
          <div v-if="showName" class="shop-card-name" :style="nameStyle">{{ shop.name }}</div>
        </div>
      </div>
    </div>

    <!-- 样式二：店铺卡片 + 商品列表（大牌名店街 + 精品橱窗） -->
    <div v-else class="shop-street-list">
      <div class="shop-street-card" v-for="(shop, i) in previewShops" :key="i">
        <div class="shop-street-head">
          <div class="shop-street-info">
            <img v-if="showLogo" class="shop-street-logo" :src="shop.logo" alt="" />
            <div class="shop-street-meta">
              <div class="shop-street-name-row">
                <div v-if="showName" class="shop-street-name" :style="nameStyle">{{ shop.name }}</div>
                <span class="shop-street-tag" v-if="isSelf(shop)">自营</span>
              </div>
              <div class="shop-street-desc">热卖好物甄选中</div>
            </div>
          </div>
          <div class="shop-street-enter">进店逛逛 &gt;</div>
        </div>
        <div class="shop-street-goods">
          <div
            class="street-goods-item"
            v-for="(goods, goodsIndex) in shop.goods"
            :key="goodsIndex"
          >
            <div class="street-goods-cover">
              <img class="street-goods-img" :src="goods.img" alt="" />
            </div>
            <div class="street-goods-name">{{ goods.name }}</div>
            <div class="street-goods-price">
              <span class="street-goods-symbol">¥</span>{{ $filters.unitPrice(goods.price) }}
            </div>
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
            selfOperated: s.selfOperated,
            goods,
            goodsImage: goods[0]?.img || s.goodsImage || s.storeBanner || s.storeLogo || "",
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
          marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 0}px`,
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
    isSelf(shop) {
      if (!shop) return false;
      return Boolean(
        shop.selfOperated === true ||
        shop.selfOperated === 'true' ||
        shop.selfOperated === 1 ||
        shop.selfOperated === '1' ||
        (shop.name && shop.name.includes('自营')) ||
        (shop.storeName && shop.storeName.includes('自营'))
      );
    },
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
/* 样式一：全景大片橱窗 */
.shop-grid {
  display: flex;
  gap: 8px;
  padding: 0 12px;
}
.shop-card {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 112px;
  border-radius: 8px;
  overflow: hidden;
  background: #f7f7f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.shop-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.shop-card-bg-empty {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
.shop-card-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
  font-size: 10px;
  color: #fff;
  background: #e1251b;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.3;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.shop-card-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 16px 6px 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.72) 100%);
}
.shop-card-logo {
  flex-shrink: 0;
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  object-fit: contain;
  background: #fff;
  padding: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.shop-card-name {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* 样式二：大牌名店街 + 精品橱窗 */
.shop-street-list {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.shop-street-card {
  border-radius: 10px;
  overflow: hidden;
  background: #fbfbfb;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.shop-street-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}
.shop-street-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.shop-street-logo {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 2px;
  box-sizing: border-box;
  object-fit: contain;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.shop-street-meta {
  min-width: 0;
  flex: 1;
}
.shop-street-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.shop-street-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-street-tag {
  flex-shrink: 0;
  font-size: 9px;
  color: #fff;
  background: #e1251b;
  padding: 0 4px;
  border-radius: 3px;
  line-height: 14px;
  font-weight: 500;
}
.shop-street-desc {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}
.shop-street-enter {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  color: $theme_color;
  background: #fff;
  border: 1px solid rgba(255, 60, 42, 0.25);
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(255, 60, 42, 0.05);
  cursor: pointer;
  margin-left: 8px;
}
.shop-street-goods {
  display: flex;
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
}
.street-goods-item {
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f2f2f2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.street-goods-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fafafa;
}
.street-goods-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.street-goods-name {
  padding: 4px 6px 0;
  color: #333;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.street-goods-price {
  padding: 2px 6px 6px;
  color: $theme_color;
  font-size: 12px;
  font-weight: 700;
}
.street-goods-symbol {
  font-size: 9px;
  font-weight: normal;
  margin-right: 1px;
}
</style>
