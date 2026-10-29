<template>
  <div class="points-goods-edit-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>{{ onlyView ? "积分商品详情" : "编辑积分商品" }}</span>
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
          <el-button @click="closeCurrentPage">返回积分商品列表</el-button>
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
          <div class="font-semibold text-dark">
            {{ form.goodsName || form.goodsSku?.goodsName || "-" }}
          </div>
          <div v-if="form.goodsId" class="sub-id-text font-mono">
            商品ID: {{ form.goodsId }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="SKU编码">
          <span class="font-mono text-dark">
            {{ form.skuId || form.goodsSku?.id || "-" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="所属店铺">
          <span class="text-secondary">
            {{ form.goodsSku?.storeName || form.storeName || "-" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="商品原价">
          <span class="original-price-val font-mono">
            {{ $filters.unitPrice(goodsPrice, "￥") }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="商品库存">
          <span class="font-mono text-dark">
            {{ form.goodsSku?.quantity != null ? `${form.goodsSku.quantity} 件` : "-" }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 积分兑换配置区域 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">积分兑换规则与参数</span>
      </div>

      <!-- 查看模式：以结构化描述列表呈现 -->
      <template v-if="onlyView">
        <el-descriptions :column="2" border class="custom-descriptions">
          <el-descriptions-item label="兑换所需积分">
            <span class="points-highlight font-mono font-semibold">
              {{ form.points != null ? `${form.points} 积分` : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="结算价格">
            <span class="font-mono font-semibold text-dark">
              {{ form.settlementPrice != null ? $filters.unitPrice(form.settlementPrice, "￥") : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="积分商品分类">
            <el-tag size="small" effect="plain" type="primary">
              {{ currentCategoryName || "未设置分类" }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="活动库存">
            <span class="font-mono text-dark font-semibold">
              {{ form.activeStock != null ? `${form.activeStock} 件` : "-" }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="活动时间" :span="2">
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
          <el-form-item label="兑换积分" prop="points">
            <el-input
              v-model="form.points"
              type="number"
              placeholder="请填写所需兑换积分"
              clearable
              style="width: 280px"
            >
              <template #append>积分</template>
            </el-input>
          </el-form-item>

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

          <el-form-item label="积分分类" prop="pointsGoodsCategoryId">
            <el-select
              v-model="form.pointsGoodsCategoryId"
              placeholder="请选择积分商品分类"
              style="width: 280px"
              @change="changeCategory"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="活动库存" prop="activeStock">
            <el-input
              v-model="form.activeStock"
              type="number"
              placeholder="请填写活动库存数量"
              clearable
              style="width: 280px"
            >
              <template #append>件</template>
            </el-input>
          </el-form-item>

          <el-form-item label="活动时间" required class="points-activity-time-item">
            <el-date-picker
              v-model="form.rangeTime"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="请选择活动时间"
              :disabled-date="disabledDate"
              style="width: 380px"
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
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  updatePointsGoods,
  getPointsGoodsById,
  getPointsGoodsCategoryList,
} from "@/api/promotion";
import { Message } from "@/utils/message";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "editPointsGoods" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const id = computed(() => route.query.id || "");
const onlyView = computed(() => {
  return route.query.onlyView === "true" || route.query.onlyView === true;
});

const pointsGoodsCategoryId = ref("");
const pointsGoodsCategoryName = ref("");
const form = ref({
  promotionName: "",
  applyEndTime: "",
  startTime: "",
  seckillPeriod: [],
  seckillRule: "",
  goodsSku: {},
  promotionStatus: "NEW",
  rangeTime: [],
});

const categoryList = ref([]);
const submitLoading = ref(false);

const formRule = {
  settlementPrice: [{ required: true, message: "请填写结算价格", trigger: "blur" }],
  pointsGoodsCategoryId: [
    { required: true, message: "请选择积分商品分类", trigger: "change" },
  ],
  points: [{ required: true, message: "请填写兑换积分", trigger: "blur" }],
  activeStock: [{ required: true, message: "请填写库存", trigger: "blur" }],
};

const formRef = ref(null);

const goodsThumbnail = computed(() => {
  return form.value.thumbnail || form.value.goodsSku?.thumbnail || "";
});

const goodsPrice = computed(() => {
  if (form.value.goodsSku?.price != null) return form.value.goodsSku.price;
  if (form.value.originalPrice != null) return form.value.originalPrice;
  return 0;
});

const currentCategoryName = computed(() => {
  if (pointsGoodsCategoryName.value) return pointsGoodsCategoryName.value;
  if (form.value.pointsGoodsCategoryName) return form.value.pointsGoodsCategoryName;
  const match = categoryList.value.find(
    (c) => c.id === (pointsGoodsCategoryId.value || form.value.pointsGoodsCategoryId)
  );
  return match ? match.name : "";
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

function disabledDate(date) {
  return date && date.getTime() < Date.now() - 86400000;
}

function changeCategory(catId) {
  const item = categoryList.value.find((c) => c.id === catId);
  pointsGoodsCategoryId.value = catId;
  pointsGoodsCategoryName.value = item ? item.name : "";
}

function closeCurrentPage() {
  if (appStore?.removeTag) {
    appStore.removeTag("edit-points-goods");
  }
  if (localStorage?.pageOpenedList && appStore?.pageOpenedList) {
    localStorage.pageOpenedList = JSON.stringify(appStore.pageOpenedList);
  }
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push({ name: "points-goods" });
  }
}

function getData() {
  if (!id.value) return;
  getPointsGoodsById(id.value).then((res) => {
    if (res && res.success && res.result) {
      const data = res.result;
      form.value = {
        ...data,
        goodsSku: data.goodsSku || {},
      };
      if (data.startTime && data.endTime) {
        form.value.rangeTime = [data.startTime, data.endTime];
      } else {
        form.value.rangeTime = [];
      }
      if (data.pointsGoodsCategoryId) {
        changeCategory(data.pointsGoodsCategoryId);
      }
    }
  });
}

async function getCategory() {
  try {
    const res = await getPointsGoodsCategoryList();
    if (res && res.success && res.result) {
      categoryList.value = res.result.records || [];
    }
  } catch (e) {
    console.error("加载积分商品分类失败", e);
  }
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (!form.value.rangeTime || form.value.rangeTime.length !== 2) {
        Message.error("请选择活动时间");
        return;
      }
      form.value.startTime = form.value.rangeTime[0];
      form.value.endTime = form.value.rangeTime[1];
      submitLoading.value = true;
      const params = {
        ...form.value,
        pointsGoodsCategoryId:
          pointsGoodsCategoryId.value || form.value.pointsGoodsCategoryId,
        pointsGoodsCategoryName:
          pointsGoodsCategoryName.value || form.value.pointsGoodsCategoryName,
      };
      updatePointsGoods(params)
        .then((res) => {
          if (res && res.success) {
            Message.success("积分商品修改成功");
            closeCurrentPage();
          }
        })
        .finally(() => {
          submitLoading.value = false;
        });
    }
  });
}

onMounted(async () => {
  await getCategory();
  if (id.value) {
    getData();
  }
});
</script>

<style lang="scss" scoped>
.points-goods-edit-page {
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

      .points-highlight {
        color: #f56c6c;
        font-size: 16px;
      }
    }

    .edit-form {
      padding: 8px 12px;

      .points-activity-time-item {
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
