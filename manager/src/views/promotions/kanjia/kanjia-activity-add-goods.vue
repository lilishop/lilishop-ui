<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <div class="form-item-view">
            <h4>商品信息</h4>

            <el-form-item label="选择商品" prop="promotionGoodsList">
              <el-button type="primary" @click="openSkuList">选择商品</el-button>
            </el-form-item>

            <el-form-item style="width: 100%">
              <el-table
                border
                class="kanjia-goods-table"
                :data="form.promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column prop="goodsName" label="商品名称" min-width="100" show-overflow-tooltip />
                <el-table-column label="商品价格" width="150">
                  <template #default="{ row }">
                    <span v-if="row" :style="{ color: $mainColor }">
                      {{ $filters.unitPrice(row.price, "￥") }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="120">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="结算价格" width="160">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="form.promotionGoodsList[$index].settlementPrice"
                      controls-position="right"
                      class="kanjia-goods-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="最低砍" width="160">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="form.promotionGoodsList[$index].lowestPrice"
                      controls-position="right"
                      class="kanjia-goods-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="最高砍" width="160">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="form.promotionGoodsList[$index].highestPrice"
                      controls-position="right"
                      class="kanjia-goods-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="活动库存" width="160">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="form.promotionGoodsList[$index].stock"
                      controls-position="right"
                      class="kanjia-goods-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" size="small" plain @click="delGoods($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="活动时间" prop="rangeTime" class="kanjia-activity-time-form-item">
              <el-date-picker
                type="datetimerange"
                v-model="form.rangeTime"
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择"
                :disabled-date="options.disabledDate"
              />
            </el-form-item>
            <div>
              <el-button link @click="closeCurrentPage">返回</el-button>
              <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    <sku-select ref="skuSelect" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script>
import { saveKanJiaActivityGoods } from "@/api/promotion";
import { regular } from "@/utils";
import skuSelect from "@/components/lili-dialog";
import { isECoupon } from "@/constants/goodsType";

export default {
  name: "add-kanjia-activity-goods",
  components: {
    skuSelect,
  },
  data() {
    return {
      modalType: 0,
      form: {
        promotionGoodsList: [],
        rangeTime: [],
      },
      id: this.$route.query.id,
      submitLoading: false,
      selectedGoods: [],
      promotionGoodsList: [],
      formRule: {
        promotionGoodsList: [
          {
            type: "array",
            required: true,
            min: 1,
            message: "请至少选择一个商品",
            trigger: "change",
          },
        ],
        rangeTime: [
          {
            type: "array",
            required: true,
            message: "请选择活动时间",
            trigger: "change",
          },
        ],
      },
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  async mounted() {
    if (this.id) {
      this.getCoupon();
      this.modalType = 1;
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return;
        }
        if (!this.form.promotionGoodsList.length) {
          this.$Message.warning("请至少选择一个商品");
          return;
        }

        const params = JSON.parse(JSON.stringify(this.form));
        const [start, end] = this.form.rangeTime || [];
        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        params.startTime = this.$filters.unixToDate(startDate.getTime() / 1000);
        params.endTime = this.$filters.unixToDate(endDate.getTime() / 1000);
        delete params.rangeTime;

        let checkResult = true;
        this.form.promotionGoodsList.forEach((res) => {
          const eCoupon = isECoupon(res.goodsType);
          if (res.stock <= 0 || res.stock > res.quantity) {
            checkResult = false;
            this.$Message.error("活动库存不能为0且不能超过商品库存");
            return;
          }

          if (!regular.money.test(res.settlementPrice)) {
            checkResult = false;
            this.$Message.error("结算价格金额格式不正确");
            return;
          }
          if (
            (eCoupon ? res.settlementPrice < 0 : res.settlementPrice <= 0) ||
            res.settlementPrice > res.price
          ) {
            checkResult = false;
            this.$Message.error(
              eCoupon
                ? "结算价格不能小于0且不能超过商品价格"
                : "结算价格金额不能为0且不能超过商品价格"
            );
            return;
          }
          if (!regular.money.test(res.highestPrice)) {
            checkResult = false;
            this.$Message.error("最高可砍金额格式错误");
            return;
          }
          if (res.highestPrice <= 0 || res.highestPrice > res.price) {
            checkResult = false;
            this.$Message.error("最高可砍金额不能为0且不能超过商品价格");
            return;
          }
          if (!regular.money.test(res.lowestPrice)) {
            checkResult = false;
            this.$Message.error("最低可砍金额格式错误");
            return;
          }
          if (res.lowestPrice < 0 || (!eCoupon && res.lowestPrice <= 0) || res.lowestPrice > res.price) {
            checkResult = false;
            this.$Message.error(eCoupon ? "最低可砍金额不能小于0" : "最低可砍金额不能为0");
            return;
          }
          if (parseInt(res.lowestPrice) > parseInt(res.highestPrice)) {
            checkResult = false;
            this.$Message.error("最低砍价金额不能大于最高砍价金额");
            return;
          }
        });

        if (!checkResult) {
          return;
        }
        this.submitLoading = true;
        saveKanJiaActivityGoods(params).then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.$Message.success(
              this.modalType === 1 ? "砍价活动修改成功" : "砍价活动添加成功"
            );
            this.closeCurrentPage();
          }
        });
      });
    },
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-kan-jia-goods");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    openSkuList() {
      this.$refs.skuSelect.open("goods");
      let data = JSON.parse(JSON.stringify(this.form.promotionGoodsList));
      data.forEach((e) => {
        e.id = e.skuId;
      });
      this.$refs.skuSelect.goodsData = data;
    },
    changeSelect(e) {
      this.selectedGoods = e;
    },
    delGoods(index) {
      this.form.promotionGoodsList.splice(index, 1);
      this.touchPromotionGoodsValidate();
    },
    touchPromotionGoodsValidate() {
      this.$nextTick(() => {
        const form = this.$refs.form;
        if (form && typeof form.validateField === "function") {
          form.validateField("promotionGoodsList", () => {});
        }
      });
    },
    selectedGoodsData(item) {
      let list = [];
      item.forEach((e) => {
        list.push({
          settlementPrice: e.settlementPrice || 0,
          purchasePrice: 0,
          lowestPrice: e.lowestPrice || 0,
          highestPrice: e.highestPrice || 0,
          stock: e.stock || 0,
          goodsName: e.goodsName,
          price: e.price,
          originalPrice: e.price,
          quantity: e.quantity,
          storeId: e.storeId,
          storeName: e.storeName,
          skuId: e.id,
          goodsType: e.goodsType,
        });
      });
      this.form.promotionGoodsList = list;
      this.touchPromotionGoodsValidate();
    },
  },
};
</script>

<style lang="scss" scoped>
.kanjia-goods-table {
  :deep(.el-table__body .el-table__cell .cell) {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }
}

.kanjia-goods-input {
  width: 100%;
}

.kanjia-activity-time-form-item {
  :deep(.el-date-editor) {
    width: 360px !important;
    max-width: 360px;
    flex-grow: 0;
  }
}

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

.effectiveDays {
  font-size: 12px;
  color: #999;

  > * {
    margin: 0 4px;
  }
}

.tips {
  font-size: 12px;
  color: #999;
}
</style>
