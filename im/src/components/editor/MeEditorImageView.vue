<template>
  <div v-if="show" class="lum-dialog-mask animated fadeIn">
    <el-container class="lum-dialog-box" v-outside="closeBox">
      <el-header class="no-padding header" height="50px">
        <p>发送图片</p>
        <p class="tools">
          <legacy-el-icon name="el-icon-close" @click="closeBox" />
        </p>
      </el-header>

      <el-main class="no-padding mian">
        <img v-show="src" :src="src" />
        <div v-show="src">
          <span class="filename">{{ fileName }}</span>
          <br />
          <span class="size">{{ fileSize }} KB</span>
        </div>
      </el-main>

      <el-footer class="footer" height="50px">
        <el-button
          class="btn"
          type="primary"
          size="default"
          :loading="loading"
          @click="uploadImage"
          >立即发送
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'

defineOptions({ name: 'MeEditorImageView' })

const emit = defineEmits(['close', 'update:show', 'confirm'])
const props = defineProps({
  show: Boolean,
  file: File,
})

const src = ref('')
const fileSize = ref('')
const fileName = ref('')
const loading = ref(false)

watch(
  () => props.file,
  (file) => {
    loadFile(file)
  }
)

function closeBox() {
  if (loading.value) {
    return false
  }

  emit('update:show', false)
  emit('close', false)
}

function loadFile(file) {
  let reader = new FileReader()
  fileSize.value = Math.ceil(file.size / 1024)
  fileName.value = file.name
  reader.onload = () => {
    src.value = reader.result
  }

  reader.readAsDataURL(file)
}

// 确认按钮事件
function uploadImage() {
  loading.value = true
  emit('confirm')
}

// 父组件通过 $refs.imageViewer 访问 loading / closeBox
defineExpose({ loading, closeBox })
</script>
<style lang="less" scoped>
.lum-dialog-box {
  width: 500px;
  max-width: 500px;
  height: 450px;

  .mian {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    img {
      max-width: 80%;
      max-height: 80%;
      border-radius: 3px;
      cursor: pointer;
      box-shadow: 0 0 8px #e0dbdb;
    }

    div {
      margin-top: 10px;
      text-align: center;
      overflow: hidden;
      max-width: 80%;

      .filename {
        font-weight: 400;
      }

      .size {
        color: rgb(148, 140, 140);
        font-size: 12px;
      }
    }
  }

  .footer {
    height: 50px;
    background: rgba(247, 245, 245, 0.66);
    text-align: center;
    line-height: 50px;

    .btn {
      width: 150px;
      border-radius: 2px;
    }
  }
}
</style>
