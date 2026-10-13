<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="currentTemplate">
        <el-tab-pane
          v-for="(item, index) in templatesWay"
          :key="index"
          :label="item.label"
          :name="item.template"
        >
          <todayHotWords v-if="item.template === 'todayHotWords' && currentTemplate === 'todayHotWords'" />
          <historyHotWords v-if="item.template === 'historyHotWords' && currentTemplate === 'historyHotWords'" />
          <statisticsHotWords
            v-if="item.template === 'statisticsHotWords' && currentTemplate === 'statisticsHotWords'"
          />
          <setupHotWords v-if="item.template === 'setupHotWords' && currentTemplate === 'setupHotWords'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import todayHotWords from "./template/todayHotWords";
import historyHotWords from "./template/historyHotWords";
import setupHotWords from "./template/setupHotWords";
import statisticsHotWords from "./template/statisticsHotWords";

defineOptions({ name: "hotWords" });

const templatesWay = ref([
  { template: "todayHotWords", label: "今日热词" },
  { template: "historyHotWords", label: "历史热词" },
  { template: "statisticsHotWords", label: "热词统计" },
  { template: "setupHotWords", label: "设置热词" },
]);
const currentTemplate = ref("todayHotWords");
</script>

<style lang="scss" scoped></style>
