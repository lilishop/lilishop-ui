<template>
  <div class="wrapper">
    <el-card>
      <el-form ref="formRef" :model="form" :rules="formRule" label-width="120px">
        <div class="base-info-item">
          <div class="form-item-view">
            <el-form-item style="width: 100%">
              <div style="display: flex; margin-bottom: 10px">
                <el-button type="primary" @click="openSkuList">选择商品</el-button>
                <el-button
                  type="danger"
                  plain
                  style="margin-left: 10px"
                  @click="delSelectGoods"
                >批量删除</el-button>
              </div>
              <el-table
                border
                v-if="showTable"
                :data="promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
                <el-table-column label="类型" width="100">
                  <template #default="{ row }">
                    <span v-if="row">{{ goodsTypeLabel(row.goodsType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="SKU编码" min-width="120">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.skuId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="storeName" label="店铺名称" min-width="100" show-overflow-tooltip />
                <el-table-column label="商品价格" width="110">
                  <template #default="{ row }">
                    <span v-if="row" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="90">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="结算价格" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].settlementPrice"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="分类" min-width="160">
                  <template #default="{ $index }">
                    <el-select
                      v-model="promotionGoodsList[$index].pointsGoodsCategoryId"
                      @change="(val) => changeCategory(val, $index)"
                      style="width: 140px"
                    >
                      <el-option
                        v-for="item in categoryList"
                        :value="item.id"
                        :key="item.id"
                        :label="item.name"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="活动库存" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].activeStock"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="兑换积分" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].points"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" size="small" plain @click="delGoods($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item label="活动时间" prop="rangeTime" class="points-goods-time-form-item">
              <el-date-picker
                type="datetimerange"
                v-model="form.rangeTime"
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择"
                :disabled-date="options.disabledDate"
              />
            </el-form-item>
            <div>
              <el-button link @click="closeCurrentPage">返回</el-button>
              <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { addPointsGoods, getPointsGoodsCategoryList } from "@/api/promotion";
import skuSelect from "@/components/lili-dialog";
import { isECoupon, goodsTypeLabel } from "@/constants/goodsType";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "addPoinsGoods" });

const router = useRouter();
const appStore = useAppStore();

const formRef = ref(null);
const skuSelectRef = ref(null);

const form = reactive({
  rangeTime: null,
  promotionGoodsList: [],
});
const showTable = ref(true);
const promotionGoodsList = ref([]);
const categoryList = ref([]);
const submitLoading = ref(false);
const selectedGoods = ref([]);
const formRule = {
  rangeTime: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
          callback(new Error("请选择活动时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};
const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

onMounted(async () => {
  await getCategory();
});

async function getCategory() {
  let res = await getPointsGoodsCategoryList();
  categoryList.value = res.result.records;
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    let params = promotionGoodsList.value;
    if (!params || params.length === 0) {
      Modal.warning({ title: "提示", content: "请选择指定商品" });
      return;
    }
    for (const row of params) {
      const stock = Number(row.quantity) || 0;
      if (isECoupon(row.goodsType) && Number(row.activeStock) > stock) {
        Message.error(`【${row.goodsName}】活动库存不能超过卡池库存（${stock}）`);
        return;
      }
    }
    form.startTime = form.rangeTime[0];
    form.endTime = form.rangeTime[1];
    const start = unixToDate(form.startTime / 1000);
    const end = unixToDate(form.endTime / 1000);

    submitLoading.value = true;
    params = params.map((j) => {
      j.startTime = start;
      j.endTime = end;
      return j;
    });
    addPointsGoods(params).then((res) => {
      submitLoading.value = false;
      if (res.success) {
        Message.success("积分商品创建成功");
        closeCurrentPage();
      }
    });
  });
}

function closeCurrentPage() {
  appStore.removeTag("add-points-goods");
  localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  router.go(-1);
}

function changeCategory(categoryId, index) {
  const item = categoryList.value.find((c) => c.id === categoryId);
  promotionGoodsList.value[index].pointsGoodsCategoryName = item ? item.name : "";
}

function changeSelect(e) {
  selectedGoods.value = e;
}

function delSelectGoods() {
  if (selectedGoods.value.length <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选商品吗?",
    onOk: () => {
      let ids = [];
      selectedGoods.value.forEach(function (e) {
        ids.push(e.skuId);
      });
      promotionGoodsList.value = promotionGoodsList.value.filter((item) => {
        return !ids.includes(item.skuId);
      });
    },
  });
}

function delGoods(index) {
  promotionGoodsList.value.splice(index, 1);
}

function openSkuList() {
  skuSelectRef.value.open("goods");
  let data = JSON.parse(JSON.stringify(promotionGoodsList.value));
  data.forEach((e) => {
    e.id = e.skuId;
  });
  skuSelectRef.value.goodsData = data;
}

function selectedGoodsData(item) {
  let list = [];
  item.forEach((e) => {
    const obj = {
      settlementPrice: e.settlementPrice || e.price,
      pointsGoodsCategoryId: e.pointsGoodsCategoryId || 0,
      pointsGoodsCategoryName: e.pointsGoodsCategoryName || "",
      activeStock: e.activeStock || 1,
      points: e.points || 1,
      skuId: e.id,
      goodsId: e.goodsId,
      originalPrice: e.price || 0,
      thumbnail: e.thumbnail || "",
      goodsName: e.goodsName || "",
      quantity: e.quantity || "",
      storeName: e.storeName || "",
      price: e.price || "",
      goodsType: e.goodsType,
    };
    list.push(obj);
  });
  promotionGoodsList.value = list;
}
</script>

<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}

.describe {
  font-size: 12px;
  margin-left: 10px;
  color: #999;
}

.wrapper {
  min-height: 800px;
}

.points-goods-time-form-item {
  :deep(.el-date-editor.el-date-editor--datetimerange) {
    width: 420px !important;
    min-width: 420px;
    max-width: 420px;
    flex-shrink: 0;
  }
}
</style>
