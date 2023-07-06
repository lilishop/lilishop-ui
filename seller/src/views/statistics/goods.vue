<template>
  <div>

      <Card class="card fixed-bottom">
        <affixTime :closeShop="true" @selected="clickBreadcrumb"/>
      </Card>

    <Card class="card">

      <Tabs @on-click="handleClickType">
        <TabPane label="热门商品订单数量" name="NUM">
          <Table :columns="columns" :data="data"></Table>
        </TabPane>
        <TabPane label="热门商品订单金额" name="PRICE">
          <Table :columns="columns" :data="data"></Table>
        </TabPane>
      </Tabs>

    </Card>
  </div>
</template>
<script>
import affixTime from "@/views/lili-components/affix-time";
import * as API_Goods from "@/api/goods";
import Cookies from "js-cookie";

export default {
  components: { affixTime },
  data() {
    return {
      setting:"",
      params: { // 请求参数
        searchType: "LAST_SEVEN",
        year: "",
        month: "",
        storeId: JSON.parse(Cookies.get("userInfoSeller")).id || '',
        type: "NUM"
      },
      columns: [ // 表格表头
        {
          title: "商品名称",
          key: "goodsName",
        },
        {
          title: "销售数量",
          key: "num",
        },
        {
          title: "销售金额",
          key: "price",
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.price,color:this.$mainColor}} );
          },
        },
      ],
      data: [], // 表格数据
    };
  },
  computed:{

  },
  methods: {
    // tab切换
    handleClickType(name) {
      this.params.type = name;
      this.getData();
    },
    // 时间筛选
    clickBreadcrumb(item, index) {
      let callback = item;
      let type = this.params.type;
      this.params = {...callback};
      this.params.type = type;
      this.getData();
    },
    // 获取数据
    getData() {
      Promise.all([API_Goods.goodsStatistics(this.params)]).then((res) => {
        if (res[0].result) {
          this.data = res[0].result;
        }
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style scoped lang="scss">
.fixed-bottom{
  position:sticky;
  z-index: 999;
  top: 0;
}
.card {
  margin-bottom: 10px;
}
</style>
