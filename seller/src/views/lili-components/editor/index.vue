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
<script>
import { initEditor } from "@/views/lili-components/editor/config";
import { loadTinymce } from "@/views/lili-components/editor/load-tinymce";

import uploadImage from "@/views/lili-components/editor/upload-image.vue";
export default {
  components:{uploadImage},
  name: "Tinymce",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    height:{
      type:String,
      default:'500px'
    }
  },
  emits: ["update:modelValue", "input"],
  data() {
    return {
      // 引入编辑器的配置
      initEditor,
      hasChange: false, // 标记内容是否有更改
      hasInit: false, // 标记编辑器是否已初始化
      pendingContent: null, // 编辑器未就绪时暂存待回填内容
      tinymceId:
        "tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + ""), // 生成唯一的编辑器 ID
      fullscreen: false, // 标记编辑器是否处于全屏模式
      toolbar: [], // 工具栏配置
      content: "", // 编辑器内容
    };
  },
  computed: {
    bindValue() {
      return this.modelValue ?? this.value ?? "";
    },
  },
  watch: {
    bindValue: {
      handler(val) {
        if (!this.hasChange) {
          this.setContent(val || "");
        }
      },
    },
  },
  methods: {
    emitContent(content) {
      this.$emit("update:modelValue", content);
      this.$emit("input", content);
    },
    getEditor() {
      return window.tinymce?.get(this.tinymceId);
    },
    isEditorReady() {
      const editor = this.getEditor();
      return !!(editor && editor.initialized && editor.dom);
    },
    // 数据返回并给富文本框插入图片
    insertImage(arr){
      const editor = this.getEditor();
      if (!editor || !this.isEditorReady()) {
        return;
      }
      arr.forEach(v => editor.insertContent(`<img  src="${v}" >`))
    },
    init() {
      // 初始化编辑器
      this.initTinymce();
    },
    initTinymce() {
      if (this.getEditor()) {
        return;
      }
      const _this = this;
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        convert_urls: false,
        init_instance_callback: (editor) => {
          _this.hasInit = true;
          const initial = _this.pendingContent ?? _this.bindValue;
          _this.pendingContent = null;
          if (initial) {
            _this.applyContent(editor, initial);
          }
          // 不监听 NodeChange/SetContent：初始化或回填时会把空内容写回 v-model，覆盖已加载的商品描述
          editor.on("input change undo redo KeyUp", () => {
            _this.hasChange = true;
            _this.emitContent(editor.getContent());
          });
        },
        setup(editor) {
          // 监听全屏状态变化
          editor.on("FullscreenStateChanged", (e) => {
            _this.fullscreen = e.state;
          });
        },
        ..._this.initEditor,

        height:this.height
      });
    },
    applyContent(editor, content) {
      if (!editor || !editor.initialized || !editor.dom) {
        return false;
      }
      try {
        editor.setContent(content);
        return true;
      } catch (e) {
        console.warn("tinymce setContent failed", e);
        return false;
      }
    },
    setContent(value) {
      const content = value || "";
      this.hasChange = false;
      if (!this.isEditorReady()) {
        this.pendingContent = content;
        return;
      }
      this.pendingContent = null;
      this.applyContent(this.getEditor(), content);
      this.emitContent(content);
    },
    getContent() {
      const editor = this.getEditor();
      if (!editor || !editor.initialized) {
        return this.pendingContent ?? this.bindValue ?? "";
      }
      return editor.getContent();
    },
    destroyTinymce() {
      const tinymce = this.getEditor();

      if (tinymce) {
        // 销毁编辑器实例
        tinymce.destroy();
      }
    },
  },
  mounted() {
    // 编辑器脚本改为按需加载，加载完成后再初始化
    loadTinymce().then(() => {
      this.init();
    });
  },
  activated() {
    if (window.tinymce) {
      this.initTinymce();
    } else {
      loadTinymce().then(() => {
        this.initTinymce();
      });
    }
  },
  deactivated() {
    this.destroyTinymce();
  },
  unmounted() {
    this.destroyTinymce();
  },
};
</script>
