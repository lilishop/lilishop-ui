<template>
  <Card>
    <Form
      label-position="left"
      ref="searchForm"
      :model="params"
      inline
      :label-width="100"
      class="search-form"
    >
      <Form-item label="选择店铺" prop="sn">
        <span class="tips" v-if="storeName"
          >{{ storeName }}
          <Button
            @click="
              () => {
                storeName = '';
                params.shopId = '';
              }
            "
            type="text"
            >清空</Button
          >
        </span>
        <Button size="small" @click="handleClickShop" type="primary"
          >选择店铺</Button
        >
      </Form-item>

      <Form-item label="选择时间类型">
        <Select v-model="params.timeType" style="width: 200px">
          <Option
            v-for="item in typeList"
            :value="item.value"
            :key="item.value"
            >{{ item.label }}</Option
          >
        </Select>
      </Form-item>
      <Form-item label="按年查询">
        <DatePicker
          type="year"
          placeholder="Select year"
          style="width: 200px"
          v-model="year"
        ></DatePicker>
      </Form-item>
      <Form-item label="按月查询" v-if="params.timeType == 'MONTH'">
        <InputNumber :max="12" :min="1" v-model="params.month"></InputNumber>
      </Form-item>
    </Form>

    <div class="order-list">
      <div class="order-col">
        <div>金额</div>
        <div>{{ priceData | unitPrice }}</div>
      </div>
    </div>
    <Tabs v-model="orderStatus" @on-click="handleClickType">
      <TabPane label="订单列表" name="PRICE">
        <Table :columns="columns" :data="data"></Table>
        <div class="page-col">
          <Page @on-change="changePage" :total="total" show-total />
        </div>
      </TabPane>
    </Tabs>

    <Modal v-model="modalFlag" width="1200" :title="selectName">
      <!-- 店铺 -->
      <shopLayout v-if="shopFlag" @callback="callbackShop" ref="shops" />
      <!-- 会员 -->
      <memberLayout v-else @callback="callbackMember" ref="members" />
    </Modal>
  </Card>
</template>
<script>
import shopLayout from "@/views/seller/shop/shopList";
import memberLayout from "@/views/member/list/index";
import * as API_Goods from "@/api/goods";
export default {
  components: {
    shopLayout,
    memberLayout,
  },
  data() {
    return {
      storeName: "", // 店铺名称
      memberName: "", // 会员名称
      shopFlag: false, // 是否展示
      selectName: "选择", // modal名称
      modalFlag: false, // modal显隐
      priceData: "", // 价格
      orderStatus: "PRICE", // tab展示
      shopList: {}, // 店铺列表
      memberList: {}, // 会员列表
      typeList: [
        {
          value: "YEAR",
          label: "年",
        },
        {
          value: "MONTH",
          label: "月",
        },
      ],
      total: 0, // 列表总数
      year: "", // 当前年份
      params: { // 请求参数
        type: "PRICE",
        timeType: "YEAR",
        pageNumber: 1,
        pageSize: 10,
        year: "",
        shopId: "",
        memberId: "",
      },
      columns: [ // 表格表头
        {
          title: "售后号",
          key: "refundSn",
        },
        {
          title: "卖家名称",
          key: "sellerName",
        },
        {
          title: "商品名称",
          key: "name",
        },
        {
          title: "规格名称",
          key: "specs",
        },
        {
          title: "会员名称",
          key: "memberName",
        },

        {
          title: "实际退款金额",
          key: "finalPrice",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.finalPrice)
            );
          },
        },
      ],
      data: [] // 列表数据
    };
  },
  watch: {
    params: {
      handler(val) {
        this.init();
      },
      deep: true,
    },

    year(val) {
      this.params.year = new Date(val).getFullYear();
    },
  },
  methods: {
    // 选择店铺
    handleClickShop() {
      this.modalFlag = true;
      this.selectName += "店铺";
      this.shopFlag = true;
      this.$nextTick(() => {
        this.$refs.shops.selectedShop = true;
      });
    },
    // 选择会员
    handleClickMember() {
      this.modalFlag = true;
      this.selectName += "会员";
      this.$nextTick(() => {
        this.$refs.members.selectedMember = true;
      });
    },

    callbackMember(val) {
      this.memberName = val.username;
      this.params.memberId = val.id;
      this.modalFlag = false;
    },

    callbackShop(val) {
      this.storeName = val.storeName;
      this.params.shopId = val.id;
      this.modalFlag = false;
    },

    // 点击分页
    changePage(index) {
      this.params.pageNumber = index;
    },

    handleClickType(name) {
      this.params.type = name;
    },
    init(name) {
      Promise.all([
        API_Goods.refundStatistics(this.params),
        !this.priceData ? API_Goods.refundPriceStatistics(this.params) : "",
      ]).then((res) => {
        if (res[0].result) {
          this.data = res[0].result.records;
          this.total = res[0].result.total;
        }
        if (res[1].result) {
          this.priceData = res[1].result;
        }
      });
    },
  },
  mounted() {
    let data = new Date();

    this.year = data;
    this.year && this.params.month
      ? this.timeType == "MONTH"
      : this.timeType == "YEAR";
  },
};
</script>
<style scoped lang="scss">
.page-col {
  text-align: right;
  margin: 10px 0;
}
.order-col {
  display: flex;
  > div {
    margin-right: 8px;
    padding: 16px;
    font-size: 15px;
  }
}
.order-list {
  display: flex;
}
.tips {
  margin: 0 8px;
}
</style>
