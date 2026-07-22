<template>
  <div class="wrapper">
    <UserCenterLayout title="我的售后" :tabs="['我的售后']">
      <template #extra>
        <el-input
          class="width_300"
          
          
          v-model="params.keywords"
          @keyup.enter="getList"
          placeholder="请输入订单号搜索"
        />
      </template>
    <!-- 列表 -->
    <empty v-if="orderList.length === 0"/>
    <div class="order-content" v-else>
      <template v-for="(order, onderIndex) in orderList" :key="order.sn || onderIndex">
        <div class="order-list">
          <div class="order-header">
            <div>
              <div v-if="order.serviceStatus">{{ filterOrderStatus(order.serviceStatus) }}</div>
              <div>
                售后单号：{{ order.sn }} &nbsp; &nbsp; &nbsp;{{ order.createTime }}
                &nbsp; &nbsp;{{ $filters.secrecyMobile( order.memberName ) }}
              </div>
            </div>
            <div>
              <span>申请退款金额：<span class="global_color">{{ $filters.unitPrice(order.applyRefundPrice, "￥") }}</span></span>
            </div>
          </div>
          <div class="order-body">
            <div class="goods-list">
              <img @click="goodsDetail(order.skuId, order.goodsId)" class="hover-color" :src="order.goodsImage" alt=""/>

              <div>
                <div class="hover-color" @click="goodsDetail(order.skuId, order.goodsId)">{{ order.goodsName }}</div>
                <div class="mt_10"> x {{ order.num }}
                </div>
              </div>
            </div>
            <div>
              <span @click="shopPage(order.storeId)">{{ order.storeName }}</span>
            </div>
            <div class="order-actions">
              <!-- 订单基础操作 -->
              <el-button
                @click="goDetail(order.sn)"
                type="warning"
                size="small"
                class="after-sale-action-btn"
              >售后详情</el-button>
              <el-button
                @click="openModal(order)"
                v-if="order.serviceStatus == 'PASS' && order.serviceType != 'RETURN_MONEY'"
                size="small"
                class="after-sale-action-btn submit-logistics-btn"
              >提交物流</el-button>
              <el-button
                @click="cancel(order.sn)"
                type="danger"
                v-if="order.afterSaleAllowOperationVO.cancel"
                size="small"
                class="after-sale-action-btn"
              >取消售后</el-button>
            </div>
          </div>
        </div>
      </template>
      <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
    </div>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
        :total="total" @current-change="changePageNum"
            @size-change="changePageSize" layout="sizes, prev, pager, next, jumper"></el-pagination>
    </div>
    </UserCenterLayout>
    <el-dialog v-model="logisticsShow" width="530">
      <template #header><p>
        <span>提交物流信息</span>
      </p></template>
      <div>
        <div class="goods-list modal-goods">
          <img @click="goodsDetail(singleOrder.skuId, singleOrder.goodsId)" class="hover-color"
               :src="singleOrder.goodsImage" alt=""/>
          <div>
            <div class="hover-color" @click="goodsDetail(singleOrder.skuId, singleOrder.goodsId)">
              {{ singleOrder.goodsName }}
            </div>
            <div class="mt_10">
              <span class="global_color"
              >{{ $filters.unitPrice(singleOrder.flowPrice, "￥") }} </span> x {{ singleOrder.num }}
            </div>
          </div>
        </div>
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
  </div>
</template>

<script>
import { Message, Modal } from "@/utils/message";
import {afterSaleList, cancelAfterSale} from '@/api/member.js';
import {afterSaleDelivery, getLogisticsCompany} from '@/api/order.js';
import {afterSaleStatusList} from '../enumeration.js'

export default {
  name: 'AfterSale',
  data() {
    return {
      orderList: [], // 订单列表
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 10,
        sn: '',
        sort: 'createTime',
        order: 'desc'
      },
      // 状态数组
      afterSaleStatusList,
      total: 0, // 订单总数
      spinShow: false, // 加载状态
      companyList: [], // 物流公司列表
      logisticsShow: false, // 物流信息modal
      singleOrder: {}, // 单独的售后信息
      form: { // 物流信息数据
        afterSaleSn: '',
        logisticsId: '',
        logisticsNo: '',
        mDeliverTime: ''
      },
      rules: { // 必填校验
        logisticsId: [{required: true, message: '请选择物流公司'}],
        logisticsNo: [{required: true, message: '请填写物流编号'}],
        mDeliverTime: [{required: true, message: '请选择发货时间'}]
      },
      submitLoading: false // 提交加载状态
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    goDetail(sn) { // 跳转售后详情
      this.$router.push({
        name: 'AfterSaleDetail',
        query: {sn}
      })
    },
    cancel(sn) { // 取消售后申请
      Modal.confirm({
        title: '取消',
        content: '确定取消此次售后申请吗？',
        onOk: () => {
          cancelAfterSale(sn).then(res => {
            if (res.success) {
              Message.success('取消售后申请成功')
              this.getList()
            }
          })
        },
        onCancel: () => {
        }
      });
    },
    goodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: '/goodsDetail',
        query: {skuId, goodsId}
      });
      window.open(routeUrl.href, '_blank');
    },
    // 跳转店铺首页
    shopPage(id) {
      let routeUrl = this.$router.resolve({
        path: '/merchant',
        query: {id: id}
      });
      window.open(routeUrl.href, '_blank');
    },
    getList() { // 获取售后列表
      this.spinShow = true;
      let params = JSON.parse(JSON.stringify(this.params))
      afterSaleList(params).then(res => {
        this.spinShow = false
        if (res.success) {
          this.orderList = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    changePageNum(val) { // 修改页码
      this.params.pageNumber = val;
      this.getList()
    },
    changePageSize(val) { // 修改页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList()
    },
    filterOrderStatus(status) { // 获取订单状态中文
      const ob = this.afterSaleStatusList.filter(e => {
        return e.status === status
      });
      return ob[0].name
    },
    // 获取物流公司列表
    getCompany() {
      getLogisticsCompany().then(res => {
        if (res.success) {
          this.companyList = res.result
        }
      })
    },
    // 提交物流信息
    submitDelivery() {
      this.$refs.form?.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        afterSaleDelivery(this.form).then(res => {
          if (res.success) {
            this.logisticsShow = false;
            Message.success('提交成功');
            this.getList();
          }
          this.submitLoading = false;
        }).catch(() => {
          this.submitLoading = false;
        });
      });
    },
    // 提交物流modal
    openModal(row) {
      this.singleOrder = row;
      this.logisticsShow = true;
      if (!this.companyList.length) {
        this.getCompany();
      }
      this.$nextTick(() => {
        this.$refs.form?.resetFields();
        this.form.afterSaleSn = row.sn;
      });
    }
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}

.box {
  overflow: hidden;
}

.page-size {
  margin: 15px 0px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/** 订单列表 */
.order-list {
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-bottom: 10px;

  &:hover {
    .del-btn {
      visibility: visible;
    }
  }

  .del-btn {
    visibility: hidden;
  }

  .order-header {
    display: flex;
    align-items: center;
    padding: 10px;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;

    > div:nth-child(1) > div:nth-child(2) {
      font-size: 12px;
      color: #999;
      margin-top: 3px;
    }
  }

  .order-body {
    display: flex;
    justify-content: space-between;
    color: #999;
    padding: 10px;

    > div:nth-child(2) {
      width: 150px;
      text-align: center;

      span {
        color: #438cde;
        cursor: pointer;

        &:hover {
          color: $theme_color;
        }
      }

      .el-icon {
        color: #ff8f23;
        cursor: pointer;

        &:hover {
          color: $theme_color;
        }
      }
    }

    .order-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 100px;

      .after-sale-action-btn {
        display: block;
        margin: 0;
        min-width: 88px;
      }

      :deep(.submit-logistics-btn) {
        background-color: #ff9900 !important;
        border-color: #ff9900 !important;
        color: #fff !important;

        &:hover,
        &:focus {
          background-color: #e68a00 !important;
          border-color: #e68a00 !important;
          color: #fff !important;
        }
      }
    }
  }
}

.goods-list {
  // width: 500px;
  display: flex;
  margin-bottom: 10px;

  img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
  }

  > div {
    flex: 1;
  }
}

.modal-goods {
  padding: 5px;
}
</style>
