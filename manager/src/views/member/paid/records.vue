<template>
  <div class="search">
    <el-card shadow="never"><el-form inline :model="query" class="search-form" @submit.prevent @keyup.enter="search">
      <el-form-item label="客户名称"><el-input v-model="query.keyword" placeholder="请输入客户昵称" clearable /></el-form-item><el-form-item label="会员ID"><el-input v-model="query.memberId" placeholder="请输入会员ID" clearable /></el-form-item>
      <el-form-item label="支付状态"><el-select v-model="query.status" clearable placeholder="全部状态" style="width:160px"><el-option label="未支付" value="UNPAID" /><el-option label="已支付" value="PAID" /><el-option label="已取消" value="CANCELLED" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="reset">重置</el-button></el-form-item>
    </el-form></el-card>
    <el-card shadow="never" class="mt_10"><div class="actions"><el-button :loading="exporting" @click="exportRecords">导出记录</el-button><el-button @click="router.push({name:'paid-member-settings'})">付费会员</el-button></div>
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column prop="sn" label="会员费订单号" min-width="200" /><el-table-column prop="memberName" label="客户" width="130" /><el-table-column prop="memberId" label="会员ID" min-width="180" />
        <el-table-column label="会员名称" min-width="140"><template #default="{row}">{{ name(row) }}</template></el-table-column>
        <el-table-column prop="amount" label="付费金额(元)" width="115" /><el-table-column prop="months" label="有效月数" width="90" /><el-table-column label="支付状态" width="110"><template #default="{row}">{{ status(row) }}</template></el-table-column>
        <el-table-column label="会员状态" width="110"><template #default="{row}">{{ membership(row) }}</template></el-table-column><el-table-column prop="payTime" label="支付时间" width="175" /><el-table-column prop="startTime" label="生效时间" width="175" /><el-table-column prop="endTime" label="到期时间" width="175" />
        <el-table-column prop="paymentMethod" label="支付方式" width="115" /><el-table-column prop="createTime" label="创建时间" width="175" />
      </el-table>
      <el-pagination v-model:current-page="query.pageNumber" :page-size="20" :total="total" layout="total, prev, pager, next" @current-change="load" />
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getPaidOrders } from '@/api/paid-member';
defineOptions({name:'paidMemberRecords'});
const router=useRouter(), query=reactive({keyword:'',memberId:'',status:'',pageNumber:1,pageSize:20});
const rows=ref([]), total=ref(0), loading=ref(false), exporting=ref(false);
let request=0;
const time=value => value ? new Date(String(value).replace(/-/g,'/')).getTime() : 0;
function status(row) { return row.status === 'UNPAID' && time(row.payDeadline)<Date.now() ? '已超时' : ({UNPAID:'未支付',PAID:'已支付',CANCELLED:'已取消'}[row.status] || row.status); }
function membership(row) { return row.status !== 'PAID' ? '未开通' : time(row.startTime)>Date.now() ? '待生效' : time(row.endTime)<=Date.now() ? '已到期' : '有效'; }
function name(row) { try { return JSON.parse(row.configSnapshot).name; } catch { return '付费会员'; } }
async function load() { const id=++request;loading.value=true;try {const res=await getPaidOrders({...query});if(id===request && res.success){rows.value=res.result.records||[];total.value=res.result.total||0;}} finally {if(id===request)loading.value=false;} }
function search(){query.pageNumber=1;load();} function reset(){query.keyword='';query.memberId='';query.status='';search();}
async function exportRecords() {
  exporting.value=true;
  try {
    const list=[], filters={...query}; let page=1;
    while(true){const res=await getPaidOrders({...filters,pageNumber:page,pageSize:100});if(!res.success)return;const records=res.result.records||[];if(!records.length)break;list.push(...records);if(list.length>=res.result.total)break;if(list.length>=10000){ElMessage.warning('一次最多导出10000条，请缩小筛选范围');return;}page++;}
    const quote=value=>{let text=String(value??'');if(/^[=+\-@]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
    const csv=[['会员费订单号','客户','会员ID','会员名称','付费金额','有效月数','支付状态','会员状态','支付时间','生效时间','到期时间','支付方式'],...list.map(r=>[r.sn,r.memberName,r.memberId,name(r),r.amount,r.months,status(r),membership(r),r.payTime,r.startTime,r.endTime,r.paymentMethod])].map(row=>row.map(quote).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='付费记录.csv';a.click();URL.revokeObjectURL(url);
  } finally {exporting.value=false;}
}
onMounted(load);
</script>
<style scoped>.actions { display:flex; gap:12px; margin-bottom:18px; }.el-pagination { margin-top:20px;justify-content:flex-end; }</style>
