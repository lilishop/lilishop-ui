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

    <div v-show="hasData" id="container"></div>
    <el-empty v-if="!hasData" description="该日期暂无热词数据" :image-size="100" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Chart } from "@antv/g2";
import { getHotWordsHistory } from "@/api/index";
import { unixToDate } from "@/utils/filters";

const params = reactive({
  date: "",
});
const hotWordsChart = ref(null);
const hotWordsData = ref([]);
const hasData = ref(true);
const endMonth = ref(null);

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
params.date = unixToDate(Math.floor(yesterday.getTime() / 1000), "yyyy-MM-dd");

function disabledDate(date) {
  if (endMonth.value) {
    const endDate = getDate(endMonth.value);
    return (date && date > endDate) || date > new Date();
  }
  return date && date > new Date();
}
function getDate(monthStr) {
  const [year, month] = monthStr.split("-");
  return new Date(year, month, 0);
}
async function search(val) {
  if (val) {
    params.date = val;
  }
  const res = await getHotWordsHistory(params);
  if (res.success) {
    hotWordsData.value = res.result || [];
    hasData.value = hotWordsData.value.length > 0;
    if (hasData.value && hotWordsChart.value) {
      hotWordsChart.value.changeData(hotWordsData.value);
      hotWordsChart.value.render();
    }
  }
}
function init() {
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
  hotWordsChart.value = chart;
  search();
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.box {
  min-height: 400px;
  margin-left: 50px;
}
</style>
