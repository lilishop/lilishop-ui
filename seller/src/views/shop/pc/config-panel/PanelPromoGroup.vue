<template>
  <div class="panel-promo-group">
    <!-- 1. 排版列数 -->
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

    <!-- 2. 活动卡片列表 -->
    <div class="panel-section">
      <div class="section-title flex-between">
        <span>活动卡片列表 ({{ options.cards?.length || 0 }})</span>
        <el-button link type="primary" size="small" @click="handleAddCard">
          <el-icon><Plus /></el-icon> 添加卡片
        </el-button>
      </div>

      <div class="cards-list" v-if="Array.isArray(options.cards) && options.cards.length">
        <div
          v-for="(card, idx) in options.cards"
          :key="idx"
          class="promo-card-item"
        >
          <!-- 顶部序号与工具按钮 -->
          <div class="card-header">
            <span class="card-idx-badge">卡片 {{ idx + 1 }}{{ card.title ? ` · ${card.title}` : '' }}</span>
            <div class="card-actions">
              <el-button
                link
                size="small"
                :disabled="idx === 0"
                @click="moveCard(idx, -1)"
                title="上移"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                :disabled="idx === options.cards.length - 1"
                @click="moveCard(idx, 1)"
                title="下移"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="options.cards.splice(idx, 1)"
                title="删除卡片"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 卡片属性输入 -->
          <div class="card-inputs">
            <!-- 标题行 -->
            <div class="input-row">
              <span class="field-label">主标题</span>
              <el-input v-model="card.title" size="small" placeholder="如：限时秒杀" clearable />
            </div>

            <!-- 副标题行 -->
            <div class="input-row">
              <span class="field-label">副标题</span>
              <el-input v-model="card.subtitle" size="small" placeholder="如：抢券立减50元 · 爆款直降" clearable />
            </div>

            <!-- 卡片底图 (图片选择器) -->
            <div class="input-row">
              <span class="field-label">卡片底图</span>
              <div class="picker-flex-wrap">
                <!-- 缩略图预览与快捷替换 -->
                <div
                  class="thumb-preview-box"
                  @click="handleSelectImage(card)"
                  :title="card.bgImg ? '点击更换底图' : '点击上传底图'"
                >
                  <template v-if="card.bgImg">
                    <img :src="card.bgImg" alt="底图" class="preview-img" />
                    <span class="thumb-clear-btn" @click.stop="card.bgImg = ''" title="清除图片">
                      <el-icon><Close /></el-icon>
                    </span>
                  </template>
                  <template v-else>
                    <el-icon class="thumb-empty-icon"><Picture /></el-icon>
                    <span class="thumb-empty-tip">选图</span>
                  </template>
                </div>

                <!-- URL 输入框与选择图片按钮 -->
                <div class="input-with-action">
                  <el-input
                    v-model="card.bgImg"
                    size="small"
                    placeholder="底图 URL，可直接粘贴或选择"
                    clearable
                  />
                  <el-button
                    size="small"
                    class="action-picker-btn"
                    @click="handleSelectImage(card)"
                  >
                    <el-icon class="mr-4"><Picture /></el-icon>
                    <span>选择图片</span>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 跳转链接 (链接选择器) -->
            <div class="input-row">
              <span class="field-label">跳转链接</span>
              <div class="link-picker-wrap">
                <el-input
                  v-model="card.url"
                  size="small"
                  placeholder="跳转链接（如 /goodsList?seckill=1）"
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
                  @click="handleSelectLink(card)"
                >
                  <el-icon class="mr-4"><Link /></el-icon>
                  <span>选择链接</span>
                </el-button>
              </div>
              <div class="link-current-tag" v-if="card.url">
                <span class="tag-label">当前链接:</span>
                <span class="tag-val" :title="card.url">{{ card.url }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-cards-tip" v-else>
        <span>暂无活动卡片，请点击上方“添加卡片”</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { Plus, Delete, Link, Picture, Close, Top, Bottom } from '@element-plus/icons-vue';
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
const openLinkPicker = inject('openLinkPicker', null);

// 1. 选择卡片背景图片
function handleSelectImage(card) {
  if (openImagePicker) {
    openImagePicker((url) => {
      if (url) card.bgImg = url;
    });
  } else {
    ElMessageBox.prompt('请输入卡片背景图 URL 地址：', '选择卡片底图', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: card.bgImg || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '图片地址不能为空'
    })
      .then(({ value }) => {
        card.bgImg = value.trim();
      })
      .catch(() => {});
  }
}

// 2. 选择跳转链接
function handleSelectLink(card) {
  if (openLinkPicker) {
    openLinkPicker(({ url, title, raw }) => {
      if (url) card.url = url;
      if (!card.title && title) {
        card.title = title;
      }
    });
  } else {
    ElMessageBox.prompt('请输入跳转链接（如 /goodsList?seckill=1 或完整网址）：', '设置跳转链接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: card.url || '',
      inputPattern: /^\S+$/,
      inputErrorMessage: '链接不能为空'
    })
      .then(({ value }) => {
        card.url = value.trim();
      })
      .catch(() => {});
  }
}

// 3. 上移/下移卡片
function moveCard(index, direction) {
  const newIdx = index + direction;
  if (!Array.isArray(props.options.cards)) return;
  if (newIdx < 0 || newIdx >= props.options.cards.length) return;
  const temp = props.options.cards[index];
  props.options.cards[index] = props.options.cards[newIdx];
  props.options.cards[newIdx] = temp;
}

// 4. 添加卡片
function handleAddCard() {
  if (!Array.isArray(props.options.cards)) props.options.cards = [];
  props.options.cards.push({
    title: '大促专场',
    subtitle: '限量特惠抢购',
    bgImg: '',
    url: '/goodsList'
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
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .promo-card-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #edf2f7;

        .card-idx-badge {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .card-inputs {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .input-row {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .field-label {
            font-size: 11px;
            font-weight: 500;
            color: #64748b;
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
              border-color: #409EFF;
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

          .input-with-action {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 6px;

            .action-picker-btn {
              flex-shrink: 0;
              padding: 0 10px;
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
              color: #409EFF;

              &:hover {
                background: #409EFF;
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
          padding: 2px 8px;
          margin-top: 2px;
          overflow: hidden;

          .tag-label {
            color: #3b82f6;
            flex-shrink: 0;
            font-weight: 500;
          }

          .tag-val {
            color: #1e40af;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: monospace;
          }
        }
      }
    }
  }

  .empty-cards-tip {
    text-align: center;
    padding: 20px;
    color: #94a3b8;
    font-size: 12px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
  }

  .mr-4 {
    margin-right: 4px;
  }
}
</style>
