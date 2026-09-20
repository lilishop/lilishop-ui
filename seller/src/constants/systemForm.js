/** 预约系统表单 · 字段类型与 schema（§9.1.1.2） */

export const FORM_FIELD_TYPE = {
  CHECKBOX: "CHECKBOX",
  CITY: "CITY",
  RADIO: "RADIO",
  DATE: "DATE",
  DATE_RANGE: "DATE_RANGE",
  SELECT: "SELECT",
  TEXT: "TEXT",
  TIME: "TIME",
  TIME_RANGE: "TIME_RANGE",
  RICH_TEXT: "RICH_TEXT",
  IMAGE: "IMAGE",
};

export const FORM_FIELD_PALETTE = [
  { type: FORM_FIELD_TYPE.CHECKBOX, label: "多选框" },
  { type: FORM_FIELD_TYPE.CITY, label: "城市" },
  { type: FORM_FIELD_TYPE.RADIO, label: "单选框" },
  { type: FORM_FIELD_TYPE.DATE, label: "日期" },
  { type: FORM_FIELD_TYPE.DATE_RANGE, label: "日期范围" },
  { type: FORM_FIELD_TYPE.SELECT, label: "下拉框" },
  { type: FORM_FIELD_TYPE.TEXT, label: "文本框" },
  { type: FORM_FIELD_TYPE.TIME, label: "时间" },
  { type: FORM_FIELD_TYPE.TIME_RANGE, label: "时间范围" },
  { type: FORM_FIELD_TYPE.RICH_TEXT, label: "富文本" },
  { type: FORM_FIELD_TYPE.IMAGE, label: "图片" },
];

export const FORM_FIELD_LABEL = Object.fromEntries(
  FORM_FIELD_PALETTE.map((item) => [item.type, item.label])
);

export const CITY_LEVEL = {
  PROVINCE_CITY: "PROVINCE_CITY",
  PROVINCE_CITY_DISTRICT: "PROVINCE_CITY_DISTRICT",
  PROVINCE_CITY_DISTRICT_STREET: "PROVINCE_CITY_DISTRICT_STREET",
};

export const TEXT_CONTENT_TYPE = {
  TEXT: "TEXT",
  MOBILE: "MOBILE",
  ID_CARD: "ID_CARD",
  EMAIL: "EMAIL",
  NUMBER: "NUMBER",
};

export const OPTION_MAX = 20;
/** 标题/选项/提示语均最多十字 */
export const FIELD_LABEL_MAX = 10;
export const OPTION_LABEL_MAX = 10;
export const HINT_TEXT_MAX = 10;
export const RADIO_OPTION_MAX_LEN = OPTION_LABEL_MAX;

export function createFieldKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function defaultOptions() {
  return [
    { label: "选项一", value: createFieldKey() },
    { label: "选项二", value: createFieldKey() },
  ];
}

export function createField(type) {
  const fieldType = String(type || FORM_FIELD_TYPE.TEXT).toUpperCase();
  const base = {
    field_key: createFieldKey(),
    field_type: fieldType,
    field_label: FORM_FIELD_LABEL[fieldType] || "文本框",
    required: true,
  };
  switch (fieldType) {
    case FORM_FIELD_TYPE.CHECKBOX:
      return { ...base, options: defaultOptions() };
    case FORM_FIELD_TYPE.RADIO:
      return {
        field_key: base.field_key,
        field_type: fieldType,
        field_label: "单选框",
        options: defaultOptions(),
        default_option_index: 0, // 默认选项一
      };
    case FORM_FIELD_TYPE.SELECT:
      return {
        ...base,
        field_label: "下拉框",
        options: defaultOptions(),
        default_option_index: 0,
      };
    case FORM_FIELD_TYPE.CITY:
      return {
        ...base,
        field_label: "城市",
        city_level: CITY_LEVEL.PROVINCE_CITY_DISTRICT_STREET,
        hint_text: "请选择",
      };
    case FORM_FIELD_TYPE.DATE:
      return {
        ...base,
        field_label: "日期",
        default_visibility: "SHOW",
        default_date_mode: "CURRENT_DATE",
        default_date: null,
        hint_text: "请选择",
      };
    case FORM_FIELD_TYPE.DATE_RANGE:
      return {
        ...base,
        field_label: "日期范围",
        default_visibility: "SHOW",
        default_date_mode: "CURRENT_DATE",
        default_date_start: null,
        default_date_end: null,
        hint_text: "请选择",
      };
    case FORM_FIELD_TYPE.TIME:
      return {
        ...base,
        field_label: "时间",
        default_visibility: "SHOW",
        default_time_mode: "CURRENT_TIME",
        default_time: null,
        hint_text: "请选择",
      };
    case FORM_FIELD_TYPE.TIME_RANGE:
      return {
        ...base,
        field_label: "时间范围",
        default_visibility: "SHOW",
        default_time_mode: "CURRENT_TIME",
        default_time_start: null,
        default_time_end: null,
        hint_text: "请选择",
      };
    case FORM_FIELD_TYPE.TEXT:
      return {
        ...base,
        field_label: "文本框",
        content_type: TEXT_CONTENT_TYPE.TEXT,
        default_value: "",
        hint_text: "请填写",
      };
    case FORM_FIELD_TYPE.RICH_TEXT:
      return {
        field_key: base.field_key,
        field_type: fieldType,
        field_label: "富文本",
        rich_text_content: "",
      };
    case FORM_FIELD_TYPE.IMAGE:
      return {
        ...base,
        field_label: "上传图片",
        max_upload_count: 1,
      };
    default:
      return { ...base, field_type: FORM_FIELD_TYPE.TEXT, content_type: TEXT_CONTENT_TYPE.TEXT, hint_text: "请填写" };
  }
}

function normalizeType(raw) {
  return String(raw || FORM_FIELD_TYPE.TEXT)
    .toUpperCase()
    .replace(/-/g, "_");
}

function normalizeOptions(rawOptions) {
  if (!Array.isArray(rawOptions) || !rawOptions.length) {
    return defaultOptions();
  }
  return rawOptions.map((item) => {
    if (typeof item === "string") {
      return { label: item, value: createFieldKey() };
    }
    return {
      label: item?.label ?? item?.name ?? "",
      value: item?.value || createFieldKey(),
    };
  });
}

export function normalizeField(raw, index = 0) {
  if (!raw || typeof raw !== "object") {
    return createField(FORM_FIELD_TYPE.TEXT);
  }
  const type = normalizeType(raw.field_type || raw.fieldType || raw.type);
  const field = createField(type);
  field.field_key = raw.field_key || raw.fieldKey || raw.id || raw.key || field.field_key;
  field.field_label = raw.field_label || raw.fieldLabel || raw.label || raw.title || field.field_label;
  if (raw.required != null) {
    field.required = !!raw.required;
  }
  if (raw.hint_text != null || raw.hintText != null || raw.hint != null || raw.placeholder != null) {
    field.hint_text = raw.hint_text || raw.hintText || raw.hint || raw.placeholder || "";
  }
  if (field.options) {
    field.options = normalizeOptions(raw.options);
  }
  if (raw.default_option_index != null || raw.defaultOptionIndex != null) {
    field.default_option_index = Number(raw.default_option_index ?? raw.defaultOptionIndex) || 0;
  }
  if (raw.city_level || raw.cityLevel) {
    field.city_level = raw.city_level || raw.cityLevel;
  }
  if (raw.content_type || raw.contentType) {
    field.content_type = raw.content_type || raw.contentType;
  }
  if (raw.default_value != null || raw.defaultValue != null) {
    field.default_value = raw.default_value ?? raw.defaultValue ?? "";
  }
  if (raw.default_visibility || raw.defaultVisibility) {
    field.default_visibility = raw.default_visibility || raw.defaultVisibility;
  }
  if (raw.default_date_mode || raw.defaultDateMode) {
    field.default_date_mode = raw.default_date_mode || raw.defaultDateMode;
  }
  if (raw.default_date || raw.defaultDate) {
    field.default_date = raw.default_date || raw.defaultDate;
  }
  if (raw.default_date_start || raw.defaultDateStart) {
    field.default_date_start = raw.default_date_start || raw.defaultDateStart;
  }
  if (raw.default_date_end || raw.defaultDateEnd) {
    field.default_date_end = raw.default_date_end || raw.defaultDateEnd;
  }
  if (raw.default_time_mode || raw.defaultTimeMode) {
    field.default_time_mode = raw.default_time_mode || raw.defaultTimeMode;
  }
  if (raw.default_time || raw.defaultTime) {
    field.default_time = raw.default_time || raw.defaultTime;
  }
  if (raw.default_time_start || raw.defaultTimeStart) {
    field.default_time_start = raw.default_time_start || raw.defaultTimeStart;
  }
  if (raw.default_time_end || raw.defaultTimeEnd) {
    field.default_time_end = raw.default_time_end || raw.defaultTimeEnd;
  }
  if (raw.rich_text_content != null || raw.richTextContent != null || raw.content != null) {
    field.rich_text_content = raw.rich_text_content || raw.richTextContent || raw.content || "";
  }
  if (raw.max_upload_count != null || raw.maxUploadCount != null) {
    field.max_upload_count = Math.min(10, Math.max(1, Number(raw.max_upload_count ?? raw.maxUploadCount) || 1));
  }
  field.sort_order = raw.sort_order ?? raw.sortOrder ?? index;
  return field;
}

export function parseFormSchema(schemaJson) {
  if (!schemaJson) {
    return [];
  }
  let data = schemaJson;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  const list = Array.isArray(data) ? data : data?.fields || [];
  return list.map((item, index) => normalizeField(item, index));
}

export function serializeFormSchema(fields) {
  return JSON.stringify(
    (fields || []).map((field, index) => ({
      ...field,
      sort_order: index,
    }))
  );
}

export function countFormFields(schemaJson) {
  return parseFormSchema(schemaJson).length;
}

export function addOption(options, { radio } = {}) {
  const list = [...(options || [])];
  if (list.length >= OPTION_MAX) {
    return list;
  }
  list.push({
    label: radio ? "" : `选项${list.length + 1}`,
    value: createFieldKey(),
  });
  return list;
}

export function removeOption(options, index) {
  const list = [...(options || [])];
  if (index < 2 || list.length <= 2) {
    return list;
  }
  list.splice(index, 1);
  return list;
}

export function batchAddOptions(options, text, { radio } = {}) {
  const list = [...(options || [])];
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(0, OPTION_LABEL_MAX));
  for (const label of lines) {
    if (list.length >= OPTION_MAX) {
      break;
    }
    list.push({ label, value: createFieldKey() });
  }
  return list;
}

export function hasRequiredSwitch(type) {
  // 单选、富文本不配必填
  return ![FORM_FIELD_TYPE.RADIO, FORM_FIELD_TYPE.RICH_TEXT].includes(type);
}

export function hasOptions(type) {
  return [FORM_FIELD_TYPE.CHECKBOX, FORM_FIELD_TYPE.RADIO, FORM_FIELD_TYPE.SELECT].includes(type);
}
