<template>
  <div class="merchant">
    <TopBar></TopBar>
    <!-- 搜索栏 -->
    <SearchHeader @search="search"></SearchHeader>
    <div class="store-head">
      <div class="store-head-main">
        <div class="shop-info">
          <p class="shop-name">{{ storeMsg.storeName || '店铺' }}</p>
          <p
            v-if="storeMsg.storeDesc"
            class="shop-desc ellipsis"
            v-html="storeMsg.storeDesc"
          ></p>
        </div>
        <div class="shop-actions">
          <span
            class="store-collect-btn"
            :class="{ 'is-collected': storeCollected }"
            @click="collect"
          >
            <el-icon><StarFilled /></el-icon>
            <span>{{ storeCollected ? '已收藏店铺' : '收藏店铺' }}</span>
          </span>
          <span class="store-service-btn" @click="IMService(storeMsg.storeId, null, null)">联系客服</span>
        </div>
      </div>
      <div class="store-category">
        <ul class="cate-list">
          <li
            class="cate-item"
            :class="{ active: !params.storeCatId }"
            @click="searchByCate({ id: '', labelName: '店铺推荐' })"
          >
            首页
          </li>
          <li
            v-for="(cate, index) in cateList"
            :key="index"
            class="cate-item"
            :class="{ active: isCateActive(cate) }"
            @click="searchByCate(cate)"
          >
            <el-dropdown v-if="cate.children && cate.children.length" trigger="hover">
              <div class="cate-label">
                {{ cate.labelName }}
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="sec in cate.children"
                    :key="sec.id"
                    @click.stop="searchByCate(sec)"
                  >{{ sec.labelName }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-else>{{ cate.labelName }}</span>
          </li>
        </ul>
      </div>
    </div>


    <div v-if="showFloorView">
      <!-- 楼层装修部分 -->
      <model-form ref="modelFormRef" :data="modelForm"></model-form>
    </div>


    <div v-else class="store-goods-section">
      <div class="store-goods-hd">{{ cateName }}</div>
      <div class="goods-list">
        <empty v-if="goodsList.length === 0"/>
        <template v-else>
        <div
          v-for="(item, index) in goodsList"
          :key="index"
          class="goods-show-info"
          @click="goGoodsDetail(item.id, item.goodsId)"
        >
          <div class="goods-show-img">
            <img :src="item.thumbnail || item.small" loading="lazy" decoding="async" alt=""/>
          </div>
          <div class="goods-show-price">
            <span class="seckill-price text-danger">{{ $filters.unitPrice(item.price, "￥") }}</span>
          </div>
          <div class="goods-show-detail">
            <span>{{ item.goodsName }}</span>
          </div>
          <div class="goods-show-num">
            <span>{{ formatGrade(item.grade) }}%好评</span>
            <span class="goods-show-sales">销量 {{ item.buyCount || 0 }}</span>
          </div>
          <div class="goods-show-right" v-if="item.selfOperated">
            <el-tag class="goods-show-tag goods-show-tag-self">自营</el-tag>
          </div>
        </div>
        </template>
      </div>
      <div class="goods-page" v-if="total > 0">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          @current-change="changePageNum"
          @size-change="changePageSize"
          layout="total, prev, pager, next, sizes"
        ></el-pagination>
      </div>
    </div>

    <BaseFooter/>

  </div>
</template>

<script setup>

import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import { ArrowDown, StarFilled } from '@element-plus/icons-vue';
import {getCateById, getDetailById} from "@/api/shopentry";
import {
  cancelStoreCollect,
  collectStore,
  isStoreCollection,
} from "@/api/member";
import {goodsList as goodsListApi} from "@/api/goods";
import TopBar from '@/components/indexDecorate/components/TopBar.vue';
import SearchHeader from '@/components/indexDecorate/components/SearchHeader.vue';
import ModelForm from "@/components/indexDecorate/ModelForm";
import storage from "@/plugins/storage";
import {getFloorStoreData} from "@/api/index.js";
import { seckillByDay } from "@/api/promotion";
import { getIMDetail } from "@/api/common";
import { getMemberMsg } from "@/api/login";

defineOptions({ name: "Merchant" });

const route = useRoute();
const router = useRouter();

// 店铺装修的内容
const modelForm = ref({list: []}); // 楼层装修数据
const modelFormRef = ref(null);
const topAdvert = ref({}); // 顶部广告
const showNav = ref(false); // 是否展示分类栏
const topSearchShow = ref(false); // 滚动后顶部搜索栏展示
const carouselLarge = ref(false); // 不同轮播分类尺寸
const carouselOpacity = ref(false); // 不同轮播分类样式,
const enablePageData = ref(false); //是否显示楼层装修内容
const basePageData = ref(false); //基础店铺信息
const showFloorView = ref(false); // 是否展示楼层装修（有有效装修数据时为 true）
const storeMsg = ref({}); // 店铺信息
const cateList = ref([]); // 店铺分裂
const goodsList = ref([]); // 商品列表
const total = ref(0); // 商品数量
const params = reactive({
  // 请求参数
  pageNumber: 1,
  pageSize: 20,
  keyword: "",
  storeId: route.query.id,
  storeCatId: "",
});
const cateName = ref("店铺推荐"); // 分类名称
const storeCollected = ref(false); // 是否收藏
// 原 talkIm mixin 的 IM 链接
const IMLink = ref("");

function isFloorEnabled() {
  const pageShow = storeMsg.value && storeMsg.value.pageShow;
  return pageShow === "1" || pageShow === 1 || pageShow === "OPEN" || pageShow === true;
}

function loadStoreGoodsView() {
  showFloorView.value = false;
  getGoodsList();
  getCateList();
}

function getIndexData() {
  getFloorStoreData({
    clientType: "PC",
    num: route.query.id,
    pageType: "STORE",
  })
    .then(async (res) => {
      if (res.success && res.result?.pageData) {
        try {
          await parsePageData(res.result.pageData);
          showFloorView.value = true;
        } catch {
          loadStoreGoodsView();
        }
      } else {
        loadStoreGoodsView();
      }
    })
    .catch(() => {
      loadStoreGoodsView();
    });
}

async function parsePageData(pageData) {
  const dataJson = typeof pageData === 'string' ? JSON.parse(pageData) : pageData;
  if (dataJson.version === 2 || dataJson.version === '2.0') {
    modelForm.value = dataJson;
    return;
  }
  for (let i = 0; i < dataJson.list.length; i++) {
    const type = dataJson.list[i].type;
    if (type === "carousel2") {
      carouselLarge.value = true;
    } else if (type === "carousel1") {
      carouselLarge.value = true;
      carouselOpacity.value = true;
    } else if (type === "seckill") {
      dataJson.list[i].options.list = await getListByDay();
    }
  }
  modelForm.value = dataJson;
  storage.setItem("navList", dataJson.list[1]);
  showNav.value = true;
  topAdvert.value = dataJson.list[0];
}

async function getListByDay() {
  const res = await seckillByDay();
  if (res.success && res.result?.length) {
    return res.result;
  }
  return [];
}

function checkStoreCollectionStatus() {
  const storeId = storeMsg.value && storeMsg.value.storeId;
  if (!storeId || !storage.getItem("userInfo")) {
    return;
  }
  isStoreCollection("STORE", storeId)
    .then((res) => {
      if (res.success && res.result) {
        storeCollected.value = true;
      }
    })
    .catch(() => {
      // 收藏状态查询失败不影响店铺页展示，静默处理
    });
}

function getStoreMsg() {
  const storeId = route.query.id;
  if (!storeId) {
    Message.warning("店铺不存在");
    return;
  }
  getDetailById(storeId)
    .then((res) => {
      if (res.success && res.result) {
        storeMsg.value = res.result;
        document.title = storeMsg.value.storeName || "店铺";
        checkStoreCollectionStatus();
        if (isFloorEnabled()) {
          getIndexData();
        } else {
          loadStoreGoodsView();
        }
      } else {
        storeMsg.value = { storeId };
        loadStoreGoodsView();
      }
    })
    .catch(() => {
      storeMsg.value = { storeId };
      loadStoreGoodsView();
    });
}

function getCateList() {
  // 店铺分类
  getCateById(route.query.id).then((res) => {
    if (res.success) {
      cateList.value = res.result;
    }
  });
}

function getGoodsList() {
  // 商品信息
  goodsListApi(params)
    .then((res) => {
      if (res.success) {
        goodsList.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .catch((err) => {
      console.warn('获取商品列表失败', err);
    });
}

function goGoodsDetail(skuId, goodsId) {
  // 跳转商品详情
  let routeUrl = router.resolve({
    path: "/goodsDetail",
    query: {skuId, goodsId},
  });
  window.open(routeUrl.href, "_blank");
}

function search(val) {
  // 搜索本店商品
  params.keyword = val;
  getGoodsList();
}

function searchByCate(cate) {
  // 搜索同分类下商品
  params.storeCatId = cate.id;
  params.pageNumber = 1;
  cateName.value = cate.labelName;
  getGoodsList();
}

function isCateActive(cate) {
  if (!cate || !params.storeCatId) return false;
  if (params.storeCatId === cate.id) return true;
  return Array.isArray(cate.children) && cate.children.some((sec) => sec.id === params.storeCatId);
}

function formatGrade(grade) {
  if (grade === null || grade === undefined || grade === "") return 100;
  const num = Number(grade);
  if (Number.isNaN(num)) return 100;
  const fixed = Number(num.toFixed(1));
  return fixed % 1 === 0 ? fixed.toFixed(0) : String(fixed);
}

// 分页 修改页码
function changePageNum(val) {
  params.pageNumber = val;
  getGoodsList();
}

// 分页 修改页数
function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  getGoodsList();
}

async function collect() {
  // 收藏店铺
  const storeId = storeMsg.value && storeMsg.value.storeId;
  if (!storeId) {
    return;
  }
  if (!storage.getItem("userInfo")) {
    Message.warning("请先登录");
    router.push("/login");
    return;
  }
  try {
    if (storeCollected.value) {
      const cancel = await cancelStoreCollect("STORE", storeId);
      if (cancel.success) {
        Message.success("已取消收藏");
        storeCollected.value = false;
      }
    } else {
      const collect = await collectStore("STORE", storeId);
      if (collect.success || collect.code === 200) {
        storeCollected.value = true;
        Message.success(
          "收藏店铺成功,可以前往个人中心我的收藏查看"
        );
      }
    }
  } catch (err) {
    const msg = err?.message || err?.data?.message || "";
    if (msg.includes("重复收藏")) {
      storeCollected.value = true;
    }
  }
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

// 跳转im客服（原 talkIm mixin）
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
    const storeId = id || storeMsg.value?.storeId;
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

getStoreMsg();
window.onscroll = () => {
  const top =
    document.documentElement.scrollTop || document.body.scrollTop;
  topSearchShow.value = top > 300;
};
</script>

<style lang="scss" scoped>
.merchant {
  min-height: 100%;
  background: #f5f5f5;
}

.store-head {
  width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 4px;
}

.store-head-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px 16px;
}

.shop-info {
  min-width: 0;
}

.shop-name {
  margin: 0;
  color: #171A26;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.shop-desc {
  margin: 6px 0 0;
  max-width: 760px;
  color: #999;
  font-size: 13px;
  line-height: 20px;
}

.shop-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 20px;
  color: #171A26;
  font-size: 14px;
}

.store-collect-btn,
.store-service-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.store-collect-btn {
  .el-icon {
    color: #999;
    font-size: 16px;
  }

  &.is-collected,
  &.is-collected .el-icon {
    color: $theme_color;
  }
}

.store-category {
  border-top: 1px solid #f0f0f0;
}

.cate-list {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 0 8px;
  list-style: none;
  box-sizing: border-box;
}

.cate-item {
  position: relative;
  height: 48px;
  padding: 0 18px;
  color: #666;
  font-size: 15px;
  line-height: 48px;
  cursor: pointer;

  &:hover {
    color: #171A26;
  }

  &.active {
    color: #171A26;
    font-weight: 600;

    &::after {
      content: "";
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 0;
      height: 2px;
      border-radius: 1px;
      background: $theme_color;
    }
  }

  :deep(.el-dropdown) {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    vertical-align: top;
    outline: none;
  }

  :deep(.el-tooltip__trigger) {
    outline: none;
  }
}

.cate-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: inherit;
  line-height: 48px;

  .el-icon {
    font-size: 12px;
  }
}

.store-goods-section {
  width: 1200px;
  margin: 16px auto 24px;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;
}

.store-goods-hd {
  padding: 16px 24px 0;
  color: #171A26;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 12px 16px 4px;
  box-sizing: border-box;
}

.goods-show-info {
  width: auto;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: #f0d0cc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.goods-show-img img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.goods-show-price {
  margin-top: 8px;
}

.seckill-price {
  color: $theme_color;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.goods-show-detail {
  height: 44px;
  margin: 6px 0;
  overflow: hidden;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-show-num {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  color: #999;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  span {
    color: #999;
    font-size: 13px;
    font-weight: 400;
  }
}

.goods-show-sales {
  flex-shrink: 0;
}

.goods-show-right {
  display: flex;
  margin-top: 6px;
}

.goods-show-tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  margin-right: 4px;
  padding: 0 4px;
  line-height: 1;
  vertical-align: 1px;
}

.goods-show-tag-self {
  --el-tag-bg-color: #fa2c19;
  --el-tag-border-color: #fa2c19;
  --el-tag-text-color: #fff;
  background-color: #fa2c19;
  border-color: #fa2c19;
  color: #fff;
}

.goods-page {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
}
</style>
