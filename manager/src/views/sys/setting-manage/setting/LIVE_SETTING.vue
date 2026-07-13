<template>
  <div class="layout">
    <el-form
      ref="formValidate"
      label-width="180px"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <h4 class="section-title">推流 / 拉流</h4>
      <el-form-item label="直播推流域名" prop="domain">
        <el-input v-model="formValidate.domain" placeholder="请输入直播推流域名" />
      </el-form-item>
      <el-form-item label="小程序直播推流域名" prop="mpPushDomain">
        <el-input v-model="formValidate.mpPushDomain" placeholder="请输入小程序直播推流域名" />
      </el-form-item>
      <el-form-item label="直播拉流域名" prop="pullDomain">
        <el-input v-model="formValidate.pullDomain" placeholder="请输入直播拉流域名" />
      </el-form-item>

      <h4 class="section-title">应用配置</h4>
      <el-form-item label="直播应用名称" prop="appName">
        <el-input v-model="formValidate.appName" placeholder="请输入直播应用名称" />
      </el-form-item>
      <el-form-item label="直播流名称" prop="streamName">
        <el-input v-model="formValidate.streamName" placeholder="请输入直播流名称" />
      </el-form-item>

      <h4 class="section-title">密钥配置</h4>
      <el-form-item label="密钥Id" prop="secretId">
        <el-input v-model="formValidate.secretId" placeholder="请输入密钥Id" show-password />
      </el-form-item>
      <el-form-item label="密钥Key" prop="secretKey">
        <el-input v-model="formValidate.secretKey" placeholder="请输入密钥Key" show-password />
      </el-form-item>
      <el-form-item label="推流鉴权秘钥" :prop="'key'">
        <el-input v-model="formValidate.key" placeholder="请输入推流鉴权秘钥" show-password />
      </el-form-item>

      <h4 class="section-title">回调配置</h4>
      <el-form-item label="直播回调地址" prop="callBackUrl">
        <el-input v-model="formValidate.callBackUrl" placeholder="请输入直播回调地址" />
      </el-form-item>

      <h4 class="section-title">IM 配置</h4>
      <el-form-item label="直播IM SDK APPID" prop="imSdkAppid">
        <el-input v-model="formValidate.imSdkAppid" placeholder="请输入直播IM SDK APPID" />
      </el-form-item>
      <el-form-item label="直播IM SDK 密钥" prop="imSdkSecretKey">
        <el-input v-model="formValidate.imSdkSecretKey" placeholder="请输入直播IM SDK 密钥" show-password />
      </el-form-item>

      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";

const DEFAULT_FORM = {
  domain: "",
  mpPushDomain: "",
  pullDomain: "",
  appName: "",
  streamName: "",
  secretId: "",
  secretKey: "",
  key: "",
  callBackUrl: "",
  imSdkAppid: "",
  imSdkSecretKey: "",
};

const OPTIONAL_FIELDS = ["mpPushDomain", "callBackUrl"];

export default {
  props: ["res", "type"],
  data() {
    return {
      ruleValidate: {},
      formValidate: { ...DEFAULT_FORM },
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      const result = this.res ? JSON.parse(this.res) : {};
      this.formValidate = { ...DEFAULT_FORM };
      Object.keys(DEFAULT_FORM).forEach((field) => {
        if (result[field] != null && result[field] !== undefined) {
          this.formValidate[field] = result[field];
        }
      });
      this.ruleValidate = {};
      Object.keys(DEFAULT_FORM).forEach((item) => {
        if (OPTIONAL_FIELDS.includes(item)) return;
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
          },
        ];
      });
    },
    submit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.setupSetting();
        } else {
          ElMessage.error("请正确填写内容!");
        }
      });
    },
    setupSetting() {
      const payload = { ...DEFAULT_FORM };
      Object.keys(DEFAULT_FORM).forEach((field) => {
        payload[field] = this.formValidate[field] ?? "";
      });
      setSetting(this.type, payload).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功!");
        } else {
          ElMessage.error("保存失败!");
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./style.scss";

.section-title {
  margin: 16px 0 8px 180px;
  padding-left: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;

  &:first-of-type {
    margin-top: 0;
  }
}

:deep(.el-input) {
  width: 420px !important;
  margin: 0;
}

.el-input {
  width: 420px;
}
</style>
