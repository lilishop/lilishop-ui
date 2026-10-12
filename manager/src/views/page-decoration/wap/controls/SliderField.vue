<template>
  <div class="ctrl-row">
    <div class="ctrl-label">{{ label }}</div>
    <div class="ctrl-body">
      <el-slider
        class="ctrl-slider"
        :model-value="modelValue"
        :min="min"
        :max="max"
        @update:model-value="onInput"
      />
      <el-input-number
        class="ctrl-number"
        :model-value="modelValue"
        :min="min"
        :max="max"
        size="small"
        @update:model-value="onInput"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "SliderField",
  props: {
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
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

.ctrl-body {
  flex-wrap: nowrap;
}

.ctrl-slider {
  flex: 1;
  min-width: 0;
}

.ctrl-number {
  width: 110px;
  flex-shrink: 0;
}
</style>
