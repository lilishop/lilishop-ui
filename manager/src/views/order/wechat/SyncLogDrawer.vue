<!--
  小程序订单同步日志抽屉：按支付流水展示审计记录，不显示原始身份或支付凭据。
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <el-drawer :model-value="modelValue" title="微信订单同步日志" size="min(1100px, 95vw)" @update:model-value="emit('update:modelValue', $event)">
    <p>订单：{{ orderSn }}。日志包含同笔微信支付下的关联子订单操作；上报成功仅代表微信接口已受理。</p>
    <el-button :loading="loading" @click="load">刷新</el-button>
    <el-alert v-if="failed" title="日志加载失败，请点击刷新重试" type="error" :closable="false" class="mt_10" />
    <el-table v-loading="loading" :data="records" class="mt_10" empty-text="暂无本地同步记录，历史上报结果需核查">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="log-detail">
            <p>触发订单：{{ row.orderSn }}</p>
            <p>请求摘要：{{ row.summary || '—' }}</p>
            <p>错误码：{{ row.errorCode || '—' }}</p>
            <p>处理原因：{{ row.errorMessage || '—' }}</p>
            <p>结束时间：{{ row.finishTime || '—' }}；耗时：{{ row.durationMs == null ? '—' : `${row.durationMs} 毫秒` }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作时间" width="175" />
      <el-table-column label="操作" width="110">
        <template #default="{ row }">{{ row.operation === 'RECEIVE' ? '收货通知' : '发货上报' }}</template>
      </el-table-column>
      <el-table-column label="来源" width="110">
        <template #default="{ row }">{{ row.triggerType === 'MANUAL' ? '人工补报' : '自动事件' }}</template>
      </el-table-column>
      <el-table-column prop="operatorName" label="操作人" min-width="100" />
      <el-table-column label="结果" min-width="120">
        <template #default="{ row }"><el-tag :type="wechatSyncTag(row.status)">{{ wechatSyncLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="errorMessage" label="处理原因" min-width="220" show-overflow-tooltip />
    </el-table>
    <el-pagination v-model:current-page="pageNumber" :page-size="20" :total="total" layout="total, prev, pager, next" class="mt_10" @current-change="load" />
  </el-drawer>
</template>

<script setup>
import { ref, watch } from "vue";
import { getWechatOrderLogs } from "@/api/order";
import { wechatSyncLabel, wechatSyncTag } from "@/utils/wechatOrderSync";

const props = defineProps({ modelValue: Boolean, orderSn: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);
const records = ref([]);
const loading = ref(false);
const failed = ref(false);
const total = ref(0);
const pageNumber = ref(1);
let requestSeq = 0;

/** 请求序号隔离不同订单及页码，关闭抽屉后不接受过期响应。 */
async function load() {
  if (!props.modelValue || !props.orderSn) return;
  const id = ++requestSeq;
  loading.value = true;
  failed.value = false;
  try {
    const res = await getWechatOrderLogs(props.orderSn, { pageNumber: pageNumber.value, pageSize: 20 });
    if (id !== requestSeq) return;
    if (!res.success) throw new Error("日志加载失败");
    records.value = res.result.records;
    total.value = res.result.total;
  } catch (e) {
    if (id !== requestSeq) return;
    failed.value = true;
    records.value = [];
    total.value = 0;
  } finally {
    if (id === requestSeq) loading.value = false;
  }
}

watch(() => [props.modelValue, props.orderSn], () => {
  requestSeq++;
  records.value = [];
  total.value = 0;
  pageNumber.value = 1;
  loading.value = false;
  if (props.modelValue) load();
}, { immediate: true });
</script>

<style scoped>
.log-detail { padding: 0 20px; overflow-wrap: anywhere; }
</style>
