<template>
  <div class="wrapper">
    <el-card class="card">
      <h4>积分分析</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in metricList" :key="item.key">
          <div class="metric-label">
            <span>{{ item.label }}</span>
            <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
              <el-icon class="metric-tip"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-value">
            <template v-if="item.isRate">
              {{ formatPercent(overview[item.key]) }}
            </template>
            <template v-else>
              {{ formatNumber(overview[item.key]) }}
            </template>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <h4>客户可用积分分布</h4>
      <el-table :data="distributionList" stripe style="width: 100%">
        <el-table-column prop="pointRange" label="积分值区间" min-width="140" />
        <el-table-column prop="memberNum" label="客户数" min-width="120" />
        <el-table-column label="占比" min-width="120">
          <template #default="{ row }">
            {{ formatPercent(row.proportion) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="card">
      <h4>积分累计分发分布</h4>
      <el-table :data="sourceList" stripe style="width: 100%">
        <el-table-column prop="sourceName" label="发放途径" min-width="160" show-overflow-tooltip />
        <el-table-column prop="point" label="发送积分值" min-width="140" />
        <el-table-column label="发送占比" min-width="120">
          <template #default="{ row }">
            {{ formatPercent(row.proportion) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="card">
      <h4>客户身份积分累计统计</h4>
      <el-table :data="identityList" stripe style="width: 100%">
        <el-table-column prop="identity" label="客户身份" min-width="140" show-overflow-tooltip />
        <el-table-column prop="totalIssued" label="累计发送积分" min-width="130" />
        <el-table-column prop="usedPoint" label="累计消耗积分" min-width="130" />
        <el-table-column prop="available" label="可用积分" min-width="120" />
        <el-table-column label="可用积分占比" min-width="120">
          <template #default="{ row }">
            {{ formatPercent(row.proportion) }}
          </template>
        </el-table-column>
        <el-table-column label="人均可用积分" min-width="130">
          <template #default="{ row }">
            {{ formatNumber(row.avgAvailable) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as API_Statistics from "@/api/statistics";
import { QuestionFilled } from "@element-plus/icons-vue";

export default {
  components: { QuestionFilled },
  data() {
    return {
      overview: {},
      distributionList: [],
      sourceList: [],
      identityList: [],
      metricDefs: [
        {
          key: "totalIssued",
          label: "累积发放积分",
          isRate: false,
          tip: "累积发放积分：历史累计发放给客户的积分总数",
        },
        {
          key: "availablePoint",
          label: "可用积分",
          isRate: false,
          tip: "可用积分：当前客户账户中尚未消耗的积分总和",
        },
        {
          key: "usedPoint",
          label: "累积消耗积分",
          isRate: false,
          tip: "累积消耗积分：历史累计已消耗的积分",
        },
        {
          key: "usedRate",
          label: "积分消耗率",
          isRate: true,
          tip: "积分消耗率：累积消耗积分 / 累积发放积分",
        },
      ],
    };
  },
  computed: {
    metricList() {
      return this.metricDefs;
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    formatNumber(val) {
      if (val == null || val === "") return 0;
      const num = Number(val);
      if (Number.isNaN(num)) return val;
      return Math.round(num * 100) / 100;
    },
    formatPercent(val) {
      if (val == null || val === "") return "0%";
      const num = Number(val);
      if (Number.isNaN(num)) return val;
      return `${num}%`;
    },
    async loadData() {
      const [overviewRes, distributionRes, sourceRes, identityRes] = await Promise.all([
        API_Statistics.getPointsOverview(),
        API_Statistics.getPointsDistribution(),
        API_Statistics.getPointsSourceDistribution(),
        API_Statistics.getPointsIdentityStat(),
      ]);
      if (overviewRes && overviewRes.success) {
        this.overview = overviewRes.result || {};
      }
      if (distributionRes && distributionRes.success) {
        this.distributionList = distributionRes.result || [];
      }
      if (sourceRes && sourceRes.success) {
        this.sourceList = sourceRes.result || [];
      }
      if (identityRes && identityRes.success) {
        this.identityList = identityRes.result || [];
      }
    },
  },
};
</script>

<style scoped lang="scss">
.wrapper {
  padding-bottom: 40px;
}
.card {
  margin-bottom: 10px;
}
h4 {
  margin: 0 0 20px 0;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
