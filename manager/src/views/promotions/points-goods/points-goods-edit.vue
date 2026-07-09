<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>积分商品信息</h4>
          <div class="form-item-view">
            <el-form-item label="商品名称">
              <div>{{ form.goodsSku.goodsName }}</div>
            </el-form-item>
            <el-form-item label="SKU编码">
              <div>{{ form.goodsSku.id }}</div>
            </el-form-item>
            <el-form-item label="店铺名称">
              <div>{{ form.goodsSku.storeName }}</div>
            </el-form-item>
            <el-form-item label="商品价格">
              <div>
                <priceColorScheme :value="form.goodsSku.price" :color="$mainColor" />
              </div>
            </el-form-item>
            <el-form-item label="库存">
              <div>{{ form.goodsSku.quantity }}</div>
            </el-form-item>
            <el-form-item label="结算价格" prop="settlementPrice">
              <el-input
                type="number"
                v-model="form.settlementPrice"
                placeholder="请填写结算价格"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="分类" prop="pointsGoodsCategoryId">
              <el-select
                v-model="form.pointsGoodsCategoryId"
                placeholder="请选择分类"
                style="width: 260px"
                @change="changeCategory"
              >
                <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="活动库存" prop="activeStock">
              <el-input
                type="number"
                v-model="form.activeStock"
                placeholder="请填写活动库存"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="兑换积分" prop="points">
              <el-input
                type="number"
                v-model="form.points"
                placeholder="请填写兑换积分"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动开始时间">
              <el-date-picker
                v-model="form.rangeTime"
                type="datetimerange"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :disabled-date="disabledDate"
                style="width: 360px"
              />
            </el-form-item>
          </div>
          <div class="footer">
            <el-button @click="closeCurrentPage" style="margin-right: 5px">返回</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {
  updatePointsGoods,
  getPointsGoodsById,
  getPointsGoodsCategoryList,
} from "@/api/promotion";

export default {
  name: "editPointsGoods",
  data() {
    return {
      pointsGoodsCategoryId: "",
      pointsGoodsCategoryName: "",
      form: {
        promotionName: "",
        applyEndTime: "",
        startTime: "",
        seckillPeriod: [],
        seckillRule: "",
        goodsSku: {},
        promotionStatus: "NEW",
        rangeTime: [],
      },
      categoryList: [],
      id: this.$route.query.id,
      submitLoading: false,
      formRule: {
        settlementPrice: [{ required: true, message: "请填写结算价格" }],
        pointsGoodsCategoryId: [{ required: true, message: "请选择积分商品分类" }],
        points: [{ required: true, message: "请填写兑换积分" }],
        activeStock: [{ required: true, message: "请填写库存" }],
      },
    };
  },
  async mounted() {
    await this.getCategory();
    if (this.id) {
      this.getData();
    }
  },
  methods: {
    disabledDate(date) {
      return date && date.getTime() < Date.now() - 86400000;
    },
    changeCategory(id) {
      const item = this.categoryList.find((c) => c.id === id);
      this.pointsGoodsCategoryId = id;
      this.pointsGoodsCategoryName = item ? item.name : "";
    },
    closeCurrentPage() {
      this.$store.commit("removeTag", "edit-points-goods");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    getData() {
      getPointsGoodsById(this.id).then((res) => {
        if (res.success) {
          const data = res.result;
          this.form = data;
          data.rangeTime = [];
          if (data.startTime && data.endTime) {
            data.rangeTime = [data.startTime, data.endTime];
          }
          if (data.pointsGoodsCategoryId) {
            this.changeCategory(data.pointsGoodsCategoryId);
          }
        }
      });
    },
    async getCategory() {
      const res = await getPointsGoodsCategoryList();
      this.categoryList = res.result.records;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.rangeTime || this.form.rangeTime.length !== 2) {
            this.$Message.error("请选择活动时间");
            return;
          }
          this.form.startTime = this.form.rangeTime[0];
          this.form.endTime = this.form.rangeTime[1];
          this.submitLoading = true;
          const params = {
            ...this.form,
            pointsGoodsCategoryId: this.pointsGoodsCategoryId || this.form.pointsGoodsCategoryId,
            pointsGoodsCategoryName:
              this.pointsGoodsCategoryName || this.form.pointsGoodsCategoryName,
          };
          updatePointsGoods(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("积分商品修改成功");
              this.closeCurrentPage();
            }
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.el-form {
  padding-bottom: 80px;

  .el-form-item {
    width: 100%;
    color: gray;
    text-align: left;
  }
}

div.base-info-item > div {
  margin-left: 5%;
}

div.base-info-item {
  margin-bottom: 10px;

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

  .form-item-view {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding-left: 80px;
  }
}

.footer {
  width: 100%;
  padding: 10px;
  background-color: #ffc;
  position: fixed;
  bottom: 0;
  right: 0;
  text-align: center;
  z-index: 9999;
}
</style>
