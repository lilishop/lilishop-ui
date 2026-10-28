<template>
  <div class="panel-video">
    <div class="panel-section">
      <div class="section-title">视频播放设置</div>
      <div class="form-item">
        <span class="item-label">视频文件 URL (.mp4)</span>
        <el-input v-model="options.videoUrl" size="small" placeholder="请输入视频在线地址" clearable />
      </div>

      <div class="form-item">
        <span class="item-label">视频封面图片 URL</span>
        <el-input v-model="options.coverUrl" size="small" placeholder="请输入视频封面图地址" clearable />
      </div>

      <div class="form-item flex-row">
        <span class="item-label">播放高度 (px)</span>
        <el-input-number v-model="options.height" :min="200" :max="800" size="small" controls-position="right" />
      </div>

      <div class="form-item flex-row">
        <span class="item-label">自动静音播放</span>
        <el-switch v-model="options.autoPlay" size="small" />
      </div>

      <div class="form-item flex-row">
        <span class="item-label">循环播放</span>
        <el-switch v-model="options.loop" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.panel-video {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;

      &.flex-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }
  }
}
</style>
