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
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        style="width: 100%"
      >
        <el-table-column prop="storeName" label="店铺名称" min-width="120" align="left" />
        <el-table-column prop="memberName" label="会员名称" min-width="120" align="left" />
        <el-table-column prop="createTime" label="申请时间" min-width="160" align="left" />
        <el-table-column prop="storeAddressPath" label="所在地" min-width="180" align="left" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a
              style="color: #409eff; cursor: pointer;"
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTable } from "@/utils/useTable";
import { getShopListData } from "@/api/shops";

defineOptions({ name: "shop" });

const router = useRouter();
const selectDate = ref(null);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getShopListData,
  {
    pageSize: 20,
    form: {
      sort: "createTime",
      order: "desc",
      startDate: "",
      endDate: "",
      storeName: "",
      memberName: "",
      storeDisable: "APPLYING",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (selectDate.value && selectDate.value.length === 2) {
        params.startDate = selectDate.value[0];
        params.endDate = selectDate.value[1];
      } else {
        delete params.startDate;
        delete params.endDate;
      }
      return params;
    },
  }
);

function handleReset() {
  selectDate.value = null;
  resetSearch();
}

function edit(v) {
  router.push({ path: "/shop-operation", query: { shopId: v.id } });
}
</script>

<style lang="scss" scoped>
.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
