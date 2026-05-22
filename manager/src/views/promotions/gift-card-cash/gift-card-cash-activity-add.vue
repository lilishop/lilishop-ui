<template>
  <div>
    <Card :loading="detailLoading">
      <Form ref="form" :model="form" :label-width="130" :rules="onlyView ? {} : formRule">
        <div class="base-info-item">
          <h4>{{ pageTitle }}</h4>
          <div class="form-item-view gift-card-activity-form">
            <FormItem label="礼品卡名称" prop="giftCardName">
              <Input
                v-model="form.giftCardName"
                type="text"
                placeholder="请输入礼品卡名称"
                clearable
                maxlength="64"
                show-word-limit
                style="width: 360px"
                :disabled="onlyView"
              />
            </FormItem>
            <FormItem label="礼品卡类型" prop="cardType" class="gift-card-type-form-item">
              <RadioGroup v-model="form.cardType" class="gift-card-type-group">
                <Radio label="CASH" :disabled="onlyView">现金卡</Radio>
                <Radio label="PICKUP" disabled>提货卡</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="面值" prop="faceValue">
              <Input
                v-model="form.faceValue"
                type="text"
                placeholder="面值"
                clearable
                style="width: 200px"
                :disabled="onlyView"
              />
            </FormItem>
            <FormItem label="总库存" prop="stockTotal">
              <InputNumber
                v-model="form.stockTotal"
                :min="1"
                :precision="0"
                placeholder="最多可制发凭证张数"
                style="width: 200px"
                :disabled="onlyView"
              />
            </FormItem>
            <FormItem prop="validityType" :label-width="0" class="gift-card-validity-form-item">
              <div class="gift-card-validity-outer">
                <div class="gift-card-validity-label-col">
                  <span v-if="!onlyView" class="gift-card-validity-required">*</span>
                  <span>有效期</span>
                </div>
                <div class="gift-card-validity-radios">
                  <RadioGroup v-model="form.validityType" vertical class="gift-card-validity-group">
                    <Radio label="LONG_TERM" class="gift-card-validity-row" :disabled="onlyView"
                      >长期有效</Radio
                    >
                    <Radio label="AFTER_ACTIVATE_MONTHS" class="gift-card-validity-row" :disabled="onlyView">
                      <span>自激活后</span>
                      <InputNumber
                        v-model="form.validMonthsAfterActivate"
                        :min="1"
                        :max="99"
                        :precision="0"
                        placeholder="请输入1-99的整数"
                        :disabled="onlyView || form.validityType !== 'AFTER_ACTIVATE_MONTHS'"
                        class="gift-card-validity-input-gap"
                      />
                      <span>月内有效</span>
                    </Radio>
                    <Radio label="FIXED_UNTIL" class="gift-card-validity-row" :disabled="onlyView">
                      <span>指定有效期至</span>
                      <DatePicker
                        v-model="form.validEndTime"
                        type="datetime"
                        format="yyyy-MM-dd HH:mm:ss"
                        placeholder="选择结束时间"
                        clearable
                        transfer
                        :disabled="onlyView || form.validityType !== 'FIXED_UNTIL'"
                        class="gift-card-validity-date-gap"
                        style="width: 220px"
                      />
                    </Radio>
                  </RadioGroup>
                </div>
              </div>
            </FormItem>
          </div>
          <div class="foot-btn">
            <Button style="margin-right: 8px" @click="closeCurrentPage">返回</Button>
            <Button
              v-if="!onlyView"
              type="primary"
              :loading="submitLoading"
              @click="handleSubmit"
              >提交</Button
            >
          </div>
        </div>
      </Form>
    </Card>
  </div>
</template>

<script>
import {
  saveGiftCardCashActivity,
  getGiftCardCashActivity,
  updateGiftCardCashActivity,
} from "@/api/promotion";
import { regular } from "@/utils";

export default {
  name: "addGiftCardCashActivity",
  data() {
    const checkFaceValue = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error("面额不能为空"));
      }
      if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("面额设置超过上限值"));
      } else if (parseFloat(value) < 0.01) {
        callback(new Error("面值必须大于 0"));
      } else {
        callback();
      }
    };
    const validateStock = (rule, value, callback) => {
      if (value === null || value === undefined || value === "") {
        callback(new Error("请填写总库存"));
        return;
      }
      if (Number(value) < 1) {
        callback(new Error("活动库存至少为 1"));
        return;
      }
      callback();
    };
    return {
      detailLoading: false,
      submitLoading: false,
      form: {
        giftCardName: "",
        cardType: "CASH",
        faceValue: "",
        stockTotal: null,
        validityType: "LONG_TERM",
        validEndTime: null,
        validMonthsAfterActivate: null,
      },
      formRule: {
        giftCardName: [
          { required: true, message: "活动名称不能为空", trigger: "blur" },
          { type: "string", max: 64, message: "活动名称过长", trigger: "blur" },
        ],
        faceValue: [{ required: true, message: "请输入面额" }, { validator: checkFaceValue }],
        stockTotal: [{ required: true, validator: validateStock, trigger: "blur" }],
      },
    };
  },
  computed: {
    onlyView() {
      const q = this.$route.query.onlyView;
      return q === "true" || q === true;
    },
    isEditMode() {
      return !!this.$route.query.id && !this.onlyView;
    },
    pageTitle() {
      if (this.onlyView) {
        return "查看礼品卡";
      }
      if (this.isEditMode) {
        return "编辑礼品卡";
      }
      return "添加礼品卡";
    },
  },
  mounted() {
    if (this.$route.query.id) {
      this.loadDetail(this.$route.query.id);
    }
  },
  watch: {
    "form.validityType"(v) {
      if (v !== "FIXED_UNTIL") {
        this.form.validEndTime = null;
      }
      if (v !== "AFTER_ACTIVATE_MONTHS") {
        this.form.validMonthsAfterActivate = null;
      }
    },
    "$route.query.id"(id) {
      if (id) {
        this.loadDetail(id);
      }
    },
  },
  methods: {
    parseDetailDate(val) {
      if (!val) {
        return null;
      }
      if (val instanceof Date) {
        return val;
      }
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? null : d;
    },
    loadDetail(id) {
      this.detailLoading = true;
      getGiftCardCashActivity(id)
        .then((res) => {
          this.detailLoading = false;
          if (!res.success || !res.result) {
            return;
          }
          const d = res.result;
          this.form.giftCardName = d.giftCardName || "";
          this.form.cardType = d.cardType || "CASH";
          this.form.faceValue =
            d.faceValue !== null && d.faceValue !== undefined ? String(d.faceValue) : "";
          this.form.stockTotal =
            d.stockTotal !== null && d.stockTotal !== undefined ? d.stockTotal : null;
          this.form.validityType = d.validityType || "LONG_TERM";
          this.form.validEndTime = this.parseDetailDate(d.validEndTime);
          this.form.validMonthsAfterActivate =
            d.validMonthsAfterActivate !== null &&
            d.validMonthsAfterActivate !== undefined &&
            d.validMonthsAfterActivate !== ""
              ? d.validMonthsAfterActivate
              : null;
        })
        .catch(() => {
          this.detailLoading = false;
        });
    },
    closeCurrentPage() {
      const name = this.$route.name;
      if (name) {
        this.$store.commit("removeTag", name);
      }
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    validateByValidityType() {
      const t = this.form.validityType;
      if (t === "FIXED_UNTIL") {
        if (!this.form.validEndTime) {
          this.$Message.warning("请选择结束时间");
          return false;
        }
      }
      if (t === "AFTER_ACTIVATE_MONTHS") {
        const m = this.form.validMonthsAfterActivate;
        if (m === null || m === undefined || m === "" || Number(m) < 1 || Number(m) > 99) {
          this.$Message.warning("请输入1-99的整数");
          return false;
        }
      }
      return true;
    },
    buildPayload() {
      const payload = {
        giftCardName: (this.form.giftCardName || "").trim(),
        cardType: this.form.cardType || "CASH",
        faceValue: parseFloat(this.form.faceValue),
        validityType: this.form.validityType || "LONG_TERM",
        stockTotal: this.form.stockTotal,
      };
      if (payload.validityType === "FIXED_UNTIL") {
        payload.validEndTime = this.form.validEndTime;
      }
      if (payload.validityType === "AFTER_ACTIVATE_MONTHS") {
        payload.validMonthsAfterActivate = this.form.validMonthsAfterActivate;
      }
      return payload;
    },
    handleSubmit() {
      if (this.onlyView) {
        return;
      }
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return;
        }
        if (!this.validateByValidityType()) {
          return;
        }
        this.submitLoading = true;
        const req = this.isEditMode
          ? updateGiftCardCashActivity(this.$route.query.id, this.buildPayload())
          : saveGiftCardCashActivity(this.buildPayload());
        req
          .then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success(
                this.isEditMode ? "礼品卡活动已更新" : "礼品卡活动创建成功"
              );
              this.closeCurrentPage();
            }
          })
          .catch(() => {
            this.submitLoading = false;
          });
      });
    },
  },
};
</script>

<style scoped>
.gift-card-activity-form >>> .ivu-form-item {
  margin-bottom: 26px;
}
.gift-card-type-form-item >>> .ivu-form-item-label {
  line-height: 32px;
  padding-top: 1px;
}
.gift-card-type-form-item >>> .ivu-form-item-content {
  display: flex;
  align-items: center;
  min-height: 32px;
}
.gift-card-type-group >>> .ivu-radio-wrapper {
  margin-right: 32px;
  line-height: 32px;
  display: inline-flex !important;
  align-items: center;
  vertical-align: middle;
}
.gift-card-validity-form-item >>> .ivu-form-item-content {
  margin-left: 0 !important;
}
.gift-card-validity-outer {
  display: flex;
  align-items: flex-start;
  width: 100%;
}
.gift-card-validity-label-col {
  flex: 0 0 130px;
  width: 130px;
  padding-right: 12px;
  box-sizing: border-box;
  text-align: right;
  line-height: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 1px;
}
.gift-card-validity-required {
  color: #ed4014;
  margin-right: 4px;
  font-family: SimSun, serif;
}
.gift-card-validity-radios {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}
.gift-card-validity-group {
  padding-top: 0;
  padding-bottom: 0;
}
.gift-card-type-group >>> .ivu-radio {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.gift-card-validity-group >>> .ivu-radio {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.gift-card-validity-group >>> .ivu-radio-wrapper:first-child {
  margin-top: 0;
}
.gift-card-validity-group >>> .ivu-radio-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
  line-height: 32px;
  min-height: 32px;
}
.gift-card-validity-group >>> .ivu-radio-wrapper:last-child {
  margin-bottom: 0;
}
.gift-card-validity-input-gap {
  width: 168px;
  margin: 0 10px;
}
.gift-card-validity-date-gap {
  margin-left: 10px;
}
</style>
