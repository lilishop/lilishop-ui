<template>
  <div class="affix-time">
    <el-affix :offset="100">
      <div class="flex affix-box">
        <affixTime :closeShop="true" @selected="clickBreadcrumb" />
        <el-input-number
          v-model="params.top"
          placeholder="展示前N"
          :max="200"
          :min="10"
        />
        <el-button style="margin-left: 10px" @click="search">搜索</el-button>
      </div>
    </el-affix>

    <div id="container"></div>
    <el-table border :data="hotWordsData" style="width: 100%">
      <el-table-column prop="keywords" label="热词名称" min-width="160" />
      <el-table-column prop="score" label="搜索次数" min-width="120" />
    </el-table>
  </div>
</template>

<script>
import { Chart } from "@antv/g2";
import { getHotWordsStatistics } from "@/api/index";
import affixTime from "@/components/affix-time";

export default {
  components: {
    affixTime,
  },
  data() {
    return {
      params: {
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
        top: 50,
      },
      hotWordsChart: "",
      hotWordsData: [],
    };
  },
  watch: {
    params: {
      handler() {
        this.search();
      },
      deep: true,
      immediate: true,
    },
    year(val) {
      this.params.year = new Date(val).getFullYear();
    },
  },
  methods: {
    clickBreadcrumb(val) {
      this.params = { ...this.params, ...val };
    },
    async search() {
      const res = await getHotWordsStatistics(this.params);
      if (res.success) {
        this.hotWordsData = res.result;
        if (!this.hotWordsChart) {
          this.hotWordsChart = new Chart({
            container: "container",
            autoFit: true,
            height: 500,
            padding: [50, 20, 50, 20],
          });
        }
        this.init();
      }
    },
    init() {
      if (this.hotWordsChart) {
        this.hotWordsChart.data(this.hotWordsData);
        this.hotWordsChart.scale("score", {
          alias: "搜索次数",
        });

        this.hotWordsChart.axis("keywords", {
          tickLine: {
            alignTick: false,
          },
        });
        this.hotWordsChart.axis("score", false);

        this.hotWordsChart.tooltip({
          showMarkers: false,
        });
        this.hotWordsChart.interval().position("keywords*score").color("#409EFF");
        this.hotWordsChart.interaction("element-active");

        this.hotWordsChart.render();
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.affix-time {
  padding-left: 15px;
}
</style>
