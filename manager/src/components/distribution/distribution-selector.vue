<template>
  <el-dialog
    :model-value="modelValue"
    title="选择分销员"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    @close="handleClose"
  >
    <el-form inline label-width="70px" class="search-form" @keyup.enter="handleSearch">
      <el-form-item label="手机号">
        <el-input v-model="searchForm.mobile" placeholder="请输入手机号" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      :data="data"
      row-key="id"
      highlight-current-row
      max-height="420"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
    >
      <el-table-column width="55" align="center">
        <template #default="{ row }">
          <el-radio v-model="selectedId" :label="row.id" @click.stop @change="handleRadioChange(row)">
            <span />
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="gradeName" label="等级" min-width="100" />
      <el-table-column prop="joinTime" label="加入时间" min-width="160" />
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="searchForm.pageNumber"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        size="small"
        @current-change="getDataList"
        @size-change="changePageSize"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!selectedRow" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { getDistributionMemberPage } from "@/api/distribution";
import { Message } from "@/utils/message";

defineOptions({ name: "distributionSelector" });

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  excludeId: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue", "confirm"]);

const loading = ref(false);
// searchForm 在 resetState 中被整体替换，用 ref 而非 reactive
const searchForm = ref({
  pageNumber: 1,
  pageSize: 10,
  mobile: "",
  nickname: "",
});
const data = ref([]);
const total = ref(0);
const selectedId = ref("");
const selectedRow = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetState();
      getDataList();
    }
  }
);

function resetState() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 10,
    mobile: "",
    nickname: "",
  };
  selectedId.value = "";
  selectedRow.value = null;
}
function buildParams() {
  const params = {
    pageNumber: searchForm.value.pageNumber,
    pageSize: searchForm.value.pageSize,
    distributionStatus: "PASS",
  };
  if (searchForm.value.mobile) params.mobile = searchForm.value.mobile;
  if (searchForm.value.nickname) params.nickname = searchForm.value.nickname;
  return params;
}
function getDataList() {
  loading.value = true;
  getDistributionMemberPage(buildParams())
    .then((res) => {
      loading.value = false;
      if (!res.success) return;
      const result = res.result || {};
      let records = result.records || [];
      const beforeCount = records.length;
      if (props.excludeId) {
        records = records.filter((item) => item.id !== props.excludeId);
      }
      data.value = records;
      const excludedCount = beforeCount - records.length;
      total.value = Math.max(0, (result.total || 0) - excludedCount);
    })
    .catch(() => {
      loading.value = false;
    });
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function changePageSize() {
  searchForm.value.pageNumber = 1;
  getDataList();
}
function handleRowClick(row) {
  if (!row) return;
  selectedRow.value = row;
  selectedId.value = row.id;
}
function handleCurrentChange(row) {
  if (!row) return;
  selectedRow.value = row;
  selectedId.value = row.id;
}
function handleRadioChange(row) {
  selectedRow.value = row;
}
function handleClose() {
  emit("update:modelValue", false);
}
function handleConfirm() {
  if (!selectedRow.value) {
    Message.warning("请选择分销员");
    return;
  }
  emit("confirm", selectedRow.value);
  handleClose();
}
</script>

<style scoped lang="scss">
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
