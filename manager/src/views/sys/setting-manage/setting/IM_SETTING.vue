<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="云IM地址" prop="httpUrl">
        <el-input v-model="formValidate.httpUrl"/>
        <span class="desc">配置买家端联系客服以及商家端登录客服跳转的路径</span>
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
import { setSetting } from "@/api/index";
import { handleSubmit } from "./validate";

const props = defineProps(["res", "type"]);

// handleSubmit(that, name) 通过 that.$refs[name] 取表单实例
const { proxy } = getCurrentInstance();

// 只做属性合并的成组对象
const ruleValidate = reactive({}); // 验证规则
const formValidate = ref({ // 表单数据
  httpUrl: ""
});
const result = ref("");

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef 并同步改 script
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
