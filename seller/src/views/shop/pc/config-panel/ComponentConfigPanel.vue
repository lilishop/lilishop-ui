<template>
  <div class="component-config-panel" v-if="component">
    <!-- 1. 容器大小 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandSize = !expandSize">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandSize }"><ArrowRight /></el-icon>
          <span class="header-title">容器大小</span>
          <el-tooltip content="设置当前组件的排版模式、内外边距及圆角样式" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="collapse-body" v-show="expandSize">
        <!-- 排版方式 -->
        <div class="form-row">
          <span class="row-label">排版宽度</span>
          <el-select v-model="compStyle.widthRatio" size="small" class="full-select">
            <el-option
              v-for="opt in layoutOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </el-select>
        </div>

        <!-- 可视化嵌套盒模型 (外边距 + 内边距 + 圆角) -->
        <div class="box-model-section">
          <nested-box-model
            :key="props.component?.id || props.component?.key || 'comp'"
            :margin="compStyle.margin"
            :padding="compStyle.padding"
            :radius="compStyle.radius"
            :show-radius="true"
            @update:margin="val => compStyle.margin = val"
            @update:padding="val => compStyle.padding = val"
            @update:radius="val => compStyle.radius = val"
          />
        </div>
      </div>
    </div>

    <!-- 2. 背景设置 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandBg = !expandBg">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandBg }"><ArrowRight /></el-icon>
          <span class="header-title">背景设置</span>
          <el-tooltip content="设置当前组件的背景颜色与背景图片" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="collapse-body" v-show="expandBg">
        <!-- 背景色 -->
        <div class="form-row">
          <span class="row-label">背景色</span>
          <div class="color-picker-row">
            <el-color-picker
              v-model="compStyle.backgroundColor"
              show-alpha
              size="small"
              class="color-picker-swatch"
              :predefine="predefineColors"
              @change="handleColorChange"
              @active-change="handleColorActiveChange"
            />
            <el-input
              v-model="compStyle.backgroundColor"
              size="small"
              class="color-input"
              placeholder="透明"
              clearable
              @blur="handleInputBlur"
            />
          </div>
        </div>

        <!-- 背景图片 -->
        <div class="form-row mt-10">
          <span class="row-label">
            背景图片
            <el-tooltip content="建议大小: 500KB 内; 建议格式: WebP/JPG/PNG" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </span>
          <div class="bg-img-btns">
            <el-button size="small" @click="handleSelectImage" class="action-btn">
              选择图片
            </el-button>
            <el-button
              size="small"
              :disabled="!compStyle.backgroundImage"
              @click="handleClearImage"
              class="action-btn secondary"
            >
              {{ compStyle.backgroundImage ? '清除背景图' : '未选择背景图' }}
            </el-button>
          </div>
        </div>

        <div v-if="compStyle.backgroundImage" class="bg-preview-row">
          <img :src="compStyle.backgroundImage" class="bg-preview-img" alt="背景预览" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-panel">
    请在画布中选中一个组件进行组件配置
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { ArrowRight, QuestionFilled } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import NestedBoxModel from '../controls/NestedBoxModel.vue';

const props = defineProps({
  component: {
    type: Object,
    default: null
  }
});

const expandSize = ref(true);
const expandBg = ref(true);

const layoutOptions = computed(() => {
  if (['topBar', 'searchHeader', 'footerNav', 'categoryNav'].includes(props.component?.type)) {
    return [
      { value: '100%', label: '整行' }
    ];
  }
  if (['channelGrid', 'freeLayout', 'promoGroup', 'video', 'goodsList', 'gridFloor', 'goodsGrid', 'goodsCard', 'bannerFloor', 'goodsBar', 'channelFloor', 'recommendFeed', 'couponList', 'titleBar', 'noticeBar'].includes(props.component?.type)) {
    return [
      { value: '100%', label: '整行' },
      { value: '66.67%', label: '三分之二' },
      { value: '50%', label: '一半' },
      { value: '33.33%', label: '三分之一' },
      { value: '16.67%', label: '六分之一' }
    ];
  }
  if (props.component?.type === 'carousel') {
    return [
      { value: '66.67%', label: '三分之二' },
      { value: '100%', label: '整行' },
      { value: '50%', label: '一半' },
      { value: '33.33%', label: '三分之一' },
      { value: '16.67%', label: '六分之一' }
    ];
  }
  if (['categoryMegaMenu', 'userBenefits'].includes(props.component?.type)) {
    return [
      { value: '16.67%', label: '六分之一' },
      { value: '33.33%', label: '三分之一' },
      { value: '50%', label: '一半' }
    ];
  }
  if (['brandWall', 'hotZone', 'articleContent'].includes(props.component?.type)) {
    return [
      { value: '100%', label: '整行' },
      { value: '66.67%', label: '三分之二' },
      { value: '50%', label: '一半' },
      { value: '33.33%', label: '三分之一' }
    ];
  }
  return [
    { value: '100%', label: '整行' },
    { value: 'auto', label: '自适应' },
    { value: '50%', label: '半行 (50%)' },
    { value: '33.3%', label: '三分之一 (33.3%)' },
    { value: '25%', label: '四分之一 (25%)' }
  ];
});

const compStyle = computed(() => {
  if (!props.component) return {};
  if (!props.component.componentStyle) {
    props.component.componentStyle = {};
  }
  const s = props.component.componentStyle;
  if (!Array.isArray(s.margin)) s.margin = [0, 0, 0, 0];
  if (!Array.isArray(s.padding)) s.padding = [0, 0, 0, 0];
  if (!Array.isArray(s.radius)) s.radius = [0, 0, 0, 0];
  if (['topBar', 'searchHeader', 'footerNav', 'categoryNav'].includes(props.component?.type)) {
    s.widthRatio = '100%';
  } else if (!s.widthRatio) {
    s.widthRatio = props.component?.type === 'carousel' ? '66.67%' : (['categoryMegaMenu', 'userBenefits'].includes(props.component?.type) ? '16.67%' : '100%');
  }
  if (['channelGrid', 'freeLayout', 'promoGroup', 'video', 'goodsList', 'gridFloor', 'goodsGrid', 'goodsCard', 'bannerFloor', 'goodsBar', 'channelFloor', 'recommendFeed', 'couponList', 'titleBar', 'noticeBar'].includes(props.component?.type)) {
    if (s.widthRatio === '33.3%') s.widthRatio = '33.33%';
    else if (s.widthRatio === '66.6%' || s.widthRatio === '66.7%') s.widthRatio = '66.67%';
    else if (s.widthRatio === '16.6%' || s.widthRatio === '16.7%') s.widthRatio = '16.67%';
    else if (!['100%', '66.67%', '50%', '33.33%', '16.67%'].includes(s.widthRatio)) {
      s.widthRatio = '100%';
    }
  }
  if (props.component?.type === 'carousel') {
    if (s.widthRatio === '33.3%') s.widthRatio = '33.33%';
    else if (s.widthRatio === '66.6%' || s.widthRatio === '66.7%') s.widthRatio = '66.67%';
    else if (s.widthRatio === '16.6%' || s.widthRatio === '16.7%') s.widthRatio = '16.67%';
    else if (!['66.67%', '100%', '50%', '33.33%', '16.67%'].includes(s.widthRatio)) {
      s.widthRatio = '66.67%';
    }
  }
  if (['categoryMegaMenu', 'userBenefits'].includes(props.component?.type)) {
    if (s.widthRatio === '33.3%') s.widthRatio = '33.33%';
    else if (s.widthRatio === '16.6%' || s.widthRatio === '16.7%') s.widthRatio = '16.67%';
    else if (!['16.67%', '33.33%', '50%'].includes(s.widthRatio)) {
      s.widthRatio = '16.67%';
    }
  }
  if (['brandWall', 'hotZone', 'articleContent'].includes(props.component?.type)) {
    if (s.widthRatio === '33.3%') s.widthRatio = '33.33%';
    else if (s.widthRatio === '66.6%' || s.widthRatio === '66.7%') s.widthRatio = '66.67%';
    else if (!['100%', '66.67%', '50%', '33.33%'].includes(s.widthRatio)) {
      s.widthRatio = '100%';
    }
  }
  if (s.backgroundColor === undefined) {
    s.backgroundColor = '';
  } else if (s.backgroundColor && /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(s.backgroundColor.trim())) {
    s.backgroundColor = s.backgroundColor.trim().replace(/,\s*0\s*\)$/, ', 1)');
  }
  return s;
});

const predefineColors = [
  '#ffffff',
  '#f8fafc',
  '#f1f5f9',
  '#f3f4f6',
  '#fee2e2',
  '#ffedd5',
  '#fef3c7',
  '#e0e7ff',
  '#1e293b',
  '#0f172a'
];

function handleColorChange(val) {
  if (!val) return;
  if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(val)) {
    compStyle.value.backgroundColor = val.replace(/,\s*0\s*\)$/, ', 1)');
  }
}

function handleColorActiveChange(val) {
  if (!val) return;
  if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(val)) {
    compStyle.value.backgroundColor = val.replace(/,\s*0\s*\)$/, ', 1)');
  }
}

function handleInputBlur() {
  const val = compStyle.value.backgroundColor;
  if (!val) return;
  if (/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(val.trim())) {
    compStyle.value.backgroundColor = val.trim().replace(/,\s*0\s*\)$/, ', 1)');
  }
}

const openImagePicker = inject('openImagePicker', null);

function handleSelectImage() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) {
        compStyle.value.backgroundImage = url;
      }
    });
  } else {
    ElMessageBox.prompt('请输入背景图片 URL 地址：', '选择背景图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: compStyle.value.backgroundImage || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '请输入有效的图片 URL 地址'
    })
      .then(({ value }) => {
        compStyle.value.backgroundImage = value;
      })
      .catch(() => {});
  }
}

function handleClearImage() {
  compStyle.value.backgroundImage = '';
}
</script>

<style lang="scss" scoped>
.component-config-panel {
  padding: 12px;
  box-sizing: border-box;

  .setting-collapse-card {
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;

    .collapse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      cursor: pointer;
      user-select: none;
      background: #fafafa;
      border-bottom: 1px solid transparent;
      transition: background-color 0.2s;

      &:hover {
        background: #f5f7fa;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 6px;

        .arrow-icon {
          font-size: 12px;
          color: #909399;
          transition: transform 0.2s;

          &.is-expanded {
            transform: rotate(90deg);
          }
        }

        .header-title {
          font-size: 13px;
          font-weight: 600;
          color: #262626;
        }

        .help-icon {
          font-size: 14px;
          color: #909399;
          cursor: pointer;
        }
      }
    }

    .collapse-body {
      padding: 14px;
      background: #ffffff;
      border-top: 1px solid #f0f0f0;

      .form-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;

        &.mt-12 {
          margin-top: 12px;
        }

        .row-label {
          font-size: 12px;
          color: #606266;
          display: flex;
          align-items: center;
          gap: 4px;

          .help-icon {
            font-size: 13px;
            color: #909399;
            cursor: pointer;

            &:hover {
              color: #409eff;
            }
          }
        }

        .full-select {
          width: 100%;
        }

        .color-picker-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .color-input {
            flex: 1;
          }
        }

        .bg-img-btns {
          display: flex;
          gap: 10px;

          .action-btn {
            flex: 1;
            height: 32px;

            &.secondary {
              background: #fafafa;
              color: #909399;
            }
          }
        }
      }

      .box-model-section {
        margin-top: 14px;
      }

      .tip-spec-box {
      background: #2b2e3b;
      color: #f1f5f9;
      padding: 8px 10px;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.5;
      margin-bottom: 10px;
      word-break: break-all;
    }

    .bg-preview-row {
        margin-top: 10px;
        padding: 6px;
        border: 1px dashed #dcdfe6;
        border-radius: 4px;
        text-align: center;

        .bg-preview-img {
          max-width: 100%;
          max-height: 80px;
          object-fit: contain;
          border-radius: 4px;
        }
      }
    }
  }
}

.empty-panel {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  font-size: 13px;
}
</style>
