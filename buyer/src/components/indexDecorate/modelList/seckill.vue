<template>
  <div class="seckill">
    <div class="aside hover-pointer" @click="goPromotion">
      <div class="title">{{ actName }}</div>
      <div class="hour">
        <span>{{ currHour }}:00</span>点场 倒计时
      </div>
      <div class="count-down" v-if="actStatus === 1">
        <span>{{ hours }}</span
        ><span>{{ minutes }}</span
        ><span>{{ seconds }}</span>
      </div>
      <div class="act-status" v-else>
        {{ actStatus == 0 ? "未开始" : "已结束" }}
      </div>
    </div>
  </div>
</template>
<script>
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
export default {
  components: {
    Swiper,
    SwiperSlide
  },
  directives: {
    swiper: directive
  },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      list: [], // 秒杀商品
      actStatus: 0, // 0 未开始  1 进行中   2 已结束
      actName: '限时秒杀', // 活动名称
      currHour: '00', // 当前秒杀场
      diffSeconds: 0, // 倒计时秒数
      days: 0, // 天
      hours: 0, // 小时
      minutes: 0, // 分钟
      seconds: 0, // 秒
      interval: undefined, // 定时器
      swiperOptions: { // 轮播图参数
        slidesPerView: 5,
        autoplay: true,
        loop: true
      }
    };
  },
  mounted () {
    
  },
  beforeDestroy () {
    clearInterval(this.interval);
  },
  methods: {
    goPromotion () { // 跳转秒杀页面
      let routeUrl = this.$router.resolve({
        path: '/seckill'
      });
      window.open(routeUrl.href, '_blank');
    }
  }
};
</script>
<style lang="scss" scoped>
.seckill {
  width: 100%;
  height: 260px;
  display: flex;
  .aside {
    overflow: hidden;
    width: 190px;
    height: 100%;
    color: #fff;
    background-image: url("../../../assets/images/seckillBg.png");

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

  .section {
    width: 1000px;
    // background: #efefef;
    .swiper-slide {
      height: 260px;
      .content {
        width: 200px;
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
            position: relative;
            &::before {
              content: " ";
              width: 0;
              height: 0;
              border-color: transparent white transparent transparent;
              border-style: solid;
              border-width: 24px 8px 0 0;
              position: absolute;
              top: 0;
              left: 84px;
            }
          }

          span:nth-child(2) {
            color: #999;
            width: 66px;
            text-decoration: line-through;
          }
        }
      }
    }
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
