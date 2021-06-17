<template>
  <div>
    <Card>
      <Form ref="form" :model="form" :label-width="120" :rules="formRule">
        <div class="base-info-item">
          <h4>活动信息</h4>
          <div class="form-item-view">
            <FormItem label="活动名称" prop="promotionName">
              <Input type="text" v-model="form.promotionName" placeholder="活动名称" clearable style="width: 260px" />
            </FormItem>

            <FormItem label="活动时间">
              <DatePicker type="datetimerange" v-model="rangeTime" format="yyyy-MM-dd HH:mm:ss" placeholder="请选择" :options="options" style="width: 260px">
              </DatePicker>
            </FormItem>

            <FormItem label="优惠券活动类型" prop="couponActivityType">
              <RadioGroup type="button" button-style="solid" v-model="form.couponActivityType">
                <Radio label="REGISTERED">新人发券</Radio>
                <Radio label="SPECIFY">精确发券</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="活动范围" prop="activityScope" v-if="form.couponActivityType==='SPECIFY'">
              <RadioGroup type="button" button-style="solid" v-model="form.activityScope">
                <Radio label="ALL">全部会员</Radio>
                <Radio label="DESIGNATED">指定会员</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="选择会员" prop="scopeType" v-if="form.couponActivityType==='SPECIFY' && form.activityScope==='DESIGNATED'">
              <Button type="primary" icon="ios-add" @click="addVip" ghost>选择会员</Button>
              <div style="margin-top:24px;" v-if="form.activityScope == 'DESIGNATED'">
                <Table border :columns="userColumns" :data="this.selectedMember">
                </Table>
              </div>
            </FormItem>

            <FormItem label="活动描述" prop="activityScopeInfo">
              <Input v-model="form.activityScopeInfo" type="textarea" :rows="4" maxlength="50" show-word-limit clearable style="width: 260px" />
            </FormItem>
          </div>
          <h4>配置优惠券</h4>
          <div class="form-item-view">
            <FormItem label="选择优惠券" prop="scopeType">
              <Button type="primary" :loading="submitLoading" @click="showSelector">选择优惠券</Button>
            </FormItem>
            <FormItem label="赠送配置" prop="scopeType">

              <Table border :columns="columns" :data="this.selectCouponList">
                <template slot="sendNum" slot-scope="scope">
                  <Input type="text" v-model="form.couponActivityItems[scope.index].num" placeholder="赠送数量" />
                  <Input type="text" v-model="form.couponActivityItems[scope.index].couponId" v-show="false" />
                </template>
              </Table>
            </FormItem>

            <div>
              <Button type="text" @click="closeCurrentPage">返回</Button>
              <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
            </div>
          </div>
        </div>
      </Form>
    </Card>
    <Modal @on-ok="()=>{this.showCouponSelect = false}" @on-cancel="()=>{this.showCouponSelect = false}" v-model="showCouponSelect" width="80%">
      <couponTemplate :checked="true" :selectedList="selectCouponList" getType="ACTIVITY" @selected="selectedCoupon" />
    </Modal>

    <Modal width="1200" v-model="checkUserList">
      <userList v-if="checkUserList" @callback="callbackSelectUser" :selectedList="selectedMember" ref="memberLayout" />
    </Modal>
  </div>
</template>

<script>
import couponTemplate from "@/views/promotion/coupon/coupon";

import userList from "@/views/member/list/index";

import { saveActivityCoupon, updateCouponActivity } from "@/api/promotion";

export default {
  name: "addCouponActivity",
  components: {
    couponTemplate,
    userList,
  },
  data() {
    return {
      showCouponSelect: false, //显示优惠券选择框
      modalType: 0, // 是否编辑
      rangeTime: "", //时间区间
      checkUserList: false, //会员选择器
      selectedMember: [], //选择的会员
      form: {
        promotionName: "", //活动名称
        activityScope: "ALL", //活动范围
        couponActivityType: "REGISTERED", //触发活动方式
        activityScopeInfo: "", //活动描述
        startTime: "", //开始时间
        endTime: "", //结束时间
        couponActivityItems: [],
      }, // 表单
      id: this.$route.query.id, // 优惠券活动id
      submitLoading: false, // 添加或编辑提交状态
      selectCouponList: [], //选择的优惠券列表
      formRule: {
        promotionName: [{ required: true, message: "活动名称不能为空" }],
        rangeTime: [{ required: true, message: "请选择活动有效期" }],
        description: [{ required: true, message: "请输入范围描述" }],
      },
      // 用户表格
      userColumns: [
        {
          title: "用户名称",
          key: "nickName",
          minWidth: 120,
        },
        {
          title: "手机号",
          key: "mobile",
          render: (h, params) => {
            return h("div", params.row.mobile || "暂未填写");
          },
        },
        {
          title: "最后登录时间",
          key: "lastLoginDate",
        },
        {
          title: "操作",
          key: "action",
          minWidth: 50,
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "error",
                  ghost: true,
                },
                on: {
                  click: () => {
                    this.delUser(params.index);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      //优惠券表格
      columns: [
        {
          title: "优惠券名称",
          key: "couponName",
          minWidth: 120,
        },
        {
          title: "品类描述",
          key: "scopeType",
          width: 100,
          render: (h, params) => {
            let text = "未知";
            if (params.row.scopeType == "ALL") {
              text = "全品类";
            } else if (params.row.scopeType == "PORTION_GOODS_CATEGORY") {
              text = "商品分类";
            } else if (params.row.scopeType == "PORTION_SHOP_CATEGORY") {
              text = "店铺分类";
            } else if (params.row.scopeType == "PORTION_GOODS") {
              text = "指定商品";
            }
            return h("div", [text]);
          },
        },
        {
          title: "面额/折扣",
          key: "couponName",
          minWidth: 120,
          render: (h, params) => {
            if (params.row.price) {
              return h(
                "div",
                this.$options.filters.unitPrice(params.row.price, "￥")
              );
            } else {
              return h("div", params.row.couponDiscount + "折");
            }
          },
        },

        {
          title: "赠送数量",
          type: "template",
          slot: "sendNum",
          minWidth: 120,
        },
        {
          title: "操作",
          key: "action",
          minWidth: 50,
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "error",
                  ghost: true,
                },
                on: {
                  click: () => {
                    this.delCoupon(params.index);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
    };
  },
  async mounted() {
    // 如果id不为空则查询信息
    if (this.id) {
      this.getCoupon();
      this.modalType = 1;
    }
  },
  methods: {
    // 删除选择的优惠券
    delUser(index) {
      this.selectedMember.splice(index, 1);
    },
    // 删除选择的优惠券
    delCoupon(index) {
      this.selectCouponList.splice(index, 1);
    },

    // 返回已选择的用户
    callbackSelectUser(val) {
      // 每次将返回的数据回调判断
      let findUser = this.selectedMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectedMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectedMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectedMember.splice(index, 1);
          }
        });
      }
    },

    // 添加指定用户
    addVip() {
      this.checkUserList = true;
      this.$nextTick(() => {
        this.$refs.memberLayout.selectedMember = true;
      });
    },
    //显示优惠券选择框
    showSelector() {
      this.showCouponSelect = true;
    },
    /**
     * 返回优惠券*/
    selectedCoupon(val) {
      this.selectCouponList = val;
      //清空原有数据
      this.form.couponActivityItems = [];
      val.forEach((item, index) => {
        this.form.couponActivityItems.push({
          num: 0,
          couponId: item.id,
        });
      });
      console.log(val);
    },

    getCoupon() {
      /**
       * 获取优惠券活动详情
       */
      getPlatformCoupon(this.id).then((res) => {
        let data = res.result;
        if (!data.promotionGoodsList) data.promotionGoodsList = [];
        if (data.scopeType == "PORTION_GOODS_CATEGORY") {
          let prevCascader = data.scopeId.split(",");

          // console.log(prevCascader);
          function next(params, prev) {
            for (let i = 0; i < params.length; i++) {
              const item = params[i];
              console.log(item);
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
        data.rangeTime.push(new Date(data.startTime), new Date(data.endTime));
        this.form = data;
      });
    },
    /** 保存平台优惠券 */
    handleSubmit() {
      this.form.startTime = this.$options.filters.unixToDate(
        this.rangeTime[0] / 1000
      );
      this.form.endTime = this.$options.filters.unixToDate(
        this.rangeTime[1] / 1000
      );

      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form));
          console.log(params);
          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete params.id;
            saveActivityCoupon(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券活动创建成功");
                this.closeCurrentPage();
              }
            });
          } else {
            updateCouponActivity(params).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("优惠券活动修改成功");
                this.closeCurrentPage();
              }
            });
          }
        }
      });
    },
    // 关闭当前页面
    closeCurrentPage() {
      this.$store.commit("removeTag", "add-platform-coupon");
      localStorage.pageOpenedList = JSON.stringify(
        this.$store.state.app.pageOpenedList
      );
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
</style>

