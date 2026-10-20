<template>
  <div class="search">
    <el-card>
      <div class="main-content">
        <div class="div-flow-left">
          <div class="div-form-default">
            <h3>退货申请</h3>
            <dl>
              <dt>退货商品</dt>
              <dd>
                <div>
                  <img alt="商品图片" :src="afterSaleInfo.goodsImage" style="height: 60px">
                </div>
                <a @click="linkTo(afterSaleInfo.goodsId, afterSaleInfo.skuId)">{{ afterSaleInfo.goodsName }}
                </a><br>

                <span>{{ afterSaleInfo.num }}(数量)</span>

              </dd>
            </dl>
            <dl>
              <dt>售后状态</dt>
              <dd>{{ afterSaleInfo.serviceName }}</dd>
            </dl>
            <dl>
              <dt>退货退款编号</dt>
              <dd>{{ afterSaleInfo.sn }}</dd>
            </dl>
            <dl>
              <dt>退货退款原因</dt>
              <dd>{{ afterSaleInfo.reason }}</dd>
            </dl>
            <dl>
              <dt>申请退款金额</dt>
              <dd>
                <priceColorScheme :value="afterSaleInfo.applyRefundPrice" :color="$mainColor"></priceColorScheme>
              </dd>
            </dl>
            <dl v-if="afterSaleInfo.actualRefundPrice">
              <dt>实际退款金额</dt>
              <dd>
                <priceColorScheme :value="afterSaleInfo.actualRefundPrice" :color="$mainColor"></priceColorScheme>
              </dd>
            </dl>
            <dl v-if="afterSaleInfo.refundPoint">
              <dt>退还积分</dt>
              <dd>{{ afterSaleInfo.refundPoint }}</dd>
            </dl>
            <dl>
              <dt>退货数量</dt>
              <dd>{{ afterSaleInfo.num }}</dd>
            </dl>
            <dl>
              <dt>问题描述</dt>
              <dd>{{ afterSaleInfo.problemDesc }}</dd>
            </dl>
            <dl>
              <dt>凭证</dt>
              <dd v-if="afterSaleImage == ''">暂无凭证</dd>
              <dd v-else>
                <div class="div-img" v-for="(item, index) in afterSaleImage" :key="index">
                  <img alt="投诉凭证" class="complain-img" :src="item" />
                </div>
              </dd>
            </dl>
          </div>

          <div class="div-form-default" v-if="afterSaleInfo.serviceStatus == 'APPLY'">
            <h3>处理意见</h3>
            <dl>
              <dt>商家</dt>
              <dd>
                <div class="div-content">
                  {{ afterSaleInfo.storeName }}
                </div>
              </dd>
            </dl>
            <dl>
              <dt>是否同意</dt>
              <dd>
                <div class="div-content">
                  <el-radio-group v-model="params.serviceStatus">
                    <el-radio-button value="PASS">同意</el-radio-button>
                    <el-radio-button value="REFUSE">拒绝</el-radio-button>
                  </el-radio-group>
                </div>
              </dd>
            </dl>
            <dl>
              <dt>申请退款金额</dt>
              <dd>
                <priceColorScheme :value="afterSaleInfo.applyRefundPrice" :color="$mainColor"></priceColorScheme>
              </dd>
            </dl>
            <dl>
              <dt>实际退款金额</dt>
              <dd>
                <el-input-number :min="0" v-model="params.actualRefundPrice" style="width: 260px" />
              </dd>
            </dl>
            <dl>
              <dt>备注信息</dt>
              <dd>
                <el-input
                  v-model="params.remark"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  clearable
                  style="width: 260px"
                />
              </dd>
            </dl>
            <dl>
              <dd>
                <div style="text-align: right; width: 45%; margin-top: 10px">
                  <el-button
                    type="primary"
                    :loading="submitLoading"
                    @click="handleSubmit"
                    style="margin-left: 5px"
                  >
                    确定
                  </el-button>
                </div>
              </dd>
            </dl>
          </div>
          <div class="div-form-default" v-if="afterSaleInfo.serviceStatus != 'APPLY'">
            <h3>商家处理</h3>
            <dl>
              <dt>商家</dt>
              <dd>
                <div class="div-content">
                  {{ afterSaleInfo.storeName }}
                </div>
              </dd>
            </dl>
            <!-- <dl>
              <dt>审核结果</dt>
              <dd>
                <div class="div-content">
                  <span v-if="params.serviceStatus=='PASS'">
                    审核通过
                  </span>
                  <span v-else>
                    审核拒绝
                  </span>
                </div>

              </dd>
            </dl> -->
            <dl>
              <dt>备注信息</dt>
              <dd>
                {{ afterSaleInfo.auditRemark || "暂无备注信息" }}
              </dd>
            </dl>
          </div>
        </div>
        <div class="div-flow-center"></div>
        <div class="div-flow-right">
          <div class="div-form-default">
            <h3>订单相关信息</h3>
            <dl>
              <dt>订单编号</dt>
              <dd>
                {{ afterSaleInfo.orderSn }}
              </dd>
            </dl>
            <dl v-if="afterSaleInfo.bankDepositName">
              <dt>银行开户行</dt>
              <dd>
                {{ afterSaleInfo.bankDepositName }}
              </dd>
            </dl>
            <dl v-if="afterSaleInfo.bankAccountName">
              <dt>银行开户名</dt>
              <dd>
                {{ afterSaleInfo.bankAccountName }}
              </dd>
            </dl>
            <dl v-if="afterSaleInfo.bankAccountNumber">
              <dt>银行卡号</dt>
              <dd>
                {{ afterSaleInfo.bankAccountNumber }}
              </dd>
            </dl>
          </div>
          <div
            class="div-form-default"
            v-if="
              afterSaleInfo.afterSaleAllowOperationVO &&
              afterSaleInfo.afterSaleAllowOperationVO.refund
            "
          >
            <h3>平台退款</h3>
            <dl>
              <dt>银行开户行</dt>
              <dd>
                {{ afterSaleInfo.bankDepositName }}
              </dd>
            </dl>
            <dl>
              <dt>银行开户名</dt>
              <dd>
                {{ afterSaleInfo.bankAccountName }}
              </dd>
            </dl>
            <dl>
              <dt>银行卡号</dt>
              <dd>
                {{ afterSaleInfo.bankAccountNumber }}
              </dd>
            </dl>
            <dl>
              <dt>备注信息</dt>
              <dd>
                <el-input
                  v-model="refundPriceForm.remark"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  clearable
                  style="width: 260px"
                />
              </dd>
            </dl>
            <dl>
              <dt>操作</dt>
              <dd>
                <el-button
                  type="primary"
                  :loading="submitLoading"
                  @click="refundPriceSubmit"
                  style="margin-left: 5px"
                >
                  退款
                </el-button>
              </dd>
            </dl>
          </div>
          <div
            class="div-form-default"
            v-if="
              afterSaleInfo.showDelivery && afterSaleInfo.serviceType === 'RETURN_GOODS'
            "
          >
            <h3>物流信息</h3>
            <dl>
              <dt>收货商家</dt>
              <dd>{{ afterSaleInfo.storeName }}</dd>
            </dl>
            <dl>
              <dt>收货商家手机</dt>
              <dd>{{ storeMsg.salesConsigneeMobile }}</dd>
            </dl>
            <dl>
              <dt>收货地址</dt>
              <dd>
                {{ storeMsg.salesConsigneeAddressPath }}
                {{ storeMsg.salesConsigneeDetail }}
              </dd>
            </dl>
            <dl>
              <dt>物流公司</dt>
              <dd>{{ afterSaleInfo.mlogisticsName }}</dd>
            </dl>
            <dl>
              <dt>物流单号</dt>
              <dd>
                {{ afterSaleInfo.mlogisticsNo }}
              </dd>
            </dl>
            <dl>
              <dt>操作</dt>
              <dd>
                <el-button
                  type="primary"
                  plain
                  :loading="submitLoading"
                  @click="logisticsSeller()"
                  style="margin-left: 5px"
                >
                  查询物流
                </el-button>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 查询物流 -->
    <el-dialog v-model="logisticsModal" title="查询物流" width="640px" append-to-body>
      <div class="layui-layer-wrap">
        <dl>
          <dt>售后单号：</dt>
          <dd>
            <div class="text-box">{{ sn }}</div>
          </dd>
        </dl>
        <dl>
          <dt>物流公司：</dt>
          <dd>
            <div class="text-box">{{ afterSaleInfo.mlogisticsName }}</div>
          </dd>
        </dl>
        <dl>
          <dt>物流单号：</dt>
          <dd>
            <div class="text-box">{{ afterSaleInfo.mlogisticsNo }}</div>
          </dd>
        </dl>
        <div class="div-express-log">
          <ul class="express-log">
            <template v-if="Object.keys(logisticsInfo).length">
              <li v-for="(item, index) in logisticsInfo.traces" :key="index">
                <span class="time">{{ item.AcceptTime }}</span>
                <span class="detail">{{ item.AcceptStation }}</span>
              </li>
            </template>
            <template v-else>
              <li style="text-align: center">暂无物流信息</li>
            </template>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="logisticsClose">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import * as API_Order from "@/api/order";
import vueQr from "vue-qr";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "orderDetail" });

const route = useRoute();

const sn = ref(""); // 订单号
const logisticsModal = ref(false); //查询物流模态框

const logisticsInfo = ref({}); //物流信息
const afterSaleInfo = ref({}); // 售后信息
const afterSaleImage = ref([]); //会员申诉图片
const submitLoading = ref(false); // 添加或编辑提交状态
const storeMsg = ref({}); // 商家地址信息
// 原代码未在 data 声明、直接挂 this 上的字段，补声明避免 ReferenceError
let loading = false;
//商家处理意见
const params = reactive({
  serviceStatus: "PASS",
  remark: "",
});
//平台退款
const refundPriceForm = reactive({
  remark: "",
});
const afterSaleStatusList = ref([
  // 售后状态列表
  {
    name: "申请中",
    status: "APPLY",
  },
  {
    name: "通过售后",
    status: "PASS",
  },
  {
    name: "拒绝售后",
    status: "REFUSE",
  },
  {
    name: "买家退货，待卖家收货",
    status: "BUYER_RETURN",
  },
  {
    name: "卖家确认收货",
    status: "SELLER_CONFIRM",
  },
  {
    name: "卖家终止售后",
    status: "SELLER_TERMINATION",
  },
  {
    name: "买家取消售后",
    status: "BUYER_CANCEL",
  },
  {
    name: "完成售后",
    status: "COMPLETE",
  },
  {
    name: "待平台退款",
    status: "WAIT_REFUND",
  },
]);

// 获取售后详情
function getDetail() {
  loading = true;
  API_Order.getAfterSaleOrderDetail(sn.value).then((res) => {
    loading = false;
    if (res.success) {
      afterSaleInfo.value = res.result;
      afterSaleInfo.value.showDelivery = showDelivery(
        afterSaleInfo.value.serviceStatus
      );
      afterSaleInfo.value.serviceName = filterOrderStatus(
        afterSaleInfo.value.serviceStatus
      );
      afterSaleImage.value = (res.result.afterSaleImage || "").split(",");
      //退货地址去掉逗号
      if (afterSaleInfo.value.mconsigneeAddressPath)
        afterSaleInfo.value.mconsigneeAddressPath = afterSaleInfo.value.mconsigneeAddressPath.replaceAll(
          ",",
          " "
        );

      params.actualRefundPrice = afterSaleInfo.value.applyRefundPrice;
      // 如果显示物流信息，展示商家地址
      if (afterSaleInfo.value.showDelivery) {
        API_Order.storeAddress(sn.value).then((resu) => {
          if (resu.success) {
            const obj = resu.result;
            obj.salesConsigneeAddressPath = obj.salesConsigneeAddressPath.replaceAll(
              ",",
              ""
            );
            storeMsg.value = obj;
          }
        });
      }
    }
  });
}
//平台退款
function refundPriceSubmit() {
  if (refundPriceForm.remark == "") {
    ElMessage.error("请输入退款备注");
    return;
  }
  ElMessageBox.confirm("请确认退款？", "确认退款", { type: "warning" }).then(() => {
    API_Order.refundPrice(sn.value, refundPriceForm).then((res) => {
      if (res.success) {
        ElMessage.success("收款成功");
        getDetail();
      }
    });
  }).catch(() => {});
}
//查询物流
function logisticsSeller() {
  logisticsModal.value = true;
  API_Order.getAfterSaleTraces(sn.value).then((res) => {
    if (res.success && res.result != null) {
      logisticsInfo.value = res.result;
    }
  });
}
//关闭物流弹出框
function logisticsClose() {
  logisticsModal.value = false;
}
//回复
function handleSubmit() {
  if (params.remark == "") {
    ElMessage.error("请输入备注信息");
    return;
  }
  if (params.actualRefundPrice == "") {
    ElMessage.error("请输入退款金额");
    return;
  }
  API_Order.afterSaleSellerReview(sn.value, params).then((res) => {
    submitLoading.value = false;
    if (res.success) {
      ElMessage.success("审核成功");
      params.remark = "";
      getDetail();
    }
  });
}
function filterOrderStatus(status) {
  // 获取订单状态中文
  const ob = afterSaleStatusList.value.filter((e) => {
    return e.status === status;
  });
  return ob.length > 0 ? ob[0].name : status;
}
// 根据订单状态判断是否显示物流信息
function showDelivery(status) {
  let flag = false;
  afterSaleStatusList.value.forEach((e, index) => {
    // 订单为买家退货，待卖家收货之后的状态，并且不是买家取消售后，展示物流信息
    if (e.status === status && index >= 3 && index !== 6) {
      flag = true;
    }
  });
  return flag;
}

onMounted(() => {
  sn.value = route.query.sn;
  getDetail();
});
</script>
<style lang="scss">
.main-content {
  min-height: 600px;
  padding: 10px;
}

.div-flow-left {
  width: 49%;
  letter-spacing: normal;
  display: inline-block;
  border-right: solid #f5f5f5 1px;

  .div-form-default {
    width: 97%;

    h3 {
      font-weight: 600;
      line-height: 22px;
      background-color: #f5f5f5;
      padding: 6px 0 6px 12px;
      border-bottom: solid 1px #e7e7e7;
    }

    dl {
      font-size: 0;
      line-height: 30px;
      clear: both;
      padding: 0;
      margin: 0;
      border-bottom: dotted 1px #e6e6e6;
      overflow: hidden;
      display: flex;

      dt {
        flex: 2;
        vertical-align: top;
        text-align: right;
        padding: 15px 1% 15px 0;
        margin: 0;
        font-size: 12px;
      }

      dd {
        flex: 10;
        padding: 15px 0 15px 1%;
        margin: 0;
        border-left: 1px solid #f0f0f0;
        font-size: 12px;
      }
    }
  }
}

dl dt {
  width: 100px;
  text-align: right;
}

.div-express-log {
  max-height: 300px;
  border: solid 1px #e7e7e7;
  background: #fafafa;
  overflow-y: auto;
  overflow-x: auto;
}

.express-log {
  margin-right: -10px;
  margin: 5px;
  padding: 10px;
  list-style-type: none;

  .time {
    width: 30%;
    display: inline-block;
    float: left;
  }

  .detail {
    width: 60%;
    margin-left: 30px;
    display: inline-block;
  }

  li {
    line-height: 30px;
  }
}

.layui-layer-wrap {
  dl {
    border-top: solid 1px #f5f5f5;
    margin-top: -1px;
    overflow: hidden;

    dt {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 1% 8px 0;
      color: #999;
    }

    dd {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 0 8px 8px;
      border-left: solid 1px #f5f5f5;

      .text-box {
        line-height: 40px;
        color: #333;
        word-break: break-all;
      }
    }
  }
}

.div-img {
  width: 130px;
  height: 130px;
  text-align: center;
  float: left;
}

.div-flow-center {
  width: 2%;
  display: inline-block;
}

.div-flow-right {
  width: 49%;
  vertical-align: top;
  word-spacing: normal;
  display: inline-block;

  .div-form-default {
    width: 97%;

    h3 {
      font-weight: 600;
      line-height: 22px;
      background-color: #f5f5f5;
      padding: 6px 0 6px 12px;
      border-bottom: solid 1px #e7e7e7;
    }

    dl {
      font-size: 0;
      line-height: 30px;
      clear: both;
      padding: 0;
      margin: 0;
      border-bottom: dotted 1px #e6e6e6;
      overflow: hidden;
      display: flex;
      dt {
        display: inline-block;
        flex: 2;
        vertical-align: top;
        text-align: right;
        padding: 15px 1% 15px 0;
        margin: 0;
        font-size: 12px;
      }

      dd {
        display: inline-block;
        flex: 10;
        padding: 15px 0 15px 1%;
        margin: 0;
        border-left: 1px solid #f0f0f0;
        font-size: 12px;
      }
    }
  }
}

.complain-img {
  width: 120px;
  height: 120px;
  text-align: center;
}
</style>
