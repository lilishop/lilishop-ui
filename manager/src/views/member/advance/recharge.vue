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
        <el-form-item label="客户名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入客户名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="充值单号" prop="rechargeSn">
          <el-input
            v-model="searchForm.rechargeSn"
            placeholder="请输入充值单号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="支付时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择起始时间"
            style="width: 360px"
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
        v-loading="loading"
        border
        :data="data"
        ref="table"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="memberName" label="客户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="rechargeSn" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column label="充值金额" width="160" sortable>
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.rechargeMoney" :color="$mainColor" unit="+" />
          </template>
        </el-table-column>
        <el-table-column label="充值方式" width="120">
          <template #default="{ row }">
            <span v-if="row">{{ rechargeWayText(row.rechargeWay) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="row.payStatus === 'PAID' ? 'success' : 'danger'">
              {{ row.payStatus === "PAID" ? "已付款" : "未付款" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="充值时间" width="190" />
        <el-table-column prop="payTime" label="支付时间" width="190" />
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
import { getUserRecharge } from "@/api/member";

defineOptions({ name: "recharge" });

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);
const table = ref(null);

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
  memberName: "",
});
const selectDate = ref(null);
const data = ref([]);
const total = ref(0);

function rechargeWayText(way) {
  if (way === "ALIPAY") return "支付宝";
  if (way === "WECHAT") return "微信";
  if (way === "BANK_TRANSFER") return "线下转账";
  return "";
}
function init() {
  getDataList();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}
function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.startDate = v[0];
    searchForm.endDate = v[1];
  } else {
    searchForm.startDate = "";
    searchForm.endDate = "";
  }
}
function getDataList() {
  loading.value = true;
  getUserRecharge(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

onMounted(() => {
  init();
});
</script>
