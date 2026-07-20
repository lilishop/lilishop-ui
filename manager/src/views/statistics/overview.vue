<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <h4>营业概况</h4>
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
      <h4>收款构成</h4>
      <el-table :data="sourceList" stripe style="width: 100%">
        <el-table-column prop="payType" label="支付方式" min-width="120" />
        <el-table-column label="收款合计" min-width="140">
          <template #default="{ row }">
            {{ $filters.unitPrice(row.total || 0, "￥") }}
          </template>
        </el-table-column>
        <el-table-column label="营业收入" min-width="140">
          <template #default="{ row }">
            {{ $filters.unitPrice(row.income || 0, "￥") }}
          </template>
        </el-table-column>
        <el-table-column label="新增储值金额" min-width="140">
          <template #default="{ row }">
            {{ $filters.unitPrice(row.recharge || 0, "￥") }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="card">
      <h4>营业构成</h4>
      <div class="composition-sections">
        <div class="composition-block">
          <div class="block-title">订单分类构成</div>
          <div class="block-row">
            <span>到店自提</span>
            <span>{{ $filters.unitPrice(composition.storeSelf || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>快递发货</span>
            <span>{{ $filters.unitPrice(composition.express || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>线上无需配送</span>
            <span>{{ $filters.unitPrice(composition.online || 0, "￥") }}</span>
          </div>
        </div>
        <div class="composition-block">
          <div class="block-title">营业收入</div>
          <div class="block-row">
            <span>商品销售</span>
            <span>{{ $filters.unitPrice(composition.income || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>运费</span>
            <span>{{ $filters.unitPrice(composition.freight || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>商品返现（分销返佣）</span>
            <span>{{ $filters.unitPrice(composition.incomeBack || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>商品销售+费用构成</span>
            <span>{{ $filters.unitPrice(composition.incomeComposition || 0, "￥") }}</span>
          </div>
        </div>
        <div class="composition-block">
          <div class="block-title">退款统计</div>
          <div class="block-row">
            <span>退款订单笔数</span>
            <span>{{ composition.refundOrderNum || 0 }}</span>
          </div>
          <div class="block-row">
            <span>退款金额</span>
            <span>{{ $filters.unitPrice(composition.refund || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>退款率</span>
            <span>{{ formatPercent(composition.refundRate) }}</span>
          </div>
        </div>
        <div class="composition-block">
          <div class="block-title">消费指标</div>
          <div class="block-row">
            <span>支付金额</span>
            <span>{{ $filters.unitPrice(composition.pay || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>折后笔单价</span>
            <span>{{ $filters.unitPrice(composition.price || 0, "￥") }}</span>
          </div>
          <div class="block-row">
            <span>支付人数</span>
            <span>{{ composition.payNum || 0 }}</span>
          </div>
          <div class="block-row">
            <span>折后客单价</span>
            <span>{{ $filters.unitPrice(composition.priceNum || 0, "￥") }}</span>
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
      sourceList: [],
      composition: {},
      metricDefs: [
        {
          key: "income",
          label: "营业收入",
          isCount: false,
          tip: "营业收入：订单扣除退款折扣后金额（不含储值充值）",
        },
        {
          key: "turnover",
          label: "营业额",
          isCount: false,
          tip: "营业额：营业额=营业收入+优惠金额，订单扣除退款折扣前金额（不含储值充值）",
        },
        {
          key: "discount",
          label: "优惠金额",
          isCount: false,
          tip: "优惠金额：订单的优惠金额（扣除退款，不含储值充值）",
        },
        {
          key: "incomeNoStoreValue",
          label: "营业收入不含充值",
          isCount: false,
          tip: "营业收入不含储值金额：订单扣除退款折扣后金额（不含储值充值）",
        },
        {
          key: "payOrderNum",
          label: "支付订单数",
          isCount: true,
          tip: "支付订单数：按客户支付完成时间统计的成功付款的订单数（不含退款、储值充值）",
        },
        {
          key: "recharge",
          label: "新增充值金额",
          isCount: false,
          tip: "新增充值金额：按客户支付完成时间统计的客户储值充值本金金额",
        },
        {
          key: "rechargeUse",
          label: "使用充值金额",
          isCount: false,
          tip: "使用储值支付本金金额：统计时间范围内，支付和退款成功的订单中，使用储值支付且扣除退款的金额",
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
    async loadData() {
      const query = { ...this.params };
      const [overviewRes, sourceRes, compositionRes] = await Promise.all([
        API_Statistics.getBusinessOverview(query),
        API_Statistics.getBusinessSource(query),
        API_Statistics.getBusinessComposition(query),
      ]);
      if (overviewRes && overviewRes.success) {
        this.overview = overviewRes.result || {};
      }
      if (sourceRes && sourceRes.success) {
        this.sourceList = sourceRes.result || [];
      }
      if (compositionRes && compositionRes.success) {
        this.composition = compositionRes.result || {};
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
.composition-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.composition-block {
  background: #f3f5f7;
  border-radius: 8px;
  padding: 16px;
}
.block-title {
  font-weight: 700;
  margin-bottom: 12px;
}
.block-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px dashed #e5e5e5;
}
.block-row:last-child {
  border-bottom: none;
}
@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .composition-sections {
    grid-template-columns: 1fr;
  }
}
</style>
