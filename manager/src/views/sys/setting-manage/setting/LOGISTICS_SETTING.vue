<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
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
<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";

const props = defineProps(["res", "type"]);

const ruleValidate = reactive({});
const result = ref("");
const formValidate = ref({
  type: "",
  kdniaoEbusinessID: "",
  kdniaoAppKey: "",
  requestType: "",
  kuaidi100Customer: "",
  kuaidi100Key: "",
});
// 模板 ref 与 data 字段 formValidate 同名会互相覆盖，改名 formValidateRef
const formValidateRef = ref(null);

function submit(name) {
  // validate.js 的 handleSubmit 依赖 that.$refs[name] 结构，构造兼容对象传入
  handleSubmit({ $refs: { [name]: formValidateRef.value } }, name)
    .then(() => {
      setupSetting();
    })
    .catch(() => {});
}
function setupSetting() {
  setSetting(props.type, formValidate.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
  });
}
function init() {
  result.value = JSON.parse(props.res);
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
