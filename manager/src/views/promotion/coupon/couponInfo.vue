<template>
  <div>
    <div class="content-goods-publish">
      <Form ref="form" :model="form" :label-width="130">
        <div class="base-info-item">
          <h4>平台券活动详情</h4>
          <div class="form-item-view">
            <FormItem label="活动名称">
              <span class="goods-category-name">{{ form.promotionName }}</span>
            </FormItem>
            <FormItem label="活动类型">
              <span class="goods-category-name">{{
                getCouponType(form.couponType)
              }}</span>
            </FormItem>
            <FormItem label="面额">
              <span class="goods-category-name"> ￥{{ form.price | unitPrice }}</span>
            </FormItem>
            <FormItem label="活动说明">
              <span class="goods-category-name">{{ form.description }}</span>
            </FormItem>
            <FormItem label="发放总数">
              <span class="goods-category-name">{{ form.publishNum }}</span>
            </FormItem>
            <FormItem label="领取限制">
              <span class="goods-category-name">{{ form.limitNum }}</span>
            </FormItem>
            <FormItem label="活动开始时间">
              <span class="goods-category-name">{{ form.startTime }}</span>
            </FormItem>
            <FormItem label="消费限额">
              <span class="goods-category-name">{{
                form.consumptionLimit
              }}</span>
            </FormItem>
            <FormItem label="使用有效期">
              <span class="goods-category-name">{{ form.startTime }} 至 {{ form.endTime }}</span>
            </FormItem>
            <FormItem label="适用品类范围">
              <span class="goods-category-name">{{
                getScopeType(form.scopeType)
              }}</span>
            </FormItem>
            <FormItem label="品类范围描述">
              <span class="goods-category-name">{{ form.couponName }}</span>
            </FormItem>
            <FormItem label="状态">
              <span class="goods-category-name">{{
                getStatus(form.status)
              }}</span>
            </FormItem>
            <FormItem label="优惠券类型">
              <span class="goods-category-name">{{
                getType(form.getType)
              }}</span>
            </FormItem>
            <FormItem label="活动创建时间">
              <span class="goods-category-name">{{ form.createTime }}</span>
            </FormItem>
            <FormItem label="活动最后更新时间">
              <span class="goods-category-name">{{ form.updateTime }}</span>
            </FormItem>
            <FormItem label="更新管理员名称">
              <span class="goods-category-name">{{ form.updateBy }}</span>
            </FormItem>
            <FormItem label="已发放数量">
              <span class="goods-category-name">{{ form.receivedNum }}</span>
            </FormItem>
            <FormItem label="已使用数量">
              <span class="goods-category-name">{{ form.usedNum }}</span>
            </FormItem>
          </div>
          <h4>适用品类范围</h4>
          <div>
            <Table :loading="loading" border :columns="columns1" :data="data1" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
            <Row type="flex" justify="end" class="page">
              <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
                size="small" show-total show-elevator show-sizer></Page>
            </Row>
          </div>
        </div>
      </Form>
    </div>

    <div class="footer">
      <Button type="primary" @click="back">返回活动列表</Button>
    </div>
  </div>
</template>

<script>
import { getPlatformCoupon } from "@/api/promotion";

import uploadPicThumb from "@/views/my-components/lili/upload-pic-thumb";
import editor from "@/views/my-components/lili/editor";

export default {
  name: "addCoupon",
  components: {
    uploadPicThumb,
    editor,
  },
  data() {
    return {
      modalType: 0, // 当前类型
      loading: false, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      form: {
        /** 店铺承担比例 */
        sellerCommission: 0,
        /** 发行数量 */
        publishNum: 1,
        /** 运费承担者 */
        scopeType: "ALL",
        /** 消费限额 */
        consumptionLimit: "",
        /** 限领数量 */
        limitNum: 1,
        /** 活动类型 */
        couponType: "",
        /** 优惠券名称 */
        couponName: "",
        /** 已被使用数量 */
        usedNum: 0,
        /** 已被领取的数量 */
        receivedNum: 0,
      },
      id: this.$route.query.id,
      columns1: [
        {
          title: "一级类目",
          key: "name",
        },
        {
          title: "二级类目",
          key: "age",
        },
        {
          title: "三级类目",
          key: "address",
        },
      ],
      data1: [
        {
          name: "王小明",
          age: 18,
          address: "北京市朝阳区芍药居",
        },
        {
          name: "张小刚",
          age: 25,
          address: "北京市海淀区西二旗",
        },
        {
          name: "李小红",
          age: 30,
          address: "上海市浦东新区世纪大道",
        },
        {
          name: "周小伟",
          age: 26,
          address: "深圳市南山区深南大道",
        },
      ],
      submitLoading: false, // 添加或编辑提交状态
    };
  },
  mounted() {
    // 如果id不为空则查询信息
    if (this.id) {
      this.getCoupon();
      this.modalType = 1;
    }
  },
  methods: {
    getCouponType(value) {
      switch (value) {
        case "POINT":
          return "打折";
        case "PRICE":
          return "减免现金";
      }
    },
    /** 获取状态 */
    getStatus(value) {
      switch (value) {
        case "NEW":
          return "新建";
        case "START":
          return "开始";
        case "LOWER":
          return "结束";
        case "CANCEL":
          return "作废";
      }
    },
    /** 关联范围类型 */
    getScopeType(value) {
      switch (value) {
        case "PORTION_CATEGORY":
          return "部分商品分类";
        case "PORTION_GOODS":
          return "指定商品";
        case "ALL":
          return "全品类";
      }
    },
    /** 优惠券类型 */
    getType(value) {
      switch (value) {
        case "FREE":
          return "免费获取";
        case "ACTIVITY":
          return "活动获取";
      }
    },

    getCoupon() {
      getPlatformCoupon(this.id).then((res) => {
        this.form = res.result;
      });
    },
    back() {
      this.$store.commit("removeTag", "platform-coupon-info");
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "couponPublish.scss";
</style>

