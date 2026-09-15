<template>
  <div class="distribution-setting">
    <el-card>
      <el-tabs v-model="activeTab" class="setting-tabs">
        <el-tab-pane label="基础设置" name="base">
          <el-form
            ref="form"
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
            ref="customerForm"
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
            ref="settlementForm"
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
            ref="featuredForm"
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

<script>
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

export default {
  name: "distributionSetting",
  components: {
    uploadPicInput,
  },
  data() {
    return {
      activeTab: "base",
      saving: {
        base: false,
        customer: false,
        settlement: false,
        featured: false,
        poster: false,
        inviteCard: false,
      },
      form: { ...DEFAULT_FORM },
      formRule: {
        isOpen: [regular.REQUIRED],
        distributorName: [regular.REQUIRED, regular.VARCHAR20],
      },
      customerForm: {
        bindMode: "SHORT_TERM",
        permanentBindMode: "PAID_WITHIN_DAYS",
        permanentPaidDays: 1,
        shortTermBindDays: 7,
      },
      settlementForm: {
        selfPurchaseCommissionMode: "SELF",
      },
      posterForm: { ...DEFAULT_POSTER_FORM },
      inviteCardForm: { ...DEFAULT_INVITE_CARD_FORM },
      featuredForm: { ...DEFAULT_FEATURED_FORM },
      defaultSortOptions: DEFAULT_SORT_OPTIONS,
      featuredCustomGoods: [],
      featuredPickerVisible: false,
      featuredPickerLoading: false,
      featuredPickerList: [],
      featuredPickerTotal: 0,
      featuredPickerDraft: [],
      featuredPickerSelection: [],
      syncingFeaturedPickerSelection: false,
      featuredPickerSearch: {
        goodsName: "",
        authStatus: "PASS",
        pageNumber: 1,
        pageSize: 20,
      },
    };
  },
  computed: {
    featuredGoodsLimit() {
      return this.featuredForm.displayCount === 10 ? 10 : 5;
    },
    featuredGoodsOverLimit() {
      return this.featuredForm.sourceMode === "CUSTOM" && this.featuredCustomGoods.length > this.featuredGoodsLimit;
    },
    featuredDisplayCountDesc() {
      if (this.featuredForm.sourceMode === "CUSTOM") {
        return `最多选择 ${this.featuredGoodsLimit} 个，分销员端按顺序展示。`;
      }
      return `分销员端展示前 ${this.featuredGoodsLimit} 个。`;
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    "customerForm.permanentBindMode"(value) {
      if (value === "PAID_WITHIN_DAYS") {
        this.normalizePermanentPaidDays();
      }
    },
  },
  methods: {
    init() {
      this.loadBaseSetting();
      this.loadFeaturedSetting();
      this.loadPosterSetting();
      this.loadInviteCardSetting();
      this.loadCustomerSetting();
      this.loadSettlementSetting();
    },
    loadBaseSetting() {
      getSetting("DISTRIBUTION_SETTING").then((res) => {
        if (!res.success || !res.result) {
          return;
        }
        const result = res.result;
        this.form = {
          ...DEFAULT_FORM,
          ...result,
          distributorName: result.distributorName || "分销员",
          parentAttributionMode: result.parentAttributionMode || DEFAULT_FORM.parentAttributionMode,
        };
      });
    },
    loadPosterSetting() {
      getDistributionPromotionPosterSetting().then((res) => {
        if (!res.success || !res.result) {
          return;
        }
        const result = res.result;
        this.posterForm = {
          ...DEFAULT_POSTER_FORM,
          memberInfoVisible: result.memberInfoVisible !== false,
          backgroundImage: result.backgroundImage || "",
          slogan: result.slogan || DEFAULT_POSTER_FORM.slogan,
          textColor: result.textColor || DEFAULT_POSTER_FORM.textColor,
        };
      });
    },
    submitPoster() {
      const slogan = (this.posterForm.slogan || "").trim();
      if (!slogan) {
        this.$Message.warning("请填写推荐语");
        return;
      }
      this.saving.poster = true;
      putDistributionPromotionPosterSetting({
        memberInfoVisible: this.posterForm.memberInfoVisible,
        backgroundImage: (this.posterForm.backgroundImage || "").trim(),
        slogan,
        textColor: this.posterForm.textColor || DEFAULT_POSTER_FORM.textColor,
      })
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.loadPosterSetting();
          }
        })
        .finally(() => {
          this.saving.poster = false;
        });
    },
    loadInviteCardSetting() {
      getDistributionInviteCardSetting().then((res) => {
        if (!res.success || !res.result) {
          return;
        }
        const result = res.result;
        this.inviteCardForm = {
          ...DEFAULT_INVITE_CARD_FORM,
          memberInfoVisible: result.memberInfoVisible !== false,
          backgroundImage: result.backgroundImage || "",
          slogan: result.slogan || DEFAULT_INVITE_CARD_FORM.slogan,
          textColor: result.textColor || DEFAULT_INVITE_CARD_FORM.textColor,
        };
      });
    },
    submitInviteCard() {
      const slogan = (this.inviteCardForm.slogan || "").trim();
      if (!slogan) {
        this.$Message.warning("请填写推荐语");
        return;
      }
      this.saving.inviteCard = true;
      putDistributionInviteCardSetting({
        memberInfoVisible: this.inviteCardForm.memberInfoVisible,
        backgroundImage: (this.inviteCardForm.backgroundImage || "").trim(),
        slogan,
        textColor: this.inviteCardForm.textColor || DEFAULT_INVITE_CARD_FORM.textColor,
      })
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.loadInviteCardSetting();
          }
        })
        .finally(() => {
          this.saving.inviteCard = false;
        });
    },
    loadFeaturedSetting() {
      getDistributionFeaturedGoodsSetting().then((res) => {
        if (!res.success || !res.result) {
          return;
        }
        const result = res.result;
        this.featuredForm = {
          ...DEFAULT_FEATURED_FORM,
          defaultSort: result.defaultSort || DEFAULT_FEATURED_FORM.defaultSort,
          defaultShareText: result.defaultShareText || "",
          centerVisible: !!result.centerVisible,
          showSales: !!result.showSales,
          sourceMode: result.sourceMode || DEFAULT_FEATURED_FORM.sourceMode,
          matchRule: result.matchRule || DEFAULT_FEATURED_FORM.matchRule,
          displayCount: result.displayCount === 10 ? 10 : 5,
        };
        this.featuredCustomGoods = Array.isArray(result.customGoods) ? [...result.customGoods] : [];
      });
    },
    loadCustomerSetting() {
      getDistributionCustomerSetting().then((res) => {
        if (res.success && res.result) {
          this.customerForm = { ...this.customerForm, ...res.result };
          this.normalizePermanentPaidDays();
        }
      });
    },
    normalizePermanentPaidDays() {
      const days = Number(this.customerForm.permanentPaidDays);
      if (!Number.isFinite(days) || days < 1) {
        this.customerForm.permanentPaidDays = 1;
      } else {
        this.customerForm.permanentPaidDays = Math.floor(days);
      }
    },
    onPermanentPaidDaysChange(value) {
      if (value == null || value < 1) {
        this.customerForm.permanentPaidDays = 1;
      }
    },
    loadSettlementSetting() {
      getDistributionSettlementSetting().then((res) => {
        if (res.success && res.result) {
          this.settlementForm = { ...this.settlementForm, ...res.result };
        }
      });
    },
    openFeaturedGoodsPicker() {
      this.featuredPickerDraft = this.featuredCustomGoods.map((item) => ({ ...item }));
      this.featuredPickerVisible = true;
    },
    loadFeaturedPickerGoods() {
      this.featuredPickerLoading = true;
      this.syncingFeaturedPickerSelection = true;
      getDistributionGoods({ ...this.featuredPickerSearch })
        .then((res) => {
          if (res.success) {
            this.featuredPickerList = res.result?.records || [];
            this.featuredPickerTotal = res.result?.total || 0;
          }
        })
        .finally(() => {
          this.featuredPickerLoading = false;
          this.$nextTick(() => {
            this.syncFeaturedPickerSelection();
            this.$nextTick(() => {
              this.syncingFeaturedPickerSelection = false;
            });
          });
        });
    },
    syncFeaturedPickerSelection() {
      const table = this.$refs.featuredPickerTable;
      if (!table) {
        return;
      }
      const selectedSkuIds = new Set(
        this.featuredPickerDraft.map((item) => item.skuId).filter(Boolean)
      );
      table.clearSelection();
      this.featuredPickerList.forEach((row) => {
        if (row.skuId && selectedSkuIds.has(row.skuId)) {
          table.toggleRowSelection(row, true);
        }
      });
    },
    searchFeaturedPickerGoods() {
      this.featuredPickerSearch.pageNumber = 1;
      this.loadFeaturedPickerGoods();
    },
    onFeaturedPickerPageSizeChange() {
      this.featuredPickerSearch.pageNumber = 1;
      this.loadFeaturedPickerGoods();
    },
    onFeaturedPickerSelectionChange(selection) {
      if (this.syncingFeaturedPickerSelection) {
        return;
      }
      const selectedSkuIds = new Set((selection || []).map((item) => item.skuId).filter(Boolean));
      const currentPageSkuIds = new Set(this.featuredPickerList.map((item) => item.skuId).filter(Boolean));
      const remaining = this.featuredPickerDraft.filter((item) => {
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
        added.push(this.toFeaturedGoodsItem(item));
      });
      this.featuredPickerDraft = [...remaining, ...added];
      this.featuredPickerSelection = selection || [];
    },
    toFeaturedGoodsItem(item) {
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
    },
    featuredGoodsLimitMessage() {
      const limit = this.featuredGoodsLimit;
      return `主推商品数量为${limit}时，最多选择${limit}个自定义商品`;
    },
    confirmFeaturedPicker() {
      const next = this.featuredPickerDraft.filter((item) => item.skuId);
      if (!next.length) {
        this.$Message.warning("请至少选择一个分销商品");
        return;
      }
      const limit = this.featuredGoodsLimit;
      if (next.length > limit) {
        this.$Message.warning(this.featuredGoodsLimitMessage());
        return;
      }
      this.featuredCustomGoods = next;
      this.featuredPickerVisible = false;
      this.featuredPickerSelection = [];
    },
    removeFeaturedGoods(index) {
      this.featuredCustomGoods.splice(index, 1);
    },
    buildFeaturedPayload() {
      return {
        defaultSort: this.featuredForm.defaultSort,
        defaultShareText: (this.featuredForm.defaultShareText || "").trim(),
        centerVisible: this.featuredForm.centerVisible,
        showSales: this.featuredForm.showSales,
        sourceMode: this.featuredForm.sourceMode,
        matchRule: this.featuredForm.matchRule,
        displayCount: this.featuredForm.displayCount === 10 ? 10 : 5,
        skuIds:
          this.featuredForm.sourceMode === "CUSTOM"
            ? this.featuredCustomGoods.map((item) => item.skuId).filter(Boolean)
            : undefined,
      };
    },
    submitFeatured() {
      if (this.featuredForm.sourceMode === "CUSTOM" && !this.featuredCustomGoods.length) {
        this.$Message.warning("请至少选择一个自定义主推商品");
        return;
      }
      if (this.featuredGoodsOverLimit) {
        this.$Message.warning(this.featuredGoodsLimitMessage());
        return;
      }
      this.saving.featured = true;
      putDistributionFeaturedGoodsSetting(this.buildFeaturedPayload())
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.loadFeaturedSetting();
          }
        })
        .finally(() => {
          this.saving.featured = false;
        });
    },
    buildBasePayload() {
      return {
        isOpen: this.form.isOpen,
        distributorName: (this.form.distributorName || "分销员").trim(),
        upgradeConditionVisible: this.form.upgradeConditionVisible,
        parentDistributorVisible: this.form.parentDistributorVisible,
        parentAttributionMode: this.form.parentAttributionMode,
      };
    },
    submitBase() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.saving.base = true;
        setSetting("DISTRIBUTION_SETTING", this.buildBasePayload())
          .then((res) => {
            if (res.success) {
              this.$Message.success("操作成功");
              this.loadBaseSetting();
            }
          })
          .finally(() => {
            this.saving.base = false;
          });
      });
    },
    submitCustomer() {
      this.normalizePermanentPaidDays();
      if (
        this.customerForm.bindMode === "PERMANENT" &&
        this.customerForm.permanentBindMode === "PAID_WITHIN_DAYS" &&
        this.customerForm.permanentPaidDays < 1
      ) {
        this.$Message.warning("永久锁客支付天数不能低于1天");
        return;
      }
      this.saving.customer = true;
      putDistributionCustomerSetting(this.customerForm)
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.loadCustomerSetting();
          }
        })
        .finally(() => {
          this.saving.customer = false;
        });
    },
    submitSettlement() {
      this.saving.settlement = true;
      putDistributionSettlementSetting(this.settlementForm)
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.loadSettlementSetting();
          }
        })
        .finally(() => {
          this.saving.settlement = false;
        });
    },
  },
};
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
