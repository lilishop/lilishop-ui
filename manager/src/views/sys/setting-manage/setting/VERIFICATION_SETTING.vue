<template>
  <div class="layout">
    <el-form ref="formValidateRef" label-width="160px" label-position="right" :model="formValidate" :rules="ruleValidate">
      <el-form-item label="有效时间(秒)" prop="effectiveTime">
        <el-input-number v-model="formValidate.effectiveTime" :min="30" :max="3600" />
        <span class="desc">包含滑块生成及校验结果缓存的有效时间（秒）</span>
      </el-form-item>

      <el-form-item label="水印文字" prop="watermark">
        <el-input class="label-appkey" v-model="formValidate.watermark" placeholder="例如: LILI-SHOP" />
        <span class="desc">滑块背景图水印文本</span>
      </el-form-item>

      <el-form-item label="干扰块数量" prop="interfereNum">
        <el-input-number v-model="formValidate.interfereNum" :min="0" :max="2" />
        <span class="desc">滑块干扰块数量，最大为 2</span>
      </el-form-item>

      <el-form-item label="容错像素" prop="faultTolerant">
        <el-input-number v-model="formValidate.faultTolerant" :min="0" :max="20" />
        <span class="desc">滑块比对横坐标容错像素范围</span>
      </el-form-item>

      <el-form-item label="登录免验证码" prop="loginBypassEnabled">
        <el-switch v-model="formValidate.loginBypassEnabled" active-text="开启" inactive-text="关闭" />
        <span class="desc">开启后登录流程跳过滑块校验，仅建议本地或测试验收环境开启</span>
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
const { proxy } = getCurrentInstance();

const formValidateRef = ref(null);
const formValidate = ref({
  effectiveTime: 300,
  watermark: "LILI-SHOP",
  interfereNum: 0,
  faultTolerant: 3,
  loginBypassEnabled: false,
});

const ruleValidate = reactive({
  effectiveTime: [
    { required: true, message: "请输入有效时间", trigger: "blur" }
  ],
  watermark: [
    { required: true, message: "请输入水印文字", trigger: "blur" }
  ],
  interfereNum: [
    { required: true, message: "请输入干扰块数量", trigger: "blur" }
  ],
  faultTolerant: [
    { required: true, message: "请输入容错像素", trigger: "blur" }
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
        effectiveTime: Number(parsed.effectiveTime ?? 300),
        watermark: String(parsed.watermark ?? "LILI-SHOP"),
        interfereNum: Number(parsed.interfereNum ?? 0),
        faultTolerant: Number(parsed.faultTolerant ?? 3),
        loginBypassEnabled: Boolean(parsed.loginBypassEnabled ?? false),
      };
    } catch (e) {
      console.error("解析验证码设置失败", e);
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
  padding-bottom: 5px;
}

.desc {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}
</style>
