<template>
  <div class="panel-free-layout">
    <div class="panel-section">
      <div class="section-title">自由画布容器设置</div>
      <div class="form-item flex-row">
        <span class="item-label">容器固定高度 (px)</span>
        <el-input-number v-model="options.height" :min="100" :max="1000" :step="20" size="small" controls-position="right" />
      </div>
      <div class="layout-hint">
        当前自由布局容器内已包含 {{ options.elements?.length || 0 }} 个绝对定位元素。
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
.panel-free-layout {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .layout-hint {
      margin-top: 10px;
      font-size: 12px;
      color: #64748b;
    }
  }
}
</style>
