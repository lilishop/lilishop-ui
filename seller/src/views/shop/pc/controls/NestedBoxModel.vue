<template>
  <div class="nested-box-model-control">
    <!-- 外层: 外边距 (Margin) -->
    <div class="outer-box-wrapper">
      <div class="box-header-row">
        <span class="box-tag tag-orange">外边距</span>
        <div class="link-toggle">
          <span class="link-label">联动</span>
          <el-switch v-model="marginLinked" size="small" />
        </div>
      </div>

      <!-- 外边距 4 向输入框 -->
      <input
        type="text"
        v-model="localMargin[0]"
        @input="onMarginChange(0, $event.target.value)"
        class="num-input pos-top"
        title="外边距-上"
      />
      <input
        type="text"
        v-model="localMargin[1]"
        @input="onMarginChange(1, $event.target.value)"
        class="num-input pos-right"
        title="外边距-右"
      />
      <input
        type="text"
        v-model="localMargin[2]"
        @input="onMarginChange(2, $event.target.value)"
        class="num-input pos-bottom"
        title="外边距-下"
      />
      <input
        type="text"
        v-model="localMargin[3]"
        @input="onMarginChange(3, $event.target.value)"
        class="num-input pos-left"
        title="外边距-左"
      />

      <!-- 内层: 内边距 (Padding) -->
      <div class="inner-box-wrapper">
        <div class="box-header-row">
          <span class="box-tag tag-green">内边距</span>
          <div class="link-toggle">
            <span class="link-label">联动</span>
            <el-switch v-model="paddingLinked" size="small" />
          </div>
        </div>

        <!-- 内边距 4 向输入框 -->
        <input
          type="text"
          v-model="localPadding[0]"
          @input="onPaddingChange(0, $event.target.value)"
          class="num-input pos-top"
          title="内边距-上"
        />
        <input
          type="text"
          v-model="localPadding[1]"
          @input="onPaddingChange(1, $event.target.value)"
          class="num-input pos-right"
          title="内边距-右"
        />
        <input
          type="text"
          v-model="localPadding[2]"
          @input="onPaddingChange(2, $event.target.value)"
          class="num-input pos-bottom"
          title="内边距-下"
        />
        <input
          type="text"
          v-model="localPadding[3]"
          @input="onPaddingChange(3, $event.target.value)"
          class="num-input pos-left"
          title="内边距-左"
        />

        <!-- 中心参考方块 -->
        <div class="box-center-core"></div>
      </div>
    </div>

    <!-- 圆角 border-radius -->
    <div class="radius-control-card" v-if="showRadius">
      <div class="radius-header">
        <span class="radius-title">圆角 border-radius</span>
        <div class="link-toggle">
          <span class="link-label">联动</span>
          <el-switch v-model="radiusLinked" size="small" />
        </div>
      </div>

      <div class="radius-grid">
        <!-- 左列: 左上、左下 -->
        <div class="radius-col">
          <div class="radius-item">
            <span class="item-label">左上</span>
            <input
              type="text"
              v-model="localRadius[0]"
              @input="onRadiusChange(0, $event.target.value)"
              class="num-input"
            />
          </div>
          <div class="radius-item">
            <span class="item-label">左下</span>
            <input
              type="text"
              v-model="localRadius[3]"
              @input="onRadiusChange(3, $event.target.value)"
              class="num-input"
            />
          </div>
        </div>

        <!-- 中间预览方块 -->
        <div class="radius-preview-wrap">
          <div class="radius-preview-box" :style="radiusPreviewStyle"></div>
        </div>

        <!-- 右列: 右上、右下 -->
        <div class="radius-col">
          <div class="radius-item">
            <span class="item-label">右上</span>
            <input
              type="text"
              v-model="localRadius[1]"
              @input="onRadiusChange(1, $event.target.value)"
              class="num-input"
            />
          </div>
          <div class="radius-item">
            <span class="item-label">右下</span>
            <input
              type="text"
              v-model="localRadius[2]"
              @input="onRadiusChange(2, $event.target.value)"
              class="num-input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  margin: {
    type: Array,
    default: () => [0, 0, 0, 0]
  },
  padding: {
    type: Array,
    default: () => [0, 0, 0, 0]
  },
  radius: {
    type: Array,
    default: () => [0, 0, 0, 0]
  },
  showRadius: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:margin', 'update:padding', 'update:radius', 'change']);

// 联动开关：默认关闭
const marginLinked = ref(false);
const paddingLinked = ref(false);
const radiusLinked = ref(false);

watch(marginLinked, val => {
  if (val) {
    const v = localMargin.value[0] || 0;
    localMargin.value = [v, v, v, v];
    emit('update:margin', [...localMargin.value]);
    emit('change', { type: 'margin', value: [...localMargin.value] });
  }
});

watch(paddingLinked, val => {
  if (val) {
    const v = localPadding.value[0] || 0;
    localPadding.value = [v, v, v, v];
    emit('update:padding', [...localPadding.value]);
    emit('change', { type: 'padding', value: [...localPadding.value] });
  }
});

watch(radiusLinked, val => {
  if (val) {
    const v = localRadius.value[0] || 0;
    localRadius.value = [v, v, v, v];
    emit('update:radius', [...localRadius.value]);
    emit('change', { type: 'radius', value: [...localRadius.value] });
  }
});

const localMargin = ref([...(props.margin || [0, 0, 0, 0])]);
const localPadding = ref([...(props.padding || [0, 0, 0, 0])]);
const localRadius = ref([...(props.radius || [0, 0, 0, 0])]);

watch(
  () => props.margin,
  val => {
    if (Array.isArray(val) && val.length >= 4) {
      localMargin.value = [...val];
    }
  },
  { deep: true }
);

watch(
  () => props.padding,
  val => {
    if (Array.isArray(val) && val.length >= 4) {
      localPadding.value = [...val];
    }
  },
  { deep: true }
);

watch(
  () => props.radius,
  val => {
    if (Array.isArray(val) && val.length >= 4) {
      localRadius.value = [...val];
    }
  },
  { deep: true }
);

function parseNum(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}

function onMarginChange(index, rawVal) {
  const num = parseNum(rawVal);
  if (marginLinked.value) {
    localMargin.value = [num, num, num, num];
  } else {
    localMargin.value[index] = num;
  }
  emit('update:margin', [...localMargin.value]);
  emit('change', { type: 'margin', value: [...localMargin.value] });
}

function onPaddingChange(index, rawVal) {
  const num = parseNum(rawVal);
  if (paddingLinked.value) {
    localPadding.value = [num, num, num, num];
  } else {
    localPadding.value[index] = num;
  }
  emit('update:padding', [...localPadding.value]);
  emit('change', { type: 'padding', value: [...localPadding.value] });
}

function onRadiusChange(index, rawVal) {
  const num = parseNum(rawVal);
  if (radiusLinked.value) {
    localRadius.value = [num, num, num, num];
  } else {
    localRadius.value[index] = num;
  }
  emit('update:radius', [...localRadius.value]);
  emit('change', { type: 'radius', value: [...localRadius.value] });
}

const radiusPreviewStyle = computed(() => {
  const r = localRadius.value;
  return {
    borderTopLeftRadius: `${r[0] || 0}px`,
    borderTopRightRadius: `${r[1] || 0}px`,
    borderBottomRightRadius: `${r[2] || 0}px`,
    borderBottomLeftRadius: `${r[3] || 0}px`
  };
});
</script>

<style lang="scss" scoped>
.nested-box-model-control {
  width: 100%;
  box-sizing: border-box;

  .num-input {
    width: 42px;
    height: 24px;
    line-height: 22px;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
    color: #303133;
    outline: none;
    box-sizing: border-box;
    padding: 0;
    transition: all 0.2s;

    &:focus {
      border-color: #ff6a00;
      box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.1);
    }
  }

  .box-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 2px;
    z-index: 2;

    .box-tag {
      font-size: 12px;
      font-weight: 600;

      &.tag-orange {
        color: #ff6a00;
      }

      &.tag-green {
        color: #52c41a;
      }
    }

    .link-toggle {
      display: flex;
      align-items: center;
      gap: 6px;

      .link-label {
        font-size: 12px;
        color: #606266;
      }
    }
  }

  /* 外层容器: 外边距 */
  .outer-box-wrapper {
    position: relative;
    background: #fffaf5;
    border: 1px dashed #ffd8bf;
    border-radius: 8px;
    padding: 8px 10px 10px;
    box-sizing: border-box;
    width: 100%;
    min-height: 190px;

    .pos-top {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
    }

    .pos-bottom {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
    }

    .pos-left {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
    }

    .pos-right {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
    }
  }

  /* 内层容器: 内边距 */
  .inner-box-wrapper {
    position: relative;
    background: #f6ffed;
    border: 1px dashed #b7eb8f;
    border-radius: 6px;
    margin: 28px 40px;
    padding: 6px 8px 8px;
    box-sizing: border-box;
    min-height: 110px;

    .pos-top {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
    }

    .pos-bottom {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
    }

    .pos-left {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 4;
    }

    .pos-right {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 4;
    }

    .box-center-core {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      border: 1px dashed #91caff;
      background: #e6f4ff;
      border-radius: 4px;
    }
  }

  /* 圆角卡片 */
  .radius-control-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
    background: #ffffff;
    box-sizing: border-box;

    .radius-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .radius-title {
        font-size: 12px;
        font-weight: 600;
        color: #303133;
      }

      .link-toggle {
        display: flex;
        align-items: center;
        gap: 6px;

        .link-label {
          font-size: 12px;
          color: #606266;
        }
      }
    }

    .radius-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .radius-col {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .radius-item {
          display: flex;
          align-items: center;
          gap: 6px;

          .item-label {
            font-size: 12px;
            color: #909399;
            width: 26px;
          }
        }
      }

      .radius-preview-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;

        .radius-preview-box {
          width: 44px;
          height: 44px;
          border: 2px solid #409eff;
          background: #fdfdfd;
          box-sizing: border-box;
          transition: border-radius 0.2s;
        }
      }
    }
  }
}
</style>
