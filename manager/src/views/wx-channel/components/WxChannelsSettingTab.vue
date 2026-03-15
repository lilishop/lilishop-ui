<template>
  <div class="wx-channel-setting">
    <Form :label-width="160" label-position="right" :model="configObject">
      <FormItem label="AppId">
        <Input v-model="configObject.appId" style="width: 360px" />
      </FormItem>
      <FormItem label="AppSecret">
        <Input v-model="configObject.appSecret" style="width: 360px" />
      </FormItem>
      <FormItem label="接口基础地址">
        <Input
          v-model="configObject.apiBase"
          style="width: 360px"
          placeholder="https://api.weixin.qq.com/minishop"
        />
      </FormItem>
      <FormItem label="Token地址">
        <Input
          v-model="configObject.tokenUrl"
          style="width: 360px"
          placeholder="https://api.weixin.qq.com/cgi-bin/token"
        />
      </FormItem>
      <div class="actions">
        <Button type="primary" @click="submit" :loading="submitLoading">保存</Button>
      </div>
    </Form>
    <Spin size="large" fix v-if="loading"></Spin>
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
            const base = this.normalizeConfig(res.result);
            this.configObject = this.pickConfigFields(base);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit() {
      const payload = { ...this.configObject };
      this.submitLoading = true;
      setSetting("WX_CHANNELS", payload)
        .then((res) => {
          if (res && res.success) {
            this.$Message.success("保存成功");
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
