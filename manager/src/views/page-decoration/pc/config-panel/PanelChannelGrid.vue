<template>
  <div class="panel-channel-grid">
    <!-- 1. 内容设置 -->
    <div class="panel-section">
      <div class="section-title">
        <div class="title-with-tip">
          <span>内容设置</span>
          <el-tooltip
            content="设置频道宫格入口图文、跳转链接及排版间距"
            placement="top"
          >
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="sub-section-title">频道入口</div>

      <!-- 频道卡片列表 -->
      <div class="channel-cards-list">
        <div
          v-for="(item, idx) in options.items"
          :key="idx"
          class="channel-item-card"
        >
          <!-- 第一行：左侧【选择资源】，右侧【替换图片/缩略图】 -->
          <div class="card-row-top">
            <el-button
              size="small"
              class="select-resource-btn"
              @click="handleSelectResource(item)"
            >
              选择资源
            </el-button>

            <!-- 右侧图片上传/预览框 -->
            <div
              class="thumb-picker-box"
              @click="handleSelectImage(item)"
              :title="item.img ? '点击更换图片' : '点击上传图片'"
            >
              <template v-if="item.img">
                <img :src="item.img" alt="频道图" class="thumb-img" />
                <span class="thumb-del-badge" @click.stop="item.img = ''" title="移除图片">
                  <el-icon><Close /></el-icon>
                </span>
              </template>
              <template v-else>
                <span class="upload-tip-text">替换图片</span>
              </template>
            </div>
          </div>

          <!-- 第二行：主标题与副标题 -->
          <div class="card-row-inputs">
            <el-input
              v-model="item.title"
              size="small"
              placeholder="主标题（如：企业采购）"
              class="title-input"
            />
            <el-input
              v-model="item.subtitle"
              size="small"
              placeholder="副标题（如：批量省心）"
              class="subtitle-input"
            />
          </div>

          <!-- 第三行：底栏工具条 (链接、上移、下移、删除) -->
          <div class="card-row-actions">
            <el-button
              size="small"
              class="action-btn link-btn"
              :class="{ 'is-linked': !!item.url }"
              @click="handleSetLink(item)"
              @contextmenu.prevent="item.url = ''"
              :title="item.url ? (`已设链接: ${item.url} (点击修改，右键清除)`) : '设置跳转链接'"
            >
              <el-icon><Link /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn"
              :disabled="idx === 0"
              @click="moveItem(idx, -1)"
              title="上移"
            >
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn"
              :disabled="idx === (options.items || []).length - 1"
              @click="moveItem(idx, 1)"
              title="下移"
            >
              <el-icon><Bottom /></el-icon>
            </el-button>
            <el-button
              size="small"
              class="action-btn del-btn"
              @click="options.items.splice(idx, 1)"
              title="删除频道"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 添加频道按钮 -->
      <el-button
        class="add-channel-full-btn"
        @click="handleAddChannel"
      >
        <el-icon><Plus /></el-icon> 添加频道
      </el-button>

      <!-- 排版间距与圆角参数 -->
      <div class="form-row mt-16">
        <span class="row-label">图片圆角</span>
        <el-input-number
          v-model="options.imageRadius"
          :min="0"
          :max="50"
          :step="1"
          size="small"
          class="num-input"
        />
      </div>

      <div class="form-row mt-12">
        <span class="row-label">间距</span>
        <el-input-number
          v-model="options.gap"
          :min="0"
          :max="40"
          :step="1"
          size="small"
          class="num-input"
        />
      </div>


    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { Plus, Delete, Close, Link, Top, Bottom, QuestionFilled } from '@element-plus/icons-vue';
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

// 注入全局选择器
const openLinkPicker = inject('openLinkPicker', null);
const openImagePicker = inject('openImagePicker', null);

// 1. 选择资源 (打开链接/资源树选择器，回填名称与链接)
function handleSelectResource(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title, raw }) => {
      if (title && !item.title) item.title = title;
      if (url) item.url = url;
      if (raw && (raw.image || raw.icon || raw.pic) && !item.img) {
        item.img = raw.image || raw.icon || raw.pic;
      }
    });
  } else {
    ElMessageBox.prompt('请输入频道名称：', '选择资源', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.title || '',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    })
      .then(({ value }) => {
        item.title = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择图片
function handleSelectImage(item) {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) item.img = url;
    });
  } else {
    ElMessageBox.prompt('请输入图片 URL 地址：', '上传频道图片', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.img || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        item.img = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 设置链接
function handleSetLink(item) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title }) => {
      item.url = url;
      if (!item.title && title) item.title = title;
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接（如 /goodsList?channel=1）：', '设置跳转链接', {
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

// 4. 上移 / 下移
function moveItem(idx, dir) {
  const list = props.options.items;
  const target = idx + dir;
  if (target < 0 || target >= list.length) return;
  const temp = list[idx];
  list[idx] = list[target];
  list[target] = temp;
}

// 5. 添加频道
function handleAddChannel() {
  if (!Array.isArray(props.options.items)) {
    props.options.items = [];
  }
  const nextNum = props.options.items.length + 1;
  const iconIdx = ((nextNum - 1) % 4) + 1;
  props.options.items.push({
    title: `频道 ${nextNum}`,
    subtitle: '品质好物',
    img: `/static/channel-grid/channel_${iconIdx}.png`,
    url: `/goodsList?channel=${nextNum}`
  });
}
</script>

<style lang="scss" scoped>
.panel-channel-grid {
  font-size: 13px;
  color: #334155;

  .panel-section {
    padding-bottom: 20px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;

      .title-with-tip {
        display: flex;
        align-items: center;
        gap: 6px;

        .help-icon {
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #475569;
          }
        }
      }
    }

    .sub-section-title {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 10px;
    }

    .channel-cards-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;

      .channel-item-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: border-color 0.2s;

        &:hover {
          border-color: #cbd5e1;
        }

        // 第一行：选择资源 + 替换图片
        .card-row-top {
          display: flex;
          align-items: center;
          gap: 10px;

          .select-resource-btn {
            flex: 1;
            height: 38px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            color: #1e293b;
            transition: all 0.2s;

            &:hover {
              border-color: #f97316;
              color: #ea580c;
            }
          }

          .thumb-picker-box {
            flex: 1;
            height: 38px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
            overflow: hidden;

            &:hover {
              border-color: #f97316;

              .upload-tip-text {
                color: #ea580c;
              }
            }

            .upload-tip-text {
              font-size: 12px;
              color: #64748b;
              user-select: none;
            }

            .thumb-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              padding: 2px;
            }

            .thumb-del-badge {
              position: absolute;
              top: 2px;
              right: 2px;
              width: 16px;
              height: 16px;
              background: rgba(15, 23, 42, 0.7);
              color: #ffffff;
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

        // 第二行：主副标题输入
        .card-row-inputs {
          display: flex;
          align-items: center;
          gap: 8px;

          .title-input, .subtitle-input {
            flex: 1;

            :deep(.el-input__wrapper) {
              background: #ffffff;
              box-shadow: 0 0 0 1px #e2e8f0 inset;

              &:hover {
                box-shadow: 0 0 0 1px #cbd5e1 inset;
              }

              &.is-focus {
                box-shadow: 0 0 0 1px #f97316 inset;
              }
            }
          }
        }

        // 第三行：工具条
        .card-row-actions {
          display: flex;
          align-items: center;
          gap: 6px;

          .action-btn {
            flex: 1;
            height: 28px;
            padding: 0;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #64748b;

            &:hover:not(:disabled) {
              border-color: #cbd5e1;
              color: #1e293b;
            }

            &.link-btn.is-linked {
              border-color: #fdba74;
              background: #fff7ed;
              color: #ea580c;
            }

            &.del-btn {
              &:hover {
                border-color: #fecaca;
                background: #fef2f2;
                color: #ef4444;
              }
            }
          }
        }
      }
    }

    // 添加频道按钮
    .add-channel-full-btn {
      width: 100%;
      height: 36px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #ffffff;
      color: #334155;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        border-color: #f97316;
        color: #ea580c;
        background: #fffaf5;
      }
    }

    // 参数设置行
    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.mt-16 {
        margin-top: 16px;
      }

      &.mt-12 {
        margin-top: 12px;
      }

      .row-label {
        font-size: 12px;
        color: #475569;
      }

      .num-input {
        width: 120px;
      }
    }
  }
}
</style>
