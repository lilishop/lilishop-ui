<template>
  <div class="seckill-list">
    <BaseHeader></BaseHeader>
    <SearchHeader></SearchHeader>

    <!-- 秒杀顶部氛围横幅 -->
    <div class="seckill-hero">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-tag">
            <span class="lightning">⚡</span>
            <span>限时特惠 · 爆款直降</span>
          </div>
          <h1 class="hero-title">限时秒杀</h1>
          <p class="hero-subtitle">正品严选 · 限量低价 · 抢完即止</p>
        </div>

        <div class="hero-countdown" v-if="list.length && list[currIndex]">
          <div class="countdown-badge">
            <span class="status-dot" :class="{ 'is-live': isCurrentSessionActive }"></span>
            <span>{{ isCurrentSessionActive ? "正在抢购中" : "即将准点开抢" }}</span>
          </div>
          <div class="countdown-label">
            {{ isCurrentSessionActive ? "距本场结束仅剩" : "距本场开始仅剩" }}
          </div>
          <div class="countdown-boxes">
            <span class="time-block">{{ countdownHours }}</span>
            <span class="time-sep">:</span>
            <span class="time-block">{{ countdownMinutes }}</span>
            <span class="time-sep">:</span>
            <span class="time-block">{{ countdownSeconds }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 秒杀时间段导航 -->
    <div class="time-line-wrap" v-if="list.length">
      <ul class="time-line" :class="{ 'single-session': list.length === 1 }">
        <template v-for="(time, index) in list">
          <li
            v-if="index < 5"
            :key="index"
            @click="currIndex = index"
            :class="{ currTimeline: currIndex === index }"
          >
            <div class="timeline-hour">{{ time.timeLine + ":00" }}</div>
            <div class="timeline-status">
              <span class="status-pill">{{ nowHour >= time.timeLine ? "秒杀中" : "即将开始" }}</span>
            </div>
          </li>
        </template>
      </ul>
    </div>

    <!-- 秒杀商品列表 -->
    <div class="seckill-goods-wrap">
      <div v-if="goodsList.length === 0" class="empty-wrap">
        <empty :_Title="list.length ? '当前场次暂无秒杀商品，去其他场次看看吧' : '今日暂无秒杀活动，去首页逛逛吧'" />
      </div>

      <div v-else class="goods-grid">
        <div
          class="goods-card"
          v-for="(item, index) in goodsList"
          :key="index"
          @click="goGoodsDetail(item.skuId, item.goodsId)"
        >
          <div class="goods-img-box">
            <img :src="item.goodsImage" loading="lazy" decoding="async" :alt="item.goodsName" />
            <div v-if="isSoldOut(item)" class="sold-out-overlay">
              <span>已抢光</span>
            </div>
          </div>

          <div class="goods-price-row">
            <div class="price-main">
              <span class="price-symbol">￥</span>
              <span class="price-val">{{ $filters.unitPrice(item.price, "") }}</span>
            </div>
            <div class="price-origin">
              {{ $filters.unitPrice(item.originalPrice, "￥") }}
            </div>
          </div>

          <div class="goods-name-row" :title="item.goodsName">
            {{ item.goodsName }}
          </div>

          <div class="goods-progress-row">
            <template v-if="nowHour >= list[currIndex].timeLine">
              <span class="progress-label">已抢 {{ salePercent(item) }}%</span>
              <el-progress
                :show-text="false"
                :stroke-width="6"
                :color="'var(--theme-color, #ff3c2a)'"
                :percentage="salePercent(item)"
              />
            </template>
            <template v-else>
              <span class="upcoming-tip">限量抢购 · 准点开抢</span>
            </template>
          </div>

          <div class="goods-store-row" :title="item.storeName">
            <span class="store-name">{{ item.storeName }}</span>
          </div>

          <div
            class="goods-action-btn"
            :class="{
              'btn-disabled': !canBuy(item),
              'btn-upcoming': nowHour < list[currIndex].timeLine,
              'btn-active': canBuy(item)
            }"
          >
            {{ buyText(item) }}
          </div>
        </div>
      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { seckillByDay } from "@/api/promotion";
import SearchHeader from "@/components/indexDecorate/components/SearchHeader.vue";

const router = useRouter();

const list = ref([]); // 秒杀时段列表
const goodsList = ref([]); // 商品列表
let interval = null; // 定时器
const currIndex = ref(0); // 当前时间段的下标
const currTime = ref("00:00:00"); // 当前显示的倒计时格式字符串
const countdownHours = ref("00");
const countdownMinutes = ref("00");
const countdownSeconds = ref("00");
const diffSeconds = ref(0); // 倒计时时间戳差值
const nowHour = ref(new Date().getHours()); // 当前小时数

// 当前选中场次是否处于开抢中
const isCurrentSessionActive = computed(() => {
  if (!list.value.length || !list.value[currIndex.value]) return false;
  return nowHour.value >= list.value[currIndex.value].timeLine;
});

watch(currIndex, (val) => {
  clearInterval(interval);
  interval = null;
  nowHour.value = new Date().getHours();
  countDown(val);
  goodsList.value = list.value[val]?.seckillGoodsList || [];
});

watch(diffSeconds, (val) => {
  if (val <= 0) {
    clearInterval(interval);
    interval = null;
    countdownHours.value = "00";
    countdownMinutes.value = "00";
    countdownSeconds.value = "00";
    currTime.value = "00:00:00";
    return;
  }
  const hours = Math.floor(val / 3600);
  const minutes = Math.floor(val / 60) % 60;
  const seconds = val % 60;
  countdownHours.value = hours < 10 ? "0" + hours : String(hours);
  countdownMinutes.value = minutes < 10 ? "0" + minutes : String(minutes);
  countdownSeconds.value = seconds < 10 ? "0" + seconds : String(seconds);
  currTime.value = `${countdownHours.value}:${countdownMinutes.value}:${countdownSeconds.value}`;
});

function getListByDay () {
  // 当天秒杀活动；result 可能为空数组（当天无活动），需判空避免取下标 0 报错
  seckillByDay().then((res) => {
    if (res.success && res.result && res.result.length) {
      list.value = res.result;
      goodsList.value = list.value[0].seckillGoodsList || [];
      countDown(currIndex.value);
    }
  });
}

function goGoodsDetail (skuId, goodsId) {
  // 跳转商品详情
  const routeUrl = router.resolve({
    path: "/goodsDetail",
    query: { skuId, goodsId },
  });
  window.open(routeUrl.href, "_blank");
}

// 已售占比。没有库存时按售罄展示
function salePercent (item) {
  if (!item.quantity || item.quantity <= 0) return 100;
  return Math.min(100, Math.ceil((item.salesNum / item.quantity) * 100));
}

// 场次已开始，且销量达到库存
function isSoldOut (item) {
  if (!list.value[currIndex.value]) return false;
  return nowHour.value >= list.value[currIndex.value].timeLine && item.quantity <= item.salesNum;
}

// 场次已开始且未售罄才可抢
function canBuy (item) {
  if (!list.value[currIndex.value]) return false;
  return nowHour.value >= list.value[currIndex.value].timeLine && !isSoldOut(item);
}

// 按钮文案：未开始 / 已售罄 / 立即抢购
function buyText (item) {
  if (!list.value[currIndex.value]) return "即将开始";
  if (nowHour.value < list.value[currIndex.value].timeLine) return "即将开始";
  if (isSoldOut(item)) return "已售罄";
  return "立即抢购";
}

function countDown (currIndex) {
  if (!list.value[currIndex]) return;
  // 倒计时：0点时间戳
  const zeroTime = new Date(new Date().toLocaleDateString()).getTime();
  const currTimeMs = new Date().getTime();
  let actTime = 0;
  const currentHour = new Date().getHours();
  nowHour.value = currentHour;

  if (list.value[currIndex].timeLine > currentHour) {
    // 活动未开始：距开始时间
    actTime = zeroTime + list.value[currIndex].timeLine * 3600 * 1000;
  } else {
    // 活动进行中：距结束时间
    if (currIndex === list.value.length - 1) {
      actTime = zeroTime + 24 * 3600 * 1000;
    } else {
      actTime = zeroTime + list.value[currIndex + 1].timeLine * 3600 * 1000;
    }
  }

  diffSeconds.value = Math.max(0, Math.floor((actTime - currTimeMs) / 1000));
  interval = setInterval(() => {
    diffSeconds.value--;
  }, 1000);
}

onMounted(() => {
  getListByDay();
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<style lang="scss" scoped>
.seckill-list {
  background: #f7f8fa;
  min-height: 100vh;
}

/* 顶部氛围 Hero 横幅 */
.seckill-hero {
  background: linear-gradient(135deg, #e52d27 0%, #b31217 60%, #790c10 100%);
  color: #fff;
  padding: 30px 0 38px;
  box-shadow: inset 0 -4px 12px rgba(0, 0, 0, 0.15);

  .hero-inner {
    width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 13px;
      width: fit-content;
      backdrop-filter: blur(4px);

      .lightning {
        color: #ffeb3b;
        font-weight: bold;
      }
    }

    .hero-title {
      margin: 0;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 2px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    }

    .hero-subtitle {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      letter-spacing: 1px;
    }
  }

  .hero-countdown {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px 24px;
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);

    .countdown-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #fff;
      font-weight: 500;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffc107;

        &.is-live {
          background: #4caf50;
          box-shadow: 0 0 8px #4caf50;
        }
      }
    }

    .countdown-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
    }

    .countdown-boxes {
      display: flex;
      align-items: center;
      gap: 6px;

      .time-block {
        display: inline-block;
        min-width: 38px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        background: #1e1e1e;
        color: #ffeb3b;
        font-size: 20px;
        font-weight: 700;
        font-family: Consolas, Monaco, monospace;
        border-radius: 6px;
        padding: 0 4px;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      }

      .time-sep {
        font-size: 20px;
        font-weight: bold;
        color: #fff;
      }
    }
  }
}

/* 时间轴导航 */
.time-line-wrap {
  width: 1200px;
  margin: -18px auto 0;
  position: relative;
  z-index: 10;

  .time-line {
    list-style: none;
    padding: 0;
    margin: 0;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    display: flex;
    overflow: hidden;

    &.single-session {
      justify-content: center;

      li {
        max-width: 300px;
      }
    }

    li {
      flex: 1;
      min-width: 160px;
      max-width: 240px;
      height: 68px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      background: #fff;
      color: #333;
      transition: all 0.2s ease;
      position: relative;
      box-sizing: border-box;

      & + li {
        box-shadow: inset 1px 0 0 #f0f0f0;
      }

      &:hover:not(.currTimeline) {
        background: #fafafa;
        color: var(--theme-color, #e52d27);
      }

      .timeline-hour {
        font-size: 19px;
        font-weight: 700;
        line-height: 22px;
      }

      .timeline-status {
        .status-pill {
          display: inline-block;
          font-size: 12px;
          padding: 1px 8px;
          border-radius: 10px;
          background: #f5f5f5;
          color: #888;
          line-height: 16px;
        }
      }
    }

    .currTimeline {
      background: linear-gradient(135deg, var(--theme-color, #e52d27) 0%, #ff5252 100%);
      color: #fff;
      box-shadow: 0 4px 12px rgba(229, 45, 39, 0.3);

      &:hover {
        background: linear-gradient(135deg, var(--theme-color, #e52d27) 0%, #ff5252 100%);
      }

      .timeline-hour {
        font-size: 21px;
      }

      .timeline-status {
        .status-pill {
          background: rgba(255, 255, 255, 0.25);
          color: #fff;
          font-weight: 500;
        }
      }
    }
  }
}

/* 秒杀商品容器 */
.seckill-goods-wrap {
  width: 1200px;
  margin: 20px auto 50px;
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  box-sizing: border-box;
  min-height: 380px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);

  .empty-wrap {
    padding: 60px 0;
  }

  .goods-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

/* 商品卡片 */
.goods-card {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;

  &:hover {
    border-color: #ffd0d0;
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(229, 45, 39, 0.12);
  }

  .goods-img-box {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    background: #f9f9f9;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.03);
    }

    .sold-out-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        font-size: 13px;
        font-weight: 600;
      }
    }
  }

  .goods-price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 12px;

    .price-main {
      color: var(--theme-color, #e52d27);
      font-weight: 800;
      display: flex;
      align-items: baseline;

      .price-symbol {
        font-size: 14px;
      }

      .price-val {
        font-size: 22px;
        font-family: Arial, Helvetica, sans-serif;
      }
    }

    .price-origin {
      font-size: 13px;
      color: #aaa;
      text-decoration: line-through;
    }
  }

  .goods-name-row {
    margin-top: 8px;
    height: 40px;
    font-size: 14px;
    line-height: 20px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
    font-weight: 500;
  }

  .goods-progress-row {
    margin-top: 10px;
    height: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #777;

    .progress-label {
      flex-shrink: 0;
    }

    :deep(.el-progress) {
      flex: 1;
      margin: 0;
    }

    .upcoming-tip {
      color: #e67e22;
      font-size: 12px;
      background: #fff8f0;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .goods-store-row {
    margin-top: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .store-name {
      &:hover {
        color: var(--theme-color, #e52d27);
      }
    }
  }

  .goods-action-btn {
    margin-top: auto;
    height: 36px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    user-select: none;

    &.btn-active {
      background: linear-gradient(135deg, var(--theme-color, #e52d27) 0%, #ff5252 100%);
      color: #fff;
      box-shadow: 0 4px 10px rgba(229, 45, 39, 0.25);

      &:hover {
        opacity: 0.92;
        box-shadow: 0 6px 14px rgba(229, 45, 39, 0.35);
      }
    }

    &.btn-upcoming {
      background: #ff9800;
      color: #fff;

      &:hover {
        opacity: 0.92;
      }
    }

    &.btn-disabled {
      background: #e0e0e0;
      color: #888;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
}
</style>