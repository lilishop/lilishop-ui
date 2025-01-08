<template>
  <div class="layout">
    <Form
      ref="formValidate"
      :label-width="150"
      label-position="right"
      :model="formValidate"
      :rules="ruleValidate"
    >
      <FormItem label="JSAPI支付应用ID" prop="jsapiAppId">
        <Input maxlength="300" class="w200" v-model="formValidate.jsapiAppId" />
      </FormItem>
      <FormItem label="Native支付应用ID" prop="nativeAppId">
        <Input maxlength="300" class="w200" v-model="formValidate.nativeAppId" />
      </FormItem>
      <FormItem label="小程序支付应用id" prop="mpAppId">
        <Input maxlength="300" class="w200" v-model="formValidate.mpAppId" />
      </FormItem>
      <FormItem label="H5支付应用ID" prop="h5AppId">
        <Input maxlength="300" class="w200" v-model="formValidate.h5AppId" />
      </FormItem>
      <FormItem label="APP支付应用ID" prop="appAppId">
        <Input maxlength="300" class="w200" v-model="formValidate.appAppId" />
      </FormItem>
      <FormItem label="商户号" prop="mchId">
        <Input maxlength="300" class="w200" v-model="formValidate.mchId" />
      </FormItem>
      <FormItem label="APIv3密钥" prop="apiKey3">
        <Input maxlength="300" v-model="formValidate.apiKey3" />
      </FormItem>
      <FormItem label="API证书-证书序列号" prop="serialNumber">
        <Input maxlength="300" v-model="formValidate.serialNumber" />
      </FormItem>
      <FormItem class="form-item-view-el" label="apiclient_key" prop="apiclient_key">
        <Input v-model="formValidate.apiclientKey" :rows="6" maxlength="2500" show-word-limit type="textarea" placeholder="Enter something..." />
      </FormItem>
      <FormItem label="公钥证书ID" prop="公钥证书ID">
        <Input maxlength="300" v-model="formValidate.publicId" />
      </FormItem>
      <FormItem class="form-item-view-el" label="公钥证书" prop="publicKey">
        <Input v-model="formValidate.publicKey" :rows="6" maxlength="2500" show-word-limit type="textarea" placeholder="Enter something..." />
      </FormItem>
      <FormItem label="支付回调域名" prop="callbackUrl">
        <Input maxlength="300" v-model="formValidate.callbackUrl" />
      </FormItem>
      <div class="label-btns">
        <Button type="primary" @click="submit('formValidate')">保存</Button>
      </div>
    </Form>
  </div>
</template>
<script>
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";

export default {
  data() {
    return {
      ruleValidate: {}, // 验证规则
      formValidate: {}, // 表单数据
    };
  },
  props: ["res", "type"],
  created() {
    this.init();
  },
  methods: {
    submit(name) {
      let that = this;
      if (handleSubmit(that, name)) {
        this.setupSetting();
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
      this.res = JSON.parse(this.res);

      this.$set(this, "formValidate", { ...this.res });
      Object.keys(this.formValidate).forEach((item) => {
        if (item.indexOf("pId") < 0) {
          this.ruleValidate[item] = [
            {
              required: true,
              message: "请填写必填项",
              trigger: "blur",
            },
          ];
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../setting/style.scss";

.label-item {
  display: flex;
}

.w200 {
  /deep/ .ivu-input {
    width: 250px !important;
    margin: 0 10px;
  }
}

/deep/ .ivu-input {
  width: 450px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 450px;
  margin-right: 10px;
}
</style>
