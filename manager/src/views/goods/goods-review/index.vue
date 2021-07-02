<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员名称" prop="memberName">
            <Input type="text" v-model="searchForm.memberName" placeholder="请输入会员名称" clearable style="width: 200px"/>
          </Form-item>
          <Button @click="handleSearch" type="primary" class="search-btn" icon="ios-search">搜索</Button>
        </Form>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom"
              @on-sort-change="changeSort" @on-selection-change="changeSelect">
        <!-- 页面展示 -->
        <template slot="shopDisableSlot" slot-scope="scope">
          <div>
          </div>
          <i-switch size="large" true-value="OPEN" false-value="CLOSE" v-model="scope.row.status"
                    @on-change="changeSwitch(scope.row)">
            <span slot="open">展示</span>
            <span slot="close">隐藏</span>
          </i-switch>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
              @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]"
              size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
    <!-- 评价详情 -->
    <Modal v-model="infoFlag" width="800" :title="infoTitle">

      <div class="info-list" style="overflow: hidden">
        <div class="left-container">
          <div class="product">
            <img class="img" :src=infoData.goodsImage>
          </div>
          <div class="show">
            <label>页面展示：</label>
            <i-switch size="large" true-value="OPEN" false-value="CLOSE" v-model="infoData.status"
                      @on-change="changeRadio" style="margin-top: 3px">
              <span slot="open">展示</span>
              <span slot="close">隐藏</span>
            </i-switch>
          </div>
        </div>
        <div class="right-container">
          <div class="border-b">{{ infoData.goodsName }}</div>
          <div class="border-b">
            <div class="div-height"> 店铺名称：{{ infoData.storeName }}</div>
            <div class="div-height"> 订单号：{{ infoData.orderNo }}</div>
          </div>

          <div class="border-b">
            <List>
              <ListItem>
                <ListItemMeta :avatar="infoData.memberProfile" :title="infoData.memberName"
                              :description="infoData.content"/>
              </ListItem>
              <div class="" v-if="infoData.haveImage">
                评价图
                <div style="margin-left: 40px">
                  <template v-if="infoData.images && infoData.images.length">
                    <img style="width: 100px;height: 110px;margin-left: 2px"
                       v-for="(img,index) in infoData.images.split(',')"  :src="img"
                       alt="" :key="index"/>
                  </template>
                  
                </div>
              </div>
            </List>
          </div>
          <div class="border-b" v-if="infoData.reply">
            <div>
              <div>
                <div style="float: left"> 商家回复：</div>
                <div style="margin-left: 60px">{{ infoData.reply }}</div>
              </div>
              <div v-if="infoData.haveReplyImage">
                <div style="margin-left: 60px">
                  <template  v-if="infoData.replyImage && infoData.replyImage.length">
                    <img style="width: 100px;height: 110px" v-for="(img,index) in infoData.replyImage.split(',')" :key="index"
                       :src="img" alt=""/>
                  </template>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Member from "@/api/member";

export default {
  name: "shop",
  components: {},
  data() {
    return {
      infoData: "", // 商品信息
      infoFlag: false, // 评价展示
      infoTitle: "", // modal名称
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          title: "商品名称",
          key: "goodsName",
          minWidth: 120,
          align: "left",
          tooltip: true,
        },
        {
          title: "会员名称",
          key: "memberName",
          minWidth: 120,
          align: "left",
          tooltip: true,
        },
        {
          title: "评价",
          key: "grade",
          align: "left",
          width: 90,
          render: (h, params) => {
            if (params.row.grade == "GOOD") {
              return h("Tag", {props: {color: "green",},}, "好评");
            } else if (params.row.grade == "MODERATE") {
              return h("Tag", {props: {color: "orange",},}, "中评");
            } else {
              return h("Tag", {props: {color: "red",},}, "差评");
            }
          },
        },
        {
          title: "评价内容",
          key: "content",
          align: "left",
          minWidth: 200,
          tooltip: true,
        },
        {
          title: "评价时间",
          key: "createTime",
          align: "left",
          width: 170
        },
        {
          title: "页面展示",
          key: "shopDisable",
          align: "left",
          width: 100,
          slot: "shopDisableSlot",
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          fixed: "right",

          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    size: "small",
                    type: "info",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.info(params.row);
                    },
                  },
                },
                "查看"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    changeRadio(val) {
      let status = val;
      API_Member.updateMemberReview(this.infoData.id, {status}).then(
        (res) => {
          this.$Message.success("修改成功!");
          this.init();
        }
      );
    },
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
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    //列表直接选择页面是否展示
    changeSwitch(v) {
      let status = v.status;
      API_Member.updateMemberReview(v.id, {status: status}).then((res) => {
        this.init();
      });
    },
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据 请自行修改接口
      API_Member.getMemberReview(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    //评价详情
    info(v) {
      this.infoFlag = true;
      this.infoTitle = `用户${v.memberName}的评价详情`;
      API_Member.getMemberInfoReview(v.id).then((res) => {
        if (res.result) {
          this.infoData = res.result;
        }
      });
    },

    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除会员" + v.memberName + "的评论?",
        loading: true,
        onOk: () => {
          API_Member.delMemberReview(v.id).then((res) => {
            this.$Message.success("修改成功");
            this.init();
          });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          // 批量删除
          this.deleteRequest("/shop/delByIds/" + ids).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
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
<style lang="scss" scoped>
@import "./index.scss";
@import "@/styles/table-common.scss";
</style>
