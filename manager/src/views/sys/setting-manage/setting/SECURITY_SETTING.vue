<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="200px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="数据脱敏级别" prop="sensitiveLevel">
        <el-radio-group v-model="formValidate.sensitiveLevel">
          <el-radio :value="0">不做脱敏</el-radio>
          <el-radio :value="1">管理端脱敏</el-radio>
          <el-radio :value="2">全端脱敏</el-radio>
        </el-radio-group>
        <span class="desc">控制手机号、收货地址、身份证等敏感信息脱敏显示策略</span>
      </el-form-item>

      <el-form-item label="演示站点保护" prop="isDemoSite">
        <el-switch v-model="formValidate.isDemoSite" active-text="开启" inactive-text="关闭" />
        <span class="desc">开启后拦截核心管理端修改与删除请求，防止演示数据被篡改</span>
      </el-form-item>

      <el-form-item label="买家端Token有效期" prop="buyerTokenExpireTime">
        <el-input type="number" v-model="formValidate.buyerTokenExpireTime">
          <template #append>分钟</template>
        </el-input>
        <span class="desc">买家免密登录会话有效时长</span>
      </el-form-item>

      <el-form-item label="管理/商家端Token有效期" prop="managerTokenExpireTime">
        <el-input type="number" v-model="formValidate.managerTokenExpireTime">
          <template #append>分钟</template>
        </el-input>
        <span class="desc">管理后台及店铺端操作人员会话有效时长</span>
      </el-form-item>

      <div class="label-btns" style="margin-left: 200px;">
        <el-button type="primary" @click="submit('formValidateRef')">保存设置</el-button>
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
const { proxy } = getCurrentInstance();

const formValidateRef = ref(null);
const formValidate = ref({
  sensitiveLevel: 1,
  isDemoSite: false,
  buyerTokenExpireTime: 259200,
  managerTokenExpireTime: 86400,
});

const ruleValidate = reactive({
  buyerTokenExpireTime: [
    { required: true, message: "请输入买家端Token有效时间", trigger: "blur" }
  ],
  managerTokenExpireTime: [
    { required: true, message: "请输入管理端Token有效时间", trigger: "blur" }
  ],
});

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
      ElMessage.error(res.message || "保存失败!");
    }
  });
}

function init() {
  if (props.res) {
    try {
      const parsed = typeof props.res === "string" ? JSON.parse(props.res) : props.res;
      formValidate.value = {
        sensitiveLevel: Number(parsed.sensitiveLevel ?? 1),
        isDemoSite: Boolean(parsed.isDemoSite ?? false),
        buyerTokenExpireTime: Number(parsed.buyerTokenExpireTime ?? 259200),
        managerTokenExpireTime: Number(parsed.managerTokenExpireTime ?? 86400),
      };
    } catch (e) {
      console.error("解析安全设置失败", e);
    }
  }
}

init();
</script>

<style lang="scss" scoped>
@import "./style.scss";

:deep(.el-form-item__label) {
  white-space: nowrap !important;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.el-radio-group {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
}

.desc {
  margin-left: 12px;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}
</style>
