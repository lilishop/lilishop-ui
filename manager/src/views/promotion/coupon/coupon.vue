<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form mb_10">
        <Form-item label="活动名称" prop="couponName">
          <Input type="text" v-model="searchForm.couponName" placeholder="请输入活动名称" clearable style="width: 200px" />
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
        <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
      </Form>
      <Row class="operation padding-row" v-if="getType !== 'ACTIVITY'">
        <Button @click="add" type="primary">添加优惠券</Button>
        <Button @click="delAll">批量下架</Button>
      </Row>
      <Table v-if="refreshTable" :loading="loading" border :columns="columns" :data="data" ref="table" @on-selection-change="changeSelect">
        <template slot-scope="{ row }" slot="action">
          <Button v-if="row.promotionStatus === 'NEW' || row.promotionStatus === 'CLOSE'" type="success" :class="{'mr_10' : row.promotionStatus === 'START' || row.promotionStatus === 'NEW'}" size="small" @click="edit(row)">编辑
          </Button>
          <Button v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'" type="error" size="small" @click="remove(row)">下架
          </Button>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small"
          show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import {
  getPlatformCouponList,
  updatePlatformCouponStatus,
} from "@/api/promotion";

export default {
  name: "coupon",
  components: {},

  data() {
    return {
      loading: true, // 表单加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "startTime", // 默认排序字段
        order: "desc", // 默认排序方式
        getType: "", // 默认排序方式
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
          minWidth: 100,
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
          width: 130,
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
          width: 120,
          render: (h, params) => {
            let text = "";
            if (params.row.couponType === "DISCOUNT") {
              return h("Tag", {props: {color: "blue",},}, "打折");
            } else if (params.row.couponType === "PRICE") {
              return h("Tag", {props: {color: "geekblue",},}, "减免现金");
            }else {
              return h("Tag", {props: {color: "purple",},}, "未知");
            }
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
          width: 150,
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
              color = "geekblue";
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
          },
          minWidth: 70,
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          width: 130,
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      refreshTable: true, // 修改选中状态后刷新表格
    };
  },
  props: {
    //优惠券类型 查询参数
    getType: {
      type: String,
      default: "",
    },
    //已选择优惠券
    selectedList: {
      type: Array,
      default: [],
    },
  },
  watch: {
    $route(to, from) {
      if (to.fullPath == "/promotion/manager-coupon") {
        this.init();
      }
    },
    // 选中优惠券 父级传值
    selectedList: {
      handler(val) {
        // 判断是否是父级回调给自己已选择优惠券
        if (val.length) {
          this.selectList = val;
          this.data.forEach((item) => {
            item._checked = false;
            if (this.selectList.length) {
              this.selectList.forEach((child) => {
                if (item.id == child.id) {
                  item._checked = true;
                }
              });
            }
          });
        } else {
          this.data.forEach((item) => {
            item._checked = false;
          });
        }
        this.refreshTable = false;
        this.$nextTick(() =>{
          this.refreshTable = true;
        })
      },
      deep: true,
    },
  },
  methods: {
    check() { // 选中的优惠券
      this.$emit("selected", this.selectList);
    },
    init() {
      this.getDataList();
    },
    add() { // 跳转添加页面
      this.$router.push({ name: "add-platform-coupon" });
    },
    info(v) { // 查看优惠券
      this.$router.push({ name: "platform-coupon-info", query: { id: v.id } });
    },
    changePage(v) { // 改变页码
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) { // 改变页数
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() { // 搜索
      this.searchForm.pageNumber = 0;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    clearSelectAll() { // 清除选中状态
      this.$refs.table.selectAll(false);
    },
    /**
     * 选择优惠券
     */
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
      if (this.getType === 'ACTIVITY') this.check()
    },
    getDataList() { // 获取数据
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getPlatformCouponList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    
    edit(v) {  // 跳转编辑页面
      this.$router.push({ name: "edit-platform-coupon", query: { id: v.id } });
    },
    remove(v) { // 下架优惠券
      this.$Modal.confirm({
        title: "确认下架",
        // 记得确认修改此处
        content: "确认要下架此优惠券么?",
        loading: true,
        onOk: () => {
          // 删除
          updatePlatformCouponStatus({
            couponIds: v.id,
            promotionStatus: "CLOSE",
          })
            .then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("优惠券已作废");
                this.getDataList();
              }
            })
            .catch(() => {
              this.$Modal;
            });
        },
      });
    },
    delAll() { // 批量下架
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要下架的优惠券");
        return;
      }
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架所选的 " + this.selectCount + " 条数据?",
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
          updatePlatformCouponStatus(params).then((res) => {
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
  mounted() {
    //如果作为组件方式，传入了类型值，则搜索参数附加类型
    if (this.getType) {
      this.searchForm.getType = this.getType;
      this.columns.pop()
    }
    this.init();
  },
};
</script>
<style lang="scss">
@import "@/styles/table-common.scss";
</style>
