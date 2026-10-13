<template>
  <el-icon v-bind="$attrs">
    <component :is="iconComponent" v-if="iconComponent" />
  </el-icon>
</template>

<script setup>
import { computed } from "vue";
import { resolveLegacyIcon } from "@/core/legacy-icon-map";

defineOptions({
  name: "LegacyElIcon",
  inheritAttrs: false,
});

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
});

const iconComponent = computed(() => resolveLegacyIcon(props.name));
</script>
