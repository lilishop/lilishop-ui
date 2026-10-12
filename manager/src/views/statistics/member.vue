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

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as API_Statistics from "@/api/statistics";
import affixTime from "@/components/affix-time";
import { QuestionFilled } from "@element-plus/icons-vue";
import { Chart } from "@antv/g2";

const params = ref({
  searchType: "LAST_SEVEN",
  year: "",
  month: "",
  storeId: "",
});
const overview = ref({});
const analysis = ref({});
const genderList = ref([]);
const regionList = ref([]);
const trendChart = ref(null);
const metricDefs = ref([
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
]);

const metricList = computed(() =>
  metricDefs.value.map((def) => ({
    ...def,
    metric: overview.value[def.key] || {},
  }))
);

watch(
  params,
  () => {
    loadData();
  },
  { deep: true }
);

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  if (trendChart.value) {
    trendChart.value.destroy();
    trendChart.value = null;
  }
});

function clickBreadcrumb(item) {
  params.value = {
    ...params.value,
    searchType: item.searchType || "",
    year: item.year || "",
    month: item.month || "",
    storeId: item.storeId || "",
    startTime: item.startTime || "",
    endTime: item.endTime || "",
  };
}

function metricCurrent(metric) {
  if (!metric || metric.current == null) return 0;
  return Number(metric.current) || 0;
}

function formatCount(metric) {
  return Math.round(metricCurrent(metric));
}

function rateText(metric) {
  if (!metric || !metric.rate) return "0%";
  return metric.rate;
}

function rateClass(metric) {
  const trend = metric && metric.trend;
  if (trend === "UP") return "up";
  if (trend === "DOWN") return "down";
  return "flat";
}

function formatPercent(val) {
  if (val == null || val === "") return "0%";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  return `${num}%`;
}

function sexText(sex) {
  if (sex === 1 || sex === "1") return "男";
  if (sex === 0 || sex === "0") return "女";
  return "未知";
}

function formatTrendDate(val) {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function renderTrendChart(list) {
  const chartData = (list || []).map((item) => ({
    date: formatTrendDate(item.date),
    newlyAdded: Number(item.newlyAdded) || 0,
    title: "新增会员数",
  }));
  if (trendChart.value) {
    trendChart.value.destroy();
    trendChart.value = null;
  }
  nextTick(() => {
    const container = document.getElementById("memberTrendChart");
    if (!container) return;
    trendChart.value = new Chart({
      container: "memberTrendChart",
      autoFit: true,
      height: 360,
      padding: [40, 40, 50, 50],
    });
    trendChart.value.data(chartData);
    trendChart.value.scale({
      newlyAdded: {
        nice: true,
        min: 0,
      },
    });
    trendChart.value.tooltip({
      showCrosshairs: true,
      shared: true,
    });
    trendChart.value
      .line()
      .position("date*newlyAdded")
      .color("title")
      .shape("smooth");
    trendChart.value
      .point()
      .position("date*newlyAdded")
      .color("title")
      .shape("circle")
      .style({
        stroke: "#fff",
        lineWidth: 1,
      });
    trendChart.value.render();
  });
}

async function loadData() {
  const query = { ...params.value };
  const [overviewRes, analysisRes, genderRes, regionRes, trendRes] = (
    await Promise.allSettled([
      API_Statistics.getMemberOverview(query),
      API_Statistics.getMemberAnalysis(query),
      API_Statistics.getMemberGenderDistribution(),
      API_Statistics.getMemberRegionDistribution(),
      API_Statistics.getMemberNewTrend(query),
    ])
  ).map((r) => (r.status === "fulfilled" ? r.value : null));
  if (overviewRes && overviewRes.success) {
    overview.value = overviewRes.result || {};
  }
  if (analysisRes && analysisRes.success) {
    analysis.value = analysisRes.result || {};
  }
  if (genderRes && genderRes.success) {
    genderList.value = genderRes.result || [];
  }
  if (regionRes && regionRes.success) {
    regionList.value = regionRes.result || [];
  }
  if (trendRes && trendRes.success) {
    renderTrendChart(trendRes.result || []);
  }
}
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
