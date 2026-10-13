<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择起始时间"
            style="width: 240px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="storeName" label="店铺名称" min-width="120" align="left" />
        <el-table-column prop="memberName" label="会员名称" min-width="120" align="left" />
        <el-table-column label="店铺地址" width="300">
          <template #default="{ row }">
            <el-tag v-if="row">{{ row.storeAddressPath || "暂未填写" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否自营" width="120" align="left">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.selfOperated ? '' : 'success'">
              {{ row.selfOperated ? "自营" : "非自营" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="left" />
        <el-table-column label="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
            <a
              v-if="row && row.storeDisable == 'APPLYING'"
              class="link-text"
              @click="edit(row)"
            >查看</a>
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
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getShopListData } from "@/api/shops";

defineOptions({ name: "shop" });

const emit = defineEmits(["callback"]);

const router = useRouter();

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
});
const selectDate = ref(null);
const data = ref([]);
const total = ref(0);

const searchFormRef = ref(null);
const table = ref(null);

function callback(val) {
  emit("callback", val);
}

function init() {
  getDataList();
}

function changePage() {
  getDataList();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}

function selectDateRange(v) {
  if (v) {
    searchForm.startDate = v[0];
    searchForm.endDate = v[1];
  }
}

function getDataList() {
  loading.value = true;
  searchForm.storeDisable = "APPLYING";
  getShopListData(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

function edit(v) {
  router.push({ path: "/shop-operation", query: { shopId: v.id } });
}

onMounted(() => {
  init();
});
</script>
