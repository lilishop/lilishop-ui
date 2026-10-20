<template>
  <div class="wrapper">
    <div class="content">
      <el-table
        ref="tableRef"
        v-loading="loading"
        class="specials-select-table"
        :data="data"
        row-key="id"
        height="340"
        empty-text="暂无专题信息"
        @selection-change="onSelectionChange"
      >
        <el-table-column
          type="selection"
          label="选择"
          width="60"
          align="center"
          reserve-selection
        />
        <el-table-column
          prop="id"
          label="专题ID"
          width="240"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          label="专题名称"
          min-width="260"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.pageShow === 'OPEN' ? 'success' : 'info'" size="small">
              {{ row.pageShow === "OPEN" ? "开启" : "关闭" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        class="pageration"
        :total="Number(total)"
        layout="total, prev, pager, next, jumper"
        size="small"
        @current-change="changePageNum"
        @size-change="changePageSize"
      />
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { getHomeList } from "@/api/other.js";

const emit = defineEmits(["selected"]);

const route = useRoute();
const loading = ref(true);
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
const tableRef = ref(null);
const selectedSpecial = ref(null);

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
  loading.value = true;
  params.pageClientType = route.name === "renovation" ? "PC" : "H5";
  const res = await getHomeList(params);
  if (res.success) {
    data.value = res.result.records || [];
    total.value = res.result.total;
    nextTick(syncTableSelection);
  }
  loading.value = false;
}

function syncTableSelection() {
  const table = tableRef.value;
  if (!table || !selectedSpecial.value) return;
  data.value.forEach((row) => {
    table.toggleRowSelection(row, row.id === selectedSpecial.value.id);
  });
}

function onSelectionChange(rows) {
  // 选择链接只能保留一个专题，勾选新专题时自动取消上一个
  if (!rows.length) {
    selectedSpecial.value = null;
    emit("selected", []);
    return;
  }
  const row = rows[rows.length - 1];
  if (rows.length > 1) {
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(row, true);
  }
  selectedSpecial.value = row;
  emit("selected", [{ ...row, pageType: "special", ___type: "special" }]);
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.content {
  overflow: hidden;
  flex: 1;
}
.pageration {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
