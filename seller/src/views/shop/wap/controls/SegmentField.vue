<template>
  <div class="ctrl-row">
    <div class="ctrl-label">{{ label }}</div>
    <div class="ctrl-body">
      <el-radio-group
        :model-value="modelValue"
        @update:model-value="onInput"
      >
        <el-radio-button
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          >{{ opt.label }}</el-radio-button
        >
      </el-radio-group>
    </div>
  </div>
</template>

<script>
export default {
  name: "SegmentField",
  props: {
    modelValue: { type: String, default: "" },
    options: {
      type: Array,
      default: () => [],
    },
    label: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  methods: {
    onInput(val) {
      this.$emit("update:modelValue", val);
    },
  },
};
</script>

<style scoped lang="scss">
@import "./field-common.scss";
</style>
