<template>
  <div class="panel-search-header">
    <!-- 1. Logo 设置 -->
    <div class="panel-section">
      <div class="section-title">Logo</div>

      <!-- 规格建议提示卡片 -->
      <div class="tip-spec-box">
        建议尺寸: 220 x 80px, 适配 Logo 可用 440 x 160px; 建议大小: 100KB 内; 建议格式: PNG/WebP
      </div>

      <!-- 选择与预览区 -->
      <div class="logo-choose-row">
        <el-button size="small" class="reselect-btn" @click="handleSelectLogo">
          {{ options.logoUrl ? '重新选择' : '选择图片' }}
        </el-button>
        <div class="logo-thumb-wrapper" v-if="options.logoUrl">
          <img :src="options.logoUrl" alt="Logo preview" class="logo-preview-thumb" />
          <el-icon class="thumb-clear-btn" @click.stop="handleClearLogo" title="清除 Logo"><Close /></el-icon>
        </div>
        <div class="logo-empty-thumb" v-else>
          <span>未选择 Logo</span>
        </div>
      </div>

      <!-- Logo 链接 -->
      <div class="form-row mt-12">
        <span class="row-label">Logo链接</span>
        <div class="link-input-group">
          <el-input
            v-model="options.logoLink"
            size="small"
            placeholder="/"
            class="link-input"
          />
          <el-button size="small" class="link-btn" @click="handleSetLogoLink" title="选择跳转链接">
            <el-icon><Link /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2. 搜索框与功能设置 -->
    <div class="panel-section">
      <div class="section-title">搜索设置</div>
      <div class="form-row">
        <span class="row-label">搜索占位</span>
        <el-input v-model="options.placeholder" size="small" placeholder="请输入商品名称" class="flex-1" />
      </div>

      <div class="form-row mt-10 flex-between">
        <span class="row-label">显示右侧购物车</span>
        <el-switch v-model="options.showCart" size="small" />
      </div>

      <div class="form-row mt-10 flex-between">
        <span class="row-label">显示热门推荐词</span>
        <el-switch v-model="options.showHotWords" size="small" />
      </div>

      <div class="form-row mt-10 flex-between">
        <span class="row-label">商品/店铺搜索切换</span>
        <el-switch v-model="options.showSearchTypes" size="small" />
      </div>

      <div class="form-row mt-10" v-if="options.showSearchTypes !== false">
        <span class="row-label">默认搜索类型</span>
        <el-radio-group v-model="options.defaultSearchType" size="small">
          <el-radio-button label="goods">商品</el-radio-button>
          <el-radio-button label="store">店铺</el-radio-button>
        </el-radio-group>
      </div>

      <div class="form-row mt-10" v-if="options.showSearchTypes !== false">
        <span class="row-label">店铺占位文案</span>
        <el-input v-model="options.storePlaceholder" size="small" placeholder="请输入店铺名称" class="flex-1" />
      </div>
    </div>



    <!-- 3. 热门搜索词管理 -->
    <div class="panel-section" v-if="options.showHotWords !== false">
      <div class="section-title flex-between">
        <span>热门推荐词</span>
        <el-button type="primary" link size="small" @click="handleAddHotWord">
          <el-icon><Plus /></el-icon>添加词
        </el-button>
      </div>
      <div class="hot-words-list" v-if="options.hotWords && options.hotWords.length">
        <div v-for="(word, idx) in options.hotWords" :key="idx" class="hot-word-item">
          <el-input v-model="options.hotWords[idx]" size="small" class="word-edit-input" />
          <div class="word-actions">
            <el-button link size="small" :disabled="idx === 0" @click="moveHotWord(idx, -1)">
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button link size="small" :disabled="idx === options.hotWords.length - 1" @click="moveHotWord(idx, 1)">
              <el-icon><Bottom /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click="handleRemoveHotWord(idx)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <div class="empty-tip-text" v-else>暂无推荐词，点击右上角添加</div>
    </div>

    <!-- 4. 购物车样式设置 -->
    <div class="panel-section" v-if="options.showCart !== false">
      <div class="section-title">购物车设置</div>
      <div class="form-row">
        <span class="row-label">购物车文案</span>
        <el-input v-model="options.cartText" size="small" placeholder="购物车" class="flex-1" />
      </div>


      <div class="form-row mt-10">
        <span class="row-label">购物车背景色</span>
        <div class="color-picker-row">
          <el-color-picker v-model="options.cartBgColor" size="small" />
          <el-input v-model="options.cartBgColor" size="small" placeholder="#ffffff" class="color-hex-input" />
        </div>
      </div>

      <div class="form-row mt-10">
        <span class="row-label">购物车边框色</span>
        <div class="color-picker-row">
          <el-color-picker v-model="options.cartBorderColor" size="small" />
          <el-input v-model="options.cartBorderColor" size="small" placeholder="#e2e8f0" class="color-hex-input" />
        </div>
      </div>

      <div class="form-row mt-10">
        <span class="row-label">购物车文字色</span>
        <div class="color-picker-row">
          <el-color-picker v-model="options.cartTextColor" size="small" />
          <el-input v-model="options.cartTextColor" size="small" placeholder="#111827" class="color-hex-input" />
        </div>
      </div>

      <div class="form-row mt-10">
        <span class="row-label">购物车数量色</span>
        <div class="color-picker-row">
          <el-color-picker v-model="options.cartBadgeColor" size="small" />
          <el-input v-model="options.cartBadgeColor" size="small" placeholder="#e05644" class="color-hex-input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { Plus, Close, Link, Top, Bottom, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

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
if (props.options.showSearchTypes === undefined) {
  props.options.showSearchTypes = true;
}
if (!props.options.defaultSearchType) {
  props.options.defaultSearchType = 'goods';
}
if (!props.options.storePlaceholder) {
  props.options.storePlaceholder = '请输入店铺名称';
}


if (props.options.logoLink === undefined) props.options.logoLink = '/';
if (props.options.placeholder === undefined) props.options.placeholder = '请输入商品名称';
if (props.options.showCart === undefined) props.options.showCart = true;
if (props.options.showHotWords === undefined) props.options.showHotWords = true;
if (props.options.cartText === undefined) props.options.cartText = '购物车';
if (props.options.cartBgColor === undefined) props.options.cartBgColor = '#ffffff';
if (props.options.cartBorderColor === undefined) props.options.cartBorderColor = '#e2e8f0';
if (props.options.cartTextColor === undefined) props.options.cartTextColor = '#111827';
if (props.options.cartBadgeColor === undefined) props.options.cartBadgeColor = '#e05644';
if (!Array.isArray(props.options.hotWords)) {
  props.options.hotWords = ['工业品', '进口好物', '综合特惠', '企业采购'];
}

const openImagePicker = inject('openImagePicker', null);
const openLinkPicker = inject('openLinkPicker', null);

function handleSelectLogo() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) {
        props.options.logoUrl = url;
      }
    });
  } else {
    ElMessageBox.prompt('请输入 Logo 图片 URL 地址：', '选择 Logo 图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.logoUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        props.options.logoUrl = value;
      })
      .catch(() => {});
  }
}

function handleClearLogo() {
  props.options.logoUrl = '';
}

function handleSetLogoLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      props.options.logoLink = url;
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接路径：', '设置 Logo 链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.logoLink || '/',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接路径不能为空'
    })
      .then(({ value }) => {
        props.options.logoLink = value;
      })
      .catch(() => {});
  }
}

function handleAddHotWord() {
  props.options.hotWords.push('新品推荐');
}

function handleRemoveHotWord(idx) {
  props.options.hotWords.splice(idx, 1);
}

function moveHotWord(idx, offset) {
  const target = idx + offset;
  if (target < 0 || target >= props.options.hotWords.length) return;
  const item = props.options.hotWords.splice(idx, 1)[0];
  props.options.hotWords.splice(target, 0, item);
}
</script>

<style lang="scss" scoped>
.panel-search-header {
  padding: 12px;
  box-sizing: border-box;

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

    .form-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #475569;

      &.flex-between {
        justify-content: space-between;

        .row-label {
          width: auto;
          white-space: nowrap;
        }
      }

      .row-label {
        width: 90px;
        flex-shrink: 0;
        color: #475569;
        font-size: 12px;
        white-space: nowrap;
      }

      .flex-1 {
        flex: 1;
      }
    }

    .mt-10 {
      margin-top: 10px;
    }

    .mt-12 {
      margin-top: 12px;
    }

    /* 建议规格暗色卡片 */
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

    /* Logo 选择行 */
    .logo-choose-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .reselect-btn {
        width: 88px;
        flex-shrink: 0;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;

        &:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
      }

      .logo-thumb-wrapper {
        flex: 1;
        height: 48px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 4px 8px;
        box-sizing: border-box;

        .logo-preview-thumb {
          max-height: 40px;
          max-width: 100%;
          object-fit: contain;
        }

        .thumb-clear-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;

          &:hover {
            color: #ef4444;
          }
        }
      }

      .logo-empty-thumb {
        flex: 1;
        height: 48px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 12px;
      }
    }

    /* Logo 链接输入区 */
    .link-input-group {
      flex: 1;
      display: flex;
      align-items: center;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff;

      .link-input {
        flex: 1;
        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          border-radius: 0;
        }
      }

      .link-btn {
        border: none;
        border-left: 1px solid #e2e8f0;
        border-radius: 0;
        background: #f8fafc;
        color: #64748b;
        padding: 0 10px;

        &:hover {
          background: #f1f5f9;
          color: #ff6a00;
        }
      }
    }

    /* 搜索轮播列表 */
    .hot-words-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;

      .hot-word-item {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f8fafc;
        padding: 4px 6px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;

        .word-edit-input {
          flex: 1;
        }

        .word-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }
    }

    .empty-tip-text {
      color: #94a3b8;
      font-size: 12px;
      padding: 8px 0;
      text-align: center;
    }

    /* 颜色选择器行 */
    .color-picker-row {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      .color-hex-input {
        flex: 1;
      }
    }
  }
}
</style>
