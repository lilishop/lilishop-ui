<template>
  <div class="add-eval">
    <UserCenterLayout title="订单评价" :tabs="['订单评价']">
      <div class="title">
      <p>
        <span class="color999">订单号：</span><span>{{$route.query.sn}}</span>
        <span class="color999 ml_20" v-if="order.order">{{order.order.paymentTime}}</span>
      </p>
      </div>
    <!-- 物流评分、服务评分 -->
    <div class="delivery-rate">
      <div class="fontsize_16">物流服务评价：</div>
      <div class="color999 rate-list">
        <span class="rate-item">物流评价：<el-rate v-model="form.deliveryScore" :colors="rateThemeColors" class="theme-rate" /></span>
        <span class="rate-item">服务评价：<el-rate v-model="form.serviceScore" :colors="rateThemeColors" class="theme-rate" /></span>
        <span class="rate-item">描述评价：<el-rate v-model="form.descriptionScore" :colors="rateThemeColors" class="theme-rate" /></span>
      </div>
    </div>
    <!-- 添加订单评价  左侧商品详情  右侧评价框 -->
    <ul class="goods-eval">
      <li >
        <div class="goods-con">
          <img :src="orderGoods.image" class="hover-pointer" alt="" width="100" @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)">
          <p class="hover-pointer color999" @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)">{{orderGoods.goodsName}}</p>
          <p>{{ $filters.unitPrice(orderGoods.goodsPrice, '￥') }}</p>
        </div>

        <div class="eval-con">
          <div class="goods-grade-row">
            <span class="color999 goods-grade-label">商品评价：</span>
            <el-radio-group v-model="orderGoods.grade">
              <el-radio-button value="GOOD">好评</el-radio-button>
              <el-radio-button value="MODERATE">中评</el-radio-button>
              <el-radio-button value="WORSE">差评</el-radio-button>
            </el-radio-group>
          </div>
          <div>
            <el-input type="textarea" maxlength="500" show-word-limit :rows="4" v-model="orderGoods.content" />
          </div>
          <div class="upload-section">
            <div class="upload-row">
              <div class="demo-upload-list" v-for="(img, index) in orderGoods.uploadList" :key="index">
                <img :src="img">
                <div class="demo-upload-list-cover">
                  <el-icon @click="handleView(img)"><View /></el-icon>
                  <el-icon @click="handleRemove(index)"><Delete /></el-icon>
                </div>
              </div>
              <el-upload
                class="upload-trigger"
                :show-file-list="false"
                :on-success="handleSuccess"
                :before-upload="handleBeforeUpload"
                :format="['jpg','jpeg','png']"
                :action="action"
                :headers="accessToken"
              >
                <div class="hover-pointer icon-upload">
                  <el-icon :size="20"><Camera /></el-icon>
                </div>
              </el-upload>
            </div>
            <div class="describe">上传评价图片，最多9张</div>
          </div>
        </div>
      </li>
    </ul>
    <div class="submit-row">
      <el-button type="primary" :loading="loading" @click="save">发表</el-button>
    </div>
    <el-dialog title="View Image" v-model="visible">
        <img :src="previewImage" v-if="visible" style="width: 100%">
    </el-dialog>
    </UserCenterLayout>
  </div>
</template>
<script>
import { Message, Notice } from "@/utils/message";
import { Camera, Delete, View } from '@element-plus/icons-vue';
import { orderDetail } from '@/api/order.js';
import { addEvaluation } from '@/api/member.js';
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage';
export default {
  components: { Camera, Delete, View },
  data () {
    return {
      order: {}, // 订单详情
      orderGoods: {}, // 订单商品
      form: { // 评分展示
        deliveryScore: 5,
        serviceScore: 5,
        descriptionScore: 5
      }, // 表单
      visible: false, // 图片预览
      action: buyerUrl + '/buyer/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      previewImage: '', // 预览图片地址
      loading: false, // 提交加载状态
      // el-rate SVG 通过 colors 写入 fill-color，跟随平台主题色
      rateThemeColors: ['var(--theme-color)', 'var(--theme-color)', 'var(--theme-color)']
    }
  },
  methods: {
    getOrderDetail () { // 获取订单详情
      orderDetail(this.$route.query.sn).then(res => {
        this.order = res.result
        this.orderGoods = res.result.orderItems[this.$route.query.index]
        this.orderGoods['grade'] = 'GOOD'
        this.orderGoods.uploadList = []
      })
    },
    save () { // 保存评价
      if (!this.form.serviceScore || !this.form.deliveryScore) {
        Message.warning('物流服务评价不能为空')
        return false;
      }

      if (!this.form.descriptionScore) {
        Message.warning('描述评价不能为空')
        return false;
      }

      if (!this.orderGoods.content || !String(this.orderGoods.content).trim()) {
        Message.warning('评论内容不能为空')
        return false;
      }

      this.loading = true;
      let goods = this.orderGoods
      let params = {
        goodsId: goods.goodsId,
        orderItemSn: goods.sn,
        skuId: goods.skuId,
        descriptionScore: this.form.descriptionScore,
        serviceScore: this.form.serviceScore,
        deliveryScore: this.form.deliveryScore,
        grade: goods.grade,
        content: goods.content.trim(),
        images: goods.uploadList.length ? goods.uploadList.join(',') : ''
      }
      addEvaluation(params).then(res => {
        this.loading = false
        if (res.success) {
          Message.success('评价成功')
          this.$router.push('/home/CommentList')
        } else {
          Message.error(res.message || '评价失败，请稍后重试')
        }
      }).catch((err) => {
        this.loading = false;
        Message.error(err?.message || '评价失败，请稍后重试')
      })
    },
    goGoodsDetail (skuId, goodsId) { // 跳转商品详情
      let routerUrl = this.$router.resolve({
        path: '/goodsDetail',
        query: {skuId, goodsId}
      })
      window.open(routerUrl.href, '_blank')
    },
    handleView (name) { // 预览图片
      this.previewImage = name;
      this.visible = true;
    },
    handleRemove (index) { // 移除图片
      this.orderGoods.uploadList.splice(index, 1)
      this.$forceUpdate()
    },
    handleSuccess (res, file) { // 上传成功回调
      this.orderGoods.uploadList.push(res.result)
      this.$forceUpdate()
    },
    handleBeforeUpload () { // 上传之前钩子
      const check = this.orderGoods.uploadList.length < 9;
      if (!check) {
        Notice.warning({
          title: '最多可以上传九张图片'
        });
        return check;
      }
    }
  },
  mounted () {
    window.scrollTo(0, 0)
    this.accessToken.accessToken = storage.getItem('accessToken');
    this.getOrderDetail()
  }
}
</script>
<style lang="scss" scoped>
.delivery-rate {
  display: flex;
  align-items: center;
  margin-top: 20px;
  height: 50px;
  border-bottom: 1px solid #eee;
  >div:nth-child(1) {
    width: 120px;
    font-weight: bold;
  }
}
.rate-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
}
.rate-item {
  display: inline-flex;
  align-items: center;
}
.rate-list :deep(.theme-rate.el-rate) {
  --el-rate-fill-color: #{$theme_color};
  --el-rate-disabled-fill-color: #{$theme_color};
}
:deep(.theme-rate .el-rate__icon.is-active) {
  color: $theme_color !important;
}
.goods-eval li{
  display: flex;
  border-bottom: 1px solid #eee;

  .goods-con {
    width: 30%;
    padding: 20px;
    text-align: center;
    p {
      word-wrap: wrap;
      &:hover{ color: $theme_color; }
    }
  }
  .eval-con {
    width: 70%;
    padding: 20px;
  }
}
.goods-grade-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.goods-grade-label {
  flex-shrink: 0;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.demo-upload-list{
  display: block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0,0,0,.2);
  flex-shrink: 0;
}
.demo-upload-list img{
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover{
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.6);
}
.demo-upload-list:hover .demo-upload-list-cover{
  display: block;
}
.demo-upload-list-cover i{
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
.icon-upload {
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #999;
  border-radius: 4px;
  box-sizing: border-box;
  &:hover{
    cursor: pointer;
    border-color: $theme_color;
  }
}

.upload-section {
  margin-top: 10px;
}

.upload-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.upload-trigger {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;

  :deep(.el-upload) {
    display: inline-flex;
    align-items: center;
  }
}

.describe {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
