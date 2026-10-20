<template>
  <div class="tpl-home-comb" :style="wrapperStyle">
    <!-- 高斯模糊轮播图背景 + 底部渐变遮罩 -->
    <div class="comb-bg">
      <img v-if="currentBannerImg" :src="currentBannerImg" alt="" />
      <div class="comb-mask"></div>
    </div>

    <!-- 1. 搜索栏（可选左侧 Logo + 搜索框 + 小程序胶囊） -->
    <div class="comb-search-row">
      <img
        v-if="res.searType === 'logo' && res.logoUrl"
        class="comb-logo"
        :src="res.logoUrl"
        alt="logo"
      />
      <div class="comb-search-box" :style="searchBoxStyle">
        <el-icon class="search-ico"><Search /></el-icon>
        <span class="search-text">{{ displayHotWord }}</span>
      </div>
      <div class="capsule">
        <span class="cap-icon">
          <svg width="18" height="5" viewBox="0 0 18 5" fill="currentColor">
            <circle cx="2.5" cy="2.5" r="2" />
            <circle cx="9" cy="2.5" r="2" />
            <circle cx="15.5" cy="2.5" r="2" />
          </svg>
        </span>
        <span class="cap-divider"></span>
        <span class="cap-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.6" />
            <circle cx="7.5" cy="7.5" r="2.2" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 2. 分类选项卡 -->
    <div v-if="res.showTabs !== false" class="comb-tabs">
      <div class="comb-tabs-scroll">
        <div
          v-for="(tab, idx) in displayTabs"
          :key="idx"
          class="comb-tab-item"
          :class="{ active: activeTabIndex === idx }"
          :style="{
            color:
              activeTabIndex === idx
                ? res.tabActiveColor || '#E93323'
                : res.tabColor || '#FFFFFF',
          }"
          @click.stop="activeTabIndex = idx"
        >
          {{ tab.title || "未命名" }}
          <span
            v-if="activeTabIndex === idx"
            class="tab-line"
            :style="{ background: res.tabActiveColor || '#E93323' }"
          ></span>
        </div>
      </div>
      <div class="comb-tab-more" :style="{ color: res.tabColor || '#FFFFFF' }">
        <el-icon><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 3. 轮播图区域（样式1：卡片露边 / 样式2：通栏） -->
    <div class="comb-banner" :class="{ 'no-tabs': res.showTabs === false, 'is-card': cardMode }">
      <!-- 样式2：通栏轮播 -->
      <el-carousel
        v-if="!cardMode && bannerList.length"
        class="comb-carousel"
        autoplay
        :interval="5000"
        height="146px"
        indicator-position="none"
        @change="onSlideChange"
      >
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="slide-wrap">
            <img
              v-if="item.img"
              class="slide-img"
              :style="bannerImgStyle"
              :src="item.img"
              alt=""
            />
            <div v-else class="slide-empty" :style="bannerImgStyle">750*332</div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 样式1：卡片风格（两侧露出前后图片） -->
      <div
        v-else-if="cardMode && bannerList.length"
        ref="cardPreview"
        class="card-preview"
        @mouseenter="stopBannerTimer"
        @mouseleave="startBannerTimer"
      >
        <div
          class="card-track"
          :style="{ transform: `translateX(${trackOffset}px)` }"
        >
          <div
            v-for="(item, index) in cardSlides"
            :key="index"
            class="card-slide"
            :class="{ active: index === activeTrackIndex }"
          >
            <img
              v-if="item.img"
              class="card-img"
              :style="bannerImgStyle"
              :src="item.img"
              alt=""
            />
            <div v-else class="slide-empty" :style="bannerImgStyle">750*332</div>
          </div>
        </div>
      </div>

      <div v-else class="slide-empty" :style="bannerImgStyle">请添加轮播图</div>

      <!-- 自定义指示器 -->
      <div
        v-if="res.indicatorStyle !== 'none' && bannerList.length > 1"
        class="comb-indicator"
        :class="'pos-' + (res.indicatorPosition || 'center')"
      >
        <div
          v-for="(item, i) in bannerList"
          :key="i"
          class="dot"
          :class="[res.indicatorStyle || 'round', { active: i === currentSlide }]"
          :style="
            i === currentSlide
              ? { background: res.indicatorColor || '#E93323' }
              : {}
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { Search, ArrowDown } from "@element-plus/icons-vue";

defineOptions({ title: "头部组件" });
const props = defineProps(["res"]);

const px = (v) => `${(Number(v) || 0) / 2}px`;

// 搜索热词轮换
const hotIndex = ref(0);
let hotTimer = null;
const validHotWords = computed(() =>
  (props.res?.hotWords || []).filter((w) => w && String(w).trim())
);
const displayHotWord = computed(() => {
  if (validHotWords.value.length) {
    return validHotWords.value[hotIndex.value % validHotWords.value.length];
  }
  return props.res?.placeWords || "搜索商品名称";
});

function stopHotTimer() {
  if (hotTimer) {
    clearInterval(hotTimer);
    hotTimer = null;
  }
}

watch(
  () => [validHotWords.value.length, props.res?.hotInterval],
  () => {
    stopHotTimer();
    hotIndex.value = 0;
    if (validHotWords.value.length > 1) {
      hotTimer = setInterval(() => {
        hotIndex.value = (hotIndex.value + 1) % validHotWords.value.length;
      }, (Number(props.res?.hotInterval) || 3) * 1000);
    }
  },
  { immediate: true }
);

// 选项卡
const activeTabIndex = ref(0);
const displayTabs = computed(() => {
  const custom = Array.isArray(props.res?.tabList) ? props.res.tabList : [];
  return [{ title: "首页", isHome: true }, ...custom];
});

// 轮播图
const currentSlide = ref(0);
const previewWidth = ref(375);
const cardPreview = ref(null);
let bannerTimer = null;

const bannerList = computed(() =>
  Array.isArray(props.res?.list) ? props.res.list : []
);
const cardMode = computed(() => (props.res?.swiperStyle || "card") === "card");
const currentBannerImg = computed(() => {
  const list = bannerList.value;
  if (!list.length) return "";
  const item = list[currentSlide.value % list.length] || list[0];
  return item?.img || "";
});

const cardSlides = computed(() => {
  const list = bannerList.value;
  if (list.length <= 1) return list;
  return [list[list.length - 1], ...list, list[0]];
});

const activeTrackIndex = computed(() =>
  bannerList.value.length > 1 ? currentSlide.value + 1 : currentSlide.value
);

const trackOffset = computed(
  () =>
    previewWidth.value * 0.06 -
    activeTrackIndex.value * previewWidth.value * 0.88
);

function measureCard() {
  if (cardPreview.value) {
    previewWidth.value = cardPreview.value.offsetWidth || 375;
  }
}

function startBannerTimer() {
  stopBannerTimer();
  if (!cardMode.value || bannerList.value.length < 2) return;
  bannerTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % bannerList.value.length;
  }, 4000);
}

function stopBannerTimer() {
  if (bannerTimer) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
}

function onSlideChange(idx) {
  currentSlide.value = idx;
}

watch(
  () => [cardMode.value, bannerList.value.length],
  () => {
    if (currentSlide.value >= bannerList.value.length) {
      currentSlide.value = 0;
    }
    stopBannerTimer();
    if (cardMode.value) {
      measureCard();
      startBannerTimer();
    }
  },
  { immediate: true, flush: "post" }
);

onMounted(() => {
  measureCard();
  startBannerTimer();
});

onBeforeUnmount(() => {
  stopHotTimer();
  stopBannerTimer();
});

// 样式计算
const wrapperStyle = computed(() => ({
  marginBottom: px(props.res?.pageGap ?? 0),
}));

const searchBoxStyle = computed(() => {
  const r = props.res || {};
  const align = r.textAlign || "left";
  return {
    background: r.boxColor || "#FFFFFF",
    color: r.textColor || "#303133",
    borderRadius: px(r.searchRadius ?? 30),
    justifyContent:
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start",
  };
});

const bannerImgStyle = computed(() => ({
  borderRadius: px(props.res?.bannerRadius ?? 14),
}));
</script>

<style scoped lang="scss">
.tpl-home-comb {
  position: relative;
  overflow: hidden;
  padding: 8px 10px 10px;
  box-sizing: border-box;
}

.comb-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #e93323 0%, #f5f5f5 100%);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.25);
    filter: blur(22px);
    display: block;
  }
  .comb-mask {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 90px;
    background: linear-gradient(180deg, rgba(245, 245, 245, 0) 0%, #f5f5f5 100%);
  }
}

.comb-search-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comb-logo {
  width: 69px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.comb-search-box {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  box-sizing: border-box;
  overflow: hidden;
  .search-ico {
    font-size: 13px;
    flex-shrink: 0;
  }
  .search-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.capsule {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
  color: #303133;
  .cap-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      display: block;
    }
  }
  .cap-divider {
    width: 1px;
    height: 14px;
    background: rgba(0, 0, 0, 0.12);
    margin: 0 8px;
  }
}

.comb-tabs {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 36px;
  margin-top: 4px;
}

.comb-tabs-scroll {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.comb-tab-item {
  position: relative;
  flex-shrink: 0;
  font-size: 13px;
  line-height: 34px;
  cursor: pointer;
  white-space: nowrap;
  &.active {
    font-size: 14px;
    font-weight: 600;
  }
  .tab-line {
    position: absolute;
    left: 50%;
    bottom: 2px;
    transform: translateX(-50%);
    width: 18px;
    height: 2px;
    border-radius: 2px;
  }
}

.comb-tab-more {
  flex-shrink: 0;
  padding-left: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.comb-banner {
  position: relative;
  z-index: 2;
  margin-top: 6px;
  height: 146px;
  overflow: hidden;
  &.is-card {
    margin-left: -10px;
    margin-right: -10px;
  }
  &.no-tabs {
    margin-top: 10px;
  }
}

.comb-carousel {
  height: 146px;
}

.slide-wrap {
  width: 100%;
  height: 146px;
}

.slide-img {
  width: 100%;
  height: 146px;
  object-fit: fill;
  display: block;
}

.slide-empty {
  width: 100%;
  height: 146px;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.card-preview {
  width: 100%;
  height: 146px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.card-track {
  display: flex;
  align-items: center;
  width: 100%;
  transition: transform 0.45s ease;
}

.card-slide {
  flex: 0 0 88%;
  padding: 0 3px;
  box-sizing: border-box;
  transform: scale(0.92);
  transition: transform 0.35s ease;
  &.active {
    transform: scale(1);
  }
}

.card-img {
  width: 100%;
  height: 146px;
  object-fit: fill;
  display: block;
}

.comb-indicator {
  position: absolute;
  bottom: 8px;
  display: flex;
  align-items: center;
  z-index: 3;
  &.pos-left {
    left: 16px;
  }
  &.pos-center {
    left: 50%;
    transform: translateX(-50%);
  }
  &.pos-right {
    right: 16px;
  }
  .dot {
    background: rgba(255, 255, 255, 0.65);
    transition: all 0.25s ease;
    &.round {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin: 0 3px;
    }
    &.line {
      width: 12px;
      height: 3px;
      border-radius: 2px;
      margin: 0 2px;
    }
  }
}
</style>
