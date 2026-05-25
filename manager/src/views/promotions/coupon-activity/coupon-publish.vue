<template>
  <div>
    <el-card>
      <el-form ref="form" :model="form" label-width="120px" :rules="formRule">
        <div class="base-info-item">
          <h4>活动信息</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称" prop="promotionName">
              <el-input
                v-model="form.promotionName"
                placeholder="请填写活动名称"
                clearable
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="活动时间">
              <el-date-picker
                type="datetimerange"
                :disabled-date="options.disabledDate"
                v-model="rangeTime"
                format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="请选择活动时间"
                style="width: 260px"
              />
            </el-form-item>

            <el-form-item label="优惠券活动类型" prop="couponActivityType">
              <el-radio-group v-model="form.couponActivityType">
                <el-radio-button value="REGISTERED">新人发券</el-radio-button>
                <el-radio-button value="SPECIFY">精确发券</el-radio-button>
                <el-radio-button value="AUTO_COUPON">自动赠券</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="领取频率"
              v-if="form.couponActivityType === 'AUTO_COUPON'"
            >
              <el-radio-group v-model="form.couponFrequencyEnum">
                <el-radio-button value="DAY">每日一次</el-radio-button>
                <el-radio-button value="WEEK">每周一次</el-radio-button>
                <el-radio-button value="MONTH">每月一次</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="活动范围"
              prop="activityScope"
              v-if="form.couponActivityType === 'SPECIFY'"
            >
              <el-radio-group v-model="form.activityScope">
                <el-radio-button value="ALL">全部会员</el-radio-button>
                <el-radio-button value="DESIGNATED">指定会员</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="选择会员"
              prop="scopeType"
              v-if="
                form.couponActivityType === 'SPECIFY' &&
                form.activityScope === 'DESIGNATED'
              "
            >
              <el-button type="primary" @click="addVip" plain>选择会员</el-button>
              <div style="margin-top: 24px" v-if="form.activityScope == 'DESIGNATED'">
                <el-table border :data="selectedMember" style="width: 100%">
                  <el-table-column prop="nickName" label="用户名称" min-width="120" />
                  <el-table-column label="手机号" min-width="120">
                    <template #default="{ row }">
                      <span v-if="row">{{ row.mobile || "暂未填写" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastLoginDate" label="最后登录时间" min-width="160" />
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <a class="link-text" @click="delUser($index)">删除</a>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
          </div>
          <h4>配置优惠券</h4>
          <div class="form-item-view">
            <el-form-item label="选择优惠券" prop="scopeType">
              <el-button type="primary" :loading="submitLoading" @click="showSelector">选择优惠券</el-button>
            </el-form-item>
            <el-form-item label="赠送配置" prop="scopeType">
              <el-table border :data="selectCouponList" style="width: 100%">
                <el-table-column prop="couponName" label="优惠券名称" min-width="120" show-overflow-tooltip />
                <el-table-column label="品类描述" width="120">
                  <template #default="{ row }">
                    <el-tag v-if="row" :type="scopeTypeTagType(row.scopeType)">
                      {{ scopeTypeText(row.scopeType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="面额/折扣" min-width="120">
                  <template #default="{ row }">
                    <template v-if="row">
                      <span v-if="row.price" :style="{ color: $mainColor }">
                        {{ $filters.unitPrice(row.price, "￥") }}</span>
                      <span v-else>{{ row.couponDiscount }}折</span>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column label="赠送数量" min-width="120">
                  <template #default="{ $index }">
                    <el-input
                      v-model="form.couponActivityItems[$index].num"
                      placeholder="赠送数量"
                    />
                    <el-input
                      v-model="form.couponActivityItems[$index].couponId"
                      v-show="false"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" size="small" plain @click="delCoupon($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <div>
              <el-button link @click="closeCurrentPage">返回</el-button>
              <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>

    <el-dialog v-model="showCouponSelect" width="80%" title="选择优惠券" destroy-on-close>
      <couponTemplate
        :checked="true"
        :selectedList="selectCouponList"
        getType="ACTIVITY"
        promotionStatus="START"
        @selected="selectedCoupon"
      />
    </el-dialog>

    <el-dialog v-model="checkUserList" width="1200px" title="选择会员" destroy-on-close>
      <userList
        v-if="checkUserList"
        @callback="callbackSelectUser"
        :selectedList="selectedMember"
        ref="memberLayout"
      />
    </el-dialog>
  </div>
</template>

<script>
import couponTemplate from "@/views/promotions/coupon/coupon";
import userList from "@/views/member/list/index";
import { saveActivityCoupon } from "@/api/promotion";

export default {
  name: "add-coupon-activity",
  components: {
    couponTemplate,
    userList,
  },
  data() {
    return {
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      showCouponSelect: false,
      rangeTime: "",
      checkUserList: false,
      selectedMember: [],
      form: {
        promotionName: "",
        activityScope: "ALL",
        couponActivityType: "REGISTERED",
        startTime: "",
        endTime: "",
        memberDTOS: [],
        couponActivityItems: [],
        couponFrequencyEnum: "",
      },
      submitLoading: false,
      selectCouponList: [],
      formRule: {
        promotionName: [{ required: true, message: "活动名称不能为空" }],
        rangeTime: [{ required: true, message: "请选择活动有效期" }],
        description: [{ required: true, message: "请输入范围描述" }],
      },
    };
  },
  methods: {
    scopeTypeText(type) {
      const map = {
        ALL: "全品类",
        PORTION_GOODS_CATEGORY: "商品分类",
        PORTION_SHOP_CATEGORY: "店铺分类",
        PORTION_GOODS: "指定商品",
      };
      return map[type] || "未知";
    },
    scopeTypeTagType(type) {
      const map = {
        ALL: "info",
        PORTION_GOODS_CATEGORY: "warning",
        PORTION_SHOP_CATEGORY: "warning",
        PORTION_GOODS: "primary",
      };
      return map[type] || "danger";
    },
    callbackSelectUser(val) {
      let findUser = this.selectedMember.find((item) => {
        return item.id === val.id;
      });
      if (!findUser) {
        this.selectedMember.push(val);
      } else {
        this.selectedMember.map((item, index) => {
          if (item.id === findUser.id) {
            this.selectedMember.splice(index, 1);
          }
        });
      }
      this.reSelectMember();
    },
    delUser(index) {
      this.selectedMember.splice(index, 1);
      this.reSelectMember();
    },
    reSelectMember() {
      this.form.memberDTOS = this.selectedMember.map((item) => {
        return {
          nickName: item.nickName,
          id: item.id,
        };
      });
    },
    selectedCoupon(val) {
      this.selectCouponList = val;
      this.reSelectCoupon();
    },
    delCoupon(index) {
      this.selectCouponList.splice(index, 1);
      this.reSelectCoupon();
    },
    reSelectCoupon() {
      this.form.couponActivityItems = this.selectCouponList.map((item) => {
        return {
          num: 1,
          couponId: item.id,
        };
      });
    },
    addVip() {
      this.checkUserList = true;
      this.$nextTick(() => {
        this.$refs.memberLayout.selectedMember = true;
      });
    },
    showSelector() {
      this.showCouponSelect = true;
    },
    handleSubmit() {
      if (this.form.couponFrequencyEnum !== "") {
        if (this.form.activityScope == "ALL") {
          this.form.startTime = this.$filters.unixToDate(this.rangeTime[0] / 1000);
          this.form.endTime = this.$filters.unixToDate(this.rangeTime[1] / 1000);

          this.$refs.form.validate((valid) => {
            if (valid) {
              const params = JSON.parse(JSON.stringify(this.form));
              this.submitLoading = true;
              delete params.id;
              saveActivityCoupon(params).then((res) => {
                this.submitLoading = false;
                if (res.success) {
                  this.$Message.success("优惠券活动创建成功");
                  this.closeCurrentPage();
                }
              });
            }
          });
        } else {
          this.$Message.info("自动发券只能全用户发送");
          this.form.couponActivityType = "SPECIFY";
          this.form.activityScope = "ALL";
        }
      } else {
        this.form.startTime = this.$filters.unixToDate(this.rangeTime[0] / 1000);
        this.form.endTime = this.$filters.unixToDate(this.rangeTime[1] / 1000);

        this.$refs.form.validate((valid) => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.form));
            this.submitLoading = true;
            delete params.id;
            saveActivityCoupon(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券活动创建成功");
                this.closeCurrentPage();
              }
            });
          }
        });
      }
    },
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-platform-coupon");
      localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scpoed>
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

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
</style>
