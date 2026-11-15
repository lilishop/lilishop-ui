<template>
  <div class="coupon-activity-info-page">
    <!-- 顶部活动标题 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header-row">
        <div class="header-left">
          <div class="header-title">
            <span>优惠券活动详情</span>
            <span>
              {{ statusText(couponActivity.promotionStatus) }}
            </span>
            <span v-if="id">ID: {{ id }}</span>
          </div>
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
          <span>{{ couponActivity.promotionName || "-" }}</span>
        </el-descriptions-item>

        <el-descriptions-item label="活动类型">
          <span>
            {{ activityTypeText(couponActivity.couponActivityType) }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="couponActivity.couponFrequencyEnum"
          label="领取频率"
        >
          <span>{{ frequencyText(couponActivity.couponFrequencyEnum) }}</span>
        </el-descriptions-item>

        <el-descriptions-item
          v-if="couponActivity.couponActivityType === 'SPECIFY' || couponActivity.couponActivityType === 'AUTO_COUPON'"
          label="活动范围"
        >
          <span>
            {{ couponActivity.activityScope === "ALL" ? "全部会员" : "指定会员" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="活动时间" :span="2">
          <span>
            {{ couponActivity.startTime || "-" }} 至 {{ couponActivity.endTime || "-" }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item label="活动状态" :span="2">
          <span>
            {{ statusText(couponActivity.promotionStatus) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 关联优惠券列表卡片 -->
    <el-card shadow="never" class="info-card mt_10">
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">赠送优惠券列表</span>
        <span class="section-badge">共 {{ couponData.length }} 张优惠券</span>
      </div>

      <el-table
        border
        stripe
        :data="couponData"
        style="width: 100%"
        empty-text="暂无关联优惠券"
        class="custom-table"
      >
        <el-table-column prop="couponName" label="优惠券名称" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.couponName || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="优惠券类型" min-width="180" align="center">
          <template #default="{ row }">
            <span v-if="row">
              {{ couponTypeText(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="面额 / 折扣" min-width="180" align="right">
          <template #default="{ row }">
            <template v-if="row">
              <span v-if="row.couponType === 'DISCOUNT'">
                {{ row.couponDiscount }} 折
              </span>
              <span v-else-if="row.couponType === 'PRICE'">
                ¥ {{ Number(row.price || 0).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="num" label="赠送数量" min-width="140" align="right">
          <template #default="{ row }">
            <span>{{ row.num ?? "-" }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 指定会员列表（若存在） -->
    <el-card
      v-if="memberData && memberData.length > 0"
      shadow="never"
      class="info-card mt_10"
    >
      <div class="section-header">
        <span class="section-indicator"></span>
        <span class="section-title">指定参与会员列表</span>
        <span class="section-badge">共 {{ memberData.length }} 位会员</span>
      </div>

      <el-table
        border
        stripe
        :data="memberData"
        style="width: 100%"
        class="custom-table"
      >
        <el-table-column prop="id" label="会员ID" min-width="220">
          <template #default="{ row }">
            <span>{{ row.id || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="nickName" label="会员昵称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.nickName || row.username || "-" }}</span>
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCouponActivity as apiGetCouponActivity } from "@/api/promotion";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "coupon-activity-info" });

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const id = route.query.id;
const couponActivity = ref({});
const couponData = ref([]);
const memberData = ref([]);

onMounted(() => {
  getCouponActivity();
});

function couponTypeText(row) {
  if (row.couponType === "DISCOUNT") return "满折优惠券";
  if (row.couponType === "PRICE") return Number(row.consumeThreshold) === 0 ? "立减优惠券" : "满减优惠券";
  return "未知类型";
}

/** 将后端优惠券活动类型转换为中文，包含礼包和邀新活动。 */
function activityTypeText(t) {
  if (t === "REGISTERED") return "注册赠券";
  if (t === "INVITE_NEW") return "邀新赠券";
  if (t === "AUTO_COUPON") return "自动发券";
  if (t === "SPECIFY") return "精准发券";
  if (t === "COUPON_PACKAGE") return "优惠券礼包";
  return t || "-";
}

function frequencyText(f) {
  if (f === "DAY") return "每日一次";
  if (f === "WEEK") return "每周一次";
  if (f === "MONTH") return "每月一次";
  return f || "-";
}

function statusText(s) {
  if (s === "NEW") return "未开始";
  if (s === "START") return "已开始";
  if (s === "END") return "已结束";
  if (s === "CLOSE") return "已关闭";
  return s || "-";
}

function getCouponActivity() {
  if (!id) return;
  apiGetCouponActivity(id).then((res) => {
    if (res && res.success && res.result) {
      couponActivity.value = res.result;
      couponData.value = Array.isArray(res.result.couponActivityItems)
        ? res.result.couponActivityItems
        : [];
      if (res.result.activityScopeInfo) {
        try {
          const parsed = JSON.parse(res.result.activityScopeInfo);
          memberData.value = Array.isArray(parsed) ? parsed : [];
        } catch {
          memberData.value = [];
        }
      } else {
        memberData.value = [];
      }
    }
  });
}

function back() {
  appStore.removeTag("coupon-activity-info");
  appStore.removeTag("coupon-activity");
  router.go(-1);
}
</script>

<style lang="scss" scoped>
.coupon-activity-info-page {
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

      .section-badge {
        margin-left: 6px;
      }
    }

    .custom-descriptions {
      :deep(.el-descriptions__label) {
        width: 140px;
        background-color: #fafafa;
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

}
</style>
