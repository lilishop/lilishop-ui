<template>
  <span :style="priceStyle">
    {{ dot }}{{ displayText }}
    <slot />
  </span>
</template>

<script setup>
import { computed, getCurrentInstance } from "vue";
import { unitPrice } from "@/utils/filters";

defineOptions({ name: "priceColorScheme" });

const props = defineProps({
  value: {
    default: 0,
    validator(val) {
      return (
        val === null ||
        val === undefined ||
        typeof val === "number" ||
        typeof val === "string"
      );
    },
  },
  unit: {
    type: String,
    default: "￥",
  },
  dot: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
});

// $mainColor 为 main.js 注册的全局属性
const { proxy } = getCurrentInstance();

const displayText = computed(() => {
  const val = props.value;
  if (val === null || val === undefined || val === "" || val === "null") {
    return `${props.unit || "￥"}0.00`;
  }
  return unitPrice(val, props.unit);
});
const priceStyle = computed(() => {
  const resolvedColor = props.color || proxy.$mainColor || "";
  return resolvedColor
    ? { color: resolvedColor, ...props.customStyle }
    : { ...props.customStyle };
});
</script>
