<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="是否测试模式" prop="isTestModel">
        <el-radio-group v-model="formValidate.isTestModel">
          <el-radio-button value="true">开启</el-radio-button>
          <el-radio-button value="false">关闭</el-radio-button>
        </el-radio-group>
        <span class="desc">测试模式则不实际发送短信，短信验证码为：111111</span>
      </el-form-item>
      <el-form-item label="登录短信模板CODE" prop="loginTemplateCode">
        <el-input v-model="formValidate.loginTemplateCode"/>
      </el-form-item>
      <el-form-item label="注册短信模板CODE" prop="registerTemplateCode">
        <el-input v-model="formValidate.registerTemplateCode"/>
      </el-form-item>
      <el-form-item label="找回密码短信模板CODE" prop="findPasswordTemplateCode">
        <el-input v-model="formValidate.findPasswordTemplateCode"/>
      </el-form-item>
      <el-form-item label="设置密码短信模板CODE" prop="walletPasswordTemplateCode">
        <el-input v-model="formValidate.walletPasswordTemplateCode"/>
      </el-form-item>
      <el-form-item label="支付密码短信模板CODE" prop="payPasswordTemplateCode">
        <el-input v-model="formValidate.payPasswordTemplateCode"/>
      </el-form-item>

      <el-form-item label="平台" prop="endPoint">
        <el-radio-group v-model="formValidate.type">
          <el-radio-button value="ALI">阿里云</el-radio-button>
          <el-radio-button value="HUAWEI">华为云</el-radio-button>
          <el-radio-button value="TENCENT">腾讯云</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!--      阿里云-->
      <el-form-item v-if="formValidate.type==='ALI'" label="accessKeyId" prop="accessKeyId">
        <el-input v-model="formValidate.accessKeyId"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='ALI'" label="accessSecret" prop="accessSecret">
        <el-input v-model="formValidate.accessSecret"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='ALI'" label="短信签名" prop="signName">
        <el-input v-model="formValidate.signName"/>
      </el-form-item>

      <!--      华为云-->
      <el-form-item v-if="formValidate.type==='HUAWEI'" label="APP_Key" prop="huaweiAppKey">
        <el-input v-model="formValidate.huaweiAppKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI'" label="APP_Secret" prop="huaweiAppSecret">
        <el-input v-model="formValidate.huaweiAppSecret"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI'" label="短信签名通道号" prop="huaweiSender">
        <el-input v-model="formValidate.huaweiSender"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI'" label="短信签名" prop="huaweiSignature">
        <el-input v-model="formValidate.huaweiSignature"/>
      </el-form-item>

      <!--      腾讯云-->
      <el-form-item v-if="formValidate.type==='TENCENT'" label="用户的 SecretId" prop="tencentSecretId">
        <el-input v-model="formValidate.tencentSecretId"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT'" label="用户的 SecretKey" prop="tencentSecretKey">
        <el-input v-model="formValidate.tencentSecretKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT'" label="短信应用ID" prop="tencentSdkAppId">
        <el-input v-model="formValidate.tencentSdkAppId"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT'" label="短信签名" prop="tencentSignName">
        <el-input v-model="formValidate.tencentSignName"/>
      </el-form-item>

      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidateRef')">保存</el-button>

      </div>
    </el-form>
  </div>
</template>
<script setup>
import { getCurrentInstance, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {setSetting} from "@/api/index";
import {handleSubmit} from "./validate";

const props = defineProps(["res", "type"]);

// handleSubmit 通过 vm.$refs 访问表单实例
const { proxy } = getCurrentInstance();

const result = ref("");
const ruleValidate = reactive({}); // 验证规则
const formValidate = ref({ // 表单数据
  isTestModel:1,
  loginTemplateCode:"",
  registerTemplateCode:"",
  findPasswordTemplateCode:"",
  walletPasswordTemplateCode:"",
  payPasswordTemplateCode:"",
  accessKeyId: "",
  regionId: "",
  picLocation: "",
  accessSecret: "",
  tencentSecretId: "",
  tencentSecretKey: "",
  tencentSdkAppId: "",
  tencentSignName: "",
  huaweiAppKey: "",
  huaweiAppSecret: "",
  huaweiSender: "",
  huaweiSignature: "",
});
// 表单实例：原模板 ref="formValidate" 与 data 同名会互相覆盖，改名 formValidateRef
const formValidateRef = ref(null);

// 保存
function submit(name) {
  handleSubmit(proxy, name)
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
  result.value = JSON.parse(props.res);

  Object.keys(result.value).map((item) => {
    result.value[item] += "";
  });

  formValidate.value = { ...result.value };
  Object.keys(formValidate.value).forEach((item) => {
    ruleValidate[item] = [
      {
        required: true,
        message: "请填写必填项",
        trigger: "blur",
      },
    ];
  });
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";

.label-item {
  display: flex;
}

:deep(.el-input){
  width: 300px !important;
  margin: 0 10px;
}

.el-input {
  width: 300px;
  margin-right: 10px;
}
</style>
