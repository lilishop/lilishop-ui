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
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { initEditor } from "@/views/lili-components/editor/config";
import { loadTinymce } from "@/views/lili-components/editor/load-tinymce";

import uploadImage from "@/views/lili-components/editor/upload-image.vue";

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
const pendingContent = ref(null); // 编辑器未就绪时暂存待回填内容
const tinymceId =
  "tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + ""); // 生成唯一的编辑器 ID
const fullscreen = ref(false); // 标记编辑器是否处于全屏模式
const toolbar = ref([]); // 工具栏配置
const content = ref(""); // 编辑器内容

const bindValue = computed(() => {
  return props.modelValue ?? props.value ?? "";
});

watch(bindValue, (val) => {
  if (!hasChange.value) {
    setContent(val || "");
  }
});

function emitContent(val) {
  emit("update:modelValue", val);
  emit("input", val);
}
function getEditor() {
  return window.tinymce?.get(tinymceId);
}
function isEditorReady() {
  const editor = getEditor();
  return !!(editor && editor.initialized && editor.dom);
}
// 数据返回并给富文本框插入图片
function insertImage(arr) {
  const editor = getEditor();
  if (!editor || !isEditorReady()) {
    return;
  }
  arr.forEach((v) => editor.insertContent(`<img  src="${v}" >`));
}
function init() {
  // 初始化编辑器
  initTinymce();
}
function initTinymce() {
  if (getEditor()) {
    return;
  }
  window.tinymce.init({
    selector: `#${tinymceId}`,
    convert_urls: false,
    init_instance_callback: (editor) => {
      hasInit.value = true;
      const initial = pendingContent.value ?? bindValue.value;
      pendingContent.value = null;
      if (initial) {
        applyContent(editor, initial);
      }
      // 不监听 NodeChange/SetContent：初始化或回填时会把空内容写回 v-model，覆盖已加载的商品描述
      editor.on("input change undo redo KeyUp", () => {
        hasChange.value = true;
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
function applyContent(editor, val) {
  if (!editor || !editor.initialized || !editor.dom) {
    return false;
  }
  try {
    editor.setContent(val);
    return true;
  } catch (e) {
    console.warn("tinymce setContent failed", e);
    return false;
  }
}
function setContent(value) {
  const val = value || "";
  hasChange.value = false;
  if (!isEditorReady()) {
    pendingContent.value = val;
    return;
  }
  pendingContent.value = null;
  applyContent(getEditor(), val);
  emitContent(val);
}
function getContent() {
  const editor = getEditor();
  if (!editor || !editor.initialized) {
    return pendingContent.value ?? bindValue.value ?? "";
  }
  return editor.getContent();
}
function destroyTinymce() {
  const tinymce = getEditor();

  if (tinymce) {
    // 销毁编辑器实例
    tinymce.destroy();
  }
}

onMounted(() => {
  // 编辑器脚本改为按需加载，加载完成后再初始化
  loadTinymce().then(() => {
    init();
  });
});
onActivated(() => {
  if (window.tinymce) {
    initTinymce();
  } else {
    loadTinymce().then(() => {
      initTinymce();
    });
  }
});
onDeactivated(() => {
  destroyTinymce();
});
onUnmounted(() => {
  destroyTinymce();
});

// 父组件通过 ref 调用：goodsOperationSec 使用 getEditor/setContent/getContent
defineExpose({ getEditor, setContent, getContent });
</script>
