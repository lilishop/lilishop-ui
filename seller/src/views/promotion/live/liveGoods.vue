<template>
  <div class="wrapper">
    <Card>
      <Alert banner type="warning">

        <template slot="desc">
          由于直播商品需经过小程序直播平台的审核，你需要在此先提审商品，为了不影响直播间选取商品，请提前1天提审商品；
          每次最多可提审20款商品，每个店铺最多可维护200款商品，每款SPU只需选择其中一款SKU即可；
        </template>

      </Alert>

      <div>
        <Tabs :value="params.auditStatus">
          <TabPane v-for="(item,index) in liveTabWay" :key="index" :label="item.label" :name="item.type">

          </TabPane>

        </Tabs>
      </div>

      <Button type="primary" style="margin-bottom:10px;" @click="addNewLiveGoods" icon="md-add">选择商品</Button>

      <Table disabled-hover :columns="liveGoodsColumns" :data="liveGoodsData">
        <template slot-scope="{ row }" slot="goodsName">
          <div class="flex-goods">
            <img class="thumbnail" :src="row.thumbnail">
            {{ row.goodsName }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="price">
          <RadioGroup v-model="row.priceType">
            <div class="price-item">
              <Radio label="1">一口价:</Radio> <Input v-if="row.priceType == '1'" style="width:100px" v-model="row.price"></Input>
            </div>
            <div class="price-item">
              <Radio label="2">区间价:</Radio> <span v-if="row.priceType == '2'"><Input style="width:100px" v-model="row.price" />至<Input style="width:100px" v-model="row.price2" /></span>
            </div>
            <div class="price-item">
              <Radio label="3">折扣价:</Radio> <span v-if="row.priceType == '3'">现价<Input style="width:100px" v-model="row.price"></Input>原价<Input style="width:100px" v-model="row.price2" /></span>
            </div>
          </RadioGroup>
        </template>

        <template slot-scope="{ row,index }" slot="action">
          <Button type="primary" @click="()=>{liveGoodsData.splice(index,1)}">删除</Button>
        </template>
      </Table>
    </Card>
    <sku-select ref="skuSelect" @selectedGoodsData="selectedGoodsData"></sku-select>
    <div class="submit">
      <Button type="primary" @click="saveLiveGoods">保存商品</Button>
    </div>
  </div>
</template>

<script>
import skuSelect from "@/views/lili-dialog"; //选择商品组件
import { addLiveGoods } from "@/api/promotion.js";
export default {
  components: {
    skuSelect,
  },
  data() {
    return {
      params: {
        pageNumber: 1,
        pageSize: 10,
        auditStatus: 0,
      },
      // 商品审核状态
      liveTabWay: [
        {
          label: "待提审",
          type: 0,
        },
        {
          label: "审核中",
          type: 1,
        },
        {
          label: "已审核",
          type: 2,
        },
        {
          label: "审核未通过",
          type: 3,
        },
      ],

      // 商品表格columns
      liveGoodsColumns: [
        {
          title: "商品",
          slot: "goodsName",
        },
        {
          title: "价格",
          slot: "price",
        },
        {
          title: "库存",
          key: "quantity",
          width: 100,
        },

        {
          title: "操作",
          slot: "action",
          width: 100,
        },
      ],
      // 表格商品详情
      liveGoodsData: [],
    };
  },
  methods: {
    /**
     * 保存直播商品
     */
    async saveLiveGoods() {
      //  this.$Spin.show();
      let submit = this.liveGoodsData.map((element) => {
        return {
          goodsId: element.goodsId, //商品id
          goodsImage: element.small, //商品图片
          name: element.goodsName, //商品昵称
          price: parseInt(element.price), //商品价格
          price2: element.price2 ? parseInt(element.price2) : "", //商品价格
          priceType: element.priceType, // priceType  Number  是  价格类型，1：一口价（只需要传入price，price2不传） 2：价格区间（price字段为左边界，price2字段为右边界，price和price2必传） 3：显示折扣价（price字段为原价，price2字段为现价， price和price2必传）
          skuId: element.id,
          url: `/pages/product/goods?id=${element.id}&goodsId=${element.goodsId}`, //小程序地址
        };
      });

      let result = await addLiveGoods(submit);
      if (result.success) {
        this.$Message.success({
          content: `添加成功！`,
        });
      }
    },

    /**
     * 商品选择器回调的商品信息
     */
    selectedGoodsData(goods) {
      goods.map((item) => {
        return (item.priceType = "1");
      });
      this.liveTabWay.map((item,index)=>{
        return item.type  == 99 && this.liveTabWay.splice(index,1)
      })

      this.liveGoodsData.push(...goods);
    },

    /**
     * 新增商品
     */
    addNewLiveGoods() {
      this.liveTabWay.push({
        type:99,
        label:"新增商品"
      })
      this.params.auditStatus = 99
      this.$refs.skuSelect.open("goods");
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}
.thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 0.4em;
}
.flex-goods {
  margin: 10px;
  display: flex;

  align-items: center;
  > img {
    margin-right: 10px;
  }
}
.price-item {
  margin: 15px 5px;
  > * {
    margin: 5px;
  }
}
.submit {
  box-shadow: 3px 5px 12px rgba(0, 0, 0, 0.1);
  height: 60px;
  background: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
