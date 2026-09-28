<template>
  <div class="search appointment-settings-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="上门服务流程" name="flow">
          <el-form v-loading="loading" :model="form" label-width="160px" style="max-width: 760px">
            <el-form-item label="用户预约">
              <el-switch v-model="form.userBooking" disabled />
              <span class="hint">用户预约为必要节点，不可关闭</span>
            </el-form-item>
            <el-form-item label="接单">
              <el-switch v-model="form.acceptOrder" />
              <span class="hint">接单开启，服务人员可以抢单</span>
            </el-form-item>
            <el-form-item label="上门打卡">
              <el-switch v-model="form.onSiteCheckin" />
              <span class="hint">上门打卡关闭之后，则无需开始服务直接进入下一环节</span>
            </el-form-item>
            <el-form-item label="服务过程留凭">
              <el-switch v-model="form.serviceEvidence" />
              <span class="hint">服务过程留凭根据关联系统表单填写提交，服务过程选填可跳过，关闭则直接进入下一环节</span>
            </el-form-item>
            <el-form-item label="结束服务">
              <el-switch v-model="form.endService" disabled />
              <span class="hint">服务人员结束服务</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="服务区域" name="area" lazy>
          <el-form v-loading="loading" :model="form" label-width="140px">
            <el-form-item label="是否开启">
              <el-switch v-model="form.serviceAreaEnabled" />
            </el-form-item>
            <el-form-item label="服务围栏">
              <service-area-fence
                v-if="form.serviceAreaEnabled"
                v-model="form.serviceAreaGeo"
                :visible="activeTab === 'area'"
              />
              <span v-else class="hint">开启后在地图上绘制上门范围</span>
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
import ServiceAreaFence from "./components/ServiceAreaFence.vue";

export default {
  name: "appointmentOnSiteSettings",
  components: { ServiceAreaFence },
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

<style scoped>
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
