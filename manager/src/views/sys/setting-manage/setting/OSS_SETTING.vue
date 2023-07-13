<template>
  <div class="layout">
    <Form ref="formValidate" :label-width="150" label-position="right" :model="formValidate" :rules="ruleValidate">

      <FormItem label="平台" >
        <RadioGroup v-model="formValidate.type" type="button">
          <Radio label="ALI_OSS">阿里OSS</Radio>
          <Radio label="MINIO">MINIO</Radio>
          <Radio label="HUAWEI_OBS">华为云OBS</Radio>
          <Radio label="TENCENT_COS">腾讯云COS</Radio>
        </RadioGroup>
      </FormItem>
      <!--      阿里云存储-->
      <FormItem v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSEndPoint" label="节点" prop="aliyunOSSEndPoint">
        <Input v-model="formValidate.aliyunOSSEndPoint"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSBucketName" label="储存空间" class="label-item" prop="aliyunOSSBucketName">
        <Input v-model="formValidate.aliyunOSSBucketName"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSAccessKeyId" label="密钥id" prop="aliyunOSSAccessKeyId">
        <Input v-model="formValidate.aliyunOSSAccessKeyId"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSAccessKeySecret" label="密钥" prop="aliyunOSSAccessKeySecret">
        <Input v-model="formValidate.aliyunOSSAccessKeySecret"/>
      </FormItem>


      <!--      MINIO存储-->

      <FormItem v-if="formValidate.type==='MINIO'" label="访问地址" key="m_frontUrl" prop="m_frontUrl">
        <Input v-model="formValidate.m_frontUrl"/>
        <span class="desc">配置MINIO nginx前端访问转发地址，一般为完整域名，例如：https://minio.pickmall.cn</span>
      </FormItem>
      <FormItem v-if="formValidate.type==='MINIO'" label="endpoint" key="m_endpoint" prop="m_endpoint">
        <Input v-model="formValidate.m_endpoint"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='MINIO'" label="accessKey" key="m_accessKey" class="label-item" prop="m_accessKey">
        <Input v-model="formValidate.m_accessKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='MINIO'" label="secretKey" key="m_secretKey" prop="m_secretKey">
        <Input v-model="formValidate.m_secretKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='MINIO'" label="bucketName" key="m_bucketName" prop="m_bucketName">
        <Input v-model="formValidate.m_bucketName"/>
      </FormItem>


      <!--      华为云存储-->
      <FormItem v-if="formValidate.type==='HUAWEI_OBS'" label="发起者的Access Key" key="huaweicloudOBSAccessKey" prop="huaweicloudOBSAccessKey">
        <Input v-model="formValidate.huaweicloudOBSAccessKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI_OBS'" label="密钥" class="label-item" key="huaweicloudOBSSecretKey" prop="huaweicloudOBSSecretKey">
        <Input v-model="formValidate.huaweicloudOBSSecretKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI_OBS'" label="节点" key="huaweicloudOBSEndPoint" prop="huaweicloudOBSEndPoint">
        <Input v-model="formValidate.huaweicloudOBSEndPoint"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='HUAWEI_OBS'" label="桶" key="huaweicloudOBSBucketName" prop="huaweicloudOBSBucketName">
        <Input v-model="formValidate.huaweicloudOBSBucketName"/>
      </FormItem>

      <!--      腾讯云存储-->
      <FormItem v-if="formValidate.type==='TENCENT_COS'" label="用户的SecretId" key="tencentCOSSecretId" prop="tencentCOSSecretId">
        <Input v-model="formValidate.tencentCOSSecretId"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT_COS'" label="用户的SecretKey" key="tencentCOSSecretKey" class="label-item" prop="tencentCOSSecretKey">
        <Input v-model="formValidate.tencentCOSSecretKey"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT_COS'" label="bucket的地域" key="tencentCOSRegion" prop="tencentCOSRegion">
        <Input v-model="formValidate.tencentCOSRegion"/>
      </FormItem>
      <FormItem v-if="formValidate.type==='TENCENT_COS'" label="bucket" key="tencentCOSBucket" prop="tencentCOSBucket">
        <Input v-model="formValidate.tencentCOSBucket"/>
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
      ruleValidate: {}, // 验证规则
      formValidate: { // 表单数据
        type: "",
        aliyunOSSAccessKeyId: "",
        aliyunOSSAccessKeySecret: "",
        aliyunOSSBucketName: "",
        aliyunOSSEndPoint: "",
        m_endpoint: "",
        m_accessKey: "",
        m_secretKey: "",
        m_bucketName: "",
        m_frontUrl: "",
        huaweicloudOBSAccessKey: "",
        huaweicloudOBSSecretKey: "",
        huaweicloudOBSEndPoint: "",
        huaweicloudOBSBucketName: "",
        tencentCOSSecretId: "",
        tencentCOSSecretKey: "",
        tencentCOSRegion: "",
        tencentCOSBucket: "",
        tencentCOSEndPoint: "",
      },
      result:""
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

/deep/ .ivu-input {
  width: 300px !important;
  margin: 0 10px;
}

.ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}
.desc {
  margin-left: 5px;
  font-size: 12px;
  color: #999;
}
</style>

