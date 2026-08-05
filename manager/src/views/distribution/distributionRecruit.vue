<template>
  <div class="distribution-recruit" style="background-color: #fff; padding: 10px">
    <el-form
      ref="planFormRef"
      :model="planForm"
      label-width="160px"
      label-position="right"
      label-suffix="："
    >
      <el-divider content-position="left">招募设置</el-divider>
      <el-form-item label="分销员加入条件">
        <div class="join-condition-wrap">
          <el-radio-group v-model="planForm.joinConditionType">
            <el-radio value="NONE">无条件</el-radio>
            <el-radio value="CONDITIONAL">有条件</el-radio>
          </el-radio-group>
          <div v-if="planForm.joinConditionType === 'CONDITIONAL'" class="join-condition-block">
          <div class="join-condition-item">
            <el-checkbox v-model="planForm.requirePurchaseGoods">需购买指定商品</el-checkbox>
            <div v-if="planForm.requirePurchaseGoods" class="join-condition-detail">
              <div class="form-desc">
                注：请确保以下商品已上架。若配置前已购买任一指定商品的用户则已经满足条件，无需再次购买。
              </div>
              <div class="goods-toolbar">
                <a class="link-btn" @click.prevent="openGoodsSelect">选择商品</a>
              </div>
              <el-table
                v-if="recruitGoodsList.length"
                border
                :data="recruitGoodsList"
                class="recruit-goods-table"
              >
                <el-table-column label="商品图" width="90" align="center">
                  <template #default="{ row }">
                    <img
                      v-if="row.thumbnail"
                      :src="row.thumbnail"
                      alt="商品图"
                      class="recruit-goods-thumb"
                    />
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="商品名称" min-width="200">
                  <template #default="{ row }">
                    <div class="recruit-goods-name">{{ row.goodsName }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="sn" label="商品编码" min-width="120" show-overflow-tooltip />
                <el-table-column label="SKU信息" min-width="140" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row.simpleSpecs ? row.simpleSpecs.trim() : "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center">
                  <template #default="{ $index }">
                    <a class="link-btn delete-btn" @click.prevent="removeRecruitGoods($index)">删除</a>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="join-condition-item">
            <el-checkbox v-model="planForm.requireSelfPurchaseAmount">
              自购金额满
              <el-input-number
                v-model="planForm.minSelfPurchaseAmount"
                :min="0.01"
                :precision="2"
                :disabled="!planForm.requireSelfPurchaseAmount"
                controls-position="right"
                class="inline-number"
              />
              元
            </el-checkbox>
            <div class="form-desc join-condition-desc">
              客户支付后即计入自购金额，自购金额最低设置为0.01元。
            </div>
          </div>
          <div class="join-condition-item">
            <el-checkbox v-model="planForm.requireConsumeCount">
              消费笔数满
              <el-input-number
                v-model="planForm.minConsumeCount"
                :min="1"
                :precision="0"
                :disabled="!planForm.requireConsumeCount"
                controls-position="right"
                class="inline-number"
              />
              笔
            </el-checkbox>
            <div class="form-desc join-condition-desc">
              客户支付后即计入消费笔数，消费笔数最低设置为1笔。
            </div>
          </div>
        </div>
        </div>
      </el-form-item>
      <el-form-item label="分销员申请方式" required>
        <div class="apply-mode-block">
          <el-radio-group v-model="planForm.applyMode">
            <el-radio value="MANUAL">手动申请</el-radio>
            <el-radio value="AUTO">满足条件自动申请</el-radio>
          </el-radio-group>
          <div v-if="planForm.applyMode === 'MANUAL'" class="manual-apply-extra">
            <el-checkbox v-model="planForm.requireApplyInfo">需要填写申请信息</el-checkbox>
            <div class="form-desc">申请人需填写对应字段，方便审核分销员信息。</div>
            <template v-if="planForm.requireApplyInfo">
              <div class="recruit-field-toolbar">
                <a class="link-btn" @click.prevent="addRecruitField">+ 添加字段</a>
              </div>
              <div
                v-for="(field, index) in recruitFields"
                :key="field._key"
                class="recruit-field-row"
              >
                <div class="recruit-field-row-main">
                  <span class="field-label">字段{{ index + 1 }}：</span>
                  <el-input
                    v-model="field.fieldName"
                    placeholder="如：姓名"
                    maxlength="64"
                    style="width: 200px"
                  />
                  <el-select v-model="field.fieldType" style="width: 140px; margin-left: 8px">
                    <el-option
                      v-for="item in fieldTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <a class="link-btn delete-btn" @click.prevent="removeRecruitField(index)">删除字段</a>
                </div>
                <div class="recruit-field-row-required">
                  <el-radio-group v-model="field.required">
                    <el-radio :value="true">必填</el-radio>
                    <el-radio :value="false">选填</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </template>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="审核方式">
        <el-radio-group v-model="planForm.auditMode">
          <el-radio value="MANUAL">人工审核</el-radio>
          <el-radio value="AUTO_PASS">无需审核（满足条件自动通过）</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="展示线上招募入口">
        <el-radio-group v-model="planForm.onlineEntryVisible">
          <el-radio :value="true">展示</el-radio>
          <el-radio :value="false">不展示</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="招募海报">
        <div class="recruit-poster-block">
          <div v-if="planForm.posterBackground" class="poster-preview-wrap">
            <img :src="planForm.posterBackground" alt="招募海报" class="poster-thumb" />
          </div>
          <upload-pic-input v-model="planForm.posterBackground" :show-input="false" />
        </div>
      </el-form-item>
      <el-form-item label="分销推广服务协议">
        <editor v-if="editorReady" ref="agreementEditor" open-xss v-model="planForm.agreementContent" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="planSaveLoading" @click="savePlan">保存</el-button>
      </el-form-item>
    </el-form>
    <sku-select ref="skuSelect" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script>
import {
  getCurrentRecruitPlan,
  saveRecruitPlan,
} from "@/api/distribution";
import uploadPicInput from "@/components/lili/upload-pic-input";
import tinymec from "@/components/editor/index.vue";
import skuSelect from "@/components/lili-dialog";

const MAX_RECRUIT_FIELDS = 5;

const FIELD_TYPE_OPTIONS = [
  { value: "NAME", label: "姓名格式" },
  { value: "MOBILE", label: "手机号格式" },
  { value: "IMAGE", label: "图片格式" },
  { value: "GENDER", label: "性别格式" },
];

const buildDefaultPlan = () => ({
  id: "",
  planVersion: null,
  publishStatus: false,
  joinConditionType: "NONE",
  applyMode: "MANUAL",
  auditMode: "MANUAL",
  onlineEntryVisible: true,
  requireApplyInfo: false,
  agreementContent: "",
  requirePurchaseGoods: false,
  requireSelfPurchaseAmount: false,
  requireConsumeCount: false,
  minSelfPurchaseAmount: 0.01,
  minConsumeCount: 1,
  goodsIds: [],
  posterEnabled: false,
  posterTitle: "",
  posterBenefitText: "",
  posterRuleText: "",
  posterContact: "",
  posterBackground: "",
});

const buildDefaultField = () => ({
  _key: `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  fieldName: "",
  fieldType: "NAME",
  required: true,
  placeholder: "",
});

export default {
  name: "distributionRecruit",
  components: { uploadPicInput, editor: tinymec, skuSelect },
  data() {
    return {
      planSaveLoading: false,
      editorReady: true,
      planForm: buildDefaultPlan(),
      recruitFields: [],
      recruitGoodsList: [],
      fieldTypeOptions: FIELD_TYPE_OPTIONS,
    };
  },
  mounted() {
    this.loadPlan();
  },
  watch: {
    "planForm.applyMode"(value) {
      if (value !== "MANUAL") {
        this.planForm.requireApplyInfo = false;
        this.recruitFields = [];
      }
    },
    "planForm.requireApplyInfo"(value) {
      if (!value) {
        this.recruitFields = [];
      }
    },
    "planForm.joinConditionType"(value) {
      if (value !== "CONDITIONAL") {
        this.planForm.requirePurchaseGoods = false;
        this.planForm.requireSelfPurchaseAmount = false;
        this.planForm.requireConsumeCount = false;
        this.recruitGoodsList = [];
      }
    },
    "planForm.requirePurchaseGoods"(value) {
      if (!value) {
        this.recruitGoodsList = [];
      }
    },
    "planForm.requireSelfPurchaseAmount"(value) {
      if (value && (!this.planForm.minSelfPurchaseAmount || this.planForm.minSelfPurchaseAmount < 0.01)) {
        this.planForm.minSelfPurchaseAmount = 0.01;
      }
    },
    "planForm.requireConsumeCount"(value) {
      if (value && (!this.planForm.minConsumeCount || this.planForm.minConsumeCount < 1)) {
        this.planForm.minConsumeCount = 1;
      }
    },
  },
  methods: {
    normalizeFields(fields) {
      if (!fields || !fields.length) {
        return [];
      }
      return fields.map((item, index) => ({
        ...buildDefaultField(),
        ...item,
        _key: item._key || item.id || `field_${index}_${Date.now()}`,
        required: item.required !== false,
      }));
    },
    addRecruitField() {
      if (this.recruitFields.length >= MAX_RECRUIT_FIELDS) {
        this.$Message.warning("最多添加5个字段");
        return;
      }
      this.recruitFields.push(buildDefaultField());
    },
    removeRecruitField(index) {
      this.recruitFields.splice(index, 1);
    },
    validateRecruitFields() {
      if (!this.planForm.requireApplyInfo) {
        return true;
      }
      if (!this.recruitFields.length) {
        this.$Message.warning("请至少添加一个申请字段");
        return false;
      }
      for (let i = 0; i < this.recruitFields.length; i++) {
        const field = this.recruitFields[i];
        if (!field.fieldName || !field.fieldName.trim()) {
          this.$Message.warning(`请填写字段${i + 1}名称`);
          return false;
        }
      }
      return true;
    },
    validateJoinConditions() {
      if (this.planForm.joinConditionType !== "CONDITIONAL") {
        return true;
      }
      const {
        requirePurchaseGoods,
        requireSelfPurchaseAmount,
        requireConsumeCount,
      } = this.planForm;
      if (!requirePurchaseGoods && !requireSelfPurchaseAmount && !requireConsumeCount) {
        this.$Message.warning("请至少选择一个加入条件");
        return false;
      }
      if (requirePurchaseGoods && !this.recruitGoodsList.length) {
        this.$Message.warning("请选择指定商品");
        return false;
      }
      if (requireSelfPurchaseAmount && this.planForm.minSelfPurchaseAmount < 0.01) {
        this.$Message.warning("自购金额最低设置为0.01元");
        return false;
      }
      if (requireConsumeCount && this.planForm.minConsumeCount < 1) {
        this.$Message.warning("消费笔数最低设置为1笔");
        return false;
      }
      return true;
    },
    openGoodsSelect() {
      this.$refs.skuSelect.open("goods");
      const data = this.recruitGoodsList.map((item) => ({
        id: item.skuId,
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        sn: item.sn,
        simpleSpecs: item.simpleSpecs,
        price: item.price,
        quantity: item.quantity,
        small: item.thumbnail,
      }));
      this.$refs.skuSelect.goodsData = data;
    },
    selectedGoodsData(items) {
      this.recruitGoodsList = (items || []).map((item) => ({
        skuId: item.id,
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        sn: item.sn || "",
        simpleSpecs: item.simpleSpecs || "",
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.small || item.thumbnail || "",
      }));
    },
    removeRecruitGoods(index) {
      this.recruitGoodsList.splice(index, 1);
    },
    buildSavePayload() {
      const fields = this.planForm.requireApplyInfo
        ? this.recruitFields.map((field, index) => ({
            id: field.id,
            fieldName: field.fieldName.trim(),
            fieldType: field.fieldType,
            required: field.required !== false,
            placeholder: field.placeholder || "",
            sortOrder: index,
          }))
        : [];
      return {
        ...this.planForm,
        id: this.planForm.id || undefined,
        publishStatus: true,
        posterEnabled: !!(this.planForm.posterBackground && this.planForm.posterBackground.trim()),
        recruitGoods: this.planForm.requirePurchaseGoods
          ? this.recruitGoodsList.map((item) => ({
              goodsId: item.goodsId,
              skuId: item.skuId,
              goodsName: item.goodsName,
              sn: item.sn,
              simpleSpecs: item.simpleSpecs,
              thumbnail: item.thumbnail,
              price: item.price,
            }))
          : [],
        goodsIds: this.planForm.requirePurchaseGoods
          ? this.recruitGoodsList.map((item) => item.goodsId)
          : [],
        fields,
      };
    },
    applyPlanResult(result) {
      this.planForm = { ...buildDefaultPlan(), ...result };
      this.recruitFields = this.normalizeFields(result.fields);
      this.recruitGoodsList = (result.recruitGoods || []).map((item) => ({
        goodsId: item.goodsId,
        skuId: item.skuId,
        goodsName: item.goodsName,
        sn: item.sn || "",
        simpleSpecs: item.simpleSpecs || "",
        thumbnail: item.thumbnail,
        price: item.price,
      }));
    },
    loadPlan() {
      getCurrentRecruitPlan().then((res) => {
        if (res.success && res.result) {
          this.applyPlanResult(res.result);
        }
      });
    },
    savePlan() {
      if (!this.validateRecruitFields() || !this.validateJoinConditions()) {
        return;
      }
      this.planSaveLoading = true;
      saveRecruitPlan(this.buildSavePayload())
        .then((res) => {
          if (res.success) {
            this.$Message.success("保存成功");
            if (res.result) {
              this.applyPlanResult(res.result);
            } else {
              this.loadPlan();
            }
          }
        })
        .finally(() => {
          this.planSaveLoading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.apply-mode-block {
  width: 100%;
}

.manual-apply-extra {
  margin-top: 12px;

  .form-desc {
    margin-top: 8px;
    margin-left: 24px;
  }
}

.recruit-field-toolbar {
  margin: 12px 0 8px 24px;
}

.link-btn {
  color: #2d8cf0;
  cursor: pointer;
  user-select: none;
}

.recruit-field-row {
  margin: 12px 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e8eaec;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.recruit-field-row-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.field-label {
  min-width: 56px;
  color: #606266;
}

.delete-btn {
  margin-left: 8px;
}

.recruit-field-row-required {
  margin-top: 10px;
  padding-left: 56px;
}

.form-desc {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.join-condition-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.join-condition-block {
  margin-top: 12px;
  padding: 16px;
  background: #f8f8f9;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

.join-condition-item + .join-condition-item {
  margin-top: 16px;
}

.join-condition-detail {
  margin-top: 8px;
  margin-left: 24px;
}

.join-condition-desc {
  margin-top: 8px;
  margin-left: 24px;
}

.goods-toolbar {
  margin: 8px 0;
}

.recruit-goods-table {
  margin-top: 8px;

  :deep(.el-table__cell) {
    vertical-align: top;
  }

  :deep(.el-table__cell .cell) {
    white-space: normal;
    line-height: 1.5;
  }
}

.recruit-goods-name {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

.recruit-goods-thumb {
  display: block;
  width: 56px;
  height: 56px;
  margin: 4px auto;
  object-fit: contain;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.inline-number {
  width: 120px;
  margin: 0 6px;
  vertical-align: middle;
}

.recruit-poster-block {
  width: 100%;
  max-width: 520px;
}

.poster-preview-wrap {
  margin-bottom: 12px;
}

.poster-thumb {
  display: block;
  max-width: 240px;
  max-height: 240px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
