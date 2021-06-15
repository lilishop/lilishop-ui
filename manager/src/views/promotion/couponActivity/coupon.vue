<template>
  <div class="search">
    <Card>
      <Row class="operation padding-row">
        <Button @click="add" type="primary">添加活动</Button>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom"
             @on-sort-change="changeSort" @on-selection-change="changeSelect">
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber + 1" :total="total" :page-size="searchForm.pageSize"
              @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
              size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import {
  getCouponActivityList,
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
          {required: true, message: "不能为空", trigger: "blur"},
        ],
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 120,
        },
        {
          title: "活动类型",
          key: "couponActivityType",
          minWidth: 120,
          render: (h, params) => {
            if (params.row.couponActivityType === 'REGISTERED') {
              return h("div", ["注册赠券"]);
            } else {
              return h("div", ["精确发券"]);
            }
          },
        },
        {
          title: "优惠券类型",
          key: "activityScope",
          minWidth: 120,
          render: (h, params) => {
            let text = "未知";
            if (params.row.activityScope === "DESIGNATED") {
              text = "指定会员";
            } else {
              text = "全部会员";
            }
            return h("div", [text]);
          },
        },
        {
          title: "活动时间",
          minWidth: 150,
          render: (h, params) => {
            return h("div", {
              domProps: {
                innerHTML: params.row.startTime + "<br/>" + params.row.endTime,
              },
            });
          },
        },
        {
          title: "状态",
          minWidth: 80,
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
          },
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          minWidth: 100,
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  props: {
    // 是否为选中模式
    checked: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    $route(to, from) {
      if (to.fullPath == "/promotion/manager-coupon") {
        this.init();
      }
    },
  },
  methods: {
    // 选中优惠券 父级传值
    check(val, index) {

      this.data[index].___selected = !this.data[index].___selected

      this.$emit("selected", val);
    },
    init() {
      this.getDataList();
    },
    add() {
      this.$router.push({name: "add-coupon-activity"});
    },
    /** 跳转至领取详情页面 */
    receiveInfo(v) {
      this.$router.push({name: "member-receive-coupon", query: {id: v.id}});
    },
    info(v) {
      this.$router.push({name: "platform-coupon-info", query: {id: v.id}});
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
      this.searchForm.pageSize = 10;
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
      getCouponActivityList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          res.result.records.forEach(item => {
            item.___selected = false
          })
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            this.postRequest("/coupon/insertOrUpdate", this.form).then(
              (res) => {
                this.submitLoading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.modalVisible = false;
                }
              }
            );
          } else {
            // 编辑
            this.postRequest("/coupon/insertOrUpdate", this.form).then(
              (res) => {
                this.submitLoading = false;
                if (res.success) {
                  this.$Message.success("操作成功");
                  this.getDataList();
                  this.modalVisible = false;
                }
              }
            );
          }
        }
      });
    },
    edit(v) {
      this.$router.push({name: "edit-platform-coupon", query: {id: v.id}});
    },
    remove(v) {
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
    delAll() {
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
          updatePlatformCouponStatus(params).then((res) => {
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
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
@import "@/styles/table-common.scss";
</style>
