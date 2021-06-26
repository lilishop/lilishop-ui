<template>
  <div class="search">
    <Card>
      <Row>
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="商品名称">
            <Input type="text" v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
          </Form-item>
          <Form-item label="积分区间">
            <Input type="text" v-model="searchForm.pointsS" placeholder="请输入开始区间" clearable style="width: 200px" />
            -
            <Input type="text" v-model="searchForm.pointsE" placeholder="请输入结束区间" clearable style="width: 200px" />
          </Form-item>
          <Form-item label="状态">
            <Select v-model="searchForm.promotionStatus" style="width: 200px">
              <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </Form-item>
          <Form-item label="SKU编码">
            <Input type="text" v-model="searchForm.skuId" placeholder="请输入SKU编码" clearable style="width: 200px" />
          </Form-item>
          <Button @click="handleSearch" type="primary" icon="ios-search" class="search-btn">搜索</Button>
        </Form>
      </Row>
      <Row class="operation padding-row">
        <Button @click="addPointsGoods" type="primary">添加积分商品</Button>

      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table">
        <template slot-scope="{ row }" slot="goodsName">
          <div>
            <a class="mr_10" @click="linkTo(row.goodsSku.goodsId,row.goodsSku.skuId)">{{row.goodsSku.goodsName}}</a>
            <Poptip trigger="hover" title="扫码在手机中查看" transfer>
              <div slot="content">
                <vue-qr :text="wapLinkTo(row.goodsSku.goodsId,row.goodsSku.skuId)" :margin="0" colorDark="#000" colorLight="#fff" :size="150"></vue-qr>
              </div>
              <img src="../../../assets/qrcode.svg" style="vertical-align:middle;" class="hover-pointer" width="20" height="20" alt="">
            </Poptip>
          </div>
        </template>
        <template slot-scope="{ row }" slot="price">
          <div>{{ row.goodsSku.price | unitPrice("￥") }}</div>
        </template>
        <template slot-scope="{ row }" slot="settlementPrice">
          <div>{{ row.settlementPrice | unitPrice("￥") }}</div>
        </template>
        <template slot-scope="{ row }" slot="quantity">
          <div>{{ row.goodsSku.quantity }}</div>
        </template>
        <template slot-scope="{ row }" slot="startTime">
          <div>{{ row.startTime }}</div>
          <div>{{ row.endTime }}</div>
        </template>

        <template slot-scope="{ row }" slot="action">
          <Button v-if="row.promotionStatus == 'NEW'" type="info" size="small" @click="edit(row.id)" style="margin-right: 5px">编辑</Button>
          <Button v-if="row.promotionStatus == 'START'" type="warning" size="small" @click="statusChanged(row.id, 'CLOSE')" style="margin-right: 5px">停用</Button>
          <Button v-if="row.promotionStatus == 'CLOSE'" type="warning" size="small" @click="statusChanged(row.id, 'START')" style="margin-right: 5px">启用</Button>
          <Button type="error" size="small" @click="close(row.id)">删除</Button>
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
  getPointsGoodsList,
  editPointsGoodsStatus,
  deletePointsGoodsStatus,
} from "@/api/promotion";
export default {
  name: "pointsGoods",
  components: {},
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        order: "desc", // 默认排序方式
      },
      statusList: [
        // 活动状态
        { label: "未开始", value: "NEW" },
        { label: "已开始", value: "START" },
        { label: "已结束", value: "END" },
        { label: "已关闭", value: "CLOSE" },
      ],
      columns: [
        // 表头
        {
          title: "商品名称",
          slot: "goodsName",
          minWidth: 150,
          fixed: "left",
          tooltip: true,
        },
        {
          title: "市场价",
          slot: "price",
          width: 100,
        },
        {
          title: "结算价",
          slot: "settlementPrice",
          width: 100,
        },

        {
          title: "库存数量",
          slot: "quantity",
          width: 100,
        },
        {
          title: "活动剩余库存",
          key: "activeStock",
          width: 150,
        },
        {
          title: "兑换积分",
          key: "points",
          width: 100,
        },
        {
          title: "所属店铺",
          key: "storeName",
          width: 100,
        },
        {
          title: "活动开始时间",
          slot: "startTime",
          minWidth: 150,
        },
        {
          title: "状态",
          key: "promotionStatus",
          width: 100,
          render: (h, params) => {
            let text = "未知",
              color = "";
            if (params.row.promotionStatus == "NEW") {
              text = "未开始";
              color = "geekblue";
            } else if (params.row.promotionStatus == "START") {
              text = "已开始";
              color = "blue";
            } else if (params.row.promotionStatus == "END") {
              text = "已结束";
              color = "green";
            } else if (params.row.promotionStatus == "CLOSE") {
              text = "已关闭";
              color = "volcano";
            }
            return h("div", [h("Tag", { props: { color: color } }, text)]);
          },
        },
        {
          title: "分类",
          key: "pointsGoodsCategoryName",
          width: 100,
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          fixed: "right",
          width: 150,
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
    addPointsGoods() {
      this.$router.push({ name: "add-points-goods" });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      if (this.searchForm.pointsS) {
        this.searchForm.points =
          this.searchForm.pointsS +
          "_" +
          (this.searchForm.pointsE ? this.searchForm.pointsE : "");
      }

      this.getDataList();
    },

    getDataList() {
      this.loading = true;
      getPointsGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    edit(id) {
      this.$router.push({ name: "edit-points-goods", query: { id: id } });
    },
    statusChanged(id, status) {
      let text = "";
      if (status == "START") {
        text = "开启";
      } else if (status == "CLOSE") {
        text = "关闭";
      }
      this.$Modal.confirm({
        title: "确认" + text,
        content: "您确认要" + text + "此积分商品?",
        loading: true,
        onOk: () => {
          editPointsGoodsStatus(id, {
            promotionStatus: status,
          }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success(text + "成功");
              this.getDataList();
            }
          });
        },
      });
    },
    close(id) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除此积分商品?",
        loading: true,
        onOk: () => {
          // 删除
          deletePointsGoodsStatus(id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
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
