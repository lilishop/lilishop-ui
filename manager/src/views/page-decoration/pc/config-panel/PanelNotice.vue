<template>
  <div class="panel-notice-bar">
    <!-- 1. 基础配置 -->
    <div class="panel-section">
      <div class="section-title">快讯标语与更多</div>
      <div class="form-item">
        <span class="item-label">前缀标语</span>
        <el-input v-model="options.title" size="small" placeholder="如：公告快讯 / 今日热点" />
      </div>
      <div class="form-item">
        <span class="item-label">展示更多入口</span>
        <el-switch v-model="options.showMore" size="small" />
      </div>
      <template v-if="options.showMore !== false">
        <div class="form-item">
          <span class="item-label">更多文案</span>
          <el-input v-model="options.moreText" size="small" placeholder="如：更多" />
        </div>
        <div class="form-item">
          <span class="item-label">跳转链接</span>
          <el-input v-model="options.moreUrl" size="small" placeholder="如：/article" />
        </div>
      </template>
    </div>

    <!-- 2. 快讯条目列表 (匹配万米 Mg 结构化列表) -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>快讯条目 ({{ itemsList?.length || 0 }} 条)</span>
        <el-button link type="primary" size="small" @click="handleAddItem">
          <el-icon><Plus /></el-icon> 添加快讯
        </el-button>
      </div>

      <div class="notice-items-container">
        <div
          v-for="(item, idx) in itemsList"
          :key="idx"
          class="notice-card-item"
        >
          <div class="item-top-row">
            <el-select v-model="item.tag" size="small" style="width: 80px">
              <el-option label="最新" value="最新" />
              <el-option label="活动" value="活动" />
              <el-option label="通知" value="通知" />
              <el-option label="热议" value="热议" />
            </el-select>
            <el-input v-model="item.time" size="small" placeholder="时间(如 10-28)" style="width: 100px" />
            <div class="item-actions">
              <el-button
                link
                size="small"
                :disabled="idx === 0"
                @click="moveItem(idx, -1)"
                title="上移"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                :disabled="idx === itemsList.length - 1"
                @click="moveItem(idx, 1)"
                title="下移"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button link type="danger" size="small" @click="itemsList.splice(idx, 1)" title="删除">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="item-title-row">
            <el-input v-model="item.title" size="small" placeholder="快讯内容标题" />
          </div>

          <div class="item-link-row">
            <el-input v-model="item.url" size="small" placeholder="跳转路径(如: /article/101)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Plus, Delete, Top, Bottom } from '@element-plus/icons-vue';

const props = defineProps({
  component: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

if (!props.options.title) props.options.title = '公告快讯';
if (props.options.showMore === undefined) props.options.showMore = true;
if (!props.options.moreText) props.options.moreText = '更多';
if (!props.options.moreUrl) props.options.moreUrl = '/article';

// 统一 items 数据源
if (!props.options.items && !props.options.notices) {
  props.options.items = [
    { tag: '最新', title: '商城秋季大促重磅开启，全场满300立减50元！', time: '10-28', url: '/article' },
    { tag: '活动', title: '会员专享积分商城全新上线，精选好礼0元兑换', time: '10-27', url: '/article' },
    { tag: '通知', title: '关于商城系统例行优化维护及物流发货保障通知', time: '10-26', url: '/article' },
    { tag: '热议', title: '品质生活馆场景专区火热来袭，领券最高减100', time: '10-25', url: '/article' }
  ];
} else if (!props.options.items && props.options.notices) {
  props.options.items = props.options.notices.map(n => ({
    tag: n.tag || '最新',
    title: n.title || n.text || '',
    time: n.time || '10-28',
    url: n.url || '/article'
  }));
}

const itemsList = computed(() => {
  return props.options.items;
});

function handleAddItem() {
  props.options.items.push({
    tag: '最新',
    title: '新发布商城系统通知公告',
    time: '刚刚',
    url: '/article'
  });
}

function moveItem(index, step) {
  const target = index + step;
  if (target < 0 || target >= props.options.items.length) return;
  const temp = props.options.items[index];
  props.options.items[index] = props.options.items[target];
  props.options.items[target] = temp;
}
</script>

<style lang="scss" scoped>
.panel-notice-bar {
  padding: 8px 4px;

  .panel-section {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px dashed #e2e8f0;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;

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
      margin-bottom: 8px;

      .item-label {
        font-size: 12px;
        color: #475569;
        margin-right: 8px;
        white-space: nowrap;
      }
    }
  }

  .notice-items-container {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .notice-card-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .item-top-row {
        display: flex;
        align-items: center;
        gap: 6px;

        .item-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
        }
      }

      .item-title-row, .item-link-row {
        width: 100%;
      }
    }
  }
}
</style>
