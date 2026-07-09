<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                :disabled="disabled"
                v-model="form.promotionName"
                placeholder="活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="优惠券名称" prop="couponName">
              <el-input
                :disabled="disabled"
                v-model="form.couponName"
                placeholder="优惠券名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="优惠券类型" prop="couponType">
              <el-select :disabled="disabled" v-model="form.couponType" style="width: 260px">
                <el-option label="打折" value="DISCOUNT" />
                <el-option label="减免现金" value="PRICE" />
              </el-select>
            </el-form-item>
            <el-form-item
              label="折扣"
              prop="couponDiscount"
              v-if="form.couponType == 'DISCOUNT'"
            >
              <el-input-number
                :disabled="disabled"
                placeholder="折扣"
                :max="9.9"
                :min="0.1"
                :step="0.1"
                :precision="1"
                v-model="form.couponDiscount"
                style="width: 260px"
              />
              <span class="describe">请输入0-10的数字,可有一位小数</span>
            </el-form-item>
            <el-form-item label="面额" prop="price" v-if="form.couponType == 'PRICE'">
              <el-input
                :disabled="disabled"
                v-model="form.price"
                placeholder="面额"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动类型" prop="getType">
              <el-select :disabled="disabled" v-model="form.getType" style="width: 260px">
                <el-option label="免费领取" value="FREE" />
                <el-option label="活动赠送" value="ACTIVITY" />
              </el-select>
            </el-form-item>

            <el-form-item label="店铺承担比例" prop="storeCommission">
              <div class="form-field-block">
                <el-input
                  :disabled="disabled"
                  v-model="form.storeCommission"
                  placeholder="店铺承担比例"
                  style="width: 260px"
                >
                  <template #append>%</template>
                </el-input>
                <div class="form-tip">店铺承担比例，输入0-100之间数值</div>
              </div>
            </el-form-item>
            <el-form-item label="发放数量" prop="publishNum" v-if="form.getType === 'FREE'">
              <div class="form-field-block">
                <el-input
                  :disabled="disabled"
                  v-model="form.publishNum"
                  placeholder="发放数量"
                  style="width: 260px"
                />
                <div class="form-tip">如果发放数量为0时,则代表不限制发放数量</div>
              </div>
            </el-form-item>
            <el-form-item
              label="领取数量限制"
              prop="couponLimitNum"
              v-if="form.getType === 'FREE'"
            >
              <div class="form-field-block">
                <el-input
                  :disabled="disabled"
                  v-model="form.couponLimitNum"
                  placeholder="领取限制"
                  clearable
                  style="width: 260px"
                />
                <div class="form-tip">如果领取数量为0时,则代表不限制领取数量</div>
              </div>
            </el-form-item>
            <el-form-item label="范围描述" prop="description">
              <el-input
                :disabled="disabled"
                v-model="form.description"
                type="textarea"
                :rows="4"
                maxlength="50"
                show-word-limit
                clearable
                style="width: 260px"
              />
            </el-form-item>
          </div>
          <h4>使用限制</h4>
          <div class="form-item-view">
            <el-form-item label="消费门槛" prop="consumeThreshold">
              <el-input
                :disabled="disabled"
                v-model="form.consumeThreshold"
                placeholder="消费门槛"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="有效期" prop="rangeTime">
              <div v-if="form.getType == 'ACTIVITY'">
                <el-radio-group v-model="rangeTimeType">
                  <el-radio :disabled="disabled" :value="1" v-if="form.getType !== 'ACTIVITY'">起止时间</el-radio>
                  <el-radio :disabled="disabled" :value="0">固定时间</el-radio>
                </el-radio-group>
              </div>
              <div v-if="rangeTimeType == 1">
                <el-date-picker
                  :disabled="disabled"
                  type="datetimerange"
                  v-model="form.rangeTime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  :disabled-date="options.disabledDate"
                  style="width: 260px"
                />
              </div>
              <div class="effectiveDays" v-if="rangeTimeType == 0">
                领取当天开始
                <el-input-number
                  :disabled="disabled"
                  v-model="form.effectiveDays"
                  :min="1"
                  style="width: 100px"
                  :max="365"
                />
                天内有效(1-365间的整数)
              </div>
            </el-form-item>

            <el-form-item label="使用范围" prop="scopeType">
              <el-radio-group v-model="form.scopeType">
                <el-radio-button :disabled="disabled" value="ALL">全品类</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS">指定商品</el-radio-button>
                <el-radio-button :disabled="disabled" value="PORTION_GOODS_CATEGORY">部分商品分类</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="width: 100%" v-if="form.scopeType == 'PORTION_GOODS'">
              <div style="display: flex; margin-bottom: 10px">
                <el-button :disabled="disabled" type="primary" @click="openSkuList">选择商品</el-button>
                <el-button
                  :disabled="disabled"
                  type="danger"
                  plain
                  style="margin-left: 10px"
                  @click="delSelectGoods"
                >批量删除</el-button>
              </div>
              <el-table
                border
                :data="form.promotionGoodsList"
                style="width: 100%"
                @selection-change="changeSelect"
              >
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
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
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <el-button
                      :disabled="disabled"
                      type="danger"
                      size="small"
                      plain
                      @click="delGoods($index)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item v-if="form.scopeType == 'PORTION_GOODS_CATEGORY'">
              <el-cascader
                :disabled="disabled"
                :options="goodsCategoryList"
                style="width: 260px"
                v-model="form.scopeIdGoods"
              />
            </el-form-item>
            <div>
              <el-button :disabled="disabled" link @click="closeCurrentPage">返回</el-button>
              <el-button
                :disabled="disabled"
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
              >提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    <sku-select ref="skuSelect" @selectedGoodsData="selectedGoodsData"></sku-select>
  </div>
</template>

<script>
import { saveShopCoupon, getShopCoupon, editShopCoupon } from "@/api/promotion";
import { getGoodsCategoryAll } from "@/api/goods";
import { regular } from "@/utils";
import skuSelect from "@/views/lili-dialog";

export default {
  name: "add-coupon",
  components: {
    skuSelect,
  },
  watch: {
    "form.getType": {
      handler(val) {
        if (val == "FREE") {
          this.rangeTimeType = 1;
        } else {
          this.rangeTimeType = 0;
        }
        if (this.rangeTimeType == 0) {
          delete this.formRule.rangeTime;
        }
      },
      deep: true,
    },
    $route(e) {
      this.id = e.query.id;
      if (this.id) {
        this.getCoupon();
      } else {
        this.$refs.form.resetFields();
      }
    },
  },
  data() {
    const checkPrice = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error("面额不能为空"));
      } else if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("面额设置超过上限值"));
      } else {
        callback();
      }
    };
    const checkWeight = (rule, value, callback) => {
      if (!value && typeof value !== "number") {
        callback(new Error("消费门槛不能为空"));
      } else if (!regular.money.test(value)) {
        callback(new Error("请输入正整数或者两位小数"));
      } else if (parseFloat(value) > 99999999) {
        callback(new Error("消费门槛设置超过上限值"));
      } else {
        callback();
      }
    };
    return {
      disabled: this.$route.query.onlyView,
      rangeTimeType: 1,
      modalType: 0,
      form: {
        storeCommission: 0,
        publishNum: 0,
        scopeType: "ALL",
        couponLimitNum: 1,
        couponType: "PRICE",
        couponName: "",
        promotionName: "",
        getType: "FREE",
        promotionGoodsList: [],
        scopeIdGoods: [],
        rangeDayType: "",
        effectiveDays: 1,
      },
      id: this.$route.query.id,
      submitLoading: false,
      selectedGoods: [],
      goodsCategoryList: [],
      formRule: {
        promotionName: [{ required: true, message: "活动名称不能为空" }],
        couponName: [{ required: true, message: "优惠券名称不能为空" }],
        price: [{ required: true, message: "请输入面额" }, { validator: checkPrice }],
        rangeTime: [{ required: true, message: "请选择优惠券有效期" }],
        consumeThreshold: [
          { required: true, message: "请输入消费门槛" },
          { validator: checkWeight },
        ],
        couponDiscount: [
          { required: true, message: "请输入折扣" },
          {
            pattern: regular.discount,
            message: "请输入0-10的数字,可有一位小数",
          },
        ],
        storeCommission: [
          { required: true, message: "请输入店铺承担比例" },
          { pattern: regular.rate, message: "请输入0-100的正整数" },
        ],
        publishNum: [
          { required: true, message: "请输入发放数量" },
          { pattern: regular.Integer, message: "请输入正整数" },
        ],
        couponLimitNum: [
          { required: true, message: "领取限制不能为空" },
          { pattern: regular.Integer, message: "请输入正整数" },
        ],
        description: [{ required: true, message: "请输入范围描述" }],
      },
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
    };
  },
  async mounted() {
    await this.getCagetoryList();
    if (this.id) {
      this.getCoupon();
      this.modalType = 1;
    }
  },
  methods: {
    getCoupon() {
      getShopCoupon(this.id).then((res) => {
        let data = res.result;
        if (!data.promotionGoodsList) data.promotionGoodsList = [];
        this.rangeTimeType = data.rangeDayType === "DYNAMICTIME" ? 0 : 1;
        if (data.scopeType == "PORTION_GOODS_CATEGORY") {
          let prevCascader = data.scopeId.split(",");
          function next(params, prev) {
            for (let i = 0; i < params.length; i++) {
              const item = params[i];
              if (item.children) {
                next(item.children, [...prev, item]);
              } else {
                if (prevCascader.includes(item.id)) {
                  prevCascader = prevCascader.map((key) => {
                    if (key === item.id) {
                      let result = prev.map((item) => item.id);
                      return [...result, item.id];
                    } else {
                      return key;
                    }
                  });
                } else {
                  i === params.length - 1 && (prev = []);
                }
              }
            }
          }

          next(this.goodsCategoryList, []);
          data.scopeIdGoods = prevCascader;
        }
        data.rangeTime = [];
        if (data.startTime && data.endTime) {
          data.rangeTime.push(new Date(data.startTime), new Date(data.endTime));
        }
        this.form = data;
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form));
          params.getType != "ACTIVITY" ? delete params.effectiveDays : "";

          if (this.rangeTimeType == 1) {
            params.rangeDayType = "FIXEDTIME";
            const rangeTime = this.form.rangeTime;
            const start = rangeTime[0] instanceof Date ? rangeTime[0] : new Date(rangeTime[0]);
            const end = rangeTime[1] instanceof Date ? rangeTime[1] : new Date(rangeTime[1]);
            params.startTime = this.$filters.unixToDate(start.getTime() / 1000);
            params.endTime = this.$filters.unixToDate(end.getTime() / 1000);
            delete params.effectiveDays;
          } else {
            params.rangeDayType = "DYNAMICTIME";
            delete params.rangeTime;
          }

          let scopeId = [];

          if (
            params.scopeType == "PORTION_GOODS" &&
            (!params.promotionGoodsList || params.promotionGoodsList.length == 0)
          ) {
            this.$Modal.warning({ title: "提示", content: "请选择指定商品" });
            return;
          }

          if (
            params.scopeType == "PORTION_GOODS_CATEGORY" &&
            (!params.scopeIdGoods || params.scopeIdGoods.length == 0)
          ) {
            this.$Modal.warning({ title: "提示", content: "请选择商品分类" });
            return;
          }

          if (params.scopeType == "PORTION_GOODS") {
            params.promotionGoodsList.forEach((item) => {
              scopeId.push(item.skuId);
            });
            params.scopeId = scopeId.toString();
          } else if (params.scopeType == "ALL") {
            delete params.promotionGoodsList;
          } else if (params.scopeType == "PORTION_GOODS_CATEGORY") {
            scopeId = this.filterCategoryId(params.scopeIdGoods, []);
            params.scopeId = scopeId.toString();
            delete params.promotionGoodsList;
          }
          delete params.scopeIdGoods;

          this.submitLoading = true;
          if (this.modalType === 0) {
            delete params.id;

            saveShopCoupon(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券发送成功");
                this.closeCurrentPage();
              }
            });
          } else {
            delete params.consumeLimit;
            delete params.updateTime;

            editShopCoupon(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券修改成功");
                this.closeCurrentPage();
              }
            });
          }
        }
      });
    },
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-coupon");
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

          this.form.promotionGoodsList = this.form.promotionGoodsList.filter((item) => {
            return !ids.includes(item.skuId);
          });
        },
      });
    },
    delGoods(index) {
      this.form.promotionGoodsList.splice(index, 1);
    },
    selectedGoodsData(item) {
      let list = [];
      item.forEach((e) => {
        list.push({
          goodsName: e.goodsName,
          price: e.price,
          originalPrice: e.price,
          quantity: e.quantity,
          storeId: e.storeId,
          storeName: e.storeName,
          skuId: e.id,
          categoryPath: e.categoryPath,
          thumbnail: e.small,
          goodsType: e.goodsType,
          goodsId: e.goodsId,
          originPrice: e.price,
        });
      });
      this.form.promotionGoodsList = list;
    },
    async getCagetoryList() {
      let data = await getGoodsCategoryAll();
      this.goodsCategoryList = data.result;
      this.goodsCategoryList = this.goodsCategoryList.map((item) => {
        if (item.children) {
          item.children = item.children.map((child) => {
            if (child.children) {
              child.children = child.children.map((son) => {
                return {
                  value: son.id,
                  label: son.name,
                };
              });
              return {
                value: child.id,
                label: child.name,
                children: child.children,
              };
            } else {
              return {
                value: child.id,
                label: child.name,
              };
            }
          });
        }
        return { value: item.id, label: item.name, children: item.children };
      });
    },
    filterCategoryId(list, idArr) {
      list.forEach((e) => {
        if (e instanceof Array) {
          this.filterCategoryId(e, idArr);
        } else {
          if (!idArr.includes(e)) idArr.push(e);
        }
      });
      return idArr;
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

.form-field-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-tip {
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  color: #999;
}

.effectiveDays {
  font-size: 12px;
  color: #999;

  > * {
    margin: 0 4px;
  }
}
</style>
