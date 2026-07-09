<template>
  <div class="box">
    <el-date-picker
      v-model="params.date"
      type="date"
      placeholder="选择查看日期"
      value-format="YYYY-MM-DD"
      :disabled-date="disabledDate"
      style="width: 200px"
      @change="search"
    />
    <el-alert
      class="mt_10"
      type="success"
      :closable="false"
      show-icon
      title="这里展示历史某一天的热词数据统计，可根据需求配置每日持久化多少条数据。"
    />

    <div id="container"></div>
  </div>
</template>

<script>
import { Chart } from "@antv/g2";
import { getHotWordsHistory } from "@/api/index";
import { Message } from "@/utils/message";

export default {
  data() {
    return {
      params: {
        date: "",
      },
      hotWordsChart: null,
      hotWordsData: [],
      endMonth: null,
    };
  },
  created() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.params.date = this.$filters.unixToDate(Math.floor(yesterday.getTime() / 1000), "yyyy-MM-dd");
  },
  methods: {
    disabledDate(date) {
      if (this.endMonth) {
        const endDate = this.getDate(this.endMonth);
        return (date && date > endDate) || date > new Date();
      }
      return date && date > new Date();
    },
    getDate(monthStr) {
      const [year, month] = monthStr.split("-");
      return new Date(year, month, 0);
    },
    async search(val) {
      if (val) {
        this.params.date = val;
      }
      const res = await getHotWordsHistory(this.params);
      if (res.success) {
        this.hotWordsData = res.result || [];
        if (this.hotWordsChart) {
          this.hotWordsChart.changeData(this.hotWordsData);
          this.hotWordsChart.render();
        }
        if (!this.hotWordsData.length) {
          Message.error("暂无数据");
        }
      }
    },
    init() {
      const chart = new Chart({
        container: "container",
        autoFit: true,
        height: 500,
        padding: [50, 20, 50, 20],
      });
      chart.scale("score", {
        alias: "搜索次数",
      });
      chart.axis("keywords", {
        tickLine: {
          alignTick: false,
        },
      });
      chart.axis("score", false);
      chart.tooltip({
        showMarkers: false,
      });
      chart.interval().position("keywords*score").color("#f59b99");
      chart.interaction("element-active");
      this.hotWordsChart = chart;
      this.search();
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.box {
  min-height: 400px;
  margin-left: 50px;
}
</style>
