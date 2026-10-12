<template>
  <div class="file-message">
    <div class="main">
      <div class="ext">{{ ext }}</div>
      <div class="file-box">
        <p class="info">
          <span class="name">{{ fileName }}</span>
          <span class="size">({{ fileSize }})</span>
        </p>
        <p class="notice">文件已成功发送, 文件助手永久保存</p>
      </div>
    </div>
    <div class="footer">
      <a @click="download(record_id)">下载</a>
      <a>在线预览</a>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { formatSize, download } from '@/utils/functions'

defineOptions({ name: 'FileMessage' })

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  record_id: {
    type: Number,
    required: true,
    default: 0,
  },
})

const file_id = ref(0)
const ext = ref('')
const fileName = ref('')
const fileSize = ref('')

// 原 created 钩子
file_id.value = props.file.id
ext.value = props.file.file_suffix.toUpperCase()
fileName.value = props.file.original_name
fileSize.value = formatSize(props.file.file_size)

// download 直接从 @/utils/functions 导入，模板中照用
</script>
<style lang="less" scoped>
.file-message {
  width: 250px;
  height: 85px;
  background: white;
  box-shadow: 0 0 5px 0px #e8e4e4;
  padding: 10px;
  border-radius: 3px;
  transition: all 0.5s;

  &:hover {
    box-shadow: 0 0 5px 0px #cac6c6;
  }

  .main {
    height: 45px;
    display: flex;
    flex-direction: row;

    .ext {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 45px;
      height: 45px;
      flex-shrink: 0;
      color: #ffffff;
      background: #49a4ff;
      border-radius: 5px;
      font-size: 12px;
    }

    .file-box {
      flex: 1 1;
      height: 45px;
      margin-left: 10px;
      overflow: hidden;

      .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        height: 24px;
        color: rgb(76, 76, 76);
        font-size: 14px;

        .name {
          flex: 1 auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .size {
          font-size: 12px;
          color: #cac6c6;
        }
      }

      .notice {
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        color: #929191;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .footer {
    height: 30px;
    line-height: 37px;
    color: #409eff;
    text-align: right;
    font-size: 12px;
    border-top: 1px solid #eff7ef;
    margin-top: 10px;

    a {
      margin: 0 3px;
      user-select: none;
      cursor: pointer;

      &:hover {
        color: royalblue;
      }
    }
  }
}
</style>
