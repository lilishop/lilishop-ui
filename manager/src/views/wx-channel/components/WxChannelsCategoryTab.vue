<template>
  <div class="wx-channel-category">
    <div class="toolbar">
      <el-switch v-model="forceRefresh" active-text="强刷" inactive-text="缓存" />
      <el-button type="primary" :loading="loading" style="margin-left: 10px" @click="loadThirdCategories">
        刷新
      </el-button>
    </div>
    <el-table v-loading="loading" border :data="data" style="width: 100%">
      <el-table-column prop="firstCatName" label="一级类目" min-width="150" show-overflow-tooltip />
      <el-table-column prop="secondCatName" label="二级类目" min-width="150" show-overflow-tooltip />
      <el-table-column prop="thirdCatName" label="三级类目" min-width="200" show-overflow-tooltip />
      <el-table-column prop="thirdCatId" label="三级类目ID" width="120" />
      <el-table-column prop="qualification" label="类目资质" min-width="220" show-overflow-tooltip />
      <el-table-column label="类目资质类型" width="120">
        <template #default="{ row }">
          <el-tag v-if="row" :type="qualificationTagType(row.qualificationType)">
            {{ qualificationLabel(row.qualificationType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productQualification" label="商品资质" min-width="220" show-overflow-tooltip />
      <el-table-column label="商品资质类型" width="120">
        <template #default="{ row }">
          <el-tag v-if="row" :type="qualificationTagType(row.productQualificationType)">
            {{ qualificationLabel(row.productQualificationType) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getWxChannelsThirdCategory } from "@/api/index";

defineOptions({ name: "WxChannelsCategoryTab" });

const forceRefresh = ref(false);
const loading = ref(false);
const data = ref([]);

function qualificationLabel(val) {
  const map = { 0: "不需要", 1: "必填", 2: "选填" };
  return map[val] || "-";
}

function qualificationTagType(val) {
  if (val === 1) return "danger";
  if (val === 2) return "warning";
  return "success";
}

function loadThirdCategories() {
  loading.value = true;
  getWxChannelsThirdCategory({ forceRefresh: !!forceRefresh.value })
    .then((res) => {
      if (res && res.success) {
        data.value = Array.isArray(res.result) ? res.result : [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  loadThirdCategories();
});
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
</style>
