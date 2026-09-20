/**
 * 预约商品（APPOINTMENT_GOODS）— 商家端常量
 */
export const APPOINTMENT_GOODS_TYPE = "APPOINTMENT_GOODS";

export const SERVICE_MODE = {
  IN_STORE: "IN_STORE",
  ON_SITE: "ON_SITE",
};

export const SERVICE_MODE_LABEL = {
  IN_STORE: "到店服务",
  ON_SITE: "上门服务",
};

export const SLOT_DIVISION_MODE = {
  AUTO: "AUTO",
  CUSTOM: "CUSTOM",
};

export const BOOKABLE_DATE_MODE = {
  EVERY_DAY: "EVERY_DAY",
  CUSTOM: "CUSTOM",
};

export const ADVANCE_MODE = {
  NONE: "NONE",
  REQUIRE_HOURS: "REQUIRE_HOURS",
};

export const CANCEL_MODE = {
  NOT_ALLOWED: "NOT_ALLOWED",
  ALLOW_BEFORE_HOURS: "ALLOW_BEFORE_HOURS",
};

export const FORM_SUBMIT_MODE = {
  PER_APPOINTMENT: "PER_APPOINTMENT",
  PER_ORDER: "PER_ORDER",
};

export const WORK_ORDER_STATUS = {
  PENDING_CLAIM: "PENDING_CLAIM",
  WAIT_VERIFY: "WAIT_VERIFY",
  CLAIMED: "CLAIMED",
  IN_SERVICE: "IN_SERVICE",
  SERVICE_ENDED: "SERVICE_ENDED",
  NO_SHOW: "NO_SHOW",
  REFUNDED: "REFUNDED",
};

export const WORK_ORDER_STATUS_LABEL = {
  PENDING_CLAIM: "待领取",
  WAIT_VERIFY: "待核销",
  CLAIMED: "已领取",
  IN_SERVICE: "服务中",
  SERVICE_ENDED: "服务结束",
  NO_SHOW: "逾期未到店",
  REFUNDED: "已退款",
};

export const WEEKDAY_OPTIONS = [
  { label: "周一", value: 1 },
  { label: "周二", value: 2 },
  { label: "周三", value: 3 },
  { label: "周四", value: 4 },
  { label: "周五", value: 5 },
  { label: "周六", value: 6 },
  { label: "周日", value: 7 },
];

export function isAppointmentGoods(goodsType) {
  return goodsType === APPOINTMENT_GOODS_TYPE;
}

export function defaultAppointmentSettings() {
  return {
    serviceModes: [SERVICE_MODE.IN_STORE],
    showRemainingQty: true,
    bookableDateMode: BOOKABLE_DATE_MODE.EVERY_DAY,
    bookableDays: 1,
    bookableCustomStartDate: "",
    bookableCustomEndDate: "",
    bookableWeekdays: [1, 2, 3, 4, 5, 6, 7],
    advanceMode: ADVANCE_MODE.NONE,
    advanceHours: 1,
    cancelMode: CANCEL_MODE.ALLOW_BEFORE_HOURS,
    cancelAheadHours: 2,
    formSubmitMode: FORM_SUBMIT_MODE.PER_APPOINTMENT,
    systemFormId: null,
  };
}

export function defaultSlotDivision() {
  return {
    slotDivisionMode: SLOT_DIVISION_MODE.AUTO,
    serviceDurationMinutes: 60,
    autoStartTime: "08:00",
    autoEndTime: "18:00",
    confirmedSlots: [],
    customDrafts: [{ startTime: "08:00", endTime: "09:00" }],
  };
}

export function slotKey(slot) {
  return `${slot.startTime}-${slot.endTime}`;
}

export function parseFormAnswerGroups(formAnswerJson) {
  if (!formAnswerJson) return [];
  let data = formAnswerJson;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  const fields = Array.isArray(data?.fields) ? data.fields : [];
  const answers = Array.isArray(data?.answers) ? data.answers : [];
  return answers
    .map((group) => {
      const map = group && typeof group === "object" && !Array.isArray(group) ? group : {};
      const source = fields.length
        ? fields
        : Object.keys(map).map((key) => ({ fieldKey: key, fieldLabel: key }));
      return source
        .map((field) => ({
          fieldKey: field.fieldKey,
          fieldLabel: field.fieldLabel || field.fieldKey,
          value: map[field.fieldKey] ?? "",
        }))
        .filter((row) => row.value !== "" && row.value != null);
    })
    .filter((rows) => rows.length);
}
