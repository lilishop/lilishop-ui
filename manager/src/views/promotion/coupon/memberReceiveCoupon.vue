<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              ref="table"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="changeSelect"
            >
              <template slot-scope="{ row }" slot="rangeTime">
                <div>{{ row.startTime }} ~ {{ row.endTime }}</div>
              </template>
              <template slot-scope="{ row }" slot="action">
                <Button
                  type="error"
                  ghost
                  size="small"
                  :disabled="row.memberCouponStatus != 'NEW'"
                  @click="remove(row)"
                  >作废</Button
                >
              </template>
            </Table>
          </Row>
          <Row type="flex" justify="end" class="page">
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
      </Col>
    </Row>
  </div>
</template>

<script>
import {
  getMemberReceiveCouponList,
  deleteMemberReceiveCoupon,
} from "@/api/promotion";

export default {
  name: "memberReceiveCoupon",
  components: {},
  data() {
    return {
      loading: true, // 表单加载状态
      modalType: 0, // 添加或编辑标识

      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      id: this.$route.query.id,

      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      columns: [
        // 表头
        {
          title: "优惠券编号",
          key: "couponId",
          minWidth: 120,
        },
        {
          title: "面额",
          key: "price",
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.price, "￥")
            );
          },
        },
        {
          title: "消费门槛",
          key: "consumeThreshold",
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.consumeThreshold, "￥")
            );
          },
        },
        {
          title: "有效期",
          slot: "rangeTime",
          minWidth: 120
        },
        {
          title: "会员名称",
          key: "memberName",
          minWidth: 120
        },
        {
          title: "适用范围",
          key: "couponType",
          minWidth: 50,
          render: (h, params) => {
            let text = "未知";
            if (params.row.scopeType == "ALL") {
              text = "全品类";
            } else if (params.row.scopeType == "PORTION_CATEGORY") {
              text = "部分商品分类";
            } else if (params.row.scopeType == "PORTION_GOODS") {
              text = "指定商品";
            }
            return h("div", [text]);
          },
        },
        {
          title: "会员名称",
          key: "memberName",
        },
        {
          title: "状态",
          key: "memberCouponStatus",
          minWidth: 50,
          render: (h, params) => {
            let text = "未知",
              color = "";
            if (params.row.memberCouponStatus == "NEW") {
              text = "未使用";
              color = "default";
            } else if (params.row.memberCouponStatus == "USED") {
              text = "已使用";
              color = "green";
            } else if (params.row.memberCouponStatus == "EXPIRE") {
              text = "已过期";
              color = "red";
            } else if (params.row.memberCouponStatus == "CLOSED") {
              text = "已作废";
              color = "red";
            }
            return h("div", [
              h(
                "Tag",
                {
                  props: {
                    color: color,
                  },
                },
                text
              ),
            ]);
          },
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          width: 100,
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getDataList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
    },
    /** 查询单个优惠券领取详情 */
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getMemberReceiveCouponList(this.id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    /** 作废优惠券 */
    remove(v) {
      this.$Modal.confirm({
        title: "确认作废",
        content: "您确认要作废此优惠券?",
        loading: true,
        onOk: () => {
          // 删除
          deleteMemberReceiveCoupon(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("作废成功");
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
@import "@/styles/table-common.scss";
</style>
