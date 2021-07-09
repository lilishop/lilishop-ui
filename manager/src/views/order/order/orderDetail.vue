<template>
  <div class="search">
    <div>
      <Col>
        <div >
          <Card style="height: 60px">
            <div style="">
              <Button
                v-if="allowOperation.editPrice"
                @click="modifyPrice"
                type="primary"
                >调整价格</Button
              >
              <Button
                v-if="allowOperation.editConsignee"
                @click="editAddress"
                type="primary"
                >修改收货地址</Button
              >
              <Button
                v-if="allowOperation.cancel"
                @click="orderCancel"
                type="primary"
                >订单取消</Button
              >
              <Button
                v-if="orderInfo.order.orderStatus === 'UNPAID'"
                @click="confirmPrice"
                type="success"
                >收款</Button>
              <Button @click="orderLog" type="primary"
                >订单日志</Button
              >
            </div>
          </Card>
          <Card style="height: 400px">
            <div style="width: 30%; float: left; margin-left: 20px">
              <div class="div-item">
                <div class="div-item-left">订单号：</div>
                <div class="div-item-right">{{ orderInfo.order.sn }}</div>
              </div>
              <div class="div-item">
                <div class="div-item-left">订单来源：</div>
                <div class="div-item-right">
                  {{ orderInfo.order.clientType  | clientTypeWay}}
                </div>
              </div>

              <div class="div-item">
                <div class="div-item-left">订单状态：</div>
                <div class="div-item-right">
                  {{ orderInfo.orderStatusValue }}
                </div>
              </div>

              <div class="div-item">
                <div class="div-item-left">下单时间：</div>
                <div class="div-item-right">
                  {{ orderInfo.order.createTime }}
                </div>
              </div>
            </div>
            <div style="width: 30%; float: left; margin-left: 20px">
              <div class="div-item" v-if="orderInfo.order.needReceipt == false">
                <div class="div-item-left">发票信息：</div>
                <div class="div-item-right">暂无发票信息</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票抬头：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptTitle ? orderInfo.receipt.receiptTitle : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true && orderInfo.receipt.taxpayerId">
                <div class="div-item-left">发票税号：</div>
                <div class="div-item-right">{{ orderInfo.receipt.taxpayerId ? orderInfo.receipt.taxpayerId : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票内容：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptContent ? orderInfo.receipt.receiptContent : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票金额：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptPrice ? orderInfo.receipt.receiptPrice : '暂无' | unitPrice('￥')}}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">是否开票：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptStatus == 0 ? '未开' : '已开' }}</div>
              </div>
            </div>
            <div style="width: 36%; float: left">
              <div class="div-item">
                <div class="div-item-left">收货信息：</div>
                <div class="div-item-right">
                  {{ orderInfo.order.consigneeName }}
                  {{ orderInfo.order.consigneeMobile }}
                  {{ orderInfo.order.consigneeAddressPath }}
                  {{ orderInfo.order.consigneeDetail }}
                </div>
              </div>
              <div class="div-item">
                <div class="div-item-left">支付方式：</div>
                <div class="div-item-right">
                  {{ orderInfo.paymentMethodValue }}
                </div>
              </div>

              <div class="div-item">
                <div class="div-item-left">买家留言：</div>
                <div class="div-item-right">{{ orderInfo.order.remark }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == false">
                <div class="div-item-left">发票信息：</div>
                <div class="div-item-right">暂无发票信息</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票抬头：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptTitle ? orderInfo.receipt.receiptTitle : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true && orderInfo.receipt.taxpayerId">
                <div class="div-item-left">发票税号：</div>
                <div class="div-item-right">{{ orderInfo.receipt.taxpayerId ? orderInfo.receipt.taxpayerId : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票内容：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptContent ? orderInfo.receipt.receiptContent : '暂无' }}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">发票金额：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptPrice ? orderInfo.receipt.receiptPrice : '暂无' | unitPrice('￥')}}</div>
              </div>

              <div class="div-item" v-if="orderInfo.order.needReceipt == true">
                <div class="div-item-left">是否开票：</div>
                <div class="div-item-right">{{ orderInfo.receipt.receiptStatus == 0 ? '未开' : '已开' }}</div>
              </div>

              <div class="div-item">
                <div class="div-item-left">配送方式：</div>
                <div class="div-item-right">
                  {{ orderInfo.deliveryMethodValue }}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Col>
      <Card>
        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
          sortable="custom"
        >
          <!-- 商品栏目格式化 -->
          <template slot="goodsSlot" slot-scope="{row}">
            <div style="margin-top: 5px; height: 80px; display: flex">
              <div style="">
                <img
                  :src="row.image"
                  style="height: 60px; margin-top: 1px; width: 60px"
                />
              </div>

              <div style="margin-left: 13px">
                <div class="div-zoom">
                  <a @click="linkTo(row.goodsId,row.skuId)">{{row.goodsName}}</a>
                </div>
                <span v-for="(item, key) in JSON.parse(row.specs)" :key="key">
                  <span v-show="key!='images'" style="font-size: 12px;color: #999999;">
                    {{key}} : {{item}}
                  </span>
                </span>
                <Poptip trigger="hover" style="display: block;" title="扫码在手机中查看" transfer>
                  <div slot="content">
                    <vue-qr :text="wapLinkTo(row.goodsId,row.skuId)"  :margin="0" colorDark="#000" colorLight="#fff" :size="150"></vue-qr>
                  </div>
                  <img src="../../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="">
                </Poptip>
              </div>
            </div>
          </template>
        </Table>
        <div class="goods-total">
          <ul>
            <li>
              <span class="label">商品总额：</span>
              <span class="txt"
                >{{ orderInfo.order.priceDetailDTO.goodsPrice | unitPrice('￥')  }}</span
              >
            </li>
            <li>
              <span class="label">优惠金额：</span>
              <span class="txt"> {{ orderInfo.order.discountPrice | unitPrice('￥')}} </span>
            </li>
            <li>
              <span class="label">运费：</span>
              <span class="txt">{{ orderInfo.order.freightPrice | unitPrice('￥')}}</span>
            </li>
            <li v-if="orderInfo.order.priceDetailDTO.payPoint != 0">
              <span class="label">使用积分：</span>
              <span class="txt">{{
                orderInfo.order.priceDetailDTO.payPoint
              }}</span>
            </li>

            <li>
              <span class="label">应付金额：</span>
              <span class="txt flowPrice"
                >¥{{ orderInfo.order.priceDetailDTO.flowPrice | unitPrice }}</span
              >
            </li>
          </ul>
        </div>
      </Card>
    </div>

    <Modal v-model="modal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>修改金额</span>
      </p>
      <div>
        <Form
          ref="modifyPriceForm"
          :model="modifyPriceForm"
          label-position="left"
          :label-width="100"
          :rules="modifyPriceValidate"
        >
          <FormItem label="订单金额" prop="price">
            <Input
              v-model="modifyPriceForm.price"
              size="large"
              number
              maxlength="9"
              ><span slot="append">元</span></Input
            >
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="modal = false">关闭</Button>
        <Button type="primary" @click="modifyPriceSubmit">调整</Button>
      </div>
    </Modal>
    <!-- 订单取消模态框 -->
    <Modal v-model="orderCancelModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>订单取消</span>
      </p>
      <div>
        <Form
          ref="orderCancelForm"
          :model="orderCancelForm"
          label-position="left"
          :label-width="100"
          :rules="orderCancelValidate"
        >
          <FormItem label="取消原因" prop="reason">
            <Input
              v-model="orderCancelForm.reason"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 5 }"
              placeholder="请输入取消原因"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="orderCancelModal = false">关闭</Button>
        <Button type="primary" @click="orderCancelSubmit">确认</Button>
      </div>
    </Modal>
    <!--收件地址弹出框-->
    <Modal v-model="addressModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>修改收件信息</span>
      </p>
      <div>
        <Form
          ref="addressForm"
          :model="addressForm"
          label-position="left"
          :label-width="100"
          :rules="addressRule"
        >
          <FormItem label="收件人" prop="consigneeName">
            <Input
              v-model="addressForm.consigneeName"
              size="large"
              maxlength="20"
            ></Input>
          </FormItem>
          <FormItem label="联系方式" prop="consigneeMobile">
            <Input
              v-model="addressForm.consigneeMobile"
              size="large"
              maxlength="11"
            ></Input>
          </FormItem>
          <FormItem label="地址信息" prop="consigneeAddressPath">
            <Input
              v-model="region"
              disabled
              style="width: 305px"
              v-if="showRegion == false"
            />
            <Button
              v-if="showRegion == false"
              @click="regionClick"
              :loading="submitLoading"
              type="primary"
              icon="ios-create-outline"
              style="margin-left: 8px"
              >修改
            </Button>
            <region
              style="width: 400px"
              @selected="selectedRegion"
              v-if="showRegion == true"
            />
          </FormItem>
          <FormItem label="详细地址" prop="consigneeDetail">
            <Input
              v-model="addressForm.consigneeDetail"
              size="large"
              maxlength="50"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="addressModal = false">关闭</Button>
        <Button type="primary" @click="editAddressSubmit">修改</Button>
      </div>
    </Modal>
    <!-- 订单日志 -->
    <Modal v-model="orderLogModal" width="60">
      <p slot="header">
        <span>订单日志</span>
      </p>
      <div class="order-log-div">
        <Table
          :loading="loading"
          border
          :columns="orderLogColumns"
          :data="orderInfo.orderLogs"
          ref="table"
          sortable="custom"
        ></Table>
      </div>

      <div slot="footer" style="text-align: right">
        <Button @click="handelCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import * as RegExp from "@/libs/RegExp.js";
import region from "@/views/lili-components/region";

export default {
  name: "orderList",
  components: {
    region,
  },
  data() {
    return {
      submitLoading: false, // 添加或编辑提交状态
      region: [], //地区
      regionId: [], //地区id
      showRegion: false, // 显示地区
      orderLogInfo: [], //订单日志数据
      orderLogModal: false, //弹出调整价格框
      checkedLogistics: [], //选中的物流公司集合
      allowOperation: {}, //订单可才做选项
      sn: "", //订单编号
      orderInfo: {
        order: {
          priceDetailDTO: {},
        },
      },
      modal: false, //弹出调整价格框
      searchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 100, // 页面大小
        orderSn: "", //订单sn
      },
      //调整价格表单
      modifyPriceForm: {
        price: 0,
      },
      //订单取消表单
      orderCancelForm: {
        reason: "",
      },
      //弹出订单取消框
      orderCancelModal: false,
      //订单发货
      orderDeliveryForm: {
        logisticsNo: "", //发货单号
        logisticsId: "", //物流公司
      },
      //验证要调整的订单金额
      modifyPriceValidate: {
        reason: [
          { required: true, message: "请输入大于0小于99999的合法金额" },
          {
            pattern: /^[1-9]\d{0,3}(\.\d{1,2})?$/,
            message: "请输入大于0小于9999的合法金额",
            trigger: "change",
          },
        ],
      },

      //验证取消订单原因
      orderCancelValidate: {
        reason: [
          { required: true, message: "取消原因不能为空", trigger: "blur" },
        ],
      },
      addressModal: false, //弹出修改收件信息框
      //收件地址表单
      addressForm: {
        consigneeName: "",
        consigneeMobile: "",
        consigneeDetail: "",
        consigneeAddressPath: "",
        consigneeAddressIdPath: "",
      },
      orderDeliverFormValidate: {
        logisticsNo: [
          { required: true, message: "发货单号不能为空", trigger: "change" },
        ],
        logisticsId: [
          { required: true, message: "请选择物流公司", trigger: "blur" },
        ],
      },
      addressRule: {
        consigneeName: [
          { required: true, message: "收货人姓名不能为空", trigger: "blur" },
        ],
        consigneeMobile: [
          { required: true, message: "联系方式不能为空", trigger: "blur" },
          {
            pattern: RegExp.mobile,
            trigger: "blur",
            message: "请输入正确的手机号",
          },
        ],
        consigneeDetail: [
          { required: true, message: "详细地址不能为空", trigger: "blur" },
        ],
      },

      columns: [
        {
          title: "商品",
          key: "goodsName",
          minWidth: 200,
          slot: "goodsSlot",
        },
        {
          title: "优惠",
          key: "num",
          minWidth: 100,
          render: (h, params) => {
            let resultText = "";
            if (params.row.promotionType) {
              let type = params.row.promotionType.split(",");
              if (type.indexOf("PINTUAN") != -1) {
                resultText += "拼团 ";
              }
              if (type.indexOf("SECKILL") != -1) {
                resultText += "秒杀 ";
              }
              if (type.indexOf("COUPON") != -1) {
                resultText += "优惠券 ";
              }
              if (type.indexOf("FULL_DISCOUNT") != -1) {
                resultText += "满减 ";
              }
              if (type.indexOf("POINTS_GOODS") != -1) {
                resultText += "积分商品 ";
              }
            }
            if (resultText === "") {
              resultText = "暂无未参与任何促销";
            }
            return h("div", resultText);
          },
        },
        {
          title: "单价",
          key: "goodsPrice",
          minWidth: 100,
          render: (h, params) => {
            if (!params.row.goodsPrice) {
              return h("div", this.$options.filters.unitPrice(0, "￥"));
            }
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.goodsPrice, "￥")
            );
          },
        },

        {
          title: "数量",
          key: "num",
          minWidth: 80,
        },
        {
          title: "小计",
          key: "flowPrice",
          minWidth: 100,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.flowPrice, "￥")
            );
          },
        },
      ],
      data: [], // 表单数据
      orderLogColumns: [
        {
          title: "操作者",
          key: "operatorName",
          minWidth: 120,
        },
        {
          title: "操作类型",
          key: "operatorType",
          minWidth: 100,
        },
        {
          title: "时间",
          key: "createTime",
          width: 180
        },
        {
          title: "日志",
          key: "message",
          tooltip: true,
          minWidth: 200,

        },
      ],
    };
  },
  watch: {
    $route(to, from) {
      this.$router.go(0);
    },
  },
  methods: {
    //修改地址
    regionClick() {
      this.showRegion = true;
      this.regionId = "";
    },
    //确认收款
    confirmPrice() {
      this.$Modal.confirm({
        title: "提示",
        content:
          "<p>您确定要收款吗？线下收款涉及库存变更，需异步进行，等待约一分钟刷新列表查看</p>",
        onOk: () => {
          API_Order.orderPay(this.sn).then((res) => {
            if (res.success) {
              this.$Message.success("收款成功");
              this.getDataList();
            } else {
              this.$Message.error(res.message);
            }
          });
        },
      });
    },
    // 获取订单详情
    getDataList() {
      this.loading = true;
      API_Order.orderDetail(this.sn).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderInfo = res.result;
          this.allowOperation = res.result.allowOperationVO;
          this.data = res.result.orderItems;
        }
      });
    },
    modifyPrice() {
      //默认要修改的金额为订单总金额
      this.modifyPriceForm.price = this.orderInfo.order.flowPrice;
      this.modal = true;
    },
    //修改订单金额提交
    modifyPriceSubmit() {
      this.$refs.modifyPriceForm.validate((valid) => {
        if (valid) {
          API_Order.updateOrderPrice(this.sn, this.modifyPriceForm).then(
            (res) => {
              if (res.success) {
                this.$Message.success("修改订单金额成功");
                this.modal = false;
                this.getDataList();
              }
            }
          );
        }
      });
    },
    // 选中的地址
    selectedRegion(val) {
      this.region = val[1];
      this.regionId = val[0];
    },
    //订单取消
    orderCancel() {
      this.orderCancelModal = true;
    },
    //订单取消提交
    orderCancelSubmit() {
      this.$refs.orderCancelForm.validate((valid) => {
        if (valid) {
          API_Order.orderCancel(this.sn, this.orderCancelForm).then((res) => {
            if (res.success) {
              this.$Message.success("取消成功");
              this.getDataList();
            }
            this.orderCancelModal = false;
          });
        }
      });
    },
    //订单日志
    orderLog() {
      this.orderLogModal = true;
    },
    //订单日志取消
    handelCancel() {
      this.orderLogModal = false;
    },
    //弹出修改收货地址框
    editAddress() {
      this.addressModal = true;
      this.showRegion = false;
      this.region = this.orderInfo.order.consigneeAddressPath;
      this.regionId = this.orderInfo.order.consigneeAddressIdPath;
      this.addressForm.consigneeName = this.orderInfo.order.consigneeName;
      this.addressForm.consigneeMobile = this.orderInfo.order.consigneeMobile;
      this.addressForm.consigneeDetail = this.orderInfo.order.consigneeDetail;
      this.addressForm.consigneeAddressPath = this.orderInfo.order.consigneeAddressPath;
      this.addressForm.consigneeAddressIdPath = this.orderInfo.order.consigneeAddressIdPath;
    },
    //修改收货地址
    editAddressSubmit() {
      if (this.regionId == "") {
        this.$Message.error("请选择地址");
        return;
      }
      this.addressForm.consigneeAddressPath = this.region;
      this.addressForm.consigneeAddressIdPath = this.regionId;
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          API_Order.editOrderConsignee(this.sn, this.addressForm).then(
            (res) => {
              if (res.success) {
                this.$Message.success("收货地址修改成功");
                this.addressModal = false;
                this.getDataList();
              }
            }
          );
        }
      });
    },
  },
  mounted() {
    this.sn = this.$route.query.sn;
    this.getDataList();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
// @import "@/styles/table-common.scss";
.order-log-div {
  line-height: 30px;
  height: 500px;
  overflow-y: scroll;
}

.flex-card {
  display: flex;
  height: 600px;
}

.card-item {
  margin: 5px 0;
}

.flex-card-left {
  flex: 4;
  //background: #f8f8f8;
}

.flex-card-right {
  flex: 6;
}

.search {
  .operation {
    margin-bottom: 2vh;
  }

  .select-count {
    font-weight: 600;
    color: #40a9ff;
  }

  .select-clear {
    margin-left: 10px;
  }

  .div-item {
    line-height: 35px;
    display: flex;

    > .div-item-left {
      width: 80px;
    }

    > .div-item-right {
      flex: 1;
      word-break: break-all;
    }
  }

  .div-status-right {
    margin-top: 20px;
    margin-left: 30px;
    font-size: 20px;
  }

  .page {
    margin-top: 2vh;
  }

  button {
    margin-left: 5px;
  }

  .goods-total {
    padding: 20px;
    height: 150px;
    width: 100%;
    ul {
      margin-right: 10px;
      display: block;
      float: right;
      list-style-type: none;
      li {
        text-align: -webkit-match-parent;
      }
    }
    .label {
      float: left;
      width: 500px;
      text-align: right;
    }
    .txt {
      float: left;
      width: 130px;
      text-align: right;
      font-family: verdana;
    }
    .flowPrice {
      color: #cc0000;
      font-size: 22px;
    }
  }
}
</style>
