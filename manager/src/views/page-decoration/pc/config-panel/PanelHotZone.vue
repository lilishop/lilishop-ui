<template>
  <div class="panel-hot-zone">
    <div class="panel-section">
      <div class="section-title">热区底图</div>
      <div class="form-item">
        <span class="item-label">大图 URL 地址</span>
        <el-input v-model="options.imageUrl" size="small" placeholder="请输入热区底图 URL" clearable />
      </div>
      <div class="hotzone-preview" v-if="options.imageUrl">
        <img :src="options.imageUrl" alt="hotzone" class="img-preview" />
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title flex-between">
        <span>热区列表 ({{ options.zones?.length || 0 }})</span>
        <el-button link type="primary" size="small" @click="handleAddZone">
          <el-icon><Plus /></el-icon> 添加热区
        </el-button>
      </div>

      <div class="zones-list">
        <div
          v-for="(zone, idx) in options.zones"
          :key="idx"
          class="zone-card"
        >
          <div class="zone-header">
            <span>热区 {{ idx + 1 }}</span>
            <el-button link type="danger" size="small" @click="options.zones.splice(idx, 1)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="zone-inputs">
            <el-input v-model="zone.title" size="small" placeholder="热区标题" />
            <el-input v-model="zone.url" size="small" placeholder="跳转路径，如 /goods/1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Delete } from '@element-plus/icons-vue';

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

function handleAddZone() {
  if (!Array.isArray(props.options.zones)) props.options.zones = [];
  props.options.zones.push({
    title: `热区 ${props.options.zones.length + 1}`,
    url: '/',
    top: 10,
    left: 10,
    width: 20,
    height: 20
  });
}
</script>

<style lang="scss" scoped>
.panel-hot-zone {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      &.flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .hotzone-preview {
      margin-top: 10px;
      max-height: 140px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      border-radius: 6px;

      .img-preview {
        width: 100%;
        object-fit: cover;
      }
    }

    .zones-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .zone-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px;

        .zone-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .zone-inputs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      }
    }
  }
}
</style>
