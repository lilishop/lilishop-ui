
<template>
  <el-card class="sms-setting-card">
    <div class="cardBox">
      <div class="methodItem">
        <img src="../../../assets/aliyun.png" height="172" width="440" />
        <h4>阿里云短信</h4>
      </div>
      <div class="bar">
        <div class="status" style="color: rgb(53, 189, 129)">已启用</div>
        <div><a class="links">编辑</a></div>
      </div>
    </div>
    <el-dialog v-model="modalVisible" :title="modalTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="accessKeyId" prop="addressName">
          <el-input v-model="form.accessKeyId" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="accessSecret" prop="accessSecret">
          <el-input v-model="form.accessSecret" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="signName" prop="signName">
          <el-input v-model="form.signName" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="saveSetting">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getSetting, setSetting } from "@/api/index.js";
import template from "./template";

defineOptions({
  name: "smsSettingManage",
});

// 模板 ref，原名 form，与 data 的 form 同名冲突，改为 formRef
const formRef = ref(null);

const submitLoading = ref(false);
// data 中原有的 template 字段即上方 import 的模块本身，顶层导入已可直接访问，不再重复声明
const selected = ref("");
const settingData = ref("");
const modalTitle = ref("设置");
const modalVisible = ref(false);
const form = ref({});

function init() {
  // 原 Options API 中此处未加 this，运行时会抛 ReferenceError（历史遗留 bug）；
  // 转换为 script setup 后同名顶层函数可直接解析，代码按原样保留
  settingInfo("SMS_SETTING");
}

function saveSetting() {
  setSetting("SMS_SETTING", form.value).then((res) => {
    if (res.success) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error("保存失败!");
    }
    modalVisible.value = false;
  });
}

function settingInfo(v) {
  alert();
  selected.value = v;
  getSetting(v).then((res) => {
    if (res.result) {
      modalVisible.value = true;
      form.value = res;
    }
  });
}

onMounted(() => {
  init();
});
</script>
<style lang="scss">
.sms-setting-card {
  width: 100%;
  height: 100%;
  position: fixed;
}
.cardBox {
  display: inline-block;
  border-radius: 2px;
  line-height: 1.5;
  margin-right: 20px;
  width: 300px;
  border: 1px solid #eee;
  padding: 10px;
}

.methodItem {
  width: 100%;
  border: 1px solid #f5f5f5;
  text-align: center;
  padding: 20px 0;
}

methodItem img {
  width: 220px;
  height: 86px;
}

methodItem h4 {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}

.methodItem img {
  width: 220px;
  height: 86px;
}

.bar {
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 10px 8px 0;
}
</style>
