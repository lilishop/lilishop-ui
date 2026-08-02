<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.promotionName" style="width: 320px" />
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="form.rangeTime"
            class="flash-discount-range-picker"
            type="datetimerange"
            format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="限购数量">
          <el-input-number v-model="form.limitNum" :min="0" /> <span class="tip">0 表示不限</span>
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.description" type="textarea" style="width: 360px" />
        </el-form-item>
        <el-form-item label="活动商品">
          <el-button type="primary" @click="openGoods">选择商品</el-button>
          <el-table
            v-if="form.promotionGoodsList.length"
            :data="form.promotionGoodsList"
            border
            class="mt_10 flash-discount-goods-table"
          >
            <el-table-column prop="goodsName" label="商品" width="180" show-overflow-tooltip />
            <el-table-column prop="originalPrice" label="原价" width="90" align="center" />
            <el-table-column label="活动价" width="150" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.price"
                  :min="promotionPriceMin(row.goodsType)"
                  :precision="2"
                  size="small"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">保存</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <liliDialog ref="liliDialog" @selectedGoodsData="selectedGoods" />
  </div>
</template>

<script>
import { getFlashDiscountDetail, saveFlashDiscount, editFlashDiscount } from "@/api/promotion.js";
import { promotionPriceMin } from "@/constants/goodsType";

export default {
  data() {
    return {
      form: {
        promotionName: "",
        rangeTime: [],
        limitNum: 0,
        description: "",
        scopeType: "PORTION_GOODS",
        promotionGoodsList: [],
      },
    };
  },
  mounted() {
    if (this.$route.query.id) {
      getFlashDiscountDetail(this.$route.query.id).then((res) => {
        if (res.success) {
          Object.assign(this.form, res.result);
          this.form.rangeTime = [new Date(res.result.startTime), new Date(res.result.endTime)];
        }
      });
    }
  },
  methods: {
    promotionPriceMin,
    openGoods() {
      this.$refs.liliDialog.open("goods");
    },
    selectedGoods(list) {
      list.forEach((g) => {
        if (!this.form.promotionGoodsList.find((i) => i.skuId === g.id)) {
          this.form.promotionGoodsList.push({
            skuId: g.id,
            goodsId: g.goodsId,
            goodsName: g.goodsName,
            originalPrice: g.price,
            price: g.price,
            quantity: g.quantity,
            goodsType: g.goodsType,
          });
        }
      });
    },
    submit() {
      const payload = { ...this.form };
      if (payload.rangeTime && payload.rangeTime.length === 2) {
        const start =
          payload.rangeTime[0] instanceof Date
            ? payload.rangeTime[0]
            : new Date(payload.rangeTime[0]);
        const end =
          payload.rangeTime[1] instanceof Date
            ? payload.rangeTime[1]
            : new Date(payload.rangeTime[1]);
        payload.startTime = this.$filters.unixToDate(start.getTime() / 1000);
        payload.endTime = this.$filters.unixToDate(end.getTime() / 1000);
      }
      delete payload.rangeTime;
      const req = payload.id ? editFlashDiscount(payload) : saveFlashDiscount(payload);
      req.then((res) => {
        if (res.success) {
          this.$Message.success("保存成功");
          this.$router.back();
        }
      });
    },
  },
};
</script>

<style scoped>
.tip { margin-left: 8px; color: #999; }
.mt_10 { margin-top: 10px; }

:deep(.flash-discount-range-picker.el-date-editor--datetimerange) {
  width: 380px;
  max-width: 380px;
  flex-grow: 0;
  --el-date-editor-width: 380px;
}

.flash-discount-goods-table {
  width: fit-content;
  max-width: 100%;
}
</style>
