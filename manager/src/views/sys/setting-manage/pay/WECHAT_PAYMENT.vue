<template>
  <div class="layout">
    <el-form
      ref="formValidateRef"
      label-width="150px"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <el-form-item label="JSAPI支付应用ID" prop="jsapiAppId">
        <el-input maxlength="300" class="w200" v-model="formValidate.jsapiAppId" />
      </el-form-item>
      <el-form-item label="Native支付应用ID" prop="nativeAppId">
        <el-input maxlength="300" class="w200" v-model="formValidate.nativeAppId" />
      </el-form-item>
      <el-form-item label="小程序支付应用id" prop="mpAppId">
        <el-input maxlength="300" class="w200" v-model="formValidate.mpAppId" />
      </el-form-item>
      <el-form-item label="H5支付应用ID" prop="h5AppId">
        <el-input maxlength="300" class="w200" v-model="formValidate.h5AppId" />
      </el-form-item>
      <el-form-item label="APP支付应用ID" prop="appAppId">
        <el-input maxlength="300" class="w200" v-model="formValidate.appAppId" />
      </el-form-item>
      <el-form-item label="商户号" prop="mchId">
        <el-input maxlength="300" class="w200" v-model="formValidate.mchId" />
      </el-form-item>
      <el-form-item label="APIv3密钥" prop="apiKey3">
        <el-input maxlength="300" v-model="formValidate.apiKey3" />
      </el-form-item>
      <el-form-item label="API证书-证书序列号" prop="serialNumber">
        <el-input maxlength="300" v-model="formValidate.serialNumber" />
      </el-form-item>
      <el-form-item class="form-item-view-el" label="apiclient_key" prop="apiclient_key">
        <el-input v-model="formValidate.apiclientKey" :rows="6" maxlength="2500" show-word-limit type="textarea" placeholder="Enter something..." />
      </el-form-item>
      <el-form-item label="加签方式" prop="publicType">
        <!-- 历史遗留：handlePublicTypeChange 从未定义，原样保留 -->
        <el-radio-group v-model="formValidate.publicType" @change="handlePublicTypeChange">
          <el-radio-button value="CERT">平台证书</el-radio-button>
          <el-radio-button value="KEY">微信支付公钥</el-radio-button>
        </el-radio-group>
        <span class="desc">商户接收APIv3的请求应答、回调时验签使用，以下两种方式只能使用一种</span>
      </el-form-item>
      <!-- 当加签方式选择“KEY”时展示 -->
      <el-form-item v-if="formValidate.publicType === 'KEY'" label="公钥证书ID" prop="publicId">
        <el-input maxlength="300" v-model="formValidate.publicId" />
      </el-form-item>
      <el-form-item v-if="formValidate.publicType === 'KEY'" class="form-item-view-el" label="公钥证书" prop="publicKey">
        <el-input v-model="formValidate.publicKey" :rows="6" maxlength="2500" show-word-limit type="textarea" placeholder="Enter something..." />
      </el-form-item>
      <el-form-item label="支付回调域名" prop="callbackUrl">
        <el-input maxlength="300" v-model="formValidate.callbackUrl" />
      </el-form-item>
      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";

const props = defineProps(["res", "type"]);

const ruleValidate = reactive({}); // 验证规则
const formValidate = ref({}); // 表单数据

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef
const formValidateRef = ref(null);

function submit(name) {
  // handleSubmit 依赖 vm.$refs，传入表单 ref 映射保持原有行为
  handleSubmit({ $refs: { [name]: formValidateRef.value } }, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}

// 保存设置
function setupSetting() {
  setSetting(props.type, formValidate.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}

// 实例化数据
function init() {
  const setting = JSON.parse(props.res || "{}");
  formValidate.value = { ...setting };
  Object.keys(formValidate.value).forEach((item) => {
    if (item.indexOf("pId") < 0) {
      ruleValidate[item] = [
        {
          required: true,
          message: "请填写必填项",
          trigger: "blur",
        },
      ];
    }
  });
}

// created
init();
</script>

<style lang="scss" scoped>
@import "../setting/style.scss";

.label-item {
  display: flex;
}

.w200 {
  :deep(.el-input){
    width: 250px !important;
    margin: 0 10px;
  }
}

:deep(.el-input){
  width: 450px !important;
  margin: 0 10px;
}

.el-input {
  width: 450px;
  margin-right: 10px;
}
</style>
