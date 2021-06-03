<template>
  <div class="pintuan-goods">
    <Card>
      <h4>活动详情</h4>
      <Table
        style="margin: 10px 0"
        border
        :columns="columns"
        :data="data"
      ></Table>

      <h4>商品信息</h4>
        <Table
          :loading="loading"
          border
          class="operation"
          :columns="goodsColumns"
          :data="goodsData"
          ref="table"
          sortable="custom"
          @on-sort-change="changeSort"
          @on-selection-change="changeSelect"
        >
          <template slot-scope="{ row }" slot="goodsName">
            <div>
              <a class="mr_10" @click="linkTo(row.goodsId,row.skuId)">{{row.goodsName}}</a>
              <Poptip trigger="hover" title="扫码在手机中查看" transfer>
                <div slot="content">
                  <vue-qr :text="wapLinkTo(row.goodsId,row.skuId)"  :margin="0" colorDark="#000" colorLight="#fff" :size="150"></vue-qr>
                </div>
                <img src="../../../assets/qrcode.svg" style="vertical-align:middle;" class="hover-pointer" width="20" height="20" alt="">
              </Poptip>
            </div>
          </template>
        
        </Table>
      <Row type="flex" justify="end" class="page operation">
        <Page
          :current="searchForm.pageNumber + 1"
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
    <Modal title="查看图片" v-model="visible">
      <img
        :src="showImg"
        v-if="visible"
        style="width: 200px; height: 200px; margin-left: 130px"
      />
    </Modal>
  </div>
</template>
<script>
import { getPintuanGoodsList, getPintuanDetail } from "@/api/promotion.js";
import config from "@/config";

const buyerUrl =
  process.env.NODE_ENV === "development"
    ? config.api_dev.buyer
    : config.api_prod.buyer;

export default {
  data() {
    return {
      visible: false,// 预览图片
      showImg: "", // 预览图片url
      openSearch: true, // 显示搜索
      openTip: true, // 显示提示
      loading: false, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 0, // 当前页数
        pageSize: 10, // 页面大小
      },

      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      data: [], // 表单数据
      total: 0, // 表单数据总数
      columns: [
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 120
        },
        {
          title: "活动开始时间",
          key: "startTime",
          minWidth: 120
        },
        {
          title: "活动结束时间",
          key: "endTime",
          minWidth: 120
        },
        {
          title: "成团人数",
          key: "requiredNum",
        },
        {
          title: "限购数量",
          key: "limitNum",
        },
        {
          title: "状态",
          key: "promotionStatus",
          minWidth: 100,
          render: (h, params) => {
            let text = "未知",
              color = "";
            if (params.row.promotionStatus == "NEW") {
              text = "未开始";
              color = "default";
            } else if (params.row.promotionStatus == "START") {
              text = "已开始";
              color = "green";
            } else if (params.row.promotionStatus == "END") {
              text = "已结束";
              color = "blue";
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
      ],
      goodsColumns: [
        {
          title: "商品名称",
          slot: "goodsName",
          minWidth: 120,
        },

        {
          title: "库存",
          key: "quantity",
          minWidth: 40,
        },

        {
          title: "拼团价格",
          key: "price",
          minWidth: 50,
          render: (h, params) => {
          return h(
              "div",
              this.$options.filters.unitPrice(params.row.price, "￥")
            );
          },
        },

      ],
      goodsData: [],
    };
  },
  methods: {
    init() {
      this.getDataList();
      this.getPintuanMsg();
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

    handleReset() {
      // 重置
      this.searchForm.pageNumber = 0;
      this.searchForm.promotionName = "";
      this.selectDate = null;
      // 重新加载数据
      this.getDataList();
    },

    getDataList() {
      this.loading = true;
      this.searchForm.pintuanId = this.$route.query.id;

      getPintuanGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.goodsData = res.result.records;
          this.total = res.result.total;
        }
      });
    },

    getPintuanMsg() {
      // 获取拼团详情
      getPintuanDetail(this.$route.query.id).then((res) => {
        if (res.success) this.data.push(res.result);
      });
    },

    toBuyerGoods(row) {
      window.open(
        buyerUrl +
          "/pages/product/product?id=" +
          row.skuId +
          "&goodsId=" +
          row.goodsId
      );
    },
    viewImg(img) {
      this.showImg = img;
      this.visible = true;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.operation {
  margin-bottom: 10px;
}
h4 {
  margin: 20px 0;
  padding: 0 10px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  text-align: left;
  border-left: 3px solid red;
}
</style>
