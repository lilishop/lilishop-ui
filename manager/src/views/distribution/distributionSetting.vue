<template>
  <div class="distribution-setting">
    <el-card>
      <el-tabs v-model="activeTab" class="setting-tabs">
        <el-tab-pane label="基础设置" name="base">
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRule"
            label-width="180px"
            label-position="right"
            label-suffix="："
            class="setting-form"
          >
            <el-form-item label="是否开启分销" prop="isOpen">
              <el-switch v-model="form.isOpen" active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="分销员名称" prop="distributorName">
              <div class="option-with-desc">
                <el-input
                  v-model="form.distributorName"
                  maxlength="20"
                  show-word-limit
                  placeholder="如：推广大使"
                  style="width: 350px"
                />
                <div class="form-desc">可自定义对平台分销员的称呼，如「推广大使」。</div>
              </div>
            </el-form-item>
            <el-form-item label="升级条件是否显示">
              <div class="option-with-desc">
                <el-radio-group v-model="form.upgradeConditionVisible">
                  <el-radio :value="true">显示</el-radio>
                  <el-radio :value="false">不显示</el-radio>
                </el-radio-group>
                <div class="form-desc">
                  选择显示后，分销员可以看到不同等级分销员的权益（佣金比例与邀请奖励）。
                </div>
              </div>
            </el-form-item>
            <el-form-item label="是否展示上级分销员">
              <div class="option-with-desc">
                <el-radio-group v-model="form.parentDistributorVisible">
                  <el-radio :value="true">展示</el-radio>
                  <el-radio :value="false">不展示</el-radio>
                </el-radio-group>
                <div class="form-desc">
                  选择展示后，分销员可在个人中心查看上级分销员信息。
                </div>
              </div>
            </el-form-item>
            <el-form-item label="成为分销员后上级归属">
              <el-radio-group v-model="form.parentAttributionMode" class="radio-option-list">
                <div class="radio-option-item">
                  <el-radio value="RECRUIT_INVITER">邀请方</el-radio>
                  <div class="form-desc">举例：分销员A绑定客户B，分销员C邀请客户B成为分销员，B的上级为C。</div>
                </div>
                <div class="radio-option-item">
                  <el-radio value="BOUND_DISTRIBUTOR">之前绑定的分销员</el-radio>
                  <div class="form-desc">举例：分销员A绑定客户B，分销员C邀请客户B成为分销员，B的上级为A。</div>
                </div>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.base" @click="submitBase">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="客户关系" name="customer">
          <el-form
            ref="customerFormRef"
            :model="customerForm"
            label-width="180px"
            label-position="right"
            label-suffix="："
            class="setting-form"
          >
            <el-form-item label="锁客模式">
              <el-radio-group v-model="customerForm.bindMode">
                <el-radio value="PERMANENT">永久锁客</el-radio>
                <el-radio value="SHORT_TERM">短期锁客</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="customerForm.bindMode === 'PERMANENT'">
              <el-form-item label="永久锁客生效方式">
                <el-radio-group v-model="customerForm.permanentBindMode">
                  <el-radio value="SCAN_IMMEDIATE">扫码立即永久绑定</el-radio>
                  <el-radio value="PAID_WITHIN_DAYS">支付后转永久</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                v-if="customerForm.permanentBindMode === 'PAID_WITHIN_DAYS'"
                label="永久锁客支付天数"
              >
                <el-input-number
                  v-model="customerForm.permanentPaidDays"
                  :min="1"
                  :max="365"
                  :step="1"
                  :precision="0"
                  style="width: 120px"
                  @change="onPermanentPaidDaysChange"
                />
                <span class="form-tip">支付后转永久时，客户需在指定天数内完成支付</span>
              </el-form-item>
            </template>
            <el-form-item v-if="customerForm.bindMode === 'SHORT_TERM'" label="短期锁客有效天数">
              <el-input-number v-model="customerForm.shortTermBindDays" :min="1" :max="365" style="width: 120px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.customer" @click="submitCustomer">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="结算方案" name="settlement">
          <el-form
            ref="settlementFormRef"
            :model="settlementForm"
            label-width="180px"
            label-position="right"
            label-suffix="："
            class="setting-form"
          >
            <el-form-item label="分销员自购直接佣金归属">
              <el-radio-group v-model="settlementForm.selfPurchaseCommissionMode">
                <el-radio value="SELF">佣金给分销员自己</el-radio>
                <el-radio value="BOUND_DISTRIBUTOR">佣金给绑定分销员</el-radio>
                <el-radio value="NONE">无直接佣金</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.settlement" @click="submitSettlement">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="平台海报" name="poster">
          <el-form
            ref="posterFormRef"
            :model="posterForm"
            label-width="180px"
            label-position="right"
            label-suffix="："
            class="setting-form poster-form"
          >
            <el-form-item label="头像昵称">
              <div class="option-with-desc">
                <el-radio-group v-model="posterForm.memberInfoVisible">
                  <el-radio :value="true">展示</el-radio>
                  <el-radio :value="false">不展示</el-radio>
                </el-radio-group>
                <div class="form-desc">选择展示后，分销员平台海报将显示头像和昵称。</div>
              </div>
            </el-form-item>
            <el-form-item label="背景图片">
              <div class="poster-upload-block">
                <div v-if="posterForm.backgroundImage" class="poster-preview-wrap">
                  <img :src="posterForm.backgroundImage" alt="平台海报背景" class="poster-bg-thumb" />
                </div>
                <upload-pic-input v-model="posterForm.backgroundImage" :show-input="false" />
                <div class="form-desc">建议尺寸：与邀请卡预览画布一致 630×1000 像素（端上海报若用其它比例，将以封面填充居中裁剪）。预览区样式与「邀请卡」页一致，便于对照效果。</div>
              </div>
            </el-form-item>
            <el-form-item label="推荐语">
              <el-input
                v-model="posterForm.slogan"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="请输入平台海报推荐语"
                style="width: 420px"
              />
            </el-form-item>
            <el-form-item label="文字颜色">
              <el-color-picker v-model="posterForm.textColor" />
              <span class="form-tip">{{ posterForm.textColor }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.poster" @click="submitPoster">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邀请卡" name="inviteCard">
          <el-form
            ref="inviteCardFormRef"
            :model="inviteCardForm"
            label-width="180px"
            label-position="right"
            label-suffix="："
            class="setting-form poster-form"
          >
            <el-form-item label="头像昵称">
              <div class="option-with-desc">
                <el-radio-group v-model="inviteCardForm.memberInfoVisible">
                  <el-radio :value="true">展示</el-radio>
                  <el-radio :value="false">不展示</el-radio>
                </el-radio-group>
                <div class="form-desc">选择展示后，分销员邀请卡将显示头像和昵称。</div>
              </div>
            </el-form-item>
            <el-form-item label="背景图片">
              <div class="poster-upload-block">
                <div v-if="inviteCardForm.backgroundImage" class="poster-preview-wrap">
                  <img :src="inviteCardForm.backgroundImage" alt="邀请卡背景" class="poster-bg-thumb" />
                </div>
                <upload-pic-input v-model="inviteCardForm.backgroundImage" :show-input="false" />
                <div class="form-desc">建议尺寸：630×1000 像素（端上若用其它比例，将以封面填充居中裁剪）。</div>
              </div>
            </el-form-item>
            <el-form-item label="推荐语">
              <el-input
                v-model="inviteCardForm.slogan"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="请输入邀请卡推荐语"
                style="width: 420px"
              />
            </el-form-item>
            <el-form-item label="文字颜色">
              <el-color-picker v-model="inviteCardForm.textColor" />
              <span class="form-tip">{{ inviteCardForm.textColor }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.inviteCard" @click="submitInviteCard">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="商品分销设置" name="featured">
          <el-form
            ref="featuredFormRef"
            :model="featuredForm"
            label-width="220px"
            label-position="right"
            label-suffix="："
            class="setting-form featured-form"
          >
            <div class="setting-section">
              <div class="section-title">基础设置</div>
              <el-form-item label="商品默认排序">
                <el-select v-model="featuredForm.defaultSort" style="width: 420px">
                  <el-option
                    v-for="item in defaultSortOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="商品默认分享文案">
                <el-input
                  v-model="featuredForm.defaultShareText"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="请输入分销员分享商品时的默认文案"
                  style="width: 420px"
                />
              </el-form-item>
            </div>

            <div class="setting-section">
              <div class="section-title">主推商品</div>
              <el-form-item label="分销员个人中心展示主推商品">
              <div class="option-with-desc">
                <el-radio-group v-model="featuredForm.centerVisible">
                  <el-radio :value="true">展示</el-radio>
                  <el-radio :value="false">不展示</el-radio>
                </el-radio-group>
                <div class="form-desc">
                  选择展示后，分销员个人中心将增加主推商品版块，促进分销员卖货。
                </div>
              </div>
            </el-form-item>
            <el-form-item label="商品销量">
              <div class="option-with-desc">
                <el-radio-group v-model="featuredForm.showSales">
                  <el-radio :value="true">展示</el-radio>
                  <el-radio :value="false">不展示</el-radio>
                </el-radio-group>
                <div class="form-desc">当销量为 0 时自动隐藏商品销量。</div>
              </div>
            </el-form-item>
            <el-form-item label="主推商品">
              <el-radio-group v-model="featuredForm.sourceMode">
                <el-radio value="AUTO">自动匹配主推商品</el-radio>
                <el-radio value="CUSTOM">自定义主推商品</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="主推商品数量">
              <div class="option-with-desc">
                <el-radio-group v-model="featuredForm.displayCount">
                  <el-radio :value="5">5个</el-radio>
                  <el-radio :value="10">10个</el-radio>
                </el-radio-group>
                <div class="form-desc">{{ featuredDisplayCountDesc }}</div>
              </div>
            </el-form-item>
            <el-form-item v-if="featuredForm.sourceMode === 'AUTO'" label="匹配规则">
              <el-radio-group v-model="featuredForm.matchRule">
                <el-radio value="HIGHEST_COMMISSION">展示佣金最高的推广商品</el-radio>
                <el-radio value="HIGHEST_SALES">展示销量最高的推广商品</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="featuredForm.sourceMode === 'CUSTOM'" label="自定义商品">
              <div class="custom-goods-block">
                <div v-if="featuredGoodsOverLimit" class="featured-over-limit-tip">
                  当前已选超过主推数量，请删除多余商品后再保存（本页其他设置也会一并无法保存）。
                </div>
                <div class="form-desc">
                  请从已审核通过的分销商品中选择，最多可配置 {{ featuredGoodsLimit }} 个，按列表顺序展示。
                </div>
                <div class="goods-toolbar">
                  <a class="link-btn" @click.prevent="openFeaturedGoodsPicker">选择分销商品</a>
                </div>
                <el-table
                  v-if="featuredCustomGoods.length"
                  border
                  :data="featuredCustomGoods"
                  class="featured-goods-table"
                >
                  <el-table-column label="商品图" width="90" align="center">
                    <template #default="{ row }">
                      <img
                        v-if="row.thumbnail"
                        :src="row.thumbnail"
                        alt="商品图"
                        class="featured-goods-thumb"
                      />
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="商品名称" min-width="180">
                    <template #default="{ row }">
                      <div class="featured-goods-name">{{ row.goodsName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="规格" min-width="120" show-overflow-tooltip>
                    <template #default="{ row }">{{ row.specs || "-" }}</template>
                  </el-table-column>
                  <el-table-column label="佣金" width="100">
                    <template #default="{ row }">
                      {{ $filters.unitPrice(row.commission, "￥") }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="90" align="center">
                    <template #default="{ $index }">
                      <a class="link-btn delete-btn" @click.prevent="removeFeaturedGoods($index)">删除</a>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
            </div>

            <el-form-item>
              <el-button type="primary" :loading="saving.featured" @click="submitFeatured">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="featuredPickerVisible"
      title="选择分销商品"
      width="960px"
      :close-on-click-modal="false"
      destroy-on-close
      @open="loadFeaturedPickerGoods"
    >
      <el-form inline class="featured-picker-search" @keyup.enter.prevent="searchFeaturedPickerGoods">
        <el-form-item label="商品名称">
          <el-input
            v-model="featuredPickerSearch.goodsName"
            clearable
            placeholder="请输入商品名称"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFeaturedPickerGoods">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="featuredPickerTable"
        v-loading="featuredPickerLoading"
        border
        row-key="skuId"
        :data="featuredPickerList"
        max-height="420"
        @selection-change="onFeaturedPickerSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip prop="goodsName" />
        <el-table-column label="规格" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.specs || "-" }}</template>
        </el-table-column>
        <el-table-column label="佣金" width="100">
          <template #default="{ row }">{{ $filters.unitPrice(row.commission, "￥") }}</template>
        </el-table-column>
        <el-table-column label="店铺" min-width="120" show-overflow-tooltip prop="storeName" />
      </el-table>
      <div class="featured-picker-pagination">
        <el-pagination
          v-model:current-page="featuredPickerSearch.pageNumber"
          v-model:page-size="featuredPickerSearch.pageSize"
          :total="featuredPickerTotal"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          size="small"
          @current-change="loadFeaturedPickerGoods"
          @size-change="onFeaturedPickerPageSizeChange"
        />
      </div>
      <template #footer>
        <el-button @click="featuredPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFeaturedPicker">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { setSetting, getSetting } from "@/api/index";
import {
  getDistributionCustomerSetting,
  putDistributionCustomerSetting,
  getDistributionSettlementSetting,
  putDistributionSettlementSetting,
  getDistributionFeaturedGoodsSetting,
  putDistributionFeaturedGoodsSetting,
  getDistributionPromotionPosterSetting,
  putDistributionPromotionPosterSetting,
  getDistributionInviteCardSetting,
  putDistributionInviteCardSetting,
  getDistributionGoods,
} from "@/api/distribution";
import uploadPicInput from "@/components/lili/upload-pic-input";
import { regular } from "@/utils";
import { Message } from "@/utils/message";

const DEFAULT_FORM = {
  isOpen: true,
  distributorName: "分销员",
  upgradeConditionVisible: true,
  parentDistributorVisible: true,
  parentAttributionMode: "RECRUIT_INVITER",
};

const DEFAULT_POSTER_FORM = {
  memberInfoVisible: true,
  backgroundImage: "",
  slogan: "发现好物，邀请你一起逛逛",
  textColor: "#1f2a44",
};

const DEFAULT_INVITE_CARD_FORM = {
  memberInfoVisible: true,
  backgroundImage: "",
  slogan: "邀请您成为我的下级分销员",
  textColor: "#1f2a44",
};

const DEFAULT_FEATURED_FORM = {
  defaultSort: "HIGHEST_COMMISSION",
  defaultShareText: "",
  centerVisible: false,
  showSales: false,
  sourceMode: "AUTO",
  matchRule: "HIGHEST_COMMISSION",
  displayCount: 5,
};

const DEFAULT_SORT_OPTIONS = [
  { value: "HIGHEST_COMMISSION", label: "商品佣金越高越靠前" },
  { value: "HIGHEST_PRICE", label: "商品价格越高越靠前" },
  { value: "HIGHEST_SALES", label: "商品销量越高越靠前" },
  { value: "LATEST_LISTING", label: "商品上架越晚越靠前" },
];

defineOptions({ name: "distributionSetting" });

const formRef = ref(null);
const featuredPickerTable = ref(null);

const activeTab = ref("base");
const saving = reactive({
  base: false,
  customer: false,
  settlement: false,
  featured: false,
  poster: false,
  inviteCard: false,
});
const form = ref({ ...DEFAULT_FORM });
const formRule = reactive({
  isOpen: [regular.REQUIRED],
  distributorName: [regular.REQUIRED, regular.VARCHAR20],
});
const customerForm = ref({
  bindMode: "SHORT_TERM",
  permanentBindMode: "PAID_WITHIN_DAYS",
  permanentPaidDays: 1,
  shortTermBindDays: 7,
});
const settlementForm = ref({
  selfPurchaseCommissionMode: "SELF",
});
const posterForm = ref({ ...DEFAULT_POSTER_FORM });
const inviteCardForm = ref({ ...DEFAULT_INVITE_CARD_FORM });
const featuredForm = ref({ ...DEFAULT_FEATURED_FORM });
const defaultSortOptions = ref(DEFAULT_SORT_OPTIONS);
const featuredCustomGoods = ref([]);
const featuredPickerVisible = ref(false);
const featuredPickerLoading = ref(false);
const featuredPickerList = ref([]);
const featuredPickerTotal = ref(0);
const featuredPickerDraft = ref([]);
const featuredPickerSelection = ref([]);
const syncingFeaturedPickerSelection = ref(false);
const featuredPickerSearch = reactive({
  goodsName: "",
  authStatus: "PASS",
  pageNumber: 1,
  pageSize: 20,
});

const featuredGoodsLimit = computed(() => {
  return featuredForm.value.displayCount === 10 ? 10 : 5;
});
const featuredGoodsOverLimit = computed(() => {
  return featuredForm.value.sourceMode === "CUSTOM" && featuredCustomGoods.value.length > featuredGoodsLimit.value;
});
const featuredDisplayCountDesc = computed(() => {
  if (featuredForm.value.sourceMode === "CUSTOM") {
    return `最多选择 ${featuredGoodsLimit.value} 个，分销员端按顺序展示。`;
  }
  return `分销员端展示前 ${featuredGoodsLimit.value} 个。`;
});

watch(
  () => customerForm.value.permanentBindMode,
  (value) => {
    if (value === "PAID_WITHIN_DAYS") {
      normalizePermanentPaidDays();
    }
  }
);

onMounted(() => {
  init();
});

function init() {
  loadBaseSetting();
  loadFeaturedSetting();
  loadPosterSetting();
  loadInviteCardSetting();
  loadCustomerSetting();
  loadSettlementSetting();
}
function loadBaseSetting() {
  getSetting("DISTRIBUTION_SETTING").then((res) => {
    if (!res.success || !res.result) {
      return;
    }
    const result = res.result;
    form.value = {
      ...DEFAULT_FORM,
      ...result,
      distributorName: result.distributorName || "分销员",
      parentAttributionMode: result.parentAttributionMode || DEFAULT_FORM.parentAttributionMode,
    };
  });
}
function loadPosterSetting() {
  getDistributionPromotionPosterSetting().then((res) => {
    if (!res.success || !res.result) {
      return;
    }
    const result = res.result;
    posterForm.value = {
      ...DEFAULT_POSTER_FORM,
      memberInfoVisible: result.memberInfoVisible !== false,
      backgroundImage: result.backgroundImage || "",
      slogan: result.slogan || DEFAULT_POSTER_FORM.slogan,
      textColor: result.textColor || DEFAULT_POSTER_FORM.textColor,
    };
  });
}
function submitPoster() {
  const slogan = (posterForm.value.slogan || "").trim();
  if (!slogan) {
    Message.warning("请填写推荐语");
    return;
  }
  saving.poster = true;
  putDistributionPromotionPosterSetting({
    memberInfoVisible: posterForm.value.memberInfoVisible,
    backgroundImage: (posterForm.value.backgroundImage || "").trim(),
    slogan,
    textColor: posterForm.value.textColor || DEFAULT_POSTER_FORM.textColor,
  })
    .then((res) => {
      if (res.success) {
        Message.success("操作成功");
        loadPosterSetting();
      }
    })
    .finally(() => {
      saving.poster = false;
    });
}
function loadInviteCardSetting() {
  getDistributionInviteCardSetting().then((res) => {
    if (!res.success || !res.result) {
      return;
    }
    const result = res.result;
    inviteCardForm.value = {
      ...DEFAULT_INVITE_CARD_FORM,
      memberInfoVisible: result.memberInfoVisible !== false,
      backgroundImage: result.backgroundImage || "",
      slogan: result.slogan || DEFAULT_INVITE_CARD_FORM.slogan,
      textColor: result.textColor || DEFAULT_INVITE_CARD_FORM.textColor,
    };
  });
}
function submitInviteCard() {
  const slogan = (inviteCardForm.value.slogan || "").trim();
  if (!slogan) {
    Message.warning("请填写推荐语");
    return;
  }
  saving.inviteCard = true;
  putDistributionInviteCardSetting({
    memberInfoVisible: inviteCardForm.value.memberInfoVisible,
    backgroundImage: (inviteCardForm.value.backgroundImage || "").trim(),
    slogan,
    textColor: inviteCardForm.value.textColor || DEFAULT_INVITE_CARD_FORM.textColor,
  })
    .then((res) => {
      if (res.success) {
        Message.success("操作成功");
        loadInviteCardSetting();
      }
    })
    .finally(() => {
      saving.inviteCard = false;
    });
}
function loadFeaturedSetting() {
  getDistributionFeaturedGoodsSetting().then((res) => {
    if (!res.success || !res.result) {
      return;
    }
    const result = res.result;
    featuredForm.value = {
      ...DEFAULT_FEATURED_FORM,
      defaultSort: result.defaultSort || DEFAULT_FEATURED_FORM.defaultSort,
      defaultShareText: result.defaultShareText || "",
      centerVisible: !!result.centerVisible,
      showSales: !!result.showSales,
      sourceMode: result.sourceMode || DEFAULT_FEATURED_FORM.sourceMode,
      matchRule: result.matchRule || DEFAULT_FEATURED_FORM.matchRule,
      displayCount: result.displayCount === 10 ? 10 : 5,
    };
    featuredCustomGoods.value = Array.isArray(result.customGoods) ? [...result.customGoods] : [];
  });
}
function loadCustomerSetting() {
  getDistributionCustomerSetting().then((res) => {
    if (res.success && res.result) {
      customerForm.value = { ...customerForm.value, ...res.result };
      normalizePermanentPaidDays();
    }
  });
}
function normalizePermanentPaidDays() {
  const days = Number(customerForm.value.permanentPaidDays);
  if (!Number.isFinite(days) || days < 1) {
    customerForm.value.permanentPaidDays = 1;
  } else {
    customerForm.value.permanentPaidDays = Math.floor(days);
  }
}
function onPermanentPaidDaysChange(value) {
  if (value == null || value < 1) {
    customerForm.value.permanentPaidDays = 1;
  }
}
function loadSettlementSetting() {
  getDistributionSettlementSetting().then((res) => {
    if (res.success && res.result) {
      settlementForm.value = { ...settlementForm.value, ...res.result };
    }
  });
}
function openFeaturedGoodsPicker() {
  featuredPickerDraft.value = featuredCustomGoods.value.map((item) => ({ ...item }));
  featuredPickerVisible.value = true;
}
function loadFeaturedPickerGoods() {
  featuredPickerLoading.value = true;
  syncingFeaturedPickerSelection.value = true;
  getDistributionGoods({ ...featuredPickerSearch })
    .then((res) => {
      if (res.success) {
        featuredPickerList.value = res.result?.records || [];
        featuredPickerTotal.value = res.result?.total || 0;
      }
    })
    .finally(() => {
      featuredPickerLoading.value = false;
      nextTick(() => {
        syncFeaturedPickerSelection();
        nextTick(() => {
          syncingFeaturedPickerSelection.value = false;
        });
      });
    });
}
function syncFeaturedPickerSelection() {
  const table = featuredPickerTable.value;
  if (!table) {
    return;
  }
  const selectedSkuIds = new Set(
    featuredPickerDraft.value.map((item) => item.skuId).filter(Boolean)
  );
  table.clearSelection();
  featuredPickerList.value.forEach((row) => {
    if (row.skuId && selectedSkuIds.has(row.skuId)) {
      table.toggleRowSelection(row, true);
    }
  });
}
function searchFeaturedPickerGoods() {
  featuredPickerSearch.pageNumber = 1;
  loadFeaturedPickerGoods();
}
function onFeaturedPickerPageSizeChange() {
  featuredPickerSearch.pageNumber = 1;
  loadFeaturedPickerGoods();
}
function onFeaturedPickerSelectionChange(selection) {
  if (syncingFeaturedPickerSelection.value) {
    return;
  }
  const selectedSkuIds = new Set((selection || []).map((item) => item.skuId).filter(Boolean));
  const currentPageSkuIds = new Set(featuredPickerList.value.map((item) => item.skuId).filter(Boolean));
  const remaining = featuredPickerDraft.value.filter((item) => {
    if (!currentPageSkuIds.has(item.skuId)) {
      return true;
    }
    return selectedSkuIds.has(item.skuId);
  });
  const remainingSkuIds = new Set(remaining.map((item) => item.skuId));
  const added = [];
  (selection || []).forEach((item) => {
    if (!item.skuId || remainingSkuIds.has(item.skuId)) {
      return;
    }
    remainingSkuIds.add(item.skuId);
    added.push(toFeaturedGoodsItem(item));
  });
  featuredPickerDraft.value = [...remaining, ...added];
  featuredPickerSelection.value = selection || [];
}
function toFeaturedGoodsItem(item) {
  return {
    id: item.id,
    goodsId: item.goodsId,
    skuId: item.skuId,
    goodsName: item.goodsName,
    specs: item.specs,
    thumbnail: item.thumbnail,
    price: item.price,
    commission: item.commission,
    storeName: item.storeName,
  };
}
function featuredGoodsLimitMessage() {
  const limit = featuredGoodsLimit.value;
  return `主推商品数量为${limit}时，最多选择${limit}个自定义商品`;
}
function confirmFeaturedPicker() {
  const next = featuredPickerDraft.value.filter((item) => item.skuId);
  if (!next.length) {
    Message.warning("请至少选择一个分销商品");
    return;
  }
  const limit = featuredGoodsLimit.value;
  if (next.length > limit) {
    Message.warning(featuredGoodsLimitMessage());
    return;
  }
  featuredCustomGoods.value = next;
  featuredPickerVisible.value = false;
  featuredPickerSelection.value = [];
}
function removeFeaturedGoods(index) {
  featuredCustomGoods.value.splice(index, 1);
}
function buildFeaturedPayload() {
  return {
    defaultSort: featuredForm.value.defaultSort,
    defaultShareText: (featuredForm.value.defaultShareText || "").trim(),
    centerVisible: featuredForm.value.centerVisible,
    showSales: featuredForm.value.showSales,
    sourceMode: featuredForm.value.sourceMode,
    matchRule: featuredForm.value.matchRule,
    displayCount: featuredForm.value.displayCount === 10 ? 10 : 5,
    skuIds:
      featuredForm.value.sourceMode === "CUSTOM"
        ? featuredCustomGoods.value.map((item) => item.skuId).filter(Boolean)
        : undefined,
  };
}
function submitFeatured() {
  if (featuredForm.value.sourceMode === "CUSTOM" && !featuredCustomGoods.value.length) {
    Message.warning("请至少选择一个自定义主推商品");
    return;
  }
  if (featuredGoodsOverLimit.value) {
    Message.warning(featuredGoodsLimitMessage());
    return;
  }
  saving.featured = true;
  putDistributionFeaturedGoodsSetting(buildFeaturedPayload())
    .then((res) => {
      if (res.success) {
        Message.success("操作成功");
        loadFeaturedSetting();
      }
    })
    .finally(() => {
      saving.featured = false;
    });
}
function buildBasePayload() {
  return {
    isOpen: form.value.isOpen,
    distributorName: (form.value.distributorName || "分销员").trim(),
    upgradeConditionVisible: form.value.upgradeConditionVisible,
    parentDistributorVisible: form.value.parentDistributorVisible,
    parentAttributionMode: form.value.parentAttributionMode,
  };
}
function submitBase() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    saving.base = true;
    setSetting("DISTRIBUTION_SETTING", buildBasePayload())
      .then((res) => {
        if (res.success) {
          Message.success("操作成功");
          loadBaseSetting();
        }
      })
      .finally(() => {
        saving.base = false;
      });
  });
}
function submitCustomer() {
  normalizePermanentPaidDays();
  if (
    customerForm.value.bindMode === "PERMANENT" &&
    customerForm.value.permanentBindMode === "PAID_WITHIN_DAYS" &&
    customerForm.value.permanentPaidDays < 1
  ) {
    Message.warning("永久锁客支付天数不能低于1天");
    return;
  }
  saving.customer = true;
  putDistributionCustomerSetting(customerForm.value)
    .then((res) => {
      if (res.success) {
        Message.success("操作成功");
        loadCustomerSetting();
      }
    })
    .finally(() => {
      saving.customer = false;
    });
}
function submitSettlement() {
  saving.settlement = true;
  putDistributionSettlementSetting(settlementForm.value)
    .then((res) => {
      if (res.success) {
        Message.success("操作成功");
        loadSettlementSetting();
      }
    })
    .finally(() => {
      saving.settlement = false;
    });
}
</script>

<style scoped lang="scss">
.distribution-setting {
  .setting-tabs {
    overflow: visible;
  }

  .setting-form {
    max-width: 760px;
    padding: 16px 8px 8px;
  }

  .form-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 12px;
  }

  .option-with-desc {
    width: 100%;
  }

  .radio-option-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    .radio-option-item + .radio-option-item {
      margin-top: 12px;
    }

    .radio-option-item .form-desc {
      margin-top: 4px;
      margin-left: 24px;
    }
  }

  .form-desc {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .featured-form {
    max-width: 900px;
  }

  .poster-form {
    max-width: 760px;
  }

  .poster-upload-block {
    width: 100%;
  }

  .poster-preview-wrap {
    margin-bottom: 12px;
  }

  .poster-bg-thumb {
    width: 180px;
    height: 260px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ebeef5;
  }

  .setting-section {
    margin-bottom: 28px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .setting-section:last-of-type {
    border-bottom: none;
    margin-bottom: 12px;
  }

  .section-title {
    margin-bottom: 20px;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }

  .custom-goods-block {
    width: 100%;
  }

  .featured-over-limit-tip {
    margin-bottom: 8px;
    padding: 8px 12px;
    color: #e6a23c;
    background: #fdf6ec;
    border: 1px solid #f5dab1;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
  }

  .goods-toolbar {
    margin: 8px 0 12px;
  }

  .link-btn {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .delete-btn {
    color: #f56c6c;
  }

  .featured-goods-table {
    width: 100%;
  }

  .featured-goods-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
  }

  .featured-goods-name {
    line-height: 1.5;
    word-break: break-all;
  }

  .featured-picker-search {
    margin-bottom: 12px;
  }

  .featured-picker-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
}
</style>
