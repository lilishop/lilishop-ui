<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="订单自动取消" prop="autoCancel">
        <el-input type="number" v-model="formValidate.autoCancel">
          <template #append>分</template>
        </el-input>
        <span class="desc">发起订单后，多少分钟未操作取消订单</span>
      </el-form-item>

      <el-form-item label="订单自动收货" class="label-item" prop="autoReceive">
        <el-input type="number" v-model="formValidate.autoReceive">
          <template #append>天</template>
        </el-input>
        <span class="desc">发货后多少天自动完成收货</span>
      </el-form-item>

      <el-form-item label="自动好评" prop="autoEvaluation">
        <el-input type="number" v-model="formValidate.autoEvaluation">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单完成后，多少天后自动好评，预约订单同样适用</span>
      </el-form-item>
      <el-form-item label="已完成订单允许退单" prop="closeAfterSale">
        <el-input type="number" v-model="formValidate.closeAfterSale">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单完成后，多少天内允许退单，如果天数为0,则完成订单当天可以退单，之后就不再允许。</span>
      </el-form-item>
      <el-form-item label="已完成订单允许投诉" prop="closeComplaint">
        <el-input type="number" v-model="formValidate.closeComplaint">
          <template #append>天</template>
        </el-input>
        <span class="desc">订单完成后，多少天内允许投诉，如果天数为0,则不允许投诉</span>
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

const ruleValidate = reactive({});
const formValidate = ref({
  autoCancel: "",
  autoEvaluation: "",
  autoReceive: "",
  closeAfterSale: "",
  closeComplaint: "",
});
const result = ref("");

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

.label-item {
  display: flex;
}

.el-input {
  width: 180px;
  margin-right: 10px;
}

:deep(.el-input){
  width: 180px !important;
}

.desc {
  font-size: 12px;
  color: #999;
}
</style>
