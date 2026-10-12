<template>
  <div class="set-password">
    <el-popover trigger="focus" placement="right" :width="250">
      <template #reference>
        <el-input
          v-model="currentValue"
          type="password"
          show-password
          style="width: 350px"
          :maxlength="maxlength"
          :size="size"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          @input="handleChange"
        />
      </template>
      <div :class="tipStyle">
        <div class="words">强度 : {{ strength }}</div>
        <el-progress
          :percentage="strengthValue"
          :status="progressStatus"
          :show-text="false"
          style="margin: 13px 0"
        />
        <br />请至少输入 6 个字符。请不要使用容易被猜到的密码。
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

defineOptions({ name: "setPassword" });

const props = defineProps({
  modelValue: String,
  value: String,
  size: String,
  placeholder: {
    type: String,
    default: "请输入密码，长度为6-20个字符",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: 20,
  },
});
const emit = defineEmits(["update:modelValue", "input", "on-change"]);

const currentValue = ref(props.modelValue ?? props.value ?? "");
const tipStyle = ref("password-tip-none");
const strengthValue = ref(0);
const progressStatus = ref("");
const strength = ref("无");
const grade = ref(0);

watch(
  () => props.modelValue,
  (val) => {
    setCurrentValue(val);
  }
);
watch(
  () => props.value,
  (val) => {
    setCurrentValue(val);
  }
);

function checkStrengthValue(v) {
  // 局部变量原名 grade 与顶层 ref 同名，改名避免遮蔽
  let g = 0;
  if (/\d/.test(v)) g++;
  if (/[a-z]/.test(v)) g++;
  if (/[A-Z]/.test(v)) g++;
  if (/\W/.test(v)) g++;
  if (v.length >= 10) g++;
  grade.value = g;
  return g;
}

function strengthChange() {
  if (!currentValue.value) {
    tipStyle.value = "password-tip-none";
    strength.value = "无";
    strengthValue.value = 0;
    return;
  }
  const grade = checkStrengthValue(currentValue.value);
  if (grade <= 1) {
    progressStatus.value = "exception";
    tipStyle.value = "password-tip-weak";
    strength.value = "弱";
    strengthValue.value = 33;
  } else if (grade >= 2 && grade <= 4) {
    progressStatus.value = "";
    tipStyle.value = "password-tip-middle";
    strength.value = "中";
    strengthValue.value = 66;
  } else {
    progressStatus.value = "success";
    tipStyle.value = "password-tip-strong";
    strength.value = "强";
    strengthValue.value = 100;
  }
}

function handleChange() {
  strengthChange();
  emit("update:modelValue", currentValue.value);
  emit("input", currentValue.value);
  emit("on-change", currentValue.value, grade.value, strength.value);
}

function setCurrentValue(value) {
  if (value === currentValue.value) return;
  currentValue.value = value ?? "";
  strengthChange();
  emit("on-change", currentValue.value, grade.value, strength.value);
}
</script>

<style lang="scss" scoped>
.password-tip-none {
  padding: 1vh 0;
}
.password-tip-weak .words {
  color: #ed3f14;
}
.password-tip-middle .words {
  color: #2d8cf0;
}
.password-tip-strong .words {
  color: #52c41a;
}
</style>
