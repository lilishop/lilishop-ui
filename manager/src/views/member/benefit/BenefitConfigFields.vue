<template>
  <el-form-item v-if="form.benefitType === 'POINT_MULTIPLIER'" label="积分倍率" required>
    <div class="number-field"><el-input-number v-model="form.multiplier" :min="1" :max="100" :precision="2" controls-position="right" /><span>倍</span></div>
    <div class="hint">购物积分基数 × 倍率，同类权益取最高倍率。</div>
  </el-form-item>
  <div v-if="['CUSTOM', 'GRADE_BADGE', 'EXCLUSIVE_CUSTOMER_SERVICE'].includes(form.benefitType)" class="rule-description">{{ typeDescription }}</div>
  <template v-if="form.benefitType === 'COUPON_PACKAGE'">
    <el-form-item label="发券规则" required>
      <el-radio-group v-model="form.grantRule">
        <el-radio value="ONCE">发放一次</el-radio>
        <el-radio value="MONTHLY">每月发放</el-radio>
        <el-radio value="PERIOD">按周期发放</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="form.grantRule === 'MONTHLY'" label="发放日期" required>
      <div class="number-field"><el-input-number v-model="form.grantDay" :min="1" :max="31" :precision="0" controls-position="right" /><span>号</span></div>
      <div class="hint">当月不存在指定日期时，取当月最后一天。</div>
    </el-form-item>
    <el-form-item v-if="form.grantRule === 'PERIOD'" label="发放周期" required>
      <div class="number-field"><el-input-number v-model="form.periodMonths" :min="1" :max="12" :precision="0" controls-position="right" /><span>个月</span></div>
      <div class="hint">以首次达到等级的日期为起点，首期立即发放。</div>
    </el-form-item>
    <div class="rule-description coupon-description">最多选择 10 张平台优惠券，每券赠送 1～10 张。仅发放当前周期，暂停期间未生成的历史周期不追发。</div>
  </template>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ form: { type: Object, required: true } });
const typeDescription = computed(() => ({
  GRADE_BADGE: '展示会员的等级徽章。请在下方配置权益图标和介绍，并在客户等级中关联使用。',
  EXCLUSIVE_CUSTOMER_SERVICE: '展示会员专属客服权益。会员可通过商城现有客服入口联系，具体服务内容请在权益介绍中说明。',
  CUSTOM: '展示自定义会员权益。请在权益介绍中说明适用条件、参与方式及服务内容。',
}[props.form.benefitType] || ''));
</script>
<style scoped>
.number-field { display: flex; align-items: center; gap: 10px; }
.hint { width: 100%; margin-top: 6px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 20px; }
.rule-description { padding: 12px 16px; color: var(--el-text-color-regular); background: #f6f8fb; border-radius: 6px; font-size: 13px; line-height: 22px; }
.coupon-description { margin-bottom: 20px; }
</style>
