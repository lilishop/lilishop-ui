<template>
  <div class="seckill-wrap">
    <div class="desc">秒杀商品需要在促销活动中添加商品，有商品时才会在首页展示</div>
    <div class="seckill">
      <div class="aside">
        <div class="title">{{ actName }}</div>
        <div class="time-block">
          <div class="hour">
            <span>{{ currHour }}:00</span>点场 倒计时
          </div>
          <div class="count-down" v-if="actStatus === 1">
            <span>{{ hours }}</span>
            <span>{{ minutes }}</span>
            <span>{{ seconds }}</span>
          </div>
          <div class="act-status" v-else>
            {{ actStatus == 0 ? "未开始" : "已结束" }}
          </div>
        </div>
      </div>
      <div class="section">
        <div class="seckill-list">
          <div
            class="seckill-item"
            v-for="(item, index) in options.list[0].goodsList"
            :key="index"
          >
            <div class="content">
              <img :src="item.img" width="140" height="140" :alt="item.name" />
              <div class="ellipsis">{{ item.name }}</div>
              <div class="price-row">
                <span>{{ $filters.unitPrice(item.price, "￥") }}</span>
                <span>{{ $filters.unitPrice(item.originalPrice, "￥") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      options: this.data.options,
      actStatus: 0,
      actName: "限时秒杀",
      currHour: "00",
      diffSeconds: 0,
      hours: "00",
      minutes: "00",
      seconds: "00",
      interval: undefined,
    };
  },
  watch: {
    diffSeconds(val) {
      const hours = Math.floor(val / 3600);
      const minutes = Math.floor(val / 60) % 60;
      const seconds = val % 60;
      this.hours = hours < 10 ? "0" + hours : hours;
      this.minutes = minutes < 10 ? "0" + minutes : minutes;
      this.seconds = seconds < 10 ? "0" + seconds : seconds;

      if (val === 0) {
        clearInterval(this.interval);
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.countDown(this.options.list);
      }
    },
  },
  mounted() {
    this.countDown(this.options.list);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    countDown(list) {
      const nowHour = new Date().getHours();
      if (nowHour < Number(list[0].time)) {
        this.currHour = list[0].time;
        this.actStatus = 0;
      } else if (nowHour >= Number(list[list.length - 1].time + 2)) {
        this.actStatus = 2;
        this.currHour = list[list.length - 1].time;
      } else {
        this.actStatus = 1;
        for (let i = 0; i < list.length; i++) {
          if (nowHour == Number(list[i].time)) {
            this.currHour = list[i].time;
          }
          if (
            nowHour > Number(list[i].time) &&
            nowHour < Number(list[i].time + 2)
          ) {
            this.currHour = list[i].time;
          }
        }
        const zeroTime = new Date(new Date().toLocaleDateString()).getTime();
        this.diffSeconds = Math.floor(
          (zeroTime +
            3600 * 1000 * (this.currHour + 2) -
            new Date().getTime()) /
            1000
        );
        this.interval = setInterval(() => {
          this.diffSeconds--;
        }, 1000);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.seckill-wrap {
  width: 100%;
}

.desc {
  color: $theme_color;
  font-size: 12px;
  line-height: 1.5;
  padding: 0 0 8px;
}

.seckill {
  width: 100%;
  height: 260px;
  display: flex;
  background-color: #fff;
  box-sizing: border-box;
}

.aside {
  flex-shrink: 0;
  overflow: hidden;
  width: 190px;
  height: 100%;
  color: #fff;
  background-image: url("../../../assets/seckillBg.png");
  background-repeat: no-repeat;
  background-position: center top;

  .title {
    width: 100%;
    text-align: center;
    font-size: 28px;
    margin-top: 31px;
  }

  .time-block {
    margin-top: 78px;
    text-align: center;
  }

  .hour {
    text-align: center;

    span {
      font-size: 18px;
    }
  }

  .count-down {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    > span {
      position: relative;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background-color: #2f3430;
      margin-right: 20px;
      color: white;
      font-size: 20px;

      &::after {
        content: ":";
        position: absolute;
        right: -20px;
        font-weight: bolder;
        font-size: 18px;
        width: 20px;
        top: 0;
      }
    }

    > span:last-child {
      margin-right: 0;

      &::after {
        content: "";
      }
    }
  }

  .act-status {
    margin-top: 10px;
    font-size: 20px;
  }
}

.section {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: #fff;

  .seckill-list {
    display: flex;
    height: 100%;
    min-width: min-content;
  }

  .seckill-item {
    flex: 0 0 200px;
    height: 100%;

    .content {
      width: 200px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position: relative;
      box-sizing: border-box;

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        right: 0;
        width: 1px;
        height: 200px;
        transform: translateY(-50%);
        background: linear-gradient(180deg, white, #eeeeee, white);
      }

      img {
        margin-top: 24px;
      }

      .ellipsis {
        width: 160px;
        margin-top: 10px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .price-row {
        width: 160px;
        margin-top: 10px;
        border: 1px solid $theme_color;
        line-height: 24px;
        display: flex;
        text-align: center;
        overflow: hidden;

        span:nth-child(1) {
          color: #fff;
          font-size: 16px;
          flex: 1;
          min-width: 0;
          background-color: $theme_color;
        }

        span:nth-child(2) {
          color: #999;
          width: 66px;
          flex-shrink: 0;
          text-decoration: line-through;
        }
      }
    }
  }
}
</style>
