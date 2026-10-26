<template>
  <div class="wrapper">
    <UserCenterLayout
      v-if="!homePage"
      :tabs="favoriteWay"
      :active-tab="activeTabIndex"
      @tab-change="change"
    >
      <empty v-if="!list.length" />
      <div v-else class="fav-list" :class="{ 'is-store': params.type === 'STORE' }">
        <div class="fav-cols">
          <span>{{ params.type === 'GOODS' ? '商品' : '店铺' }}</span>
          <span v-if="params.type === 'GOODS'">金额</span>
          <span>操作</span>
        </div>
        <div class="fav-row" v-for="(item, index) in list" :key="item.id || item.skuId || index">
          <div class="fav-goods">
            <div class="fav-thumb" @click="openItem(item)">
              <img
                :src="params.type === 'GOODS' ? item.image : item.storeLogo"
                loading="lazy"
                decoding="async"
                alt=""
                @error="$event.target.style.visibility = 'hidden'"
              />
            </div>
            <div class="fav-info">
              <div class="fav-name" @click="openItem(item)">
                {{ params.type === 'GOODS' ? item.goodsName : item.storeName }}
              </div>
              <span v-if="params.type === 'STORE' && item.selfOperated" class="self-tag">商家自营</span>
            </div>
          </div>
          <div v-if="params.type === 'GOODS'" class="fav-price">{{ $filters.unitPrice(item.price, '￥') }}</div>
          <div class="fav-ops">
            <el-button v-if="params.type === 'GOODS'" type="primary" size="small" @click="buynow(item.skuId, item.goodsId)">立即购买</el-button>
            <el-button v-else type="primary" size="small" @click="goShop(item.id)">查看店铺</el-button>
            <el-button v-if="params.type === 'GOODS'" link type="danger" @click="cancel(item.skuId)">取消收藏</el-button>
            <el-button v-else link type="danger" @click="cancelStore(item.id)">取消收藏</el-button>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
    </UserCenterLayout>

    <template v-else>
      <card _Title="近期收藏" :_Size="16" :_Tabs="favoriteWay" :_ActiveTab="activeTabIndex" @_Change="change" _More="全部收藏" _Src="/home/Favorites"></card>
      <empty v-if="!list.length" />
      <div v-else class="fav-list" :class="{ 'is-store': params.type === 'STORE' }">
        <div class="fav-cols">
          <span>{{ params.type === 'GOODS' ? '商品' : '店铺' }}</span>
          <span v-if="params.type === 'GOODS'">金额</span>
          <span>操作</span>
        </div>
        <div class="fav-row" v-for="(item, index) in list" :key="item.id || item.skuId || index">
          <div class="fav-goods">
            <div class="fav-thumb" @click="openItem(item)">
              <img
                :src="params.type === 'GOODS' ? item.image : item.storeLogo"
                loading="lazy"
                decoding="async"
                alt=""
                @error="$event.target.style.visibility = 'hidden'"
              />
            </div>
            <div class="fav-info">
              <div class="fav-name" @click="openItem(item)">
                {{ params.type === 'GOODS' ? item.goodsName : item.storeName }}
              </div>
              <span v-if="params.type === 'STORE' && item.selfOperated" class="self-tag">商家自营</span>
            </div>
          </div>
          <div v-if="params.type === 'GOODS'" class="fav-price">{{ $filters.unitPrice(item.price, '￥') }}</div>
          <div class="fav-ops">
            <el-button v-if="params.type === 'GOODS'" type="primary" size="small" @click="buynow(item.skuId, item.goodsId)">立即购买</el-button>
            <el-button v-else type="primary" size="small" @click="goShop(item.id)">查看店铺</el-button>
            <el-button v-if="params.type === 'GOODS'" link type="danger" @click="cancel(item.skuId)">取消收藏</el-button>
            <el-button v-else link type="danger" @click="cancelStore(item.id)">取消收藏</el-button>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "@/utils/message";
import { collectList, cancelCollect, storeCollectList, cancelStoreCollect } from '@/api/member.js'

defineOptions({ name: 'Favorites' });

const props = defineProps({
  homePage: {
    type: Boolean,
    default: false
  }
});

const route = useRoute();
const router = useRouter();

const favoriteWay = ref(['收藏商品', '收藏店铺']); // 收藏分类
const list = ref([]); // 收藏列表
const total = ref(0); // 收藏总数
const params = reactive({ // 请求参数
  pageNumber: 1,
  pageSize: 100,
  type: route.query.type || 'GOODS'
});
const spinShow = ref(false); // 加载状态

const activeTabIndex = computed(() => {
  return params.type === 'STORE' ? 1 : 0;
});

function loadFavorites() {
  if (params.type === 'STORE') {
    getStoreList();
  } else {
    getList();
  }
}

function getList() { // 获取商品收藏列表
  spinShow.value = true
  collectList(params).then(res => {
    if (res.success && res.result) {
      list.value = res.result.records || [];
    }
  }).catch(() => {
    list.value = [];
  }).finally(() => {
    spinShow.value = false
  })
}

function getStoreList() { // 获取店铺收藏列表
  spinShow.value = true
  storeCollectList(params).then(res => {
    if (res.success && res.result) {
      list.value = res.result.records || [];
    }
  }).catch(() => {
    list.value = [];
  }).finally(() => {
    spinShow.value = false
  })
}

function change(index) { // tab栏切换
  if (index === 0) { params.type = 'GOODS', getList() }
  if (index === 1) { params.type = 'STORE', getStoreList() }
}

function cancel(id) { // 取消收藏
  let typeName = params.type === 'GOODS' ? '商品' : '店铺'
  Modal.confirm({
    title: '取消收藏',
    content: `确定取消收藏该${typeName}吗？`,
    onOk: () => {
      cancelCollect(params.type, id).then(res => {
        if (res.success) {
          getList();
        }
      })
    }
  });
}

function cancelStore(id) { // 取消收藏
  let typeName = params.type === 'GOODS' ? '商品' : '店铺'
  Modal.confirm({
    title: '取消收藏',
    content: `确定取消收藏该${typeName}吗？`,
    onOk: () => {
      cancelStoreCollect(params.type, id).then(res => {
        if (res.success) {
          getStoreList();
        }
      })
    }
  });
}

function openItem (item) {
  if (params.type === 'STORE') {
    goShop(item.id)
    return
  }
  buynow(item.skuId, item.goodsId)
}

function buynow(skuId, goodsId, storeId) { // 跳转详情
  let url
  if (params.type === 'STORE') {
    url = router.resolve({
      path: '/merchant',
      query: { 'id': storeId }
    })
  } else {
    url = router.resolve({
      path: '/goodsDetail',
      query: { skuId, goodsId }
    })

  }
  window.open(url.href, '_blank')

}

function goShop(id) { // 跳转店铺页面
  router.push({
    path: '/merchant',
    query: { id }
  })
}

onMounted(() => {
  if (props.homePage) params.pageSize = 5;
  loadFavorites();
});
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}

.fav-list {
  --fav-cols: minmax(0, 1fr) 140px 200px;
  --fav-gap: 12px;
  padding-top: 8px;

  &.is-store {
    --fav-cols: minmax(0, 1fr) 200px;
  }
}

.fav-cols,
.fav-row {
  display: grid;
  grid-template-columns: var(--fav-cols);
  column-gap: var(--fav-gap);
  align-items: center;
}

.fav-cols {
  padding: 0 8px 10px;
  color: #999;
  font-size: 13px;

  span:first-child {
    padding-left: 72px;
  }

  span:nth-child(n + 2) {
    text-align: center;
  }
}

.fav-row {
  padding: 14px 8px;
  border-top: 1px solid #f0f0f0;
}

.fav-goods {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  column-gap: 12px;
  align-items: center;
  min-width: 0;
}

.fav-thumb {
  width: 60px;
  height: 60px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.fav-info {
  min-width: 0;
}

.fav-name {
  color: #333;
  font-size: 16px;
  line-height: 22px;
  max-height: 44px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.self-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 0 6px;
  border-radius: 4px;
  background: color-mix(in srgb, #{$theme_color} 8%, #fff);
  color: $theme_color;
  font-size: 12px;
  line-height: 20px;
}

.fav-price {
  text-align: center;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.fav-ops {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
</style>
