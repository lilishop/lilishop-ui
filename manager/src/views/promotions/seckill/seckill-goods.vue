<template>
  <div class="seckill-goods">
    <el-card>
      <el-table border :data="data" style="width: 100%">
        <el-table-column prop="promotionName" label="活动名称" min-width="120" />
        <el-table-column prop="startTime" label="活动开始时间" min-width="160" />
        <el-table-column label="报名截止时间" min-width="160">
          <template #default="{ row }">
            <span v-if="row">{{ unixDate(row.applyEndTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间场次" min-width="160">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-for="item in unixHours(row.hours)" :key="item" class="hour-tag">{{ item }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="seckillStatusTagType(row.promotionStatus)">
              {{ seckillStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-table
        ref="table"
        v-loading="loading"
        border
        class="operation"
        :data="goodsList"
        style="width: 100%"
      >
        <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="商品价格" width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.originalPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="90">
          <template #default="{ row }">
            <span v-if="row">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动价格" width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="商家名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="活动场次" width="100">
          <template #default="{ row }">
            <el-tag v-if="row">{{ row.timeLine + ":00" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row, $index }">
            <a v-if="row" class="link-text" @click="delGoods($index, row)">删除</a>
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
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import {
  seckillGoodsList,
  seckillDetail,
  delSeckillGoods,
} from "@/api/promotion.js";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

const route = useRoute();

const promotionStatus = ref("");
const loading = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const total = ref(0);
const data = ref([]);
const goodsList = ref([]);

function seckillStatusText(status) {
  const map = {
    NEW: "新建",
    START: "开始",
    END: "结束",
    CLOSE: "废弃",
  };
  return map[status] || status || "-";
}
function seckillStatusTagType(status) {
  const map = {
    NEW: "danger",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
}
function init() {
  getSeckillMsg();
}
function changePage() {
  getDataList();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}
function getDataList() {
  loading.value = true;
  searchForm.seckillId = route.query.id;
  seckillGoodsList(searchForm).then((res) => {
    loading.value = false;
    if (res.success && res.result) {
      goodsList.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
function getSeckillMsg() {
  seckillDetail(route.query.id).then((res) => {
    if (res.success && res.result) {
      data.value = [];
      data.value.push(res.result);
      promotionStatus.value = res.result.promotionStatus;
      getDataList();
    }
  });
}
function delGoods(index, row) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除该商品吗?删除后不可恢复",
    onOk: () => {
      const params = {
        seckillId: row.seckillId,
        id: row.id,
      };
      delSeckillGoods(params).then((res) => {
        if (res.success) {
          goodsList.value.splice(index, 1);
          Message.success("删除成功！");
        }
      });
    },
  });
}
function unixDate(time) {
  return unixToDate(new Date(time) / 1000);
}
function unixHours(item) {
  const hourArr = item.split(",");
  for (let i = 0; i < hourArr.length; i++) {
    hourArr[i] += ":00";
  }
  return hourArr;
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}

.hour-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.mt_10 {
  margin-top: 10px;
}
</style>
