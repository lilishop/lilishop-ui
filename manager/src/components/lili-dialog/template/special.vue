<template>
  <div class="wrapper">
    <div class="content">
      <div>
        <div class="tables">
          <el-table v-loading="loading" border height="350" :data="data" style="width: 100%">
            <el-table-column prop="name" label="专题名称" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row, $index }">
                <el-button
                  v-if="row"
                  :type="index === $index ? 'primary' : 'default'"
                  size="small"
                  @click="selectRow(row, $index)"
                >
                  {{ index === $index ? "已选" : "选择" }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            class="mt_10"
            :total="Number(total)"
            layout="prev, pager, next, jumper"
            size="small"
            @current-change="changePageNum"
            @size-change="changePageSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { getHomeList } from "@/api/other.js";

const emit = defineEmits(["selected"]);

const route = useRoute();

const loading = ref(true);
const index = ref(999);
const data = ref([]);
const params = reactive({
  sort: "createTime",
  order: "desc",
  pageClientType: "H5",
  pageNumber: 1,
  pageSize: 20,
  pageType: "SPECIAL",
});
const total = ref(0);

function selectRow(row, idx) {
  index.value = idx;
  const payload = { ...row, pageType: "special", ___type: "special" };
  emit("selected", [payload]);
}
function changePageNum(val) {
  params.pageNumber = val;
  init();
}
function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  init();
}
async function init() {
  params.pageClientType = route.name === "renovation" ? "PC" : "H5";
  const res = await getHomeList(params);
  if (res.success) {
    loading.value = false;
    data.value = res.result.records;
    total.value = res.result.total;
  } else {
    loading.value = false;
  }
}

onMounted(() => {
  init();
});
</script>
<style lang="scss" scoped>
img {
  max-width: 100% !important;
}
.search {
  width: 300px;
}
.page {
  margin-top: 2vh;
  text-align: right;
}
.tables {
  height: 400px;
  margin-top: 20px;
  overflow: auto;
  width: 100%;
}
.content {
  overflow: hidden;
  flex: 4;
}
.wrapper {
  overflow: hidden;
}
</style>
