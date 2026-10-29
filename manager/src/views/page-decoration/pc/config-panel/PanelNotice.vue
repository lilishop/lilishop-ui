<template>
  <div class="panel-notice-bar">
    <!-- 1. 基础配置与图标设置 -->
    <div class="panel-section">
      <div class="section-title">快讯标语与图标</div>
      <div class="form-item">
        <span class="item-label">前缀标语</span>
        <el-input v-model="options.title" size="small" placeholder="如：公告快讯 / 今日热点" clearable />
      </div>

      <!-- 徽标图标 / 图片选择器 -->
      <div class="form-item mt-10">
        <span class="item-label">前缀徽标图标 (可选自定义图片)</span>
        <div class="badge-icon-picker-row">
          <div class="icon-thumb-preview" @click="handleSelectBadgeImg" title="点击选择/更换徽标图片">
            <img v-if="options.badgeImg || options.icon" :src="options.badgeImg || options.icon" class="badge-img" alt="" />
            <div v-else class="icon-placeholder">
              <el-icon><Picture /></el-icon>
              <span>选图</span>
            </div>
            <div class="hover-overlay" v-if="options.badgeImg || options.icon">换图</div>
          </div>
          <div class="icon-input-wrap">
            <div class="input-btn-row">
              <el-input
                v-model="badgeImgVal"
                size="small"
                placeholder="留空展示默认喇叭图标"
                clearable
              />
              <el-button size="small" class="action-picker-btn" @click="handleSelectBadgeImg">
                <el-icon class="mr-4"><Picture /></el-icon>
                <span>选择图片</span>
              </el-button>
            </div>
            <div class="tip-sub-text">建议尺寸 24x24 或 32x32px 正方形小图标</div>
          </div>
        </div>
      </div>

      <div class="form-item flex-row mt-10">
        <span class="item-label">展示“更多”入口</span>
        <el-switch v-model="options.showMore" size="small" />
      </div>

      <template v-if="options.showMore !== false">
        <div class="form-item mt-10">
          <span class="item-label">“更多”文案</span>
          <el-input v-model="options.moreText" size="small" placeholder="如：更多" clearable />
        </div>
        <div class="form-item mt-10">
          <span class="item-label">“更多”跳转链接</span>
          <div class="link-picker-wrap">
            <el-input v-model="options.moreUrl" size="small" placeholder="如：/article 或文章列表" clearable>
              <template #prefix>
                <el-icon class="link-input-icon"><Link /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              plain
              size="small"
              class="action-picker-btn link-btn"
              @click="handleSelectMoreLink"
            >
              <el-icon class="mr-4"><Link /></el-icon>
              <span>选择链接</span>
            </el-button>
          </div>
          <div class="link-current-tag" v-if="options.moreUrl">
            <span class="tag-label">当前链接:</span>
            <span class="tag-val" :title="options.moreUrl">{{ options.moreUrl }}</span>
            <el-icon class="url-clear-icon" title="清除链接" @click.stop="options.moreUrl = ''"><Close /></el-icon>
          </div>
        </div>
      </template>
    </div>

    <!-- 2. 快讯条目列表 -->
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
            <el-select v-model="item.tag" size="small" style="width: 86px" filterable allow-create placeholder="标签">
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

          <div class="item-title-row mt-6">
            <el-input v-model="item.title" size="small" placeholder="快讯内容标题" clearable />
          </div>

          <div class="item-link-row mt-6">
            <div class="link-picker-wrap">
              <el-input v-model="item.url" size="small" placeholder="跳转路径(如: /article/101 或文章链接)" clearable>
                <template #prefix>
                  <el-icon class="link-input-icon"><Link /></el-icon>
                </template>
              </el-input>
              <el-button
                type="primary"
                plain
                size="small"
                class="action-picker-btn link-btn"
                @click="handleSelectItemLink(item)"
              >
                <el-icon class="mr-4"><Link /></el-icon>
                <span>选链接</span>
              </el-button>
            </div>
            <div class="link-current-tag" v-if="item.url">
              <span class="tag-label">当前链接:</span>
              <span class="tag-val" :title="item.url">{{ item.url }}</span>
              <el-icon class="url-clear-icon" title="清除链接" @click.stop="item.url = ''"><Close /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { Plus, Delete, Top, Bottom, Link, Picture, Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

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

// 全局选择器注入
const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);

if (!props.options.title) props.options.title = '公告快讯';
if (props.options.showMore === undefined) props.options.showMore = true;
if (!props.options.moreText) props.options.moreText = '更多';
if (!props.options.moreUrl) props.options.moreUrl = '/article';

const badgeImgVal = computed({
  get() {
    return props.options.badgeImg || props.options.icon || '';
  },
  set(v) {
    props.options.badgeImg = v;
    props.options.icon = v;
  }
});

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

// 1. 选择前缀徽标图片
function handleSelectBadgeImg() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) {
        props.options.badgeImg = url;
        props.options.icon = url;
      }
    });
  } else {
    ElMessageBox.prompt('请输入快讯徽标图片 URL：', '选择快讯图标', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.badgeImg || props.options.icon || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.badgeImg = value.trim();
        props.options.icon = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择“更多”链接
function handleSelectMoreLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.moreUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入“更多”跳转链接：', '设置跳转链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.moreUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.moreUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 选择单条快讯链接
function handleSelectItemLink(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      if (url) item.url = url;
      if (!item.title && title) item.title = title;
    });
  } else {
    ElMessageBox.prompt('请输入快讯跳转链接：', '设置快讯链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        item.url = value.trim();
      })
      .catch(() => {});
  }
}

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
    margin-bottom: 20px;
    padding-bottom: 16px;
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
      flex-direction: column;
      gap: 5px;

      &.flex-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .item-label {
        font-size: 12px;
        color: #475569;
        font-weight: 500;
      }
    }
  }

  .mt-6 {
    margin-top: 6px;
  }
  .mt-10 {
    margin-top: 10px;
  }
  .mr-4 {
    margin-right: 4px;
  }

  .badge-icon-picker-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;

    .icon-thumb-preview {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;

      .badge-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .icon-placeholder {
        width: 100%;
        height: 100%;
        background: #e2e8f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #64748b;
        gap: 2px;
      }

      .hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        color: #ffffff;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .hover-overlay {
        opacity: 1;
      }
    }

    .icon-input-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .input-btn-row {
        display: flex;
        gap: 6px;
      }

      .tip-sub-text {
        font-size: 11px;
        color: #94a3b8;
      }
    }
  }

  .link-picker-wrap {
    display: flex;
    align-items: center;
    gap: 6px;

    .link-input-icon {
      color: #94a3b8;
    }

    .action-picker-btn {
      flex-shrink: 0;
      padding: 0 10px;

      &.link-btn {
        background: #ecf5ff;
        border-color: #b3d8ff;
        color: #409eff;

        &:hover {
          background: #409eff;
          color: #ffffff;
        }
      }
    }
  }

  .link-current-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 4px;
    padding: 3px 8px;
    margin-top: 4px;
    overflow: hidden;

    .tag-label {
      color: #3b82f6;
      font-weight: 500;
      flex-shrink: 0;
    }

    .tag-val {
      color: #1e40af;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .url-clear-icon {
      font-size: 12px;
      color: #94a3b8;
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        color: #ef4444;
      }
    }
  }

  .notice-items-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 420px;
    overflow-y: auto;

    .notice-card-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;

      .item-top-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .item-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }
    }
  }
}
</style>
