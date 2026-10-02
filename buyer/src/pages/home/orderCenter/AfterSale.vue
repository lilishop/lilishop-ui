<template>
  <div class="wrapper">
    <UserCenterLayout
      :tabs="changeWay.map((item) => item.name)"
      :active-tab="activeTab"
      @tab-change="change"
    >
      <template #extra>
        <div class="order-search">
          <el-input
            v-model="params.keywords"
            size="large"
            @keyup.enter="getList"
            placeholder="输入订单号搜索"
          />
          <el-button type="primary" @click="getList">搜索</el-button>
        </div>
      </template>
    <!-- 列表 -->
    <empty v-if="orderList.length === 0"/>
    <div class="order-content" v-else>
      <div class="order-cols">
        <span>订单详情</span>
        <span>金额</span>
        <span>操作</span>
      </div>
      <div
        class="order-list"
        v-for="(order, orderIndex) in orderList"
        :key="order.sn || orderIndex"
      >
        <div class="order-header">
          <div class="order-sn">
            {{ order.createTime }}<span>售后单号 {{ order.sn }}</span><span class="order-store" @click="shopPage(order.storeId)">{{ order.storeName }}</span>
          </div>
          <div class="order-status">{{ filterOrderStatus(order.serviceStatus) }}</div>
        </div>
        <div class="order-body">
          <div class="col-detail">
            <div class="goods-item">
              <div class="goods-thumb">
                <img
                  @click="goodsDetail(order.skuId, order.goodsId)"
                  class="hover-color"
                  :src="order.goodsImage"
                  alt=""
                  @error="$event.target.style.visibility = 'hidden'"
                />
              </div>
              <div class="goods-info">
                <div class="goods-name hover-color" @click="goodsDetail(order.skuId, order.goodsId)">{{ order.goodsName }}</div>
                <div class="goods-num">共{{ order.num }}件</div>
              </div>
            </div>
          </div>
          <div class="col-amount">
            <div class="order-amount">{{ $filters.unitPrice(order.applyRefundPrice, "￥") }}</div>
          </div>
          <div class="col-ops">
            <button
              v-if="order.serviceStatus == 'PASS' && order.serviceType != 'RETURN_MONEY'"
              type="button"
              class="op-btn"
              @click="openModal(order)"
            >提交物流</button>
            <button type="button" class="text-link" @click="goDetail(order.sn)">售后详情</button>
            <button
              v-if="order.afterSaleAllowOperationVO && order.afterSaleAllowOperationVO.cancel"
              type="button"
              class="text-link"
              @click="cancel(order.sn)"
            >取消售后</button>
          </div>
        </div>
      </div>
      <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
    </div>
    <!-- 分页 -->
    <div class="page-size">
      <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
        :total="total" :page-sizes="[20, 50, 100]" @current-change="changePageNum"
            @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
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
        pageSize: 20,
        keywords: '',
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
      submitLoading: false, // 提交加载状态
      changeWay: [
        { name: '全部', status: '' },
        { name: '申请中', status: 'APPLY' },
        { name: '通过', status: 'PASS' },
        { name: '完成售后', status: 'COMPLETE' },
      ],
      activeTab: 0,
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
      this.$router.push({
        path: '/merchant',
        query: {id: id}
      });
    },
    change(index) {
      this.activeTab = index
      this.params.pageNumber = 1
      const current = this.changeWay[index]
      if (!current || !current.status) {
        delete this.params.serviceStatus
      } else {
        this.params.serviceStatus = current.status
      }
      this.getList()
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
      return ob && ob[0] ? ob[0].name : status
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

.order-search {
  display: flex;
  align-items: center;
  width: 330px;

  :deep(.el-input) {
    flex: 1;
  }

  :deep(.el-button) {
    margin-left: 8px;
  }
}

.order-content {
  --order-cols: minmax(0, 1fr) 120px 120px;
  --order-gap: 12px;
  padding-top: 14px;
}

.page-size {
  margin: 15px 0;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}

.order-cols {
  display: grid;
  grid-template-columns: var(--order-cols);
  column-gap: var(--order-gap);
  align-items: center;
  padding: 0 16px 10px;
  color: #999;
  font-size: 13px;

  span:first-child {
    padding-left: 72px;
  }

  span:nth-child(n + 2) {
    text-align: center;
  }
}

.order-list {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  overflow: hidden;

  .order-header {
    display: grid;
    grid-template-columns: var(--order-cols);
    column-gap: var(--order-gap);
    align-items: center;
    padding: 10px 16px;
    background: #f7f7f7;
    border-bottom: 1px solid #f0f0f0;
  }

  .order-sn {
    grid-column: 1 / 3;
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 14px;
    color: #171A26;
    line-height: 1.5;

    span {
      margin-left: 16px;
    }
  }

  .order-store {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }

  .order-status {
    grid-column: 3;
    min-width: 0;
    text-align: center;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }

  .order-body {
    display: grid;
    grid-template-columns: var(--order-cols);
    column-gap: var(--order-gap);
    align-items: center;
    padding: 14px 16px;
  }

  .goods-item {
    display: grid;
    grid-template-columns: 60px minmax(0, 1fr);
    column-gap: 12px;
    align-items: start;
    width: 100%;
    min-width: 0;
  }

  .goods-thumb {
    width: 60px;
    height: 60px;
    border: 1px solid #f0f0f0;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .goods-info {
    min-width: 0;
    overflow: hidden;
  }

  .goods-name {
    max-width: 100%;
    color: #333;
    font-size: 16px;
    line-height: 22px;
    max-height: 44px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }

  .goods-num {
    margin-top: 6px;
    color: #999;
    font-size: 14px;
    line-height: 1.4;
  }

  .col-amount,
  .col-ops {
    text-align: center;
  }

  .order-amount {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }

  .col-ops {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
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
}

.modal-goods {
  display: flex;
  padding: 5px;
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
</style>
