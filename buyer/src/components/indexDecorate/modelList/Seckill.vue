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
        <img :src="item.goodsImage" width="140" height="140" :alt="item.goodsName" />
        <div class="ellipsis">{{ item.goodsName }}</div>
        <div>
          <span>{{ $filters.unitPrice(item.price, "￥") }}</span>
          <span>{{ $filters.unitPrice(item.originalPrice, "￥") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: Object,
  },
  data() {
    return {
      list: [],
      goodsList: [],
      actStatus: 0,
      actName: "限时秒杀",
      currIndex: 0,
      currHour: "00",
      diffSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      interval: null,
    };
  },
  watch: {
    currIndex(val) {
      clearInterval(this.interval);
      this.interval = null;
      this.countDown(val);
      this.goodsList = this.list[val]?.seckillGoodsList || [];
    },
    diffSeconds(val) {
      const hours = Math.floor(val / 3600);
      const minutes = Math.floor(val / 60) % 60;
      const seconds = val % 60;
      this.hours = filteTime(hours);
      this.minutes = filteTime(minutes);
      this.seconds = filteTime(seconds);
      if (val <= 0) {
        clearInterval(this.interval);
        this.interval = null;
      }
      function filteTime(time) {
        return time < 10 ? "0" + time : time;
      }
    },
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  mounted() {
    this.getListByDay();
  },
  methods: {
    goToSeckill() {
      const routeUrl = this.$router.resolve({ path: "/seckill" });
      window.open(routeUrl.href, "_blank");
    },
    countDown(currIndex) {
      const zeroTime = new Date(new Date().toLocaleDateString()).getTime();
      const currTime = new Date().getTime();
      let actTime = 0;
      const nowHour = new Date().getHours();
      if (this.list[currIndex].timeLine > nowHour) {
        this.actStatus = 0;
        actTime = zeroTime + this.list[currIndex].timeLine * 3600 * 1000;
      } else if (this.list[currIndex].timeLine <= nowHour) {
        this.actStatus = 1;
        if (currIndex === this.list.length - 1) {
          actTime = zeroTime + 24 * 3600 * 1000;
        } else {
          actTime = zeroTime + this.list[currIndex + 1].timeLine * 3600 * 1000;
        }
      }
      this.currHour = this.list[this.currIndex].timeLine;
      this.diffSeconds = Math.floor((actTime - currTime) / 1000);
      this.interval = setInterval(() => {
        this.diffSeconds--;
      }, 1000);
    },
    getListByDay() {
      this.list = this.data?.options?.list || [];
      if (!this.list.length) {
        this.goodsList = [];
        return;
      }
      this.goodsList = this.list[0]?.seckillGoodsList || [];
      if (this.goodsList.length) {
        this.countDown(this.currIndex);
      }
    },
  },
};
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
