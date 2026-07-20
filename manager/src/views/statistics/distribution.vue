<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <h4>分销概况</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in metricDefs" :key="item.key">
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

    <el-card class="card">
      <h4>分销排行</h4>
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <div class="rank-title">TOP分销员</div>
          <el-table :data="distributorRank" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column prop="name" label="分销员" min-width="140" show-overflow-tooltip />
            <el-table-column label="佣金" min-width="120">
              <template #default="{ row }">
                {{ $filters.unitPrice(row.amount || 0, "￥") }}
              </template>
            </el-table-column>
            <el-table-column prop="num" label="订单数" min-width="100" />
          </el-table>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="rank-title">TOP分销商品</div>
          <el-table :data="goodsRank" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column prop="name" label="商品" min-width="160" show-overflow-tooltip />
            <el-table-column label="佣金" min-width="120">
              <template #default="{ row }">
                {{ $filters.unitPrice(row.amount || 0, "￥") }}
              </template>
            </el-table-column>
            <el-table-column prop="num" label="销量" min-width="100" />
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
      distributorRank: [],
      goodsRank: [],
      metricDefs: [
        { key: "distributorNum", label: "分销员数", tip: "已通过审核的分销员数量" },
        { key: "applyNum", label: "待审核分销员", tip: "申请中待审核的分销员数量" },
        { key: "distributionOrderNum", label: "分销订单数", tip: "周期内分销订单笔数" },
        {
          key: "distributionOrderAmount",
          label: "分销订单金额",
          isMoney: true,
          tip: "周期内分销订单佣金合计",
        },
        {
          key: "settledCommission",
          label: "已结算佣金",
          isMoney: true,
          tip: "周期内已完成结算的佣金",
        },
        {
          key: "pendingCommission",
          label: "待结算佣金",
          isMoney: true,
          tip: "周期内待结算的佣金",
        },
        {
          key: "cashAmount",
          label: "提现金额",
          isMoney: true,
          tip: "周期内分销员提现金额",
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
      const query = { ...this.params };
      const [overviewRes, distributorRes, goodsRes] = await Promise.all([
        API_Statistics.getDistributionOverview(query),
        API_Statistics.getDistributionRankDistributor(query),
        API_Statistics.getDistributionRankGoods(query),
      ]);
      if (overviewRes && overviewRes.success) {
        this.overview = overviewRes.result || {};
      }
      if (distributorRes && distributorRes.success) {
        this.distributorRank = distributorRes.result || [];
      }
      if (goodsRes && goodsRes.success) {
        this.goodsRank = goodsRes.result || [];
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
.rank-title {
  font-weight: 700;
  margin-bottom: 12px;
}
@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .rank-title {
    margin-top: 16px;
  }
}
</style>
