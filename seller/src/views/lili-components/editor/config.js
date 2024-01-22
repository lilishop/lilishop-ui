import plugins from "./plugins";
import toobar from "./toolbar";
const localCDN = window.location.origin + "/tinymce"; //本地引入
export const initEditor = {
  base_url: localCDN,
  height: "400px",
  language: "zh-Hans",
  menubar: "file edit  view format table", // 菜单:指定应该出现哪些菜单
  toolbar: toobar, // 分组工具栏控件
  plugins:plugins, // 插件(比如: advlist | link | image | preview等)
  object_resizing: false, // 是否禁用表格图片大小调整
  end_container_on_empty_block: true, // enter键 分块
  powerpaste_word_import: "merge", // 是否保留word粘贴样式  clean | merge
  advlist_bullet_styles: "square", // 无序列表 有序列表
  maxSize: "2097152", // 设置图片大小
  accept: "image/jpeg, image/png", // 设置图片上传规则
  paste_data_images:false,
  browser_spellcheck: true, // 拼写检查
  branding: false, // 去水印
  elementpath: false, // 禁用编辑器底部的状态栏
  statusbar: false, // 隐藏编辑器底部的状态栏
  // init_instance_callback: function (editor) {
  //   var freeTiny = document.querySelector(".tox .tox-notification--in .tox-notification .tox-notification--warning .tox .tox-notification--warning .tox-notifications-container");
  //   freeTiny.style.display = "none";
  // },
  content_style: `
    * { padding:0; margin:0; }

    html, body height:100%; }

    img { max-width:100%; display:block;height:auto; }

    a   { text-decoration: none; }

    iframe{ width: 100%; }

    p { line-height:1.6; margin: 0px; }

    table{ word-wrap:break-word; word-break:break-all; max-width:100%; border:none; border-color:#999; }

    .mce-object-iframe{ width:100%; box-sizing:border-box; margin:0; padding:0; }

    ul,ol{ list-style-position:inside; }
    `, // 设置样式
};
