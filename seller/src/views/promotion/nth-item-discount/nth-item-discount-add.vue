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
            class="nth-item-range-picker"
            type="datetimerange"
            format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="第N件" required>
          <el-input-number v-model="form.nthNum" :min="2" />
          <span class="tip">例如 2 表示第 2 件享受优惠</span>
        </el-form-item>
        <el-form-item label="优惠方式" required>
          <el-select v-model="form.discountType" style="width: 200px">
            <el-option label="半价" value="HALF" />
            <el-option label="免单" value="FREE" />
            <el-option label="打折" value="RATE" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.discountType === 'RATE'" label="折扣" required>
          <el-input-number v-model="form.discountValue" :min="0.1" :max="9.9" :precision="1" />
          <span class="tip">如 8 表示 8 折</span>
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.description" type="textarea" style="width: 360px" />
        </el-form-item>
        <el-form-item label="活动商品">
          <el-button type="primary" @click="openGoods">选择商品</el-button>
          <el-table v-if="form.promotionGoodsList.length" :data="form.promotionGoodsList" border class="mt_10">
            <el-table-column prop="goodsName" label="商品" />
            <el-table-column prop="originalPrice" label="原价" width="100" />
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
import { getNthItemDiscountDetail, saveNthItemDiscount, editNthItemDiscount } from "@/api/promotion.js";

export default {
  data() {
    return {
      form: {
        promotionName: "",
        rangeTime: [],
        nthNum: 2,
        discountType: "HALF",
        discountValue: 8,
        description: "",
        scopeType: "PORTION_GOODS",
        promotionGoodsList: [],
      },
    };
  },
  mounted() {
    if (this.$route.query.id) {
      getNthItemDiscountDetail(this.$route.query.id).then((res) => {
        if (res.success) {
          Object.assign(this.form, res.result);
          this.form.rangeTime = [new Date(res.result.startTime), new Date(res.result.endTime)];
        }
      });
    }
  },
  methods: {
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
      const req = payload.id ? editNthItemDiscount(payload) : saveNthItemDiscount(payload);
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

:deep(.nth-item-range-picker.el-date-editor--datetimerange) {
  width: 380px;
  max-width: 380px;
  flex-grow: 0;
  --el-date-editor-width: 380px;
}
</style>
