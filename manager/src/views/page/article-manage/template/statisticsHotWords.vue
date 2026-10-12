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

    <div v-show="hasData" id="container"></div>
    <el-table v-if="hasData" border :data="hotWordsData" style="width: 100%">
      <el-table-column prop="keywords" label="热词名称" min-width="160" />
      <el-table-column prop="score" label="搜索次数" min-width="120" />
    </el-table>
    <el-empty v-else description="暂无热词统计数据" :image-size="100" />
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted } from "vue";
import { Chart } from "@antv/g2";
import { getHotWordsStatistics } from "@/api/index";
import affixTime from "@/components/affix-time";

const params = ref({
  searchType: "LAST_SEVEN",
  year: "",
  month: "",
  top: 50,
});
// G2 Chart 实例不做深度响应式（避免 Proxy 包装破坏图表内部状态）
const hotWordsChart = shallowRef("");
const hotWordsData = ref([]);
const hasData = ref(true);

// 历史遗留：原 watch 监听的 year 从未在 data 中声明，此处补齐声明以保留监听行为
const year = ref("");

watch(
  params,
  () => {
    search();
  },
  { deep: true, immediate: true }
);
watch(year, (val) => {
  params.value.year = new Date(val).getFullYear();
});

function clickBreadcrumb(val) {
  params.value = { ...params.value, ...val };
}

async function search() {
  const res = await getHotWordsStatistics(params.value);
  if (res.success) {
    hotWordsData.value = res.result || [];
    hasData.value = hotWordsData.value.length > 0;
    if (!hasData.value) {
      return;
    }
    if (!hotWordsChart.value) {
      hotWordsChart.value = new Chart({
        container: "container",
        autoFit: true,
        height: 500,
        padding: [50, 20, 50, 20],
      });
    }
    init();
  }
}

function init() {
  if (hotWordsChart.value) {
    hotWordsChart.value.data(hotWordsData.value);
    hotWordsChart.value.scale("score", {
      alias: "搜索次数",
    });

    hotWordsChart.value.axis("keywords", {
      tickLine: {
        alignTick: false,
      },
    });
    hotWordsChart.value.axis("score", false);

    hotWordsChart.value.tooltip({
      showMarkers: false,
    });
    hotWordsChart.value.interval().position("keywords*score").color("#409EFF");
    hotWordsChart.value.interaction("element-active");

    hotWordsChart.value.render();
  }
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.affix-time {
  padding-left: 15px;
}
</style>
