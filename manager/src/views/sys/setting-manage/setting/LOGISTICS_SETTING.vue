<template>
  <div class="layout">
    <el-form ref="formValidate" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="平台 " prop="endPoint">
        <el-radio-group v-model="formValidate.type">
          <el-radio-button value="KDNIAO">快递鸟</el-radio-button>
          <el-radio-button value="KUAIDI100">快递100</el-radio-button>
          <el-radio-button value="SHUNFENG">顺丰</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formValidate.type === 'KDNIAO'" label="快递鸟 商户ID" prop="kdniaoEbusinessID">
        <el-input v-model="formValidate.kdniaoEbusinessID" />
      </el-form-item>
      <el-form-item v-if="formValidate.type === 'KDNIAO'" label="快递鸟 AppKey" prop="kdniaoAppKey">
        <el-input class="label-appkey" v-model="formValidate.kdniaoAppKey" />
      </el-form-item>
      <el-form-item v-if="formValidate.type === 'KDNIAO'" label="快递鸟 requestType" prop="requestType">
        <el-input class="label-appkey" v-model="formValidate.requestType" />
      </el-form-item>

      <el-form-item v-if="formValidate.type === 'KUAIDI100'" label="快递100 授权码" prop="kuaidi100Customer">
        <el-input class="label-appkey" v-model="formValidate.kuaidi100Customer" />
      </el-form-item>
      <el-form-item v-if="formValidate.type === 'KUAIDI100'" label="快递100 Key" prop="kuaidi100Key">
        <el-input class="label-appkey" v-model="formValidate.kuaidi100Key" />
      </el-form-item>
      <template v-if="formValidate.type === 'SHUNFENG'">
        <el-form-item label="顾客编码" prop="clientCode">
          <el-input v-model="formValidate.clientCode" />
        </el-form-item>
        <el-form-item label="校验码" prop="checkWord">
          <el-input v-model="formValidate.checkWord" />
        </el-form-item>
        <el-form-item label="请求地址" prop="callUrl">
          <el-input class="label-appkey" v-model="formValidate.callUrl" />
        </el-form-item>
        <el-form-item label="打印模板" prop="templateCode">
          <el-input class="label-appkey" v-model="formValidate.templateCode" />
        </el-form-item>
        <el-form-item label="月结号" prop="monthlyCardNo">
          <el-input class="label-appkey" v-model="formValidate.monthlyCardNo" />
        </el-form-item>
      </template>
      <div class="label-btns">
        <el-button type="primary" @click="submit('formValidate')">保存</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";
export default {
  data() {
    return {
      ruleValidate: {},
      result: "",
      formValidate: {
        type: "",
        kdniaoEbusinessID: "",
        kdniaoAppKey: "",
        requestType: "",
        kuaidi100Customer: "",
        kuaidi100Key: "",
      },
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
    setupSetting() {
      setSetting(this.type, this.formValidate).then((res) => {
        if (res.success) {
          ElMessage.success("保存成功!");
        } else {
          ElMessage.error("保存失败!");
        }
      });
    },
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
</style>
