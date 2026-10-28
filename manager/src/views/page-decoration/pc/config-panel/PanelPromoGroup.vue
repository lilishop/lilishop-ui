<template>
  <div class="panel-promo-group">
    <div class="panel-section">
      <div class="section-title">排版列数</div>
      <div class="form-item">
        <span class="item-label">卡片列数</span>
        <el-radio-group v-model="options.columns" size="small">
          <el-radio-button :label="2">2 列</el-radio-button>
          <el-radio-button :label="3">3 列</el-radio-button>
          <el-radio-button :label="4">4 列</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title flex-between">
        <span>活动卡片列表</span>
        <el-button link type="primary" size="small" @click="handleAddCard">
          <el-icon><Plus /></el-icon> 添加卡片
        </el-button>
      </div>

      <div class="cards-list">
        <div
          v-for="(card, idx) in options.cards"
          :key="idx"
          class="promo-card-item"
        >
          <div class="card-header">
            <span>卡片 {{ idx + 1 }}</span>
            <el-button link type="danger" size="small" @click="options.cards.splice(idx, 1)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="card-inputs">
            <el-input v-model="card.title" size="small" placeholder="主标题（如：今日秒杀）" />
            <el-input v-model="card.subtitle" size="small" placeholder="副标题（如：抢神券立减50）" />
            <el-input v-model="card.bgImg" size="small" placeholder="卡片底图 URL" />
            <el-input v-model="card.url" size="small" placeholder="活动落地页链接" />
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

function handleAddCard() {
  if (!Array.isArray(props.options.cards)) props.options.cards = [];
  props.options.cards.push({
    title: '大促专场',
    subtitle: '限量特惠抢购',
    bgImg: '',
    url: '/goods'
  });
}
</script>

<style lang="scss" scoped>
.panel-promo-group {
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
      align-items: center;
      justify-content: space-between;

      .item-label {
        font-size: 12px;
        color: #475569;
      }
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .promo-card-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;

        .card-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .card-inputs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      }
    }
  }
}
</style>
