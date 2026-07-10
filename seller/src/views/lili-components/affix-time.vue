<template>
  <div>
    <div class="breadcrumb">
      <span
        v-for="(item, index) in dateList"
        :key="index"
        :class="{ active: item.selected }"
        @click="clickBreadcrumb(item)"
      >
        {{ item.title }}
      </span>
      <div class="date-picker">
        <el-select
          v-model="month"
          placeholder="年月查询"
          clearable
          style="width: 200px; margin-left: 10px"
          @change="changeSelect"
        >
          <el-option
            v-for="(item, i) in dates"
            :key="i"
            :label="item.year + '年' + item.month + '月'"
            :value="item.year + '-' + item.month"
          />
        </el-select>
      </div>
      <div v-if="!closeShop" class="shop-list">
        <el-select
          v-model="storeId"
          placeholder="店铺查询"
          clearable
          filterable
          style="width: 200px; margin-left: 10px"
          @change="changeshop"
        >
          <el-option
            v-for="(item, index) in shopsData"
            :key="index"
            :label="item.storeName"
            :value="item.id"
          />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import { getShopListData } from "@/api/shops.js";

export default {
  props: ["closeShop"],
  data() {
    return {
      month: "",
      selectedWay: {
        title: "过去7天",
        selected: true,
        searchType: "LAST_SEVEN",
      },
      storeId: "",
      dates: [],
      params: {
        pageNumber: 1,
        pageSize: 100,
        storeName: "",
      },
      dateList: [
        { title: "今天", selected: false, searchType: "TODAY" },
        { title: "昨天", selected: false, searchType: "YESTERDAY" },
        { title: "过去7天", selected: true, searchType: "LAST_SEVEN" },
        { title: "过去30天", selected: false, searchType: "LAST_THIRTY" },
      ],
      originDateList: [
        { title: "今天", selected: false, searchType: "TODAY" },
        { title: "昨天", selected: false, searchType: "YESTERDAY" },
        { title: "过去7天", selected: true, searchType: "LAST_SEVEN" },
        { title: "过去30天", selected: false, searchType: "LAST_THIRTY" },
      ],
      shopTotal: 0,
      shopsData: [],
    };
  },
  mounted() {
    this.getFiveYears();
    this.getShopList();
  },
  methods: {
    getShopList() {
      getShopListData(this.params).then((res) => {
        if (res.success) {
          this.shopTotal = res.result.total;
          this.shopsData = res.result.records || [];
        }
      });
    },
    changeshop() {
      this.selectedWay.storeId = this.storeId;
      this.$emit("selected", this.selectedWay);
    },
    getFiveYears() {
      const getYear = new Date().getFullYear();
      const lastFiveYear = getYear - 5;
      const maxMonth = new Date().getMonth() + 1;
      const dates = [];
      for (let year = lastFiveYear; year <= getYear; year++) {
        for (let month = 1; month <= 12; month++) {
          if (year === getYear && month > maxMonth) {
            continue;
          }
          dates.push({ year, month });
        }
      }
      this.dates = dates.reverse();
    },
    changeSelect(e) {
      this.month = e;
      if (this.month) {
        this.dateList.forEach((res) => {
          res.selected = false;
        });
        const parts = String(this.month).split("-");
        this.selectedWay = {
          ...this.selectedWay,
          year: parts[0],
          month: parts[1],
          searchType: "",
          storeId: this.storeId,
        };
        this.$emit("selected", this.selectedWay);
      } else {
        const current =
          this.dateList.find((item) => item.selected) ||
          this.dateList.find((item) => item.title === this.selectedWay.title) ||
          this.dateList.find((item) => item.searchType === "LAST_SEVEN");
        this.clickBreadcrumb(current);
      }
    },
    clickBreadcrumb(item) {
      if (!item) return;
      let currentIndex;
      this.dateList.forEach((res, index) => {
        res.selected = false;
        if (res.title === item.title) {
          currentIndex = index;
        }
      });
      item.selected = true;
      item.storeId = this.storeId;
      this.month = "";
      if (item.searchType === "") {
        const origin = this.originDateList[currentIndex];
        item.searchType = (origin && origin.searchType) || "LAST_SEVEN";
      }
      this.selectedWay = item;
      this.selectedWay.year = new Date().getFullYear();
      this.selectedWay.month = "";
      this.$emit("selected", this.selectedWay);
    },
  },
};
</script>

<style lang="scss" scoped>
.breadcrumb {
  display: flex;
  align-items: center;

  > span {
    margin-right: 15px;
    cursor: pointer;
  }
}

.active {
  color: var(--el-color-primary);
  position: relative;
}

.active:before {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--el-color-primary);
}
</style>
