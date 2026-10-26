<template>
  <div class="order-detail">
    <UserCenterLayout>
    <div class="panel" v-if="afterSale.sn">
      <div class="status-head">
        <div class="status-main">
          <el-tag :type="statusTagType" effect="dark">{{ afterSale.serviceName }}</el-tag>
          <p class="status-sn">
            售后单号：{{ afterSale.sn }}
            <span>订单号：{{ afterSale.orderSn }}</span>
          </p>
        </div>
        <div class="status-side">
          <div class="operation-time">创建时间：{{ afterSale.createTime }}</div>
          <div class="status-actions" v-if="canSubmitLogistics || canCancel">
            <el-button v-if="canSubmitLogistics" type="primary" size="small" @click="openModal">提交物流</el-button>
            <el-button v-if="canCancel" link type="primary" @click="cancel(afterSale.sn)">取消售后</el-button>
          </div>
        </div>
      </div>
      <div class="goods-row">
        <img :src="afterSale.goodsImage" loading="lazy" decoding="async" alt="" @error="$event.target.style.visibility = 'hidden'">
        <div class="goods-info">
          <div class="goods-name">{{ afterSale.goodsName }}</div>
          <div class="store-line">
            本次售后服务由<span @click="shopPage(afterSale.storeId)">{{ afterSale.storeName }}</span>为您提供
          </div>
        </div>
      </div>
    </div>
    <div class="panel" v-if="logList.length">
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
    <div class="panel">
      <h3>服务单信息</h3>
      <div class="info-row">
        <span class="info-label">退款方式</span>
        <span class="info-value">{{ afterSale.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">申请退款金额</span>
        <span class="info-value">{{ $filters.unitPrice(afterSale.applyRefundPrice, '￥') }}</span>
      </div>
      <div class="info-row" v-if="afterSale.actualRefundPrice">
        <span class="info-label">实际退款金额</span>
        <span class="info-value">{{ $filters.unitPrice(afterSale.actualRefundPrice, '￥') }}</span>
      </div>
      <template v-if="afterSale.refundWay === 'OFFLINE'">
        <div class="info-row">
          <span class="info-label">退款开户行</span>
          <span class="info-value">{{ afterSale.bankDepositName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">退款开户名</span>
          <span class="info-value">{{ afterSale.bankAccountName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">退款卡号</span>
          <span class="info-value">{{ afterSale.bankAccountNumber }}</span>
        </div>
      </template>
      <div class="info-row">
        <span class="info-label">商品处理方式</span>
        <span class="info-value">{{ afterSale.serviceType == 'RETURN_MONEY' ? '退款' : '退货' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">退款原因</span>
        <span class="info-value">{{ afterSale.reasonName }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">问题描述</span>
        <span class="info-value">{{ afterSale.problemDesc }}</span>
      </div>
    </div>
    <div class="panel" v-if="afterSale.afterSaleImage">
      <h3>图片信息</h3>
      <div class="image-list">
        <img
          v-for="img in afterSale.afterSaleImage.split(',')"
          :key="img"
          :src="img"
          loading="lazy"
          decoding="async"
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
        <el-form ref="formRef" :model="form" label-position="left" label-width="100px" :rules="rules">
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
<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message, Modal } from "@/utils/message";
import { afterSaleDetail, afterSaleLog, afterSaleReason, cancelAfterSale } from '@/api/member.js';
import { afterSaleDelivery, getLogisticsCompany } from '@/api/order.js';
import { afterSaleStatusList } from '../enumeration.js'

defineOptions({ name: 'aftersale-detail' });

const route = useRoute();
const router = useRouter();

const afterSale = ref({}); // 售后详情数据
const logList = ref([]); // 日志
const reasonList = ref([]); // 售后原因列表
const companyList = ref([]); // 物流公司列表
const logisticsShow = ref(false); // 物流信息modal
const form = reactive({ // 物流信息数据
  afterSaleSn: '',
  logisticsId: '',
  logisticsNo: '',
  mDeliverTime: ''
});
const rules = { // 必填校验
  logisticsId: [{ required: true, message: '请选择物流公司' }],
  logisticsNo: [{ required: true, message: '请填写物流编号' }],
  mDeliverTime: [{ required: true, message: '请选择发货时间' }]
};
const submitLoading = ref(false); // 提交加载状态

const formRef = ref(null);

const canSubmitLogistics = computed(() => {
  return afterSale.value.serviceStatus == 'PASS' && afterSale.value.serviceType != 'RETURN_MONEY'
});
const canCancel = computed(() => {
  return afterSale.value.afterSaleAllowOperationVO && afterSale.value.afterSaleAllowOperationVO.cancel
});

const statusTagType = computed(() => {
  const map = {
    APPLY: 'warning',
    PASS: 'success',
    REFUSE: 'info',
    BUYER_RETURN: 'warning',
    SELLER_CONFIRM: 'warning',
    SELLER_TERMINATION: 'info',
    BUYER_CONFIRM: 'warning',
    BUYER_CANCEL: 'info',
    COMPLETE: 'success',
    WAIT_REFUND: 'warning'
  };
  return map[afterSale.value.serviceStatus] || 'info';
});

function getDetail () { // 售后详情
  afterSaleDetail(route.query.sn).then(res => {
    if (res.success) {
      afterSale.value = res.result;
      afterSale.value.serviceName = filterOrderStatus(afterSale.value.serviceStatus)
      // 如果是原因id，则调接口查询原因中文释义
      const pattern3 = new RegExp('[0-9]+');
      if (pattern3.test(afterSale.value.reason)) {
        getReason(afterSale.value.serviceType)
      } else {
        afterSale.value['reasonName'] = afterSale.value.reason
      }
    }
  })
}
function getReason (type) { // 获取售后原因
  afterSaleReason(type).then(res => {
    if (res.success) {
      reasonList.value = res.result
      reasonList.value.forEach(e => {
        if (e.id === afterSale.value.reason) {
          afterSale.value['reasonName'] = e.reason
        }
      })
    }
  })
}
function getLog () { // 获取售后日志
  afterSaleLog(route.query.sn).then(res => {
    logList.value = (res.result || []).slice().sort((a, b) => {
      return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    })
  })
}
function logDesc (log) {
  const operator = log.operatorName ? `操作人：${log.operatorName}` : ''
  return [operator, log.createTime].filter(Boolean).join('  ')
}
function shopPage (id) {
  if (!id) return
  router.push({
    path: '/merchant',
    query: { id }
  })
}
function filterOrderStatus (status) { // 获取订单状态中文
  const ob = afterSaleStatusList.filter(e => { return e.status === status });
  if (ob.length) return ob[0].name
}
function perviewImg (img) { // 查看图片
  window.open(img, '_blank')
}
function cancel (sn) { // 取消售后申请
  Modal.confirm({
    title: '取消',
    content: '<p>确定取消此次售后申请吗？</p>',
    onOk: () => {
      cancelAfterSale(sn).then(res => {
        if (res.success) {
          Message.success('取消售后申请成功')
          getDetail()
        }
      })
    },
    onCancel: () => {}
  });
}
// 获取物流公司列表
function getCompany () {
  getLogisticsCompany().then(res => {
    if (res.success) {
      companyList.value = res.result
    }
  })
}
// 提交物流信息
function submitDelivery () {
  submitLoading.value = true
  afterSaleDelivery(form).then(res => {
    if (res.success) {
      logisticsShow.value = false;
      Message.success('提交成功')
      getDetail()
    }
    submitLoading.value = false
  }).catch(() => {
    submitLoading.value = false
  })
}
// 提交物流modal
function openModal () {
  logisticsShow.value = true;
  if (!companyList.value.length) {
    getCompany();
  }
  nextTick(() => {
    formRef.value?.resetFields();
    form.afterSaleSn = afterSale.value.sn;
  });
}

onMounted(() => {
  getDetail();
  getLog()
});
</script>
<style lang="scss" scoped>
.order-detail {
  color: #333;
}

.panel {
  margin-top: 16px;
  padding: 16px 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;

  h3 {
    margin: 0 0 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    line-height: 24px;
  }
}

.status-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.status-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-sn {
  margin: 0;
  color: #999;
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
  color: #999;
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
    color: #333;
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

.info-row {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  line-height: 22px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 4px;
  }
}

.info-label {
  flex: 0 0 96px;
  color: #999;
}

.info-value {
  flex: 1;
  min-width: 0;
  color: #333;
  word-break: break-all;
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
</style>
