<template>
  <div class="search">
    <el-card>
      <el-form :model="form" label-width="220px" style="max-width: 760px" v-loading="loading">
        <el-form-item label="服务开始前提醒买家（小时）">
          <el-input-number v-model="form.serviceStartRemindMemberHours" :min="0" :max="168" />
          <span class="hint">0 表示关闭</span>
        </el-form-item>
        <el-form-item label="逾期未核销自动完结（小时）">
          <el-input-number v-model="form.inStoreNoShowAutoCompleteHours" :min="0" :max="720" />
          <span class="hint">0 表示关闭</span>
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
import { getAppointmentOrderSettings, saveAppointmentOrderSettings } from "@/api/appointment";
import { ElMessage } from "element-plus";

export default {
  name: "appointmentOrderSettings",
  data() {
    return {
      loading: false,
      saving: false,
      form: {
        serviceStartRemindMemberHours: 2,
        inStoreNoShowAutoCompleteHours: 24,
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      getAppointmentOrderSettings()
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
      saveAppointmentOrderSettings(this.form)
        .then((res) => {
          if (res.success) {
            ElMessage.success("保存成功");
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
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}
</style>
