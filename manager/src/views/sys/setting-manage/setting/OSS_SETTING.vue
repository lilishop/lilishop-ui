<template>
  <div class="layout">
    <el-form ref="formValidate" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">

      <el-form-item label="平台" >
        <el-radio-group v-model="formValidate.type">
          <el-radio-button value="ALI_OSS">阿里OSS</el-radio-button>
          <el-radio-button value="MINIO">MINIO</el-radio-button>
          <el-radio-button value="HUAWEI_OBS">华为云OBS</el-radio-button>
          <el-radio-button value="TENCENT_COS">腾讯云COS</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!--      阿里云存储-->
      <el-form-item v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSEndPoint" label="节点" prop="aliyunOSSEndPoint">
        <el-input v-model="formValidate.aliyunOSSEndPoint"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSBucketName" label="储存空间" class="label-item" prop="aliyunOSSBucketName">
        <el-input v-model="formValidate.aliyunOSSBucketName"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSAccessKeyId" label="密钥id" prop="aliyunOSSAccessKeyId">
        <el-input v-model="formValidate.aliyunOSSAccessKeyId"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='ALI_OSS'" key="aliyunOSSAccessKeySecret" label="密钥" prop="aliyunOSSAccessKeySecret">
        <el-input v-model="formValidate.aliyunOSSAccessKeySecret"/>
      </el-form-item>


      <!--      MINIO存储-->

      <el-form-item v-if="formValidate.type==='MINIO'" label="访问地址" key="m_frontUrl" prop="m_frontUrl">
        <el-input v-model="formValidate.m_frontUrl"/>
        <span class="desc">配置MINIO nginx前端访问转发地址，一般为完整域名，例如：https://minio.pickmall.cn</span>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='MINIO'" label="endpoint" key="m_endpoint" prop="m_endpoint">
        <el-input v-model="formValidate.m_endpoint"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='MINIO'" label="accessKey" key="m_accessKey" class="label-item" prop="m_accessKey">
        <el-input v-model="formValidate.m_accessKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='MINIO'" label="secretKey" key="m_secretKey" prop="m_secretKey">
        <el-input v-model="formValidate.m_secretKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='MINIO'" label="bucketName" key="m_bucketName" prop="m_bucketName">
        <el-input v-model="formValidate.m_bucketName"/>
      </el-form-item>


      <!--      华为云存储-->
      <el-form-item v-if="formValidate.type==='HUAWEI_OBS'" label="发起者的Access Key" key="huaweicloudOBSAccessKey" prop="huaweicloudOBSAccessKey">
        <el-input v-model="formValidate.huaweicloudOBSAccessKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI_OBS'" label="密钥" class="label-item" key="huaweicloudOBSSecretKey" prop="huaweicloudOBSSecretKey">
        <el-input v-model="formValidate.huaweicloudOBSSecretKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI_OBS'" label="节点" key="huaweicloudOBSEndPoint" prop="huaweicloudOBSEndPoint">
        <el-input v-model="formValidate.huaweicloudOBSEndPoint"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='HUAWEI_OBS'" label="桶" key="huaweicloudOBSBucketName" prop="huaweicloudOBSBucketName">
        <el-input v-model="formValidate.huaweicloudOBSBucketName"/>
      </el-form-item>

      <!--      腾讯云存储-->
      <el-form-item v-if="formValidate.type==='TENCENT_COS'" label="用户的SecretId" key="tencentCOSSecretId" prop="tencentCOSSecretId">
        <el-input v-model="formValidate.tencentCOSSecretId"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT_COS'" label="用户的SecretKey" key="tencentCOSSecretKey" class="label-item" prop="tencentCOSSecretKey">
        <el-input v-model="formValidate.tencentCOSSecretKey"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT_COS'" label="bucket的地域" key="tencentCOSRegion" prop="tencentCOSRegion">
        <el-input v-model="formValidate.tencentCOSRegion"/>
      </el-form-item>
      <el-form-item v-if="formValidate.type==='TENCENT_COS'" label="bucket" key="tencentCOSBucket" prop="tencentCOSBucket">
        <el-input v-model="formValidate.tencentCOSBucket"/>
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
.desc {
  margin-left: 5px;
  font-size: 12px;
  color: #999;
}
</style>

