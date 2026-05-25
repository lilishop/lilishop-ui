<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime :closeShop="true" @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <div>
        <h4>
          客户增长趋势
          <el-button style="margin-left: 10px" size="small" @click="toggleMemberCount">
            {{ enableShowMemberCount ? "关闭" : "显示" }}用户总人数
          </el-button>
        </h4>
        <div id="orderChart"></div>
      </div>
    </el-card>

    <el-card class="card">
      <div>
        <h4>客户增长报表</h4>
        <el-table class="mt_10" stripe :data="data" style="width: 100%">
          <el-table-column prop="createDate" label="日期" min-width="120" sortable />
          <el-table-column prop="memberCount" label="当前会员" min-width="120" />
          <el-table-column prop="newlyAdded" label="新增会员" min-width="120" />
          <el-table-column prop="activeQuantity" label="活跃会员" min-width="120" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>
<script>
import * as API_Member from "@/api/member";
import { Chart } from "@antv/g2";
import affixTime from "@/components/affix-time";

export default {
  components: { affixTime },
  data() {
    return {
      orderChart: "",
      params: {
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
        shopId: "",
      },
      data: [],
      enableShowMemberCount: false,
      year: "",
    };
  },
  watch: {
    params: {
      handler() {
        this.init();
      },
      deep: true,
      immediate: true,
    },
    year(val) {
      this.params.year = new Date(val).getFullYear();
    },
  },
  methods: {
    toggleMemberCount() {
      this.enableShowMemberCount = !this.enableShowMemberCount;
      this.initMemberChart();
    },
    initMemberChart() {
      const count = [];
      const newly = [];
      const actives = [];

      this.data.forEach((item) => {
        if (this.enableShowMemberCount && (item.memberCount != "" || item.memberCount != null)) {
          count.push({
            createDate: item.createDate,
            memberCount: item.memberCount,
            title: "当前会员数量",
          });
        }
        if (!this.enableShowMemberCount && (item.newlyAdded != "" || item.newlyAdded != null)) {
          newly.push({
            createDate: item.createDate,
            memberCount: item.newlyAdded,
            title: "新增会员数量",
          });
        }
        if (!this.enableShowMemberCount && (item.activeQuantity != "" || item.activeQuantity != null)) {
          actives.push({
            createDate: item.createDate,
            memberCount: item.activeQuantity,
            title: "当日活跃数量",
          });
        }
      });

      const chartData = [...count, ...newly, ...actives];

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
        .position("createDate*memberCount")
        .color("title")
        .label("memberCount")
        .shape("smooth");

      this.orderChart
        .point()
        .position("createDate*memberCount")
        .color("title")
        .label("memberCount")
        .shape("circle")
        .style({
          stroke: "#fff",
          lineWidth: 1,
        });
      this.orderChart.area().position("createDate*memberCount").color("title").shape("smooth");

      this.orderChart.render();
    },
    clickBreadcrumb(item) {
      this.params = { ...item };
    },
    init() {
      this.orderChart ? this.orderChart.clear() : "";
      API_Member.getMemberStatistics(this.params).then((res) => {
        if (res.result) {
          res.result.forEach((item) => {
            item.activeQuantity += "";
          });
          this.data = res.result;

          if (!this.orderChart) {
            this.orderChart = new Chart({
              container: "orderChart",
              autoFit: true,
              height: 500,
              padding: [70, 70, 70, 70],
            });
          }
          this.initMemberChart();
        }
      });
    },
  },
  mounted() {
    this.year = new Date();
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
.mt_10 {
  margin-top: 10px;
}
</style>
