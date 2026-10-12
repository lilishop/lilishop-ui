<template>
  <div class="ctrl-row">
    <div class="ctrl-label">{{ label }}</div>
    <div class="ctrl-body">
      <el-color-picker
        :model-value="modelValue"
        @update:model-value="onInput"
      />
      <el-input
        :model-value="modelValue"
        class="ctrl-color-input"
        placeholder="#FFFFFF"
        @update:model-value="onInput"
      />
      <el-button link type="primary" @click="onReset">重置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ColorField",
  props: {
    modelValue: { type: String, default: "" },
    defaultValue: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  methods: {
    onInput(val) {
      this.$emit("update:modelValue", val);
    },
    onReset() {
      this.$emit("update:modelValue", this.defaultValue);
    },
  },
};
</script>

<style scoped lang="scss">
@import "./field-common.scss";
</style>
