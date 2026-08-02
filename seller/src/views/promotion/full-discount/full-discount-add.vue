<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                :disabled="fieldDisabled"
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动时间" prop="rangeTime">
              <el-date-picker
                class="full-discount-range-picker"
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
            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="form.description"
                :disabled="fieldDisabled"
                type="textarea"
                :rows="4"
                clearable
                style="width: 260px"
              />
            </el-form-item>
          </div>

          <h4>优惠设置</h4>
          <div class="form-item-view">
            <el-form-item label="优惠门槛" prop="fullMoney">
              <el-input
                v-model="form.fullMoney"
                :disabled="fieldDisabled"
                placeholder="优惠门槛"
                clearable
                style="width: 260px"
              />
              <span class="describe">消费达到当前金额可以参与优惠</span>
            </el-form-item>
            <el-form-item label="优惠方式">
              <el-radio-group v-model="form.discountType" :disabled="fieldDisabled">
                <el-radio-button value="fullMinusFlag">减现金</el-radio-button>
                <el-radio-button value="fullRateFlag">打折</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="form.discountType == 'fullMinusFlag'"
              label="优惠金额"
              prop="fullMinus"
            >
              <el-input
                :disabled="fieldDisabled"
                v-model="form.fullMinus"
                placeholder="优惠金额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item
              v-if="form.discountType == 'fullRateFlag'"
              label="优惠折扣"
              prop="fullRate"
            >
              <el-input-number
                :disabled="fieldDisabled"
                v-model="form.fullRate"
                placeholder="优惠折扣"
                :min="0.1"
                :max="9.9"
                :step="0.1"
                :precision="1"
                style="width: 260px"
              />
              <span class="describe">优惠折扣为0-10之间数字，可有一位小数</span>
            </el-form-item>
            <el-form-item label="额外赠送">
              <el-checkbox v-model="form.freeFreightFlag" :disabled="fieldDisabled">免邮费</el-checkbox>
              <el-checkbox v-model="form.couponFlag" :disabled="fieldDisabled">送优惠券</el-checkbox>
              <el-checkbox v-model="form.giftFlag" :disabled="fieldDisabled">送赠品</el-checkbox>
              <el-checkbox v-model="form.pointFlag" :disabled="fieldDisabled">送积分</el-checkbox>
            </el-form-item>
            <el-form-item v-if="form.couponFlag" label="赠送优惠券" prop="couponId">
              <el-select
                v-model="form.couponId"
                :disabled="fieldDisabled"
                filterable
                remote
                :remote-method="getCouponList"
                placeholder="输入优惠券名称搜索"
                :loading="couponLoading"
                style="width: 280px"
              >
                <el-option
                  v-for="item in couponList"
                  :value="item.id"
                  :key="item.id"
                  :label="item.couponName"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.giftFlag" label="赠品" prop="giftId">
              <p class="describe">电子卡券赠品支付后自动发卡；卡池不足时仅取消赠品子单，不影响主订单。</p>
              <el-select
                v-model="form.giftId"
                filterable
                remote
                :remote-method="getGiftList"
                placeholder="输入赠品名称搜索"
                :disabled="fieldDisabled"
                :loading="giftLoading"
                style="width: 260px"
              >
                <el-option
                  v-for="item in giftList"
                  :value="item.id"
                  :key="item.id"
                  :label="giftOptionLabel(item)"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.pointFlag" label="赠积分" prop="point">
              <el-input
                v-model="form.point"
                type="number"
                :disabled="fieldDisabled"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType" :disabled="fieldDisabled">
                <el-radio-button value="ALL">全品类</el-radio-button>
                <el-radio-button value="PORTION_GOODS">指定商品</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="width: 100%" v-if="form.scopeType == 'PORTION_GOODS'">
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
                <el-table-column label="商品名称" min-width="120" show-overflow-tooltip>
                  <template #default="{ row }">
                    <template v-if="row">
                      <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{
                        row.goodsName
                      }}</a>
                      <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                        <template #reference>
                          <img
                            src="../../../assets/qrcode.svg"
                            style="vertical-align: middle"
                            class="hover-pointer"
                            width="20"
                            height="20"
                            alt=""
                          />
                        </template>
                        <vue-qr
                          :text="wapLinkTo(row.goodsId, row.skuId)"
                          :margin="0"
                          color-dark="#000"
                          color-light="#fff"
                          :size="150"
                        />
                      </el-popover>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column label="商品价格" width="110">
                  <template #default="{ row }">
                    <span v-if="row" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="90">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="!fieldDisabled" label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <a class="link-text" @click="delGoods($index)">删除</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <div>
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
          </div>
        </div>
      </el-form>
    </el-card>
    <liliDialog ref="liliDialog" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script>
import {
  getShopCouponList,
  getFullDiscountById,
  newFullDiscount,
  editFullDiscount,
} from "@/api/promotion";
import { getGoodsSkuListDataSeller } from "@/api/goods";
import { regular } from "@/utils";
import vueQr from "vue-qr";
import { goodsTypeLabel } from "@/constants/goodsType";

export default {
  name: "add-full-discount",
  components: {
    "vue-qr": vueQr,
  },
  data() {
    const checkWeight = (rule, value, callback) => {
      if (!value && typeof value !== "number") {
        callback(new Error("优惠门槛不能为空"));
      } else if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("优惠门槛设置超过上限值"));
      } else {
        callback();
      }
    };
    const checkDiscount = (rule, value, callback) => {
      if (value === null || value === undefined || value === "") {
        callback(new Error("请填写优惠折扣"));
      } else if (value < 0.1 || value > 9.9) {
        callback(new Error("请输入0-10的数字,可有一位小数"));
      } else {
        callback();
      }
    };
    return {
      form: {
        discountType: "fullMinusFlag",
        scopeType: "ALL",
        promotionGoodsList: [],
        promotionStatus: "NEW",
      },
      id: this.$route.query.id,
      submitLoading: false,
      selectedGoods: [],
      couponList: [],
      giftList: [],
      giftLoading: false,
      couponLoading: false,
      formRule: {
        promotionName: [{ required: true, message: "活动名称不能为空" }],
        rangeTime: [{ required: true, message: "请选择活动时间" }],
        description: [{ required: true, message: "请填写活动描述" }],
        fullMoney: [{ required: true, validator: checkWeight }],
        fullMinus: [
          { required: true, message: "请填写优惠金额" },
          { pattern: regular.money, message: "请输入正确金额" },
        ],
        fullRate: [{ required: true, validator: checkDiscount }],
      },
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  computed: {
    fieldDisabled() {
      return !!this.id && this.form.promotionStatus !== "NEW";
    },
  },
  mounted() {
    if (this.id) {
      this.getDetail();
    }
    this.getCouponList();
    this.getGiftList();
  },
  methods: {
    giftOptionLabel(item) {
      if (!item) return "";
      const typeLabel =
        item.goodsType === "E_COUPON" ? ` [${goodsTypeLabel(item.goodsType)}]` : "";
      const stock =
        item.goodsType === "E_COUPON" && item.quantity != null
          ? ` · 库存${item.quantity}`
          : "";
      return `${item.goodsName || ""}${typeLabel}${stock}`;
    },
    closeCurrentPage() {
      this.$router.back();
    },
    openSkuList() {
      this.$refs.liliDialog.open("goods");
      const data = JSON.parse(JSON.stringify(this.form.promotionGoodsList));
      data.forEach((e) => {
        e.id = e.skuId;
      });
      this.$refs.liliDialog.goodsData = data;
    },
    getDetail() {
      getFullDiscountById(this.id).then((res) => {
        const data = res.result;
        if (data.scopeType === "ALL") {
          data.promotionGoodsList = [];
        }
        if (data.fullMinusFlag) {
          data.discountType = "fullMinusFlag";
          delete data.fullMinusFlag;
        } else {
          data.discountType = "fullRateFlag";
          delete data.fullRateFlag;
        }
        data.rangeTime = [new Date(data.startTime), new Date(data.endTime)];
        if (data.fullRate !== null && data.fullRate !== undefined && data.fullRate !== "") {
          data.fullRate = parseFloat(Number(data.fullRate).toFixed(1));
        }
        this.form = data;
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        const params = JSON.parse(JSON.stringify(this.form));
        params.startTime = this.$filters.unixToDate(this.form.rangeTime[0] / 1000);
        params.endTime = this.$filters.unixToDate(this.form.rangeTime[1] / 1000);

        if (params.couponFlag && !params.couponId) {
          this.$Message.warning("请选择优惠券");
          return;
        }
        if (params.giftFlag && !params.giftId) {
          this.$Message.warning("请选择赠品");
          return;
        }
        if (params.pointFlag && !params.point) {
          this.$Message.warning("请填写积分");
          return;
        }

        if (
          params.scopeType === "PORTION_GOODS" &&
          (!params.promotionGoodsList || params.promotionGoodsList.length === 0)
        ) {
          this.$Message.warning("请选择指定商品");
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
        if (params.discountType === "fullMinusFlag") {
          params.fullMinusFlag = true;
        } else {
          params.fullRateFlag = true;
        }
        delete params.discountType;
        delete params.rangeTime;
        if (!this.id) {
          delete params.id;
        } else {
          delete params.updateTime;
        }

        this.submitLoading = true;
        const request = this.id ? editFullDiscount(params) : newFullDiscount(params);
        request.then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.$Message.success(this.id ? "编辑活动成功" : "添加活动成功");
            this.closeCurrentPage();
          }
        });
      });
    },
    changeSelect(e) {
      this.selectedGoods = e;
    },
    delSelectGoods() {
      if (this.selectedGoods.length <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选商品吗?",
        onOk: () => {
          const ids = this.selectedGoods.map((e) => e.skuId || e.id);
          this.form.promotionGoodsList = this.form.promotionGoodsList.filter(
            (item) => !ids.includes(item.skuId)
          );
        },
      });
    },
    delGoods(index) {
      this.form.promotionGoodsList.splice(index, 1);
    },
    selectedGoodsData(item) {
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
        });
      });
      this.form.promotionGoodsList = list;
    },
    getCouponList(query) {
      const params = {
        pageSize: 20,
        pageNumber: 1,
        getType: "ACTIVITY",
        couponName: query,
        promotionStatus: "START",
      };
      this.couponLoading = true;
      getShopCouponList(params).then((res) => {
        this.couponLoading = false;
        if (res.success) {
          this.couponList = res.result.records;
        }
      });
    },
    getGiftList(query) {
      const params = {
        pageSize: 20,
        pageNumber: 1,
        id: query === this.form.giftId ? this.form.giftId : null,
        goodsName: query === this.form.giftId ? null : query,
        marketEnable: "UPPER",
        authFlag: "PASS",
      };
      this.giftLoading = true;
      getGoodsSkuListDataSeller(params).then((res) => {
        this.giftLoading = false;
        if (res.success) {
          this.giftList = res.result.records;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
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

:deep(.full-discount-range-picker.el-date-editor--datetimerange) {
  width: 380px;
  max-width: 380px;
  flex-grow: 0;
  --el-date-editor-width: 380px;
}
</style>
