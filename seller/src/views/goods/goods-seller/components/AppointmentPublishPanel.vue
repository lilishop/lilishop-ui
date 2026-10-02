<template>
  <div class="appointment-publish-panel">
    <div class="form-item-view">
      <el-form-item label="服务模式" required>
        <div class="service-mode-field">
          <el-checkbox-group v-model="localSettings.serviceModes">
            <el-checkbox :value="SERVICE_MODE.IN_STORE">到店服务</el-checkbox>
            <el-checkbox :value="SERVICE_MODE.ON_SITE">上门服务</el-checkbox>
          </el-checkbox-group>
          <span class="field-hint block-hint">用户购买此预约服务商品，可以选择的服务方式</span>
        </div>
      </el-form-item>

      <el-form-item label="剩余可约数量" required>
        <div class="service-mode-field">
          <el-switch v-model="localSettings.showRemainingQty" />
          <span class="field-hint block-hint">关闭后，用户无法查看各时段的剩余预约数量</span>
        </div>
      </el-form-item>

      <el-form-item label="可预约日期" required>
        <div class="service-mode-field">
          <el-radio-group v-model="localSettings.bookableDateMode">
            <el-radio :value="BOOKABLE_DATE_MODE.EVERY_DAY">每天</el-radio>
            <el-radio :value="BOOKABLE_DATE_MODE.CUSTOM">自定义</el-radio>
          </el-radio-group>
          <span
            v-if="localSettings.bookableDateMode !== BOOKABLE_DATE_MODE.CUSTOM"
            class="field-hint block-hint"
          >设置预约服务的可预约日期。</span>
        </div>
      </el-form-item>

      <template v-if="localSettings.bookableDateMode === BOOKABLE_DATE_MODE.CUSTOM">
        <div class="bookable-custom-row">
          <el-form-item class="bookable-range-item" label-width="0">
            <div class="appointment-range-wrap">
              <el-date-picker
                v-model="customDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </div>
          </el-form-item>
          <el-form-item class="bookable-weekdays-item" label-width="0">
            <el-checkbox-group v-model="localSettings.bookableWeekdays" class="bookable-weekdays-group">
              <el-checkbox-button
                v-for="item in WEEKDAY_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <p class="field-hint block-hint bookable-custom-hint">{{ bookableDateHint }}</p>
      </template>

      <el-form-item label="预约日期范围" required>
        <div class="service-mode-field">
          <div class="inline-setting-line">
            <span class="inline-setting-text">对用户展示</span>
            <el-input-number
              v-model="localSettings.bookableDays"
              :min="1"
              :max="365"
              controls-position="right"
              class="bookable-days-input"
            />
            <span class="inline-setting-text">天内的可预约日期</span>
          </div>
          <span class="field-hint block-hint">用户端可以看到的可预约日期。示例：设置1天，则代表只可以预约当天</span>
        </div>
      </el-form-item>

      <el-form-item label="提前预约" required>
        <div class="service-mode-field">
          <el-radio-group v-model="localSettings.advanceMode" class="stacked-radio-group">
            <el-radio :value="ADVANCE_MODE.NONE">无需提前预约</el-radio>
            <el-radio :value="ADVANCE_MODE.REQUIRE_HOURS">
              <span class="radio-inline-row">
                用户要求提前
                <el-input-number
                  v-model="localSettings.advanceHours"
                  :min="1"
                  :max="720"
                  controls-position="right"
                  class="bookable-days-input"
                  @click.stop
                  @focus="localSettings.advanceMode = ADVANCE_MODE.REQUIRE_HOURS"
                />
                <span class="radio-accent-text">小时进行预约</span>
              </span>
            </el-radio>
          </el-radio-group>
          <span class="field-hint block-hint">用户只能预约间隔时间后的时段。示例：当前10:00，设置2h，则用户只可预约12:00往后的时段</span>
        </div>
      </el-form-item>

      <el-form-item label="取消订单" required>
        <div class="service-mode-field">
          <el-radio-group v-model="localSettings.cancelMode" class="stacked-radio-group">
            <el-radio :value="CANCEL_MODE.NOT_ALLOWED">不允许取消</el-radio>
            <el-radio :value="CANCEL_MODE.ALLOW_BEFORE_HOURS">
              <span class="radio-inline-row">
                服务开始
                <el-input-number
                  v-model="localSettings.cancelAheadHours"
                  :min="1"
                  :max="720"
                  controls-position="right"
                  class="bookable-days-input"
                  @click.stop
                  @focus="localSettings.cancelMode = CANCEL_MODE.ALLOW_BEFORE_HOURS"
                />
                <span class="radio-accent-text">小时之前，允许取消并自动退款</span>
              </span>
            </el-radio>
          </el-radio-group>
          <span class="field-hint block-hint">设置用户最晚可以取消预约的时间。示例：设置2h，用户预约12:00-14:00，则当天10:00之前允许用户取消预约</span>
        </div>
      </el-form-item>

      <el-form-item label="表单信息" required>
        <div class="service-mode-field">
          <el-radio-group v-model="localSettings.formSubmitMode">
            <el-radio :value="FORM_SUBMIT_MODE.PER_APPOINTMENT">每个预约提交一次</el-radio>
            <el-radio :value="FORM_SUBMIT_MODE.PER_ORDER">每单提交一次</el-radio>
          </el-radio-group>
          <span class="field-hint block-hint">一次购买2件预约商品，选择每个预约提交一次则需要填写两遍关联系统表单，选择每单提交一次则只需要填写一遍关联系统表单</span>
        </div>
      </el-form-item>

      <el-form-item label="关联表单">
        <div class="service-mode-field">
          <div class="inline-setting-line">
            <el-select
              v-model="localSettings.systemFormId"
              clearable
              filterable
              placeholder="不关联"
              style="width: 260px"
            >
              <el-option
                v-for="item in systemFormOptions"
                :key="item.id"
                :label="item.formName"
                :value="item.id"
              />
            </el-select>
            <el-button link type="primary" @click="goAddSystemForm">添加表单</el-button>
            <el-button link type="primary" @click="loadSystemForms">刷新</el-button>
          </div>
          <span class="field-hint block-hint">用户购买此商品时，必须填写关联表单中设置的字段内容才能够进行订单支付，例如：部分商品购买必须填写身份证号、预约时间等</span>
        </div>
      </el-form-item>
    </div>

    <!-- 时段划分挂到预约规则区，单实例避免 v-model 互相覆盖 -->
    <Teleport
      v-if="!divisionTarget || divisionReady"
      :to="divisionTarget || 'body'"
      :disabled="!divisionTarget"
    >
    <div class="appointment-publish-panel">
    <h4 v-if="!divisionTarget">时段划分</h4>
    <div class="form-item-view slot-division-panel">
      <el-form-item label="时段划分" required>
        <el-radio-group v-model="localDivision.slotDivisionMode">
          <el-radio :value="SLOT_DIVISION_MODE.AUTO">自动划分</el-radio>
          <el-radio :value="SLOT_DIVISION_MODE.CUSTOM">自定义划分</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="localDivision.slotDivisionMode === SLOT_DIVISION_MODE.AUTO">
        <el-form-item label="起止时间" required>
          <div class="appointment-range-wrap">
            <el-time-picker
              v-model="autoTimeRange"
              is-range
              format="HH:mm"
              value-format="HH:mm"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
            />
          </div>
        </el-form-item>
        <el-form-item label="服务时长" required>
          <el-input-number
            v-model="localDivision.serviceDurationMinutes"
            :min="15"
            :max="480"
            controls-position="right"
            style="width: 160px"
          />
          <span class="field-hint">分钟（本商品全部 SKU 相同）</span>
        </el-form-item>
      </template>

      <template v-if="localDivision.slotDivisionMode === SLOT_DIVISION_MODE.CUSTOM">
        <el-alert type="info" show-icon :closable="false" class="mb_10">
          请自行填写每条时段的开始和结束时间；最多 24 条；不支持跨天。
        </el-alert>
        <el-form-item
          v-for="(item, index) in localDivision.customDrafts"
          :key="index"
          :label="index === 0 ? '自定义时段' : ' '"
        >
          <div class="custom-slot-row">
            <el-time-picker
              v-model="item.startTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="开始"
              style="width: 140px"
            />
            <span class="slot-sep">-</span>
            <el-time-picker
              v-model="item.endTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="结束"
              style="width: 140px"
            />
            <el-button v-if="index > 0" link type="danger" @click="removeCustomDraft(index)">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item class="slot-confirm-item">
          <el-button
            type="primary"
            link
            :disabled="localDivision.customDrafts.length >= 24"
            @click="addCustomDraft"
          >
            添加时段 ({{ localDivision.customDrafts.length }}/24)
          </el-button>
        </el-form-item>
      </template>

      <el-form-item class="slot-confirm-item">
        <el-button type="primary" @click="confirmSlots">确认时间段</el-button>
      </el-form-item>

      <div v-if="localDivision.confirmedSlots.length" class="confirmed-slots">
        <div v-if="localDivision.slotDivisionMode === SLOT_DIVISION_MODE.AUTO" class="slot-select-all">
          <el-checkbox
            :indeterminate="slotIndeterminate"
            :model-value="allSlotsChecked"
            @change="toggleAllSlots"
          >
            全选
          </el-checkbox>
        </div>
        <el-checkbox-group v-model="enabledSlotKeys">
          <el-checkbox
            v-for="slot in localDivision.confirmedSlots"
            :key="slotKey(slot)"
            :value="slotKey(slot)"
            :disabled="localDivision.slotDivisionMode === SLOT_DIVISION_MODE.CUSTOM"
          >
            {{ slot.startTime }}-{{ slot.endTime }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    </div>
    </Teleport>

    <el-dialog v-model="capacityDialogVisible" title="SKU 预约规则" width="520px" destroy-on-close>
      <el-table :data="activeCapacityRows" border size="small">
        <el-table-column label="时段" prop="label" min-width="140" />
        <el-table-column label="可预约数量（0=不限制）" min-width="200">
          <template #default="{ row }">
            <el-input-number
              v-model="capacityDraft[row.key]"
              :min="0"
              controls-position="right"
              style="width: 140px"
            />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="capacityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSkuCapacities">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getRequest } from "@/libs/axios";
import {
  SERVICE_MODE,
  BOOKABLE_DATE_MODE,
  ADVANCE_MODE,
  CANCEL_MODE,
  FORM_SUBMIT_MODE,
  SLOT_DIVISION_MODE,
  WEEKDAY_OPTIONS,
  defaultAppointmentSettings,
  defaultSlotDivision,
  slotKey,
} from "@/constants/appointment";

function parseMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default {
  name: "AppointmentPublishPanel",
  props: {
    settings: { type: Object, default: () => defaultAppointmentSettings() },
    division: { type: Object, default: () => defaultSlotDivision() },
    skuCapacities: { type: Object, default: () => ({}) },
    skuInfo: { type: Array, default: () => [] },
    divisionTarget: {
      type: String,
      default: "",
    },
  },
  emits: ["update:settings", "update:division", "update:skuCapacities"],
  data() {
    return {
      SERVICE_MODE,
      BOOKABLE_DATE_MODE,
      ADVANCE_MODE,
      CANCEL_MODE,
      FORM_SUBMIT_MODE,
      SLOT_DIVISION_MODE,
      WEEKDAY_OPTIONS,
      localSettings: defaultAppointmentSettings(),
      localDivision: defaultSlotDivision(),
      enabledSlotKeys: [],
      systemFormOptions: [],
      capacityDialogVisible: false,
      capacityDraft: {},
      activeSkuRowKey: "",
      syncing: false,
      divisionReady: false,
    };
  },
  computed: {
    bookableDateHint() {
      return "设置预约服务的可预约日期。例如：周六、周天不选中，则在可预约日期中的周一到周五可用。";
    },
    customDateRange: {
      get() {
        const { bookableCustomStartDate, bookableCustomEndDate } = this.localSettings;
        if (bookableCustomStartDate && bookableCustomEndDate) {
          return [bookableCustomStartDate, bookableCustomEndDate];
        }
        return null;
      },
      set(val) {
        if (val && val.length === 2) {
          this.localSettings.bookableCustomStartDate = val[0];
          this.localSettings.bookableCustomEndDate = val[1];
        } else {
          this.localSettings.bookableCustomStartDate = "";
          this.localSettings.bookableCustomEndDate = "";
        }
      },
    },
    autoTimeRange: {
      get() {
        if (this.localDivision.autoStartTime && this.localDivision.autoEndTime) {
          return [this.localDivision.autoStartTime, this.localDivision.autoEndTime];
        }
        return null;
      },
      set(val) {
        if (val && val.length === 2) {
          this.localDivision.autoStartTime = val[0];
          this.localDivision.autoEndTime = val[1];
        }
      },
    },
    activeCapacityRows() {
      return this.localDivision.confirmedSlots
        .filter((slot) => this.isSlotEnabled(slot))
        .map((slot) => ({
          key: slotKey(slot),
          label: `${slot.startTime}-${slot.endTime}`,
        }));
    },
    allSlotsChecked() {
      const enabled = this.localDivision.confirmedSlots.filter((s) => this.isSlotEnabled(s));
      return enabled.length > 0 && enabled.length === this.enabledSlotKeys.length;
    },
    slotIndeterminate() {
      const enabled = this.localDivision.confirmedSlots.filter((s) => this.isSlotEnabled(s));
      return this.enabledSlotKeys.length > 0 && this.enabledSlotKeys.length < enabled.length;
    },
  },
  watch: {
    settings: {
      immediate: true,
      deep: true,
      handler(val) {
        if (this.syncing) return;
        this.localSettings = { ...defaultAppointmentSettings(), ...(val || {}) };
      },
    },
    division: {
      immediate: true,
      deep: true,
      handler(val) {
        if (this.syncing) return;
        this.localDivision = { ...defaultSlotDivision(), ...(val || {}) };
        this.enabledSlotKeys = (this.localDivision.confirmedSlots || [])
          .filter((s) => s.slotEnabled !== false)
          .map((s) => slotKey(s));
      },
    },
    localSettings: {
      deep: true,
      handler(val) {
        this.syncing = true;
        this.$emit("update:settings", { ...val });
        this.$nextTick(() => {
          this.syncing = false;
        });
      },
    },
    localDivision: {
      deep: true,
      handler(val) {
        this.syncing = true;
        this.$emit("update:division", { ...val });
        this.$nextTick(() => {
          this.syncing = false;
        });
      },
    },
    enabledSlotKeys(val) {
      this.localDivision.confirmedSlots = (this.localDivision.confirmedSlots || []).map((slot) => ({
        ...slot,
        slotEnabled: val.includes(slotKey(slot)),
      }));
    },
    divisionTarget: {
      immediate: true,
      handler() {
        this.prepareDivisionTarget();
      },
    },
  },
  mounted() {
    this.loadSystemForms();
    this.prepareDivisionTarget();
  },
  methods: {
    prepareDivisionTarget() {
      this.divisionReady = false;
      if (!this.divisionTarget) {
        return;
      }
      this.$nextTick(() => {
        this.divisionReady = !!document.querySelector(this.divisionTarget);
      });
    },
    slotKey,
    isSlotEnabled(slot) {
      return slot.slotEnabled !== false;
    },
    toggleAllSlots(checked) {
      if (checked) {
        this.enabledSlotKeys = this.localDivision.confirmedSlots.map((s) => slotKey(s));
      } else {
        this.enabledSlotKeys = [];
      }
    },
    loadSystemForms() {
      getRequest("/appointment/system-forms/enabled")
        .then((res) => {
          if (res.success) {
            this.systemFormOptions = res.result || [];
          }
        })
        .catch(() => {});
    },
    goAddSystemForm() {
      // 主布局无 keep-alive，新开页避免发品表单被销毁
      const route = this.$router.resolve({ name: "appointment-system-form-designer" });
      window.open(route.href, "_blank");
    },
    addCustomDraft() {
      const last = this.localDivision.customDrafts[this.localDivision.customDrafts.length - 1];
      const start = last?.endTime || "08:00";
      const endMinutes = parseMinutes(start) + 60;
      const end = endMinutes >= 24 * 60 ? "23:59" : formatMinutes(endMinutes);
      this.localDivision.customDrafts.push({ startTime: start, endTime: end });
    },
    removeCustomDraft(index) {
      this.localDivision.customDrafts.splice(index, 1);
    },
    confirmSlots() {
      let slots = [];
      if (this.localDivision.slotDivisionMode === SLOT_DIVISION_MODE.AUTO) {
        const duration = Number(this.localDivision.serviceDurationMinutes);
        if (!duration || duration < 15) {
          this.$Message.error("请填写有效的服务时长（15-480 分钟）");
          return false;
        }
        const start = parseMinutes(this.localDivision.autoStartTime);
        const end = parseMinutes(this.localDivision.autoEndTime);
        if (!this.localDivision.autoStartTime || !this.localDivision.autoEndTime || end <= start) {
          this.$Message.error("请选择有效的起止时间（同一天内，结束大于开始）");
          return false;
        }
        for (let t = start; t + duration <= end; t += duration) {
          slots.push({
            startTime: formatMinutes(t),
            endTime: formatMinutes(t + duration),
            slotEnabled: true,
          });
        }
        if (!slots.length) {
          this.$Message.error("未生成有效时段，请检查起止时间与服务时长");
          return false;
        }
      } else {
        const drafts = this.localDivision.customDrafts || [];
        if (!drafts.length) {
          this.$Message.error("请至少添加一条自定义时段");
          return false;
        }
        let prevEnd = -1;
        for (const row of drafts) {
          if (!row.startTime || !row.endTime) {
            this.$Message.error("请完整填写每条时段的开始和结束时间");
            return false;
          }
          const s = parseMinutes(row.startTime);
          const e = parseMinutes(row.endTime);
          if (e <= s) {
            this.$Message.error("结束时间须大于开始时间，且不支持跨天");
            return false;
          }
          if (s < prevEnd) {
            this.$Message.error("自定义时段不得重叠，须按时间顺序添加");
            return false;
          }
          prevEnd = e;
          slots.push({ startTime: row.startTime, endTime: row.endTime, slotEnabled: true });
        }
      }
      this.localDivision.confirmedSlots = slots;
      this.enabledSlotKeys = slots.map((s) => slotKey(s));
      this.$Message.success(`已确认 ${slots.length} 个时段`);
      return true;
    },
    openSkuCapacityDialog(skuRow) {
      this.activeSkuRowKey = this.getSkuRowKey(skuRow);
      const draft = {};
      this.activeCapacityRows.forEach((row) => {
        draft[row.key] = this.skuCapacities?.[this.activeSkuRowKey]?.[row.key] ?? 0;
      });
      this.capacityDraft = draft;
      this.capacityDialogVisible = true;
    },
    saveSkuCapacities() {
      const next = { ...(this.skuCapacities || {}) };
      next[this.activeSkuRowKey] = { ...this.capacityDraft };
      this.$emit("update:skuCapacities", next);
      this.capacityDialogVisible = false;
    },
    validateRules() {
      const s = this.localSettings;
      if (!s.serviceModes?.length) {
        this.$Message.error("预约规则：请至少选择一种服务模式");
        return false;
      }
      if (s.bookableDateMode === BOOKABLE_DATE_MODE.CUSTOM) {
        if (!s.bookableCustomStartDate || !s.bookableCustomEndDate) {
          this.$Message.error("预约规则：请选择自定义可预约日期范围");
          return false;
        }
        if (!s.bookableWeekdays?.length) {
          this.$Message.error("预约规则：请至少勾选一天可约星期");
          return false;
        }
      }
      if (!s.bookableDays || s.bookableDays < 1) {
        this.$Message.error("预约规则：预约日期范围须为正整数");
        return false;
      }
      if (s.advanceMode === ADVANCE_MODE.REQUIRE_HOURS && (!s.advanceHours || s.advanceHours < 1)) {
        this.$Message.error("预约规则：请填写提前预约小时数");
        return false;
      }
      if (
        s.cancelMode === CANCEL_MODE.ALLOW_BEFORE_HOURS &&
        (!s.cancelAheadHours || s.cancelAheadHours < 1)
      ) {
        this.$Message.error("预约规则：请填写取消政策小时数");
        return false;
      }
      return true;
    },
    validateDivision() {
      const enabledSlots = (this.localDivision.confirmedSlots || []).filter((slot) =>
        this.isSlotEnabled(slot)
      );
      if (!enabledSlots.length) {
        this.$Message.error("时段划分：请确认时间段并至少启用 1 个时段");
        return false;
      }
      return true;
    },
    validate() {
      if (this.part === "rules") {
        return this.validateRules();
      }
      if (this.part === "division") {
        return this.validateDivision();
      }
      return this.validateRules() && this.validateDivision();
    },
    buildSettingsPayload() {
      return {
        appointmentSettings: { ...this.localSettings },
      };
    },
    buildDivisionPayload() {
      const enabledSlots = (this.localDivision.confirmedSlots || []).filter((slot) =>
        this.isSlotEnabled(slot)
      );
      return {
        appointmentSlotTemplate: {
          slotDivisionMode: this.localDivision.slotDivisionMode,
          serviceDurationMinutes: this.localDivision.serviceDurationMinutes,
          autoStartTime: this.localDivision.autoStartTime,
          autoEndTime: this.localDivision.autoEndTime,
          slots: enabledSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotEnabled: true,
          })),
        },
      };
    },
    buildSubmitPayload() {
      return {
        ...this.buildSettingsPayload(),
        ...this.buildDivisionPayload(),
      };
    },
    buildSkuSlotCapacities(skuRow) {
      const rowKey = this.getSkuRowKey(skuRow);
      const map = this.skuCapacities?.[rowKey] || {};
      return (this.localDivision.confirmedSlots || [])
        .filter((slot) => this.isSlotEnabled(slot))
        .map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotCapacity: map[slotKey(slot)] ?? 0,
        }));
    },
    getSkuRowKey(row) {
      return this.skuInfo
        .map((info) => row[info.name])
        .filter(Boolean)
        .join("::");
    },
    hydrateFromGoods(result) {
      if (result.appointmentSettings) {
        this.localSettings = { ...defaultAppointmentSettings(), ...result.appointmentSettings };
      }
      if (result.appointmentSlotTemplate) {
        const tpl = result.appointmentSlotTemplate;
        this.localDivision = {
          ...defaultSlotDivision(),
          slotDivisionMode: tpl.slotDivisionMode || SLOT_DIVISION_MODE.AUTO,
          serviceDurationMinutes: tpl.serviceDurationMinutes || 60,
          autoStartTime: tpl.autoStartTime || "08:00",
          autoEndTime: tpl.autoEndTime || "18:00",
          confirmedSlots: tpl.slots || [],
          customDrafts: tpl.slots?.length
            ? tpl.slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
            : defaultSlotDivision().customDrafts,
        };
        this.enabledSlotKeys = (tpl.slots || [])
          .filter((s) => s.slotEnabled !== false)
          .map((s) => slotKey(s));
      }
      if (result.skuList?.length) {
        const cap = {};
        result.skuList.forEach((sku) => {
          const specKey = (sku.specList || []).map((s) => s.specValue).filter(Boolean).join("::");
          const keys = [specKey, sku.id, sku.sn].filter(Boolean);
          const slotMap = {};
          (sku.slotCapacities || []).forEach((item) => {
            slotMap[slotKey(item)] = item.slotCapacity ?? 0;
          });
          keys.forEach((key) => {
            cap[key] = { ...slotMap };
          });
        });
        this.$emit("update:skuCapacities", cap);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.appointment-publish-panel {
  .field-hint {
    margin-left: 8px;
    color: #909399;
    font-size: 12px;
  }
  .block-hint {
    display: block;
    margin-top: 4px;
    margin-left: 0;
  }
  .service-mode-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .inline-setting-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .inline-setting-text {
    color: #606266;
    font-size: 14px;
    white-space: nowrap;
  }
  .bookable-days-input {
    width: 100px;
  }
  .stacked-radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .stacked-radio-group :deep(.el-radio) {
    margin-right: 0;
    height: auto;
    align-items: center;
  }
  .radio-inline-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .radio-accent-text {
    color: var(--el-color-primary);
  }
  .bookable-custom-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    column-gap: 32px;
    padding-left: 120px;
    box-sizing: border-box;
  }
  .bookable-custom-hint {
    padding-left: 120px;
    margin: 0 0 18px;
  }
  .bookable-custom-row :deep(.el-form-item) {
    width: auto !important;
    margin-right: 0;
  }
  .bookable-weekdays-item :deep(.el-form-item__content),
  .bookable-range-item :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
  .bookable-weekdays-group :deep(.el-checkbox-button) {
    margin-right: 8px;
  }
  .bookable-weekdays-group :deep(.el-checkbox-button__inner) {
    border-radius: 16px !important;
    border-left: 1px solid var(--el-border-color) !important;
    box-shadow: none !important;
    padding: 8px 14px;
  }
  .bookable-weekdays-group :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
    border-color: var(--el-color-primary) !important;
  }
  .appointment-range-wrap {
    width: 260px;
    max-width: 260px;
    flex: 0 0 260px;
  }
  .appointment-range-wrap :deep(.el-date-editor) {
    width: 100% !important;
    max-width: 100% !important;
    flex-grow: 0 !important;
  }
  .slot-division-panel {
    padding-bottom: 8px;
  }
  .custom-slot-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .slot-sep {
    color: #909399;
  }
  .slot-confirm-item {
    margin-top: 4px;
  }
  .confirmed-slots {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
  .slot-select-all {
    margin-bottom: 8px;
  }
}
</style>
