<template>
  <el-icon v-bind="$attrs">
    <component :is="iconComponent" v-if="iconComponent" />
  </el-icon>
</template>

<script>
import { resolveLegacyIcon } from "@/core/legacy-icon-map";

export default {
  name: "LegacyElIcon",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "",
    },
  },
  computed: {
    iconComponent() {
      return resolveLegacyIcon(this.name);
    },
  },
};
</script>
