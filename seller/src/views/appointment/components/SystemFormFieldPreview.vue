<template>
  <div class="field-preview" :class="{ 'is-inline': isInlineOptions }">
    <template v-if="field.field_type === 'RICH_TEXT'">
      <div class="rich-preview" v-html="$filters.xssFilter(field.rich_text_content) || '富文本说明'" />
    </template>
    <template v-else>
      <div class="field-label">
        <span v-if="field.required" class="required">*</span>
        <span class="label-text">{{ field.field_label }}</span>
      </div>
      <div
        v-if="field.field_type === 'CHECKBOX'"
        class="preview-options preview-options-end"
        :class="{ 'is-stack': optionListStacked }"
      >
        <div class="opt-pack">
          <div v-for="opt in field.options" :key="opt.value" class="opt-item">
            <span class="fake-checkbox" />
            <span class="opt-text">{{ opt.label }}</span>
          </div>
        </div>
      </div>
      <div
        v-else-if="field.field_type === 'RADIO'"
        class="preview-options preview-options-end"
        :class="{ 'is-stack': optionListStacked }"
      >
        <div class="opt-pack">
          <div v-for="(opt, idx) in field.options" :key="opt.value" class="opt-item">
            <span class="fake-radio" :class="{ 'is-checked': idx === field.default_option_index }" />
            <span class="opt-text">{{ opt.label }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="field.field_type === 'SELECT'" class="city-row">
        <span class="city-hint">{{ field.hint_text || "请选择" }}</span>
        <span class="arrow">›</span>
      </div>
      <div v-else-if="field.field_type === 'CITY'" class="city-row">
        <span class="city-hint">{{ field.hint_text || "请选择" }}</span>
        <span class="arrow">›</span>
      </div>
      <div v-else-if="field.field_type === 'DATE'" class="city-row">
        <span :class="['city-hint', { 'is-value': !!singleDefault }]">
          {{ singleDefault || field.hint_text || "请选择" }}
        </span>
        <span class="arrow">›</span>
      </div>
      <div v-else-if="field.field_type === 'TIME'" class="city-row">
        <span :class="['city-hint', { 'is-value': !!singleDefault }]">
          {{ singleDefault || field.hint_text || "请选择" }}
        </span>
        <span class="arrow">›</span>
      </div>
      <div v-else-if="field.field_type === 'DATE_RANGE'" class="city-row">
        <span :class="['city-hint', { 'is-value': !!(rangeStart && rangeEnd) }]">
          {{ dateRangeText }}
        </span>
        <span class="arrow">›</span>
      </div>
      <div v-else-if="field.field_type === 'TIME_RANGE'" class="range-row">
        <div class="picker-row">
          <span :class="['picker-text', { 'is-placeholder': !rangeStart }]">
            {{ rangeStart || "开始时间" }}
          </span>
        </div>
        <span class="range-sep">至</span>
        <div class="picker-row">
          <span :class="['picker-text', { 'is-placeholder': !rangeEnd }]">
            {{ rangeEnd || "结束时间" }}
          </span>
        </div>
      </div>
      <div v-else-if="field.field_type === 'IMAGE'" class="image-row">
        <div v-for="n in imageSlotCount" :key="n" class="image-add">+</div>
      </div>
      <div v-else-if="field.field_type === 'TEXT'" class="city-row text-value-row">
        <span :class="['city-hint', { 'is-value': !!field.default_value }]">
          {{ field.default_value || field.hint_text || "请填写" }}
        </span>
      </div>
      <div v-else class="text-box">
        <span :class="{ 'is-placeholder': !field.default_value }">
          {{ field.default_value || field.hint_text || "请填写" }}
        </span>
      </div>
    </template>
  </div>
</template>

<script>
function pad(n) {
  return String(n).padStart(2, "0");
}

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowTimeText() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default {
  name: "SystemFormFieldPreview",
  props: {
    field: { type: Object, required: true },
  },
  computed: {
    isInlineOptions() {
      return [
        "CHECKBOX",
        "RADIO",
        "CITY",
        "DATE",
        "DATE_RANGE",
        "SELECT",
        "TEXT",
        "TIME",
        "TIME_RANGE",
      ].includes(this.field.field_type);
    },
    imageSlotCount() {
      const n = Number(this.field.max_upload_count);
      return Math.min(10, Math.max(1, Number.isFinite(n) ? n : 1));
    },
    optionListStacked() {
      // 一行放不下两个选项时改为纵向堆叠
      const labels = (this.field.options || []).map((item) => item.label || "");
      if (labels.length < 2) return false;
      const itemWidth = (text) => 24 + Array.from(text).length * 14;
      const available = 230;
      for (let i = 0; i < labels.length; i += 2) {
        const next = labels[i + 1];
        if (next == null) break;
        if (itemWidth(labels[i]) + 12 + itemWidth(next) > available) {
          return true;
        }
      }
      return false;
    },
    showDefault() {
      return this.field.default_visibility === "SHOW";
    },
    singleDefault() {
      if (!this.showDefault) return "";
      if (this.field.field_type === "DATE") {
        return this.field.default_date_mode === "SPECIFIED_DATE"
          ? this.field.default_date
          : todayText();
      }
      return this.field.default_time_mode === "SPECIFIED_TIME"
        ? this.field.default_time
        : nowTimeText();
    },
    dateRangeText() {
      if (this.rangeStart && this.rangeEnd) {
        return `${this.rangeStart} - ${this.rangeEnd}`;
      }
      return this.field.hint_text || "请选择";
    },
    rangeStart() {
      if (!this.showDefault) return "";
      if (this.field.field_type === "DATE_RANGE") {
        return this.field.default_date_mode === "SPECIFIED_DATE"
          ? this.field.default_date_start
          : todayText();
      }
      return this.field.default_time_mode === "SPECIFIED_TIME"
        ? this.field.default_time_start
        : nowTimeText();
    },
    rangeEnd() {
      if (!this.showDefault) return "";
      if (this.field.field_type === "DATE_RANGE") {
        return this.field.default_date_mode === "SPECIFIED_DATE"
          ? this.field.default_date_end
          : todayText();
      }
      return this.field.default_time_mode === "SPECIFIED_TIME"
        ? this.field.default_time_end
        : nowTimeText();
    },
  },
};
</script>

<style scoped>
.field-preview {
  pointer-events: none; /* 画布只展示，不可填 */
  user-select: none;
}
.field-preview.is-inline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.field-label {
  font-size: 14px;
  margin-bottom: 8px;
  color: #303133;
  display: flex;
  align-items: flex-start;
}
.label-text {
  display: inline-block;
  max-width: 6em; /* 标题每行最多六字 */
  word-break: break-all;
  overflow-wrap: anywhere;
  line-height: 22px;
}
.is-inline .field-label {
  flex: 0 0 auto;
  margin-bottom: 0;
  line-height: 22px;
  padding-top: 0;
  white-space: normal;
}
.is-inline .picker-row {
  flex: 1;
  min-width: 0;
}
.is-inline .range-row {
  flex: 1;
  min-width: 0;
}
.is-inline .text-box {
  flex: 1;
  min-width: 0;
}
.is-inline .city-row {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 4px;
}
.is-inline .text-value-row .city-hint {
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-break: break-all;
  overflow-wrap: anywhere;
  text-align: right;
  line-height: 22px;
}
.required {
  color: #f56c6c;
  margin-right: 2px;
}
.preview-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.is-inline .preview-options {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.is-inline .preview-options-end {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  grid-template-columns: none;
}
.opt-pack {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 12px;
}
.is-stack .opt-pack {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  width: max-content;
}
.opt-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #303133;
  font-size: 14px;
}
.opt-text {
  white-space: nowrap;
}
.fake-checkbox,
.fake-radio {
  flex-shrink: 0;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  background: #fff;
}
.fake-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}
.fake-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.fake-radio.is-checked {
  border-color: var(--el-color-primary);
  background: radial-gradient(circle, var(--el-color-primary) 0 5px, #fff 6px);
}
.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  flex: 1;
  min-width: 0;
}
.picker-text {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.is-placeholder {
  color: #c0c4cc;
}
.arrow {
  color: #c0c4cc;
  font-size: 18px;
  line-height: 1;
  margin-left: 8px;
}
.city-hint {
  color: #c0c4cc;
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
}
.city-hint.is-value {
  color: #303133;
}
.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range-sep {
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
}
.text-box {
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  color: #303133;
  line-height: 20px;
}
.image-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
}
.image-add {
  width: 64px;
  height: 64px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  color: #909399;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rich-preview {
  font-size: 13px;
  color: #606266;
  min-height: 24px;
  word-break: break-word;
}
</style>
