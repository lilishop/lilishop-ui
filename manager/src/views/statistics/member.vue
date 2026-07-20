<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <h4>会员概况</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in metricList" :key="item.key">
          <div class="metric-label">
            <span>{{ item.label }}</span>
            <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
              <el-icon class="metric-tip"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-value">
            <template v-if="item.isMoney">
              {{ $filters.unitPrice(metricCurrent(item.metric), "￥") }}
            </template>
            <template v-else>
              {{ formatCount(item.metric) }}
            </template>
          </div>
          <div class="metric-rate" :class="rateClass(item.metric)">
            环比 {{ rateText(item.metric) }}
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <h4>会员人数趋势图</h4>
      <div id="memberTrendChart"></div>
    </el-card>

    <el-card class="card">
      <h4>客户分析</h4>
      <div class="analysis-grid">
        <div class="analysis-item">
          <div class="metric-label">活跃客户数</div>
          <div class="metric-value">{{ analysis.activeMemberNum || 0 }}</div>
        </div>
        <div class="analysis-item">
          <div class="metric-label">复购率</div>
          <div class="metric-value">{{ formatPercent(analysis.repurchaseRate) }}</div>
        </div>
        <div class="analysis-item">
          <div class="metric-label">新客占比</div>
          <div class="metric-value">{{ formatPercent(analysis.newCustomerRatio) }}</div>
        </div>
        <div class="analysis-item">
          <div class="metric-label">老客占比</div>
          <div class="metric-value">{{ formatPercent(analysis.oldCustomerRatio) }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <h4>客户分布</h4>
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <div class="rank-title">性别分布</div>
          <el-table :data="genderList" stripe style="width: 100%">
            <el-table-column label="性别" min-width="100">
              <template #default="{ row }">
                {{ sexText(row.sex) }}
              </template>
            </el-table-column>
            <el-table-column prop="num" label="客户数" min-width="100" />
            <el-table-column label="占比" min-width="100">
              <template #default="{ row }">
                {{ formatPercent(row.proportion) }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="rank-title">地域分布</div>
          <el-table :data="regionList" stripe style="width: 100%" max-height="360">
            <el-table-column prop="region" label="地域" min-width="140" show-overflow-tooltip />
            <el-table-column prop="num" label="客户数" min-width="100" />
            <el-table-column label="占比" min-width="100">
              <template #default="{ row }">
                {{ formatPercent(row.proportion) }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import * as API_Statistics from "@/api/statistics";
import affixTime from "@/components/affix-time";
import { QuestionFilled } from "@element-plus/icons-vue";
import { Chart } from "@antv/g2";

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
      analysis: {},
      genderList: [],
      regionList: [],
      trendChart: null,
      metricDefs: [
        {
          key: "totalMemberNum",
          label: "累积会员数",
          isMoney: false,
          tip: "累积会员数：合计会员数量",
        },
        {
          key: "newMemberNum",
          label: "新增会员数",
          isMoney: false,
          tip: "新增会员数：周期内新增的会员数量",
        },
        {
          key: "payMemberNum",
          label: "支付会员数",
          isMoney: false,
          tip: "支付会员数：周期内支付的会员数量",
        },
        {
          key: "rechargeMemberNum",
          label: "储值会员数",
          isMoney: false,
          tip: "储值会员数：周期内充值的会员数量",
        },
        {
          key: "payAmount",
          label: "会员支付金额",
          isMoney: true,
          tip: "会员支付金额：周期内会员支付的金额，四舍五入保留2位小数",
        },
        {
          key: "payOrderNum",
          label: "会员支付订单数",
          isMoney: false,
          tip: "会员支付订单数：周期内会员支付的订单数量",
        },
        {
          key: "customerPrice",
          label: "会员客单价",
          isMoney: true,
          tip: "会员客单价：周期内支付金额/支付人数，四舍五入保留2位小数",
        },
      ],
    };
  },
  computed: {
    metricList() {
      return this.metricDefs.map((def) => ({
        ...def,
        metric: this.overview[def.key] || {},
      }));
    },
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
  beforeUnmount() {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
  },
  methods: {
    clickBreadcrumb(item) {
      this.params = {
        ...this.params,
        searchType: item.searchType || "",
        year: item.year || "",
        month: item.month || "",
        storeId: item.storeId || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
      };
    },
    metricCurrent(metric) {
      if (!metric || metric.current == null) return 0;
      return Number(metric.current) || 0;
    },
    formatCount(metric) {
      return Math.round(this.metricCurrent(metric));
    },
    rateText(metric) {
      if (!metric || !metric.rate) return "0%";
      return metric.rate;
    },
    rateClass(metric) {
      const trend = metric && metric.trend;
      if (trend === "UP") return "up";
      if (trend === "DOWN") return "down";
      return "flat";
    },
    formatPercent(val) {
      if (val == null || val === "") return "0%";
      const num = Number(val);
      if (Number.isNaN(num)) return val;
      return `${num}%`;
    },
    sexText(sex) {
      if (sex === 1 || sex === "1") return "男";
      if (sex === 0 || sex === "0") return "女";
      return "未知";
    },
    formatTrendDate(val) {
      if (!val) return "";
      if (typeof val === "string") return val.slice(0, 10);
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      const m = `${d.getMonth() + 1}`.padStart(2, "0");
      const day = `${d.getDate()}`.padStart(2, "0");
      return `${d.getFullYear()}-${m}-${day}`;
    },
    renderTrendChart(list) {
      const chartData = (list || []).map((item) => ({
        date: this.formatTrendDate(item.date),
        newlyAdded: Number(item.newlyAdded) || 0,
        title: "新增会员数",
      }));
      if (this.trendChart) {
        this.trendChart.destroy();
        this.trendChart = null;
      }
      this.$nextTick(() => {
        this.trendChart = new Chart({
          container: "memberTrendChart",
          autoFit: true,
          height: 360,
          padding: [40, 40, 50, 50],
        });
        this.trendChart.data(chartData);
        this.trendChart.scale({
          newlyAdded: {
            nice: true,
            min: 0,
          },
        });
        this.trendChart.tooltip({
          showCrosshairs: true,
          shared: true,
        });
        this.trendChart
          .line()
          .position("date*newlyAdded")
          .color("title")
          .shape("smooth");
        this.trendChart
          .point()
          .position("date*newlyAdded")
          .color("title")
          .shape("circle")
          .style({
            stroke: "#fff",
            lineWidth: 1,
          });
        this.trendChart.render();
      });
    },
    async loadData() {
      const query = { ...this.params };
      const [overviewRes, analysisRes, genderRes, regionRes, trendRes] = await Promise.all([
        API_Statistics.getMemberOverview(query),
        API_Statistics.getMemberAnalysis(query),
        API_Statistics.getMemberGenderDistribution(),
        API_Statistics.getMemberRegionDistribution(),
        API_Statistics.getMemberNewTrend(query),
      ]);
      if (overviewRes && overviewRes.success) {
        this.overview = overviewRes.result || {};
      }
      if (analysisRes && analysisRes.success) {
        this.analysis = analysisRes.result || {};
      }
      if (genderRes && genderRes.success) {
        this.genderList = genderRes.result || [];
      }
      if (regionRes && regionRes.success) {
        this.regionList = regionRes.result || [];
      }
      if (trendRes && trendRes.success) {
        this.renderTrendChart(trendRes.result || []);
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
.metric-grid,
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.metric-item,
.analysis-item {
  background: #f3f5f7;
  border-radius: 8px;
  padding: 20px 16px;
  min-height: 110px;
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
  margin-bottom: 8px;
}
.metric-rate {
  font-size: 13px;
  font-weight: 600;
}
.metric-rate.up {
  color: #f5222d;
}
.metric-rate.down {
  color: #52c41a;
}
.metric-rate.flat {
  color: #999;
}
.rank-title {
  font-weight: 700;
  margin-bottom: 12px;
}
@media (max-width: 1200px) {
  .metric-grid,
  .analysis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .rank-title {
    margin-top: 16px;
  }
}
</style>
