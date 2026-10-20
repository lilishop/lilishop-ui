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
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加砍价</el-button>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @sort-change="changeSort"
      >
        <el-table-column prop="goodsId" label="商品编号" width="180" show-overflow-tooltip />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <img alt="商品图片"
              v-if="row && row.thumbnail"
              :src="row.thumbnail"
              style="height: 50px; width: 50px; object-fit: cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
          </template>
        </el-table-column>
        <el-table-column label="库存数量" width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="剩余活动库存" width="120" />
        <el-table-column label="每人最低砍" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unitPrice(row.lowestPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="每人最高砍" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unitPrice(row.highestPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算价格" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.settlementPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动开始时间" min-width="160">
          <template #default="{ row }">
            <template v-if="row">
              <div>{{ row.startTime }}</div>
              <div>{{ row.endTime }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="edit(row)"
              >
                编辑
              </a>
              <a v-else class="link-text" @click="edit(row, 'onlyView')">查看</a>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="page mt_10" style="display: flex; justify-content: flex-end">
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
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getKanJiaGoodsList, delKanJiaGoods } from "@/api/promotion";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "kanjia-activity-goods" });

const emit = defineEmits(["selected"]);

const route = useRoute();
const router = useRouter();

const searchFormRef = ref(null);
const tableRef = ref(null);

const selectDate = ref([]);
const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  goodsName: "",
  promotionStatus: "",
});
const data = ref([]);
const total = ref(0);
const selectList = ref([]);
const selectCoupon = ref([]);

watch(
  () => route.fullPath,
  (to) => {
    // 历史遗留：该路径与本页（砍价商品）路由不符，原样保留
    if (to == "/promotions/manager-coupon") {
      init();
    }
  }
);

function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || "未知";
}
function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
}
function check() {
  emit("selected", selectCoupon.value);
}
function init() {
  getDataList();
}
function add() {
  router.push({ name: "add-kanJia-activity-goods" });
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
function changeSort({ prop, order }) {
  if (!order) {
    searchForm.sort = "createTime";
    searchForm.order = "desc";
  } else {
    searchForm.sort = prop;
    searchForm.order = order === "ascending" ? "asc" : "desc";
  }
  getDataList();
}
function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startTime = new Date(selectDate.value[0]).getTime();
    searchForm.endTime = new Date(selectDate.value[1]).getTime();
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  getKanJiaGoodsList(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function edit(v, type) {
  const params = { id: v.id };
  if (type) params.onlyView = true;
  router.push({
    name: "edit-kanJia-activity-goods",
    query: params,
  });
}
function delAll(row) {
  Modal.confirm({
    title: "确认删除",
    content: "确认需要删除此砍价商品",
    loading: true,
    onOk: () => {
      delKanJiaGoods(row.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("删除成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.padding-row {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
</style>
