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
      tinymceId:
        "tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + ""), // 生成唯一的编辑器 ID
      fullscreen: false, // 标记编辑器是否处于全屏模式
      toolbar: [], // 工具栏配置
      content: "", // 编辑器内容
    };
  },
  created() {
    this.init();
  },
  computed: {
    bindValue() {
      return this.modelValue ?? this.value ?? "";
    },
  },
  watch: {
    bindValue: {
      handler(val) {
        if (!this.hasChange && this.hasInit) {
          const editor = window.tinymce.get(this.tinymceId);
          if (editor) {
            this.$nextTick(() => editor.setContent(val || ""));
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    // 数据返回并给富文本框插入图片
    insertImage(arr){
      arr.forEach(v => window.tinymce.get(this.tinymceId).insertContent(`<img  src="${v}" >`))
    },
    init() {
      // 初始化编辑器
      this.initTinymce();
    },
    initTinymce() {
      const _this = this;
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        convert_urls: false,
        init_instance_callback: (editor) => {
          if (_this.bindValue) {
            _this.$nextTick(() => editor.setContent(_this.bindValue));
          }
          _this.hasInit = true;
          editor.on("NodeChange Change KeyUp SetContent", () => {
            _this.hasChange = true;
            const content = editor.getContent();
            _this.$emit("update:modelValue", content);
            _this.$emit("input", content);
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
    setContent(value) {
      const editor = window.tinymce.get(this.tinymceId);
      if (!editor) {
        return;
      }
      const content = value || "";
      this.hasChange = false;
      editor.setContent(content);
      this.$emit("update:modelValue", content);
      this.$emit("input", content);
    },
    getContent() {
      // 获取编辑器的内容
     return  window.tinymce.get(this.tinymceId).getContent();
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId);

      if (tinymce) {
        // 销毁编辑器实例
        tinymce.destroy();
      }
    },
  },
  mounted() {
    this.init();
  },
  activated() {
    if (window.tinymce) {
      this.initTinymce();
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
