<template>
  <div class="experience-setting">
    <el-card>
      <el-form label-width="120px" label-position="right">
        <el-table
          v-loading="loading"
          :data="form.items"
          class="mt_10 experience-table"
          style="width: 100%"
        >
          <el-table-column label="是否开启" width="90" align="center">
            <template #default="{ row, $index }">
              <el-checkbox
                v-if="row"
                :model-value="!!form.items[$index].enabled"
                @change="(checked) => updateRuleEnabled($index, checked)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="ruleName" label="类型" width="160" />
          <el-table-column label="经验值(1-100)" min-width="700">
            <template #default="{ row, $index }">
              <template v-if="row">
                <div v-if="row.ruleKey === 'REGISTER'" class="rule-cell">
                  <div class="rule-row">
                    <span class="rule-label">获得经验值:</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">会员注册成功后可获得经验值</div>
                </div>

                <div v-else-if="row.ruleKey === 'SHARE'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <div class="rule-inline">
                      <span class="rule-label">分享商品详情页获得经验值：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].value)"
                        style="width: 120px"
                        @input="(val) => updateRuleValue($index, val)"
                        @blur="() => commitRuleValue($index)"
                      />
                    </div>
                    <div class="rule-inline">
                      <span class="rule-label">可获得经验值限额：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].maxValue)"
                        style="width: 120px"
                        @input="(val) => updateRuleMaxValue($index, val)"
                        @blur="() => commitRuleMaxValue($index)"
                      />
                    </div>
                  </div>
                  <div class="rule-tip">会员分享商城页面可获得的经验值</div>
                </div>

                <div v-else-if="row.ruleKey === 'COMMENT'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">对已购买商品完成提交评论获得经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">仅针对评论字数大于30字的评论进行发放</div>
                </div>

                <div v-else-if="row.ruleKey === 'FOLLOW_STORE'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <div class="rule-inline">
                      <span class="rule-label">获得经验值：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].value)"
                        style="width: 120px"
                        @input="(val) => updateRuleValue($index, val)"
                        @blur="() => commitRuleValue($index)"
                      />
                    </div>
                    <div class="rule-inline">
                      <span class="rule-label">可获得经验值限额：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].maxValue)"
                        style="width: 120px"
                        @input="(val) => updateRuleMaxValue($index, val)"
                        @blur="() => commitRuleMaxValue($index)"
                      />
                    </div>
                  </div>
                  <div class="rule-tip">关注店铺可获得经验值，每个客户D相同店铺仅第一次关注可进行获得</div>
                </div>

                <div v-else-if="row.ruleKey === 'PROFILE'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">获得经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">完善个人基本信息可获得经验值，每个会员仅可获得一次</div>
                </div>

                <div v-else-if="row.ruleKey === 'BIND_WECHAT'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">获取经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">绑定微信成功获得经验值，每个会员仅可获得一次</div>
                </div>

                <div v-else-if="row.ruleKey === 'ADD_ADDRESS'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">获取经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">添加收货地址后获得经验值，每个会员仅可获得一次</div>
                </div>

                <div v-else-if="row.ruleKey === 'SHARE_REGISTER'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <div class="rule-inline">
                      <span class="rule-label">获取的经验值：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].value)"
                        style="width: 120px"
                        @input="(val) => updateRuleValue($index, val)"
                        @blur="() => commitRuleValue($index)"
                      />
                    </div>
                    <div class="rule-inline">
                      <span class="rule-label">可获得经验值限额：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].maxValue)"
                        style="width: 120px"
                        @input="(val) => updateRuleMaxValue($index, val)"
                        @blur="() => commitRuleMaxValue($index)"
                      />
                    </div>
                  </div>
                  <div class="rule-tip">仅被注册成功后才可获得相应奖励经验值</div>
                </div>

                <div v-else-if="row.ruleKey === 'SHARE_BUY'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <div class="rule-inline">
                      <span class="rule-label">获取的经验值：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].value)"
                        style="width: 120px"
                        @input="(val) => updateRuleValue($index, val)"
                        @blur="() => commitRuleValue($index)"
                      />
                    </div>
                    <div class="rule-inline">
                      <span class="rule-label">可获得经验值限额：</span>
                      <el-input
                        :model-value="formatInputValue(form.items[$index].maxValue)"
                        style="width: 120px"
                        @input="(val) => updateRuleMaxValue($index, val)"
                        @blur="() => commitRuleMaxValue($index)"
                      />
                    </div>
                  </div>
                  <div class="rule-tip">仅被购买成功后才可获得相应奖励经验值</div>
                </div>

                <div v-else-if="row.ruleKey === 'SIGN_IN'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">获取的经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">客户每日签到后可获的经验值</div>
                </div>

                <div v-else-if="row.ruleKey === 'CONSUME'" class="rule-cell">
                  <div class="rule-row rule-row-wrap">
                    <span class="rule-label">1元获取经验值：</span>
                    <el-input
                      :model-value="formatInputValue(form.items[$index].value)"
                      style="width: 120px"
                      @input="(val) => updateRuleValue($index, val)"
                      @blur="() => commitRuleValue($index)"
                    />
                  </div>
                  <div class="rule-tip">客户消费1元可获取经验值，向下取整</div>
                </div>

                <el-input
                  v-else
                  :model-value="formatInputValue(form.items[$index].value)"
                  style="width: 120px"
                  @input="(val) => updateRuleValue($index, val)"
                  @blur="() => commitRuleValue($index)"
                />
              </template>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item label="经验值说明" style="margin-top: 16px" class="desc-item">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入经验值说明"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="submit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getSetting, setSetting } from "@/api/index";
import { ElMessage } from "element-plus";

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
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    formatInputValue(v) {
      return v == null ? "" : String(v);
    },
    getRawInputValue(v) {
      return v && v.target ? v.target.value : v;
    },
    updateRuleEnabled(index, enabled) {
      const item = this.form.items[index] || {};
      this.form.items[index] = {
        ...item,
        enabled: !!enabled,
      };
    },
    updateRuleValue(index, v) {
      const raw = this.getRawInputValue(v);
      const next = Number(raw);
      const item = this.form.items[index] || {};
      this.form.items[index] = {
        ...item,
        value: Number.isFinite(next) ? next : null,
      };
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
      this.form.items[index] = {
        ...item,
        value,
      };
    },
    updateRuleMaxValue(index, v) {
      const raw = this.getRawInputValue(v);
      const item = this.form.items[index] || {};
      if (raw == null || raw === "") {
        this.form.items[index] = {
          ...item,
          maxValue: null,
        };
        return;
      }
      const next = Number(raw);
      this.form.items[index] = {
        ...item,
        maxValue: Number.isFinite(next) ? next : null,
      };
    },
    commitRuleMaxValue(index) {
      const item = this.form.items[index] || {};
      if (item.maxValue == null || item.maxValue === "") {
        this.form.items[index] = {
          ...item,
          maxValue: null,
        };
        return;
      }
      const next = Number(item.maxValue);
      this.form.items[index] = {
        ...item,
        maxValue: Number.isFinite(next) && next >= 1 ? Math.floor(next) : null,
      };
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
        ElMessage.error("请检查经验值配置，经验值范围为1-100，限额需为正整数");
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
            ElMessage.success("保存成功");
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

.rule-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.rule-row {
  display: flex;
  align-items: center;
}

.rule-row-wrap {
  flex-wrap: wrap;
}

.rule-inline {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.rule-label {
  margin-right: 8px;
}

.rule-tip {
  margin-top: 6px;
  color: #808695;
  font-size: 12px;
}

:deep(.experience-table .el-table__header th) {
  background: #fafbfc;
}

:deep(.experience-table .el-table__body td) {
  padding-top: 12px;
  padding-bottom: 12px;
}

:deep(.experience-table .cell) {
  font-size: 13px;
  line-height: 1.7;
}

:deep(.desc-item .el-form-item__label) {
  font-size: 16px;
  font-weight: 600;
}
</style>
