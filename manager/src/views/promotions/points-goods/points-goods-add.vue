<template>
  <div class="wrapper">
    <el-card>
      <el-form ref="form" :model="form" :rules="formRule" label-width="120px">
        <div class="base-info-item">
          <div class="form-item-view">
            <el-form-item style="width: 100%">
              <div style="display: flex; margin-bottom: 10px">
                <el-button type="primary" @click="openSkuList">选择商品</el-button>
                <el-button
                  type="danger"
                  plain
                  style="margin-left: 10px"
                  @click="delSelectGoods"
                >批量删除</el-button>
              </div>
              <el-table
                border
                v-if="showTable"
                :data="promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
                <el-table-column label="类型" width="100">
                  <template #default="{ row }">
                    <span v-if="row">{{ goodsTypeLabel(row.goodsType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="SKU编码" min-width="120">
                  <template #default="{ row }">
                    <span v-if="row">{{ row.skuId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="storeName" label="店铺名称" min-width="100" show-overflow-tooltip />
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
                <el-table-column label="结算价格" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].settlementPrice"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="分类" min-width="160">
                  <template #default="{ $index }">
                    <el-select
                      v-model="promotionGoodsList[$index].pointsGoodsCategoryId"
                      @change="(val) => changeCategory(val, $index)"
                      style="width: 140px"
                    >
                      <el-option
                        v-for="item in categoryList"
                        :value="item.id"
                        :key="item.id"
                        :label="item.name"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="活动库存" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].activeStock"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="兑换积分" min-width="130">
                  <template #default="{ $index }">
                    <el-input-number
                      :min="0"
                      v-model="promotionGoodsList[$index].points"
                      style="width: 110px"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" size="small" plain @click="delGoods($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item label="活动时间" prop="rangeTime" class="points-goods-time-form-item">
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
import { addPointsGoods, getPointsGoodsCategoryList } from "@/api/promotion";
import skuSelect from "@/components/lili-dialog";
import { isECoupon, goodsTypeLabel } from "@/constants/goodsType";

export default {
  name: "addPoinsGoods",
  components: {
    skuSelect,
  },
  data() {
    return {
      form: {
        rangeTime: null,
        promotionGoodsList: [],
      },
      showTable: true,
      promotionGoodsList: [],
      categoryList: [],
      submitLoading: false,
      selectedGoods: [],
      formRule: {
        rangeTime: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
                callback(new Error("请选择活动时间"));
              } else {
                callback();
              }
            },
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
    await this.getCategory();
  },
  methods: {
    goodsTypeLabel,
    async getCategory() {
      let res = await getPointsGoodsCategoryList();
      this.categoryList = res.result.records;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        let params = this.promotionGoodsList;
        if (!params || params.length === 0) {
          this.$Modal.warning({ title: "提示", content: "请选择指定商品" });
          return;
        }
        for (const row of params) {
          const stock = Number(row.quantity) || 0;
          if (isECoupon(row.goodsType) && Number(row.activeStock) > stock) {
            this.$Message.error(`【${row.goodsName}】活动库存不能超过卡池库存（${stock}）`);
            return;
          }
        }
        this.form.startTime = this.form.rangeTime[0];
        this.form.endTime = this.form.rangeTime[1];
        const start = this.$filters.unixToDate(this.form.startTime / 1000);
        const end = this.$filters.unixToDate(this.form.endTime / 1000);

        this.submitLoading = true;
        params = params.map((j) => {
          j.startTime = start;
          j.endTime = end;
          return j;
        });
        addPointsGoods(params).then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.$Message.success("积分商品创建成功");
            this.closeCurrentPage();
          }
        });
      });
    },
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-points-goods");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
    changeCategory(categoryId, index) {
      const item = this.categoryList.find((c) => c.id === categoryId);
      this.promotionGoodsList[index].pointsGoodsCategoryName = item ? item.name : "";
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
          let ids = [];
          this.selectedGoods.forEach(function (e) {
            ids.push(e.skuId);
          });
          this.promotionGoodsList = this.promotionGoodsList.filter((item) => {
            return !ids.includes(item.skuId);
          });
        },
      });
    },
    delGoods(index) {
      this.promotionGoodsList.splice(index, 1);
    },
    openSkuList() {
      this.$refs.skuSelect.open("goods");
      let data = JSON.parse(JSON.stringify(this.promotionGoodsList));
      data.forEach((e) => {
        e.id = e.skuId;
      });
      this.$refs.skuSelect.goodsData = data;
    },
    selectedGoodsData(item) {
      let list = [];
      item.forEach((e) => {
        const obj = {
          settlementPrice: e.settlementPrice || e.price,
          pointsGoodsCategoryId: e.pointsGoodsCategoryId || 0,
          pointsGoodsCategoryName: e.pointsGoodsCategoryName || "",
          activeStock: e.activeStock || 1,
          points: e.points || 1,
          skuId: e.id,
          goodsId: e.goodsId,
          originalPrice: e.price || 0,
          thumbnail: e.thumbnail || "",
          goodsName: e.goodsName || "",
          quantity: e.quantity || "",
          storeName: e.storeName || "",
          price: e.price || "",
          goodsType: e.goodsType,
        };
        list.push(obj);
      });
      this.promotionGoodsList = list;
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

.wrapper {
  min-height: 800px;
}

.points-goods-time-form-item {
  :deep(.el-date-editor.el-date-editor--datetimerange) {
    width: 420px !important;
    min-width: 420px;
    max-width: 420px;
    flex-shrink: 0;
  }
}
</style>
