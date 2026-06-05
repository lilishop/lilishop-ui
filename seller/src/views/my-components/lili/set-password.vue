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

<script>
export default {
  name: "setPassword",
  props: {
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
  },
  emits: ["update:modelValue", "input", "on-change"],
  data() {
    return {
      currentValue: this.modelValue ?? this.value ?? "",
      tipStyle: "password-tip-none",
      strengthValue: 0,
      progressStatus: "",
      strength: "无",
      grade: 0,
    };
  },
  watch: {
    modelValue(val) {
      this.setCurrentValue(val);
    },
    value(val) {
      this.setCurrentValue(val);
    },
  },
  methods: {
    checkStrengthValue(v) {
      let grade = 0;
      if (/\d/.test(v)) grade++;
      if (/[a-z]/.test(v)) grade++;
      if (/[A-Z]/.test(v)) grade++;
      if (/\W/.test(v)) grade++;
      if (v.length >= 10) grade++;
      this.grade = grade;
      return grade;
    },
    strengthChange() {
      if (!this.currentValue) {
        this.tipStyle = "password-tip-none";
        this.strength = "无";
        this.strengthValue = 0;
        return;
      }
      const grade = this.checkStrengthValue(this.currentValue);
      if (grade <= 1) {
        this.progressStatus = "exception";
        this.tipStyle = "password-tip-weak";
        this.strength = "弱";
        this.strengthValue = 33;
      } else if (grade >= 2 && grade <= 4) {
        this.progressStatus = "";
        this.tipStyle = "password-tip-middle";
        this.strength = "中";
        this.strengthValue = 66;
      } else {
        this.progressStatus = "success";
        this.tipStyle = "password-tip-strong";
        this.strength = "强";
        this.strengthValue = 100;
      }
    },
    handleChange() {
      this.strengthChange();
      this.$emit("update:modelValue", this.currentValue);
      this.$emit("input", this.currentValue);
      this.$emit("on-change", this.currentValue, this.grade, this.strength);
    },
    setCurrentValue(value) {
      if (value === this.currentValue) return;
      this.currentValue = value ?? "";
      this.strengthChange();
      this.$emit("on-change", this.currentValue, this.grade, this.strength);
    },
  },
};
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
