<template>
  <div class="order-detail">
    <UserCenterLayout>
    <div class="order-card status-card" v-if="afterSale.sn">
      <div class="status-head">
        <div class="status-main">
          <p class="status-text">{{ afterSale.serviceName }}</p>
          <p class="status-sn">
            售后单号：{{ afterSale.sn }}
            <span>订单号：{{ afterSale.orderSn }}</span>
          </p>
        </div>
        <div class="status-side">
          <div class="operation-time">创建时间：{{ afterSale.createTime }}</div>
          <div class="status-actions" v-if="canSubmitLogistics || canCancel">
            <button v-if="canSubmitLogistics" type="button" class="op-btn" @click="openModal">提交物流</button>
            <button v-if="canCancel" type="button" class="text-link" @click="cancel(afterSale.sn)">取消售后</button>
          </div>
        </div>
      </div>
      <div class="goods-row">
        <img :src="afterSale.goodsImage" alt="" @error="$event.target.style.visibility = 'hidden'">
        <div class="goods-info">
          <div class="goods-name">{{ afterSale.goodsName }}</div>
          <div class="store-line">
            本次售后服务由<span @click="shopPage(afterSale.storeId)">{{ afterSale.storeName }}</span>为您提供
          </div>
        </div>
      </div>
    </div>
    <div class="order-card" v-if="logList.length">
      <h3>售后进程</h3>
      <el-steps
        class="progress"
        :active="logList.length - 1"
        direction="vertical"
      >
        <el-step
          :title="log.message"
          :description="logDesc(log)"
          v-for="(log, index) in logList"
          :key="index"
        ></el-step>
      </el-steps>
    </div>
    <div class="order-card">
      <h3>服务单信息</h3>
      <div class="info-list">
        <div class="info-row">
          <span class="label">退款方式</span>
          <span>{{ afterSale.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款' }}</span>
        </div>
        <div class="info-row">
          <span class="label">申请退款金额</span>
          <span>{{ $filters.unitPrice(afterSale.applyRefundPrice, '￥') }}</span>
        </div>
        <div class="info-row" v-if="afterSale.actualRefundPrice">
          <span class="label">实际退款金额</span>
          <span>{{ $filters.unitPrice(afterSale.actualRefundPrice, '￥') }}</span>
        </div>
        <template v-if="afterSale.refundWay === 'OFFLINE'">
          <div class="info-row">
            <span class="label">退款开户行</span>
            <span>{{ afterSale.bankDepositName }}</span>
          </div>
          <div class="info-row">
            <span class="label">退款开户名</span>
            <span>{{ afterSale.bankAccountName }}</span>
          </div>
          <div class="info-row">
            <span class="label">退款卡号</span>
            <span>{{ afterSale.bankAccountNumber }}</span>
          </div>
        </template>
        <div class="info-row">
          <span class="label">商品处理方式</span>
          <span>{{ afterSale.serviceType == 'RETURN_MONEY' ? '退款' : '退货' }}</span>
        </div>
        <div class="info-row">
          <span class="label">退款原因</span>
          <span>{{ afterSale.reasonName }}</span>
        </div>
        <div class="info-row">
          <span class="label">问题描述</span>
          <span>{{ afterSale.problemDesc }}</span>
        </div>
      </div>
    </div>
    <div class="order-card" v-if="afterSale.afterSaleImage">
      <h3>图片信息</h3>
      <div class="image-list">
        <img
          v-for="img in afterSale.afterSaleImage.split(',')"
          :key="img"
          :src="img"
          @click="perviewImg(img)"
          class="hover-pointer"
          alt=""
        >
      </div>
    </div>
    <el-dialog v-model="logisticsShow" width="530">
      <template #header><p>
        <span>提交物流信息</span>
      </p></template>
      <div>
        <el-form ref="form" :model="form" label-position="left" label-width="100px" :rules="rules">
          <el-form-item label="物流公司" prop="logisticsId">
            <el-select v-model="form.logisticsId" placeholder="请选择物流公司">
              <el-option v-for="item in companyList" :value="item.id" :key="item.id">{{ item.name }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="物流单号" prop="logisticsNo">
            <el-input v-model="form.logisticsNo" placeholder="请填写物流单号"></el-input>
          </el-form-item>
          <el-form-item label="发货时间" prop="mDeliverTime">
            <el-date-picker
              type="date"
              style="width:100%"
              v-model="form.mDeliverTime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择发货时间"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer><div style="text-align: right">
        <el-button @click="logisticsShow = false">关闭</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitDelivery">提交</el-button>
      </div></template>
    </el-dialog>
    </UserCenterLayout>
  </div>
</template>
<script>
import { Message, Modal } from "@/utils/message";
import { afterSaleDetail, afterSaleLog, afterSaleReason, cancelAfterSale } from '@/api/member.js';
import { afterSaleDelivery, getLogisticsCompany } from '@/api/order.js';
import { afterSaleStatusList } from '../enumeration.js'
export default {
  name: 'aftersale-detail',
  data () {
    return {
      afterSale: {}, // 售后详情数据
      logList: [], // 日志
      reasonList: [], // 售后原因列表
      afterSaleStatusList, // 售后状态列表
      companyList: [], // 物流公司列表
      logisticsShow: false, // 物流信息modal
      form: { // 物流信息数据
        afterSaleSn: '',
        logisticsId: '',
        logisticsNo: '',
        mDeliverTime: ''
      },
      rules: { // 必填校验
        logisticsId: [{ required: true, message: '请选择物流公司' }],
        logisticsNo: [{ required: true, message: '请填写物流编号' }],
        mDeliverTime: [{ required: true, message: '请选择发货时间' }]
      },
      submitLoading: false // 提交加载状态
    };
  },
  computed: {
    canSubmitLogistics () {
      return this.afterSale.serviceStatus == 'PASS' && this.afterSale.serviceType != 'RETURN_MONEY'
    },
    canCancel () {
      return this.afterSale.afterSaleAllowOperationVO && this.afterSale.afterSaleAllowOperationVO.cancel
    }
  },
  methods: {
    getDetail () { // 售后详情
      afterSaleDetail(this.$route.query.sn).then(res => {
        if (res.success) {
          this.afterSale = res.result;
          this.afterSale.serviceName = this.filterOrderStatus(this.afterSale.serviceStatus)
          // 如果是原因id，则调接口查询原因中文释义
          const pattern3 = new RegExp('[0-9]+');
          if (pattern3.test(this.afterSale.reason)) {
            this.getReason(this.afterSale.serviceType)
          } else {
            this.afterSale['reasonName'] = this.afterSale.reason
          }
        }
      })
    },
    getReason (type) { // 获取售后原因
      afterSaleReason(type).then(res => {
        if (res.success) {
          this.reasonList = res.result
          this.reasonList.forEach(e => {
            if (e.id === this.afterSale.reason) {
              this.afterSale['reasonName'] = e.reason
            }
          })
        }
      })
    },
    getLog () { // 获取售后日志
      afterSaleLog(this.$route.query.sn).then(res => {
        this.logList = (res.result || []).slice().sort((a, b) => {
          return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        })
      })
    },
    logDesc (log) {
      const operator = log.operatorName ? `操作人：${log.operatorName}` : ''
      return [operator, log.createTime].filter(Boolean).join('  ')
    },
    shopPage (id) {
      if (!id) return
      const routeUrl = this.$router.resolve({
        path: '/merchant',
        query: { id }
      })
      window.open(routeUrl.href, '_blank')
    },
    filterOrderStatus (status) { // 获取订单状态中文
      const ob = this.afterSaleStatusList.filter(e => { return e.status === status });
      if (ob.length) return ob[0].name
    },
    perviewImg (img) { // 查看图片
      window.open(img, '_blank')
    },
    cancel (sn) { // 取消售后申请
      Modal.confirm({
        title: '取消',
        content: '<p>确定取消此次售后申请吗？</p>',
        onOk: () => {
          cancelAfterSale(sn).then(res => {
            if (res.success) {
              Message.success('取消售后申请成功')
              this.getDetail()
            }
          })
        },
        onCancel: () => {}
      });
    },
    // 获取物流公司列表
    getCompany () {
      getLogisticsCompany().then(res => {
        if (res.success) {
          this.companyList = res.result
        }
      })
    },
    // 提交物流信息
    submitDelivery () {
      this.submitLoading = true
      afterSaleDelivery(this.form).then(res => {
        if (res.success) {
          this.logisticsShow = false;
          Message.success('提交成功')
          this.getDetail()
        }
        this.submitLoading = false
      }).catch(() => {
        this.submitLoading = false
      })
    },
    // 提交物流modal
    openModal () {
      this.logisticsShow = true;
      if (!this.companyList.length) {
        this.getCompany();
      }
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
        this.form.afterSaleSn = this.afterSale.sn;
      });
    }
  },
  mounted () {
    this.getDetail();
    this.getLog()
  }
};
</script>
<style lang="scss" scoped>
.order-detail {
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

  &:last-child {
    border-bottom: none;
  }
}

.status-card {
  padding-top: 8px;
}

.status-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.status-side {
  flex-shrink: 0;
  text-align: right;
}

.operation-time {
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.status-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
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
  }
}

.goods-info {
  min-width: 0;
}

.goods-name {
  color: #333;
  font-size: 16px;
  line-height: 22px;
  word-break: break-all;
}

.store-line {
  margin-top: 6px;
  color: #666;
  font-size: 14px;
  line-height: 22px;

  span {
    margin: 0 4px;
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}

.progress {
  max-width: 640px;
  margin: 4px 0 0;

  :deep(.el-step.is-vertical) {
    padding-bottom: 20px;
  }

  :deep(.el-step.is-vertical:last-child) {
    padding-bottom: 0;
  }

  :deep(.el-step__head.is-finish) {
    color: #c0c4cc;
    border-color: #c0c4cc;
  }

  :deep(.el-step__title.is-finish),
  :deep(.el-step__description.is-finish) {
    color: #909399;
    font-weight: 400;
  }

  :deep(.el-step__head.is-process) {
    color: $theme_color;
    border-color: $theme_color;
  }

  :deep(.el-step__title.is-process),
  :deep(.el-step__description.is-process) {
    color: $theme_color;
  }
}

.info-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.info-row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  min-height: 44px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  line-height: 22px;

  &:first-child {
    border-top: none;
  }

  span {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    color: #171A26;
  }

  .label {
    background: #fafafa;
    color: #666;
  }
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
  }
}

.op-btn {
  min-width: 96px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid $theme_color;
  border-radius: 4px;
  background: $theme_color;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
}

.text-link {
  border: none;
  background: none;
  padding: 0;
  color: #171A26;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}
</style>
