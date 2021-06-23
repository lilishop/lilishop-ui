<template>
  <div>
    <div class="content-goods-publish">
      <Form ref="form" :model="form" :label-width="130">
        <div class="base-info-item">
          <h4>优惠券活动详情</h4>
          <div class="form-item-view">
            <FormItem label="活动名称">
              <span>{{ couponActivity.promotionName }}</span>
            </FormItem>
            <FormItem label="活动类型">
              <span v-if="couponActivity.couponActivityType === 'REGISTERED'" >新人发券</span>
              <spin v-else>精确发券</spin>
            </FormItem>
            <FormItem label="活动范围" v-if="couponActivity.couponActivityType === 'SPECIFY'" >
              <span v-if="couponActivity.activityScope === 'ALL'" >全部会员</span>
              <spin v-else>指定会员</spin>
            </FormItem>
            <FormItem label="活动时间">
              <span>{{ couponActivity.startTime }}～{{ couponActivity.endTime }}</span>
            </FormItem>
            <FormItem label="活动状态">

              <span v-if="couponActivity.promotionStatus==='NEW'">新建</span>
              <span v-if="couponActivity.promotionStatus==='START'">已开始</span>
              <span v-if="couponActivity.promotionStatus==='END'">已结束</span>
              <span v-if="couponActivity.promotionStatus==='CLOSE'">已废弃</span>
            </FormItem>
          </div>
          <h4>优惠券列表</h4>
          <Table :columns="couponColumn" :data="couponData" ref="table">
          </Table>
          <h4 v-if="couponActivity.activityScopeInfo && memberData.length>0">会员列表列表</h4>
          <Table :columns="memberColumn" :data="memberData">

          </Table>
        </div>
      </Form>
    </div>

    <div class="footer">
      <Button type="primary" @click="back">返回活动列表</Button>
    </div>
  </div>
</template>

<script>
import {getCouponActivity} from "@/api/promotion";

export default {
  name: "couponActivityInfo",
  data() {
    return {
      id: this.$route.query.id,//表单id
      couponActivity: "",//券活动
      couponColumn: [
        {
          title: "优惠券名称",
          key: 'couponName'
        },
        {
          title: "优惠券金额",
          key: 'price',
          render: (h, params) => {
            let text = "未知";
            if (params.row.couponType === "DISCOUNT") {
              text = params.row.price + "折";
            } else if (params.row.couponType === "PRICE") {
              text = "¥" + params.row.price;
            }
            return h("div", [text]);
          },
        },
        {
          title: "优惠券类型",
          key: 'couponType',
          render: (h, params) => {
            let text = "未知";
            if (params.row.couponType == "DISCOUNT") {
              text = "打折";
            } else if (params.row.couponType == "PRICE") {
              text = "减免现金";
            }
            return h("div", [text]);
          },
        },
        {
          title: "赠送数量",
          key: "num",
        }
      ],
      couponData: [],
      memberColumn: [
        {
          title: "会员id",
          key: "id",
        },
        {
          title: "昵称",
          key: "nickName",
        },
      ],
      memberData: [],
    };
  },
  mounted() {
    this.getCouponActivity();
  },
  methods: {
    //获取优惠券活动
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
@import "couponPublish.scss";
</style>

