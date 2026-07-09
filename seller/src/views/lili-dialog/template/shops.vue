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
          v-model:current-page="params.pageNumber"
          class="pageration"
          size="small"
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="params.pageSize"
          @current-change="changePageSize"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { getShopListData } from "@/api/shops.js";
export default {
  data() {
    return {
      loading: false,
      total: 0,
      params: {
        pageNumber: 1,
        pageSize: 12,
        storeDisable: "OPEN",
        storeName: "",
      },
      shopsData: [],
      selected: 9999999999,
    };
  },
  created() {
    this.init();
  },
  methods: {
    resetSearch() {
      this.shopsData = [];
      this.params.pageNumber = 1;
      this.init();
    },
    changePageSize(v) {
      this.params.pageNumber = v;
      this.init();
    },
    init() {
      this.loading = true;
      getShopListData(this.params).then((res) => {
        if (res.success) {
          this.total = res.result.total;
          this.shopsData = res.result.records;
        }
        this.loading = false;
      });
    },
    clickShop(val, i) {
      this.selected = i;
      val = { ...val, ___type: "shops" };
      this.$emit("selected", [val]);
    },
  },
};
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
