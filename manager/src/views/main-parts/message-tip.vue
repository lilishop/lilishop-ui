<template>
  <div class="message-con">
    <el-dropdown trigger="click" popper-class="todo-dropdown" @command="navigateTo">
      <a href="javascript:void(0)" class="message-link">
        {{ value > 0 ? "有" + value + "条待办事项" : "无待办事项" }}
        <el-icon v-if="value != 0"><ArrowDown /></el-icon>
      </a>
      <template #dropdown>
        <el-dropdown-menu v-if="value != 0">
          <el-dropdown-item v-if="res.balanceCash" command="deposit">
            <el-badge :value="res.balanceCash">待处理预存款提现申请</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.complain" command="orderComplaint">
            <el-badge :value="res.complain">待处理投诉审核</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.distributionCash" command="distributionCash">
            <el-badge :value="res.distributionCash">待处理分销员提现申请</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.goods" command="applyGoods">
            <el-badge :value="res.goods">待处理商品审核</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.refund" command="afterSaleOrder">
            <el-badge :value="res.refund">待处理售后申请</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.store" command="shopAuth">
            <el-badge :value="res.store">待处理店铺入驻审核</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.waitPayBill" command="accountStatementBill">
            <el-badge :value="res.waitPayBill">待与商家对账</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.appointmentWorkOrder" command="manager-appointment-work-orders">
            <el-badge :value="res.appointmentWorkOrder">未完成预约工单</el-badge>
          </el-dropdown-item>
          <el-dropdown-item v-if="res.procurementAudit" command="manager-procurement-order-list">
            <el-badge :value="res.procurementAudit">待审核采购单</el-badge>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";

defineOptions({ name: "messageTip" });

const props = defineProps({
  res: {
    type: Object,
    default: () => ({}),
  },
});

const router = useRouter();

const value = computed(() => {
  let count = 0;
  const r = props.res || {};
  Object.keys(r).forEach((k) => {
    if (r[k]) count += r[k];
  });
  return count;
});

function navigateTo(name) {
  if (name === "manager-appointment-work-orders") {
    router.push({ name, query: { serviceStatus: "OPEN" } });
    return;
  }
  if (name === "manager-procurement-order-list") {
    router.push({ name, query: { status: "SUBMITTED" } });
    return;
  }
  router.push({ name });
}
</script>

<style scoped>
.message-link {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>

<style>
.todo-dropdown .el-dropdown-menu__item {
  min-width: 150px;
  padding: 6px 36px 6px 16px;
  line-height: 1.6;
}

.todo-dropdown .el-dropdown-menu__item + .el-dropdown-menu__item {
  margin-top: 4px;
}

.todo-dropdown .el-badge {
  width: 100%;
}

.todo-dropdown .el-badge__content.is-fixed {
  right: 4px;
  top: 8px;
  transform: translateY(-50%) translateX(50%);
}
</style>
