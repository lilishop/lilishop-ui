<template>
  <div class="row-config-panel" v-if="row">
    <!-- 1. 行位置 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandOrder = !expandOrder">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandOrder }"><ArrowRight /></el-icon>
          <span class="header-title">行位置</span>
          <el-tooltip content="调整当前行在整个页面中的上下层级与排序" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="collapse-body" v-show="expandOrder">
        <!-- 上行：第 X 行 / 共 Y 行 + 置顶、置底 -->
        <div class="row-order-top">
          <div class="order-text-wrap">
            <div class="main-row-idx">第 {{ rowIndex + 1 }} 行</div>
            <div class="total-row-idx">共 {{ totalRows }} 行</div>
          </div>
          <div class="order-btns">
            <el-button
              size="small"
              class="pos-btn"
              :disabled="isFirst"
              @click="emit('move-top')"
            >
              置顶
            </el-button>
            <el-button
              size="small"
              class="pos-btn"
              :disabled="isLast"
              @click="emit('move-bottom')"
            >
              置底
            </el-button>
          </div>
        </div>

        <!-- 下行：行切换下拉选择框 -->
        <div class="row-select-wrap">
          <el-select
            :model-value="rowIndex"
            @update:model-value="val => emit('move-to-row', val)"
            size="small"
            class="full-select"
          >
            <el-option
              v-for="(_, i) in totalRows"
              :key="i"
              :value="i"
              :label="`第 ${i + 1} 行`"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 2. 盒模型 -->
    <div class="setting-collapse-card">
      <div class="collapse-header" @click="expandBox = !expandBox">
        <div class="header-left">
          <el-icon class="arrow-icon" :class="{ 'is-expanded': expandBox }"><ArrowRight /></el-icon>
          <span class="header-title">盒模型</span>
          <el-tooltip content="设置当前行的宽度、高度、间距、内外边距与圆角" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="collapse-body" v-show="expandBox">
        <!-- 3 列尺寸输入：宽度、高度、行内间距 -->
        <div class="box-dimension-grid">
          <div class="dimension-item">
            <span class="dim-label">宽度</span>
            <input
              type="text"
              v-model="row.rowStyle.width"
              class="dim-input"
              placeholder="1920"
            />
          </div>
          <div class="dimension-item">
            <span class="dim-label">高度</span>
            <input
              type="text"
              v-model="row.rowStyle.height"
              class="dim-input"
              placeholder="默认"
            />
          </div>
          <div class="dimension-item">
            <span class="dim-label">行内间距</span>
            <input
              type="text"
              v-model="row.rowStyle.gap"
              class="dim-input"
              placeholder="0"
            />
          </div>
        </div>

        <!-- 可视化嵌套盒模型 (外边距 + 内边距 + 圆角) -->
        <div class="box-model-section">
          <nested-box-model
            :key="props.row?.id || props.row?.key || 'row'"
            :margin="row.rowStyle.margin"
            :padding="row.rowStyle.padding"
            :radius="row.rowStyle.radius"
            :show-radius="true"
            @update:margin="val => row.rowStyle.margin = val"
            @update:padding="val => row.rowStyle.padding = val"
            @update:radius="val => row.rowStyle.radius = val"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-panel">
    请在画布中选中一行以进行行配置
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowRight, QuestionFilled } from '@element-plus/icons-vue';
import NestedBoxModel from '../controls/NestedBoxModel.vue';

const props = defineProps({
  row: {
    type: Object,
    default: null
  },
  rowIndex: {
    type: Number,
    default: 0
  },
  totalRows: {
    type: Number,
    default: 0
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'move-up',
  'move-down',
  'move-top',
  'move-bottom',
  'move-to-row',
  'delete-row'
]);

const expandOrder = ref(true);
const expandBox = ref(true);
</script>

<style lang="scss" scoped>
.row-config-panel {
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

      /* 1. 行位置 */
      .row-order-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .order-text-wrap {
          display: flex;
          flex-direction: column;

          .main-row-idx {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
          }

          .total-row-idx {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
          }
        }

        .order-btns {
          display: flex;
          gap: 8px;

          .pos-btn {
            padding: 0 14px;
            height: 28px;
            border-radius: 4px;
            font-size: 12px;
            color: #4b5563;
            background: #ffffff;
            border: 1px solid #d1d5db;

            &:hover {
              color: #ff6a00;
              border-color: #ff6a00;
            }

            &:disabled {
              color: #9ca3af;
              border-color: #e5e7eb;
              background: #f9fafb;
            }
          }
        }
      }

      .row-select-wrap {
        width: 100%;
        .full-select {
          width: 100%;
        }
      }

      /* 2. 盒模型 3 列尺寸 */
      .box-dimension-grid {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;

        .dimension-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;

          .dim-label {
            font-size: 12px;
            color: #4b5563;
          }

          .dim-input {
            width: 100%;
            height: 28px;
            line-height: 26px;
            background: #ffffff;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            text-align: center;
            font-size: 12px;
            color: #303133;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s;

            &:focus {
              border-color: #ff6a00;
              box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.1);
            }
          }
        }
      }

      .box-model-section {
        margin-top: 10px;
      }

      /* 3. 背景设置 */
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
