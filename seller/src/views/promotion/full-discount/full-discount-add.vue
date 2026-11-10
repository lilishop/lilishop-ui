<!--
  商家端-满减/满折/满赠活动新增、编辑与详情页（支持 1~3 级阶梯，满赠每阶梯最多 3 个赠品 × 1~10 件）
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <div class="full-discount-add">
    <template v-if="fieldDisabled">
      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">基本信息（{{ activityTypeLabel }}）</span>
        </template>
        <el-descriptions border :column="2">
          <el-descriptions-item label="活动名称">{{ form.promotionName }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">
            <el-tag size="small" :type="activityTagType">{{ activityTypeLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="活动时间" :span="2">
            {{ form.startTime }} ~ {{ form.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="活动说明" :span="2">
            {{ form.description || "-" }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">阶梯优惠设置（共 {{ form.ruleList.length }} 级阶梯）</span>
        </template>
        <el-descriptions border :column="1">
          <el-descriptions-item
            v-for="(tier, idx) in form.ruleList"
            :key="idx"
            :label="`第 ${idx + 1} 级阶梯`"
          >
            <template v-if="form.activityType === 'FULL_MINUS'">
              满 <strong>{{ tier.fullMoney }}</strong> 元，立减现金
              <strong style="color: #f56c6c">{{ tier.fullMinus }}</strong> 元
            </template>
            <template v-else-if="form.activityType === 'FULL_RATE'">
              满 <strong>{{ tier.fullMoney }}</strong> 元，立享
              <strong style="color: #e6a23c">{{ tier.fullRate }}</strong> 折
            </template>
            <template v-else-if="form.activityType === 'FULL_GIFT'">
              <div>
                满 <strong>{{ tier.fullMoney }}</strong> 元，赠送以下商品：
              </div>
              <div class="readonly-gift-list">
                <el-tag
                  v-for="(g, gIdx) in tier.giftItems || []"
                  :key="gIdx"
                  size="small"
                  type="success"
                  class="gift-tag"
                >
                  {{ formatGiftDisplayName(g) }} × {{ g.num || 1 }}件
                </el-tag>
              </div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="适用商品范围">
            {{ form.scopeType === "ALL" ? "全品类" : "指定商品" }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table
          v-if="form.scopeType === 'PORTION_GOODS'"
          border
          :data="form.promotionGoodsList"
          style="width: 100%; margin-top: 16px"
        >
          <el-table-column label="商品名称" min-width="220">
            <template #default="{ row }">
              <div v-if="row" class="goods-cell">
                <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                <a class="link-text mr_10 goods-name" @click="linkTo(row.goodsId, row.skuId)">
                  {{ row.goodsName }}
                </a>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row?.sn || "-" }}</template>
          </el-table-column>
          <el-table-column label="规格" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row?.simpleSpecs || "-" }}</template>
          </el-table-column>
          <el-table-column label="商品价格" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="90" align="right">
            <template #default="{ row }">
              <span v-if="row">{{ row.quantity }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="foot-btn">
        <el-button @click="closeCurrentPage">返回</el-button>
      </div>
    </template>

    <el-form v-else ref="formRef" :model="form" label-width="120px" :rules="formRule">
      <el-card class="section-card" shadow="never">
        <template #header>
          <span class="section-title">基本信息（{{ activityTypeLabel }}）</span>
        </template>
        <el-form-item label="活动类型">
          <el-tag :type="activityTagType">{{ activityTypeLabel }}</el-tag>
        </el-form-item>
        <el-form-item label="活动名称" prop="promotionName">
          <el-input
            v-model="form.promotionName"
            :disabled="fieldDisabled"
            placeholder="请输入活动名称"
            clearable
            class="basic-form-control"
          />
        </el-form-item>
        <el-form-item label="活动时间" prop="rangeTime">
          <el-date-picker
            class="full-discount-range-picker basic-form-control"
            type="datetimerange"
            v-model="form.rangeTime"
            :disabled="fieldDisabled"
            format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="请选择"
            :disabled-date="options.disabledDate"
          />
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="选填，活动补充说明"
            class="basic-form-control"
          />
        </el-form-item>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="tier-card-header">
            <span class="section-title">阶梯优惠设置（最多支持 3 级阶梯）</span>
            <el-button
              v-if="form.ruleList.length < 3"
              type="primary"
              @click="addTier"
            >
              添加阶梯（{{ form.ruleList.length }}/3）
            </el-button>
          </div>
        </template>

        <div
          v-for="(tier, tierIdx) in form.ruleList"
          :key="tierIdx"
          class="tier-block"
        >
          <div class="tier-block-title">
            <span>第 {{ tierIdx + 1 }} 级阶梯</span>
            <el-button
              v-if="form.ruleList.length > 1"
              type="danger"
              link
              @click="removeTier(tierIdx)"
            >
              删除此阶梯
            </el-button>
          </div>

          <el-form-item label="优惠门槛" required>
            <span class="inline-prefix">满</span>
            <el-input-number
              v-model="tier.fullMoney"
              :min="0.01"
              :max="99999999"
              :precision="2"
              :step="10"
              controls-position="right"
              placeholder="门槛金额"
              style="width: 180px"
            />
            <span class="inline-suffix">元</span>
            <span class="describe">须大于上一级阶梯门槛金额</span>
          </el-form-item>

          <!-- 满减活动专属字段 -->
          <el-form-item v-if="form.activityType === 'FULL_MINUS'" label="优惠金额" required>
            <span class="inline-prefix">减</span>
            <el-input-number
              v-model="tier.fullMinus"
              :min="0.01"
              :max="99999999"
              :precision="2"
              :step="5"
              controls-position="right"
              placeholder="立减金额"
              style="width: 180px"
            />
            <span class="inline-suffix">元</span>
            <span class="describe">须小于当前阶梯门槛，且随阶梯递增</span>
          </el-form-item>

          <!-- 满折活动专属字段 -->
          <el-form-item v-if="form.activityType === 'FULL_RATE'" label="优惠折扣" required>
            <span class="inline-prefix">打</span>
            <el-input-number
              v-model="tier.fullRate"
              :min="0.1"
              :max="9.9"
              :step="0.1"
              :precision="1"
              controls-position="right"
              placeholder="优惠折扣"
              style="width: 180px"
            />
            <span class="inline-suffix">折</span>
            <span class="describe">0.1~9.9 折，阶梯越高折扣数值须越小（如 9折 → 8折 → 7折）</span>
          </el-form-item>

          <!-- 满赠活动专属字段：每阶梯最多3个赠品，每个最多10件 -->
          <el-form-item v-if="form.activityType === 'FULL_GIFT'" label="赠送商品" required>
            <div class="gift-tier-panel">
              <div class="gift-tier-footer">
                <el-button
                  type="primary"
                  @click="openGiftSkuPicker(tierIdx)"
                >
                  选择赠品（{{ (tier.giftItems || []).length }}/3）
                </el-button>
                <span class="describe">
                  每级阶梯最多可选 3 个赠品，单品最多 10 件；支付时若赠品库存不足，将按实际可用库存部分赠送。
                </span>
              </div>
              <el-table
                v-if="tier.giftItems && tier.giftItems.length"
                border
                :data="tier.giftItems"
                style="width: 100%"
              >
                <el-table-column label="赠品名称" min-width="220">
                  <template #default="{ row }">
                    <div v-if="row" class="goods-cell">
                      <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                      <span class="goods-name">{{ formatGiftDisplayName(row) }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="规格" min-width="120" show-overflow-tooltip>
                  <template #default="{ row }">{{ row?.simpleSpecs || "-" }}</template>
                </el-table-column>
                <el-table-column label="单价" width="110" align="right">
                  <template #default="{ row }">
                    <span v-if="row && row.price != null" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}
                    </span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="赠送数量（件）" width="170" align="center">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.num"
                      :min="1"
                      :max="10"
                      :step="1"
                      :precision="0"
                      controls-position="right"
                      style="width: 130px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="right">
                  <template #default="{ $index }">
                    <a class="link-text" @click="removeGiftFromTier(tier, $index)">删除</a>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>
        </div>

        <el-form-item label="适用范围" prop="scopeType" style="margin-top: 16px">
          <el-radio-group v-model="form.scopeType" :disabled="fieldDisabled">
            <el-radio-button value="ALL">全品类</el-radio-button>
            <el-radio-button value="PORTION_GOODS">指定商品</el-radio-button>
          </el-radio-group>
          <span class="describe">
            同一时段内全品类活动互斥；指定商品活动只要所选商品不重叠即可同时开启
          </span>
        </el-form-item>

        <el-form-item style="width: 100%" v-if="form.scopeType === 'PORTION_GOODS'">
          <div v-if="!fieldDisabled" style="display: flex; margin-bottom: 10px">
            <el-button type="primary" @click="openSkuList">选择商品</el-button>
            <el-button type="danger" plain style="margin-left: 10px" @click="delSelectGoods">
              批量删除
            </el-button>
          </div>
          <el-table
            border
            :data="form.promotionGoodsList"
            style="width: 100%"
            @selection-change="changeSelect"
          >
            <el-table-column
              v-if="!fieldDisabled"
              type="selection"
              width="60"
              align="center"
            />
            <el-table-column label="商品名称" min-width="220">
              <template #default="{ row }">
                <div v-if="row" class="goods-cell">
                  <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                  <a class="link-text mr_10 goods-name" @click="linkTo(row.goodsId, row.skuId)">
                    {{ row.goodsName }}
                  </a>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row?.sn || "-" }}</template>
            </el-table-column>
            <el-table-column label="规格" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row?.simpleSpecs || "-" }}</template>
            </el-table-column>
            <el-table-column label="商品价格" width="110" align="right">
              <template #default="{ row }">
                <span v-if="row" :style="{ color: $mainColor }">
                  {{ $filters.unitPrice(row.price, "￥") }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="90" align="right">
              <template #default="{ row }">
                <span v-if="row">{{ row.quantity }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="!fieldDisabled" label="操作" width="100" align="right">
              <template #default="{ $index }">
                <a class="link-text" @click="delGoods($index)">删除</a>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-card>

      <div class="foot-btn">
        <el-button @click="closeCurrentPage">返回</el-button>
        <el-button
          v-if="!fieldDisabled"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </div>
    </el-form>
    <liliDialog ref="liliDialogRef" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getFullDiscountById,
  newFullDiscount,
  editFullDiscount,
} from "@/api/promotion";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";

defineOptions({ name: "add-full-discount" });

const route = useRoute();
const router = useRouter();

const id = ref(route.query.id);
const initialActivityType = String(route.query.activityType || "FULL_MINUS");

function createEmptyTier(activityType) {
  if (activityType === "FULL_RATE") {
    return { fullMoney: 100, fullRate: 9.0 };
  }
  if (activityType === "FULL_GIFT") {
    return {
      fullMoney: 100,
      giftItems: [],
    };
  }
  return { fullMoney: 100, fullMinus: 10 };
}

const form = ref({
  activityType: initialActivityType,
  scopeType: "ALL",
  promotionGoodsList: [],
  promotionStatus: "NEW",
  description: "",
  ruleList: [createEmptyTier(initialActivityType)],
});

const submitLoading = ref(false);
const selectedGoods = ref([]);
const pickerTargetTierIndex = ref(null);

const formRule = {
  promotionName: [{ required: true, message: "活动名称不能为空" }],
  rangeTime: [{ required: true, message: "请选择活动时间" }],
};

const options = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000;
  },
};

const formRef = ref(null);
const liliDialogRef = ref(null);

const fieldDisabled = computed(() => {
  return !!id.value && form.value.promotionStatus !== "NEW";
});

const activityTypeLabel = computed(() => {
  if (form.value.activityType === "FULL_RATE") return "满折活动";
  if (form.value.activityType === "FULL_GIFT") return "满赠活动";
  return "满减活动";
});

const activityTagType = computed(() => {
  if (form.value.activityType === "FULL_RATE") return "warning";
  if (form.value.activityType === "FULL_GIFT") return "success";
  return "danger";
});

onMounted(() => {
  if (id.value) {
    getDetail();
  } else {
    const now = new Date();
    form.value.rangeTime = [now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)];
  }
});

function addTier() {
  if (form.value.ruleList.length >= 3) return;
  const lastTier = form.value.ruleList[form.value.ruleList.length - 1];
  const nextMoney = lastTier && lastTier.fullMoney ? Number(lastTier.fullMoney) + 100 : 200;
  if (form.value.activityType === "FULL_RATE") {
    const prevRate = lastTier && lastTier.fullRate ? Number(lastTier.fullRate) : 9.0;
    const nextRate = Math.max(0.1, Number((prevRate - 1.0).toFixed(1)));
    form.value.ruleList.push({ fullMoney: nextMoney, fullRate: nextRate });
  } else if (form.value.activityType === "FULL_GIFT") {
    form.value.ruleList.push({
      fullMoney: nextMoney,
      giftItems: [],
    });
  } else {
    const prevMinus = lastTier && lastTier.fullMinus ? Number(lastTier.fullMinus) : 10;
    form.value.ruleList.push({ fullMoney: nextMoney, fullMinus: prevMinus + 10 });
  }
}

function removeTier(index) {
  if (form.value.ruleList.length <= 1) return;
  form.value.ruleList.splice(index, 1);
}

function openGiftSkuPicker(tierIdx) {
  pickerTargetTierIndex.value = tierIdx;
  const tier = form.value.ruleList[tierIdx];
  const currentGifts = ((tier && tier.giftItems) || [])
    .filter((g) => g && g.skuId)
    .map((g) => ({
      ...g,
      id: g.skuId,
    }));
  liliDialogRef.value.goodsData = JSON.parse(JSON.stringify(currentGifts));
  liliDialogRef.value.open("goods");
}

function removeGiftFromTier(tier, index) {
  if (!tier.giftItems) return;
  tier.giftItems.splice(index, 1);
}

/**
 * 赠品展示名称：优先使用商品选择器回填或后端快照的名称，缺失时回退显示 SKU ID。
 * @param {object} giftItem 赠品项
 * @returns {string} 展示名称
 */
function formatGiftDisplayName(giftItem) {
  if (giftItem?.goodsName) return giftItem.goodsName;
  return `SKU:${giftItem?.skuId || "-"}`;
}

function closeCurrentPage() {
  router.back();
}

function openSkuList() {
  pickerTargetTierIndex.value = null;
  const data = JSON.parse(JSON.stringify(form.value.promotionGoodsList || []));
  data.forEach((e) => {
    e.id = e.skuId || e.id;
  });
  liliDialogRef.value.goodsData = data;
  liliDialogRef.value.open("goods");
}

function normalizeDetailRules(data) {
  const type =
    data.activityType ||
    (data.fullRateFlag
      ? "FULL_RATE"
      : !data.fullMinusFlag && data.giftFlag
        ? "FULL_GIFT"
        : "FULL_MINUS");
  data.activityType = type;

  let rules = Array.isArray(data.ruleList) && data.ruleList.length ? data.ruleList : null;
  if (!rules && data.rulesJson) {
    try {
      rules = JSON.parse(data.rulesJson);
    } catch (e) {
      rules = null;
    }
  }
  if (!rules || !rules.length) {
    if (type === "FULL_RATE") {
      rules = [{ fullMoney: data.fullMoney || 100, fullRate: data.fullRate || 9.0 }];
    } else if (type === "FULL_GIFT") {
      const ids = String(data.giftId || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      rules = [
        {
          fullMoney: data.fullMoney || 100,
          giftItems: ids.map((skuId) => ({ skuId, goodsName: data.giftSkuName || "", num: 1 })),
        },
      ];
    } else {
      rules = [{ fullMoney: data.fullMoney || 100, fullMinus: data.fullMinus || 10 }];
    }
  }
  rules.forEach((r) => {
    if (type === "FULL_GIFT") {
      // 赠品统一由商品选择器维护，过滤历史数据中的空 SKU 占位项
      r.giftItems = (Array.isArray(r.giftItems) ? r.giftItems : []).filter((g) => g && g.skuId);
    }
  });
  data.ruleList = rules;
}

function getDetail() {
  getFullDiscountById(id.value).then((res) => {
    const data = res.result;
    if (data.scopeType === "ALL") {
      data.promotionGoodsList = [];
    }
    normalizeDetailRules(data);
    data.rangeTime = [new Date(data.startTime), new Date(data.endTime)];
    form.value = data;
    if (data.activityType && route.query.activityType !== data.activityType) {
      router.replace({
        query: { ...route.query, activityType: data.activityType },
      });
    }
  });
}

function validateTiers(activityType, ruleList) {
  if (!Array.isArray(ruleList) || ruleList.length < 1 || ruleList.length > 3) {
    Message.warning("请配置 1 至 3 级阶梯优惠");
    return false;
  }
  let prevMoney = 0;
  let prevMinus = 0;
  let prevRate = 10;

  for (let i = 0; i < ruleList.length; i++) {
    const tier = ruleList[i];
    const label = `第 ${i + 1} 级阶梯`;
    const money = Number(tier.fullMoney);
    if (!money || money <= 0 || money > 99999999) {
      Message.warning(`${label}：请填写有效的优惠门槛金额`);
      return false;
    }
    if (i > 0 && money <= prevMoney) {
      Message.warning(`${label}：优惠门槛金额必须大于上一级阶梯（>${prevMoney}元）`);
      return false;
    }
    prevMoney = money;

    if (activityType === "FULL_MINUS") {
      const minus = Number(tier.fullMinus);
      if (!minus || minus <= 0) {
        Message.warning(`${label}：请填写有效的优惠金额`);
        return false;
      }
      if (minus >= money) {
        Message.warning(`${label}：优惠金额必须小于当前阶梯门槛金额`);
        return false;
      }
      if (i > 0 && minus <= prevMinus) {
        Message.warning(`${label}：优惠金额必须大于上一级阶梯（>${prevMinus}元）`);
        return false;
      }
      prevMinus = minus;
    } else if (activityType === "FULL_RATE") {
      const rate = Number(tier.fullRate);
      if (!rate || rate < 0.1 || rate > 9.9) {
        Message.warning(`${label}：优惠折扣须在 0.1 至 9.9 折之间`);
        return false;
      }
      if (i > 0 && rate >= prevRate) {
        Message.warning(`${label}：折扣数值须小于上一级阶梯（<${prevRate}折），以保证折扣力度递增`);
        return false;
      }
      prevRate = rate;
    } else if (activityType === "FULL_GIFT") {
      const gifts = tier.giftItems || [];
      if (!gifts.length || gifts.length > 3) {
        Message.warning(`${label}：请选择 1 至 3 个赠品`);
        return false;
      }
      const seenSku = new Set();
      for (let gIdx = 0; gIdx < gifts.length; gIdx++) {
        const g = gifts[gIdx];
        if (!g.skuId) {
          Message.warning(`${label}：第 ${gIdx + 1} 个赠品尚未选择`);
          return false;
        }
        if (seenSku.has(g.skuId)) {
          Message.warning(`${label}：同一阶梯内不能重复选择相同的赠品 SKU`);
          return false;
        }
        seenSku.add(g.skuId);
        const num = Number(g.num);
        if (!num || num < 1 || num > 10) {
          Message.warning(`${label}：单个赠品赠送数量须在 1 至 10 件之间`);
          return false;
        }
      }
    }
  }
  return true;
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    if (!validateTiers(form.value.activityType, form.value.ruleList)) {
      return;
    }

    const params = JSON.parse(JSON.stringify(form.value));
    params.startTime = unixToDate(form.value.rangeTime[0] / 1000);
    params.endTime = unixToDate(form.value.rangeTime[1] / 1000);

    if (
      params.scopeType === "PORTION_GOODS" &&
      (!params.promotionGoodsList || params.promotionGoodsList.length === 0)
    ) {
      Message.warning("请选择指定商品");
      return;
    }
    if (params.scopeType === "ALL") {
      delete params.promotionGoodsList;
      params.number = -1;
    } else {
      const scopeId = [];
      params.number = 1;
      params.promotionGoodsList.forEach((e) => {
        e.startTime = params.startTime;
        e.endTime = params.endTime;
        scopeId.push(e.skuId);
      });
      params.scopeId = scopeId.toString();
    }

    // 同步首档冗余字段以保持接口兼容
    const firstTier = params.ruleList[0];
    params.fullMoney = firstTier.fullMoney;
    if (params.activityType === "FULL_MINUS") {
      params.fullMinusFlag = true;
      params.fullMinus = firstTier.fullMinus;
      params.fullRateFlag = false;
      params.giftFlag = false;
    } else if (params.activityType === "FULL_RATE") {
      params.fullMinusFlag = false;
      params.fullRateFlag = true;
      params.fullRate = firstTier.fullRate;
      params.giftFlag = false;
    } else if (params.activityType === "FULL_GIFT") {
      params.fullMinusFlag = false;
      params.fullRateFlag = false;
      params.giftFlag = true;
      params.giftId = (firstTier.giftItems || []).map((g) => g.skuId).join(",");
    }
    params.rulesJson = JSON.stringify(params.ruleList);

    delete params.rangeTime;
    if (!id.value) {
      delete params.id;
    } else {
      delete params.updateTime;
    }

    submitLoading.value = true;
    const request = id.value ? editFullDiscount(params) : newFullDiscount(params);
    request
      .then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success(id.value ? "编辑活动成功" : "添加活动成功");
          closeCurrentPage();
        }
      })
      .catch(() => {
        submitLoading.value = false;
      });
  });
}

function changeSelect(e) {
  selectedGoods.value = e;
}

function delSelectGoods() {
  if (selectedGoods.value.length <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除所选商品吗?",
    onOk: () => {
      const ids = selectedGoods.value.map((e) => e.skuId || e.id);
      form.value.promotionGoodsList = form.value.promotionGoodsList.filter(
        (item) => !ids.includes(item.skuId)
      );
    },
  });
}

function delGoods(index) {
  form.value.promotionGoodsList.splice(index, 1);
}

function selectedGoodsData(item) {
  if (pickerTargetTierIndex.value !== null) {
    const tier = form.value.ruleList[pickerTargetTierIndex.value];
    pickerTargetTierIndex.value = null;
    if (!tier) return;
    let selectedList = Array.isArray(item) ? item : [];
    if (selectedList.length > 3) {
      Message.warning("每级阶梯最多只能选择 3 个赠品，已为您保留前 3 个");
      selectedList = selectedList.slice(0, 3);
    }
    const prevNumMap = new Map(
      (tier.giftItems || [])
        .filter((g) => g && g.skuId)
        .map((g) => [String(g.skuId), g.num || 1])
    );
    tier.giftItems = selectedList.map((e) => {
      const skuId = e.id || e.skuId;
      return {
        skuId,
        goodsId: e.goodsId,
        goodsName: e.goodsName,
        thumbnail: e.thumbnail || e.small,
        simpleSpecs: e.simpleSpecs,
        goodsType: e.goodsType,
        price: e.price,
        quantity: e.quantity,
        num: prevNumMap.get(String(skuId)) || 1,
      };
    });
    return;
  }

  const list = [];
  item.forEach((e) => {
    list.push({
      goodsName: e.goodsName,
      price: e.price,
      quantity: e.quantity,
      storeId: e.storeId,
      storeName: e.storeName,
      thumbnail: e.thumbnail,
      skuId: e.id,
      goodsId: e.goodsId,
      goodsType: e.goodsType,
      sn: e.sn,
      simpleSpecs: e.simpleSpecs,
    });
  });
  form.value.promotionGoodsList = list;
}
</script>

<style lang="scss" scoped>
.section-card {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.tier-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tier-block {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 16px 16px 4px;
  margin-bottom: 14px;
  background-color: #fafafa;

  .tier-block-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 13px;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }
}

.inline-prefix {
  margin-right: 8px;
  color: #606266;
}

.inline-suffix {
  margin-left: 8px;
  color: #606266;
}

.gift-tier-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .gift-item-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .gift-tier-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.readonly-gift-list {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.goods-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.goods-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.goods-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.describe {
  font-size: 12px;
  margin-left: 10px;
  color: #999;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.foot-btn {
  display: flex;
  gap: 10px;
}

.gift-tag {
  margin-right: 8px;
}

.basic-form-control {
  width: 420px;
  max-width: 100%;
  box-sizing: border-box;
}

:deep(.full-discount-range-picker.el-date-editor--datetimerange) {
  width: 420px;
  max-width: 100%;
  flex-grow: 0;
  box-sizing: border-box;
  --el-date-editor-width: 420px;
}
</style>
