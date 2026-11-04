<template>
  <div class="container">
    <el-dialog v-model="showCpmodel" width="350">
            <template #header>
                <p style="color:black;text-align:left">
                    <!-- <el-icon><InfoFilled /></el-icon> -->
                    <span>活动优惠券</span>
                </p>
            </template>
              <div class="coupon-scroll" @scroll="handleReachBottom">
                      <el-card shadow="never" v-for="(item, index) in autoCoupList" :key="index" style="margin: 10px 15px">
                            <span v-if="item.couponType === 'PRICE'" class="fontsize_12 global_color" style="font-size: 15px;">￥<span class="price">{{ $filters.unitPrice(item.price) }}</span></span>
                            <span v-if="item.couponType === 'DISCOUNT'" class="fontsize_12 global_color" style="font-size: 15px;"><span class="price">{{item.discount}}</span>折</span>
                            <span class="describe" style="font-size: 15px;margin-left: 5px;">{{ item.consumeThreshold > 0 ? '满' + item.consumeThreshold + '元可用' : '无门槛使用' }}</span>
                            <p style="font-size: 14px;">使用范围：{{useScope(item.scopeType, item.storeName)}}</p>
                            <p style="font-size: 14px;">有效期：{{item.endTime}}</p>
                      </el-card>
              </div>
            <template #footer>
                <el-button type="danger" @click="showCpmodel=false">确定</el-button>
            </template>
        </el-dialog>

    <!-- 固定头部 -->
    <hover-search class="hover-search" :class="{show: topSearchShow}" :options="searchHeaderOptions"></hover-search>
    <!-- 顶部广告 -->
    <FixedTopPage :data="topAdvert" v-if="!isVersion2"></FixedTopPage>
    <!-- 头部 包括登录，我的订单等 -->
    <BaseHeader v-if="!hasComponentInV2('topBar')"></BaseHeader>
    <!-- 搜索框、logo -->
    <Search v-if="!hasComponentInV2('searchHeader')"></Search>
    <!-- Version 2 页面装修：全宽自由响应容器，由各行独立配置 rowStyle.width（如 100%、1920、1400、1200）实现全宽或精准居中 -->
    <div v-if="isVersion2" class="v2-index-main">
      <model-form :data="modelFormData"></model-form>
    </div>

    <!-- Version 1 历史旧版：保持 1200px 传统固定容器与分类栏 -->
    <div v-else class="index-main">
      <cateNav :showAlways="true" v-if="showNav" :large="carouselLarge" :opacity="carouselOpacity"></cateNav>
      <model-form :data="modelFormData"></model-form>
    </div>
    <!-- 底部栏 -->
    <BaseFooter v-if="!hasComponentInV2('footerNav')"></BaseFooter>
    <!-- 侧边栏 -->
    <fixedBar class="fixed-bar" :class="{'show-fixed': topSearchShow}"></fixedBar>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import Search from '@/components/Search';
import ModelForm from '@/components/indexDecorate/ModelForm';
import HoverSearch from '@/components/header/hoverSearch';
import fixedBar from '@/components/fixed/index';
import storage from "@/plugins/storage";
import { indexData, getAutoCoup } from '@/api/index.js';
import { DOUBLE11_PAGE_DOCUMENT } from '@/components/indexDecorate/presets/double11Preset.js';
import { seckillByDay } from '@/api/promotion';

defineOptions({ name: "Index" });

const props = defineProps({
  pageData: {
    type: null,
    default: "",
  },
});

const autoCoupList = ref([]);
const showCpmodel = ref(false);
const modelFormData = ref({ list: [] }); // 楼层装修数据
const topAdvert = ref({}); // 顶部广告
const showNav = ref(false); // 是否展示分类栏
const topSearchShow = ref(false); // 滚动后顶部搜索栏展示
const carouselLarge = ref(false); // 不同轮播分类尺寸
const carouselOpacity = ref(false); // 不同轮播分类样式

const isVersion2 = computed(() => {
  return modelFormData.value?.version === 2 || modelFormData.value?.version === '2.0';
});

const searchHeaderOptions = computed(() => {
  if (!Array.isArray(modelFormData.value?.list)) return {};
  for (const row of modelFormData.value.list) {
    if (Array.isArray(row.components)) {
      const target = row.components.find(c => c && c.type === 'searchHeader');
      if (target?.options) {
        return target.options;
      }
    }
  }
  return {};
});

const hasComponentInV2 = (type) => {
  if (!isVersion2.value || !Array.isArray(modelFormData.value?.list)) return false;
  return modelFormData.value.list.some(r => r.components && r.components.some(c => c.type === type));
};


// 优惠券可用范围
function useScope(type, storeName) {
  let shop = '平台';
  let goods = '全部商品';
  if (storeName !== 'platform') shop = storeName;
  switch (type) {
    case 'ALL':
      goods = '全部商品';
      break;
    case 'PORTION_GOODS':
      goods = '部分商品';
      break;
    case 'PORTION_GOODS_CATEGORY':
      goods = '部分分类商品';
      break;
  }
  return `${shop}${goods}可用`;
}

function fetchAutoCoup() {
  let data = new Date();
  let datas = data.getDate();
  let hours = data.getHours();
  let flagCoup = storage.getItem('getTimes'); //缓存
  if (flagCoup && flagCoup != undefined && flagCoup != null) {  //判断当前是否有缓存
    if (Number(datas) > Number(flagCoup)) { //判断缓存是否小于当前天数
      if (Number(hours) >= 6) { //超过或等于6时清楚缓存
        storage.setItem('getTimes', datas); //存储缓存
        getcps();
      }
    }
  } else {
    getcps();
  }
}

function getcps() {
  let data = new Date();
  let datas = data.getDate();
  getAutoCoup().then(res => { //调用自动发券
    if (res.success) {
      autoCoupList.value.push(...res.result);
      let objs = {};
      autoCoupList.value = autoCoupList.value.reduce((cur, next) => {
        //对象去重
        if (next.id != undefined) {
          objs[next.id]
            ? ""
            : (objs[next.id] = true && cur.push(next));
        }
        return cur;
      }, []);
      if (autoCoupList.value != '' && autoCoupList.value.length > 0) {
        showCpmodel.value = true;
      }
      storage.setItem('getTimes', datas); //存储缓存
    }
  }).catch((err) => {
    console.warn('获取自动发券信息失败', err);
  });
}

function handleReachBottom() {
}

function getIndexData() {
  if (props.pageData) {
    parsePageData(JSON.stringify(props.pageData)).catch(() => {
      modelFormData.value = DOUBLE11_PAGE_DOCUMENT;
    });
  } else {
    // 获取首页装修数据
    indexData({ clientType: 'PC' }).then(async (res) => {
      if (res.success && res.result?.pageData) {
        try {
          await parsePageData(res.result.pageData);
        } catch {
          modelFormData.value = DOUBLE11_PAGE_DOCUMENT;
        }
      } else {
        // 无服务端数据时默认展示双11平台首页
        modelFormData.value = DOUBLE11_PAGE_DOCUMENT;
      }
    }).catch((err) => {
      console.warn('获取首页装修数据失败，启用双11平台首页预设', err);
      modelFormData.value = DOUBLE11_PAGE_DOCUMENT;
    });
  }
}

async function parsePageData(pageData) {
  const dataJson = typeof pageData === "string" ? JSON.parse(pageData) : pageData;
  if (!dataJson?.list?.length) {
    return;
  }
  if (dataJson.version === 2 || dataJson.version === '2.0') {
    modelFormData.value = dataJson;
    return;
  }
  // 秒杀活动不是装修的数据，需要调用接口判断是否有秒杀商品
  // 轮播图根据不同轮播，样式不同
  for (let i = 0; i < dataJson.list.length; i++) {
    let type = dataJson.list[i].type;
    if (type === 'carousel2') {
      carouselLarge.value = true;
    } else if (type === 'carousel1') {
      carouselLarge.value = true;
      carouselOpacity.value = true;
    } else if (type === 'seckill') {
      let seckill = await getListByDay();
      dataJson.list[i].options.list = seckill;
    }
  }
  modelFormData.value = dataJson;
  if (dataJson.list[1]) {
    storage.setItem('navList', dataJson.list[1]);
  }
  showNav.value = true;
  if (dataJson.list[0]) {
    topAdvert.value = dataJson.list[0];
  }
}

async function getListByDay() { // 当天秒杀活动
  try {
    const res = await seckillByDay();
    if (res.success && res.result?.length) {
      return res.result;
    }
  } catch {
    // 秒杀接口失败时不影响首页其他模块
  }
  return [];
}

function handleScroll() {
  const top = document.documentElement.scrollTop || document.body.scrollTop;
  topSearchShow.value = top > 300;
}

onMounted(() => {
  getIndexData();
  window.onscroll = handleScroll;
  if (storage.getItem('userInfo')) {
    fetchAutoCoup();
  }
});

onUnmounted(() => {
  if (window.onscroll === handleScroll) {
    window.onscroll = null;
  }
});
</script>

<style scoped lang="scss">
 @import '../assets/styles/coupon.scss';
.container {
  @include sub_background_color($light_background_color);
}
.v2-index-main {
  width: 100%;
  position: relative;
  box-sizing: border-box;
}
</style>
<style>
.hover-search {
  width: 100%;
  height: 60px;
  transform: translateY(-200px);
  background-color: #fff;
  position: fixed;
  top: 0;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid #f1f5f9;
  transition: 0.35s;
}
.show {
  transform: translateY(0) translateZ(0);
  top: 0;
}
.fixed-bar{
  opacity: 0 !important;
  transform: translateY(-10px);
  transition: .35s;
  z-index: 999999;
  height: 0px !important;
  overflow: hidden;
}
.show-fixed{
  height: 354px !important;
  opacity: 1 !important;
  transform: translateY(0) translateZ(0);
}


/* 2K */
@media screen and (min-width: 2561px) and (max-width: 3840px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:900px;
    top: 500px;
  }
}

/* 1080p */
@media screen and (max-width: 2560px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:300px;
    top: 500px;
  }
}



@media screen and (max-width: 2025px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:150px;
    top: 300px;
  }
}

</style>
