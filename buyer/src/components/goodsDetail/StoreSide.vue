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

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import { goodsList } from "@/api/goods";
import { getStoreById } from "@/api/shopentry";
import { cancelStoreCollect, collectStore, isStoreCollection } from "@/api/member";
import { getIMDetail } from "@/api/common";
import { getMemberMsg } from "@/api/login";
import storage from "@/plugins/storage.js";

defineOptions({ name: "StoreSide" });

const props = defineProps({
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
});

const route = useRoute();
const router = useRouter();

const store = ref({});
const logoError = ref(false);
const collected = ref(false);
const recommends = ref([]);
// 原 talkIm mixin 的 IM 链接
const IMLink = ref("");

const storeName = computed(() => {
  return store.value.storeName || props.storeNameFallback || "店铺";
});
const storeInitial = computed(() => {
  return storeName.value.slice(0, 1);
});
// 自营标记后端可能是 true、1 或 "1"
const isSelfOperated = computed(() => {
  const flag = store.value.selfOperated;
  return flag === true || flag === 1 || flag === "1";
});

watch(
  () => props.storeId,
  (id) => {
    if (!id) return;
    logoError.value = false;
    loadStore(id);
    loadRecommend(id);
    loadCollected(id);
  },
  { immediate: true }
);

// 没有评分或小于等于 0 时按满分展示
function formatScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score) || score <= 0) return "5.00";
  return score.toFixed(2);
}

function loadStore(id) {
  getStoreById(id).then((res) => {
    if (res.success && res.result) store.value = res.result;
  }).catch((err) => {
    console.warn('获取店铺信息失败', err);
  });
}

// 按销量取店内商品，去掉当前商品，最多 4 个
function loadRecommend(id) {
  goodsList({
    storeId: id,
    pageNumber: 1,
    pageSize: 8,
    sort: "buyCount",
    order: "desc",
  }).then((res) => {
    const records = (res.success && res.result && res.result.records) || [];
    recommends.value = records
      .filter((item) => String(item.goodsId) !== String(props.goodsId))
      .slice(0, 4);
  }).catch(() => {
    // 推荐商品为可选数据，加载失败时静默
  });
}

// 同时有 token 和用户信息才查收藏，避免残留 userInfo 触发登录跳转
function loadCollected(id) {
  if (!storage.getItem("accessToken") || !storage.getItem("userInfo")) return;
  isStoreCollection("STORE", id).then((res) => {
    if (res.success && res.result) collected.value = true;
  }).catch(() => {
    // 收藏状态为可选数据，失败时静默
  });
}

function goStore() {
  router.push({ path: "/merchant", query: { id: props.storeId } });
}

// 推荐商品新开详情页，店铺页仍在当前页打开
function goGoods(item) {
  const href = router.resolve({
    path: "/goodsDetail",
    query: { skuId: item.id, goodsId: item.goodsId },
  }).href;
  window.open(href, "_blank");
}

// 原 talkIm mixin 的登录提示
function promptLogin() {
  Modal.confirm({
    title: "温馨提示",
    content: "请登录后执行此操作",
    okText: "立即登录",
    cancelText: "取消",
    onOk: () => {
      router.push({
        path: "/login",
        query: {
          rePath: route.path,
          query: JSON.stringify(route.query || {}),
        },
      });
    },
  });
}

// 获取im信息（原 talkIm mixin）
async function getIMDetailMethods() {
  let res = await getIMDetail();
  if (res.success) {
    IMLink.value = res.result;
  }
}

// 跳转im客服（原 talkIm mixin；本组件无 storeMsg，mixin 的 storeMsg?.storeId 兜底恒为 undefined，等价于直接用传入的 id）
async function IMService(id, goodsId, skuId) {
  if (!storage.getItem("accessToken")) {
    promptLogin();
    return;
  }

  try {
    await getIMDetailMethods();
    const userInfo = await getMemberMsg();
    if (!userInfo.success) {
      promptLogin();
      return;
    }

    const accessToken = storage.getItem("accessToken");
    const storeId = id;
    const baseUrl = `${IMLink.value}?token=${accessToken}&id=${storeId}`;

    if (goodsId && skuId) {
      window.open(`${baseUrl}&goodsId=${goodsId}&skuId=${skuId}`);
    } else {
      window.open(baseUrl);
    }
  } catch {
    // token 过期等场景由 request 拦截器处理；未登录时避免未捕获异常
    if (!storage.getItem("accessToken")) {
      promptLogin();
    }
  }
}

function contact() {
  IMService(props.storeId, props.goodsId, props.skuId);
}

// 未登录先去登录，并带回当前商品页
async function toggleCollect() {
  if (!storage.getItem("accessToken") || !storage.getItem("userInfo")) {
    router.push({
      path: "/login",
      query: {
        rePath: route.path,
        query: JSON.stringify(route.query || {}),
      },
    });
    return;
  }
  if (collected.value) {
    const cancel = await cancelStoreCollect("STORE", props.storeId);
    if (cancel.success) {
      collected.value = false;
      Message.success("已取消收藏");
    }
    return;
  }
  const collect = await collectStore("STORE", props.storeId);
  if (collect.code === 200) {
    collected.value = true;
    Message.success("收藏店铺成功，可以前往个人中心我的收藏查看");
  }
}
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
