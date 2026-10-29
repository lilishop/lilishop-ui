<template>
  <span class="face-wrap">
    <img v-if="text" :src="text" :onerror="onError" alt="" />
    <i v-else class="face-initial" :style="{ backgroundColor: color }">{{ initial }}</i>
  </span>
</template>

<script setup>
import { computed } from "vue";
import { avatarColor } from "@/utils/functions";
import { defaultAvatar } from "@/assets/images";

const props = defineProps({
  text: {
    type: null,
    default: ''
  },
  name: {
    type: null,
    default: ''
  },
});

// 无头像时用「底色 + 首字」本地生成，替代原来的 dicebear 外链
const initial = computed(() => String(props.name || "").slice(0, 1) || "?");
const color = computed(() => avatarColor(String(props.name || "")));
const onError = "this.src='" + defaultAvatar + "'";
</script>

<style lang="less" scoped>
.face-wrap {
  display: block;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

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
}
</style>
