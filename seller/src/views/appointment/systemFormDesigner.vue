<template>
  <div class="form-designer" v-loading="loading">
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <span class="current-page">表单名称：</span>
        <el-input
          v-model="formName"
          class="form-name-input"
          maxlength="40"
          placeholder="请输入表单名称"
        />
      </div>
      <div class="toolbar-right">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存并发布</el-button>
      </div>
    </div>

    <div class="designer-body">
      <aside class="palette">
        <div class="panel-title">组件</div>
        <div class="palette-grid">
          <button
            v-for="item in palette"
            :key="item.type"
            type="button"
            class="palette-item"
            @click="addField(item.type)"
          >
            <el-icon class="palette-icon" :size="16">
              <component :is="paletteIcons[item.type]" />
            </el-icon>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </aside>

      <section class="canvas-wrap">
        <div class="phone">
          <div class="phone-bar">{{ formName || "标题" }}</div>
          <div
            v-for="(field, index) in fields"
            :key="field.field_key"
            class="canvas-item"
            :class="{ 'is-selected': selectedKey === field.field_key }"
            @click="selectedKey = field.field_key"
          >
            <div class="canvas-item-body">
              <system-form-field-preview :field="field" />
            </div>
            <div v-if="selectedKey === field.field_key" class="item-actions" @click.stop>
              <button type="button" title="删除" @click="removeField(index)">
                <el-icon><Delete /></el-icon>
              </button>
              <button type="button" title="复制" @click="copyField(index)">
                <el-icon><CopyDocument /></el-icon>
              </button>
              <button type="button" title="上移" :disabled="index === 0" @click="moveField(index, -1)">
                <el-icon><ArrowUp /></el-icon>
              </button>
              <button
                type="button"
                title="下移"
                :disabled="index === fields.length - 1"
                @click="moveField(index, 1)"
              >
                <el-icon><ArrowDown /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="props-panel">
        <template v-if="selected">
          <div class="panel-title">{{ fieldTypeLabel(selected.field_type) }}</div>
          <el-form label-width="88px" label-position="left" class="props-form">
            <el-form-item v-if="selected.field_type !== 'RICH_TEXT'" label="标题">
              <el-input v-model="selected.field_label" :maxlength="FIELD_LABEL_MAX" show-word-limit />
            </el-form-item>
            <el-form-item v-if="hasOptions(selected.field_type)" label="选项">
              <div class="option-list">
                <div
                  v-for="(opt, oi) in selected.options"
                  :key="opt.value"
                  class="option-row"
                >
                  <el-input
                    v-model="opt.label"
                    :maxlength="OPTION_LABEL_MAX"
                    :placeholder="oi >= 2 ? '选填，不超过十个字' : '选项文案'"
                  />
                  <el-button
                    v-if="oi >= 2"
                    link
                    type="danger"
                    :icon="Delete"
                    @click="selected.options = removeOption(selected.options, oi)"
                  />
                </div>
                <div class="option-actions">
                  <el-button
                    class="option-action-btn"
                    :disabled="(selected.options || []).length >= OPTION_MAX"
                    @click="selected.options = addOption(selected.options, { radio: selected.field_type === 'RADIO' })"
                  >添加单个选项</el-button>
                  <span class="option-action-btn">
                    <el-popover
                      v-model:visible="batchVisible"
                      placement="bottom"
                      :width="280"
                      trigger="click"
                      :disabled="(selected.options || []).length >= OPTION_MAX"
                    >
                      <template #reference>
                        <el-button :disabled="(selected.options || []).length >= OPTION_MAX">
                          批量添加选项
                        </el-button>
                      </template>
                      <div class="batch-title">批量添加选项</div>
                      <p class="batch-hint">可按回车键添加多个选项</p>
                      <el-input v-model="batchText" type="textarea" :rows="6" />
                      <div class="batch-footer">
                        <el-button @click="closeBatch">取消</el-button>
                        <el-button type="primary" @click="confirmBatch">确定</el-button>
                      </div>
                    </el-popover>
                  </span>
                </div>
              </div>
            </el-form-item>

            <el-form-item v-if="selected.field_type === 'CITY'" label="默认值">
              <el-radio-group v-model="selected.city_level">
                <el-radio value="PROVINCE_CITY">省市</el-radio>
                <el-radio value="PROVINCE_CITY_DISTRICT">省市区</el-radio>
                <el-radio value="PROVINCE_CITY_DISTRICT_STREET">省市区街道</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="selected.field_type === 'TEXT'" label="内容">
              <el-radio-group v-model="selected.content_type" class="content-type-group">
                <el-radio value="TEXT">文本</el-radio>
                <el-radio value="MOBILE">手机号</el-radio>
                <el-radio value="ID_CARD">身份证号</el-radio>
                <el-radio value="EMAIL">邮箱</el-radio>
                <el-radio value="NUMBER">数字</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="selected.field_type === 'TEXT'" label="默认值">
              <el-input v-model="selected.default_value" placeholder="请输入默认值" />
            </el-form-item>

            <template v-if="['DATE', 'DATE_RANGE', 'TIME', 'TIME_RANGE'].includes(selected.field_type)">
              <el-form-item label="默认值">
                <el-radio-group v-model="selected.default_visibility">
                  <el-radio value="SHOW">显示</el-radio>
                  <el-radio value="HIDE">隐藏</el-radio>
                </el-radio-group>
                <div v-if="selected.default_visibility === 'SHOW'" class="sub-radios">
                  <el-radio-group
                    v-if="selected.field_type === 'DATE' || selected.field_type === 'DATE_RANGE'"
                    v-model="selected.default_date_mode"
                  >
                    <el-radio value="CURRENT_DATE">当前日期</el-radio>
                    <el-radio value="SPECIFIED_DATE">指定日期</el-radio>
                  </el-radio-group>
                  <el-radio-group v-else v-model="selected.default_time_mode">
                    <el-radio value="CURRENT_TIME">当前时间</el-radio>
                    <el-radio value="SPECIFIED_TIME">指定时间</el-radio>
                  </el-radio-group>
                </div>
                <div
                  v-if="selected.default_visibility === 'SHOW' && selected.default_date_mode === 'SPECIFIED_DATE'"
                  class="sub-radios"
                >
                  <el-date-picker
                    v-if="selected.field_type === 'DATE'"
                    v-model="selected.default_date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="指定日期"
                    style="width: 100%"
                  />
                  <el-date-picker
                    v-else-if="selected.field_type === 'DATE_RANGE'"
                    v-model="dateRangeValue"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </div>
                <div
                  v-if="selected.default_visibility === 'SHOW' && selected.default_time_mode === 'SPECIFIED_TIME'"
                  class="sub-radios"
                >
                  <el-time-picker
                    v-if="selected.field_type === 'TIME'"
                    v-model="selected.default_time"
                    value-format="HH:mm"
                    format="HH:mm"
                    placeholder="指定时间"
                    style="width: 100%"
                  />
                  <el-time-picker
                    v-else-if="selected.field_type === 'TIME_RANGE'"
                    v-model="timeRangeValue"
                    is-range
                    value-format="HH:mm"
                    format="HH:mm"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 100%"
                  />
                </div>
              </el-form-item>
            </template>

            <el-form-item
              v-if="['CITY', 'DATE', 'DATE_RANGE', 'TIME', 'TIME_RANGE', 'TEXT'].includes(selected.field_type)"
              label="提示语"
            >
              <el-input
                v-model="selected.hint_text"
                :maxlength="HINT_TEXT_MAX"
                show-word-limit
              />
            </el-form-item>

            <el-form-item v-if="selected.field_type === 'IMAGE'" label="最多上传">
              <el-input-number
                v-model="selected.max_upload_count"
                :min="1"
                :max="10"
                controls-position="right"
              />
            </el-form-item>

            <div v-if="selected.field_type === 'RICH_TEXT'" class="rich-props">
              <div class="rich-props-label">富文本内容</div>
              <editor v-model="selected.rich_text_content" height="360px" :key="selected.field_key" />
            </div>

            <el-form-item v-if="hasRequiredSwitch(selected.field_type)" label="是否必填">
              <el-switch
                v-model="selected.required"
                class="required-switch"
                inline-prompt
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-form>
        </template>
      </aside>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Delete,
  ArrowUp,
  CopyDocument,
  Checked,
  Location,
  CircleCheck,
  Calendar,
  ArrowDown,
  EditPen,
  Clock,
  Timer,
  Document,
  Picture,
  Tickets,
} from "@element-plus/icons-vue";
import { getRequest, postRequestWithNoForm } from "@/libs/axios";
import editor from "@/views/lili-components/editor/index.vue";
import SystemFormFieldPreview from "./components/SystemFormFieldPreview.vue";
import {
  FORM_FIELD_PALETTE,
  FORM_FIELD_LABEL,
  OPTION_MAX,
  FIELD_LABEL_MAX,
  OPTION_LABEL_MAX,
  HINT_TEXT_MAX,
  createField,
  createFieldKey,
  parseFormSchema,
  serializeFormSchema,
  addOption,
  removeOption,
  batchAddOptions,
  hasRequiredSwitch,
  hasOptions,
} from "@/constants/systemForm";

export default {
  name: "appointmentSystemFormDesigner",
  components: { editor, SystemFormFieldPreview, Delete, CopyDocument, ArrowUp, ArrowDown },
  data() {
    return {
      loading: false,
      saving: false,
      formId: "",
      formName: "",
      fields: [],
      selectedKey: "",
      baseline: "",
      batchVisible: false,
      batchText: "",
      palette: FORM_FIELD_PALETTE,
      paletteIcons: {
        CHECKBOX: Checked,
        CITY: Location,
        RADIO: CircleCheck,
        DATE: Calendar,
        DATE_RANGE: Tickets,
        SELECT: ArrowDown,
        TEXT: EditPen,
        TIME: Clock,
        TIME_RANGE: Timer,
        RICH_TEXT: Document,
        IMAGE: Picture,
      },
      OPTION_MAX,
      FIELD_LABEL_MAX,
      OPTION_LABEL_MAX,
      HINT_TEXT_MAX,
      Delete,
    };
  },
  computed: {
    selected() {
      return this.fields.find((item) => item.field_key === this.selectedKey) || null;
    },
    dateRangeValue: {
      get() {
        const field = this.selected;
        if (!field) return null;
        return field.default_date_start && field.default_date_end
          ? [field.default_date_start, field.default_date_end]
          : null;
      },
      set(val) {
        if (!this.selected) return;
        this.selected.default_date_start = val?.[0] || null;
        this.selected.default_date_end = val?.[1] || null;
      },
    },
    timeRangeValue: {
      get() {
        const field = this.selected;
        if (!field) return null;
        return field.default_time_start && field.default_time_end
          ? [field.default_time_start, field.default_time_end]
          : null;
      },
      set(val) {
        if (!this.selected) return;
        this.selected.default_time_start = val?.[0] || null;
        this.selected.default_time_end = val?.[1] || null;
      },
    },
  },
  watch: {
    selectedKey() {
      this.closeBatch();
    },
  },
  mounted() {
    this.formId = this.$route.query.id || "";
    if (this.formId) {
      this.loadForm();
    } else {
      this.captureBaseline();
    }
  },
  methods: {
    addOption,
    removeOption,
    hasRequiredSwitch,
    hasOptions,
    fieldTypeLabel(type) {
      return FORM_FIELD_LABEL[type] || type;
    },
    captureBaseline() {
      this.baseline = JSON.stringify({
        formName: this.formName,
        fields: this.fields,
      });
    },
    loadForm() {
      this.loading = true;
      getRequest(`/appointment/system-forms/${this.formId}`)
        .then((res) => {
          if (!res.success || !res.result) {
            ElMessage.error("表单不存在");
            this.$router.push({ name: "appointment-system-forms" });
            return;
          }
          this.formName = res.result.formName || "";
          this.fields = parseFormSchema(res.result.formSchema);
          this.selectedKey = this.fields[0]?.field_key || "";
          this.captureBaseline();
        })
        .catch(() => {
          ElMessage.error("加载表单失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addField(type) {
      const field = createField(type);
      this.fields.push(field);
      this.selectedKey = field.field_key;
    },
    removeField(index) {
      this.fields.splice(index, 1);
      this.selectedKey = this.fields[index]?.field_key || this.fields[index - 1]?.field_key || "";
    },
    copyField(index) {
      const source = this.fields[index];
      if (!source) return;
      const cloned = JSON.parse(JSON.stringify(source));
      cloned.field_key = createFieldKey();
      if (Array.isArray(cloned.options)) {
        cloned.options = cloned.options.map((opt) => ({
          ...opt,
          value: createFieldKey(), // 避免与原字段共用 option value
        }));
      }
      this.fields.splice(index + 1, 0, cloned);
      this.selectedKey = cloned.field_key;
    },
    moveField(index, step) {
      const target = index + step;
      if (target < 0 || target >= this.fields.length) return;
      const list = [...this.fields];
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      this.fields = list;
    },
    closeBatch() {
      this.batchVisible = false;
      this.batchText = "";
    },
    confirmBatch() {
      if (!this.selected) return;
      this.selected.options = batchAddOptions(this.selected.options, this.batchText, {
        radio: this.selected.field_type === "RADIO",
      });
      this.closeBatch();
    },
    handleReset() {
      ElMessageBox.confirm("将撤销本次未保存的编辑，恢复进入页面时的内容？", "重置", {
        type: "warning",
      }).then(() => {
        const snap = JSON.parse(this.baseline || "{}");
        this.formName = snap.formName || "";
        this.fields = JSON.parse(JSON.stringify(snap.fields || []));
        this.selectedKey = this.fields[0]?.field_key || "";
      }).catch(() => {});
    },
    validate() {
      if (!this.formName.trim()) {
        ElMessage.error("请填写表单名称");
        return false;
      }
      if (!this.fields.length) {
        ElMessage.error("请至少添加一个表单组件");
        return false;
      }
      for (const field of this.fields) {
        if (field.field_type !== "RICH_TEXT") {
          const label = (field.field_label || "").trim();
          if (!label) {
            ElMessage.error("请填写组件标题");
            return false;
          }
          if (label.length > FIELD_LABEL_MAX) {
            ElMessage.error(`组件标题最多 ${FIELD_LABEL_MAX} 个字`);
            return false;
          }
        }
        if (hasOptions(field.field_type)) {
          const labels = (field.options || []).map((item) => item.label?.trim()).filter(Boolean);
          if (labels.length < 2) {
            ElMessage.error(`${field.field_label || "选项组件"}至少需要 2 个选项`);
            return false;
          }
          if ((field.options || []).some((item) => (item.label || "").length > OPTION_LABEL_MAX)) {
            ElMessage.error("选项最多 10 个字");
            return false;
          }
        }
        if (field.hint_text && field.hint_text.length > HINT_TEXT_MAX) {
          ElMessage.error("提示语最多 10 个字");
          return false;
        }
        if (
          field.default_visibility === "SHOW" &&
          field.default_date_mode === "SPECIFIED_DATE" &&
          field.field_type === "DATE" &&
          !field.default_date
        ) {
          ElMessage.error("请为日期组件指定默认日期");
          return false;
        }
        if (
          field.default_visibility === "SHOW" &&
          field.default_date_mode === "SPECIFIED_DATE" &&
          field.field_type === "DATE_RANGE"
        ) {
          if (!field.default_date_start || !field.default_date_end) {
            ElMessage.error("请为日期范围指定起止日期");
            return false;
          }
          if (field.default_date_start > field.default_date_end) {
            ElMessage.error("日期范围的结束日期不能早于开始日期");
            return false;
          }
        }
        if (
          field.default_visibility === "SHOW" &&
          field.default_time_mode === "SPECIFIED_TIME" &&
          field.field_type === "TIME" &&
          !field.default_time
        ) {
          ElMessage.error("请为时间组件指定默认时间");
          return false;
        }
        if (
          field.default_visibility === "SHOW" &&
          field.default_time_mode === "SPECIFIED_TIME" &&
          field.field_type === "TIME_RANGE"
        ) {
          if (!field.default_time_start || !field.default_time_end) {
            ElMessage.error("请为时间范围指定起止时间");
            return false;
          }
          if (field.default_time_start > field.default_time_end) {
            ElMessage.error("时间范围的结束时间不能早于开始时间");
            return false;
          }
        }
      }
      return true;
    },
    handleSave() {
      if (!this.validate()) return;
      this.saving = true;
      postRequestWithNoForm("/appointment/system-forms", {
        id: this.formId || undefined,
        formName: this.formName.trim(),
        formSchema: serializeFormSchema(this.fields),
        status: "ENABLED",
      })
        .then((res) => {
          if (res.success) {
            ElMessage.success("已保存并发布");
            this.formId = res.result?.id || this.formId;
            this.captureBaseline();
            this.$router.push({ name: "appointment-system-forms" });
          }
        })
        .finally(() => {
          this.saving = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.form-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 126px); /* 顶栏 106px + 页边距 */
  min-height: calc(100vh - 126px);
  background: #f5f6f8;
  margin: -10px;
  box-sizing: border-box;
}
.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.current-page {
  color: #303133;
  font-weight: 600;
  white-space: nowrap;
}
.form-name-input {
  width: 240px;
}
.designer-body {
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}
.palette {
  width: 280px;
  background: #fff;
  overflow: auto;
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  align-self: stretch;
}
.props-panel {
  width: 400px;
  background: #fff;
  overflow: auto;
  padding: 12px 16px 24px;
  align-self: stretch;
}
.panel-title {
  font-weight: 600;
  margin-bottom: 12px;
}
.palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.palette-item {
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 10px;
  font-size: 13px;
}
.palette-icon {
  flex-shrink: 0;
  color: inherit;
}
.palette-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.canvas-wrap {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 24px 64px 24px 16px;
}
.phone {
  width: 375px;
  min-height: 640px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  padding-bottom: 24px;
  overflow: visible;
}
.phone-bar {
  text-align: center;
  font-weight: 600;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.canvas-item {
  position: relative;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid transparent;
  cursor: pointer;
}
.canvas-item.is-selected {
  border-color: var(--el-color-primary);
}
.item-actions {
  position: absolute;
  left: calc(100% + 12px);
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: var(--el-color-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.28);
}
.item-actions button {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-actions button + button {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}
.item-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.props-form :deep(.el-form-item) {
  margin-bottom: 14px;
  align-items: flex-start;
}
.props-form :deep(.el-form-item__label) {
  line-height: 32px;
  justify-content: flex-start;
  text-align: left;
  padding-left: 0;
}
.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.option-row :deep(.el-input) {
  flex: 1;
  min-width: 0;
}
.option-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
}
.option-action-btn {
  flex: 1;
  min-width: 0;
}
.option-action-btn :deep(.el-button) {
  width: 100%;
  height: 36px;
  font-size: 13px;
  padding: 8px 10px;
}
.batch-title {
  font-weight: 600;
  margin-bottom: 4px;
}
.batch-hint {
  color: #909399;
  font-size: 12px;
  margin: 0 0 8px;
}
.batch-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.sub-radios {
  margin-top: 8px;
}
.props-form :deep(.el-form-item__content) {
  justify-content: flex-start;
  text-align: left;
}
.content-type-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: start;
  column-gap: 8px;
  row-gap: 8px;
  width: 100%;
}
.content-type-group :deep(.el-radio) {
  margin-right: 0;
}
.required-switch {
  height: 28px;
  line-height: 28px;
}
.required-switch :deep(.el-switch__core) {
  min-width: 56px;
  height: 28px;
  border-radius: 14px;
}
.required-switch :deep(.el-switch__core .el-switch__action) {
  width: 24px;
  height: 24px;
}
.required-switch.is-checked :deep(.el-switch__core .el-switch__action) {
  left: calc(100% - 25px);
}
.required-switch :deep(.el-switch__inner) {
  font-size: 13px;
  padding: 0 8px 0 22px;
}
.required-switch.is-checked :deep(.el-switch__inner) {
  padding: 0 22px 0 8px;
}
.rich-props {
  width: 100%;
}
.rich-props-label {
  font-size: 14px;
  color: #606266;
  line-height: 22px;
  margin-bottom: 8px;
}
.rich-props :deep(.tinymce-container),
.rich-props :deep(.tox-tinymce) {
  width: 100% !important;
}
.rich-props :deep(.tox-menubar) {
  display: none; /* 侧栏放不下完整菜单 */
}
.rich-props :deep(.tox-toolbar-overlord),
.rich-props :deep(.tox-toolbar) {
  width: 100%;
}
.rich-props :deep(.tox-editor-header) {
  overflow-x: auto;
}
</style>
