<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime :closeShop="true" @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>
    <el-card class="card">
      <div>
        <h4>流量概况</h4>
      </div>
      <div class="box">
        <div class="box-item">
          <div>访客数UV</div>
          <div>{{ uvs || 0 }}</div>
        </div>
        <div class="box-item">
          <div>浏览量PV</div>
          <div>{{ pvs || 0 }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="card">
      <div>
        <h4>流量趋势</h4>
        <div id="orderChart"></div>
      </div>
    </el-card>

    <el-card class="card">
      <div>
        <h4>会员流量报表</h4>
        <el-table class="table" stripe :data="data" style="width: 100%">
          <el-table-column prop="date" label="日期" min-width="120" />
          <el-table-column prop="pvNum" label="浏览量" min-width="120" />
          <el-table-column prop="uvNum" label="访客数" min-width="120" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import affixTime from "@/views/lili-components/affix-time";
import * as API_Member from "@/api/member";

const uvs = ref(0);
const pvs = ref(0);
// G2 图表实例（原 data 中初始化为 ""）
const orderChart = ref("");
const params = ref({
  searchType: "LAST_SEVEN",
  year: "",
  month: "",
});
const data = ref([]);

watch(
  params,
  () => {
    uvs.value = 0;
    pvs.value = 0;
    init();
  },
  { deep: true }
);

function initChart() {
  const uv = [];
  const pv = [];

  data.value.forEach((item) => {
    uv.push({
      date: item.date,
      uvNum: item.uvNum,
      title: "访客数UV",
      pv: item.uvNum,
    });
    pv.push({
      date: item.date,
      pvNum: item.pvNum,
      pv: item.pvNum,
      title: "浏览量PV",
    });
  });

  const chartData = [...uv, ...pv];

  orderChart.value.data(chartData);
  orderChart.value.scale({
    activeQuantity: {
      range: [0, 1],
      nice: true,
    },
  });
  orderChart.value.tooltip({
    showCrosshairs: true,
    shared: true,
  });

  orderChart.value
    .line()
    .position("date*pv")
    .color("title")
    .label("pv")
    .shape("smooth");

  orderChart.value
    .point()
    .position("date*pv")
    .color("title")
    .label("pv")
    .shape("circle")
    .style({
      stroke: "#fff",
      lineWidth: 1,
    });
  orderChart.value.area().position("date*pv").color("title").shape("smooth");

  orderChart.value.render();
}

function clickBreadcrumb(item) {
  params.value = JSON.parse(JSON.stringify(item));
}

function init() {
  orderChart.value ? orderChart.value.clear() : "";
  API_Member.getStatisticsList(params.value).then(async (res) => {
    if (res.result) {
      data.value = res.result;
      res.result.forEach((item) => {
        uvs.value += item.uvNum;
        pvs.value += item.pvNum;
      });

      if (!orderChart.value) {
        const { Chart } = await import("@antv/g2");
        orderChart.value = new Chart({
          container: "orderChart",
          autoFit: true,
          height: 500,
          padding: [70, 70, 70, 70],
        });
      }
      initChart();
    }
  });
}

onMounted(() => {
  init();
});
</script>
<style scoped lang="scss">
.table {
  margin-top: 10px;
}
.box-item {
  display: flex;
  flex-direction: column;
  width: 25%;
  font-weight: bold;
  justify-content: center;
  > div {
    margin: 4px;
  }
}
.box {
  background: rgb(250, 250, 250);
  padding: 10px;
  margin-top: 10px;
  display: flex;
}
.card {
  margin-bottom: 10px;
}
</style>
