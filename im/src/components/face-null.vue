<template>
  <i class="face-initial" :style="{ backgroundColor: color }">{{ initial }}</i>
</template>

<script setup>
import { computed } from "vue";
import { avatarColor } from "@/utils/functions";

const props = defineProps({
  text: {
    type: null,
    default: ''
  }
});

// 无头像时用「底色 + 首字」本地生成，替代原来的 dicebear 外链
const initial = computed(() => String(props.text || "").slice(0, 1) || "?");
const color = computed(() => avatarColor(String(props.text || "")));
</script>

<style lang="less" scoped>
.face-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  font-style: normal;
  user-select: none;
}
</style>
