<template>
  <div>
    <Card>
      <Form ref="form" :model="form" :label-width="120">
        <div class="base-info-item">
          <h4>优惠券将在指定发放时间发放到用户账号中</h4>
          <div class="form-item-view">
            <FormItem label="活动名称" prop="promotionName">
              <Input type="text" v-model="form.promotionName" placeholder="活动名称" clearable style="width: 260px" />
            </FormItem>
            <FormItem label="目标客户" prop="vipType">
              <RadioGroup v-model="vipType">
                <Radio :label="0">全平台客户</Radio>
                <Radio :label="1">指定客户</Radio>
              </RadioGroup>
              <Button type="primary" v-if="vipType==1" icon="ios-add" @click="addVip" ghost>添加客户</Button>
            </FormItem>
            <FormItem label="发放时间" prop="couponDiscount">
              <DatePicker type="datetime" v-model="form.rangeTime" format="yyyy-MM-dd HH:mm:ss" placeholder="请选择" :options="options" style="width: 260px">
              </DatePicker>
            </FormItem>
            <FormItem label="选择优惠券" prop="couponType">
              <Button type="primary" icon="ios-add" @click="checkCoupon=!checkCoupon" ghost>选择优惠券</Button>
              <Table class="table" :columns="couponColumns" :data="couponData"></Table>
            </FormItem>
          </div>

          <div style="margin-left:100px">
            <Button type="text" @click="closeCurrentPage">返回</Button>
            <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
          </div>

        </div>
      </Form>
      <Modal width="1200" v-model="checkCoupon">
        <couponList checked @selected="callbackSelectCoupon" />
      </Modal>
      <Modal width="1200" v-model="checkUserList">
        <userList @selected="callbackSelectUser" ref="memberLayout" />
      </Modal>
    </Card>

  </div>
</template>

<script>
import { addCouponActivity } from "@/api/promotion";

import couponList from "./coupon";
import userList from "@/views/member/list/index";
// import userList from ''
export default {
  components: {
    couponList,
    userList,
  },

  data() {
    return {
      // 选择优惠券
      checkCoupon: false,
      // 选择用户
      checkUserList: false,
      // 优惠券表格title
      couponColumns: [
        {
          title: "优惠券名称",
          key: "name",
        },
        {
          title: "有效期",
          key: "age",
        },
        {
          title: "优惠券数量",
          key: "address",
        },
        {
          title: "操作",
          key: "action",
        },
      ],
      // datpicker时间设置
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },

      //
      vipType: 0, //客户会员类型  0全平台客户 1指定客户
      form: {},
      formRule: {},
      id: this.$route.query.id, // 优惠券id

      callbackCoupon: [],
    };
  },
  mounted() {},
  methods: {

    // 添加指定用户
    addVip() {
      this.checkUserList = true;
      this.$nextTick(() => {
        this.$refs.memberLayout.selectedMember = true;
      });
    },
    // 返回已选择的用户
    callbackSelectUser(val){
      console.log(val)
    },

    // 返回已选择的优惠券
    callbackSelectCoupon(val) {
      if (val.___selected) {
        this.callbackCoupon.forEach((item, index) => {
          if (item.id == val.id) this.callbackCoupon.splice(index, 1);
        });
      } else {
        this.callbackCoupon.push(val);
      }
    },
    // 关闭当前页面
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-coupon-specify");
      localStorage.pageOpenedList = JSON.stringify(
        this.$store.state.app.pageOpenedList
      );
      this.$router.go(-1);
    },

    async handleSubmit() {
      let res = await addCouponActivity();
    },
  },
};
</script>

<style lang="scss" scpoed>
.table {
  width: 800px;
  margin: 20px 0;
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
.form-item-view {
  margin: 20px 0;
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
</style>

