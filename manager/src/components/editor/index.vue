<template>
  <div>
    <!-- 使用 fullscreen 类来控制是否全屏显示 -->
    <div :class="{ fullscreen: fullscreen }" class="tinymce-container">
      <!-- 使用 tinymce-textarea 类作为编辑器的文本区域 -->
      <uploadImage @callback="insertImage" />
      <textarea :id="tinymceId" class="tinymce-textarea" />
    </div>
  </div>
</template>
<script setup>
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { initEditor } from "@/components/editor/config";
import uploadImage from "@/components/editor/upload-image.vue";

defineOptions({ name: "Tinymce" });

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "500px",
  },
});
const emit = defineEmits(["update:modelValue", "input"]);

// 引入编辑器的配置（data 中的 initEditor 与 import 同名，直接使用 import）
const hasChange = ref(false); // 标记内容是否有更改
const hasInit = ref(false); // 标记编辑器是否已初始化
const tinymceId =
  "tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + ""); // 生成唯一的编辑器 ID
const fullscreen = ref(false); // 标记编辑器是否处于全屏模式
const toolbar = ref([]); // 工具栏配置
const content = ref(""); // 编辑器内容

const editorContent = computed(() => {
  return props.modelValue ?? props.value ?? "";
});

watch(editorContent, (val) => {
  if (!hasChange.value && hasInit.value) {
    // 当内容有更改且编辑器已初始化时，更新编辑器的内容
    nextTick(() => {
      const editor = window.tinymce?.get(tinymceId);
      if (editor) editor.setContent(val || "");
    });
  }
});

function emitContent(content) {
  emit("update:modelValue", content);
  emit("input", content);
}
// 数据返回并给富文本框插入图片
function insertImage(arr) {
  arr.forEach((v) =>
    window.tinymce.get(tinymceId).insertContent(`<img  src="${v}" >`)
  );
}
function init() {
  // 初始化编辑器
  initTinymce();
}
function initTinymce() {
  window.tinymce.init({
    selector: `#${tinymceId}`,
    convert_urls: false,
    init_instance_callback: (editor) => {
      if (editorContent.value) {
        // 如果有初始值，则设置编辑器的内容为初始值
        nextTick(() => editor.setContent(editorContent.value));
      }
      hasInit.value = true;
      // 监听编辑器内容的变化
      editor.on("NodeChange Change KeyUp  SetContent", () => {
        hasChange.value = true;
        // Vue3 v-model 使用 update:modelValue，同时保留 input 兼容旧用法
        emitContent(editor.getContent());
      });
    },
    setup(editor) {
      // 监听全屏状态变化
      editor.on("FullscreenStateChanged", (e) => {
        fullscreen.value = e.state;
      });
    },
    ...initEditor,

    height: props.height,
  });
}
function getEditor() {
  // 获取 tinymce 实例（原组件无此方法，为对齐 seller 版暴露能力而新增）
  return window.tinymce?.get(tinymceId);
}
function setContent(value) {
  // 设置编辑器的内容
  window.tinymce.get(tinymceId).setContent(value);
}
function getContent() {
  // 获取编辑器的内容
  return window.tinymce.get(tinymceId).getContent();
}
function destroyTinymce() {
  const tinymce = window.tinymce.get(tinymceId);

  if (tinymce) {
    // 销毁编辑器实例
    tinymce.destroy();
  }
}

// created 钩子：顶层直接执行（保留原 created + mounted 双重 init 的历史行为）
init();

onMounted(() => {
  init();
});
onActivated(() => {
  if (window.tinymce) {
    initTinymce();
  }
});
onDeactivated(() => {
  destroyTinymce();
});
onUnmounted(() => {
  destroyTinymce();
});

// 父组件通过 ref 调用：articleList 使用 getContent；setContent/getEditor 对齐 seller 版暴露能力
defineExpose({ getEditor, setContent, getContent });
</script>
