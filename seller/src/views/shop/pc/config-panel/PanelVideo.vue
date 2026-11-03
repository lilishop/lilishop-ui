<template>
  <div class="panel-video">
    <!-- 1. 媒体资源设置 -->
    <div class="panel-section">
      <div class="section-title">视频源与媒体文件</div>

      <!-- 视频文件选择 -->
      <div class="form-item">
        <span class="item-label">视频文件 URL (.mp4)</span>
        <div class="input-with-action">
          <el-input
            v-model="options.videoUrl"
            size="small"
            placeholder="请输入在线视频地址或点击右侧选择"
            clearable
          >
            <template #prefix>
              <el-icon class="field-icon"><VideoCamera /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            size="small"
            class="action-picker-btn"
            @click="handleSelectVideo"
          >
            <el-icon class="mr-4"><VideoCamera /></el-icon>
            <span>选择视频</span>
          </el-button>
        </div>
        <div class="source-status-tag" v-if="options.videoUrl">
          <span class="status-dot"></span>
          <span class="status-text" :title="options.videoUrl">已绑定视频: {{ getMediaName(options.videoUrl) }}</span>
          <span class="status-clear-btn" @click="options.videoUrl = ''" title="清除视频">清空</span>
        </div>
      </div>

      <!-- 视频封面图选择 -->
      <div class="form-item mt-14">
        <span class="item-label">视频封面图片 (海报/底图)</span>
        <div class="picker-flex-wrap">
          <!-- 缩略图预览与快捷替换 -->
          <div
            class="thumb-preview-box"
            @click="handleSelectCover"
            :title="options.coverUrl ? '点击更换封面图' : '点击选择封面图'"
          >
            <template v-if="options.coverUrl">
              <img :src="options.coverUrl" alt="封面" class="preview-img" />
              <span class="thumb-clear-btn" @click.stop="options.coverUrl = ''" title="清除封面">
                <el-icon><Close /></el-icon>
              </span>
            </template>
            <template v-else>
              <el-icon class="thumb-empty-icon"><Picture /></el-icon>
              <span class="thumb-empty-tip">选图</span>
            </template>
          </div>

          <!-- URL 输入框与选择图片按钮 -->
          <div class="input-with-action flex-1">
            <el-input
              v-model="options.coverUrl"
              size="small"
              placeholder="请输入封面图 URL 或点击选择"
              clearable
            />
            <el-button
              size="small"
              class="action-picker-btn"
              @click="handleSelectCover"
            >
              <el-icon class="mr-4"><Picture /></el-icon>
              <span>选择图片</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 点击跳转链接 -->
    <div class="panel-section">
      <div class="section-title">跳转与行动点 (CTA)</div>
      <div class="form-item">
        <span class="item-label">跳转链接 (选填，点击视频或行动点跳转)</span>
        <div class="link-picker-wrap">
          <el-input
            v-model="options.url"
            size="small"
            placeholder="如 /goodsList?seckill=1 或完整网址"
            clearable
          >
            <template #prefix>
              <el-icon class="link-input-icon"><Link /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            plain
            size="small"
            class="action-picker-btn link-btn"
            @click="handleSelectLink"
          >
            <el-icon class="mr-4"><Link /></el-icon>
            <span>选择链接</span>
          </el-button>
        </div>
        <div class="link-current-tag" v-if="options.url">
          <span class="tag-label">当前链接:</span>
          <span class="tag-val" :title="options.url">{{ options.url }}</span>
        </div>
      </div>
    </div>

    <!-- 3. 播放与展示控制 -->
    <div class="panel-section">
      <div class="section-title">播放与展示控制</div>

      <div class="form-item flex-row">
        <span class="item-label">播放器高度 (px)</span>
        <el-input-number
          v-model="options.height"
          :min="200"
          :max="800"
          :step="20"
          size="small"
          controls-position="right"
        />
      </div>

      <div class="form-item flex-row">
        <span class="item-label">显示播放控制条</span>
        <el-switch v-model="options.controls" size="small" />
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
import { inject } from 'vue';
import { VideoCamera, Picture, Link, Close } from '@element-plus/icons-vue';
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

// 注入来自 pc/index.vue 的全局选择器
const openImagePicker = inject('openImagePicker', null);
const openVideoPicker = inject('openVideoPicker', null);
const openLinkPicker = inject('openLinkPicker', null);

// 提取 URL 中的文件名
function getMediaName(url) {
  if (!url) return '';
  try {
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1] || url;
  } catch (e) {
    return url;
  }
}

// 1. 选择视频文件 (.mp4)
function handleSelectVideo() {
  if (openVideoPicker) {
    openVideoPicker((url) => {
      if (url) props.options.videoUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入在线视频 (.mp4) URL 地址：', '选择视频文件', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.videoUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '视频地址不能为空'
    })
      .then(({ value }) => {
        props.options.videoUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择封面图片
function handleSelectCover() {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) props.options.coverUrl = url;
    });
  } else {
    ElMessageBox.prompt('请输入视频封面图 URL 地址：', '选择视频封面', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.coverUrl || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '封面图地址不能为空'
    })
      .then(({ value }) => {
        props.options.coverUrl = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 选择跳转链接
function handleSelectLink() {
  if (openLinkPicker) {
    openLinkPicker(({ url }) => {
      if (url) props.options.url = url;
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接（如 /goodsList?seckill=1 或完整网址）：', '设置跳转链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: props.options.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        props.options.url = value.trim();
      })
      .catch(() => {});
  }
}
</script>

<style lang="scss" scoped>
.panel-video {
  .panel-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .mt-14 {
      margin-top: 14px;
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
        font-weight: 500;
      }
    }
  }

  .mr-4 {
    margin-right: 4px;
  }

  .flex-1 {
    flex: 1;
  }

  .field-icon {
    color: #94a3b8;
  }

  .input-with-action {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;

    .action-picker-btn {
      flex-shrink: 0;
      padding: 0 10px;
    }
  }

  .source-status-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
    border-radius: 4px;
    padding: 3px 8px;
    margin-top: 2px;
    overflow: hidden;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      flex-shrink: 0;
    }

    .status-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-clear-btn {
      color: #dc2626;
      cursor: pointer;
      font-size: 11px;
      padding-left: 4px;
      flex-shrink: 0;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .picker-flex-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .thumb-preview-box {
      position: relative;
      width: 58px;
      height: 40px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
      background: #ffffff;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s;

      &:hover {
        border-color: #409eff;
      }

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .thumb-empty-icon {
        font-size: 15px;
        color: #94a3b8;
      }

      .thumb-empty-tip {
        font-size: 10px;
        color: #94a3b8;
        line-height: 1;
        margin-top: 2px;
      }

      .thumb-clear-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.65);
        color: #ffffff;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        cursor: pointer;

        &:hover {
          background: #ef4444;
        }
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
    }
  }
}
</style>
