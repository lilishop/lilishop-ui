<template>
  <div class="points-goods-add-page">
    <div class="page-header">
      <div>
        <h1>添加积分商品</h1>
        <p>设置兑换时间，选择商品并配置兑换积分、价格与库存。</p>
      </div>
      <el-button :icon="ArrowLeft" @click="closeCurrentPage">返回积分商品列表</el-button>
    </div>

    <el-form ref="formRef" :model="form" :rules="formRule" label-width="90px">
      <el-card shadow="never" class="section-card">
        <div class="section-heading">
          <span class="section-number">01</span>
          <h2>活动时间设置</h2>
        </div>
        <el-form-item label="活动时间" prop="rangeTime" class="points-goods-time-form-item">
          <el-date-picker
            type="datetimerange"
            v-model="form.rangeTime"
            format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
            :disabled-date="options.disabledDate"
          />
          <span class="field-hint">所有参与商品将使用同一兑换时间</span>
        </el-form-item>
      </el-card>

      <el-card shadow="never" class="section-card">
        <div class="goods-section-heading">
          <div class="section-heading">
            <span class="section-number">02</span>
            <h2>积分商品</h2>
            <span class="selected-count">已选 {{ promotionGoodsList.length }} 件商品</span>
          </div>
          <div v-if="promotionGoodsList.length" class="goods-actions">
            <el-button v-if="selectedGoods.length" type="danger" plain @click="delSelectGoods">批量删除（{{ selectedGoods.length }}）</el-button>
            <el-button type="primary" :icon="Plus" @click="openSkuList">选择商品</el-button>
          </div>
        </div>
        <el-table
          v-if="promotionGoodsList.length"
          :data="promotionGoodsList"
          class="points-goods-table"
          style="width: 100%"
          row-key="skuId"
          scrollbar-always-on
          @selection-change="changeSelect"
        >
          <el-table-column type="selection" width="48" align="center" />
          <el-table-column label="商品信息" min-width="280">
            <template #default="{ row }">
              <div class="product-info">
                <el-image :src="row.thumbnail" fit="cover" class="product-image" preview-teleported :preview-src-list="row.thumbnail ? [row.thumbnail] : []">
                  <template #error><span class="image-placeholder">无图</span></template>
                </el-image>
                <div class="product-details">
                  <div class="product-name" :title="row.goodsName">{{ row.goodsName || '-' }}</div>
                  <div class="product-code">SKU：{{ row.skuId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <span v-if="row">{{ goodsTypeLabel(row.goodsType) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="storeName" label="所属店铺" min-width="120" show-overflow-tooltip />
          <el-table-column label="商品原价" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="可用库存" width="90" align="right">
            <template #default="{ row }">
              <span v-if="row">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结算价格(元)" width="140" align="center">
            <template #default="{ $index }">
              <el-input-number
                :min="0"
                :controls="false"
                v-model="promotionGoodsList[$index].settlementPrice"
                class="goods-number-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="积分分类" width="160">
            <template #default="{ $index }">
              <el-select
                v-model="promotionGoodsList[$index].pointsGoodsCategoryId"
                @change="(val) => changeCategory(val, $index)"
                style="width: 100%"
                placeholder="请选择分类"
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
          <el-table-column label="活动库存(件)" width="130" align="center">
            <template #default="{ $index }">
              <el-input-number
                :min="0"
                :controls="false"
                v-model="promotionGoodsList[$index].activeStock"
                class="goods-number-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="兑换积分" width="130" align="center">
            <template #default="{ $index }">
              <el-input-number
                :min="0"
                :controls="false"
                v-model="promotionGoodsList[$index].points"
                class="goods-number-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="delGoods($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="goods-empty">
          <div class="empty-icon"><el-icon :size="28"><ShoppingBag /></el-icon></div>
          <h3>选择参与积分兑换的商品</h3>
          <p>添加商品后，可逐项设置积分分类、兑换积分和活动库存</p>
          <el-button type="primary" :icon="Plus" @click="openSkuList">选择活动商品</el-button>
        </div>
      </el-card>

      <el-card shadow="never" class="footer-card">
        <div class="footer-content">
          <span class="selected-count">已选 <strong>{{ promotionGoodsList.length }}</strong> 件商品</span>
          <div class="footer-buttons">
            <el-button @click="closeCurrentPage">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交创建</el-button>
          </div>
        </div>
      </el-card>
    </el-form>
    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { ArrowLeft, Plus, ShoppingBag } from "@element-plus/icons-vue";
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
      if (!row.pointsGoodsCategoryId) {
        Message.error(`请为【${row.goodsName}】选择积分分类`);
        return;
      }
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
      pointsGoodsCategoryId: e.pointsGoodsCategoryId || "",
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
.points-goods-add-page {
  max-width: 1640px;
  margin: 0 auto;
  padding: 12px 20px 24px;
  color: var(--el-text-color-primary);
}
.page-header, .goods-section-heading, .footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.page-header { padding: 8px 0 4px; margin-bottom: 16px; }
.page-header h1 { margin: 0; font-size: 22px; font-weight: 500; }
.page-header p { margin: 8px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.section-card, .footer-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  margin-bottom: 16px;
}
.section-card :deep(.el-card__body) { padding: 20px 24px; }
.section-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.section-heading h2 { margin: 0; font-size: 15px; font-weight: 500; }
.section-number { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 28px; height: 28px; border-radius: 7px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 12px; font-weight: 500; }
.points-goods-time-form-item { margin: 16px 0 0 36px; }
.points-goods-time-form-item :deep(.el-form-item__content) { min-width: 0; }
.points-goods-time-form-item :deep(.el-date-editor) { flex: 0 1 520px; width: 520px; max-width: 100%; }
.field-hint { width: 100%; margin-top: 6px; color: var(--el-text-color-secondary); font-size: 13px; }
.goods-section-heading { margin-bottom: 16px; flex-wrap: wrap; }
.selected-count { color: var(--el-text-color-secondary); font-size: 13px; }
.selected-count strong { padding: 0 4px; color: var(--el-color-primary); font-weight: 500; }
.goods-actions, .footer-buttons { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.goods-actions :deep(.el-button + .el-button), .footer-buttons :deep(.el-button + .el-button) { margin-left: 0; }
.goods-empty { width: 100%; min-height: 230px; padding: 24px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: var(--el-fill-color-lighter); border: 1px dashed var(--el-border-color); border-radius: 8px; box-sizing: border-box; }
.empty-icon { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 16px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); margin-bottom: 16px; }
.goods-empty h3 { margin: 0; font-size: 16px; font-weight: 500; }
.goods-empty p { margin: 8px 0 20px; font-size: 13px; line-height: 1.6; color: var(--el-text-color-secondary); }
.product-info { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.product-image { width: 48px; height: 48px; flex: 0 0 48px; border: 1px solid var(--el-border-color-lighter); border-radius: 6px; }
.image-placeholder { display: grid; place-items: center; width: 100%; height: 100%; font-size: 12px; color: var(--el-text-color-placeholder); background: var(--el-fill-color-light); }
.product-details { min-width: 0; }
.product-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; }
.product-code { margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); font-family: Consolas, monospace; overflow-wrap: anywhere; }
.goods-number-input { width: 100%; }
.points-goods-table :deep(th.el-table__cell) { background: var(--el-fill-color-light); font-weight: 400; padding: 12px 0; }
.footer-card { box-shadow: 0 4px 18px rgb(31 45 61 / 5%); }
.footer-card :deep(.el-card__body) { padding: 16px 24px; }
@media (max-width: 768px) {
  .points-goods-add-page { padding: 8px 8px 20px; }
  .page-header { flex-wrap: wrap; }
  .section-card :deep(.el-card__body) { padding: 16px; }
  .points-goods-time-form-item { margin-left: 0; }
  .points-goods-time-form-item :deep(.el-form-item__label) { width: 80px !important; }
  .footer-card :deep(.el-card__body) { padding: 14px 16px; }
}
</style>
