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

<script setup>
import { onMounted, reactive, ref } from "vue";
import { getShopListData } from "@/api/shops.js";

const props = defineProps(["closeShop"]);
const emit = defineEmits(["selected"]);

const month = ref("");
const selectedWay = ref({
  title: "过去7天",
  selected: true,
  searchType: "LAST_SEVEN",
});
const storeId = ref("");
const dates = ref([]);
const params = reactive({
  pageNumber: 1,
  pageSize: 100,
  storeName: "",
});
const dateList = ref([
  { title: "今天", selected: false, searchType: "TODAY" },
  { title: "昨天", selected: false, searchType: "YESTERDAY" },
  { title: "过去7天", selected: true, searchType: "LAST_SEVEN" },
  { title: "过去30天", selected: false, searchType: "LAST_THIRTY" },
]);
const originDateList = ref([
  { title: "今天", selected: false, searchType: "TODAY" },
  { title: "昨天", selected: false, searchType: "YESTERDAY" },
  { title: "过去7天", selected: true, searchType: "LAST_SEVEN" },
  { title: "过去30天", selected: false, searchType: "LAST_THIRTY" },
]);
const shopTotal = ref(0);
const shopsData = ref([]);

function getShopList() {
  getShopListData(params).then((res) => {
    if (res.success) {
      shopTotal.value = res.result.total;
      shopsData.value = res.result.records || [];
    }
  });
}
function changeshop() {
  selectedWay.value.storeId = storeId.value;
  emit("selected", selectedWay.value);
}
function getFiveYears() {
  const getYear = new Date().getFullYear();
  const lastFiveYear = getYear - 5;
  const maxMonth = new Date().getMonth() + 1;
  const dateArr = [];
  for (let year = lastFiveYear; year <= getYear; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === getYear && month > maxMonth) {
        continue;
      }
      dateArr.push({ year, month });
    }
  }
  dates.value = dateArr.reverse();
}
function changeSelect(e) {
  month.value = e;
  if (month.value) {
    dateList.value.forEach((res) => {
      res.selected = false;
    });
    const parts = String(month.value).split("-");
    selectedWay.value = {
      ...selectedWay.value,
      year: parts[0],
      month: parts[1],
      searchType: "",
      storeId: storeId.value,
    };
    emit("selected", selectedWay.value);
  } else {
    const current =
      dateList.value.find((item) => item.selected) ||
      dateList.value.find((item) => item.title === selectedWay.value.title) ||
      dateList.value.find((item) => item.searchType === "LAST_SEVEN");
    clickBreadcrumb(current);
  }
}
function clickBreadcrumb(item) {
  if (!item) return;
  let currentIndex;
  dateList.value.forEach((res, index) => {
    res.selected = false;
    if (res.title === item.title) {
      currentIndex = index;
    }
  });
  item.selected = true;
  item.storeId = storeId.value;
  month.value = "";
  if (item.searchType === "") {
    const origin = originDateList.value[currentIndex];
    item.searchType = (origin && origin.searchType) || "LAST_SEVEN";
  }
  selectedWay.value = item;
  selectedWay.value.year = new Date().getFullYear();
  selectedWay.value.month = "";
  emit("selected", selectedWay.value);
}

onMounted(() => {
  getFiveYears();
  if (!props.closeShop) getShopList();
});
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
