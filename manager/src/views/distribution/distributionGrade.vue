<template>
  <div class="search">
    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" :disabled="data.length >= 5" @click="addRow">添加分销等级</el-button>
        <span v-if="data.length >= 5" class="limit-tip">最多添加5个等级</span>
      </div>

      <el-table v-loading="loading" border :data="data" class="mt_10 grade-table" style="width: 100%">
        <el-table-column label="等级值" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.sortOrder }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级名" min-width="140">
          <template #default="{ row }">
            <el-input v-model="row.gradeName" maxlength="50" placeholder="请输入等级名" />
          </template>
        </el-table-column>
        <el-table-column label="升级规则" min-width="300">
          <template #default="{ row }">
            <div v-if="isBaseGrade(row)" class="no-condition-tip">初始等级，无需设置</div>
            <div v-else class="grade-edit-lines">
              <div class="grade-edit-line">
                <el-checkbox v-model="row.enableSalesCondition" />
                <span class="line-label">销售额达到</span>
                <el-input-number
                  v-model="row.salesThreshold"
                  :min="0"
                  :precision="2"
                  :disabled="!row.enableSalesCondition"
                  controls-position="right"
                  class="inline-number"
                />
                <span class="line-unit">元</span>
              </div>
              <div class="grade-edit-line">
                <el-checkbox v-model="row.enableCommissionCondition" />
                <span class="line-label">收益额</span>
                <el-input-number
                  v-model="row.commissionThreshold"
                  :min="0"
                  :precision="2"
                  :disabled="!row.enableCommissionCondition"
                  controls-position="right"
                  class="inline-number"
                />
                <span class="line-unit">元</span>
              </div>
              <div class="grade-edit-line">
                <el-checkbox v-model="row.enableInviteCondition" />
                <span class="line-label">邀请人数</span>
                <el-input-number
                  v-model="row.inviteThreshold"
                  :min="0"
                  :precision="0"
                  :disabled="!row.enableInviteCondition"
                  controls-position="right"
                  class="inline-number"
                />
                <span class="line-unit">人</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="佣金返利" min-width="220">
          <template #default="{ row }">
            <div class="grade-edit-lines">
              <div class="grade-edit-line">
                <span class="line-label">佣金比例</span>
                <el-input-number
                  v-model="row.goodsCommissionRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  controls-position="right"
                  class="inline-number"
                />
                <span class="line-unit">%</span>
              </div>
              <div class="grade-edit-line">
                <span class="line-label">邀请奖励</span>
                <el-input-number
                  v-model="row.inviteCommissionRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  controls-position="right"
                  class="inline-number"
                />
                <span class="line-unit">%</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row, $index }">
            <span v-if="isBaseGrade(row)" class="disabled-text">-</span>
            <a v-else class="link-text" @click.prevent="remove(row, $index)">删除</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="grade-footer">
        <el-button type="primary" :loading="saveLoading" @click="saveAll">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getDistributionGrades,
  saveAllDistributionGrades,
  deleteDistributionGrade,
} from "@/api/distribution";

const MAX_GRADE_COUNT = 5;
const GRADE_VALUE_OPTIONS = [1, 2, 3, 4, 5];
const BASE_GRADE_VALUE = 1;
const BASE_GRADE_NAME = "普通分销员";

const toPercent = (decimal) => {
  const num = Number(decimal);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Number((num * 100).toFixed(2));
};

const toFraction = (percent) => {
  const num = Number(percent);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Number((num / 100).toFixed(4));
};

const buildDefaultRow = (sortOrder = null) => {
  const isBaseGrade = sortOrder === BASE_GRADE_VALUE;
  return {
    _key: `grade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    id: "",
    gradeName: isBaseGrade ? BASE_GRADE_NAME : "",
    sortOrder,
    salesThreshold: 0,
    commissionThreshold: 0,
    inviteThreshold: 0,
    enableSalesCondition: false,
    enableCommissionCondition: false,
    enableInviteCondition: false,
    goodsCommissionRate: 0,
    inviteCommissionRate: 0,
  };
};

export default {
  name: "distributionGrade",
  data() {
    return {
      loading: true,
      saveLoading: false,
      data: [],
    };
  },
  mounted() {
    this.getDataList();
  },
  methods: {
    normalizeRow(row, index) {
      const normalized = {
        ...buildDefaultRow(row.sortOrder),
        ...row,
        enableSalesCondition: row.enableSalesCondition !== false,
        enableCommissionCondition: row.enableCommissionCondition !== false,
        enableInviteCondition: row.enableInviteCondition !== false,
        goodsCommissionRate: toPercent(row.goodsCommissionRate),
        inviteCommissionRate: toPercent(row.inviteCommissionRate),
        _key: row._key || row.id || `grade_${index}_${Date.now()}`,
      };
      if (this.isBaseGrade(normalized)) {
        normalized.enableSalesCondition = false;
        normalized.enableCommissionCondition = false;
        normalized.enableInviteCondition = false;
        if (!normalized.gradeName || !normalized.gradeName.trim()) {
          normalized.gradeName = BASE_GRADE_NAME;
        }
      }
      return normalized;
    },
    isBaseGrade(row) {
      return row && row.sortOrder === BASE_GRADE_VALUE;
    },
    getSortedRows() {
      return this.data.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    },
    getGradeLabel(row) {
      return row.gradeName && row.gradeName.trim() ? row.gradeName.trim() : `等级值${row.sortOrder}`;
    },
    getNextGradeValue() {
      const used = new Set(this.data.map((item) => item.sortOrder));
      return GRADE_VALUE_OPTIONS.find((value) => value !== BASE_GRADE_VALUE && !used.has(value)) || null;
    },
    getDataList() {
      this.loading = true;
      getDistributionGrades().then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = (res.result || [])
            .slice()
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((item, index) => this.normalizeRow(item, index));
        }
      });
    },
    addRow() {
      if (this.data.length >= MAX_GRADE_COUNT) {
        this.$Message.warning("最多添加5个分销等级");
        return;
      }
      const nextGradeValue = this.getNextGradeValue();
      if (!nextGradeValue) {
        this.$Message.warning("等级值1-5已全部使用");
        return;
      }
      this.data.push(buildDefaultRow(nextGradeValue));
    },
    validateGradeProgression() {
      const rows = this.getSortedRows();
      for (let i = 1; i < rows.length; i++) {
        const lower = rows[i - 1];
        const higher = rows[i];
        const lowerLabel = this.getGradeLabel(lower);
        const higherLabel = this.getGradeLabel(higher);
        if (lower.enableSalesCondition) {
          if (!higher.enableSalesCondition) {
            this.$Message.warning(`${higherLabel}必须启用${lowerLabel}已启用的销售额升级条件`);
            return false;
          }
          if (Number(higher.salesThreshold || 0) < Number(lower.salesThreshold || 0)) {
            this.$Message.warning(`${higherLabel}销售额阈值不能小于${lowerLabel}`);
            return false;
          }
        }
        if (lower.enableCommissionCondition) {
          if (!higher.enableCommissionCondition) {
            this.$Message.warning(`${higherLabel}必须启用${lowerLabel}已启用的收益额升级条件`);
            return false;
          }
          if (Number(higher.commissionThreshold || 0) < Number(lower.commissionThreshold || 0)) {
            this.$Message.warning(`${higherLabel}收益额阈值不能小于${lowerLabel}`);
            return false;
          }
        }
        if (lower.enableInviteCondition) {
          if (!higher.enableInviteCondition) {
            this.$Message.warning(`${higherLabel}必须启用${lowerLabel}已启用的邀请人数升级条件`);
            return false;
          }
          if (Number(higher.inviteThreshold || 0) < Number(lower.inviteThreshold || 0)) {
            this.$Message.warning(`${higherLabel}邀请人数阈值不能小于${lowerLabel}`);
            return false;
          }
        }
      }
      return true;
    },
    validateRows() {
      if (!this.data.length) {
        this.$Message.warning("请至少添加一个分销等级");
        return false;
      }
      const usedValues = [];
      for (let i = 0; i < this.data.length; i++) {
        const row = this.data[i];
        if (!row.sortOrder) {
          this.$Message.warning(`请填写第${i + 1}行等级值`);
          return false;
        }
        if (usedValues.includes(row.sortOrder)) {
          this.$Message.warning("等级值不能重复");
          return false;
        }
        usedValues.push(row.sortOrder);
        if (!row.gradeName || !row.gradeName.trim()) {
          this.$Message.warning(`请填写第${i + 1}行等级名`);
          return false;
        }
        if (this.isBaseGrade(row)) {
          continue;
        }
        if (!row.enableSalesCondition && !row.enableCommissionCondition && !row.enableInviteCondition) {
          this.$Message.warning(`第${i + 1}行请至少启用一项升级规则`);
          return false;
        }
        const rowLabel = this.getGradeLabel(row);
        if (row.enableSalesCondition && Number(row.salesThreshold || 0) <= 0) {
          this.$Message.warning(`${rowLabel}销售额必须大于0`);
          return false;
        }
        if (row.enableCommissionCondition && Number(row.commissionThreshold || 0) <= 0) {
          this.$Message.warning(`${rowLabel}收益额必须大于0`);
          return false;
        }
        if (row.enableInviteCondition && Number(row.inviteThreshold || 0) <= 0) {
          this.$Message.warning(`${rowLabel}邀请人数必须大于0`);
          return false;
        }
      }
      return this.validateGradeProgression() && this.validateCrossRates();
    },
    validateCrossRates() {
      let maxGoods = 0;
      let maxInvite = 0;
      for (const row of this.data) {
        maxGoods = Math.max(maxGoods, Number(row.goodsCommissionRate || 0));
        maxInvite = Math.max(maxInvite, Number(row.inviteCommissionRate || 0));
      }
      if (maxGoods + maxInvite > 100) {
        this.$Message.warning(
          `所有等级中最高佣金比例（${maxGoods}%）与最高邀请奖励（${maxInvite}%）之和不能超过100%`
        );
        return false;
      }
      for (const row of this.data) {
        const goods = Number(row.goodsCommissionRate || 0);
        const invite = Number(row.inviteCommissionRate || 0);
        if (goods + invite > 100) {
          this.$Message.warning(`${this.getGradeLabel(row)}的佣金比例与邀请奖励之和不能超过100%`);
          return false;
        }
      }
      return true;
    },
    buildPayload(row) {
      const isBaseGrade = this.isBaseGrade(row);
      return {
        id: row.id || undefined,
        gradeName: row.gradeName.trim(),
        sortOrder: row.sortOrder,
        salesThreshold: row.salesThreshold,
        commissionThreshold: row.commissionThreshold,
        inviteThreshold: row.inviteThreshold,
        enableSalesCondition: isBaseGrade ? false : row.enableSalesCondition,
        enableCommissionCondition: isBaseGrade ? false : row.enableCommissionCondition,
        enableInviteCondition: isBaseGrade ? false : row.enableInviteCondition,
        goodsCommissionRate: toFraction(row.goodsCommissionRate),
        inviteCommissionRate: toFraction(row.inviteCommissionRate),
      };
    },
    async saveAll() {
      if (!this.validateRows()) {
        return;
      }
      this.saveLoading = true;
      try {
        const payload = this.getSortedRows().map((row) => this.buildPayload(row));
        const res = await saveAllDistributionGrades(payload);
        if (res.success) {
          this.$Message.success("保存成功");
          this.getDataList();
        }
      } catch (e) {
        // request layer handles error message
      } finally {
        this.saveLoading = false;
      }
    },
    remove(row, index) {
      if (this.isBaseGrade(row)) {
        this.$Message.warning("默认分销等级不能删除");
        return;
      }
      const name = row.gradeName || `等级值${row.sortOrder || ""}`;
      if (!row.id) {
        this.$Modal.confirm({
          title: "确认删除",
          content: `您确认要删除 ${name} 吗？`,
          onOk: () => {
            this.data.splice(index, 1);
          },
        });
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: `您确认要删除 ${name} 吗？`,
        loading: true,
        onOk: () => {
          deleteDistributionGrade(row.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.grade-footer {
  margin-top: 16px;
  padding-top: 8px;
}

.limit-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.grade-table :deep(.el-table__cell) {
  vertical-align: top;
}

.grade-table :deep(.el-table__cell .cell) {
  white-space: normal;
  line-height: 1.6;
}

.grade-edit-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grade-edit-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.line-label {
  min-width: 70px;
  color: #606266;
  font-size: 13px;
}

.line-unit {
  color: #606266;
  font-size: 13px;
}

.inline-number {
  width: 120px;
}

.no-condition-tip {
  color: #909399;
  font-size: 13px;
}

.disabled-text {
  color: #c0c4cc;
}

.link-text {
  color: #2d8cf0;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
}
</style>
