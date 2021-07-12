<template>
  <div class="search">
    <Card>
      <Row>
        <Form ref="searchForm" :model="searchForm" inline :label-width="100" class="search-form">
          <Form-item label="优惠券名称">
            <Input type="text" v-model="searchForm.couponName" placeholder="请输入优惠券名称" clearable style="width: 200px" />
          </Form-item>
          <Form-item label="活动状态" prop="promotionStatus">
            <Select v-model="searchForm.promotionStatus" placeholder="请选择" clearable style="width: 200px">
              <Option value="NEW">未开始</Option>
              <Option value="START">已开始/上架</Option>
              <Option value="END">已结束/下架</Option>
              <Option value="CLOSE">紧急关闭/作废</Option>
            </Select>
          </Form-item>
          <Form-item label="活动时间">
            <DatePicker v-model="selectDate" type="daterange" clearable placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" class="search-btn" icon="ios-search">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <Row class="operator padding-row">
        <Button @click="add" type="primary">添加</Button>
        <Button @click="delAll" class="ml_10">批量下架</Button>
        <!-- <Button @click="upAll">批量上架</Button> -->
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect">
        <template slot-scope="{ row }" slot="action">
          <Button v-if="row.promotionStatus === 'NEW' || row.promotionStatus === 'CLOSE'" type="info" size="small" style="margin-right: 10px" @click="edit(row)">编辑</Button>
          <Button v-if="row.promotionStatus !== 'CLOSE'" type="error" size="small" @click="remove(row)">下架</Button>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber + 1" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
          size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import { getShopCouponList, updateCouponStatus } from "@/api/promotion";

export default {
  name: "coupon",
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 0, // 当前页数
        pageSize: 10, // 页面大小
        sort: "startTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      form: {
        // 添加或编辑表单对象初始化数据
        promotionName: "",
      },
      // 表单验证规则
      formValidate: {
        promotionName: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left",
        },
        {
          title: "活动名称",
          key: "promotionName",
          fixed: "left",
        },
        {
          title: "优惠券名称",
          key: "couponName",
          tooltip: true,
        },
        {
          title: "面额/折扣",
          key: "price",
          width: 100,
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
          title: "领取数量/总数量",
          key: "publishNum",
          render: (h, params) => {
            return h(
              "div",
              params.row.receivedNum + "/" + (params.row.publishNum === 0 ? '不限制' : params.row.publishNum)
            );
          },
        },
        {
          title: "优惠券类型",
          key: "couponType",
          render: (h, params) => {
            let text = "未知";
            if (params.row.couponType === "DISCOUNT") {
              text = "打折";
            } else if (params.row.couponType === "PRICE") {
              text = "减免现金";
            }
            return h("div", [text]);
          },
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
          title: "活动时间",

          render: (h, params) => {
            if (params.row.getType === "ACTIVITY") {
              return h("div", "长期有效");
            } else {
              return h("div", {
                domProps: {
                  innerHTML:
                    params.row.startTime + "<br/>" + params.row.endTime,
                },
              });
            }
          },
        },
        {
          title: "状态",
          width: 100,
          key: "promotionStatus",
          fixed: "right",
          render: (h, params) => {
            let text = "未知",
              color = "red";
            if (params.row.promotionStatus == "NEW") {
              text = "未开始";
              color = "default";
            } else if (params.row.promotionStatus == "START") {
              text = "已开始";
              color = "green";
            } else if (params.row.promotionStatus == "END") {
              text = "已结束";
              color = "red";
            } else if (params.row.promotionStatus == "CLOSE") {
              text = "已关闭";
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
          }
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          maxWidth: 140,
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
    add() {
      this.$router.push({ name: "add-coupon" });
    },
    /** 跳转至领取详情页面 */
    receiveInfo(v) {
      this.$router.push({ name: "member-receive-coupon", query: { id: v.id } });
    },
    info(v) {
      this.$router.push({ name: "platform-coupon-info", query: { id: v.id } });
    },
    changePage(v) {
      this.searchForm.pageNumber = v - 1;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 0;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {};
      this.selectDate = "";
      this.searchForm.pageNumber = 0;
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
      this.selectCount = e.length;
    },
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getShopCouponList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },

    edit(v) {
      this.$router.push({ name: "add-coupon", query: { id: v.id } });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认下架",
        // 记得确认修改此处
        content: "确认要下架此优惠券么?",
        loading: true,
        onOk: () => {
          this.loading = false;
          let params = {
            couponIds: v.id,
            promotionStatus: "CLOSE",
          };
          // 批量删除
          updateCouponStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    upAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("请选择要上架的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认上架",
        content: "您确认要上架所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });
          let params = {
            couponIds: ids.toString(),
            promotionStatus: "START",
          };
          // 批量上架
          updateCouponStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("上架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要作废的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认作废",
        content: "您确认要作废所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = [];
          this.selectList.forEach(function (e) {
            ids.push(e.id);
          });

          let params = {
            couponIds: ids.toString(),
            promotionStatus: "CLOSE",
          };
          // 批量删除
          updateCouponStatus(params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        },
      });
    },
  },
  activated() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.search-form {
  width: 100% !important;
}
</style>
