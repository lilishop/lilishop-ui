<template>
  <div>
    <el-form label-width="120px">
      <el-card>
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div class="form-item-view">
            <el-form-item label="商品分类">
              <span v-for="(item, index) in goods.categoryName" :key="index">
                {{ item }}
                <i v-if="index !== goods.categoryName.length - 1">&gt;</i>
              </span>
            </el-form-item>
            <el-form-item label="商品名称">{{ goods.goodsName }}</el-form-item>
            <el-form-item label="商品卖点">{{ goods.sellingPoint }}</el-form-item>
            <el-form-item label="商品参数">
              <div
                v-if="goods.goodsParamsDTOList && goods.goodsParamsDTOList.length"
                v-for="(item, index) in goods.goodsParamsDTOList"
                :key="index"
                style="margin-bottom: 10px; display: flex; align-items: center"
              >
                {{ item.groupName }} :
                <el-tag v-for="(child, i) in item.goodsParamsItemDTOList" :key="i" style="margin-left: 4px">
                  {{ child.paramName }} - {{ child.paramValue }}
                </el-tag>
              </div>
            </el-form-item>
          </div>
          <h4>商品交易信息</h4>
          <div class="form-item-view">
            <el-form-item label="计量单位">{{ goods.goodsUnit }}</el-form-item>
            <el-form-item label="销售模式">
              {{ goods.salesModel === "RETAIL" ? "零售型" : "批发型" }}
            </el-form-item>
            <el-form-item v-if="goods.salesModel !== 'RETAIL'" label="销售规则">
              <el-table border :data="wholesaleData" style="width: 100%">
                <el-table-column label="销售规则" width="300">
                  <template #default="{ row }">
                    <span v-if="row">
                      当商品购买数量 ≥{{ row.num }} 时，售价为 ￥{{ row.price }} /{{ goods.goodsUnit }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </div>
          <h4>商品规格及图片</h4>
          <div class="form-item-view">
            <el-form-item label="商品编号">{{ goods.id }}</el-form-item>
            <el-form-item label="商品价格">
              <priceColorScheme :value="goods.price" :color="$mainColor" />
            </el-form-item>
            <el-form-item label="商品图片">
              <div
                v-for="(item, __index) in goods.goodsGalleryList"
                :key="__index"
                class="demo-upload-list"
              >
                <img :src="item" />
                <div class="demo-upload-list-cover">
                  <el-icon class="preview-icon" @click="handleViewGoodsPicture(item)"><View /></el-icon>
                </div>
              </div>
              <el-dialog v-model="goodsPictureVisible" title="View Image" width="600px">
                <img v-if="goodsPictureVisible" :src="previewGoodsPicture" style="width: 100%" />
              </el-dialog>
            </el-form-item>
            <el-form-item label="商品视频">
              <video v-if="goods.goodsVideo" controls class="player" :src="goods.goodsVideo" />
            </el-form-item>
            <el-form-item label="商品规格">
              <el-table :data="skuData" style="width: 100%">
                <el-table-column prop="specs" label="规格" />
                <el-table-column prop="sn" label="编号" />
                <el-table-column prop="weight" label="重量(kg)" />
                <el-table-column
                  v-for="(item, index) in wholesaleData"
                  :key="'wp' + index"
                  :label="'购买量 ≥ ' + item.num"
                >
                  <template #default>
                    <el-input v-if="wholesaleData[index]" v-model="wholesaleData[index].price" disabled>
                      <template #append>元</template>
                    </el-input>
                  </template>
                </el-table-column>
                <el-table-column v-if="goods.salesModel !== 'WHOLESALE'" label="价格">
                  <template #default="{ row }">
                    <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
                  </template>
                </el-table-column>
                <el-table-column v-if="goods.salesModel !== 'WHOLESALE'" prop="quantity" label="库存" />
                <el-table-column label="图片">
                  <template #default="{ row }">
                    <div v-if="row" style="margin-top: 5px; display: flex">
                      <img
                        v-for="(item, index) in row.image"
                        :key="index"
                        :src="item"
                        style="height: 60px; margin: 10px; width: 60px"
                      />
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </div>
          <h4>商品详情描述</h4>
          <div class="form-item-view">
            <el-form-item class="goods-desc-item" label="商品描述">
              <div class="goods-desc-content" v-html="goods.intro"></div>
            </el-form-item>
            <el-form-item class="goods-desc-item" label="移动端描述">
              <div class="goods-desc-content" v-html="goods.mobileIntro"></div>
            </el-form-item>
          </div>
        </div>
      </el-card>
    </el-form>
  </div>
</template>
<script>
import { View } from "@element-plus/icons-vue";
import { getGoodsDetail } from "@/api/goods";

export default {
  name: "goodsDetail",
  components: { View },
  data() {
    return {
      goods: {},
      previewGoodsPicture: "",
      goodsPictureVisible: false,
      wholesaleData: [],
      skuData: [],
    };
  },
  mounted() {
    this.initGoods(this.$route.query.id);
  },
  methods: {
    initGoods(id) {
      getGoodsDetail(id).then((res) => {
        this.goods = res.result;
        this.skuData = res.result.skuList.map((sku) => ({
          specs: sku.goodsName,
          sn: sku.sn,
          weight: sku.weight,
          cost: sku.cost,
          price: sku.price,
          image: sku.goodsGalleryList,
          quantity: sku.quantity,
        }));
        this.wholesaleData = res.result.wholesaleList || [];
      });
    },
    handleViewGoodsPicture(url) {
      this.previewGoodsPicture = url;
      this.goodsPictureVisible = true;
    },
  },
};
</script>

<style lang="scss" soped>
div.base-info-item {
  h4 {
    margin-bottom: 10px;
    padding: 0 10px;
    border: 1px solid #ddd;
    background-color: #f8f8f8;
    font-weight: bold;
    color: #333;
    font-size: 14px;
    line-height: 40px;
    text-align: left;
  }

  .form-item-view {
    padding-left: 80px;
  }

  .goods-desc-item {
    align-items: flex-start;
  }

  .goods-desc-item .el-form-item__label {
    line-height: 24px;
    padding-top: 0;
  }

  .goods-desc-item .el-form-item__content {
    align-items: flex-start;
    line-height: 24px;
  }

  .goods-desc-content {
    line-height: 24px;
    text-align: left;
    word-break: break-word;
  }

  .goods-desc-content > :first-child {
    margin-top: 0;
  }
}

.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.demo-upload-list img {
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.preview-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
