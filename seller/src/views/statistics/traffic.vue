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
<script>
import affixTime from "@/views/lili-components/affix-time";
import * as API_Member from "@/api/member";
import { Chart } from "@antv/g2";

export default {
  components: { affixTime },

  data() {
    return {
      uvs: 0,
      pvs: 0,
      orderChart: "",
      params: {
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
      },
      data: [],
    };
  },
  watch: {
    params: {
      handler() {
        this.uvs = 0;
        this.pvs = 0;
        this.init();
      },
      deep: true,
    },
  },
  methods: {
    initChart() {
      const uv = [];
      const pv = [];

      this.data.forEach((item) => {
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

      this.orderChart.data(chartData);
      this.orderChart.scale({
        activeQuantity: {
          range: [0, 1],
          nice: true,
        },
      });
      this.orderChart.tooltip({
        showCrosshairs: true,
        shared: true,
      });

      this.orderChart
        .line()
        .position("date*pv")
        .color("title")
        .label("pv")
        .shape("smooth");

      this.orderChart
        .point()
        .position("date*pv")
        .color("title")
        .label("pv")
        .shape("circle")
        .style({
          stroke: "#fff",
          lineWidth: 1,
        });
      this.orderChart.area().position("date*pv").color("title").shape("smooth");

      this.orderChart.render();
    },
    clickBreadcrumb(item) {
      this.params = JSON.parse(JSON.stringify(item));
    },
    init() {
      this.orderChart ? this.orderChart.clear() : "";
      API_Member.getStatisticsList(this.params).then((res) => {
        if (res.result) {
          this.data = res.result;
          res.result.forEach((item) => {
            this.uvs += item.uvNum;
            this.pvs += item.pvNum;
          });

          if (!this.orderChart) {
            this.orderChart = new Chart({
              container: "orderChart",
              autoFit: true,
              height: 500,
              padding: [70, 70, 70, 70],
            });
          }
          this.initChart();
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
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
