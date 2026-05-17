<template>
  <div class="experience-setting">
    <Card>
      <Form :label-width="120" label-position="right">
        <Table :loading="loading" :columns="columns" :data="form.items" class="mt_10 experience-table"></Table>
        <FormItem label="经验值说明" style="margin-top: 16px" class="desc-item">
          <Input
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入经验值说明"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" :loading="submitLoading" @click="submit">保存</Button>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<script>
import { getSetting, setSetting } from "@/api/index";

const RULE_OPTIONS = [
  { ruleKey: "CONSUME", ruleName: "消费" },
  { ruleKey: "REGISTER", ruleName: "注册" },
  { ruleKey: "SIGN_IN", ruleName: "签到" },
  { ruleKey: "COMMENT", ruleName: "评价" },
  { ruleKey: "SHARE", ruleName: "分享商城" },
  { ruleKey: "PROFILE", ruleName: "完善信息" },
  { ruleKey: "FOLLOW_STORE", ruleName: "关注店铺" },
  { ruleKey: "BIND_WECHAT", ruleName: "绑定微信" },
  { ruleKey: "ADD_ADDRESS", ruleName: "添加收货地址" },
  { ruleKey: "SHARE_REGISTER", ruleName: "分享注册" },
  { ruleKey: "SHARE_BUY", ruleName: "分享购买" },
];

const defaultRuleItem = (rule) => ({
  ruleKey: rule.ruleKey,
  ruleName: rule.ruleName,
  enabled: false,
  value: 1,
  maxValue: null,
});

const defaultForm = () => ({
  items: RULE_OPTIONS.map((item) => defaultRuleItem(item)),
  description: "",
});

export default {
  name: "memberGradeExperienceSetting",
  data() {
    return {
      loading: false,
      submitLoading: false,
      form: defaultForm(),
      columns: [
        {
          title: "是否开启",
          key: "enabled",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h("Checkbox", {
              props: { value: !!this.form.items[params.index].enabled },
              on: {
                "on-change": (checked) => {
                  this.updateRuleEnabled(params.index, checked);
                },
              },
            });
          },
        },
        {
          title: "类型",
          key: "ruleName",
          width: 160,
        },
        {
          title: "经验值(1-100)",
          key: "value",
          minWidth: 700,
          render: (h, params) => {
            const row = this.form.items[params.index] || {};
            const inputNode = h("Input", {
              style: { width: "120px" },
              props: {
                value: row.value == null ? "" : String(row.value),
                number: true,
              },
              on: {
                input: (val) => {
                  this.updateRuleValue(params.index, val);
                },
                "on-change": (v) => {
                  this.updateRuleValue(params.index, v);
                },
                "on-blur": () => {
                  this.commitRuleValue(params.index);
                },
              },
            });
            const maxInputNode = h("Input", {
              style: { width: "120px" },
              props: {
                value: row.maxValue == null ? "" : String(row.maxValue),
                number: true,
              },
              on: {
                input: (val) => {
                  this.updateRuleMaxValue(params.index, val);
                },
                "on-change": (v) => {
                  this.updateRuleMaxValue(params.index, v);
                },
                "on-blur": () => {
                  this.commitRuleMaxValue(params.index);
                },
              },
            });
            if (params.row.ruleKey === "REGISTER") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center" } },
                    [h("span", { style: { marginRight: "8px" } }, "获得经验值:"), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "会员注册成功后可获得经验值"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "SHARE") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center", marginRight: "16px" } },
                        [h("span", { style: { marginRight: "8px" } }, "分享商品详情页获得经验值："), inputNode]
                      ),
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center" } },
                        [h("span", { style: { marginRight: "8px" } }, "可获得经验值限额："), maxInputNode]
                      ),
                    ]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "会员分享商城页面可获得的经验值"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "COMMENT") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "对已购买商品完成提交评论获得经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "仅针对评论字数大于30字的评论进行发放"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "FOLLOW_STORE") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center", marginRight: "16px" } },
                        [h("span", { style: { marginRight: "8px" } }, "获得经验值："), inputNode]
                      ),
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center" } },
                        [h("span", { style: { marginRight: "8px" } }, "可获得经验值限额："), maxInputNode]
                      ),
                    ]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "关注店铺可获得经验值，每个客户D相同店铺仅第一次关注可进行获得"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "PROFILE") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "获得经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "完善个人基本信息可获得经验值，每个会员仅可获得一次"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "BIND_WECHAT") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "获取经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "绑定微信成功获得经验值，每个会员仅可获得一次"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "ADD_ADDRESS") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "获取经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "添加收货地址后获得经验值，每个会员仅可获得一次"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "SHARE_REGISTER") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center", marginRight: "16px" } },
                        [h("span", { style: { marginRight: "8px" } }, "获取的经验值："), inputNode]
                      ),
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center" } },
                        [h("span", { style: { marginRight: "8px" } }, "可获得经验值限额："), maxInputNode]
                      ),
                    ]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "仅被注册成功后才可获得相应奖励经验值"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "SHARE_BUY") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center", marginRight: "16px" } },
                        [h("span", { style: { marginRight: "8px" } }, "获取的经验值："), inputNode]
                      ),
                      h(
                        "div",
                        { style: { display: "flex", alignItems: "center" } },
                        [h("span", { style: { marginRight: "8px" } }, "可获得经验值限额："), maxInputNode]
                      ),
                    ]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "仅被购买成功后才可获得相应奖励经验值"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "SIGN_IN") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "获取的经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "客户每日签到后可获的经验值"
                  ),
                ]
              );
            }
            if (params.row.ruleKey === "CONSUME") {
              return h(
                "div",
                { style: { display: "flex", flexDirection: "column", alignItems: "flex-start" } },
                [
                  h(
                    "div",
                    { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } },
                    [h("span", { style: { marginRight: "8px" } }, "1元获取经验值："), inputNode]
                  ),
                  h(
                    "div",
                    { style: { marginTop: "6px", color: "#808695", fontSize: "12px" } },
                    "客户消费1元可获取经验值，向下取整"
                  ),
                ]
              );
            }
            return inputNode;
          },
        },
      ],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    getRawInputValue(v) {
      return v && v.target ? v.target.value : v;
    },
    updateRuleEnabled(index, enabled) {
      const item = this.form.items[index] || {};
      this.$set(this.form.items, index, {
        ...item,
        enabled: !!enabled,
      });
    },
    updateRuleValue(index, v) {
      const raw = this.getRawInputValue(v);
      const next = Number(raw);
      const item = this.form.items[index] || {};
      this.$set(this.form.items, index, {
        ...item,
        value: Number.isFinite(next) ? next : null,
      });
    },
    commitRuleValue(index) {
      const item = this.form.items[index] || {};
      const next = Number(item.value);
      let value = 1;
      if (Number.isFinite(next)) {
        if (next < 1) value = 1;
        else if (next > 100) value = 100;
        else value = Math.floor(next);
      }
      this.$set(this.form.items, index, {
        ...item,
        value,
      });
    },
    updateRuleMaxValue(index, v) {
      const raw = this.getRawInputValue(v);
      const item = this.form.items[index] || {};
      if (raw == null || raw === "") {
        this.$set(this.form.items, index, {
          ...item,
          maxValue: null,
        });
        return;
      }
      const next = Number(raw);
      this.$set(this.form.items, index, {
        ...item,
        maxValue: Number.isFinite(next) ? next : null,
      });
    },
    commitRuleMaxValue(index) {
      const item = this.form.items[index] || {};
      if (item.maxValue == null || item.maxValue === "") {
        this.$set(this.form.items, index, {
          ...item,
          maxValue: null,
        });
        return;
      }
      const next = Number(item.maxValue);
      this.$set(this.form.items, index, {
        ...item,
        maxValue: Number.isFinite(next) && next >= 1 ? Math.floor(next) : null,
      });
    },
    normalizeConfig(val) {
      if (!val) return {};
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch (e) {
          return {};
        }
      }
      if (typeof val === "object") return val;
      return {};
    },
    normalizeItems(items) {
      const map = {};
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (!item || !item.ruleKey) return;
          map[item.ruleKey] = item;
        });
      }
      return RULE_OPTIONS.map((rule) => {
        const hit = map[rule.ruleKey] || {};
        return {
          ruleKey: rule.ruleKey,
          ruleName: hit.ruleName || rule.ruleName,
          enabled: !!hit.enabled,
          value: Number(hit.value) > 0 ? Number(hit.value) : 1,
          maxValue: hit.maxValue == null || hit.maxValue === "" ? null : Number(hit.maxValue),
        };
      });
    },
    loadData() {
      this.loading = true;
      getSetting("EXPERIENCE_SETTING")
        .then((res) => {
          if (res && res.success) {
            const cfg = this.normalizeConfig(res.result);
            this.form = {
              items: this.normalizeItems(cfg.items),
              description: cfg.description || "",
            };
          } else {
            this.form = defaultForm();
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validateForm() {
      const invalid = this.form.items.find((item) => {
        const v = Number(item.value);
        if (!Number.isInteger(v) || v < 1 || v > 100) return true;
        if (item.maxValue != null && item.maxValue !== "") {
          const m = Number(item.maxValue);
          if (!Number.isInteger(m) || m < 1) return true;
        }
        return false;
      });
      if (invalid) {
        this.$Message.error("请检查经验值配置，经验值范围为1-100，限额需为正整数");
        return false;
      }
      return true;
    },
    submit() {
      if (!this.validateForm()) return;
      const payload = {
        items: this.form.items.map((item) => ({
          ruleKey: item.ruleKey,
          ruleName: item.ruleName,
          enabled: !!item.enabled,
          value: Number(item.value),
          maxValue: item.maxValue == null || item.maxValue === "" ? null : Number(item.maxValue),
        })),
        description: this.form.description || "",
      };
      this.submitLoading = true;
      setSetting("EXPERIENCE_SETTING", payload)
        .then((res) => {
          if (res && res.success) {
            this.$Message.success("保存成功");
          }
        })
        .finally(() => {
          this.submitLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.experience-setting {
  padding: 2px 0;
}

::v-deep .experience-table .ivu-table th {
  background: #fafbfc;
}

::v-deep .experience-table .ivu-table td {
  padding-top: 12px;
  padding-bottom: 12px;
}

::v-deep .experience-table .ivu-table-cell {
  font-size: 13px;
  line-height: 1.7;
}

::v-deep .desc-item .ivu-form-item-label {
  font-size: 16px;
  font-weight: 600;
}
</style>
