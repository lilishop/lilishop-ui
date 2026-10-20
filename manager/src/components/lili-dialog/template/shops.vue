<template>
  <div class="shop">
    <div class="wap-content">
      <div class="query-wrapper">
        <div class="query-item">
          <div>店铺名称</div>
          <el-input
            v-model="params.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 150px"
            @clear="resetSearch"
            @keyup.enter="resetSearch"
          />
        </div>
        <div class="query-item">
          <el-button type="primary" @click="resetSearch">搜索</el-button>
        </div>
      </div>
      <div>
        <el-table
          ref="tableRef"
          v-loading="loading"
          class="shops-select-table"
          :data="shopsData"
          row-key="id"
          height="340"
          empty-text="暂无店铺信息"
          @selection-change="onSelectionChange"
        >
          <el-table-column
            type="selection"
            label="选择"
            width="60"
            align="center"
            reserve-selection
          />
          <el-table-column label="店铺图片" width="100" align="center">
            <template #default="{ row }">
              <img class="shop-logo" :src="row.storeLogo" alt="" />
            </template>
          </el-table-column>
          <el-table-column
            prop="storeName"
            label="店铺名称"
            min-width="240"
            show-overflow-tooltip
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            show-overflow-tooltip
          />
          <el-table-column label="店铺类型" width="120">
            <template #default="{ row }">
              <span :class="{ theme_color: row.selfOperated }">
                {{ row.selfOperated ? "自营" : "非自营" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="店铺状态" width="120">
            <template #default="{ row }">
              <span :class="{ theme_color: row.storeDisable === 'OPEN' }">
                {{ row.storeDisable === "OPEN" ? "开启中" : "未开启" }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pageration"
          size="small"
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="params.pageSize"
          :current-page="params.pageNumber"
          @current-change="changePageSize"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { nextTick, reactive, ref } from "vue";
import { getShopListData } from "@/api/shops.js";

const emit = defineEmits(["selected"]);

const loading = ref(false);
const total = ref(0);
const params = reactive({
  pageNumber: 1,
  pageSize: 12,
  storeDisable: "OPEN",
  storeName: "",
});
const shopsData = ref([]);
const tableRef = ref(null);
const selectedShop = ref(null);

// 无 defineExpose：grep manager/src 全量确认无外部 ref/$refs/$parent 访问本组件成员
// （link-dialog.vue 的 $refs["lili-component"][0].type 写入指向首个 tab 的 goods-dialog，与本组件无关）

// created
init();

function resetSearch() {
  shopsData.value = [];
  params.pageNumber = 1;
  init();
}

function changePageSize(v) {
  params.pageNumber = v;
  init();
}

function init() {
  loading.value = true;
  getShopListData(params)
    .then((res) => {
      if (res.success) {
        total.value = res.result.total;
        shopsData.value = res.result.records;
        nextTick(syncTableSelection);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function syncTableSelection() {
  const table = tableRef.value;
  if (!table || !selectedShop.value) return;
  shopsData.value.forEach((row) => {
    table.toggleRowSelection(row, row.id === selectedShop.value.id);
  });
}

function onSelectionChange(rows) {
  // 选择链接只能保留一个店铺，勾选新店铺时自动取消上一个
  if (!rows.length) {
    selectedShop.value = null;
    emit("selected", []);
    return;
  }
  const row = rows[rows.length - 1];
  if (rows.length > 1) {
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(row, true);
  }
  selectedShop.value = row;
  emit("selected", [{ ...row, ___type: "shops" }]);
}
</script>
<style lang="scss" scoped>
@import "../style.scss";
.shop {
  display: flex;
}
.shop-logo {
  display: block;
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 4px;
  object-fit: contain;
}
.pageration {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
