<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                disabled
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动时间" prop="rangeTime">
              <el-date-picker
                type="datetimerange"
                v-model="form.rangeTime"
                disabled
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择"
                :disabled-date="options.disabledDate"
                style="width: 320px"
              />
            </el-form-item>
            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="form.description"
                disabled
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
                disabled
                placeholder="优惠门槛"
                clearable
                style="width: 260px"
              />
              <span class="describe">消费达到当前金额可以参与优惠</span>
            </el-form-item>
            <el-form-item label="赠送优惠券">
              <el-radio-group v-model="form.discountType">
                <el-radio-button value="fullMinusFlag" disabled>减现金</el-radio-button>
                <el-radio-button value="fullRateFlag" disabled>打折</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="form.discountType == 'fullMinusFlag'"
              label="优惠金额"
              prop="fullMinus"
            >
              <el-input
                disabled
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
                placeholder="优惠折扣"
                :max="9.9"
                :min="0.1"
                :step="0.1"
                :precision="1"
                v-model="form.fullRate"
                style="width: 260px"
              />
              <span class="describe">优惠折扣为0-10之间数字，可有一位小数</span>
            </el-form-item>
            <el-form-item label="额外赠送">
              <el-checkbox v-model="form.freeFreightFlag" disabled>免邮费</el-checkbox>
              <el-checkbox v-model="form.couponFlag" disabled>送优惠券</el-checkbox>
              <el-checkbox v-model="form.giftFlag" disabled>送赠品</el-checkbox>
              <el-checkbox v-model="form.pointFlag" disabled>送积分</el-checkbox>
            </el-form-item>
            <el-form-item v-if="form.couponFlag" label="赠送优惠券" prop="couponId">
              <el-select
                v-model="form.couponId"
                :disabled="form.promotionStatus != 'NEW'"
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
              <el-select
                v-model="form.giftId"
                filterable
                remote
                :remote-method="getGiftList"
                placeholder="输入赠品名称搜索"
                disabled
                :loading="giftLoading"
                style="width: 260px"
              >
                <el-option
                  v-for="item in giftList"
                  :value="item.id"
                  :key="item.id"
                  :label="item.goodsName"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.pointFlag" label="赠积分" prop="point">
              <el-input
                v-model="form.point"
                type="number"
                disabled
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType">
                <el-radio-button value="ALL" disabled>全品类</el-radio-button>
                <el-radio-button value="PORTION_GOODS" disabled>指定商品</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              style="width: 100%"
              v-if="form.scopeType == 'PORTION_GOODS'"
            >
              <el-table border :data="form.promotionGoodsList" style="width: 100%">
                <el-table-column type="selection" width="60" align="center" />
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
              </el-table>
            </el-form-item>

            <div>
              <el-button @click="$router.push({ name: 'promotions/full-discount' })">返回</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getPlatformCouponList, getFullDiscountById } from "@/api/promotion";
import { getGoodsSkuData } from "@/api/goods";
import vueQr from "vue-qr";
export default {
  name: "add-full-discount",
  components: {
    "vue-qr": vueQr,
  },
  data() {
    return {
      form: {
        discountType: "fullMinusFlag",
        scopeType: "ALL",
        promotionGoodsList: [],
      },
      id: this.$route.query.id,
      couponList: [],
      giftList: [],
      giftLoading: false,
      couponLoading: false,
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  async mounted() {
    if (this.id) {
      this.getDetail();
    }
    this.getCouponList();
    this.getGiftList();
  },
  methods: {
    getDetail() {
      getFullDiscountById(this.id).then((res) => {
        let data = res.result;
        if (!data.scopeType === "ALL") {
          data.promotionGoodsList = [];
        }
        if (data.fullMinusFlag) {
          data.discountType = "fullMinusFlag";
          delete data.fullMinusFlag;
        } else {
          data.discountType = "fullMinusFlag";
          delete data.fullRateFlag;
        }
        data.rangeTime = [];
        data.rangeTime.push(new Date(data.startTime), new Date(data.endTime));

        this.form = data;
      });
    },
    getCouponList(query) {
      let params = {
        pageSize: 20,
        pageNumber: 1,
        getType: "ACTIVITY",
        storeId: "",
        couponName: query,
        promotionStatus: "START",
      };
      this.couponLoading = true;
      getPlatformCouponList(params).then((res) => {
        this.couponLoading = false;
        if (res.success) {
          this.couponList = res.result.records;
        }
      });
    },
    getGiftList(query) {
      let params = {
        pageSize: 20,
        pageNumber: 1,
        id: query === this.form.giftId ? this.form.giftId : null,
        goodsName: query === this.form.giftId ? null : query,
        marketEnable: "UPPER",
        authFlag: "PASS"
      };
      this.giftLoading = true;
      getGoodsSkuData(params).then((res) => {
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
</style>
