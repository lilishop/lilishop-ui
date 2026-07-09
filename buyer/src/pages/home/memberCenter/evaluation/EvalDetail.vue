<template>
  <div class="add-eval">
    <UserCenterLayout title="评价详情" :tabs="['评价详情']">
      <div class="title">
      <p>
        <span class="color999">创建人：</span><span>{{ $filters.secrecyMobile( orderGoods.createBy ) }}</span>
        <span class="color999 ml_20">{{ orderGoods.createTime }}</span>
      </p>
      </div>
    <!-- 物流评分、服务评分 -->
    <div class="delivery-rate">
      <div class="fontsize_16">物流服务评价：</div>
      <div class="color999 delivery-rate-items">
        <span>物流评价：<el-rate disabled :model-value="Number(orderGoods.deliveryScore) || 0" :colors="rateThemeColors" class="theme-rate" /></span>
        <span>服务评价：<el-rate disabled :model-value="Number(orderGoods.serviceScore) || 0" :colors="rateThemeColors" class="theme-rate" /></span>
        <span>描述评价：<el-rate disabled :model-value="Number(orderGoods.descriptionScore) || 0" :colors="rateThemeColors" class="theme-rate" /></span>
      </div>
    </div>
    <!-- 添加订单评价  左侧商品详情  右侧评价框 -->
    <ul class="goods-eval">
      <li>
        <div class="goods-con">
          <img
            :src="orderGoods.goodsImage"
            class="hover-pointer"
            alt=""
            width="100"
            @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)"
          />
          <p
            class="hover-pointer color999"
            @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)"
          >
            {{ orderGoods.goodsName }}
          </p>
        </div>

        <div class="eval-con">
          <div>
            <span class="color999">商品评价：</span>
            <el-radio-group
              style="margin-bottom: 5px; color: #999"
              v-model="orderGoods.grade"
              type="button"
              button-style="solid"
            >
              <el-radio label="GOOD" disabled>好评</el-radio>
              <el-radio label="MODERATE" disabled>中评</el-radio>
              <el-radio label="WORSE" disabled>差评</el-radio>
            </el-radio-group>
            <el-input
              type="textarea"
              maxlength="500"
              readonly
              show-word-limit
              :rows="4"
              v-model="orderGoods.content"
            />
          </div>
          <div style="display: flex; align-items: center">
            <template v-if="orderGoods.images">
              <div class="demo-upload-list" v-for="(img, index) in orderGoods.images.split(',')" :key="index">
                <img :src="img" />
                <div class="demo-upload-list-cover"><el-icon @click="handleView(img)"><View /></el-icon></div>
              </div>
            </template>
          </div>
          <div style="margin-top: 20px;" v-if="orderGoods.reply || orderGoods.replyImage">
            <span class="color999">商家回复：</span>
            <span>{{ orderGoods.reply }}</span>
            <div style="display: flex; align-items: center">
              <template v-if="orderGoods.replyImage">
                <div class="demo-upload-list" v-for="(img, index) in orderGoods.replyImage.split(',')" :key="index">
                  <img :src="img" />
                  <div class="demo-upload-list-cover"><el-icon @click="handleView(img)"><View /></el-icon></div>
                </div>
              </template>
            </div>
          </div>

        </div>
      </li>
    </ul>
    <el-dialog title="View Image" v-model="visible">
      <img :src="previewImage" v-if="visible" style="width: 100%" />
    </el-dialog>
    </UserCenterLayout>
  </div>
</template>
<script>
import { View } from '@element-plus/icons-vue';
import { evaluationDetail } from "@/api/member.js";
export default {
  components: { View },
  data() {
    return {
      order: {}, // 订单详情
      orderGoods: {}, // 订单商品
      visible: false, // 图片预览
      previewImage: "", // 预览图片链接
      loading: false, // 加载状态
      // el-rate SVG 通过 colors 写入 fill-color，跟随平台主题色
      rateThemeColors: ["var(--theme-color)", "var(--theme-color)", "var(--theme-color)"],
    };
  },
  methods: {
    getDetail() {
      // 获取评价详情
      evaluationDetail(this.$route.query.id).then((res) => {
        if (res.success) this.orderGoods = res.result;
      });
    },
    goGoodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routerUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId, goodsId },
      });
      window.open(routerUrl.href, "_blank");
    },
    handleView(name) {
      // 预览图片
      this.previewImage = name;
      this.visible = true;
    },
  },
  mounted() {
    this.getDetail();
  },
};
</script>
<style lang="scss" scoped>
.delivery-rate {
  display: flex;
  align-items: center;
  margin-top: 20px;
  min-height: 50px;
  border-bottom: 1px solid #eee;
  > div:nth-child(1) {
    width: 120px;
    font-weight: bold;
  }
}

.delivery-rate-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.delivery-rate-items :deep(.theme-rate.el-rate) {
  --el-rate-fill-color: #{$theme_color};
  --el-rate-disabled-fill-color: #{$theme_color};
}

:deep(.theme-rate .el-rate__icon.is-active) {
  color: $theme_color !important;
}
.goods-eval li {
  display: flex;
  border-bottom: 1px solid #eee;

  .goods-con {
    width: 30%;
    padding: 20px;
    text-align: center;
    p {
      word-wrap: wrap;
      &:hover {
        color: $theme_color;
      }
    }
  }
  .eval-con {
    width: 70%;
    padding: 20px;
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
  margin-top: 10px;
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
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.icon-upload {
  width: 58px;
  height: 58px;
  line-height: 58px;
  text-align: center;
  display: inline-block;
  border: 1px dashed #999;
  border-radius: 4px;
  margin-top: 10px;
  &:hover {
    cursor: pointer;
    border-color: $theme_color;
  }
}
</style>
