<template>
  <div class="lum-dialog-mask">
    <el-container class="lum-dialog-box">
      <el-header class="header" height="50px">
        <p>选择头像</p>
        <p class="tools">
          <legacy-el-icon name="el-icon-close" @click="$emit('close', 0)" />
        </p>
      </el-header>
      <el-main class="main">
        <el-container class="full-height">
          <el-aside width="400px">
            <div class="cropper-box">
              <vue-cropper
                ref="cropper"
                mode="cover"
                :img="option.img"
                :output-size="option.size"
                :output-type="option.outputType"
                :info="true"
                :full="option.full"
                :fixed="fixed"
                :fixed-number="fixedNumber"
                :can-move="option.canMove"
                :can-move-box="option.canMoveBox"
                :fixed-box="option.fixedBox"
                :original="option.original"
                :auto-crop="option.autoCrop"
                :auto-crop-width="option.autoCropWidth"
                :auto-crop-height="option.autoCropHeight"
                :center-box="option.centerBox"
                :high="option.high"
                @real-time="realTime"
              />
              <input
                type="file"
                id="uploads"
                ref="fileInput"
                accept="image/png, image/jpeg, image/jpg"
                style="display: none"
                @change="uploadImg($event, 1)"
              />
            </div>
            <div class="tools tools-flex">
              <el-button
                size="small"
                plain
                :icon="$legacyIcon('el-icon-upload')"
                @click="clickUpload"
                >上传图片
              </el-button>
              <el-button
                size="small"
                plain
                :icon="$legacyIcon('el-icon-refresh')"
                @click="refreshCrop"
                >刷新
              </el-button>
              <el-button
                size="small"
                plain
                :icon="$legacyIcon('el-icon-refresh-left')"
                @click="rotateLeft"
                >左转
              </el-button>
              <el-button
                size="small"
                plain
                :icon="$legacyIcon('el-icon-refresh-right')"
                @click="rotateRight"
                >右转
              </el-button>
            </div>
          </el-aside>
          <el-main class="no-padding">
            <div class="cropper-box">
              <div class="preview-img">
                <img v-if="cusPreviewsImg" :src="cusPreviewsImg" />
              </div>
            </div>
            <div class="tools">
              <el-button type="primary" size="small" @click="uploadService">
                保存图片
              </el-button>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { VueCropper } from 'vue-cropper'
import { ServeUploadFileStream } from '@/api/upload'
import { ElMessage } from '@/utils/message'

defineOptions({ name: 'AvatarCropper' })

const emit = defineEmits(['close'])

const cropper = ref(null)
const fileInput = ref(null)

const cusPreviewsImg = ref('')
const previews = ref({})
const option = reactive({
  img: '',
  size: 1,
  full: false,
  outputType: 'png',
  canMove: true,
  fixedBox: true,
  original: false,
  canMoveBox: true,
  autoCrop: true,
  // 只有自动截图开启 宽度高度才生效
  autoCropWidth: 200,
  autoCropHeight: 150,
  centerBox: false,
  high: true,
})
const fixed = ref(true)
const fixedNumber = ref([1, 1])

function clickUpload() {
  fileInput.value.click()
}
function clearCrop() {
  if (!cusPreviewsImg.value) return false
  cropper.value.clearCrop()
}
function refreshCrop() {
  if (!cusPreviewsImg.value) return false
  cropper.value.refresh()
}
function rotateLeft() {
  if (!cusPreviewsImg.value) return false
  cropper.value.rotateLeft()
}
function rotateRight() {
  if (!cusPreviewsImg.value) return false
  cropper.value.rotateRight()
}
// 实时预览函数
function realTime() {
  cropper.value.getCropData(img => {
    cusPreviewsImg.value = img
  })
}

// 上传回调事件
function uploadImg(e, num) {
  let file = e.target.files[0]
  if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
    ElMessage('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
    return false
  }

  let reader = new FileReader()
  reader.onload = e => {
    let data
    if (typeof e.target.result === 'object') {
      // 把Array Buffer转化为blob 如果是base64不需要
      data = window.URL.createObjectURL(new Blob([e.target.result]))
    } else {
      data = e.target.result
    }
    if (num === 1) {
      option.img = data
    } else if (num === 2) {
      // 历史遗留 bug：example2 从未定义，原样保留（此分支实际不可达，num 恒为 1）
      // eslint-disable-next-line no-undef
      example2.img = data
    }
  }
  // 转化为base64
  // reader.readAsDataURL(file)
  // 转化为blob
  reader.readAsArrayBuffer(file)
}

// 上传图片到服务器
function uploadService() {
  if (cusPreviewsImg.value == '') return
  ServeUploadFileStream({
    fileStream: cusPreviewsImg.value,
  })
    .then(res => {
      if (res.code == 200) {
        emit('close', 1, res.data.avatar)
      } else {
        ElMessage('文件上传失败,请稍后再试...')
      }
    })
    .catch(() => {
      ElMessage('文件上传失败,请稍后再试...')
    })
}
</script>

<style lang="less" scoped>
.lum-dialog-box {
  height: 550px;
  max-width: 800px;

  .main {
    .cropper-box {
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;

      .preview-img {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 0 4px #ccc;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .tools {
      height: 40px;
      margin-top: 20px;
      text-align: center;

      button {
        border-radius: 1px;
      }
    }

    .tools-flex {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
