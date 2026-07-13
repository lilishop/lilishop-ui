<template>
  <div class="apply-after-sale">
    <UserCenterLayout title="申请售后" :tabs="['申请售后']">
    <el-table :data="goodsData" border>
      <el-table-column label="商品名称">
        <template #default="{ row }">
          <div style="padding:5px;display:flex;">
            <img :src="row.image" style="vertical-align: top;" width="60" height="60" alt="">
            <span class="ml_10">{{ row.goodsName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="价格">
        <template #default="{ row }">
          <div>{{ $filters.unitPrice(row.applyRefundPrice, '￥') }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="num" label="购买数量" />
    </el-table>
    <div>
      <el-form :model="form" ref="form" class="mt_10" :rules="rules" label-width="80px">
        <el-form-item label="售后类别">
          <el-radio-group v-model="form.serviceType" @change="changeReason" type="button" button-style="solid">
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
      <el-dialog title="View Image" v-model="visible">
        <img :src="previewImage" v-if="visible" style="width: 100%">
      </el-dialog>
    </div>
    </UserCenterLayout>
  </div>
</template>
<script>
import { Message, Notice } from "@/utils/message";
import { Camera, Delete, View } from '@element-plus/icons-vue';
import { afterSaleReason, afterSaleInfo, applyAfterSale } from '@/api/member.js'
import { buyerUrl } from '@/plugins/request.js';
import storage from '@/plugins/storage';
import * as RegExp from '@/plugins/RegExp'
export default {
  components: { Camera, Delete, View },
  data () {
    const checkNum = (rule, value, callback) => {
      if (value === '') {
        console.log(RegExp);
        callback(new Error('请填写提交数量'));
      } else if (value > this.info.num) {
        callback(new Error('提交数量不能大于购买数量'));
      } else if (!RegExp.integer.test(value)) {
        callback(new Error('提交数量必须为正整数'));
      } else {
        callback();
      }
    };
    return {
      goodsData: [], // 商品数据
      reasonList: [], // 售后原因列表
      info: {}, // 售后信息
      form: { // 售后数据
        serviceType: 'RETURN_GOODS',
        num: 1
      },
      uploadList: [], // 上传列表
      action: buyerUrl + '/buyer/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      visible: false, // 图片预览
      previewImage: '', // 预览图片url
      rules: { // 验证规则
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
      }
    }
  },
  methods: {
    getInfo () { // 获取售后信息
      afterSaleInfo(this.$route.query.sn).then(res => {
        if (res.success) {
          this.info = res.result
          this.goodsData.push(res.result)
          if (!this.info.returnGoods && this.info.returnMoney) {
            this.form.serviceType = 'RETURN_MONEY'
          }
          this.getReason(this.form.serviceType)
        }
      })
    },
    getReason (type) { // 获取售后原因
      afterSaleReason(type).then(res => {
        if (res.success) this.reasonList = res.result
      })
    },
    changeReason (type) { // 改变售后原因列表
      this.form.reason = undefined
      this.getReason(type)
      this.$nextTick(() => {
        this.$refs.form?.clearValidate('reason')
      })
    },
    apply () { // 售后申请提交
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = Object.assign(this.info, this.form)
          params.images = this.uploadList.toString()
          params.orderItemSn = this.$route.query.sn
          params.reason = this.reasonList.find(item => item.id == params.reason).reason
          applyAfterSale(params).then(res => {
            if (res.success) {
              Message.success('售后申请提交成功，请到售后订单查看！')
              this.$router.push({name: 'AfterSale'})
            }
          })
        }
      })
    },
    handleView (name) { // 预览图片
      this.previewImage = name;
      this.visible = true;
    },
    handleRemove (index) { // 移除图片
      this.uploadList.splice(index, 1)
      this.$forceUpdate()
    },
    handleSuccess (res, file) { // 上传成功回调
      this.uploadList.push(res.result)
      this.$forceUpdate()
    },
    handleBeforeUpload () { // 上传之前钩子函数
      const check = this.uploadList.length < 6;
      if (!check) {
        Notice.warning({
          title: '最多可以上传5张图片'
        });
        return check;
      }
    }
  },
  mounted () {
    this.accessToken.accessToken = storage.getItem('accessToken');
    this.getInfo()
  }
}
</script>
<style lang="scss" scoped>

/** 商品信息 */
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
