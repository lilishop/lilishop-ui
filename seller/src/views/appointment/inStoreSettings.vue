<template>
  <div class="search appointment-settings-page">
    <el-card>
      <el-alert type="info" show-icon :closable="false" class="mb_10">
        配置到店服务履约节点；改期审核等通用项见上门服务设置。
      </el-alert>
      <el-form v-loading="loading" :model="form" label-width="140px" style="max-width: 720px">
        <el-form-item label="用户预约">
          <el-switch v-model="form.userBooking" disabled />
          <span class="hint">必要节点，不可关闭</span>
        </el-form-item>
        <el-form-item label="工单展示">
          <el-switch v-model="form.workOrder" />
          <span class="hint">关闭后 §15 不可见，工单仍会生成</span>
        </el-form-item>
        <el-form-item label="结束服务">
          <el-switch v-model="form.endService" disabled />
          <span class="hint">展示态须在工单上结束服务</span>
        </el-form-item>
        <el-form-item label="客户改期审核">
          <el-switch v-model="form.customerRescheduleAuditEnabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          <el-button @click="loadData">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getInStoreSettings, saveInStoreSettings } from "@/api/appointment";

export default {
  name: "appointmentInStoreSettings",
  data() {
    return {
      loading: false,
      saving: false,
      form: {
        userBooking: true,
        workOrder: true,
        endService: true,
        customerRescheduleAuditEnabled: false,
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      getInStoreSettings()
        .then((res) => {
          if (res.success && res.result) {
            this.form = { ...this.form, ...res.result };
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSave() {
      this.saving = true;
      saveInStoreSettings(this.form)
        .then((res) => {
          if (res.success) {
            this.$message.success("保存成功");
          }
        })
        .finally(() => {
          this.saving = false;
        });
    },
  },
};
</script>

<style scoped>
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
