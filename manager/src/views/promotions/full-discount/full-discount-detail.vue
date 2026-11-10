<!--
  管理端-满减/满折/满赠活动详情只读视图（适配 1~3 级阶梯及满赠多赠品展示）
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <div class="full-discount-detail-page">
    <!-- 顶部标题与返回栏 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>{{ activityTypeTitle }}详情</span>
            <el-tag type="info" size="small" effect="plain" class="mode-tag">
              只读模式
            </el-tag>
            <span v-if="id" class="activity-id font-mono">ID: {{ id }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="back">返回</el-button>
        </div>
      </div>
    </el-card>

    <!-- 活动基本信息卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">基本信息</span>
      </div>

      <el-descriptions :column="2" border class="custom-descriptions">
        <el-descriptions-item label="活动名称">
          <span class="font-semibold text-dark">{{ form.promotionName || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动类型">
          <el-tag size="small" :type="activityTagType">{{ activityTypeTitle }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="活动范围">
          <el-tag size="small" effect="light" :type="form.scopeType === 'ALL' ? 'success' : 'primary'">
            {{ form.scopeType === "ALL" ? "全品类通用" : "指定商品适用" }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="活动时间">
          <span class="font-mono text-dark">
            {{ form.startTime || "-" }} 至 {{ form.endTime || "-" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="活动描述" :span="2">
          <span class="text-secondary">{{ form.description || "暂无活动描述" }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 阶梯优惠规则卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">阶梯优惠规则</span>
        <span class="section-badge">共 {{ (form.ruleList || []).length }} 级阶梯（仅生效满足的最高一级）</span>
      </div>

      <el-descriptions :column="1" border class="custom-descriptions">
        <el-descriptions-item
          v-for="(tier, idx) in form.ruleList || []"
          :key="idx"
          :label="`第 ${idx + 1} 级阶梯`"
        >
          <span class="money-highlight font-mono font-semibold">
            满 ¥ {{ Number(tier.fullMoney || 0).toFixed(2) }}
          </span>
          <template v-if="form.activityType === 'FULL_MINUS'">
            <el-tag size="small" effect="light" type="danger" class="ml_10">减现金</el-tag>
            <span class="money-highlight font-mono font-semibold ml_10">
              立减 ¥ {{ Number(tier.fullMinus || 0).toFixed(2) }}
            </span>
          </template>
          <template v-else-if="form.activityType === 'FULL_RATE'">
            <el-tag size="small" effect="light" type="warning" class="ml_10">打折</el-tag>
            <span class="money-highlight font-mono font-semibold ml_10">
              打 {{ tier.fullRate }} 折
            </span>
          </template>
          <template v-else-if="form.activityType === 'FULL_GIFT'">
            <el-tag size="small" effect="light" type="success" class="ml_10">满赠</el-tag>
            <div class="tier-gift-tags">
              <el-tag
                v-for="(gift, gIdx) in tier.giftItems || []"
                :key="gIdx"
                size="small"
                type="success"
                effect="plain"
              >
                {{ formatGiftName(gift) }} × {{ gift.num || 1 }}件
              </el-tag>
            </div>
          </template>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 指定参与商品列表（当指定商品时展示） -->
    <el-card
      v-if="form.scopeType === 'PORTION_GOODS'"
      shadow="never"
      class="info-card mt_10"
    >
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">指定适用商品列表</span>
        <span class="section-badge">共 {{ (form.promotionGoodsList || []).length }} 件商品</span>
      </div>

      <el-table
        border
        stripe
        :data="form.promotionGoodsList || []"
        style="width: 100%"
        empty-text="暂无指定商品数据"
        class="custom-table"
      >
        <el-table-column label="商品图片" width="76" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row && (row.thumbnail || row.small)"
              :src="row.thumbnail || row.small"
              fit="cover"
              class="table-goods-thumb"
              preview-teleported
              :preview-src-list="[row.thumbnail || row.small]"
            >
              <template #error>
                <div class="thumb-slot">无图</div>
              </template>
            </el-image>
            <div v-else class="table-goods-thumb thumb-slot">无图</div>
          </template>
        </el-table-column>

        <el-table-column label="商品名称" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row">
              <span class="goods-title font-semibold text-dark">{{ row.goodsName || "-" }}</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="商品单价" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row" class="price-val font-mono font-semibold">
              {{ $filters.unitPrice(row.price, "￥") }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="库存" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row" class="font-mono text-dark">{{ row.quantity ?? "-" }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 底部操作栏 -->
    <el-card shadow="never" class="footer-card mt_10">
      <div class="footer-actions">
        <el-button type="primary" @click="back">返回活动列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getFullDiscountById } from "@/api/promotion";
import { getGoodsSkuData } from "@/api/goods";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "full-discount-detail" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const id = ref(route.query.id);
const form = ref({
  activityType: "FULL_MINUS",
  scopeType: "ALL",
  promotionGoodsList: [],
  ruleList: [],
});
const giftList = ref([]);

const activityTypeTitle = computed(() => {
  if (form.value.activityType === "FULL_RATE") return "满折活动";
  if (form.value.activityType === "FULL_GIFT") return "满赠活动";
  return "满减活动";
});

const activityTagType = computed(() => {
  if (form.value.activityType === "FULL_RATE") return "warning";
  if (form.value.activityType === "FULL_GIFT") return "success";
  return "danger";
});

onMounted(() => {
  if (id.value) {
    getDetail();
  }
  getGiftList();
});

function formatGiftName(gift) {
  if (gift?.goodsName) return gift.goodsName;
  const found = giftList.value.find((g) => String(g.id) === String(gift?.skuId));
  return found ? found.goodsName : `赠品 ID: ${gift?.skuId || "-"}`;
}

function getDetail() {
  getFullDiscountById(id.value).then((res) => {
    if (res && res.success && res.result) {
      const data = res.result;
      if (data.scopeType !== "PORTION_GOODS") {
        data.promotionGoodsList = [];
      }
      if (!data.activityType) {
        if (data.fullRateFlag) {
          data.activityType = "FULL_RATE";
        } else if (!data.fullMinusFlag && data.giftFlag) {
          data.activityType = "FULL_GIFT";
        } else {
          data.activityType = "FULL_MINUS";
        }
      }
      if (!Array.isArray(data.ruleList) || !data.ruleList.length) {
        if (data.rulesJson) {
          try {
            data.ruleList = JSON.parse(data.rulesJson);
          } catch (e) {
            data.ruleList = [];
          }
        }
        if (!data.ruleList || !data.ruleList.length) {
          data.ruleList = [
            {
              fullMoney: data.fullMoney,
              fullMinus: data.fullMinus,
              fullRate: data.fullRate,
              giftItems: data.giftId
                ? String(data.giftId)
                    .split(",")
                    .filter(Boolean)
                    .map((skuId) => ({ skuId, goodsName: data.giftSkuName, num: 1 }))
                : [],
            },
          ];
        }
      }
      form.value = data;
    }
  });
}

function getGiftList() {
  const params = {
    pageSize: 50,
    pageNumber: 1,
    marketEnable: "UPPER",
    authFlag: "PASS",
  };
  getGoodsSkuData(params).then((res) => {
    if (res && res.success && res.result) {
      giftList.value = res.result.records || [];
    }
  });
}

function back() {
  appStore.removeTag("full-discount-detail");
  router.go(-1);
}
</script>

<style lang="scss" scoped>
.full-discount-detail-page {
  padding-bottom: 20px;

  .header-card {
    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .mode-tag {
            font-weight: normal;
          }

          .activity-id {
            font-size: 13px;
            font-weight: normal;
            color: #909399;
            background-color: #f4f4f5;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }
      }
    }
  }

  .info-card {
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .section-indicator {
        width: 4px;
        height: 16px;
        border-radius: 2px;
        background-color: #409eff;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }

      .section-badge {
        font-size: 12px;
        color: #909399;
        margin-left: 6px;
      }
    }

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 140px;
        background-color: #fafafa;
        color: #606266;
        font-weight: 500;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }
    }

    .money-highlight {
      color: #f56c6c;
      font-size: 14px;
    }

    .tier-gift-tags {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .custom-table {
      .table-goods-thumb {
        display: block;
        width: 44px;
        height: 44px;
        margin: 0 auto;
        border-radius: 4px;
        border: 1px solid #ebeef5;
      }

      .thumb-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 11px;
        color: #c0c4cc;
        background-color: #fafafa;
      }

      .price-val {
        color: #f56c6c;
      }
    }
  }

  .footer-card {
    .footer-actions {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .font-mono {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-secondary {
    color: #909399;
  }

  .ml_10 {
    margin-left: 10px;
  }
}
</style>
