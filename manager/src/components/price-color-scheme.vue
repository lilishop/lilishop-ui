<template>
  <span :style="priceStyle">
    {{ dot }}{{ displayText }}
    <slot />
  </span>
</template>

<script>
import { unitPrice } from "@/utils/filters";

export default {
  name: "priceColorScheme",
  props: {
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
  },
  computed: {
    displayText() {
      const val = this.value;
      if (val === null || val === undefined || val === "" || val === "null") {
        return `${this.unit || "￥"}0.00`;
      }
      return unitPrice(val, this.unit);
    },
    priceStyle() {
      const resolvedColor = this.color || this.$mainColor || "";
      return resolvedColor
        ? { color: resolvedColor, ...this.customStyle }
        : { ...this.customStyle };
    },
  },
};
</script>
