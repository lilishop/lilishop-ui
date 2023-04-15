<template>
  <div>
    <div class="affix-time">
      <Affix :offset-top="100">
        <div class="flex affix-box">
          <affixTime :closeShop="true" @selected="clickBreadcrumb" />

          <InputNumber
            placeholder="展示前N"
            :max="200"
            :min="10"
            v-model="params.top"
          ></InputNumber>
          <Button style="margin-left: 10px" @click="search">搜索</Button>
        </div>
      </Affix>
    </div>

    <div id="container"></div>
    <Table border :columns="columns" :data="hotWordsData"></Table>
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
        // 请求参数
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
        top: 50,
      },
      columns: [
        {
          title: "热词名称",
          key: "keywords",
        },
        {
          title: "搜索次数",
          key: "score",
        },
      ],
      hotWordsChart: "", //图表
      hotWordsData: [], //数据
      orderChart: "",
    };
  },
  computed: {},
  watch: {
    params: {
      handler(val) {
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
    // 初始化图表
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
    handleClickSearch() {},
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
        this.hotWordsChart
          .interval()
          .position("keywords*score")
          .color("#f59b99");
        this.hotWordsChart.interaction("element-active");

        // 添加文本标注
        // this.hotWordsData.forEach((item) => {
        //   this.hotWordsChart
        //     .annotation()
        //     .text({
        //       position: [item.keywords, item.score],
        //       content: item.score,
        //       style: {
        //         textAlign: "center",
        //       },
        //       offsetY: -30,
        //     })
        // });

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
