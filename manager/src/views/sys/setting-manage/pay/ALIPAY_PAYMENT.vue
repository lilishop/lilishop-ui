<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="160px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="appId" prop="appId">
        <el-input maxlength="300" class="w200" v-model="formValidate.appId" />
      </el-form-item>
      <el-form-item label="certPath" prop="certPath">
        <el-input maxlength="300"  v-model="formValidate.certPath" />
      </el-form-item>
      <el-form-item label="alipayPublicCertPath" prop="alipayPublicCertPath">
        <el-input maxlength="300" v-model="formValidate.alipayPublicCertPath" />
      </el-form-item>
      <el-form-item label="privateKey" class="label-item" prop="privateKey">
        <el-input maxlength="3000" v-model="formValidate.privateKey" />
      </el-form-item>
      <el-form-item label="rootCertPath" prop="rootCertPath">
        <el-input maxlength="300" v-model="formValidate.rootCertPath" />
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
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { setSetting } from "@/api/index";
import { handleSubmit } from "../setting/validate";

const props = defineProps(["res", "type"]);

const ruleValidate = reactive({}); // 验证规则
const formValidate = ref({ // 表单数据
  accessKeyId: "",
  accessKeySecret: "",
  bucketName: "",
  picLocation: "",
  endPoint: "",
  callbackUrl: "",
});
// 模板 ref：formValidate 与顶层变量重名，改名避免互相覆盖
const formValidateRef = ref(null);

function submit(name) {
  // handleSubmit 通过 that.$refs[name] 取表单实例，此处以同名映射传入
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
