<template>
  <div class="wrapper">
    <TopBar></TopBar>
    <SearchHeader @search="handleSearch"></SearchHeader>

    <div class="container">
      <!-- 工具栏：排序 + 筛选 -->
      <div class="store-tool">
        <div class="store-sort">
          <span
            v-for="(item, index) in sortTools"
            :key="item.value"
            class="store-sort-item"
            :class="{ active: index === sortIndex }"
            @click="changeSort(index)"
          >
            {{ item.title }}
            <el-icon v-if="index === sortIndex && item.value"><ArrowDown /></el-icon>
          </span>
        </div>
        <div class="store-tool-right">
          <span class="store-total-text">
            <template v-if="params.storeName">
              “<span class="keyword">{{ params.storeName }}</span>”
            </template>
            共找到 <span class="num">{{ total }}</span> 家店铺
          </span>
          <el-checkbox v-model="selfOnly" @change="changeSelfOnly">只看自营</el-checkbox>
        </div>
      </div>

      <!-- 店铺列表 -->
      <div class="store-list" v-loading="loading">
        <div v-if="searched && !loading && storeList.length === 0" class="store-empty">
          <empty :_Title="emptyTitle" />
        </div>

        <div v-for="store in storeList" :key="store.id" class="store-item">
          <!-- 店铺信息 -->
          <div class="store-info">
            <div class="store-logo" @click="goShopPage(store.id)">
              <img
                v-if="store.storeLogo"
                :src="store.storeLogo"
                :alt="store.storeName"
                loading="lazy"
                @error="$event.target.style.visibility = 'hidden'"
              />
              <span v-else class="store-logo-text">{{ (store.storeName || '店').slice(0, 1) }}</span>
            </div>
            <div class="store-meta">
              <div class="store-name" @click="goShopPage(store.id)">
                <span class="store-name-text" :title="store.storeName" v-html="highlight(store.storeName)"></span>
                <span v-if="store.selfOperated" class="store-tag-self">自营</span>
              </div>

              <!-- 结构化字段：商家名称 / 所在地区 / 工商信息 -->
              <div class="store-fields">
                <div class="field-row">
                  <span class="field-label">商家名称</span>
                  <span class="field-value" :title="store.storeName">{{ store.storeName || '-' }}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">所在地区</span>
                  <span class="field-value" :title="formatRegion(store.storeAddressPath)">
                    {{ formatRegion(store.storeAddressPath) }}
                  </span>
                </div>
                <div class="field-row">
                  <span class="field-label">工商信息</span>
                  <span class="field-value">
                    <span class="licence-btn" @click.stop="openLicence(store)">[查看详情]</span>
                  </span>
                </div>
              </div>

              <div class="store-ops">
                <button class="btn-enter" @click="goShopPage(store.id)">
                  进入店铺<el-icon><ArrowRight /></el-icon>
                </button>
                <button
                  class="btn-collect"
                  :class="{ 'is-collected': collectedMap[store.id] }"
                  @click="toggleCollect(store)"
                >
                  {{ collectedMap[store.id] ? '已收藏' : '+ 收藏' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 店铺热销商品 -->
          <div class="store-goods">
            <template v-if="goodsMap[store.id] && goodsMap[store.id].length">
              <div
                v-for="goods in goodsMap[store.id]"
                :key="goods.id"
                class="store-goods-item"
                @click="goGoodsDetail(goods.id, goods.goodsId)"
              >
                <div class="store-goods-img">
                  <GoodsThumb :src="goods.thumbnail || goods.small" :alt="goods.goodsName" />
                </div>
                <div class="store-goods-name" :title="goods.goodsName">{{ goods.goodsName }}</div>
                <div class="store-goods-price">{{ $filters.unitPrice(goods.price, '￥') }}</div>
              </div>
            </template>
            <div v-else-if="goodsMap[store.id]" class="store-goods-empty">
              店铺暂无在售商品，<span @click="goShopPage(store.id)">去店铺逛逛 ›</span>
            </div>
            <template v-else>
              <div v-for="n in PREVIEW_GOODS_SIZE" :key="n" class="store-goods-item is-placeholder">
                <div class="store-goods-img"><GoodsThumb src="" /></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="store-page" v-if="total > 0">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :page-sizes="[10, 20, 30]"
          :total="total"
          layout="total, prev, pager, next, sizes"
          @current-change="getStoreList"
          @size-change="changePageSize"
        ></el-pagination>
      </div>
    </div>

    <!-- 工商资质信息弹窗 -->
    <el-dialog
      v-model="licenceDialogVisible"
      title="工商资质信息公示"
      width="520px"
      align-center
      destroy-on-close
    >
      <div v-loading="licenceLoading" class="licence-modal">
        <template v-if="licenceData">
          <div class="licence-row">
            <span class="l-label">店铺名称</span>
            <span class="l-val">{{ currentStore?.storeName || '-' }}</span>
          </div>
          <div class="licence-row" v-if="licenceData.companyName">
            <span class="l-label">企业名称</span>
            <span class="l-val">{{ licenceData.companyName }}</span>
          </div>
          <div class="licence-row" v-if="licenceData.companyAddressPath || licenceData.companyAddress">
            <span class="l-label">企业住所</span>
            <span class="l-val">
              {{ formatRegion(licenceData.companyAddressPath) }} {{ licenceData.companyAddress || '' }}
            </span>
          </div>
          <div class="licence-row" v-if="licenceData.scope">
            <span class="l-label">经营范围</span>
            <span class="l-val">{{ licenceData.scope }}</span>
          </div>
          <div class="licence-photo-box">
            <div class="photo-title">营业执照电子版</div>
            <div v-if="licenceData.licencePhoto" class="photo-wrap">
              <el-image
                :src="licenceData.licencePhoto"
                :preview-src-list="[licenceData.licencePhoto]"
                fit="contain"
                class="licence-img"
              />
              <div class="photo-hint">点击图片可放大查看</div>
            </div>
            <div v-else class="photo-empty">暂未上传营业执照电子版</div>
          </div>
        </template>
        <div v-else-if="!licenceLoading" class="licence-none">
          暂未查询到该店铺的工商资质信息
        </div>
      </div>
    </el-dialog>

    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
export default {
  name: "StoreList",
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
};
</script>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowDown, ArrowRight } from "@element-plus/icons-vue";
import { Message } from "@/utils/message";
import storage from "@/plugins/storage";
import GoodsThumb from "@/components/goods/GoodsThumb.vue";
import TopBar from '@/components/indexDecorate/components/TopBar.vue';
import SearchHeader from '@/components/indexDecorate/components/SearchHeader.vue';
import { shopList, getLicencePhoto } from "@/api/shopentry";
import { goodsList as goodsListApi } from "@/api/goods";
import { cancelStoreCollect, collectStore, isStoreCollection } from "@/api/member";

const route = useRoute();
const router = useRouter();

// 每个店铺预览的商品数量
const PREVIEW_GOODS_SIZE = 5;

// 排序项（字段由后端 camel2Underline 转为列名）
const sortTools = [
  { title: "综合", value: "" },
  { title: "商品数", value: "goodsNum" },
  { title: "收藏数", value: "collectionNum" },
  { title: "服务评分", value: "serviceScore" },
];
const sortIndex = ref(0);
const selfOnly = ref(false);

const params = reactive({
  pageNumber: 1,
  pageSize: 10,
  storeName: route.query.keyword || "",
  // 买家端只展示营业中的店铺
  storeDisable: "OPEN",
  sort: "",
  order: "",
});

const storeList = ref([]);
const total = ref(0);
const loading = ref(false);
const searched = ref(false);
// 店铺预览商品：storeId -> goods[]
const goodsMap = reactive({});
// 收藏状态：storeId -> boolean
const collectedMap = reactive({});
let requestSeq = 0;

// 工商资质弹窗状态
const licenceDialogVisible = ref(false);
const licenceLoading = ref(false);
const currentStore = ref(null);
const licenceData = ref(null);

const emptyTitle = computed(() =>
  params.storeName ? `没有找到与“${params.storeName}”相关的店铺` : "暂无店铺"
);

watch(
  () => route.query.keyword,
  (keyword) => {
    if (route.path !== "/storeList") return;
    params.storeName = keyword || "";
    params.pageNumber = 1;
    getStoreList();
  }
);

// 格式化地区展示（如 "北京市,东城区" -> "北京市东城区"）
function formatRegion(path) {
  if (!path) return "暂未填写";
  const parts = String(path).split(/[,，\s]+/).filter(Boolean);
  if (!parts.length) return "暂未填写";
  const deduped = [];
  parts.forEach((p) => {
    if (!deduped.length || deduped[deduped.length - 1] !== p) {
      deduped.push(p);
    }
  });
  return deduped.join("") || "暂未填写";
}

// 打开工商资质信息弹窗
function openLicence(store) {
  currentStore.value = store;
  licenceData.value = null;
  licenceDialogVisible.value = true;
  licenceLoading.value = true;
  getLicencePhoto(store.id)
    .then((res) => {
      if (res && res.success && res.result) {
        licenceData.value = res.result;
      } else {
        licenceData.value = null;
      }
    })
    .catch(() => {
      licenceData.value = null;
    })
    .finally(() => {
      licenceLoading.value = false;
    });
}

// 搜索框（店铺模式）回调：写入 URL，便于刷新 / 回退
function handleSearch(keyword) {
  const value = keyword || "";
  if (value === (route.query.keyword || "")) {
    params.storeName = value;
    params.pageNumber = 1;
    getStoreList();
    return;
  }
  router.push({ path: "/storeList", query: value ? { keyword: value } : {} });
}

function changeSort(index) {
  sortIndex.value = index;
  const { value } = sortTools[index];
  params.sort = value;
  params.order = value ? "desc" : "";
  params.pageNumber = 1;
  getStoreList();
}

function changeSelfOnly() {
  params.pageNumber = 1;
  getStoreList();
}

function changePageSize(size) {
  params.pageSize = size;
  params.pageNumber = 1;
  getStoreList();
}

function getStoreList() {
  const seq = ++requestSeq;
  loading.value = true;
  const query = { ...params };
  if (!query.sort) {
    delete query.sort;
    delete query.order;
  }
  if (!query.storeName) delete query.storeName;
  if (selfOnly.value) query.selfOperated = true;
  shopList(query)
    .then((res) => {
      if (seq !== requestSeq) return;
      if (res.success) {
        storeList.value = res.result.records || [];
        total.value = res.result.total || 0;
        loadStoreExtras(storeList.value);
      }
    })
    .catch(() => {
      if (seq !== requestSeq) return;
      storeList.value = [];
      total.value = 0;
    })
    .finally(() => {
      if (seq !== requestSeq) return;
      loading.value = false;
      searched.value = true;
      window.scrollTo(0, 0);
    });
}

// 加载每个店铺的预览商品与收藏状态（失败不影响列表展示）
function loadStoreExtras(list) {
  const logged = !!storage.getItem("userInfo");
  list.forEach((store) => {
    const storeId = store.id;
    if (!storeId) return;
    if (!goodsMap[storeId]) {
      goodsListApi({
        storeId,
        pageNumber: 1,
        pageSize: PREVIEW_GOODS_SIZE,
        sort: "buyCount",
        order: "desc",
      })
        .then((res) => {
          goodsMap[storeId] = res && res.success ? res.result.records || [] : [];
        })
        .catch(() => {
          goodsMap[storeId] = [];
        });
    }
    if (logged && collectedMap[storeId] === undefined) {
      isStoreCollection("STORE", storeId)
        .then((res) => {
          collectedMap[storeId] = !!(res && res.success && res.result);
        })
        .catch(() => {
          // 收藏状态查询失败静默处理
        });
    }
  });
}

async function toggleCollect(store) {
  const storeId = store.id;
  if (!storage.getItem("userInfo")) {
    Message.warning("请先登录");
    router.push("/login");
    return;
  }
  try {
    if (collectedMap[storeId]) {
      const res = await cancelStoreCollect("STORE", storeId);
      if (res.success) {
        collectedMap[storeId] = false;
        store.collectionNum = Math.max((store.collectionNum || 1) - 1, 0);
        Message.success("已取消收藏");
      }
    } else {
      const res = await collectStore("STORE", storeId);
      if (res.success || res.code === 200) {
        collectedMap[storeId] = true;
        store.collectionNum = (store.collectionNum || 0) + 1;
        Message.success("收藏店铺成功，可前往我的收藏查看");
      }
    }
  } catch (err) {
    const msg = err?.message || err?.data?.message || "";
    if (msg.includes("重复收藏")) {
      collectedMap[storeId] = true;
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 店铺名关键词高亮（先转义，避免 XSS）
function highlight(name) {
  const text = escapeHtml(name || "");
  const keyword = (params.storeName || "").trim();
  if (!keyword) return text;
  const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escapedKeyword, "gi"), (m) => `<em class="hl">${m}</em>`);
}

function goShopPage(id) {
  if (!id) {
    Message.warning("店铺信息不存在");
    return;
  }
  router.push({ path: "/merchant", query: { id } });
}

function goGoodsDetail(skuId, goodsId) {
  const location = { path: "/goodsDetail", query: { skuId, goodsId } };
  window.open(router.resolve(location).href, "_blank");
}

getStoreList();
</script>

<style scoped lang="scss">
$theme_light: color-mix(in srgb, #{$theme_color} 8%, #fff);

.container {
  margin: 20px auto 32px;
  width: 1200px;
  min-width: 1000px;
  position: relative;
}

/* ---------------工具栏------------------- */
.store-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  border-radius: 8px;
  background: #fff;
}

.store-tool-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.store-total-text {
  color: #999;
  font-size: 13px;

  .keyword,
  .num {
    color: $theme_color;
  }
}

.store-sort {
  display: flex;
  gap: 10px;
}

.store-sort-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 30px;
  padding: 0 16px;
  border-radius: 15px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    color: $theme_color;
  }

  &.active {
    background: $theme_color;
    color: #fff;
  }
}

/* ---------------店铺列表------------------- */
.store-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 240px;
  margin-top: 12px;
}

.store-empty {
  padding: 40px 0;
  border-radius: 8px;
  background: #fff;
}

.store-item {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.store-info {
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  width: 350px;
  padding-right: 28px;
  border-right: 1px dashed #e8e8e8;
  box-sizing: border-box;
}

.store-logo {
  flex-shrink: 0;
  width: 84px;
  height: 84px;
  border: 2px solid #f2f2f2;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.store-logo-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  background: $theme_color;
}

.store-meta {
  flex: 1;
  min-width: 0;
}

.store-name {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  .store-name-text {
    overflow: hidden;
    color: #171a26;
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:hover .store-name-text {
    color: $theme_color;
  }

  :deep(.hl) {
    color: $theme_color;
    font-style: normal;
  }
}

.store-tag-self {
  flex-shrink: 0;
  padding: 0 5px;
  border-radius: 3px;
  background: $theme_color;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
}

/* 结构化属性 */
.store-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.4;
}

.field-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .field-label {
    flex-shrink: 0;
    width: 56px;
    color: #999;
    text-align: justify;
    text-align-last: justify;
  }

  .field-value {
    flex: 1;
    min-width: 0;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .licence-btn {
    color: #2d8cf0;
    cursor: pointer;
    font-weight: 500;
    user-select: none;

    &:hover {
      color: $theme_color;
      text-decoration: underline;
    }
  }
}

.store-ops {
  display: flex;
  gap: 8px;
  margin-top: 14px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 28px;
    padding: 0 14px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: opacity 0.2s, background 0.2s;
  }

  .btn-enter {
    border: none;
    background: $theme_color;
    color: #fff;

    &:hover {
      opacity: 0.88;
    }
  }

  .btn-collect {
    border: 1px solid $theme_color;
    background: #fff;
    color: $theme_color;

    &:hover {
      background: $theme_light;
    }

    &.is-collected {
      border-color: #ddd;
      color: #999;
    }
  }
}

/* ---------------热销商品------------------- */
.store-goods {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  min-width: 0;
}

.store-goods-item {
  min-width: 0;
  cursor: pointer;

  .store-goods-img {
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.2s;
  }

  &:hover .store-goods-img {
    transform: translateY(-3px);
  }

  &:hover .store-goods-name {
    color: $theme_color;
  }

  &.is-placeholder {
    cursor: default;

    .store-goods-img {
      transform: none;
    }
  }
}

.store-goods-name {
  margin-top: 8px;
  overflow: hidden;
  color: #555;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.store-goods-price {
  margin-top: 2px;
  color: $theme_color;
  font-size: 15px;
  font-weight: 600;
}

.store-goods-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 6px;
  background: #fafafa;
  color: #bbb;
  font-size: 13px;

  span {
    color: $theme_color;
    cursor: pointer;
  }
}

.store-page {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ---------------工商资质弹窗------------------- */
.licence-modal {
  min-height: 160px;
  padding: 8px 12px 16px;

  .licence-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 20px;

    .l-label {
      flex-shrink: 0;
      width: 70px;
      color: #999;
      font-weight: 500;
    }

    .l-val {
      flex: 1;
      color: #333;
      word-break: break-all;
    }
  }

  .licence-photo-box {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #eee;

    .photo-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }

    .photo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;

      .licence-img {
        max-width: 100%;
        max-height: 260px;
        border: 1px solid #eee;
        border-radius: 4px;
        background: #fafafa;
        cursor: zoom-in;
      }

      .photo-hint {
        margin-top: 6px;
        font-size: 12px;
        color: #999;
      }
    }

    .photo-empty {
      padding: 20px 0;
      text-align: center;
      color: #bbb;
      font-size: 13px;
    }
  }

  .licence-none {
    padding: 40px 0;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
}
</style>
