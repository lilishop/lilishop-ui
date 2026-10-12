<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="提现审核是否开启">
        <el-switch v-model="formValidate.apply" active-text="开" inactive-text="关" />
      </el-form-item>

      <el-form-item label="最低提现金额" prop="minPrice">
        ￥<el-input class="label-appkey" v-model="formValidate.minPrice" />
      </el-form-item>

      <el-form-item label="提现方式" prop="type">
        <el-radio-group v-model="formValidate.type">
          <el-radio value="WECHAT">微信</el-radio>
          <el-radio value="ALI">支付宝</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="微信提现应用ID" prop="wechatAppId">
        <el-input class="label-appkey" v-model="formValidate.wechatAppId" />
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

const result = ref("");
// 只做属性合并的成组对象
const ruleValidate = reactive({});
const formValidate = ref({});
// 历史遗留：声明后未在模板使用，原样保留
const switchTitle = ref("提现审核是否开启");

// 模板 ref 与 data 同名会互相覆盖，改名 formValidateRef 并同步改 script
const formValidateRef = ref(null);

function submit(name) {
  handleSubmit(proxy, name)
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
  Object.keys(result.value).map((item) => {
    result.value[item] += "";
  });
  formValidate.value = { ...result.value };
  Object.keys(formValidate.value).forEach((item) => {
    ruleValidate[item] = [
      {
        required: true,
        message: "请填写必填项",
        trigger: "blur",
      },
      {
        validator: (rule, value, callback) => {
          if (value < 0) {
            callback(new Error("不能输入负数！"));
          } else {
            callback();
          }
        },
        trigger: "change",
      },
    ];
  });
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";
:deep(.el-form-item__content){
  align-items: center;
  padding-bottom: 5px;
}
</style>
