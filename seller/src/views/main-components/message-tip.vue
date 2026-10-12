<template>
  <div @click="showMessage" class="message-con">
    <el-tooltip
      :visible="value > 0 ? undefined : false"
      :content="value > 0 ? '有' + value + message : '无未读消息'"
      placement="bottom"
    >
      <el-badge :value="value" :hidden="value <= 0" is-dot>
        <el-icon :size="22"><Bell /></el-icon>
      </el-badge>
    </el-tooltip>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Bell } from "@element-plus/icons-vue";
import util from "@/libs/util.js";

defineOptions({ name: "messageTip" });

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    default: "",
  },
});

const router = useRouter();

function showMessage() {
  util.openNewPage("message_index");
  router.push({
    name: "message_index",
  });
}
</script>
