<template>
  <div>
    <Form
      :label-width="120"
    >
      <div class="content-goods-publish">
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <FormItem label="商品分类">
              <span v-for="item in goods.categoryName"> {{ item }} > </span>
            </FormItem>
            <FormItem label="商品名称" prop="goodsName">
              {{ goods.goodsName }}
            </FormItem>

            <FormItem label="商品卖点" prop="sellingPoint">
              {{ goods.sellingPoint }}
            </FormItem>
          </div>
          <h4>商品交易信息</h4>
          <div class="form-item-view">
            <FormItem
              class="form-item-view-el"
              label="计量单位"
              prop="goodsUnit"
            > {{ goods.goodsUnit }}
            </FormItem>
            <FormItem
              class="form-item-view-el"
              label="销售模式"
              prop="salesModel"
            >
              {{ goods.salesModel === 'RETAIL' ? '零售型' : '批发型' }}
            </FormItem>
          </div>
          <h4>商品规格及图片</h4>
          <div class="form-item-view">
            <FormItem label="商品编号" prop="sn">
              {{ goods.sn }}
            </FormItem>
            <FormItem label="商品价格" prop="price">
              ¥{{ goods.price | unitPrice }}
            </FormItem>
            <FormItem label="市场价格" prop="cost">

              ¥{{ goods.cost | unitPrice }}
            </FormItem>
            <FormItem
              class="form-item-view-el"
              label="商品图片"
              prop="goodsGalleryFiles"
            >

              <div
                class="demo-upload-list"
                v-for="(item, __index) in goods.goodsGalleryList"
                :key="__index"
              >
                <img :src="item"/>
                <div class="demo-upload-list-cover">
                  <Icon
                    type="ios-eye-outline"
                    @click.native="handleViewGoodsPicture(item)"
                  ></Icon>
                </div>

                <Modal title="View Image" v-model="goodsPictureVisible">
                  <img
                    :src="previewGoodsPicture"
                    v-if="goodsPictureVisible"
                    style="width: 100%"
                  />
                </Modal>
              </div>


            </FormItem>


            <FormItem
              class="form-item-view-el"
              label="商品规格"
            >

              <Table :columns="skuColumn" :data="skuData">

                <!-- 商品栏目格式化 -->
                <template slot="showImage" slot-scope="scope">

                  <div style="margin-top: 5px;height: 80px; display: flex;">
                    <div style="">
                      <img :src="scope.row.image" style="height: 60px;margin-top: 1px;width: 60px">
                    </div>
                  </div>
                </template>
              </Table>

            </FormItem>


          </div>
          <h4>商品详情描述</h4>
          <div class="form-item-view">
            <FormItem class="form-item-view-el" label="商品描述" prop="intro">
              <div v-html="goods.intro"></div>
            </FormItem>
            <FormItem
              class="form-item-view-el"
              label="移动端描述"
              prop="skuList"
            >
              <div v-html="goods.mobileIntro"></div>
            </FormItem>
          </div>
          <h4>商品物流信息</h4>
          <div class="form-item-view">
            <FormItem class="form-item-view-el" label="商品重量" prop="weight">
              <Input v-model="goods.weight">
                <span slot="append">kg</span>
              </Input>
            </FormItem>
          </div>
        </div>
      </div>
    </Form>
  </div>
</template>

<script>

import {getGoodsDetail} from "@/api/goods";

export default {

  name: "goodsDetail",
  data() {
    return {
      goods: '', // 商品信息
      previewGoodsPicture: '', // 预览图片
      goodsPictureVisible: false, // 预览图片模态框
      skuColumn: [ // 规格表头
        {
          title: '规格',
          key: 'specs'
        },
        {
          title: '编号',
          key: 'sn'
        },
        {
          title: '重量',
          key: 'weight'
        },
        {
          title: '成本',
          key: 'cost'
        },
        {
          title: '价格',
          key: 'price'
        },
        {
          title: '图片',
          slot: "showImage",
        }
      ],
      skuData: [] // sku数据
    }
  },
  mounted() {
    this.initGoods(this.$route.query.id);
  }
  ,
  methods: {
    initGoods(id) {
      getGoodsDetail(id).then(res => {
        this.goods = res.result;
        let that = this
        res.result.skuList.forEach(function (sku, index, array) {
          console.log(sku)
          that.skuData.push({
            'specs': sku.goodsName,
            'sn': sku.sn,
            'weight': sku.weight,
            'cost': that.$options.filters.unitPrice(sku.cost, "¥"),
            'price': that.$options.filters.unitPrice(sku.price, "¥"),
            'image': sku.thumbnail,
          });
        })
        console.warn(this.skuData)

      });
    }
    ,

    handleViewGoodsPicture(url) {
      this.previewGoodsPicture = url;
      this.goodsPictureVisible = true;
    }
    ,
  }
  ,

}
;
</script>

<style lang="scss" soped>
@import "./goodsDetail.scss";

.ivu-table table {
  width: 100% !important;
}

</style>
