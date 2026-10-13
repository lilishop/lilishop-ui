<template>
  <div class="seckill" v-if="goodsList && goodsList.length">
    <div class="aside hover-pointer" @click="goToSeckill">
      <div class="title">{{ actName }}</div>
      <div class="hour">
        <span>{{ currHour }}:00</span>点场 倒计时
      </div>
      <div class="count-down" v-if="actStatus === 1">
        <span>{{ hours }}</span>
        <span>{{ minutes }}</span>
        <span>{{ seconds }}</span>
      </div>
      <div class="act-status" v-else>未开始</div>
    </div>
    <div class="goods-scroll">
      <div
        v-for="(item, index) in goodsList"
        :key="index"
        class="content hover-pointer"
        @click.stop="goToSeckill"
      >
        <img :src="item.goodsImage" loading="lazy" decoding="async" width="140" height="140" :alt="item.goodsName" />
        <div class="ellipsis">{{ item.goodsName }}</div>
        <div>
          <span>{{ $filters.unitPrice(item.price, "￥") }}</span>
          <span>{{ $filters.unitPrice(item.originalPrice, "￥") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  data: Object,
});

const router = useRouter();

const list = ref([]);
const goodsList = ref([]);
const actStatus = ref(0);
const actName = ref("限时秒杀");
const currIndex = ref(0);
const currHour = ref("00");
const diffSeconds = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const interval = ref(null);

watch(currIndex, (val) => {
  clearInterval(interval.value);
  interval.value = null;
  countDown(val);
  goodsList.value = list.value[val]?.seckillGoodsList || [];
});

watch(diffSeconds, (val) => {
  const h = Math.floor(val / 3600);
  const m = Math.floor(val / 60) % 60;
  const s = val % 60;
  hours.value = filteTime(h);
  minutes.value = filteTime(m);
  seconds.value = filteTime(s);
  if (val <= 0) {
    clearInterval(interval.value);
    interval.value = null;
  }
  function filteTime(time) {
    return time < 10 ? "0" + time : time;
  }
});

onBeforeUnmount(() => {
  clearInterval(interval.value);
});

onMounted(() => {
  getListByDay();
});

function goToSeckill() {
  router.push("/seckill");
}

function countDown(index) {
  const zeroTime = new Date(new Date().toLocaleDateString()).getTime();
  const currTime = new Date().getTime();
  let actTime = 0;
  const nowHour = new Date().getHours();
  if (list.value[index].timeLine > nowHour) {
    actStatus.value = 0;
    actTime = zeroTime + list.value[index].timeLine * 3600 * 1000;
  } else if (list.value[index].timeLine <= nowHour) {
    actStatus.value = 1;
    if (index === list.value.length - 1) {
      actTime = zeroTime + 24 * 3600 * 1000;
    } else {
      actTime = zeroTime + list.value[index + 1].timeLine * 3600 * 1000;
    }
  }
  currHour.value = list.value[currIndex.value].timeLine;
  diffSeconds.value = Math.floor((actTime - currTime) / 1000);
  interval.value = setInterval(() => {
    diffSeconds.value--;
  }, 1000);
}

function getListByDay() {
  list.value = props.data?.options?.list || [];
  if (!list.value.length) {
    goodsList.value = [];
    return;
  }
  goodsList.value = list.value[0]?.seckillGoodsList || [];
  if (goodsList.value.length) {
    countDown(currIndex.value);
  }
}
</script>
<style lang="scss" scoped>
.seckill {
  width: 100%;
  height: 260px;
  display: flex;
  background-color: #eee;
  .aside {
    overflow: hidden;
    width: 190px;
    height: 100%;
    color: #fff;
    background: linear-gradient(180deg, var(--theme-color, #F31947) 0%, var(--theme-light, #ff6b35) 100%);
    .title {
      width: 100%;
      text-align: center;
      font-size: 28px;
      margin-top: 31px;
    }
    .hour {
      margin-top: 90px;
      text-align: center;
      span {
        font-size: 18px;
      }
    }
    .count-down {
      margin: 10px 0 0 30px;
      > span {
        position: relative;
        float: left;
        width: 30px;
        height: 30px;
        text-align: center;
        background-color: #2f3430;
        margin-right: 20px;
        color: white;
        font-size: 20px;
        &::after {
          content: ":";
          display: block;
          position: absolute;
          right: -20px;
          font-weight: bolder;
          font-size: 18px;
          width: 20px;
          height: 100%;
          top: 0;
        }
      }
      > span:last-child::after {
        content: "";
      }
    }
    .act-status {
      margin: 10px 0 0 65px;
      font-size: 20px;
    }
  }
  .goods-scroll {
    height: 260px;
    flex: 1;
    margin-left: 10px;
    background-color: #fff;
    display: flex;
    overflow-x: auto;
  }
  .content {
    min-width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    &::after {
      content: "";
      display: block;
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 200px;
      transform: translateY(-50%);
      background: linear-gradient(180deg, white, #eeeeee, white);
    }
    img {
      margin-top: 30px;
    }
    > div {
      width: 160px;
      margin-top: 10px;
      font-size: 12px;
      position: relative;
    }
    > div:nth-of-type(1):hover {
      color: $theme_color;
      cursor: pointer;
    }
    > div:nth-of-type(2) {
      border: 1px solid $theme_color;
      line-height: 24px;
      display: flex;
      text-align: center;
      span:nth-child(1) {
        color: #fff;
        font-size: 16px;
        width: 92px;
        background-color: $theme_color;
      }
      span:nth-child(2) {
        color: #999;
        width: 66px;
        text-decoration: line-through;
      }
    }
  }
}
</style>
