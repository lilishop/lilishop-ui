<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="商品编号" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入商品编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column label="商品名称" min-width="220" class-name="goods-name-column">
          <template #default="{ row }">
            <div v-if="row" class="goods-name-cell">
              <img
                v-if="row.original"
                :src="row.original"
                class="goods-name-img"
                alt=""
              />
              <a class="link-text goods-name-text">{{ row.goodsName }}</a>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="商品编号" min-width="120" show-overflow-tooltip />
        <el-table-column label="价格" min-width="120">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="authFlagTagType(row.authFlag)">{{ authFlagText(row.authFlag) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="examine(row, 1)">通过</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="examine(row, 2)">拒绝</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="showDetail(row)">查看</a>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { authGoods, getAuthGoodsListData } from "@/api/goods";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, customRouterPush } from "@/utils/filters";

defineOptions({ name: "goodsApply" });

// 模板中 el-form 的 ref 与数据 searchForm 同名，避免相互覆盖改名
const searchFormRef = ref(null);
const table = ref(null);

const loading = ref(true);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
});
const goodsAuditForm = ref({
  auth_flag: 1,
});
const data = ref([]);
const total = ref(0);

function authFlagText(v) {
  const map = {
    TOBEAUDITED: "待审核",
    PASS: "审核通过",
    REFUSE: "审核拒绝",
  };
  return map[v] || v || "-";
}
function authFlagTagType(v) {
  const map = {
    TOBEAUDITED: "warning",
    PASS: "success",
    REFUSE: "danger",
  };
  return map[v] || "info";
}
function init() {
  getDataList();
}
function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.value.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getDataList();
}
function getDataList() {
  loading.value = true;
  searchForm.value.authFlag = 0;
  getAuthGoodsListData(searchForm.value)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
function examine(v, authFlag) {
  const examine = authFlag === 1 ? "通过" : "拒绝";
  goodsAuditForm.value.authFlag = authFlag === 1 ? "PASS" : "REFUSE";
  ElMessageBox.confirm(`您确认要审核${examine} ${v.goodsName} ?`, "确认审核", { type: "warning" }).then(() => {
    const formData = new FormData();
    formData.append("goodsIds", v.id);
    formData.append("authFlag", goodsAuditForm.value.authFlag);
    return authGoods(formData).then((res) => {
      if (res.success) {
        ElMessage.success("审核成功");
        getDataList();
      }
    });
  }).catch(() => {});
}
function showDetail(v) {
  customRouterPush({
    name: "goods-detail",
    query: { id: v.id },
  });
}

onMounted(() => {
  init();
});
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.goods-name-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}
.goods-name-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  flex-shrink: 0;
}
.goods-name-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}
:deep(.goods-name-column .cell) {
  white-space: normal;
  line-height: 1.5;
}
</style>
