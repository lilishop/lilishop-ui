<template>
  <div class="data-report">
    <div class="report-header">
      <div>
        <h4 class="page-title">数据报表</h4>
        <p class="page-desc">选择报表模块，查看本店销售数据统计与分析</p>
      </div>
      <span class="module-count">共 {{ modules.length }} 个报表</span>
    </div>

    <div class="module-grid">
      <div
        v-for="item in modules"
        :key="item.name"
        class="module-card"
        :style="{ '--accent': item.color, '--accent-bg': item.bg }"
        role="link"
        tabindex="0"
        @click="goReport(item.name)"
        @keyup.enter="goReport(item.name)"
      >
        <div class="module-top">
          <div class="module-icon">
            <el-icon :size="28">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="module-body">
            <div class="module-title">{{ item.title }}</div>
            <div class="module-desc">{{ item.desc }}</div>
          </div>
        </div>

        <div class="module-tags">
          <span v-for="tag in item.tags" :key="tag" class="module-tag">{{ tag }}</span>
        </div>

        <div class="module-footer">
          <span>查看报表</span>
          <el-icon class="module-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  ArrowRight,
  DataAnalysis,
  Document,
  Goods,
  TrendCharts,
} from "@element-plus/icons-vue";

defineOptions({ name: "seller-data-report" });

const router = useRouter();

const REPORT_MODULES = [
  {
    name: "storePerformanceReport",
    title: "店铺业绩报表",
    desc: "支付金额、营业额、转化率及同环比分析",
    tags: ["支付金额", "转化率", "同环比"],
    icon: TrendCharts,
    color: "#409eff",
    bg: "#ecf5ff",
  },
  {
    name: "goodsComparisonReport",
    title: "商品同比环比报表",
    desc: "商品销售金额、销量占比及同环比对比",
    tags: ["销售金额", "销量占比", "同环比"],
    icon: DataAnalysis,
    color: "#67c23a",
    bg: "#f0f9eb",
  },
  {
    name: "salesOrderDetailReport",
    title: "销售订单明细报表",
    desc: "订单流水、收款明细与优惠明细",
    tags: ["订单流水", "收款明细", "优惠明细"],
    icon: Document,
    color: "#e6a23c",
    bg: "#fdf6ec",
  },
  {
    name: "goodsSalesSummaryReport",
    title: "商品销售汇总报表",
    desc: "商品销量、净销售额及优惠汇总",
    tags: ["商品销量", "净销售额", "优惠汇总"],
    icon: Goods,
    color: "#9b6dff",
    bg: "#f4effe",
  },
];

// 图标组件为静态常量，不能放进 ref/reactive（否则 Vue 会警告组件被转成响应式对象）
const modules = REPORT_MODULES;

function goReport(name) {
  router.push({ name });
}
</script>

<style scoped lang="scss">
.data-report {
  padding: 4px 0;

  .report-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 20px 24px;
    margin-bottom: 16px;
    border-radius: 8px;
    background: #fff;
    border-left: 4px solid var(--el-color-primary);
  }

  .page-title {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }

  .module-count {
    font-size: 13px;
    color: #909399;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .module-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 24px 18px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    outline: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

    // 顶部强调色条
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--accent);
      opacity: 0.85;
    }

    &:hover,
    &:focus-visible {
      transform: translateY(-3px);
      border-color: var(--accent);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

      .module-arrow {
        transform: translateX(4px);
      }
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  .module-top {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .module-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    color: var(--accent);
    background: var(--accent-bg);
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
    line-height: 1.6;
    color: #909399;
  }

  .module-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .module-tag {
    padding: 2px 10px;
    font-size: 12px;
    line-height: 20px;
    border-radius: 10px;
    color: var(--accent);
    background: var(--accent-bg);
  }

  .module-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px dashed #ebeef5;
    font-size: 13px;
    color: var(--accent);
  }

  .module-arrow {
    transition: transform 0.2s ease;
  }
}

@media (max-width: 640px) {
  .data-report {
    .report-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .module-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
