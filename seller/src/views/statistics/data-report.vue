<template>
  <div class="data-report">
    <el-card>
      <h4 class="page-title">数据报表</h4>
      <p class="page-desc">选择报表模块查看本店销售数据统计与分析</p>
      <div class="module-grid">
        <div
          v-for="item in modules"
          :key="item.name"
          class="module-card"
          @click="goReport(item.name)"
        >
          <div class="module-icon">
            <el-icon :size="32">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="module-body">
            <div class="module-title">{{ item.title }}</div>
            <div class="module-desc">{{ item.desc }}</div>
          </div>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  ArrowRight,
  DataAnalysis,
  Document,
  Goods,
  TrendCharts,
} from "@element-plus/icons-vue";

const REPORT_MODULES = [
  {
    name: "storePerformanceReport",
    title: "店铺业绩报表",
    desc: "支付金额、营业额、转化率及同环比分析",
    icon: TrendCharts,
  },
  {
    name: "goodsComparisonReport",
    title: "商品同比环比报表",
    desc: "商品销售金额、销量占比及同环比对比",
    icon: DataAnalysis,
  },
  {
    name: "salesOrderDetailReport",
    title: "销售订单明细报表",
    desc: "订单流水、收款明细与优惠明细",
    icon: Document,
  },
  {
    name: "goodsSalesSummaryReport",
    title: "商品销售汇总报表",
    desc: "商品销量、净销售额及优惠汇总",
    icon: Goods,
  },
];

export default {
  name: "seller-data-report",
  components: {
    ArrowRight,
    TrendCharts,
    DataAnalysis,
    Document,
    Goods,
  },
  data() {
    return {
      modules: REPORT_MODULES,
    };
  },
  methods: {
    goReport(name) {
      this.$router.push({ name });
    },
  },
};
</script>

<style scoped lang="scss">
.data-report {
  .page-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .page-desc {
    margin: 0 0 20px;
    font-size: 14px;
    color: #909399;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .module-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
  }

  .module-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    flex-shrink: 0;
  }

  .module-body {
    flex: 1;
    min-width: 0;
  }

  .module-title {
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .module-desc {
    font-size: 13px;
    line-height: 1.5;
    color: #909399;
  }

  .module-arrow {
    color: #c0c4cc;
    flex-shrink: 0;
  }
}
</style>
