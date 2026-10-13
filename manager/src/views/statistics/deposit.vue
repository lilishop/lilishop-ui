<template>
  <div class="wrapper">
    <el-card class="card">
      <h4>储值余额分布</h4>
      <div id="depositBalanceChart"></div>
    </el-card>

    <el-card class="card">
      <h4>充值次数分布</h4>
      <div id="depositTimesChart"></div>
    </el-card>

    <el-card class="card">
      <h4>充值金额分布</h4>
      <div id="depositAmountChart"></div>
    </el-card>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive } from "vue";
import * as API_Statistics from "@/api/statistics";
import { Chart } from "@antv/g2";

const charts = reactive({
  balanceChart: null,
  timesChart: null,
  amountChart: null,
});

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  destroyCharts();
});

function destroyCharts() {
  ["balanceChart", "timesChart", "amountChart"].forEach((key) => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });
}
function withProportion(list) {
  const rows = list || [];
  const total = rows.reduce((sum, item) => sum + (Number(item.memberNum) || 0), 0);
  return rows.map((item) => {
    const num = Number(item.memberNum) || 0;
    const proportion = total > 0 ? Math.round((num / total) * 10000) / 100 : 0;
    return {
      label: item.label,
      memberNum: num,
      proportion,
    };
  });
}
function renderBarChart(chartKey, containerId, data, xTitle) {
  if (charts[chartKey]) {
    charts[chartKey].destroy();
    charts[chartKey] = null;
  }
  nextTick(() => {
    const chart = new Chart({
      container: containerId,
      autoFit: true,
      height: 320,
      padding: [40, 40, 50, 60],
    });
    chart.data(data || []);
    chart.scale("memberNum", {
      nice: true,
      min: 0,
      alias: "客户数",
    });
    chart.axis("label", {
      title: {
        text: xTitle,
      },
    });
    chart.tooltip({
      showMarkers: false,
      shared: true,
    });
    chart
      .interval()
      .position("label*memberNum")
      .color("#409EFF")
      .label("memberNum", {
        offset: 8,
      })
      .tooltip("label*memberNum*proportion", (label, memberNum, proportion) => ({
        name: label,
        value: `${memberNum}人（${proportion}%）`,
      }));
    chart.interaction("active-region");
    chart.render();
    charts[chartKey] = chart;
  });
}
async function loadData() {
  const [balanceRes, timesRes, amountRes] = await Promise.all([
    API_Statistics.getDepositBalanceDistribution(),
    API_Statistics.getDepositRechargeTimesDistribution(),
    API_Statistics.getDepositRechargeAmountDistribution(),
  ]);
  if (balanceRes && balanceRes.success) {
    renderBarChart(
      "balanceChart",
      "depositBalanceChart",
      withProportion(balanceRes.result || []),
      "余额区间(元)"
    );
  }
  if (timesRes && timesRes.success) {
    renderBarChart(
      "timesChart",
      "depositTimesChart",
      withProportion(timesRes.result || []),
      "充值次数区间"
    );
  }
  if (amountRes && amountRes.success) {
    renderBarChart(
      "amountChart",
      "depositAmountChart",
      withProportion(amountRes.result || []),
      "累计充值金额区间(元)"
    );
  }
}
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
</style>
