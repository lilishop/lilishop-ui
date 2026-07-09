<template>
  <div class="layout">
    <el-form
      ref="formValidate"
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
<script>
import { ElMessage } from "element-plus";
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
      const setting = JSON.parse(this.res || "{}");
      this.formValidate = { ...setting };
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
    }
  },
};
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
