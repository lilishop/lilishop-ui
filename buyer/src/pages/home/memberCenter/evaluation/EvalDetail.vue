<template>
  <div class="add-eval">
    <UserCenterLayout>
      <div class="order-card status-card" v-if="orderGoods.goodsName || orderGoods.content">
        <div class="status-head">
          <div class="status-main">
            <p class="status-text">{{ gradeText }}</p>
            <p class="status-sn">评价时间：{{ orderGoods.createTime }}</p>
          </div>
        </div>
        <div class="goods-row" v-if="orderGoods.goodsName">
          <img
            :src="orderGoods.goodsImage"
            loading="lazy"
            decoding="async"
            alt=""
            @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)"
            @error="$event.target.style.visibility = 'hidden'"
          />
          <div class="goods-name" @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)">
            {{ orderGoods.goodsName }}
          </div>
        </div>
      </div>

      <div class="order-card">
        <h3>物流服务评价</h3>
        <div class="rate-list">
          <div class="rate-row">
            <span>物流评价</span>
            <el-rate disabled :model-value="Number(orderGoods.deliveryScore) || 0" :colors="rateThemeColors" class="theme-rate" />
          </div>
          <div class="rate-row">
            <span>服务评价</span>
            <el-rate disabled :model-value="Number(orderGoods.serviceScore) || 0" :colors="rateThemeColors" class="theme-rate" />
          </div>
          <div class="rate-row">
            <span>描述评价</span>
            <el-rate disabled :model-value="Number(orderGoods.descriptionScore) || 0" :colors="rateThemeColors" class="theme-rate" />
          </div>
        </div>
      </div>

      <div class="order-card">
        <h3>评价内容</h3>
        <p class="eval-text">{{ orderGoods.content || '暂无评价内容' }}</p>
        <div class="image-list" v-if="orderGoods.images">
          <img
            v-for="(img, index) in orderGoods.images.split(',')"
            :key="index"
            :src="img"
            loading="lazy"
            decoding="async"
            alt=""
            @click="handleView(img)"
          />
        </div>
      </div>

      <div class="order-card" v-if="orderGoods.reply || orderGoods.replyImage">
        <h3>商家回复</h3>
        <p class="eval-text" v-if="orderGoods.reply">{{ orderGoods.reply }}</p>
        <div class="image-list" v-if="orderGoods.replyImage">
          <img
            v-for="(img, index) in orderGoods.replyImage.split(',')"
            :key="index"
            :src="img"
            loading="lazy"
            decoding="async"
            alt=""
            @click="handleView(img)"
          />
        </div>
      </div>

      <el-dialog title="查看图片" v-model="visible" width="640px">
        <img :src="previewImage" loading="lazy" decoding="async" v-if="visible" class="preview-img" alt="" />
      </el-dialog>
    </UserCenterLayout>
  </div>
</template>
<script>
import { evaluationDetail } from "@/api/member.js";
export default {
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
  computed: {
    gradeText () {
      const map = { GOOD: '好评', MODERATE: '中评', WORSE: '差评' }
      return map[this.orderGoods.grade] || '评价详情'
    }
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
.add-eval {
  color: #333;
}

.order-card {
  padding: 4px 0 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
  }

  &:last-of-type {
    border-bottom: none;
  }
}

.status-card {
  padding-top: 8px;
}

.status-text {
  margin: 0;
  color: $theme_color;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.status-sn {
  margin: 6px 0 0;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;

  span {
    margin-left: 16px;
  }
}

.goods-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;

  img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
    background: #f5f5f5;
    flex-shrink: 0;
    cursor: pointer;
  }
}

.goods-name {
  color: #333;
  font-size: 16px;
  line-height: 22px;
  word-break: break-all;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}

.rate-row {
  display: flex;
  align-items: center;
  min-width: 180px;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;

  span {
    width: 72px;
    flex-shrink: 0;
  }
}

.rate-row :deep(.theme-rate.el-rate) {
  --el-rate-fill-color: #{$theme_color};
  --el-rate-disabled-fill-color: #{$theme_color};
  height: 22px;
}

:deep(.theme-rate .el-rate__icon.is-active) {
  color: $theme_color !important;
}

.eval-text {
  margin: 0;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-all;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;

  img {
    width: 88px;
    height: 88px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
  }
}

.preview-img {
  display: block;
  width: 100%;
}
</style>
