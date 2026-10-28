<template>
  <div class="box-model-field">
    <div class="field-header">
      <span class="field-title">{{ label }}</span>
      <el-tooltip :content="linked ? '点击解除四向联动' : '点击开启四向联动'" placement="top">
        <button
          type="button"
          class="link-btn"
          :class="{ active: linked }"
          @click="toggleLinked"
        >
          <el-icon :size="14">
            <Link v-if="linked" />
            <Paperclip v-else />
          </el-icon>
          <span class="link-text">{{ linked ? '已联动' : '独立' }}</span>
        </button>
      </el-tooltip>
    </div>

    <!-- 4-directional inputs -->
    <div class="field-inputs">
      <div
        v-for="dir in directions"
        :key="dir.key"
        class="input-item"
        :class="dir.key"
      >
        <span class="dir-tag">{{ dir.label }}</span>
        <el-input-number
          :model-value="values[dir.index]"
          :min="min"
          :max="max"
          :step="step"
          size="small"
          controls-position="right"
          class="num-input"
          @update:model-value="val => onValueChange(dir.index, val)"
        />
        <span class="unit">px</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Link, Paperclip } from '@element-plus/icons-vue';

const props = defineProps({
  label: {
    type: String,
    default: '边距设置'
  },
  modelValue: {
    type: Array,
    default: () => [0, 0, 0, 0]
  },
  mode: {
    type: String,
    default: 'box' // 'box' (上下左右) or 'corner' (左上、右上、右下、左下)
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 500
  },
  step: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Check if initial 4 values are all equal
const isAllEqual = arr => {
  if (!Array.isArray(arr) || arr.length < 4) return true;
  return arr[0] === arr[1] && arr[1] === arr[2] && arr[2] === arr[3];
};

const linked = ref(false);

const values = computed(() => {
  const v = props.modelValue;
  if (!Array.isArray(v) || v.length < 4) {
    return [0, 0, 0, 0];
  }
  return v.map(n => (typeof n === 'number' && !isNaN(n) ? n : 0));
});

const directions = computed(() => {
  if (props.mode === 'corner') {
    return [
      { key: 'top-left', label: '左上', index: 0 },
      { key: 'top-right', label: '右上', index: 1 },
      { key: 'bottom-right', label: '右下', index: 2 },
      { key: 'bottom-left', label: '左下', index: 3 }
    ];
  }
  return [
    { key: 'top', label: '上', index: 0 },
    { key: 'right', label: '右', index: 1 },
    { key: 'bottom', label: '下', index: 2 },
    { key: 'left', label: '左', index: 3 }
  ];
});

function toggleLinked() {
  linked.value = !linked.value;
  if (linked.value) {
    // When linking, sync all to the first value
    const firstVal = values.value[0];
    const newArr = [firstVal, firstVal, firstVal, firstVal];
    emit('update:modelValue', newArr);
    emit('change', newArr);
  }
}

function onValueChange(index, val) {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  let newArr;
  if (linked.value) {
    newArr = [num, num, num, num];
  } else {
    newArr = [...values.value];
    newArr[index] = num;
  }
  emit('update:modelValue', newArr);
  emit('change', newArr);
}
</script>

<style lang="scss" scoped>
.box-model-field {
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;

  .field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .field-title {
      font-size: 13px;
      font-weight: 500;
      color: #334155;
    }

    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      font-size: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #3b82f6;
        color: #3b82f6;
      }

      &.active {
        background: #eff6ff;
        border-color: #3b82f6;
        color: #2563eb;
        font-weight: 500;
      }
    }
  }

  .field-inputs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .input-item {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 3px 6px;
      gap: 4px;

      .dir-tag {
        font-size: 11px;
        color: #94a3b8;
        min-width: 22px;
      }

      .num-input {
        flex: 1;
        width: 100%;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          padding: 0 4px;
          background: transparent;
        }

        :deep(.el-input__inner) {
          text-align: center;
          font-size: 12px;
          color: #1e293b;
        }
      }

      .unit {
        font-size: 11px;
        color: #94a3b8;
      }
    }
  }
}
</style>
