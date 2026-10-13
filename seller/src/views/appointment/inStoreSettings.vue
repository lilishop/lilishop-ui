<template>
  <div class="search appointment-settings-page">
    <el-card>
      <el-form v-loading="loading" :model="form" label-width="140px" style="max-width: 720px">
        <el-form-item label="用户预约">
          <el-switch v-model="form.userBooking" disabled />
          <span class="hint">用户预约为必要节点，不可关闭</span>
        </el-form-item>
        <el-form-item label="工单">
          <el-switch v-model="form.workOrder" />
          <span class="hint">工单开启核销后会生成服务工单，关闭不生成工单，订单状态直接流转已收货、已服务</span>
        </el-form-item>
        <el-form-item label="结束服务">
          <el-switch v-model="form.endService" disabled />
          <span class="hint">服务人员结束服务</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          <el-button @click="loadData">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getInStoreSettings, saveInStoreSettings } from "@/api/appointment";
import { Message } from "@/utils/message";

defineOptions({ name: "appointmentInStoreSettings" });

const loading = ref(false);
const saving = ref(false);
const form = ref({
  userBooking: true,
  workOrder: true,
  endService: true,
});

onMounted(() => {
  loadData();
});

function loadData() {
  loading.value = true;
  getInStoreSettings()
    .then((res) => {
      if (res.success && res.result) {
        form.value = { ...form.value, ...res.result };
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleSave() {
  saving.value = true;
  saveInStoreSettings(form.value)
    .then((res) => {
      if (res.success) {
        Message.success("保存成功");
      }
    })
    .finally(() => {
      saving.value = false;
    });
}
</script>

<style scoped>
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
