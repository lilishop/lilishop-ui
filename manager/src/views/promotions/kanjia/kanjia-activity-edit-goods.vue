<template>
  <div class="kanjia-edit-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>{{ onlyView ? "砍价活动商品详情" : "编辑砍价活动商品" }}</span>
            <el-tag
              size="small"
              effect="plain"
              :type="onlyView ? 'info' : 'warning'"
              class="mode-tag"
            >
              {{ onlyView ? "查看模式" : "编辑模式" }}
            </el-tag>
            <el-tag
              v-if="form.promotionStatus"
              size="small"
              effect="dark"
              :type="promotionStatusTagType(form.promotionStatus)"
              class="status-tag"
            >
              {{ promotionStatusText(form.promotionStatus) }}
            </el-tag>
            <span v-if="id" class="activity-id font-mono">ID: {{ id }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="closeCurrentPage">返回砍价列表</el-button>
        </div>
      </div>
    </el-card>

    <!-- 商品基本信息卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">商品基本信息</span>
      </div>

      <el-descriptions :column="2" border class="custom-descriptions">
        <el-descriptions-item label="商品图片" width="120px">
          <div class="goods-thumb-box">
            <el-image
              v-if="goodsThumbnail"
              :src="goodsThumbnail"
              fit="cover"
              preview-teleported
              :preview-src-list="[goodsThumbnail]"
              class="goods-thumb-img"
            >
              <template #error>
                <div class="thumb-slot">无图</div>
              </template>
            </el-image>
            <div v-else class="thumb-slot">无图</div>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="商品名称">
          <div class="font-semibold text-dark">{{ form.goodsName || "-" }}</div>
          <div v-if="form.goodsId" class="sub-id-text font-mono">
            商品ID: {{ form.goodsId }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="SKU编码">
          <span class="font-mono text-dark">{{ form.skuId || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="所属店铺">
          <span class="text-secondary">{{ goodsStoreName }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="商品原价">
          <span class="original-price-val font-mono">
            {{ $filters.unitPrice(goodsPrice, "￥") }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="商品库存">
          <span class="font-mono text-dark">{{ goodsStock }} 件</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 砍价活动配置区域 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">砍价规则与参数</span>
      </div>

      <!-- 查看模式：以结构化描述列表呈现 -->
      <template v-if="onlyView">
        <el-descriptions :column="2" border class="custom-descriptions">
          <el-descriptions-item label="结算价格">
            <span class="price-highlight font-mono font-semibold">
              {{ $filters.unitPrice(form.settlementPrice, "￥") }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="活动库存">
            <span class="font-mono text-dark font-semibold">
              {{ form.stock != null ? `${form.stock} 件` : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="最低可砍金额">
            <span class="font-mono text-dark">
              {{ $filters.unitPrice(form.lowestPrice, "￥") }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="最高可砍金额">
            <span class="font-mono text-dark">
              {{ $filters.unitPrice(form.highestPrice, "￥") }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item
            v-if="form.purchasePrice != null"
            label="最低购买金额"
          >
            <span class="font-mono text-dark">
              {{ $filters.unitPrice(form.purchasePrice, "￥") }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="活动时间" :span="form.purchasePrice != null ? 1 : 2">
            <span class="font-mono text-dark">
              {{ activityTimeRange }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 编辑模式：表单输入 -->
      <template v-else>
        <el-form
          ref="formRef"
          :model="form"
          label-width="120px"
          :rules="formRule"
          class="edit-form"
        >
          <el-form-item label="结算价格" prop="settlementPrice">
            <el-input
              v-model="form.settlementPrice"
              type="number"
              placeholder="请填写结算价格"
              clearable
              style="width: 280px"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="最低可砍" prop="lowestPrice">
            <el-input
              v-model="form.lowestPrice"
              type="number"
              placeholder="请填写最低可砍金额"
              clearable
              style="width: 280px"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="最高可砍" prop="highestPrice">
            <el-input
              v-model="form.highestPrice"
              type="number"
              placeholder="请填写最高可砍金额"
              clearable
              style="width: 280px"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="活动库存" prop="stock">
            <el-input
              v-model="form.stock"
              type="number"
              placeholder="请填写活动库存"
              clearable
              style="width: 280px"
            >
              <template #append>件</template>
            </el-input>
          </el-form-item>

          <el-form-item
            label="活动时间"
            prop="rangeTime"
            class="kanjia-activity-time-form-item"
          >
            <el-date-picker
              v-model="form.rangeTime"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="请选择活动时间"
              :disabled-date="options.disabledDate"
            />
          </el-form-item>
        </el-form>
      </template>
    </el-card>

    <!-- 底部操作栏 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button @click="closeCurrentPage">
          {{ onlyView ? "返回" : "取消" }}
        </el-button>
        <el-button
          v-if="!onlyView"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          保存修改
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getKanJiaActivityGoodsById, editKanJiaActivityGoods } from "@/api/promotion";
import { regular } from "@/utils";
import { isECoupon } from "@/constants/goodsType";
import { ElMessage } from "element-plus";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "editKanjiaActivityGoods" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const id = computed(() => route.query.id || "");
const onlyView = computed(() => {
  return route.query.onlyView === "true" || route.query.onlyView === true;
});

const submitLoading = ref(false);
const form = ref({
  purchasePrice: 0,
  goodsSku: {},
  rangeTime: [],
});

const goodsThumbnail = computed(() => {
  return form.value.thumbnail || form.value.goodsSku?.thumbnail || "";
});

const goodsStoreName = computed(() => {
  return form.value.goodsSku?.storeName || form.value.storeName || "-";
});

const goodsPrice = computed(() => {
  if (form.value.goodsSku?.price != null) return form.value.goodsSku.price;
  if (form.value.originalPrice != null) return form.value.originalPrice;
  return 0;
});

const goodsStock = computed(() => {
  if (form.value.goodsSku?.quantity != null) return form.value.goodsSku.quantity;
  return "-";
});

const activityTimeRange = computed(() => {
  const start = form.value.startTime || (form.value.rangeTime && form.value.rangeTime[0]);
  const end = form.value.endTime || (form.value.rangeTime && form.value.rangeTime[1]);
  if (start && end) {
    return `${start} 至 ${end}`;
  }
  return start || end || "-";
});

function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || status;
}

function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "info";
}

const checkSettlementPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("结算金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("结算金额设置超过上限值"));
  } else {
    callback();
  }
};

const checkLowestPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("最低可砍金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("最低可砍金额设置超过上限值"));
  } else {
    callback();
  }
};

const checkHighestPrice = (rule, value, callback) => {
  if (!value && value !== 0) {
    return callback(new Error("最高可砍金额不能为空"));
  }
  if (!regular.money.test(value)) {
    callback(new Error("请输入正整数或者两位小数"));
  } else if (parseFloat(value) > 99999999) {
    callback(new Error("最高可砍金额设置超过上限值"));
  } else {
    callback();
  }
};

const formRule = {
  settlementPrice: [
    { required: true, message: "请输入结算金额" },
    { validator: checkSettlementPrice },
  ],
  lowestPrice: [
    { required: true, message: "请输入最低可砍金额" },
    { validator: checkLowestPrice },
  ],
  highestPrice: [
    { required: true, message: "请输入最高可砍金额" },
    { validator: checkHighestPrice },
  ],
  rangeTime: [
    {
      type: "array",
      required: true,
      message: "请选择活动时间",
      trigger: "change",
    },
  ],
  stock: [{ required: true, message: "请输入活动库存" }],
};

const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const formRef = ref(null);

onMounted(() => {
  if (id.value) {
    getKanJiaActivityGoods();
  }
});

function getKanJiaActivityGoods() {
  getKanJiaActivityGoodsById(id.value).then((res) => {
    if (res && res.success && res.result) {
      form.value = {
        ...res.result,
        goodsSku: res.result.goodsSku || {},
        rangeTime: [res.result.startTime, res.result.endTime],
      };
    }
  });
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    const params = JSON.parse(JSON.stringify(form.value));
    const [start, end] = form.value.rangeTime || [];
    if (!start || !end) {
      ElMessage.error("请选择活动时间");
      return;
    }
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    params.startTime = unixToDate(startDate.getTime() / 1000);
    params.endTime = unixToDate(endDate.getTime() / 1000);
    delete params.rangeTime;

    const eCoupon = isECoupon(params.goodsType || params.goodsSku?.goodsType);

    if (params.stock <= 0 || (params.goodsSku?.quantity != null && params.stock > params.goodsSku.quantity)) {
      ElMessage.error("活动库存不能为0且不能超过商品库存");
      return;
    }
    if (!regular.money.test(params.settlementPrice)) {
      ElMessage.error("结算价格金额格式不正确");
      return;
    }
    if (
      (eCoupon ? params.settlementPrice < 0 : params.settlementPrice <= 0) ||
      params.settlementPrice > (params.price || goodsPrice.value)
    ) {
      ElMessage.error(
        eCoupon
          ? "结算价格不能小于0且不能超过商品价格"
          : "结算价格金额不能为0且不能超过商品价格"
      );
      return;
    }
    if (!regular.money.test(params.highestPrice)) {
      ElMessage.error("最高可砍金额格式错误");
      return;
    }
    if (params.highestPrice <= 0 || params.highestPrice > (params.price || goodsPrice.value)) {
      ElMessage.error("最高可砍金额不能为0且不能超过商品价格");
      return;
    }
    if (!regular.money.test(params.lowestPrice)) {
      ElMessage.error("最低可砍金额格式错误");
      return;
    }
    if (
      params.lowestPrice < 0 ||
      (!eCoupon && params.lowestPrice <= 0) ||
      params.lowestPrice > (params.price || goodsPrice.value)
    ) {
      ElMessage.error(eCoupon ? "最低可砍金额不能小于0" : "最低可砍金额不能为0");
      return;
    }
    if (parseFloat(params.lowestPrice) > parseFloat(params.highestPrice)) {
      ElMessage.error("最低砍价金额不能大于最高砍价金额");
      return;
    }

    submitLoading.value = true;
    editKanJiaActivityGoods(params)
      .then((res) => {
        if (res && res.success) {
          ElMessage.success("砍价活动修改成功");
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
    appStore.removeTag("add-kan-jia-goods");
    appStore.removeTag("edit-kanJia-activity-goods");
  }
  if (localStorage?.pageOpenedList && appStore?.pageOpenedList) {
    localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  }
  router.go(-1);
}
</script>

<style lang="scss" scoped>
.kanjia-edit-page {
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

          .mode-tag,
          .status-tag {
            font-weight: normal;
          }

          .activity-id {
            font-size: 13px;
            color: #909399;
            font-weight: normal;
          }
        }
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

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 130px;
        background-color: #f8f9fb;
        color: #606266;
        font-weight: 500;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }

      .goods-thumb-box {
        width: 56px;
        height: 56px;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ebeef5;

        .goods-thumb-img {
          width: 100%;
          height: 100%;
          display: block;
        }

        .thumb-slot {
          font-size: 12px;
          color: #c0c4cc;
        }
      }

      .sub-id-text {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      .original-price-val {
        color: #303133;
        font-size: 14px;
      }

      .price-highlight {
        color: #f56c6c;
        font-size: 16px;
      }
    }

    .edit-form {
      padding: 8px 12px;

      .kanjia-activity-time-form-item {
        :deep(.el-date-editor) {
          width: 380px !important;
          max-width: 380px;
          flex-grow: 0;
        }
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
