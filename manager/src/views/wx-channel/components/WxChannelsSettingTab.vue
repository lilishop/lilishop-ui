<template>
  <div v-loading="loading" class="wx-channel-setting">
    <el-form label-width="160px" label-position="right" :model="configObject">
      <el-form-item label="AppId">
        <el-input v-model="configObject.appId" style="width: 360px" />
      </el-form-item>
      <el-form-item label="AppSecret">
        <el-input v-model="configObject.appSecret" style="width: 360px" />
      </el-form-item>
      <el-form-item label="接口基础地址">
        <el-input
          v-model="configObject.apiBase"
          style="width: 360px"
          placeholder="https://api.weixin.qq.com/minishop"
        />
      </el-form-item>
      <el-form-item label="Token地址">
        <el-input
          v-model="configObject.tokenUrl"
          style="width: 360px"
          placeholder="https://api.weixin.qq.com/cgi-bin/token"
        />
      </el-form-item>
      <div class="actions">
        <el-button type="primary" :loading="submitLoading" @click="submit">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getSetting, setSetting } from "@/api/index";

const defaultConfig = () => ({
  appId: "",
  appSecret: "",
  apiBase: "",
  tokenUrl: "",
});

export default {
  name: "WxChannelsSettingTab",
  data() {
    return {
      loading: false,
      submitLoading: false,
      configObject: defaultConfig(),
    };
  },
  mounted() {
    this.reloadConfig();
  },
  methods: {
    normalizeConfig(val) {
      if (!val) return {};
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return {};
        }
      }
      if (typeof val === "object") return val;
      return {};
    },
    pickConfigFields(val) {
      const next = defaultConfig();
      if (!val || typeof val !== "object") return next;
      Object.keys(next).forEach((k) => {
        if (val[k] !== undefined && val[k] !== null) {
          next[k] = val[k];
        }
      });
      return next;
    },
    reloadConfig() {
      this.loading = true;
      getSetting("WX_CHANNELS")
        .then((res) => {
          if (res && res.success) {
            const raw = this.normalizeConfig(res.result);
            this.configObject = this.pickConfigFields(raw);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit() {
      this.submitLoading = true;
      setSetting("WX_CHANNELS", this.configObject)
        .then((res) => {
          if (res && res.success) {
            this.$Message.success("保存成功");
            this.reloadConfig();
          } else {
            this.$Message.error("保存失败");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.actions {
  margin-left: 160px;
}
</style>
