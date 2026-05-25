<template>
  <div>
    <div class="content-goods-publish">
      <el-form ref="form" label-width="70px">
        <div class="base-info-item">
          <h4>优惠券活动详情</h4>
          <div class="form-item-view">
            <el-form-item label="活动名称">
              <span>{{ couponActivity.promotionName }}</span>
            </el-form-item>
            <el-form-item label="活动类型">
              <span v-if="couponActivity.couponActivityType === 'REGISTERED'">新人发券</span>
              <span v-else-if="couponActivity.couponActivityType === 'AUTO_COUPON'">自动发券</span>
              <span v-else>精确发券</span>
            </el-form-item>
            <el-form-item
              v-if="couponActivity.couponFrequencyEnum != '' && couponActivity.couponFrequencyEnum != null && couponActivity.couponFrequencyEnum != undefined"
              label="领取频率"
            >
              <span v-if="couponActivity.couponFrequencyEnum === 'DAY'">每日</span>
              <span v-else-if="couponActivity.couponFrequencyEnum === 'WEEK'">每周一次</span>
              <span v-else>每月一次</span>
            </el-form-item>
            <el-form-item
              v-if="couponActivity.couponActivityType === 'SPECIFY' || couponActivity.couponActivityType === 'AUTO_COUPON'"
              label="活动范围"
            >
              <span v-if="couponActivity.activityScope === 'ALL'">全部会员</span>
              <span v-else>指定会员</span>
            </el-form-item>
            <el-form-item label="活动时间">
              <span>{{ couponActivity.startTime }}～{{ couponActivity.endTime }}</span>
            </el-form-item>
            <el-form-item label="活动状态">
              <span v-if="couponActivity.promotionStatus === 'NEW'">未开始</span>
              <span v-if="couponActivity.promotionStatus === 'START'">已开始</span>
              <span v-if="couponActivity.promotionStatus === 'END'">已结束</span>
              <span v-if="couponActivity.promotionStatus === 'CLOSE'">已关闭</span>
            </el-form-item>
          </div>
          <h4>优惠券列表</h4>
          <el-table :data="couponData" style="width: 100%">
            <el-table-column prop="couponName" label="优惠券名称" />
            <el-table-column label="优惠券金额">
              <template #default="{ row }">
                <template v-if="row">
                  <span v-if="row.couponType === 'DISCOUNT'">{{ row.couponDiscount }}折</span>
                  <priceColorScheme v-else-if="row.couponType === 'PRICE'" :value="row.price" :color="$mainColor" />
                  <span v-else>未知</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="优惠券类型">
              <template #default="{ row }">
                <span v-if="row">{{ couponTypeText(row.couponType) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="赠送数量" />
          </el-table>
          <template v-if="couponActivity.activityScopeInfo && memberData.length > 0">
            <h4 class="mt_10">会员列表列表</h4>
            <el-table :data="memberData" style="width: 100%">
              <el-table-column prop="id" label="会员id" />
              <el-table-column prop="nickName" label="昵称" />
            </el-table>
          </template>
        </div>
      </el-form>
    </div>

    <div class="footer">
      <el-button type="primary" @click="back">返回活动列表</el-button>
    </div>
  </div>
</template>

<script>
import { getCouponActivity } from "@/api/promotion";

export default {
  name: "coupon-activity-info",
  data() {
    return {
      id: this.$route.query.id,
      couponActivity: {},
      couponData: [],
      memberData: [],
    };
  },
  mounted() {
    this.getCouponActivity();
  },
  methods: {
    couponTypeText(v) {
      if (v === "DISCOUNT") return "打折";
      if (v === "PRICE") return "减免现金";
      return "未知";
    },
    getCouponActivity() {
      getCouponActivity(this.id).then((res) => {
        this.couponActivity = res.result;
        this.couponData = this.couponActivity.couponActivityItems;
        this.memberData = JSON.parse(this.couponActivity.activityScopeInfo);
      });
    },
    back() {
      this.$store.commit("removeTag", "coupon-activity");
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-goods-publish {
  padding: 15px;
  margin: 0 auto;
  text-align: center;
  border: 1px solid #ddd;
  background: none repeat 0 0 #fff;
  height: 100%;
  margin-bottom: 20px;
}

div.base-info-item {
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
    padding-left: 40px;
  }
}
.footer {
  width: 88.7%;
  padding: 10px;
  background-color: #ffc;
  position: fixed;
  bottom: 0px;
  left: 10%;
  text-align: center;
  z-index: 9999;
}
</style>
