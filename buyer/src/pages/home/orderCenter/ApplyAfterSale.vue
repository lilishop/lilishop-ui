<template>
  <div class="apply-after-sale">
    <UserCenterLayout>
    <div class="goods-row" v-for="(goods, index) in goodsData" :key="index">
      <img class="goods-img" :src="goods.image" loading="lazy" decoding="async" alt="">
      <div class="goods-info">
        <div class="goods-name">{{ goods.goodsName }}</div>
        <div class="goods-meta">
          <span class="goods-price">{{ $filters.unitPrice(goods.applyRefundPrice, '￥') }}</span>
          <span class="goods-num">×{{ goods.num }}</span>
        </div>
      </div>
    </div>
    <div>
      <el-form :model="form" ref="formRef" class="mt_10" :rules="rules" label-width="80px">
        <el-form-item label="售后类别">
          <el-radio-group v-model="form.serviceType" @change="changeReason">
            <el-radio v-if="info.returnGoods" label="RETURN_GOODS">退货</el-radio>
            <el-radio v-if="info.returnMoney" label="RETURN_MONEY">退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提交数量" prop="num">
          <el-input type="number" v-model="form.num" style="width:260px" />
        </el-form-item>
        <el-form-item label="提交原因" prop="reason">
          <el-select
            v-model="form.reason"
            :key="form.serviceType"
            style="width:260px"
            placeholder="请选择提交原因"
          >
            <el-option
              v-for="item in reasonList"
              :key="item.id"
              :label="item.reason"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="problemDesc">
          <el-input type="textarea" :rows="4" maxlength="500" style="width:260px" show-word-limit v-model="form.problemDesc" />
        </el-form-item>
        <el-form-item label="图片信息">
          <div class="upload-section">
            <div class="upload-row">
              <div class="demo-upload-list" v-for="(img, index) in uploadList" :key="index">
                <img :src="img" loading="lazy" decoding="async">
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
            <div class="describe">上传售后凭证，最多5张</div>
          </div>
        </el-form-item>
        <el-form-item label="退款方式">
          <div>{{info.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款'}}</div>
        </el-form-item>
        <template v-if="info.accountType === 'BANK_TRANSFER' && info.applyRefundPrice != 0">
          <el-form-item label="开户行" prop="bankDepositName">
            <el-input v-model="form.bankDepositName" type="text" placeholder="请输入银行开户行" style="width:260px" />
          </el-form-item>
          <el-form-item label="开户名" prop="bankAccountName">
            <el-input v-model="form.bankAccountName" type="text" placeholder="请输入银行开户名" style="width:260px" />
          </el-form-item>
          <el-form-item label="银行账号" prop="bankAccountNumber">
            <el-input v-model="form.bankAccountNumber" type="text" placeholder="请输入银行账号" style="width:260px" />
          </el-form-item>
        </template>
        <el-form-item label="返回方式" v-if="form.serviceType === 'RETURN_GOODS'">
          <div>快递至第三方卖家</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="apply">提交申请</el-button>
        </el-form-item>
      </el-form>
      <el-dialog title="图片预览" v-model="visible">
        <img :src="previewImage" loading="lazy" decoding="async" v-if="visible" style="width: 100%">
      </el-dialog>
    </div>
    </UserCenterLayout>
  </div>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Notice } from "@/utils/message";
import { Camera, Delete, View } from '@element-plus/icons-vue';
import { afterSaleReason, afterSaleInfo, applyAfterSale } from '@/api/member.js'
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage';
import * as RegExp from '@/plugins/RegExp'

const route = useRoute();
const router = useRouter();

const formRef = ref(null);

const goodsData = ref([]); // 商品数据
const reasonList = ref([]); // 售后原因列表
const info = ref({}); // 售后信息
const form = reactive({ // 售后数据
  serviceType: 'RETURN_GOODS',
  num: 1
});
const uploadList = ref([]); // 上传列表
const action = buyerUrl + '/buyer/common/upload/file'; // 上传地址
const accessToken = reactive({}); // 验证token
const visible = ref(false); // 图片预览
const previewImage = ref(''); // 预览图片url

const checkNum = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请填写提交数量'));
  } else if (value > info.value.num) {
    callback(new Error('提交数量不能大于购买数量'));
  } else if (!RegExp.integer.test(value)) {
    callback(new Error('提交数量必须为正整数'));
  } else {
    callback();
  }
};
const rules = { // 验证规则
  num: [{ validator: checkNum }],
  reason: [{ required: true, message: '请选择提交原因' }],
  problemDesc: [{ required: true, message: '请输入问题描述' }],
  bankAccountNumber: [
    { required: true, message: '请输入银行卡号' },
    {
      type: 'string',
      pattern: /^[0-9]\d*$/,
      message: '请输入正确的银行卡号'
    }
  ],
  bankAccountName: [{ required: true, message: '请输入银行开户名' }],
  bankDepositName: [{ required: true, message: '请输入银行开户行' }]
};

function getInfo () { // 获取售后信息
  afterSaleInfo(route.query.sn).then(res => {
    if (res.success) {
      info.value = res.result
      goodsData.value.push(res.result)
      if (!info.value.returnGoods && info.value.returnMoney) {
        form.serviceType = 'RETURN_MONEY'
      }
      getReason(form.serviceType)
    }
  })
}
function getReason (type) { // 获取售后原因
  afterSaleReason(type).then(res => {
    if (res.success) reasonList.value = res.result
  })
}
function changeReason (type) { // 改变售后原因列表
  form.reason = undefined
  getReason(type)
  nextTick(() => {
    formRef.value?.clearValidate('reason')
  })
}
function apply () { // 售后申请提交
  formRef.value.validate(valid => {
    if (valid) {
      let params = Object.assign(info.value, form)
      params.images = uploadList.value.toString()
      params.orderItemSn = route.query.sn
      params.reason = reasonList.value.find(item => item.id == params.reason).reason
      applyAfterSale(params).then(res => {
        if (res.success) {
          Message.success('售后申请提交成功，请到售后订单查看！')
          router.push({name: 'AfterSale'})
        }
      })
    }
  })
}
function handleView (name) { // 预览图片
  previewImage.value = name;
  visible.value = true;
}
function handleRemove (index) { // 移除图片
  uploadList.value.splice(index, 1)
}
function handleSuccess (res, file) { // 上传成功回调
  uploadList.value.push(res.result)
}
function handleBeforeUpload () { // 上传之前钩子函数
  const check = uploadList.value.length < 6;
  if (!check) {
    Notice.warning({
      title: '最多可以上传5张图片'
    });
    return check;
  }
}

onMounted(() => {
  accessToken.accessToken = storage.getItem('accessToken');
  getInfo()
});
</script>
<style lang="scss" scoped>

/** 商品信息 */
.goods-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.goods-img {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  object-fit: cover;
}

.goods-info {
  min-width: 0;
  margin-left: 12px;
}

.goods-name {
  color: #333;
  font-size: 14px;
  line-height: 22px;
}

.goods-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.goods-price {
  color: $theme_color;
  font-size: 14px;
  font-weight: 600;
}

.goods-num {
  color: #999;
  font-size: 14px;
}

.order-price {
  text-align: right;
  margin-top: 30px;
  font-size: 16px;
  color: #999;
  > div > span:nth-child(2) {
    width: 130px;
    text-align: right;
    display: inline-block;
    margin-top: 10px;
  }
  .actrual-price {
    color: $theme_color;
    font-weight: bold;
    font-size: 20px;
  }
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
