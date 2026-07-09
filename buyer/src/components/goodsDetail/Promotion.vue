<template>
  <div>
    <div class="wrapper" v-if="type === 'goodsDetail'">
      <div class="wr-l"><el-icon :size="23"><AlarmClock /></el-icon> 秒杀活动</div>
      <div class="count-down" v-if="end === ''">
        <span class="count-down-label">倒计时：</span>
        <span class="count-down-num">{{ hours }}</span>
        <span class="count-down-colon">:</span>
        <span class="count-down-num">{{ minutes }}</span>
        <span class="count-down-colon">:</span>
        <span class="count-down-num">{{ seconds }}</span>
      </div>
      <div v-else>{{end}}</div>
    </div>
    <span v-else class="cart-promotion">
      <span v-if="end === ''">距活动结束：<span>{{ hours }}</span> : <span>{{ minutes }}</span> : <span>{{ seconds }}</span></span>
      <span v-else>活动已结束</span>
    </span>
  </div>
</template>
<script>
import { AlarmClock } from '@element-plus/icons-vue';
export default {
  components: { AlarmClock },
  props: {
    time: { // 传入的初始时间
      default: 1718977559428
    },
    type: { // 区分是在详情还是购物车调用
      default: 'goodsDetail', // 设置两个值，goodsDetail和cart，样式不同
      type: String
    }
  },
  data () {
    return {
      end: '', // 结束状态
      hours: '', // 小时
      minutes: '', // 分钟
      seconds: '', // 秒
      interval: '' // 定时器
    };
  },
  mounted () {
    this.init()
  },
  methods: {
    countDown (val) { // 倒计时方法
      function addZero (i) {
        return i < 10 ? '0' + i : i + '';
      }
      var nowtime = new Date();
      var endtime = new Date(val);
      var lefttime = parseInt((endtime.getTime() - nowtime.getTime()) / 1000);
      var h = parseInt((lefttime / (60 * 60)) % 24);
      var m = parseInt((lefttime / 60) % 60);
      var s = parseInt(lefttime % 60);
      h = addZero(h);
      m = addZero(m);
      s = addZero(s);
      this.hours = h;
      this.minutes = m
      this.seconds = s;
      if (lefttime <= 0) {
        this.end = `活动已结束`;
        clearInterval(this.interval)
      }
    },
    init () { // 初始化
      this.interval = setInterval(() => {
        this.countDown(this.time);
      }, 1000);
    }
  }
};
</script>
<style scoped lang="scss">
.cart-promotion{
  font-size: 13px;
  color: #999;
  margin-left: 10px;
}
.wrapper {
  background-image: linear-gradient(266deg, #ff0b33, #ff4257, #ff5f7c, #fa78a2);
  height: 32px;
  color: #fff;
  line-height: 32px;
  font-size: 16px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.wr-r{
  font-size: 13px;
}
.count-down {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  line-height: 1;

  .count-down-label {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .count-down-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 2px;
    background-color: #2f3430;
    color: #fff;
    font-size: 14px;
    line-height: 1;
    border-radius: 2px;
  }

  .count-down-colon {
    font-weight: bold;
    font-size: 14px;
    line-height: 1;
  }
}

</style>
