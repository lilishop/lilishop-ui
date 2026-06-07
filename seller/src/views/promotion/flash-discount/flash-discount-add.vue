<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.promotionName" style="width: 320px" />
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-date-picker v-model="form.rangeTime" type="datetimerange" style="width: 360px" />
        </el-form-item>
        <el-form-item label="限购数量">
          <el-input-number v-model="form.limitNum" :min="0" /> <span class="tip">0 表示不限</span>
        </el-form-item>
        <el-form-item label="活动说明">
          <el-input v-model="form.description" type="textarea" style="width: 360px" />
        </el-form-item>
        <el-form-item label="活动商品">
          <el-button type="primary" @click="openGoods">选择商品</el-button>
          <el-table v-if="form.promotionGoodsList.length" :data="form.promotionGoodsList" border class="mt_10">
            <el-table-column prop="goodsName" label="商品" />
            <el-table-column prop="originalPrice" label="原价" width="100" />
            <el-table-column label="活动价" width="140">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0.01" :precision="2" />
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
        payload.startTime = payload.rangeTime[0];
        payload.endTime = payload.rangeTime[1];
      }
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
</style>
