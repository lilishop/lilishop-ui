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
import { initEditor } from "@/components/editor/config";
import uploadImage from "@/components/editor/upload-image.vue";
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
  computed: {
    editorContent() {
      return this.modelValue ?? this.value ?? "";
    },
  },
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
  watch: {
    editorContent: {
      handler(val) {
        if (!this.hasChange && this.hasInit) {
          // 当内容有更改且编辑器已初始化时，更新编辑器的内容
          this.$nextTick(() => {
            const editor = window.tinymce?.get(this.tinymceId);
            if (editor) editor.setContent(val || "");
          });
        }
      },
    },
  },
  methods: {
    emitContent(content) {
      this.$emit("update:modelValue", content);
      this.$emit("input", content);
    },
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
          if (_this.editorContent) {
            // 如果有初始值，则设置编辑器的内容为初始值
            _this.$nextTick(() => editor.setContent(_this.editorContent));
          }
          _this.hasInit = true;
          // 监听编辑器内容的变化
          editor.on("NodeChange Change KeyUp  SetContent", () => {
            _this.hasChange = true;
            // Vue3 v-model 使用 update:modelValue，同时保留 input 兼容旧用法
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
    setContent(value) {
      // 设置编辑器的内容
      window.tinymce.get(this.tinymceId).setContent(value);
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
