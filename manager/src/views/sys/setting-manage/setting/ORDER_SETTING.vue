<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="150px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="微信订单自动上报" prop="wechatOrderAutoUploadEnabled">
        <el-switch v-model="formValidate.wechatOrderAutoUploadEnabled" inline-prompt active-text="开启" inactive-text="关闭" />
        <span class="desc wechat-order-desc">{{ formValidate.wechatOrderAutoUploadEnabled ? "已开启：符合条件的小程序订单自动上报发货信息并发送收货通知。" : "已关闭：停止微信发货上报和收货通知，商城正常发货不受影响。" }}</span>
        <span class="desc wechat-order-desc">关闭此开关不会关闭微信平台侧的订单管理要求；如需上报，请通过微信后台处理。修改后点击保存生效。</span>
      </el-form-item>
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
  wechatOrderAutoUploadEnabled: true,
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
    if (item === "wechatOrderAutoUploadEnabled") return;
    result.value[item] += "";
  });
  formValidate.value = {
    ...formValidate.value,
    ...result.value,
    wechatOrderAutoUploadEnabled: result.value.wechatOrderAutoUploadEnabled !== false && result.value.wechatOrderAutoUploadEnabled !== "false",
  };
  Object.keys(formValidate.value).forEach((item) => {
    if (item === "wechatOrderAutoUploadEnabled") return;
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

.wechat-order-desc {
  display: block;
  width: 100%;
  line-height: 20px;
}
</style>
