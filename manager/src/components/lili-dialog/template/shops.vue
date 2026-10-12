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
        <div v-loading="loading" class="wap-content-list">
          <div
            v-for="(item, index) in shopsData"
            :key="index"
            class="wap-content-item"
            :class="{ active: selected == index }"
            @click="clickShop(item, index)"
          >
            <div>
              <img class="shop-logo" :src="item.storeLogo" alt="" />
            </div>
            <div class="wap-content-desc">
              <div class="wap-content-desc-title">{{ item.storeName }}</div>
              <div class="self-operated" :class="{ theme_color: item.selfOperated }">
                {{ item.selfOperated ? "自营" : "非自营" }}
              </div>
              <div
                class="wap-sku"
                :class="{ theme_color: item.storeDisable === 'OPEN' }"
              >
                {{ item.storeDisable === "OPEN" ? "开启中" : "未开启" }}
              </div>
            </div>
          </div>
        </div>
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
import { ref, reactive } from "vue";
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
const selected = ref(9999999999);

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
  getShopListData(params).then((res) => {
    if (res.success) {
      total.value = res.result.total;
      shopsData.value = res.result.records;
    }
    loading.value = false;
  });
}

function clickShop(val, i) {
  selected.value = i;
  val = { ...val, ___type: "shops" };
  emit("selected", [val]);
}
</script>
<style lang="scss" scoped>
@import "../style.scss";
.shop {
  display: flex;
}
.self-operated {
  font-size: 12px;
  color: #999;
}
.wap-content-list {
  display: flex;
  flex-wrap: wrap;
  height: 340px;
  min-height: 120px;
}
.shop-logo {
  object-fit: cover;
}
.active {
  background: url("../../../assets/selected.png") no-repeat;
  background-position: right;
  background-size: 10%;
}
.pageration {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
