<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <h4>商品概况</h4>
      <div class="metric-grid">
        <div class="metric-item" v-for="item in metricList" :key="item.key">
          <div class="metric-label">
            <span>{{ item.label }}</span>
            <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
              <el-icon class="metric-tip"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="metric-value">
            <template v-if="item.isCount">
              {{ formatCount(item.metric) }}
            </template>
            <template v-else>
              {{ $filters.unitPrice(metricCurrent(item.metric), "￥") }}
            </template>
          </div>
          <div class="metric-rate" :class="rateClass(item.metric)">
            环比 {{ rateText(item.metric) }}
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <h4>商品排行</h4>
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <div class="rank-title">退货排行榜 TOP10</div>
          <el-table :data="refundRank" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column prop="skuName" label="商品名称" min-width="180" show-overflow-tooltip />
            <el-table-column label="退款金额" min-width="120">
              <template #default="{ row }">
                {{ $filters.unitPrice(row.amount || 0, "￥") }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="rank-title">畅销排行榜 TOP10</div>
          <el-table :data="salesRank" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="70" />
            <el-table-column prop="skuName" label="商品" min-width="180" show-overflow-tooltip />
            <el-table-column label="净销售额" min-width="120">
              <template #default="{ row }">
                {{ $filters.unitPrice(row.amount || 0, "￥") }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="card">
      <h4>分类排行</h4>
      <el-table :data="categoryRank" stripe style="width: 100%">
        <el-table-column prop="rank" label="排名" width="70" />
        <el-table-column prop="categoryName" label="分类名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="num" label="销售数量" min-width="120" />
        <el-table-column label="销售金额" min-width="140">
          <template #default="{ row }">
            {{ $filters.unitPrice(row.price || 0, "￥") }}
          </template>
        </el-table-column>
      </el-table>
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
      refundRank: [],
      salesRank: [],
      categoryRank: [],
      metricDefs: [
        {
          key: "netSalesAmount",
          label: "商品净销售金额",
          isCount: false,
          tip: "商品净销售金额=商品销售金额-商品退款金额（扣除退款，不包含储值充值、商品返现，运费）",
        },
        {
          key: "salePriceAmount",
          label: "商品售价金额",
          isCount: false,
          tip: "商品售价金额=商品净销售金额+商品优惠金额，统计时间范围内销售商品折前金额（扣除退款，不包含储值充值、商品返现，运费）",
        },
        {
          key: "discountAmount",
          label: "商品优惠金额",
          isCount: false,
          tip: "统计时间范围内，商品销售时的优惠金额（扣除退款，不包含储值充值、商品返现，运费）",
        },
        {
          key: "salesAmount",
          label: "商品销售金额",
          isCount: false,
          tip: "统计时间范围内，商品折扣后支付金额（不扣除退款，不包含储值充值、商品返现，运费）",
        },
        {
          key: "refundAmount",
          label: "商品退款金额",
          isCount: false,
          tip: "统计时间范围内，商品成功退款金额（不包含储值充值、商品返现，运费）",
        },
        {
          key: "netSalesNum",
          label: "商品净销售数量",
          isCount: true,
          tip: "商品净销售数量=商品销售数量-商品退货数量（含退款，不包含储值充值、商品返现，运费）",
        },
        {
          key: "salesNum",
          label: "商品销售数量",
          isCount: true,
          tip: "按客户支付完成时间统计的订单商品销售数量（包含商品下单，不包含储值充值）",
        },
        {
          key: "refundNum",
          label: "商品退货数量",
          isCount: true,
          tip: "按商家同意退款时间统计的退款单商品退货数量（不包含储值退款、商品返现，运费）",
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
    async loadData() {
      const query = { ...this.params };
      const categoryQuery = { ...query, type: "PRICE" };
      const [overviewRes, refundRes, salesRes, categoryRes] = await Promise.all([
        API_Statistics.getGoodsOverview(query),
        API_Statistics.getGoodsRefundRank(query),
        API_Statistics.getGoodsSalesRank(query),
        API_Statistics.getGoodsCategoryRank(categoryQuery),
      ]);
      if (overviewRes && overviewRes.success) {
        this.overview = overviewRes.result || {};
      }
      if (refundRes && refundRes.success) {
        this.refundRank = refundRes.result || [];
      }
      if (salesRes && salesRes.success) {
        this.salesRank = salesRes.result || [];
      }
      if (categoryRes && categoryRes.success) {
        const list = categoryRes.result || [];
        this.categoryRank = list.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
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
