
<template>
  <div class="add-eval">
    <UserCenterLayout title="商品投诉" :tabs="['商品投诉']">
      <div class="title">
      <p>
        <span class="color999">订单号：</span><span>{{$route.query.sn}}</span>
        <span class="color999 ml_20" v-if="order.order">{{order.order.paymentTime}}</span>
      </p>
      </div>
    <div class="goods-eval">
      <div class="goods-con">
        <img :src="orderGoods.image" class="hover-pointer" alt="" width="100" @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)">
        <p class="hover-pointer color999" @click="goGoodsDetail(orderGoods.skuId, orderGoods.goodsId)">{{orderGoods.goodsName}}</p>
        <p>{{ $filters.unitPrice(orderGoods.goodsPrice, '￥') }}</p>
      </div>

      <div class="eval-con">
        <div class="eval-form">
          <div class="topic-row">
            <span class="color999 topic-label">投诉主题：</span>
            <el-select v-model="form.complainTopic" class="topic-select">
              <el-option v-for="item in reasonList" :value="item.reason" :key="item.id">{{ item.reason }}</el-option>
            </el-select>
          </div>
          <el-input type="textarea" maxlength="500" show-word-limit :rows="4" placeholder="请输入投诉内容" v-model="form.content" />
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
          <div class="describe">上传投诉凭证，最多5张</div>
        </div>
        <div class="submit-bar">
          <el-button type="primary" :loading="loading" @click="save">提交</el-button>
        </div>
      </div>
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
import { afterSaleReason, handleComplain } from '@/api/member.js';
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage';
export default {
  components: { Camera, Delete, View },
  data () {
    return {
      order: {}, // 订单详情
      orderGoods: {}, // 订单商品
      form: { // 投诉表单
        complainTopic: '',
        content: ''
      }, // 表单
      visible: false, // 图片预览
      action: buyerUrl + '/buyer/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      previewImage: '', // 图片地址
      loading: false, // 加载状态
      reasonList: [] // 投诉原因
    }
  },
  methods: {
    getOrderDetail () { // 获取订单详情
      orderDetail(this.$route.query.sn).then(res => {
        this.order = res.result
        this.orderGoods = res.result.orderItems[this.$route.query.index]
        this.orderGoods.uploadList = []
      })
      afterSaleReason('COMPLAIN').then(res => {
        if (res.success) {
          this.reasonList = res.result
          this.form['complainTopic'] = res.result[0].reason
          this.$forceUpdate()
        }
      })
    },
    save () { // 提交投诉信息
      if (!this.form.content || !String(this.form.content).trim()) {
        Message.warning('投诉内容不能为空')
        return
      }
      let params = {
        goodsId: this.orderGoods.goodsId,
        complainTopic: this.form.complainTopic,
        content: this.form.content,
        images: this.orderGoods.uploadList.toString(),
        orderSn: this.$route.query.sn,
        skuId: this.orderGoods.skuId
      }
      handleComplain(params).then(res => {
        if (res.success) {
          Message.success('投诉申请已提交，感谢您的反馈')
          this.$router.push({name: 'ComplainList'})
        }
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
    handleBeforeUpload () { // 上传之前钩子函数
      const check = this.orderGoods.uploadList.length < 6;
      if (!check) {
        Notice.warning({
          title: '最多可以上传五张图片'
        });
        return check;
      }
    }
  },
  mounted () {
    this.accessToken.accessToken = storage.getItem('accessToken');
    this.getOrderDetail()
    window.scrollTo(0, 0)
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
    width: 30%;
    font-weight: bold;
  }
}
.goods-eval{
  display: flex;
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
    box-sizing: border-box;
  }

  .eval-form {
    :deep(.el-textarea) {
      width: 100%;
    }
  }
}

.topic-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.topic-label {
  flex-shrink: 0;
  margin-right: 8px;
}

.topic-select {
  width: 200px;
  flex-shrink: 0;
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

.describe{
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.submit-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
