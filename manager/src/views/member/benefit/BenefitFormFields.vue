<template>
  <section class="benefit-section">
    <div class="benefit-section-heading"><h3>基本信息</h3></div>
    <div class="benefit-form-grid">
      <el-form-item label="权益名称" prop="benefitName">
        <el-input v-model="form.benefitName" maxlength="50" show-word-limit placeholder="请输入权益名称" />
      </el-form-item>
      <el-form-item label="权益类型" prop="benefitType">
        <el-select v-model="form.benefitType" :disabled="editing" :clearable="!editing" placeholder="请选择权益类型" @change="$emit('type-change', $event)">
          <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.description" />
        </el-select>
        <div v-if="editing" class="benefit-field-hint">权益创建后不支持修改类型</div>
      </el-form-item>
    </div>
  </section>

  <section v-if="form.benefitType" class="benefit-section">
    <div class="benefit-section-heading"><h3>权益规则</h3><span>{{ typeLabel }}</span></div>
    <el-form-item v-if="form.benefitType === 'GIFT_POINT'" label="赠送积分" prop="giftPoint" required>
      <div class="benefit-number-field">
        <el-input-number v-model="form.giftPoint" :min="0" :max="99999" :precision="0" controls-position="right" placeholder="请输入积分数量" />
        <span class="benefit-input-unit">积分</span>
      </div>
      <div class="benefit-field-hint">首次达到关联等级时赠送，范围为 0～99999 积分。</div>
    </el-form-item>

    <BenefitConfigFields :form="form" />

    <el-form-item v-if="form.benefitType === 'COUPON_PACKAGE'" label="赠送优惠券" prop="couponPackageRows" required class="benefit-coupon-form-item">
      <div class="benefit-coupon-field">
        <div class="benefit-coupon-toolbar">
          <span>已选择 <strong>{{ form.couponPackageRows.length }}</strong> / 10 张优惠券</span>
          <el-button type="primary" plain @click="$emit('select-coupons', which)">添加优惠券</el-button>
        </div>
        <el-table border size="small" class="benefit-coupon-table" :data="form.couponPackageRows" empty-text="暂未选择优惠券，请点击右上方添加">
          <el-table-column prop="couponName" label="优惠券名称" min-width="160" show-overflow-tooltip />
          <el-table-column label="有效期" min-width="200"><template #default="{ row }"><span v-if="row" v-html="row.validRange || '-'" /></template></el-table-column>
          <el-table-column prop="faceValueLabel" label="面额" min-width="95" />
          <el-table-column label="赠送张数" width="135"><template #default="{ row, $index }">
            <el-input-number v-if="row" :model-value="row.quantity" :min="1" :max="10" :precision="0" controls-position="right" style="width: 104px" @change="value => $emit('quantity-change', which, $index, value)" />
          </template></el-table-column>
          <el-table-column label="操作" width="70" align="center"><template #default="{ row, $index }">
            <el-button v-if="row" link type="danger" @click="$emit('remove-coupon', which, $index)">删除</el-button>
          </template></el-table-column>
        </el-table>
      </div>
    </el-form-item>
  </section>

  <section class="benefit-section">
    <div class="benefit-section-heading"><h3>展示内容</h3><span>用于会员端权益展示</span></div>
    <el-form-item label="权益图标" prop="benefitLogo">
      <div class="benefit-logo-field">
        <div class="benefit-logo-preview">
          <el-image v-if="form.benefitLogo" :src="form.benefitLogo" fit="contain" :preview-src-list="[form.benefitLogo]" preview-teleported>
            <template #error><span class="benefit-logo-placeholder">图片不可用</span></template>
          </el-image>
          <span v-else class="benefit-logo-placeholder">图标预览</span>
        </div>
        <BenefitLogoInput v-model="form.benefitLogo" class="benefit-logo-upload" />
      </div>
    </el-form-item>
    <el-form-item label="权益介绍" prop="benefitDesc">
      <RichEditor v-model="form.benefitDesc" image-picker height="300px" class="benefit-rich-editor" />
    </el-form-item>
  </section>

  <section class="benefit-section">
    <div class="benefit-section-heading"><h3>发布设置</h3></div>
    <div class="benefit-form-grid">
      <el-form-item label="启用状态" prop="benefitState">
        <el-radio-group v-model="form.benefitState"><el-radio value="OPEN">开启</el-radio><el-radio value="CLOSE">关闭</el-radio></el-radio-group>
        <div class="benefit-field-hint">关闭后，会员端隐藏该权益并停止后续发放。</div>
      </el-form-item>
      <el-form-item label="显示排序" prop="benefitSort">
        <el-input-number v-model="form.benefitSort" :min="1" :max="9999" :precision="0" controls-position="right" />
        <div class="benefit-field-hint">数字越小越靠前，范围为 1～9999。</div>
      </el-form-item>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import BenefitConfigFields from './BenefitConfigFields.vue';
import BenefitLogoInput from './BenefitLogoInput.vue';
import RichEditor from '@/components/editor/index.vue';
const props = defineProps({
  form: { type: Object, required: true },
  typeOptions: { type: Array, default: () => [] },
  editing: { type: Boolean, default: false },
  which: { type: String, required: true },
});
defineEmits(['type-change', 'select-coupons', 'quantity-change', 'remove-coupon']);
const typeLabel = computed(() => props.typeOptions.find(item => item.value === props.form.benefitType)?.description || '');
</script>

<style lang="scss" scoped>
.benefit-section { padding: 24px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: #fff; }
.benefit-section + .benefit-section { margin-top: 16px; }
.benefit-section-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 22px; }
.benefit-section-heading h3 { margin: 0; color: var(--el-text-color-primary); font-size: 15px; font-weight: 600; line-height: 22px; }
.benefit-section-heading span { color: var(--el-text-color-secondary); font-size: 12px; line-height: 20px; }
.benefit-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.benefit-field-hint { width: 100%; margin-top: 6px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 20px; }
.benefit-section :deep(.el-form-item) { margin-bottom: 22px; }
.benefit-section > :deep(.el-form-item:last-child), .benefit-form-grid > :deep(.el-form-item) { margin-bottom: 0; }
.benefit-section :deep(.el-form-item__label) { padding: 0; margin-bottom: 8px; font-weight: 500; line-height: 22px; }
.benefit-section :deep(.el-form-item__content) { min-width: 0; }
.benefit-section :deep(.el-select) { width: 100%; }
.benefit-section :deep(.el-input-number) { width: 180px; max-width: 100%; }
.benefit-number-field { display: flex; gap: 10px; align-items: center; }
.benefit-input-unit { color: var(--el-text-color-regular); }
.benefit-coupon-field, .benefit-rich-editor { width: 100%; min-width: 0; }
.benefit-coupon-toolbar { display: flex; gap: 12px; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 12px; color: var(--el-text-color-secondary); font-size: 12px; }
.benefit-coupon-toolbar strong { color: var(--el-color-primary); font-weight: 500; }
.benefit-coupon-table { border-radius: 6px; overflow: hidden; }
.benefit-logo-field { display: flex; align-items: center; gap: 20px; width: 100%; }
.benefit-logo-preview { width: 88px; height: 88px; flex: 0 0 88px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--el-border-color); border-radius: 8px; background-color: #fafbfc; overflow: hidden; }
.benefit-logo-preview :deep(.el-image) { width: 64px; height: 64px; }
.benefit-logo-placeholder { color: var(--el-text-color-placeholder); font-size: 12px; }
.benefit-logo-upload { flex: 1; min-width: 0; }
@media (max-width: 640px) {
  .benefit-section { padding: 18px 16px; }
  .benefit-form-grid { grid-template-columns: minmax(0, 1fr); gap: 22px; }
  .benefit-logo-field { flex-direction: column; align-items: flex-start; gap: 12px; }
  .benefit-logo-upload { width: 100%; }
}
</style>
