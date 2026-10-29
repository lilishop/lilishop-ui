<template>
  <div class="kanjia-add-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>添加砍价活动商品</span>
            <el-tag size="small" effect="plain" type="primary" class="mode-tag">
              新增活动
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="closeCurrentPage">返回砍价列表</el-button>
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
          <span class="section-indicator"></span>
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
            style="width: 380px"
          />
          <span class="time-tip-text">请设置砍价活动开展的时间段</span>
        </el-form-item>
      </el-card>

      <!-- 砍价商品列表卡片 -->
      <el-card shadow="never" class="info-card mt_10">
        <div class="card-header-bar">
          <div class="header-title-group">
            <span class="section-indicator"></span>
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
            <el-button type="primary" size="small" @click="openSkuList">
              选择商品
            </el-button>
          </div>
        </div>

        <el-form-item prop="promotionGoodsList" :label-width="0" class="table-form-item">
          <el-table
            border
            stripe
            class="kanjia-goods-table"
            :data="form.promotionGoodsList"
            style="width: 100%"
            empty-text="暂未添加商品，请点击右上角【选择商品】按钮添加"
            @selection-change="changeSelect"
          >
            <el-table-column type="selection" width="50" align="center" />

            <!-- 商品图片 -->
            <el-table-column label="商品图片" width="76" align="center">
              <template #default="{ row }">
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
              </template>
            </el-table-column>

            <!-- 商品名称与SKU -->
            <el-table-column
              prop="goodsName"
              label="商品名称"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <div v-if="row">
                  <div class="font-semibold text-dark">{{ row.goodsName || "-" }}</div>
                  <div v-if="row.skuId" class="sku-sub-text font-mono">
                    SKU: {{ row.skuId }}
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
                  controls-position="right"
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
                  controls-position="right"
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
                  controls-position="right"
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
                  controls-position="right"
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
        </el-form-item>
      </el-card>

      <!-- 底部操作栏 -->
      <el-card shadow="never" class="footer-card mt_10">
        <div class="footer-actions">
          <el-button @click="closeCurrentPage">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            提交创建
          </el-button>
        </div>
      </el-card>
    </el-form>

    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from "vue";
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

const form = reactive({
  promotionGoodsList: [],
  rangeTime: [],
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
  padding: 16px 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  box-sizing: border-box;

  .mt_10 {
    margin-top: 12px;
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

    :deep(.el-card__body) {
      padding: 16px 20px;
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
          font-size: 18px;
          font-weight: 600;
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
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 20px;
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
        font-weight: 600;
        color: #303133;
      }
    }

    .time-tip-text {
      font-size: 13px;
      color: #909399;
      margin-left: 12px;
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
          font-weight: 600;
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
        background-color: #fafafa;
        color: #303133;
        font-weight: 600;
      }

      .goods-thumb-box {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ebeef5;
        margin: 0 auto;

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
    border: none;
    border-radius: 4px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}
</style>
