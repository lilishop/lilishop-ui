<template>
  <div class="search">
    <Card>
      <Button style="margin-bottom: 10px" @click="back()">返回</Button>
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="75"
        class="search-form mb_10"
      >
        <Form-item label="优惠券名称" prop="couponName">
          <Input
            type="text"
            v-model="searchForm.couponName"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="会员名称" prop="memberName">
          <Input
            type="text"
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="优惠券状态" prop="memberCouponStatus">
          <Select
            v-model="searchForm.memberCouponStatus"
            placeholder="请选择"
            clearable
            style="width: 200px"
          >
            <Option value="NEW">已领取</Option>
            <Option value="USED">已使用</Option>
            <Option value="EXPIRE">已过期</Option>
            <Option value="CLOSED">已作废</Option>
          </Select>
        </Form-item>
        <Form-item label="活动时间">
          <DatePicker
            v-model="selectDate"
            type="daterange"
            clearable
            placeholder="选择起始时间"
            style="width: 200px"
          ></DatePicker>
        </Form-item>
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
          >搜索</Button
        >
      </Form>
      <Table
        v-if="refreshTable"
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
        @on-selection-change="changeSelect"
      >
      </Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
  </div>
</template>
<script>
import { getCouponReceiveList } from "@/api/promotion";
import {
  memberPromotionsStatusRender,
  promotionsScopeTypeRender,
} from "@/utils/promotions";

export default {
  name: "coupon-recevie",
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
        getType: "", // 默认排序方式
        couponId: this.$route.query.couponId, // 优惠券id
      },
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          title: "会员名称",
          key: "memberName",
          fixed: "left",
        },
        {
          title: "优惠券名称",
          key: "couponName",
          minWidth: 100,
          tooltip: true,
        },
        {
          title: "面额/折扣",
          key: "price",
          width: 100,
          render: (h, params) => {
            if (params.row.price) {
              return h("priceColorScheme", {props:{value:params.row.price,color:this.$mainColor}} );
            } else {
              return h("div", params.row.discount + "折");
            }
          },
        },

        {
          title: "使用门槛",
          key: "consumeThreshold",
          width: 130,
        },
        {
          title: "会员优惠券状态",
          width: 130,
          key: "memberCouponStatus",
          render: (h, params) => {
            return memberPromotionsStatusRender(
              h,
              params.row.memberCouponStatus
            );
          },
        },
        {
          title: "优惠券类型",
          key: "couponType",
          width: 120,
          render: (h, params) => {
            if (params.row.couponType === "DISCOUNT") {
              return h("Tag", { props: { color: "orange" } }, "打折");
            } else if (params.row.couponType === "PRICE") {
              return h("Tag", { props: { color: "magenta" } }, "减免现金");
            } else {
              return h("Tag", { props: { color: "purple" } }, "未知");
            }
          },
        },
        {
          title: "品类描述",
          key: "scopeType",
          width: 120,
          render: (h, params) => {
            return promotionsScopeTypeRender(h, params);
          },
        },
        {
          title: "有效时间",
          width: 150,
          render: (h, params) => {
            if (
              params?.row?.getType === "ACTIVITY" &&
              params?.row?.rangeDayType === "DYNAMICTIME"
            ) {
              return h("div", "长期有效");
            } else if (params?.row?.startTime && params?.row?.endTime) {
              return h("div", {
                domProps: {
                  innerHTML:
                    params.row.startTime + "<br/>" + params.row.endTime,
                },
              });
            }
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      refreshTable: true, // 修改选中状态后刷新表格
      selectDate: [], //选中的信息
    };
  },
  props: {
    promotionStatus: {
      type: String,
      default: "",
    },
  },
  watch: {
    $route(e) {
      // 监听路由，参数变化调取接口
      this.searchForm.couponId = e.query.couponId;
      if (this.couponId) {
        this.getDataList();
      } else {
        this.$refs.form.resetFields();
      }
    },
  },
  methods: {
    back() {
      this.$store.commit("removeTag", "coupon-receive");
      this.$router.go(-1);
    },
    check() {
      // 选中的优惠券
      this.$emit("selected", this.selectList);
    },
    // 初始化数据
    init() {
      this.getDataList();
    },
    changePage(v) {
      // 改变页码
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      // 改变页数
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      // 搜索
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    /**
     * 选择优惠券
     */
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
      if (this.getType === "ACTIVITY") this.check();
    },
    getDataList() {
      // 获取数据
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getCouponReceiveList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {

          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
