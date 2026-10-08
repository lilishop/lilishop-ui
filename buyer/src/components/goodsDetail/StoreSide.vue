<template>
  <aside class="store-side" v-if="storeId">
    <div class="store-card">
      <div class="store-head" @click="goStore">
        <img
          v-if="store.storeLogo && !logoError"
          class="store-logo"
          :src="store.storeLogo"
          loading="lazy"
          decoding="async"
          :alt="storeName"
          @error="logoError = true"
        />
        <span v-else class="store-logo store-logo-fallback">{{ storeInitial }}</span>
        <div class="store-head-text">
          <p class="store-name">
            <span v-if="isSelfOperated" class="store-self">自营</span>
            <span class="store-name-text">{{ storeName }}</span>
          </p>
        </div>
      </div>

      <div class="store-scores">
        <div class="score-item">
          <span class="score-label">描述</span>
          <span class="score-value">{{ formatScore(store.descriptionScore) }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">服务</span>
          <span class="score-value">{{ formatScore(store.serviceScore) }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">物流</span>
          <span class="score-value">{{ formatScore(store.deliveryScore) }}</span>
        </div>
      </div>

      <div class="store-actions">
        <button type="button" class="store-btn" @click="contact">联系客服</button>
        <button type="button" class="store-btn" :class="{ 'is-on': collected }" @click="toggleCollect">
          {{ collected ? "已收藏" : "收藏店铺" }}
        </button>
      </div>
      <button type="button" class="enter-store" @click="goStore">进店逛逛</button>
    </div>

    <div class="recommend-card" v-if="recommends.length">
      <p class="recommend-title">店铺推荐</p>
      <div
        class="recommend-item"
        v-for="item in recommends"
        :key="item.id"
        @click="goGoods(item)"
      >
        <img class="recommend-img" :src="item.thumbnail || item.small" loading="lazy" decoding="async" :alt="item.goodsName" />
        <div class="recommend-info">
          <p class="recommend-name">{{ item.goodsName }}</p>
          <div class="recommend-meta">
            <p class="recommend-price">{{ $filters.unitPrice(item.price, "￥") }}</p>
            <span class="recommend-sales">销量 {{ item.buyCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { Message } from "@/utils/message";
import { goodsList } from "@/api/goods";
import { getStoreById } from "@/api/shopentry";
import { cancelStoreCollect, collectStore, isStoreCollection } from "@/api/member";
import imTalk from "@/components/mixes/talkIm";

export default {
  name: "StoreSide",
  mixins: [imTalk],
  props: {
    storeId: {
      type: [String, Number],
      default: "",
    },
    goodsId: {
      type: [String, Number],
      default: "",
    },
    skuId: {
      type: [String, Number],
      default: "",
    },
    storeNameFallback: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      store: {},
      logoError: false,
      collected: false,
      recommends: [],
    };
  },
  computed: {
    storeName() {
      return this.store.storeName || this.storeNameFallback || "店铺";
    },
    storeInitial() {
      return this.storeName.slice(0, 1);
    },
    // 自营标记后端可能是 true、1 或 "1"
    isSelfOperated() {
      const flag = this.store.selfOperated;
      return flag === true || flag === 1 || flag === "1";
    },
  },
  watch: {
    storeId: {
      immediate: true,
      handler(id) {
        if (!id) return;
        this.logoError = false;
        this.loadStore(id);
        this.loadRecommend(id);
        this.loadCollected(id);
      },
    },
  },
  methods: {
    // 没有评分或小于等于 0 时按满分展示
    formatScore(value) {
      const score = Number(value);
      if (!Number.isFinite(score) || score <= 0) return "5.00";
      return score.toFixed(2);
    },
    loadStore(id) {
      getStoreById(id).then((res) => {
        if (res.success && res.result) this.store = res.result;
      }).catch(() => {});
    },
    // 按销量取店内商品，去掉当前商品，最多 4 个
    loadRecommend(id) {
      goodsList({
        storeId: id,
        pageNumber: 1,
        pageSize: 8,
        sort: "buyCount",
        order: "desc",
      }).then((res) => {
        const records = (res.success && res.result && res.result.records) || [];
        this.recommends = records
          .filter((item) => String(item.goodsId) !== String(this.goodsId))
          .slice(0, 4);
      }).catch(() => {});
    },
    // 同时有 token 和用户信息才查收藏，避免残留 userInfo 触发登录跳转
    loadCollected(id) {
      if (!this.Cookies.getItem("accessToken") || !this.Cookies.getItem("userInfo")) return;
      isStoreCollection("STORE", id).then((res) => {
        if (res.success && res.result) this.collected = true;
      }).catch(() => {});
    },
    goStore() {
      this.$router.push({ path: "/merchant", query: { id: this.storeId } });
    },
    // 推荐商品新开详情页，店铺页仍在当前页打开
    goGoods(item) {
      const href = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId: item.id, goodsId: item.goodsId },
      }).href;
      window.open(href, "_blank");
    },
    contact() {
      this.IMService(this.storeId, this.goodsId, this.skuId);
    },
    // 未登录先去登录，并带回当前商品页
    async toggleCollect() {
      if (!this.Cookies.getItem("accessToken") || !this.Cookies.getItem("userInfo")) {
        this.$router.push({
          path: "/login",
          query: {
            rePath: this.$route.path,
            query: JSON.stringify(this.$route.query || {}),
          },
        });
        return;
      }
      if (this.collected) {
        const cancel = await cancelStoreCollect("STORE", this.storeId);
        if (cancel.success) {
          this.collected = false;
          Message.success("已取消收藏");
        }
        return;
      }
      const collect = await collectStore("STORE", this.storeId);
      if (collect.code === 200) {
        this.collected = true;
        Message.success("收藏店铺成功，可以前往个人中心我的收藏查看");
      }
    },
  },
};
</script>

<style scoped lang="scss">
.store-side {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 16px;
}

.store-card,
.recommend-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.store-card {
  padding: 16px;
}

.store-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.store-logo {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
  background: #fafafa;
}

.store-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: $theme_color;
  font-size: 18px;
  font-weight: 600;
}

.store-head-text {
  width: 100%;
  text-align: center;
}

.store-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  color: #171A26;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.store-name-text {
  min-width: 0;
}

.store-self {
  flex-shrink: 0;
  padding: 0 6px;
  border-radius: 2px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.store-scores {
  display: flex;
  margin-top: 14px;
  padding: 10px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.score-item {
  flex: 1;
  text-align: center;
}

.score-label {
  display: block;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.score-value {
  display: block;
  margin-top: 2px;
  color: $theme_color;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.store-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.store-btn,
.enter-store {
  border: 1px solid #eee;
  background: #fff;
  color: #171A26;
  font-size: 13px;
  line-height: 32px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
    border-color: $theme_color;
  }
}

.store-btn {
  flex: 1;
}

.store-btn.is-on {
  color: $theme_color;
  border-color: $theme_color;
  background: #fff5f4;
}

.enter-store {
  width: 100%;
  margin-top: 8px;
}

.recommend-card {
  margin-top: 12px;
  padding: 12px 12px 4px;
}

.recommend-title {
  margin: 0 0 8px;
  color: #171A26;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.recommend-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 12px;
  cursor: pointer;

  & + & {
    border-top: 1px solid #f5f5f5;
  }
}

.recommend-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  background: #fafafa;
}

.recommend-info {
  min-width: 0;
}

.recommend-name {
  margin: 0;
  color: #333;
  font-size: 16px;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.recommend-price {
  margin: 0;
  color: $theme_color;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.recommend-sales {
  flex-shrink: 0;
  color: #999;
  font-size: 15px;
  line-height: 22px;
}
</style>
