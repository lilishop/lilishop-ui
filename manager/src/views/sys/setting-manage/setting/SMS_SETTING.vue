<template>
  <div class="layout">
    <el-form ref="formValidate" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
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
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>

      </div>
    </el-form>
  </div>
</template>
<script>
import { ElMessage } from "element-plus";
import {setSetting} from "@/api/index";
import {handleSubmit} from "./validate";

export default {
  data() {
    return {
      result: "",
      ruleValidate: {}, // 验证规则
      formValidate: { // 表单数据
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
      },
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    // 保存
    submit(name) {
      handleSubmit(this, name)
        .then(() => {
          this.setupSetting();
        })
        .catch(() => {});
    },
    // 保存设置
    setupSetting() {
      setSetting(this.type, this.formValidate).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功!");
        } else {
          ElMessage.error("保存失败!");
        }
      });
    },
    // 实例化数据
    init() {
      this.result = JSON.parse(this.res);

      Object.keys(this.result).map((item) => {
        this.result[item] += "";
      });

      this.formValidate = { ...this.result };
      Object.keys(this.formValidate).forEach((item) => {
        this.ruleValidate[item] = [
          {
            required: true,
            message: "请填写必填项",
            trigger: "blur",
          },
        ];
      });
    },
  },
};
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
