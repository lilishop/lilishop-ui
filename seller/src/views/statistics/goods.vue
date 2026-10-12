<template>
  <div>
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime :closeShop="true" @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>
    <el-card class="card">
      <el-tabs v-model="params.type" @tab-click="handleClickType">
        <el-tab-pane label="热门商品订单数量" name="NUM">
          <el-table :data="data" stripe style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" min-width="160" />
            <el-table-column prop="num" label="销售数量" min-width="120" />
            <el-table-column label="销售金额" min-width="120">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="热门商品订单金额" name="PRICE">
          <el-table :data="data" stripe style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" min-width="160" />
            <el-table-column prop="num" label="销售数量" min-width="120" />
            <el-table-column label="销售金额" min-width="120">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import * as API_Goods from "@/api/goods";
import affixTime from "@/views/lili-components/affix-time";

const params = ref({
  searchType: "LAST_SEVEN",
  year: "",
  month: "",
  shopId: "",
  type: "NUM",
});
const data = ref([]);

onMounted(() => {
  getData();
});

function handleClickType(tab) {
  params.value.type = tab.paneName;
  getData();
}

function clickBreadcrumb(item) {
  const type = params.value.type;
  params.value = { ...item };
  params.value.type = type;
  getData();
}

function getData() {
  Promise.all([API_Goods.goodsStatistics(params.value)]).then((res) => {
    if (res[0].result) {
      data.value = res[0].result;
    }
  });
}
</script>
<style scoped lang="scss">
.page-col {
  text-align: right;
  margin: 10px 0;
}

.order-col {
  display: flex;

  > div {
    margin-right: 8px;
    padding: 16px;
    font-size: 15px;
  }
}

.order-list {
  display: flex;
}

.tips {
  margin: 0 8px;
}

.card {
  margin-bottom: 10px;
}
</style>
