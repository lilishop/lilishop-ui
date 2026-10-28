<template>
  <div class="panel-coupon">
    <div class="panel-section">
      <div class="section-title">优惠券卡片排版</div>
      <div class="form-item">
        <span class="item-label">单行展示列数</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="3">3 列</el-radio-button>
          <el-radio-button :label="4">4 列</el-radio-button>
          <el-radio-button :label="5">5 列</el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-item">
        <span class="item-label">卡券视觉皮肤</span>
        <el-radio-group v-model="options.skin" size="small">
          <el-radio-button label="red">经典喜庆红</el-radio-button>
          <el-radio-button label="dark">黑金尊享风</el-radio-button>
          <el-radio-button label="gradient">幻彩渐变</el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-item flex-row">
        <span class="item-label">展示使用门槛说明</span>
        <el-switch v-model="options.showLimitText" size="small" />
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title flex-between">
        <span>所选优惠券活动</span>
        <el-button link type="primary" size="small" @click="handleSelectCouponDialog">
          <el-icon><Plus /></el-icon> 选择优惠券
        </el-button>
      </div>

      <div class="coupon-summary">
        已选取 {{ options.couponIds?.length || 0 }} 张优惠券活动。买家端将实时查询当前优惠券可用库存并展示领取状态。
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import { Message } from '@/utils/message';

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

function handleSelectCouponDialog() {
  Message.info('已开启优惠券关联。演示环境已预设可用券活动。');
  if (!Array.isArray(props.options.couponIds)) props.options.couponIds = [];
  props.options.couponIds = ['coupon_1', 'coupon_2', 'coupon_3', 'coupon_4'];
}
</script>

<style lang="scss" scoped>
.panel-coupon {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .coupon-summary {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
    }
  }
}
</style>
