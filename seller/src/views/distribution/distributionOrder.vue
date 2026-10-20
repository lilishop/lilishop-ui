<template>
  <div>
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="分销员" prop="distributionName">
          <el-input
            v-model="searchForm.distributionName"
            placeholder="请输入分销员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="订单时间">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="选择时间"
            style="width: 240px"
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
        <el-table-column
          prop="orderSn"
          label="订单编号"
          min-width="180"
          fixed="left"
          show-overflow-tooltip
        />
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div v-if="row" class="goods-msg">
              <img :src="row.image" width="60" height="60" alt="" />
              <div>
                <div class="div-zoom">
                  <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                </div>
                <div style="color: #999; font-size: 10px">数量：x{{ row.num }}</div>
                <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                  <template #reference>
                    <img
                      src="../../assets/qrcode.svg"
                      class="hover-pointer"
                      width="20"
                      height="20"
                      alt="qrcode"
                    />
                  </template>
                  <vue-qr
                    :text="wapLinkTo(row.goodsId, row.skuId)"
                    :margin="0"
                    color-dark="#000"
                    color-light="#fff"
                    :size="150"
                  />
                </el-popover>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="distributionName" label="分销员" min-width="100" show-overflow-tooltip />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <el-tag v-if="row" :type="filterStatusTagType(row.distributionOrderStatus)">
              {{ filterStatus(row.distributionOrderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="佣金金额" min-width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.directCommission ?? row.rebate, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" fixed="right" />
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
import { ref, watch } from "vue";
import { useTable } from "@/utils/useTable";
import { useRoute } from "vue-router";
import { getDistributionOrder } from "@/api/distribution";
import vueQr from "vue-qr";
import * as filters from "@/utils/filters";

defineOptions({ name: "distributionOrder" });

const route = useRoute();

const timeRange = ref([]);
const distributionId = ref(route.query.id);
const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getDistributionOrder,
  {
    pageSize: 20,
    sort: "create_time",
    order: "desc",
    form: { orderSn: "", distributionName: "" },
    beforeRequest: (p) => {
      const params = { ...p };
      if (distributionId.value) {
        params.distributionId = distributionId.value;
      }
      if (timeRange.value && timeRange.value[0] && timeRange.value[1]) {
        const startTime = new Date(timeRange.value[0]).getTime();
        const endTime = new Date(timeRange.value[1]).getTime();
        params.startTime = filters.unixToDate(startTime / 1000);
        params.endTime = filters.unixToDate(endTime / 1000);
      }
      return params;
    },
  }
);
function handleReset() {
  timeRange.value = [];
  resetSearch();
}

// searchFormRef：模板 ref 改名避免与响应式变量 searchForm 互相覆盖
const searchFormRef = ref(null);
const table = ref(null);

watch(
  () => route.query,
  (e) => {
    distributionId.value = e.id ? e.id : undefined;
    getDataList();
  }
);







function filterStatus(status) {
  const arr = [
    { status: "NO_COMPLETED", title: "未完成" },
    { status: "COMPLETE", title: "完成" },
    { status: "REFUND", title: "退款" },
  ];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].status === status) {
      return arr[i].title;
    }
  }
  return "未完成";
}

function filterStatusTagType(status) {
  const arr = [
    { status: "NO_COMPLETED", type: "warning" },
    { status: "COMPLETE", type: "success" },
    { status: "REFUND", type: "danger" },
  ];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].status === status) {
      return arr[i].type;
    }
  }
  return "warning";
}
</script>

<style lang="scss">
.goods-msg {
  display: flex;
  align-items: center;
  > div {
    margin-left: 10px;
  }
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.hover-pointer {
  cursor: pointer;
}

.mt_10 {
  margin-top: 10px;
}
</style>
