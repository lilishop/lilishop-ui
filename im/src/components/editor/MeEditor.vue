<template>
  <div>
    <el-container class="editor-container">
      <el-header class="no-padding toolbar" height="35px">
        <ul>
          <el-popover ref="popoverEmoticon" placement="top-start" trigger="click" width="300"
            popper-class="no-padding el-popover-em">
            <template #reference>
              <li>
                <i class="iconfont icon-icon_im_face" style="font-size: 15px" />
                <p class="tip-title">表情符号</p>
              </li>
            </template>
            <MeEditorEmoticon ref="editorEmoticon" @selected="selecteEmoticon" />
          </el-popover>
          <!-- <li @click="codeBlock.isShow = true">
            <i class="iconfont icon-daima" />
            <p class="tip-title">代码片段</p>
          </li>
          <li @click="recorder = true">
            <legacy-el-icon name="el-icon-headset" />
            <p class="tip-title">语音消息</p>
          </li> -->
          <li role="button" tabindex="0" aria-label="发送图片" @click="restFile.click()"
            @keydown.enter="restFile.click()" @keydown.space.prevent="restFile.click()">
            <legacy-el-icon name="el-icon-picture-outline-round" />
            <p class="tip-title">图片</p>
          </li>
          <!-- <li @click="$refs.restFile2.click()">
            <legacy-el-icon name="el-icon-folder" />
            <p class="tip-title">附件</p>
          </li>
          <li @click="filesManager.isShow = true">
            <legacy-el-icon name="el-icon-folder-opened" />
            <p class="tip-title">上传管理</p>
          </li>
          <li v-show="isGroupTalk" @click="vote.isShow = true">
            <legacy-el-icon name="el-icon-s-data" />
            <p class="tip-title">发起投票</p>
          </li> -->

          <!--          <p class="text-tips no-select">-->
          <!--            <span>按Enter发送 / Shift+Enter 换行</span>-->
          <!--            <el-popover placement="top-end" width="600" trigger="click">-->
          <!--              <div class="editor-books">-->
          <!--                <div class="books-title">编辑说明:</div>-->
          <!--                <p>-->
          <!--                  1.-->
          <!--                  支持上传QQ及微信截图，在QQ或微信中截图后使用Ctrl+v上传图片。-->
          <!--                </p>-->
          <!--                <p>-->
          <!--                  2.-->
          <!--                  支持浏览器及Word文档中的图片复制上传、复制后使用Ctrl+v上传图片。-->
          <!--                </p>-->
          <!--                <p>3. 支持图片拖拽上传。</p>-->
          <!--                <p>4. 支持文件上传 ( 文件小于100M ) 。</p>-->
          <!--                <p>5. 按Enter发送 / Shift+Enter 换行。</p>-->
          <!--                <p>-->
          <!--                  6.-->
          <!--                  注意：当文件正在上传时，请勿关闭网页或离开当前对话框，否则将导致文件停止上传或上传失败。-->
          <!--                </p>-->
          <!--              </div>-->
          <!--              <i class="el-icon-info" slot="reference" />-->
          <!--            </el-popover>-->
          <!--          </p>-->
        </ul>

        <form enctype="multipart/form-data" style="display: none" ref="fileFrom">
          <input type="file" ref="restFile" accept="image/*" @change="uploadImageChange" />
          <input type="file" ref="restFile2" @change="uploadFileChange" />
        </form>
      </el-header>
      <el-main class="no-padding textarea">
        <textarea ref="textarea" v-paste="pasteImage" v-drag="dragPasteImage" v-model.trim="editorText" rows="6"
          placeholder="你想要的聊点什么呢 ..." @keydown="keydownEvent($event)" @input="inputEvent($event)" />
      </el-main>
    </el-container>

    <!-- 图片查看器 -->
    <MeEditorImageView ref="imageViewerRef" v-model:show="imageViewer.isShow" :file="imageViewer.file"
      @confirm="confirmUploadImage" />

    <MeEditorRecorder v-if="recorder" @close="recorder = false" />

    <!-- 代码块编辑器 -->
    <TalkCodeBlock v-if="codeBlock.isShow" :edit-mode="codeBlock.editMode" @close="codeBlock.isShow = false"
      @confirm="confirmCodeBlock" />

    <!-- 文件上传管理器 -->
    <MeEditorFileManage ref="fileManageRef" v-model:show="filesManager.isShow" />

    <MeEditorVote v-if="vote.isShow" @close="
      () => {
        vote.isShow = false;
      }
    " />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import MeEditorEmoticon from "./MeEditorEmoticon";
import MeEditorFileManage from "./MeEditorFileManage";
import MeEditorImageView from "./MeEditorImageView";
import MeEditorRecorder from "./MeEditorRecorder";
import MeEditorVote from "./MeEditorVote";
import TalkCodeBlock from "@/components/chat/TalkCodeBlock";
import { getPasteImgs, getDragPasteImg } from "@/utils/editor";
import { findTalk } from "@/utils/talk";
import { ElNotification } from "@/utils/message";
import { useDialogueStore } from "@/stores/dialogue";

import {
  ServeSendTalkCodeBlock,
  ServeSendTalkImage,
  ServeSendEmoticon,
} from "@/api/chat";

defineOptions({ name: "MeEditor" });
const props = defineProps({
  // 后端 li_im_talk.id；不使用接收方 ID 代替会话 ID，避免图片存入错误会话。
  talkId: { type: String, default: "" },
});

const emit = defineEmits(["keyboard-event", "send", "send-image"]);

const dialogueStore = useDialogueStore();

const popoverEmoticon = ref(null);
const restFile = ref(null);
const restFile2 = ref(null);
const textarea = ref(null);
// 模板 ref 原名 imageViewer，与下方 imageViewer 数据同名，改名避免互相覆盖
const imageViewerRef = ref(null);
const fileManageRef = ref(null);

const talkUser = computed(() => dialogueStore.index_name);
const isGroupTalk = computed(() => dialogueStore.talk_type == 2);

// 当前编辑的内容
const editorText = ref("");

// 图片查看器相关信息
const imageViewer = reactive({
  isShow: false,
  file: null,
});
// 预览绑定原会话，上传期间切换会话后不发送，避免图片误发。
let imageTalk = null;
let imageTalkId = null;
let uploadingImage = false;

const codeBlock = reactive({
  isShow: false,
  editMode: true,
});

const filesManager = reactive({
  isShow: false,
});

const vote = reactive({
  isShow: false,
});

// 录音器
const recorder = ref(false);

// 上次发送消息的时间
const sendtime = ref(0);

// 发送间隔时间（默认1秒）
const interval = ref(1000);

watch(talkUser, (n_index_name) => {
  imageViewer.isShow = false;
  imageViewer.file = null;
  fileManageRef.value?.clear();
  editorText.value = getDraftText(n_index_name);
});

// 读取对话编辑草稿信息 并赋值给当前富文本
function getDraftText(index_name) {
  return findTalk(index_name)?.draft_text || "";
}

//复制粘贴图片回调方法
function pasteImage(e) {
  let files = getPasteImgs(e);
  if (files.length == 0) return;

  openImageViewer(files[0]);
}

//拖拽上传图片回调方法
function dragPasteImage(e) {
  let files = getDragPasteImg(e);
  if (files.length == 0) return;

  openImageViewer(files[0]);
}

function inputEvent(e) {
  emit("keyboard-event", e.target.value);
}

// 键盘按下监听事件
function keydownEvent(e) {
  if (e.keyCode == 13 && editorText.value == "") {
    e.preventDefault();
  }

  // 回车发送消息
  if (e.keyCode == 13 && e.shiftKey == false && editorText.value != "") {
    let currentTime = new Date().getTime();

    if (sendtime.value > 0) {
      // 判断 1秒内只能发送一条消息
      if (currentTime - sendtime.value < interval.value) {
        e.preventDefault();
        return false;
      }
    }

    emit("send", editorText.value);
    editorText.value = "";
    sendtime.value = currentTime;
    e.preventDefault();
  }
}

// 选择图片文件后回调方法
function uploadImageChange(e) {
  openImageViewer(e.target.files[0]);
  restFile.value.value = null;
}

// 选择文件回调事件
function uploadFileChange(e) {
  let maxsize = 100 * 1024 * 1024;
  if (e.target.files.length == 0) {
    return false;
  }

  let file = e.target.files[0];
  if (/\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name)) {
    openImageViewer(file);
    return;
  }

  if (file.size > maxsize) {
    ElNotification.info({
      title: "消息",
      message: "上传文件不能大于100M",
    });
    return;
  }

  filesManager.isShow = true;
  restFile2.value.value = null;
  fileManageRef.value?.upload(file);
}

// 打开图片查看器
function openImageViewer(file) {
  if (!file || uploadingImage) return;
  if (!props.talkId) {
    ElNotification.warning({ message: "会话尚未就绪，请稍后重试" });
    return;
  }
  if (!/^image\/(png|jpeg|gif|webp)$/i.test(file.type) || !file.size) {
    ElNotification.warning({ message: "请选择有效的 PNG、JPG、GIF 或 WebP 图片" });
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElNotification.warning({ message: "图片不能大于10MB" });
    return;
  }
  imageTalk = talkUser.value;
  imageTalkId = props.talkId;
  imageViewer.isShow = true;
  imageViewer.file = file;
}

// 代码块编辑器确认完成回调事件
function confirmCodeBlock(data) {
  const { talk_type, receiver_id } = dialogueStore;
  ServeSendTalkCodeBlock({
    talk_type,
    receiver_id,
    code: data.code,
    lang: data.language,
  }).then((res) => {
    if (res.code == 200) {
      codeBlock.isShow = false;
    } else {
      ElNotification({
        title: "友情提示",
        message: res.message,
        type: "warning",
      });
    }
  });
}

// 上传返回地址后通过现有消息通道发送；失败保留预览以便重试。
async function confirmUploadImage() {
  if (uploadingImage) return;
  const imageView = imageViewerRef.value;
  const targetTalk = imageTalk;
  const targetTalkId = imageTalkId;
  uploadingImage = true;
  try {
    const fileData = new FormData();
    fileData.append("file", imageViewer.file);
    fileData.append("talkId", targetTalkId);
    const res = await ServeSendTalkImage(fileData);
    if (res.code !== 200 || typeof res.result !== "string" || !/^https?:\/\//i.test(res.result)) {
      throw new Error(res.message || "图片上传失败，请重试");
    }
    if (targetTalk !== talkUser.value || targetTalkId !== props.talkId || !imageViewer.isShow) {
      ElNotification.warning({ message: "会话已切换，图片未发送，请在目标会话重新选择" });
      return;
    }
    emit("send-image", res.result);
    imageView.loading = false;
    imageView.closeBox();
  } catch (error) {
    ElNotification.error({ message: error.message || "图片上传失败，请重试" });
  } finally {
    uploadingImage = false;
    imageView.loading = false;
  }
}

// 选中表情包回调事件
function selecteEmoticon(data) {
  if (data.type == 1) {
    let value = editorText.value;
    let el = textarea.value;
    let startPos = el.selectionStart;
    let endPos = el.selectionEnd;
    let newValue =
      value.substring(0, startPos) +
      data.value +
      value.substring(endPos, value.length);

    editorText.value = newValue;

    if (el.setSelectionRange) {
      setTimeout(() => {
        let index = startPos + data.value.length;
        el.setSelectionRange(index, index);
        el.focus();
      }, 0);
    }
  } else {
    const { talk_type, receiver_id } = dialogueStore;
    ServeSendEmoticon({
      talk_type,
      receiver_id,
      emoticon_id: data.value,
    });
  }

  popoverEmoticon.value.hide();
}
</script>
<style scoped lang="less">
.editor-container {
  height: 160px;
  width: 100%;
  background-color: white;
}

.editor-container .toolbar {
  line-height: 35px;
  border-bottom: 1px solid #f5f0f0;
  border-top: 1px solid #f5f0f0;
}

.editor-container .toolbar li {
  list-style: none;
  float: left;
  width: 35px;
  margin-left: 3px;
  cursor: pointer;
  text-align: center;
  line-height: 35px;
  position: relative;
  color: #8d8d8d;
}

.editor-container .toolbar li .tip-title {
  display: none;
  position: absolute;
  top: 38px;
  left: 0px;
  height: 26px;
  line-height: 26px;
  background-color: rgba(31, 35, 41, 0.9);
  color: white;
  min-width: 30px;
  font-size: 10px;
  padding: 0 5px;
  border-radius: 2px;
  white-space: pre;
  text-align: center;
  user-select: none;
  z-index: 1;
}

.editor-container .toolbar li:hover .tip-title {
  display: block;
}

.editor-container .toolbar li:hover {
  background-color: #f7f5f5;
}

.editor-container .toolbar .text-tips {
  float: right;
  margin-right: 15px;
  font-size: 12px;
  color: #ccc;
}

.editor-container .toolbar .text-tips i {
  font-size: 14px;
  cursor: pointer;
  margin-left: 5px;
  color: rgb(255, 181, 111);
}

.editor-container .textarea {
  overflow: hidden;
  position: relative;
}

textarea {
  width: calc(100% - 10px);
  width: -moz-calc(100% - 10px);
  width: -webkit-calc(100% - 10px);
  height: calc(100% - 10px);
  height: -moz-calc(100% - 10px);
  height: -webkit-calc(100% - 10px);
  border: 0 none;
  outline: none;
  resize: none;
  font-size: 15px;
  overflow-y: auto;
  color: #464545;
  padding: 5px;
  position: relative;
}

textarea::-webkit-scrollbar {
  width: 4px;
  height: 1px;
}

textarea::-webkit-scrollbar-thumb {
  background: #d5cfcf;
}

textarea::-webkit-scrollbar-track {
  background: #ededed;
}

textarea::-webkit-input-placeholder {
  color: #dccdcd;
  font-size: 12px;
  font-weight: 400;
}

/* 编辑器文档说明 --- start */
.editor-books .books-title {
  font-size: 16px;
  height: 30px;
  line-height: 22px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #cbcbcb;
  color: #726f6f;
  font-weight: 400;
  margin-left: 11px;
}

.editor-books p {
  text-indent: 10px;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
  color: #7f7c7c;
}

/* 编辑器文档说明 --- end */
</style>
