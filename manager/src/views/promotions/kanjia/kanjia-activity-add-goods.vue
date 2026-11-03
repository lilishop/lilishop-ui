<template>
  <div class="kanjia-add-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>添加砍价活动</span>
          </div>
          <p class="page-description">设置活动时间，选择参与商品并配置砍价规则。</p>
        </div>
        <div class="header-right">
          <el-button :icon="ArrowLeft" @click="closeCurrentPage">返回砍价列表</el-button>
        </div>
      </div>
    </el-card>

    <el-form
      ref="formRef"
      :model="form"
      label-width="110px"
      :rules="formRule"
      class="main-form"
    >
      <!-- 活动时间设置卡片 -->
      <el-card shadow="never" class="info-card mt_10">
        <div class="section-header">
          <span class="section-number">01</span>
          <span class="section-title">活动时间设置</span>
        </div>

        <el-form-item
          label="活动时间"
          prop="rangeTime"
          class="kanjia-activity-time-form-item"
        >
          <el-date-picker
            v-model="form.rangeTime"
            type="datetimerange"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="请选择砍价活动有效时间范围"
            :disabled-date="options.disabledDate"
            class="activity-date-picker"
            range-separator="至"
          />
          <span class="time-tip-text">所有参与商品将使用同一活动时间</span>
        </el-form-item>
      </el-card>

      <!-- 砍价商品列表卡片 -->
      <el-card shadow="never" class="info-card mt_10">
        <div class="card-header-bar">
          <div class="header-title-group">
            <span class="section-number">02</span>
            <span class="section-title">砍价活动商品</span>
            <span class="total-badge">已选 {{ form.promotionGoodsList.length }} 件商品</span>
          </div>
          <div class="header-actions">
            <el-button
              v-if="selectedGoods.length"
              type="danger"
              plain
              size="small"
              @click="delBatch"
            >
              批量删除 ({{ selectedGoods.length }})
            </el-button>
            <el-button
              v-if="form.promotionGoodsList.length"
              link
              type="danger"
              size="small"
              @click="clearAllGoods"
            >
              清空商品
            </el-button>
            <el-button v-if="form.promotionGoodsList.length" type="primary" :icon="Plus" @click="openSkuList">
              选择商品
            </el-button>
          </div>
        </div>

        <el-form-item prop="promotionGoodsList" :label-width="0" class="table-form-item">
          <el-table
            v-if="form.promotionGoodsList.length"
            scrollbar-always-on
            class="kanjia-goods-table"
            :data="form.promotionGoodsList"
            style="width: 100%"
            empty-text="暂未添加商品，请点击右上角【选择商品】按钮添加"
            @selection-change="changeSelect"
          >
            <el-table-column type="selection" width="50" align="center" />

            <!-- 商品图片 -->
            <el-table-column label="商品信息" min-width="290">
              <template #default="{ row }">
                <div class="product-info">
                <div v-if="row && row.thumbnail" class="goods-thumb-box">
                  <el-image
                    :src="row.thumbnail"
                    fit="cover"
                    preview-teleported
                    :preview-src-list="[row.thumbnail]"
                    class="goods-thumb-img"
                  >
                    <template #error>
                      <div class="thumb-slot">无图</div>
                    </template>
                  </el-image>
                </div>
                <div v-else class="goods-thumb-box thumb-slot">无图</div>
                <div v-if="row" class="product-details">
                  <div class="product-name text-dark" :title="row.goodsName">{{ row.goodsName || "-" }}</div>
                  <div v-if="row.skuId" class="sku-sub-text font-mono">
                    SKU: {{ row.skuId }}
                  </div>
                </div>
                </div>
              </template>
            </el-table-column>

            <!-- 所属商家 -->
            <el-table-column
              prop="storeName"
              label="所属商家"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="text-secondary">{{ (row && row.storeName) || "-" }}</span>
              </template>
            </el-table-column>

            <!-- 商品原价 -->
            <el-table-column label="商品原价" width="110" align="right">
              <template #default="{ row }">
                <span v-if="row" class="font-mono text-dark">
                  {{ $filters.unitPrice(row.price || row.originalPrice, "￥") }}
                </span>
              </template>
            </el-table-column>

            <!-- 当前库存 -->
            <el-table-column label="可用库存" width="90" align="right">
              <template #default="{ row }">
                <span v-if="row" class="font-mono text-dark">{{ row.quantity ?? "-" }}</span>
              </template>
            </el-table-column>

            <!-- 结算价格 -->
            <el-table-column label="结算价格(元)" width="140" align="center">
              <template #default="{ $index }">
                <el-input-number
                  v-model="form.promotionGoodsList[$index].settlementPrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  class="kanjia-goods-input"
                  placeholder="结算价"
                />
              </template>
            </el-table-column>

            <!-- 最低砍 -->
            <el-table-column label="最低可砍(元)" width="140" align="center">
              <template #default="{ $index }">
                <el-input-number
                  v-model="form.promotionGoodsList[$index].lowestPrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  class="kanjia-goods-input"
                  placeholder="最低可砍"
                />
              </template>
            </el-table-column>

            <!-- 最高砍 -->
            <el-table-column label="最高可砍(元)" width="140" align="center">
              <template #default="{ $index }">
                <el-input-number
                  v-model="form.promotionGoodsList[$index].highestPrice"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  class="kanjia-goods-input"
                  placeholder="最高可砍"
                />
              </template>
            </el-table-column>

            <!-- 活动库存 -->
            <el-table-column label="活动库存(件)" width="130" align="center">
              <template #default="{ $index }">
                <el-input-number
                  v-model="form.promotionGoodsList[$index].stock"
                  :min="1"
                  :precision="0"
                  :controls="false"
                  class="kanjia-goods-input"
                  placeholder="活动库存"
                />
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  link
                  @click="delGoods($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="goods-empty">
            <div class="empty-icon"><el-icon :size="28"><ShoppingBag /></el-icon></div>
            <h3>选择参与砍价的商品</h3>
            <p>添加商品后，可逐项设置结算价格、可砍金额和活动库存</p>
            <el-button type="primary" :icon="Plus" @click="openSkuList">选择活动商品</el-button>
          </div>
        </el-form-item>
      </el-card>

      <!-- 底部操作栏 -->
      <el-card shadow="never" class="footer-card mt_10">
        <div class="footer-actions">
          <span class="footer-summary">已选 <strong>{{ form.promotionGoodsList.length }}</strong> 件商品</span>
          <div class="footer-buttons">
          <el-button @click="closeCurrentPage">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            提交创建
          </el-button>
          </div>
        </div>
      </el-card>
    </el-form>

    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from "vue";
import { ArrowLeft, Plus, ShoppingBag } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { saveKanJiaActivityGoods } from "@/api/promotion";
import { regular } from "@/utils";
import skuSelect from "@/components/lili-dialog";
import { isECoupon } from "@/constants/goodsType";
import { ElMessage } from "element-plus";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "add-kanjia-activity-goods" });

const router = useRouter();
const appStore = useAppStore();

function getDefaultActivityTime() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [unixToDate(start.getTime() / 1000), unixToDate(end.getTime() / 1000)];
}

const form = reactive({
  promotionGoodsList: [],
  rangeTime: getDefaultActivityTime(),
});

const submitLoading = ref(false);
const selectedGoods = ref([]);

const formRule = {
  promotionGoodsList: [
    {
      type: "array",
      required: true,
      min: 1,
      message: "请至少选择一个商品",
      trigger: "change",
    },
  ],
  rangeTime: [
    {
      type: "array",
      required: true,
      message: "请选择活动时间",
      trigger: "change",
    },
  ],
};

const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const formRef = ref(null);
const skuSelectRef = ref(null);

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    if (!form.promotionGoodsList.length) {
      ElMessage.warning("请至少选择一个商品");
      return;
    }

    const params = JSON.parse(JSON.stringify(form));
    const [start, end] = form.rangeTime || [];
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    params.startTime = unixToDate(startDate.getTime() / 1000);
    params.endTime = unixToDate(endDate.getTime() / 1000);
    delete params.rangeTime;

    let checkResult = true;
    for (let i = 0; i < form.promotionGoodsList.length; i++) {
      const res = form.promotionGoodsList[i];
      const eCoupon = isECoupon(res.goodsType);
      if (res.stock <= 0 || res.stock > res.quantity) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】活动库存不能为0且不能超过可用库存`);
        break;
      }

      if (!regular.money.test(res.settlementPrice)) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】结算价格金额格式不正确`);
        break;
      }
      if (
        (eCoupon ? res.settlementPrice < 0 : res.settlementPrice <= 0) ||
        res.settlementPrice > res.price
      ) {
        checkResult = false;
        ElMessage.error(
          eCoupon
            ? `商品【${res.goodsName}】结算价格不能小于0且不能超过商品原价`
            : `商品【${res.goodsName}】结算价格不能为0且不能超过商品原价`
        );
        break;
      }
      if (!regular.money.test(res.highestPrice)) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】最高可砍金额格式错误`);
        break;
      }
      if (res.highestPrice <= 0 || res.highestPrice > res.price) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】最高可砍金额不能为0且不能超过商品原价`);
        break;
      }
      if (!regular.money.test(res.lowestPrice)) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】最低可砍金额格式错误`);
        break;
      }
      if (
        res.lowestPrice < 0 ||
        (!eCoupon && res.lowestPrice <= 0) ||
        res.lowestPrice > res.price
      ) {
        checkResult = false;
        ElMessage.error(
          eCoupon
            ? `商品【${res.goodsName}】最低可砍金额不能小于0`
            : `商品【${res.goodsName}】最低可砍金额不能为0`
        );
        break;
      }
      if (parseFloat(res.lowestPrice) > parseFloat(res.highestPrice)) {
        checkResult = false;
        ElMessage.error(`商品【${res.goodsName}】最低砍价金额不能大于最高砍价金额`);
        break;
      }
    }

    if (!checkResult) {
      return;
    }

    submitLoading.value = true;
    saveKanJiaActivityGoods(params)
      .then((res) => {
        if (res && res.success) {
          ElMessage.success("砍价活动添加成功");
          closeCurrentPage();
        }
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
}

function closeCurrentPage() {
  if (appStore?.removeTag) {
    appStore.removeTag("add-kanjia-activity-goods");
    appStore.removeTag("add-kan-jia-goods");
  }
  if (localStorage?.pageOpenedList && appStore?.pageOpenedList) {
    localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  }
  router.go(-1);
}

function openSkuList() {
  skuSelectRef.value.open("goods");
  const data = JSON.parse(JSON.stringify(form.promotionGoodsList));
  data.forEach((e) => {
    e.id = e.skuId;
  });
  skuSelectRef.value.goodsData = data;
}

function changeSelect(e) {
  selectedGoods.value = e || [];
}

function delGoods(index) {
  form.promotionGoodsList.splice(index, 1);
  touchPromotionGoodsValidate();
}

function delBatch() {
  if (!selectedGoods.value.length) return;
  const skuIds = new Set(selectedGoods.value.map((g) => g.skuId || g.id));
  form.promotionGoodsList = form.promotionGoodsList.filter(
    (g) => !skuIds.has(g.skuId || g.id)
  );
  selectedGoods.value = [];
  touchPromotionGoodsValidate();
}

function clearAllGoods() {
  form.promotionGoodsList = [];
  selectedGoods.value = [];
  touchPromotionGoodsValidate();
}

function touchPromotionGoodsValidate() {
  nextTick(() => {
    const f = formRef.value;
    if (f && typeof f.validateField === "function") {
      f.validateField("promotionGoodsList", () => {});
    }
  });
}

function selectedGoodsData(item) {
  const list = [];
  item.forEach((e) => {
    list.push({
      settlementPrice: e.settlementPrice || 0,
      purchasePrice: 0,
      lowestPrice: e.lowestPrice || 0,
      highestPrice: e.highestPrice || 0,
      stock: e.stock || 0,
      goodsName: e.goodsName,
      price: e.price,
      originalPrice: e.price,
      quantity: e.quantity,
      storeId: e.storeId,
      storeName: e.storeName,
      skuId: e.id,
      goodsId: e.goodsId,
      thumbnail: e.thumbnail || "",
      goodsType: e.goodsType,
    });
  });
  form.promotionGoodsList = list;
  touchPromotionGoodsValidate();
}
</script>

<style lang="scss" scoped>
.kanjia-add-page {
  padding: 12px 20px 24px;
  max-width: 1640px;
  margin: 0 auto;
  box-sizing: border-box;

  .mt_10 {
    margin-top: 16px;
  }

  .font-mono {
    font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-secondary {
    color: #606266;
  }

  .header-card {
    border: none;
    border-radius: 4px;
    background: transparent;

    :deep(.el-card__body) {
      padding: 8px 0 4px;
    }

    .page-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 22px;
          font-weight: 500;
          color: #1f2d3d;

          .mode-tag {
            font-weight: normal;
          }
        }
      }
    }
  }

  .main-form {
    .table-form-item {
      margin-bottom: 0;

      :deep(.el-form-item__content) {
        margin-left: 0 !important;
      }
    }
  }

  .info-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    :deep(.el-card__body) {
      padding: 20px 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .section-indicator {
        width: 4px;
        height: 16px;
        background-color: #409eff;
        border-radius: 2px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
      }
    }

    .time-tip-text {
      font-size: 13px;
      color: #909399;
      margin-top: 6px;
      width: 100%;
    }

    .card-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .section-indicator {
          width: 4px;
          height: 16px;
          background-color: #409eff;
          border-radius: 2px;
        }

        .section-title {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .total-badge {
          font-size: 13px;
          color: #909399;
          margin-left: 6px;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .kanjia-goods-table {
      :deep(th.el-table__cell) {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-secondary);
        font-weight: 400;
        padding: 12px 0;
      }

      .goods-thumb-box {
        width: 48px;
        height: 48px;
        flex: 0 0 48px;
        border-radius: 6px;
        overflow: hidden;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ebeef5;
        margin: 0;

        .goods-thumb-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      .thumb-slot {
        font-size: 11px;
        color: #c0c4cc;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sku-sub-text {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }

      .kanjia-goods-input {
        width: 100%;
      }
    }
  }

  .footer-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 4px 18px rgb(31 45 61 / 5%);

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
  }

  .page-description { margin: 8px 0 0; color: var(--el-text-color-secondary); font-size: 13px; }
  .section-number { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 28px; height: 28px; border-radius: 7px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 12px; font-weight: 500; }
  .kanjia-activity-time-form-item { margin: 16px 0 0 36px; }
  .kanjia-activity-time-form-item :deep(.el-form-item__content) { min-width: 0; }
  :deep(.activity-date-picker.el-date-editor) { flex: 0 1 520px; width: 520px; max-width: 100%; }
  .goods-empty { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 230px; border: 1px dashed var(--el-border-color); border-radius: 8px; background: var(--el-fill-color-lighter); padding: 24px 20px; text-align: center; }
  .empty-icon { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 16px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); margin-bottom: 16px; }
  .goods-empty h3 { margin: 0; font-size: 16px; font-weight: 500; color: var(--el-text-color-primary); }
  .goods-empty p { margin: 8px 0 20px; font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.6; }
  .product-info { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
  .product-details { min-width: 0; }
  .product-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; }
  .sku-sub-text { overflow-wrap: anywhere; }
  .footer-summary { font-size: 13px; color: var(--el-text-color-secondary); }
  .footer-summary strong { color: var(--el-color-primary); font-weight: 500; padding: 0 4px; }
  .footer-buttons { display: flex; gap: 12px; }
  .footer-buttons :deep(.el-button + .el-button) { margin-left: 0; }
  @media (max-width: 768px) {
    padding: 8px 8px 20px;
    .page-header-row, .card-header-bar { flex-wrap: wrap; gap: 16px; }
    .info-card :deep(.el-card__body) { padding: 16px; }
    .kanjia-activity-time-form-item { margin-left: 0; }
    .kanjia-activity-time-form-item :deep(.el-form-item__label) { width: 80px !important; }
    .header-title-group { flex-wrap: wrap; }
    .footer-card :deep(.el-card__body) { padding: 14px 16px; }
  }
}
</style>
