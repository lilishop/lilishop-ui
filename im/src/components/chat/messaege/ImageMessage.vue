<template>
  <div class="image-message no-select">
    <el-image
      fit="contain"
      :src="src"
      :style="getImgStyle(src)"
      :preview-src-list="[src]"
      preview-teleported
    >
      <template #error>
        <div class="image-slot">图片加载失败...</div>
      </template>
      <template #placeholder>
        <div class="image-slot">图片加载中...</div>
      </template>
    </el-image>
  </div>
</template>
<script setup>
import { imgZoom } from '@/utils/functions'

defineOptions({ name: 'ImageMessage' })

defineProps({
  src: {
    type: String,
    default: '',
  },
})

function getImgStyle(url) {
  // 商城上传地址不携带尺寸，提供可见的预览区域；原尺寸后缀仍沿用旧展示规则。
  if (!/\d+x\d+/.test(url.split('_').pop())) {
    return { width: '200px', height: '200px', maxWidth: '100%' }
  }
  return imgZoom(url, 200)
}
</script>
<style lang="less" scoped>
.image-message {
  :deep(.el-image) {
    border-radius: 5px;
    cursor: pointer;
    background: #f1efef;

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      font-size: 13px;
      color: #908686;
      background: #efeaea;
    }
  }
}
</style>
