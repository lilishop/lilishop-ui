<template>
  <div class="panel-title-bar">
    <div class="panel-section">
      <div class="section-title">标题内容设置</div>
      
      <div class="form-item">
        <span class="item-label">主标题文案</span>
        <el-input v-model="options.mainTitle" size="small" placeholder="如：限时特卖" />
      </div>

      <div class="form-item">
        <span class="item-label">副标题文字</span>
        <el-input v-model="options.subtitle" size="small" placeholder="如：精选爆款 每日早十点上新" />
      </div>

      <div class="form-item flex-row">
        <span class="item-label">对齐方式</span>
        <el-radio-group v-model="options.align" size="small">
          <el-radio-button label="left">靠左对齐</el-radio-button>
          <el-radio-button label="center">居中对齐</el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-item flex-row">
        <span class="item-label">显示右侧“查看更多”</span>
        <el-switch v-model="options.showMore" size="small" />
      </div>

      <div class="form-item" v-if="options.showMore">
        <span class="item-label">更多链接文案</span>
        <el-input v-model="options.moreText" size="small" placeholder="查看更多 >" />
      </div>

      <div class="form-item" v-if="options.showMore">
        <span class="item-label">更多跳转地址</span>
        <el-input v-model="options.moreUrl" size="small" placeholder="如 /goods" />
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
.panel-title-bar {
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
