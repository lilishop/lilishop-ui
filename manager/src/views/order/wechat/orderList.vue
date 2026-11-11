<template>
  <div>
    <el-alert
      title="小程序订单"
      type="info"
      :closable="false"
      show-icon
      class="wechat-order-notice"
      description="仅展示微信小程序下单且使用微信支付的订单。自动上报开关开启且微信侧已开通发货管理时，按现有履约流程上报。"
    />
    <OrderList ref="orderListRef" fixed-client-type="WECHAT_MP" fixed-payment-method="WECHAT" :allow-export="false" wechat-sync :action-width="220">
      <template #extra-filters="{ form }">
        <el-form-item label="上报状态" prop="wechatSyncStatus">
          <el-select v-model="form.wechatSyncStatus" placeholder="全部上报状态" clearable>
            <el-option v-for="item in wechatSyncOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </template>
      <template #extra-columns>
        <el-table-column label="微信上报状态" width="130">
          <template #default="{ row }"><el-tag :type="wechatSyncTag(row.wechatSyncStatus)">{{ wechatSyncLabel(row.wechatSyncStatus) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="wechatSyncTime" label="最近上报时间" width="175" />
        <el-table-column prop="wechatSyncError" label="上报处理原因" min-width="230" show-overflow-tooltip />
      </template>
      <template #extra-actions="{ row }">
        <el-button link type="primary" @click="showLogs(row)">同步日志</el-button>
        <el-button link type="warning" :loading="retryingSn === row.sn" :disabled="!!retryingSn" @click="retry(row)">补报</el-button>
      </template>
    </OrderList>
    <SyncLogDrawer v-model="logVisible" :order-sn="logOrderSn" />
  </div>
</template>

<script setup>
import OrderList from "../order/orderList.vue";
import SyncLogDrawer from "./SyncLogDrawer.vue";
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { retryWechatOrder } from "@/api/order";
import { wechatSyncOptions, wechatSyncLabel, wechatSyncTag } from "@/utils/wechatOrderSync";

defineOptions({ name: "wechatOrderList" });

const orderListRef = ref(null);
const retryingSn = ref("");
const logVisible = ref(false);
const logOrderSn = ref("");

/** 展示当前订单所在微信支付流水的审计日志。 */
function showLogs(row) {
  logOrderSn.value = row.sn;
  logVisible.value = true;
}

/** 人工补报需要明确确认范围；同笔支付共用锁，已成功且内容未变时由后端跳过。 */
async function retry(row) {
  if (retryingSn.value) return;
  try {
    const historyNotice = row.wechatSyncStatus === "UNCHECKED" ? "该订单没有本地上报记录，请先核查微信后台，确认需要补报后继续。" : "";
    await ElMessageBox.confirm(historyNotice + "将按该笔微信支付的全部关联订单归集补报。人工补报不受自动上报开关限制；已成功且内容未变化会跳过。", "补报微信发货信息", { type: "warning", confirmButtonText: "确认补报", cancelButtonText: "取消" });
  } catch (e) { return; }
  if (retryingSn.value) return;
  retryingSn.value = row.sn;
  try {
    const res = await retryWechatOrder(row.sn);
    if (!res.success) throw new Error(res.message || "补报失败");
    if (res.result === "SUCCESS") ElMessage.success("微信接口已受理发货信息");
    else if (res.result === "SKIPPED") ElMessage.success("相同发货信息已成功上报，本次已跳过");
    else {
      ElMessage.warning("本次未完成上报，请查看同步日志中的处理原因");
      showLogs(row);
    }
  } catch (e) {
    ElMessage.error("补报未完成，请刷新状态并查看日志后再处理");
  } finally {
    retryingSn.value = "";
    orderListRef.value?.reload();
  }
}
</script>

<style scoped>
.wechat-order-notice {
  margin-bottom: 16px;
}
</style>
