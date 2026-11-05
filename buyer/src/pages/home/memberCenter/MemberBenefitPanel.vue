<template>
  <section class="benefits-panel">
    <h3>会员权益</h3>
    <div class="grade-options">
      <button v-for="item in enabledGrades" :key="item.grade.id" :class="{active: selectedId === item.grade.id}" @click="selectedId = item.grade.id">
        {{ item.grade.gradeName }}<small v-if="item.grade.id === currentGradeId">当前等级</small>
      </button>
    </div>
    <p class="benefit-subtitle">{{ selected?.grade?.gradeName || '暂无等级' }} · 点击查看权益说明</p>
    <el-empty v-if="!selected?.benefits?.length" description="暂无权益" />
    <div v-else class="benefits-grid">
      <button v-for="benefit in selected.benefits" :key="benefit.id" class="benefit-card" :class="{locked: !owned(benefit)}" @click="detail = benefit">
        <img v-if="benefit.benefitLogo" :src="benefit.benefitLogo" alt="" />
        <strong>{{ benefit.benefitName }}</strong>
        <span>{{ owned(benefit) ? '已享有' : '该等级专享' }}</span>
      </button>
    </div>
    <el-dialog :model-value="!!detail" :title="detail?.benefitName || '权益说明'" width="520px" @close="detail = null">
      <template v-if="detail">
        <p>{{ owned(detail) ? '当前等级已享有该权益' : '此权益属于所选等级，当前尚未享有' }}</p>
        <p v-if="detail.benefitType === 'POINT_MULTIPLIER'">购物积分倍率：{{ config(detail).multiplier || 1 }} 倍，同类权益取最高值。</p>
        <p v-if="detail.benefitType === 'GIFT_POINT'">首次达到等级赠送 {{ config(detail).giftPoint || 0 }} 积分。</p>
        <div class="benefit-description" v-html="detail.benefitDesc || '暂无说明'" />
      </template>
    </el-dialog>
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({gradeDetails:{type:Array,default:()=>[]},currentGradeId:{type:String,default:''}})
const selectedId = ref(''), detail = ref(null)
const enabledGrades = computed(()=>props.gradeDetails.filter(item=>item.grade?.gradeState === 'OPEN'))
const selected = computed(()=>enabledGrades.value.find(item=>item.grade.id === selectedId.value))
const current = computed(()=>enabledGrades.value.find(item=>item.grade.id === props.currentGradeId))
const owned = benefit => (current.value?.benefits || []).some(item=>item.id === benefit.id)
function config(benefit) { try { return JSON.parse(benefit.benefitConfig || '{}') } catch { return {} } }
watch([()=>props.currentGradeId,enabledGrades],()=>{
  if(!selectedId.value || !enabledGrades.value.some(item=>item.grade.id===selectedId.value)) selectedId.value=props.currentGradeId || enabledGrades.value[0]?.grade.id || ''
},{immediate:true})
</script>
<style scoped>
.benefits-panel { margin:20px 0; padding:24px; background:#fff; border:1px solid #eee; border-radius:8px; }
h3 { margin:0 0 20px; font-size:18px; } .grade-options { display:flex; flex-wrap:wrap; gap:10px; }
.grade-options button { padding:10px 18px; border:1px solid #ddd; background:#fff; border-radius:6px; cursor:pointer; }
.grade-options button.active { background:#fff8eb; border-color:#c99a47; color:#866021; } small { margin-left:8px; }
.benefit-subtitle { color:#777; margin:20px 0; }.benefits-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:16px; }
.benefit-card { padding:20px 10px; display:flex; align-items:center; flex-direction:column; gap:12px; border:1px solid #f0e3cb; background:#fffcf6; border-radius:8px; cursor:pointer; }
.benefit-card img { width:48px; height:48px; object-fit:contain; }.benefit-card span { font-size:12px; color:#986d2a; }
.benefit-card.locked { background:#fafafa; border-color:#eee; color:#888; }.locked img { filter:grayscale(1); opacity:.5; }
.benefit-description { line-height:1.8; overflow-wrap:anywhere; }.benefit-description :deep(img) { max-width:100%; }
</style>
