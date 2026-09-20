<template>
  <div class="search appointment-settings-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="上门服务流程" name="flow">
          <el-form v-loading="loading" :model="form" label-width="160px" style="max-width: 760px">
            <el-form-item label="用户预约">
              <el-switch v-model="form.userBooking" disabled />
            </el-form-item>
            <el-form-item label="接单">
              <el-switch v-model="form.acceptOrder" />
            </el-form-item>
            <el-form-item label="上门打卡">
              <el-switch v-model="form.onSiteCheckin" />
            </el-form-item>
            <el-form-item label="服务过程留凭">
              <el-switch v-model="form.serviceEvidence" />
            </el-form-item>
            <el-form-item label="结束服务">
              <el-switch v-model="form.endService" disabled />
            </el-form-item>
            <el-form-item label="客户改期审核">
              <el-switch v-model="form.customerRescheduleAuditEnabled" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="服务区域" name="area">
          <el-form v-loading="loading" :model="form" label-width="140px" style="max-width: 760px">
            <el-form-item label="开启服务区域">
              <el-switch v-model="form.serviceAreaEnabled" />
            </el-form-item>
            <el-form-item label="区域说明">
              <el-input
                v-model="form.serviceAreaGeo"
                type="textarea"
                :rows="4"
                placeholder="地图选点数据（JSON），后端接入后替换为地图组件"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div style="margin-top: 12px">
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getOnSiteSettings, saveOnSiteSettings } from "@/api/appointment";

export default {
  name: "appointmentOnSiteSettings",
  data() {
    return {
      activeTab: "flow",
      loading: false,
      saving: false,
      form: {
        userBooking: true,
        acceptOrder: true,
        onSiteCheckin: true,
        serviceEvidence: false,
        endService: true,
        customerRescheduleAuditEnabled: false,
        serviceAreaEnabled: false,
        serviceAreaGeo: "",
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      getOnSiteSettings()
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
      saveOnSiteSettings(this.form)
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
