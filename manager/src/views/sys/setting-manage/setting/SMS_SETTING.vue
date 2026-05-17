<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">
      <FormItem label="是否测试模式" prop="isTestModel">
        <RadioGroup type="button" button-style="solid" v-model="formValidate.isTestModel">
          <Radio label="true">开启</Radio>
          <Radio label="false">关闭</Radio>
        </RadioGroup>
        <span class="desc">测试模式则不实际发送短信，短信验证码为：111111</span>
      </FormItem>
      <FormItem label="登录短信模板CODE" prop="loginTemplateCode">
        <Input v-model="formValidate.loginTemplateCode"/>
      </FormItem>
      <FormItem label="注册短信模板CODE" prop="registerTemplateCode">
        <Input v-model="formValidate.registerTemplateCode"/>
      </FormItem>
      <FormItem label="找回密码短信模板CODE" prop="findPasswordTemplateCode">
        <Input v-model="formValidate.findPasswordTemplateCode"/>
      </FormItem>
      <FormItem label="设置密码短信模板CODE" prop="walletPasswordTemplateCode">
        <Input v-model="formValidate.walletPasswordTemplateCode"/>
      </FormItem>
      <FormItem label="支付密码短信模板CODE" prop="payPasswordTemplateCode">
        <Input v-model="formValidate.payPasswordTemplateCode"/>
      </FormItem>

      <FormItem label="平台" prop="endPoint">
        <RadioGroup v-model="formValidate.type" type="button">
          <Radio label="ALI">阿里云</Radio>
          <Radio label="HUAWEI">华为云</Radio>
          <Radio label="TENCENT">腾讯云</Radio>
        </RadioGroup>
      </FormItem>
      <!--      阿里云-->
      <FormItem v-if="formValidate.type==='ALI'" label="accessKeyId" prop="accessKeyId">
        <Input v-model="formValidate.accessKeyId"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='ALI'" label="accessSecret" prop="accessSecret">
        <Input v-model="formValidate.accessSecret"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='ALI'" label="短信签名" prop="signName">
        <Input v-model="formValidate.signName"/>
      </FormItem>

      <!--      华为云-->
      <FormItem v-if="formValidate.type==='HUAWEI'" label="APP_Key" prop="huaweiAppKey">
        <Input v-model="formValidate.huaweiAppKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI'" label="APP_Secret" prop="huaweiAppSecret">
        <Input v-model="formValidate.huaweiAppSecret"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI'" label="短信签名通道号" prop="huaweiSender">
        <Input v-model="formValidate.huaweiSender"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI'" label="短信签名" prop="huaweiSignature">
        <Input v-model="formValidate.huaweiSignature"/>
      </FormItem>

      <!--      腾讯云-->
      <FormItem v-if="formValidate.type==='TENCENT'" label="用户的 SecretId" prop="tencentSecretId">
        <Input v-model="formValidate.tencentSecretId"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT'" label="用户的 SecretKey" prop="tencentSecretKey">
        <Input v-model="formValidate.tencentSecretKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT'" label="短信应用ID" prop="tencentSdkAppId">
        <Input v-model="formValidate.tencentSdkAppId"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT'" label="短信签名" prop="tencentSignName">
        <Input v-model="formValidate.tencentSignName"/>
      </FormItem>

      <div class="label-btns">
        <Button type="primary" @click="submit('formValidate')">保存</Button>

      </div>
    </Form>
  </div>
</template>
<script>
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
      let that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting()
      }
    },
    // 保存设置
    setupSetting() {
      setSetting(this.type, this.formValidate).then((res) => {
        if (res.success) {
          this.$Message.success("保存成功!");
        } else {
          this.$Message.error("保存失败!");
        }
      });
    },
    // 实例化数据
    init() {
      this.result = JSON.parse(this.res);

      Object.keys(this.result).map((item) => {
        this.result[item] += "";
      });

      this.$set(this, "formValidate", {...this.result});
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

::v-deep .ivu-input {
  width: 300px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}
</style>
