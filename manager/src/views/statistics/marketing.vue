<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <h4>营销活动</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in activityMetrics" :key="item.key">
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value">{{ formatNumber(overview[item.key]) }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <h4>优惠券与优惠</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in couponMetrics" :key="item.key">
          <div class="metric-label">
            <span>{{ item.label }}</span>
            <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
              <el-icon class="metric-tip"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-value">
            <template v-if="item.isMoney">
              {{ $filters.unitPrice(overview[item.key] || 0, "￥") }}
            </template>
            <template v-else>
              {{ formatNumber(overview[item.key]) }}
            </template>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as API_Statistics from "@/api/statistics";
import affixTime from "@/components/affix-time";
import { QuestionFilled } from "@element-plus/icons-vue";

export default {
  components: { affixTime, QuestionFilled },
  data() {
    return {
      params: {
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
        storeId: "",
      },
      overview: {},
      activityMetrics: [
        { key: "couponActiveNum", label: "进行中优惠券" },
        { key: "seckillActiveNum", label: "进行中秒杀" },
        { key: "pintuanActiveNum", label: "进行中拼团" },
        { key: "fullDiscountActiveNum", label: "进行中满减" },
        { key: "kanjiaActiveNum", label: "进行中砍价商品" },
        { key: "pointsGoodsActiveNum", label: "进行中积分商品" },
      ],
      couponMetrics: [
        {
          key: "couponPublishNum",
          label: "优惠券发放量",
          tip: "优惠券配置的累计发放数量",
        },
        {
          key: "couponReceivedNum",
          label: "优惠券领取量",
          tip: "客户已领取的优惠券数量",
        },
        {
          key: "couponUsedNum",
          label: "优惠券核销量",
          tip: "客户已使用的优惠券数量",
        },
        {
          key: "discountAmount",
          label: "活动优惠总额",
          isMoney: true,
          tip: "统计周期内订单产生的优惠金额合计",
        },
      ],
    };
  },
  watch: {
    params: {
      handler() {
        this.loadData();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    clickBreadcrumb(item) {
      this.params = {
        searchType: item.searchType || "",
        year: item.year || "",
        month: item.month || "",
        storeId: item.storeId || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
      };
    },
    formatNumber(val) {
      if (val == null || val === "") return 0;
      const num = Number(val);
      return Number.isNaN(num) ? 0 : Math.round(num);
    },
    async loadData() {
      const res = await API_Statistics.getMarketingOverview({ ...this.params });
      if (res && res.success) {
        this.overview = res.result || {};
      }
    },
  },
};
</script>

<style scoped lang="scss">
.wrapper {
  padding-bottom: 200px;
}
.card {
  margin-bottom: 10px;
}
h4 {
  margin: 0 0 20px 0;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.metric-item {
  background: #f3f5f7;
  border-radius: 8px;
  padding: 20px 16px;
  min-height: 90px;
}
.metric-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}
.metric-tip {
  font-size: 14px;
  color: #999;
  cursor: pointer;
}
.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: $theme_color;
}
@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
