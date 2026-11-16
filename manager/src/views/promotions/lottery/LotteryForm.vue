<!-- 抽奖新建、草稿编辑与只读详情共用表单，统一奖池配置、选券与保存行为。作者 Bulbasaur，2026-11-15。 -->
<template>
  <div class="lottery-form">
      <el-form label-width="120px" class="base-info-item" :disabled="readOnly">
        <h4>活动信息</h4>
        <div class="form-item-view">
        <el-form-item label="活动名称" required><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="规则说明" required><el-input v-model="form.description" type="textarea" :rows="3" maxlength="2000" show-word-limit /></el-form-item>
        <el-form-item label="每日免费次数" required><el-input-number v-model="form.dailyLimit" :min="1" :max="100" :precision="0" :controls="false" /></el-form-item>
        <el-form-item label="开始时间" required><el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="开始时间" /></el-form-item>
        <el-form-item label="结束时间" required><el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="结束时间" /></el-form-item>
        </div>
        <h4>奖品配置（{{ form.prizes.reduce((sum, p) => sum + (p.weight || 0), 0) / 100 }}% / 100%）</h4>
        <div class="form-item-view">
        <el-table :data="form.prizes" class="prize-table" border style="width: 100%">
          <el-table-column type="index" label="奖项" width="65" align="center" />
          <el-table-column label="奖项名称" min-width="160"><template #default="{ row, $index }"><el-input v-model="row.name" maxlength="100" placeholder="展示名称" :aria-label="`奖项${$index + 1}名称`" /></template></el-table-column>
          <el-table-column label="奖项类型" width="150"><template #default="{ row }"><el-select v-model="row.type" @change="changeType(row)"><el-option label="积分" value="POINTS" /><el-option label="平台优惠券" value="COUPON" /><el-option label="谢谢参与" value="THANKS" /></el-select></template></el-table-column>
          <el-table-column label="百分比" width="130"><template #default="{ row }"><div class="prize-value"><el-input-number :model-value="row.weight == null ? undefined : row.weight / 100" :min="1" :max="100" :precision="0" :step="1" :controls="false" @update:model-value="setPercentage(row, $event)" /><span>%</span></div></template></el-table-column>
          <el-table-column label="累计库存" width="120"><template #default="{ row }"><el-input-number v-if="row.type !== 'THANKS'" v-model="row.total" :min="1" :max="2147483647" :precision="0" :controls="false" /><span v-else>—</span></template></el-table-column>
          <el-table-column label="奖励内容" width="160"><template #default="{ row, $index }">
            <div v-if="row.type === 'POINTS'" class="prize-value points-value"><el-input-number v-model="row.points" :min="1" :max="1000000" :precision="0" :controls="false" /><span>积分</span></div>
            <div v-else-if="row.type === 'COUPON'" class="prize-value"><span class="coupon-name" :title="row.couponName || row.couponId">{{ row.couponName || row.couponId || '尚未选择' }}</span><el-button v-if="!readOnly" link type="primary" @click="pick($index)">选择优惠券</el-button></div>
            <span v-else>—</span>
          </template></el-table-column>
          <el-table-column v-if="!readOnly" label="操作" width="80" align="center" fixed="right"><template #default="{ $index }"><el-button type="danger" link :disabled="form.prizes.length <= 2" @click="form.prizes.splice($index, 1)">删除</el-button></template></el-table-column>
        </el-table>
        <div v-if="!readOnly" class="prize-actions"><el-button :disabled="form.prizes.length >= 8" @click="form.prizes.push(newPrize())">增加奖项（最多8项）</el-button></div>
        </div>
      </el-form>

    <div v-if="showActions && !readOnly" class="form-actions">
      <el-button :disabled="saving" @click="emit('cancel')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存草稿</el-button>
    </div>
    <el-dialog v-model="picker" title="选择一张平台活动券" width="90%" append-to-body destroy-on-close :close-on-click-modal="false">
      <CouponTemplate v-if="picker" ref="couponPicker" manualConfirm getType="ACTIVITY" promotionStatus="START" :selectedList="selected" />
      <template #footer><el-button @click="picker = false">取消</el-button><el-button type="primary" @click="confirmCoupon">确认</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import CouponTemplate from '@/views/promotions/coupon/coupon.vue';
import { saveLottery } from '@/api/lottery';
const props = defineProps({ activity: { type: Object, default: null }, showActions: { type: Boolean, default: true }, readOnly: { type: Boolean, default: false } });
const emit = defineEmits(['saved', 'cancel']);
const form = ref(props.activity ? JSON.parse(JSON.stringify(props.activity)) : { name: '', description: '', dailyLimit: 1, startTime: '', endTime: '', prizes: [newPrize(), { name: '谢谢参与', type: 'THANKS', weight: 9000, points: 0, total: 0 }] });
const saving = ref(false), picker = ref(false), couponPicker = ref(), selected = ref([]);
let pickIndex = 0;
/** 创建积分奖草稿。 */
function newPrize() { return { name: '积分奖励', type: 'POINTS', weight: 1000, points: 10, total: 100 }; }
/** 切换奖项类型时清理无关值。 */
function changeType(p) { p.couponId = ''; p.couponName = ''; p.points = p.type === 'POINTS' ? 10 : 0; p.total = p.type === 'THANKS' ? 0 : 100; }
/** 正整数百分比转换为万分点提交；清空保留为空，提交前再次拒绝小数或零概率。 */
function setPercentage(prize, value) { prize.weight = value == null || value === '' ? null : Number(value) * 100; }
/** 打开既有优惠券选择组件并回显当前奖项。 */
function pick(index) { if (props.readOnly) return; pickIndex = index; const p = form.value.prizes[index]; selected.value = p.couponId ? [{ id: p.couponId, couponName: p.couponName }] : []; picker.value = true; }
/** 确认单张平台活动券，取消不会更改草稿。 */
function confirmCoupon() {
  const list = couponPicker.value?.getSelection() || [];
  if (list.length !== 1 || list[0].storeId !== '0') return ElMessage.warning('请选择一张平台活动券');
  form.value.prizes[pickIndex].couponId = list[0].id; form.value.prizes[pickIndex].couponName = list[0].couponName; picker.value = false;
}
/** 只读详情禁止提交；编辑时提示基础错误，全部业务约束由后端再次校验。 */
async function save() {
  if (props.readOnly || saving.value) return;
  const f = form.value;
  if (!f.name.trim() || !f.description.trim() || !f.startTime || !f.endTime || f.startTime >= f.endTime) return ElMessage.warning('请完善名称、规则与有效时间');
  if (f.prizes.some(p => !Number.isInteger(p.weight) || p.weight < 100 || p.weight > 10000 || p.weight % 100 !== 0)) return ElMessage.warning('百分比必须为1至100的正整数');
  if (f.prizes.reduce((sum, p) => sum + p.weight, 0) !== 10000 || f.prizes.filter(p => p.type === 'THANKS').length !== 1) return ElMessage.warning('百分比须合计100%，且恰好有一个谢谢参与');
  saving.value = true;
  try { const res = await saveLottery(f); if (res.success) { ElMessage.success('已保存草稿'); emit('saved', res.result); } }
  catch { /* 保留草稿供修正或重试。 */ } finally { saving.value = false; }
}

defineExpose({ save, saving });
</script>
<style scoped>
.base-info-item h4 { margin: 0 0 10px; padding: 0 10px; border: 1px solid #ddd; background-color: #f8f8f8; font-weight: bold; color: #333; font-size: 14px; line-height: 40px; text-align: left; }
.form-item-view { padding: 10px 0; }
.lottery-form :deep(.el-input),
.lottery-form :deep(.el-select) { width: 260px; max-width: 100%; }
.lottery-form :deep(.el-textarea) { width: 520px; max-width: 100%; }
.lottery-form :deep(.el-input-number) { width: 160px; max-width: 100%; }
.lottery-form :deep(.el-input-number .el-input) { width: 100%; }
.prize-table :deep(.el-input), .prize-table :deep(.el-select), .prize-table :deep(.el-input-number) { width: 100%; }
.prize-value { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.prize-value > .el-input-number { flex: 1; min-width: 0; }
.points-value > .el-input-number { flex: 0 0 90px; width: 90px; }
.prize-value > .el-button { flex-shrink: 0; }
.coupon-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.prize-actions { margin: 16px 0; }
.form-actions { display: flex; flex-wrap: wrap; gap: 12px; padding: 0 0 10px 120px; }
.form-actions .el-button + .el-button { margin-left: 0; }
</style>
