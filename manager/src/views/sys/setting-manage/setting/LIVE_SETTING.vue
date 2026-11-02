<template>
  <div class="setting-page">
    <el-form
      ref="formValidateRef"
      label-width="180px"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <div class="setting-section">
        <div class="section-title">推流 / 拉流</div>
        <el-form-item label="直播推流域名" prop="domain">
          <el-input v-model="formValidate.domain" placeholder="请输入直播推流域名" />
        </el-form-item>
        <el-form-item label="小程序直播推流域名" prop="mpPushDomain">
          <el-input v-model="formValidate.mpPushDomain" placeholder="请输入小程序直播推流域名" />
        </el-form-item>
        <el-form-item label="直播拉流域名" prop="pullDomain">
          <el-input v-model="formValidate.pullDomain" placeholder="请输入直播拉流域名" />
        </el-form-item>
      </div>

      <div class="setting-section">
        <div class="section-title">应用配置</div>
        <el-form-item label="直播应用名称" prop="appName">
          <el-input v-model="formValidate.appName" placeholder="请输入直播应用名称" />
        </el-form-item>
        <el-form-item label="直播流名称" prop="streamName">
          <el-input v-model="formValidate.streamName" placeholder="请输入直播流名称" />
        </el-form-item>
      </div>

      <div class="setting-section">
        <div class="section-title">密钥配置</div>
        <el-form-item label="密钥Id" prop="secretId">
          <el-input v-model="formValidate.secretId" placeholder="请输入密钥Id" show-password />
        </el-form-item>
        <el-form-item label="密钥Key" prop="secretKey">
          <el-input v-model="formValidate.secretKey" placeholder="请输入密钥Key" show-password />
        </el-form-item>
        <el-form-item label="推流鉴权秘钥" :prop="'key'">
          <el-input v-model="formValidate.key" placeholder="请输入推流鉴权秘钥" show-password />
        </el-form-item>
      </div>

      <div class="setting-section">
        <div class="section-title">回调配置</div>
        <el-form-item label="直播回调地址" prop="callBackUrl">
          <el-input v-model="formValidate.callBackUrl" placeholder="请输入直播回调地址" />
        </el-form-item>
      </div>

      <div class="setting-section">
        <div class="section-title">IM 配置</div>
        <el-form-item label="直播IM SDK APPID" prop="imSdkAppid">
          <el-input v-model="formValidate.imSdkAppid" placeholder="请输入直播IM SDK APPID" />
        </el-form-item>
        <el-form-item label="直播IM SDK 密钥" prop="imSdkSecretKey">
          <el-input v-model="formValidate.imSdkSecretKey" placeholder="请输入直播IM SDK 密钥" show-password />
        </el-form-item>
      </div>

      <div class="submit-bar">
        <el-button type="primary" @click="submit('formValidateRef')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from "vue";
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

const props = defineProps(["res", "type"]);

const ruleValidate = ref({});
const formValidate = ref({ ...DEFAULT_FORM });

// 模板 ref 与 data 字段同名陷阱：模板 ref 改名为 formValidateRef，通过映射表支持 submit(name) 动态取值
const formValidateRef = ref(null);
const formRefs = { formValidateRef };

function init() {
  const result = props.res ? JSON.parse(props.res) : {};
  formValidate.value = { ...DEFAULT_FORM };
  Object.keys(DEFAULT_FORM).forEach((field) => {
    if (result[field] != null && result[field] !== undefined) {
      formValidate.value[field] = result[field];
    }
  });
  ruleValidate.value = {};
  Object.keys(DEFAULT_FORM).forEach((item) => {
    if (OPTIONAL_FIELDS.includes(item)) return;
    ruleValidate.value[item] = [
      {
        required: true,
        message: "请填写必填项",
        trigger: "blur",
      },
    ];
  });
}

function submit(name) {
  formRefs[name].value.validate((valid) => {
    if (valid) {
      setupSetting();
    } else {
      ElMessage.error("请正确填写内容!");
    }
  });
}

function setupSetting() {
  const payload = { ...DEFAULT_FORM };
  Object.keys(DEFAULT_FORM).forEach((field) => {
    payload[field] = formValidate.value[field] ?? "";
  });
  setSetting(props.type, payload).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";

.setting-page {
  padding: 16px 0;
}

.setting-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 24px 4px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

// 覆盖共享样式里 :deep(.el-input) 的 200px !important，统一输入框宽度
:deep(.el-input) {
  width: 400px !important;
}

.submit-bar {
  text-align: center;
  margin: 24px 0 8px;
}
</style>
