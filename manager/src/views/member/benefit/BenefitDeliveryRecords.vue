<template>
  <div class="search benefit-delivery-page">
    <el-card shadow="never">
    <el-form :model="query" inline class="search-form" label-width="70px" @submit.prevent @keyup.enter="search">
      <el-form-item label="会员ID"><el-input v-model="query.memberId" placeholder="请输入会员ID" clearable style="width:240px" /></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable placeholder="全部状态" style="width:240px">
        <el-option label="成功" value="SUCCESS" /><el-option label="失败" value="FAILED" /><el-option label="待发放" value="PENDING" />
      </el-select></el-form-item>
      <el-form-item><el-button type="primary" class="search-btn" @click="search">搜索</el-button><el-button @click="reset">重置</el-button></el-form-item>
    </el-form>
    </el-card>
    <el-card shadow="never" class="mt_10">
      <template #header><div class="records-header"><span>权益发放明细</span><el-button @click="router.push({ name: 'member-benefit' })">返回客户权益</el-button></div></template>
    <el-table :data="rows" v-loading="loading" border>
      <el-table-column prop="memberId" label="会员ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="benefitName" label="权益" min-width="130" />
      <el-table-column prop="sourceRef" label="来源等级ID" min-width="150" show-overflow-tooltip />
      <el-table-column prop="cycleKey" label="发放周期" min-width="130" />
      <el-table-column label="状态" width="100"><template #default="{row}">{{ statuses[row.status] || row.status }}</template></el-table-column>
      <el-table-column prop="attempts" label="尝试次数" width="90" />
      <el-table-column prop="errorMessage" label="失败原因" min-width="200" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" width="170" />
      <el-table-column label="操作" width="90"><template #default="{row}"><el-button v-if="row.status === 'FAILED'" link type="primary" :loading="retrying === row.id" @click="retry(row)">重试</el-button></template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="query.pageNumber" :total="total" :page-size="query.pageSize" layout="total, prev, pager, next" @current-change="load" />
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMemberBenefitDeliveries, retryMemberBenefitDelivery } from '@/api/member';
defineOptions({ name: 'memberBenefitDeliveries' });
const router = useRouter();
const loading = ref(false), rows = ref([]), total = ref(0), retrying = ref('');
const query = reactive({memberId:'',status:'',pageNumber:1,pageSize:20});
const statuses = {SUCCESS:'成功',FAILED:'失败',PENDING:'待发放'};
async function load() {
  loading.value = true;
  try { const res = await getMemberBenefitDeliveries({ ...query }); if(res.success) { rows.value = res.result.records || []; total.value = res.result.total || 0; } }
  catch { ElMessage.error('发放明细加载失败，请重新搜索'); }
  finally { loading.value = false; }
}
function search() { query.pageNumber = 1; load(); }
function reset() { query.memberId = ''; query.status = ''; search(); }
async function retry(row) {
  try { await ElMessageBox.confirm('按原发放配置补发此权益，系统会检查会员当前资格。', '重试权益发放'); }
  catch { return; }
  retrying.value = row.id;
  try { const res = await retryMemberBenefitDelivery(row.id); if(res.success) ElMessage.success('补发成功'); await load(); }
  catch { ElMessage.error('补发失败，请稍后重试'); }
  finally { retrying.value = ''; }
}
onMounted(load);
</script>
<style scoped>
.records-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.el-pagination { margin-top: 20px; justify-content: flex-end; }
</style>
