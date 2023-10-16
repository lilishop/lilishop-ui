<template>
  <div class="wrapper">
    <card _Title="我的分销"/>
    <!-- 分销申请 -->

    <div v-if="status === 0">
      <Alert type="warning">分销商申请</Alert>
      <Form ref="form" :model="applyForm" :rules="rules">
        <FormItem label="姓名" prop="name">
          <Input v-model="applyForm.name"></Input>
        </FormItem>
        <FormItem label="身份证号" prop="idNumber">
          <Input v-model="applyForm.idNumber"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" :loading="applyLoading" @click="apply">提交申请</Button>
        </FormItem>
      </Form>
    </div>
    <!-- 分销审核 -->
    <div v-if="status === 1">
      <Alert type="success">
        您提交的信息正在审核
        <template slot="desc"
        >提交认证申请后，工作人员将在三个工作日进行核对完成审核
        </template
        >
      </Alert>
    </div>
    <!-- 分销提现、商品、订单 -->
    <div v-if="status === 2">
      <div class="tips">
        <p>分销下线付款之后会生成分销订单。</p>
        <p>交易完成后返佣可提现。</p>
      </div>

      <div class="box">
        <div class="mb_20 account-price">
          <span class="subTips">可提现金额(元)：</span>
          <span class="fontsize_48 global_color">{{ result.canRebate | unitPrice }}</span>
          <span class="subTips">待结算：</span>
          <span class="">{{ result.commissionFrozen | unitPrice }}</span>
          <span class="subTips">总收益(元)：</span>
          <span class="">{{ result.rebateTotal | unitPrice }}</span>
          <Button
            type="primary"
            size="small"
            class="ml_20"
            @click="withdrawApplyModal = true">申请提现
          </Button>
        </div>
      </div>
      <Tabs :value="tabName" @on-click="tabPaneChange">
        <TabPane label="推广订单" name="order">
          <Table stripe :columns="orderColumns" :data="orderData.records">
            <template slot-scope="{ row }" slot="createTime">
              <span>{{ row.createTime }}</span>
            </template>
            <template slot-scope="{ row }" slot="goodsName">
              <span>{{ row.goodsName }}</span>
            </template>
            <template slot-scope="{ row }" slot="num">
              <span>{{ row.num }}</span>
            </template>
            <template slot-scope="{ row }" slot="rebate">
              <span>{{ row.rebate }}</span>
            </template>
            <template slot-scope="{ row }" slot="distributionOrderStatus">
              <span v-if="row.distributionOrderStatus == 'NO_COMPLETED'">未完成</span>
              <span v-else-if="row.distributionOrderStatus == 'COMPLETE'">订单完成</span>
              <span v-else-if="row.distributionOrderStatus == 'CANCEL'">订单取消</span>
              <span v-else-if="row.distributionOrderStatus == 'REFUND'">订单退款</span>
            </template>
          </Table>
          <div class="page-size">
            <Page
              :current="orderParams.pageNumber"
              :total="orderData.total"
              :page-size="orderParams.pageSize"
              @on-change="changeOrderPage"
              size="small"
              show-total
              show-elevator
            ></Page>
          </div>
        </TabPane>
        <TabPane label="推广商品" name="goods">
          <Table stripe :columns="goodsColumns" :data="goodsData.records">
            <template slot-scope="{ row }" slot="name">
              <div
                class="goods-msg"
                @click="
                  linkTo(
                    `/goodsDetail?skuId=${row.skuId}&goodsId=${row.goodsId}`
                  )
                ">
                <img
                  style="vertical-align: top"
                  :src="row.thumbnail"
                  width="60"
                  height="60"
                  alt=""/>&nbsp; {{ row.goodsName }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="price">
              <span> ￥{{ row.price | unitPrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="firstProportion">
              <span style="margin-left: 10px;"> {{ row.firstProportion }}%</span>
            </template>
            <template slot-scope="{ row }" slot="commission">
              <span> ￥{{ row.commission | unitPrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="action">
              <Button
                type="success"
                size="small"
                style="margin-right: 5px"
                @click="fenxiao(row)">邀请好友
              </Button>
            </template>
          </Table>
          <div class="page-size">
            <Page
              :current="params.pageNumber"
              :total="goodsData.total"
              :page-size="params.pageSize"
              @on-change="changePage"
              size="small"
              show-total
              show-elevator
            ></Page>
          </div>
        </TabPane>
        <TabPane label="我的客户" name="member">
          <Table stripe :columns="memberColumns" :data="memberData.records">
            <template slot-scope="{ row }" slot="nickName">
              <span>{{ row.nickName }}</span>
            </template>
            <template slot-scope="{ row }" slot="orderPrice">
              <span>{{ row.orderPrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="rebatePrice">
              <span>{{ row.rebatePrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="orderNum">
              <span>{{ row.orderNum }}</span>
            </template>
            <template slot-scope="{ row }" slot="lastLoginDate">
              <span>{{ row.lastLoginDate }}</span>
            </template>
          </Table>
          <div class="page-size">
            <Page
              :current="memberParams.pageNumber"
              :total="memberData.total"
              :page-size="memberParams.pageSize"
              @on-change="changeOrderPage"
              size="small"
              show-total
              show-elevator
            ></Page>
          </div>
        </TabPane>
        <TabPane label="提现记录" name="log">
          <Table stripe :columns="logColumns" :data="logData.records">
            <template slot-scope="{ row }" slot="sn">
              <span>{{ row.sn }}</span>
            </template>
            <template slot-scope="{ row }" slot="time">
              <span>{{ row.createTime }}</span>
            </template>
            <template slot-scope="{ row }" slot="price">
              <span
                v-if="row.distributionCashStatus == 'VIA_AUDITING'"
                style="color: green">
                ￥{{ row.price | unitPrice }}</span
              >
              <span v-else style="color: red">
                ￥{{ row.price | unitPrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="status">
              <span>
                {{
                  row.distributionCashStatus == "APPLY"
                    ? "待处理"
                    : row.distributionCashStatus == "VIA_AUDITING"
                      ? "通过"
                      : "拒绝"
                }}</span>
            </template>
          </Table>
          <div class="page-size">
            <Page
              :current="logParams.pageNumber"
              :total="logData.total"
              :page-size="logParams.pageSize"
              @on-change="changePageLog"
              size="small"
              show-total
              show-elevator
            ></Page>
          </div>
        </TabPane>
        <TabPane label="我的团队" name="group">
          <Table stripe :columns="groupColumns" :data="groupData.records">
            <template slot-scope="{ row }" slot="memberName">
              <span>{{ row.memberName }}</span>
            </template>
            <template slot-scope="{ row }" slot="distributionOrderPrice">
              <span>{{ row.distributionOrderPrice }}</span>
            </template>
            <template slot-scope="{ row }" slot="distributionOrderCount">
              <span>{{ row.distributionOrderCount }}</span>
            </template>
          </Table>
          <div class="page-size">
            <Page
              :current="groupParams.pageNumber"
              :total="groupData.total"
              :page-size="groupParams.pageSize"
              @on-change="changeOrderPage"
              size="small"
              show-total
              show-elevator
            ></Page>
          </div>
        </TabPane>
      </Tabs>
    </div>
    <!-- 未开放 -->
    <div v-if="status === 3">
      <Alert type="error">
        分销功能暂未开启
        <template slot="desc"
        >提交认证申请后，工作人员将在三个工作日进行核对完成审核
        </template
        >
      </Alert>
    </div>
    <!-- 分销资格被清退 -->
    <div v-if="status === 4">
      <Alert type="error">
        您的分销资格已被清退。请联系管理员或进行申诉

        <Button style="margin-left: 50px;" type="warning" @click="repaying">申诉</Button>
      </Alert>
    </div>
    <!-- 分销申诉审核 -->
    <div v-if="status === 5">
      <Alert type="success">
        您提交的申诉正在审核
        <template slot="desc"
        >提交认证申请后，工作人员将在三个工作日进行核对完成审核
        </template
        >
      </Alert>
    </div>
    <Modal v-model="withdrawApplyModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>提现金额</span>
      </p>
      <div>
        <Input v-model="withdrawPrice" size="large" number maxlength="9"
        ><span slot="append">元</span></Input>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" size="large" @click="withdraw">提现</Button>
      </div>
    </Modal>
    <Modal v-model="qrcodeShow" title="分销商品" width="800">
      <Alert type="warning"> 下载二维码或者复制链接分享商品</Alert>
      <div class="qrcode">
        <div style="width: 150px; height: 150px; ">
          <div class="qrcode-platform" style="margin-top: 100px">PC端</div>
          <Button style="margin-left: 40px; margin-top: 65px" type="success" @click="copyUrlLink">复制链接</Button>
        </div>
        <div style="width: 150px; height: 150px; border: 1px solid #eee">
          <vue-qr
            :text="qrcodeH5"
            :callback="qrcodeDataH5"
            :margin="0"
            colorDark="#000"
            colorLight="#fff"
            :size="150"
          ></vue-qr>
          <div class="qrcode-platform">移动应用端</div>
          <Button class="download-btn" type="success" @click="downloadQrcodeH5"
          >下载二维码
          </Button
          >
        </div>
      </div>

      <div class="mt_10" style="margin-top: 100px;">
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  distribution,
  applyDistribution,
  distCash,
  distCashHistory,
  getDistGoodsList,
  getDistOrderList,
  getDistMemberList,
  getDistGroupList
} from "@/api/distribution.js";
import {IDCard} from "@/plugins/RegExp.js";
import vueQr from "vue-qr";

export default {
  name: "Distribution",
  components: {vueQr},
  data() {
    return {
      config: require('@/config'),
      status: 0, // 申请状态，0为未申请 1 申请中 2 申请完成 3 功能暂未开启
      applyForm: {}, // 申请表单
      rules: {
        // 验证规则
        name: [{required: true, message: "请输入真实姓名"}],
        idNumber: [
          {required: true, message: "请输入身份证号"},
          {pattern: IDCard, message: "请输入正确的身份证号"},
        ],
      },
      tabName: "order", // 当前所在tab
      result: {}, // 审核结果
      applyLoading: false, // 申请加载状态
      goodsLoading: false, // 列表加载状态
      orderLoading: false, // 订单加载状态
      withdrawApplyModal: false, // 提现表单显隐
      withdrawPrice: 0, // 提现金额
      goodsData: {}, // 商品数据
      orderData:{}, //订单数据
      memberData:{}, //订单数据
      logData: {}, // 日志数据
      groupData:{},//团队数据
      orderColumns:[
        //订单表头
        {title: "下单时间", slot: "createTime", minWidth: 200},
        {title: "商品名称", slot: "goodsName", minWidth: 200},
        {title: "数量", slot: "num"},
        {title: "佣金金额", slot: "rebate"},
        {title: "状态", slot: "distributionOrderStatus"},
      ],
      memberColumns:[
        //客户列表表头
        {title: "客户昵称", slot: "nickName", minWidth: 150},
        {title: "成交额", slot: "orderPrice"},
        {title: "佣金总额", slot: "rebatePrice"},
        {title: "订单数", slot: "orderNum"},
        {title: "最近下单时间", slot: "lastLoginDate", minWidth: 150},
      ],
      goodsColumns: [
        // 商品表头
        {title: "商品名称", slot: "name", width: 400},
        {title: "商品价格", slot: "price"},
        {title: "佣金比例", slot: "firstProportion"},
        {title: "预计赚", slot: "commission"},
        {title: "操作", slot: "action", minWidth: 120},
      ],
      logColumns: [
        // 日志表头
        {title: "编号", slot: "sn"},
        {title: "申请时间", slot: "time"},
        {title: "提现金额", slot: "price"},
        {title: "提现状态", slot: "status"},
      ],
      groupColumns: [
        // 团队表头
        {title: "昵称", slot: "memberName"},
        {title: "销售额", slot: "distributionOrderPrice"},
        {title: "订单量", slot: "distributionOrderCount"},
      ],
      params: {
        // 商品请求参数
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      orderParams: {
        // 订单商品请求参数
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      memberParams: {
        // 会员请求参数
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      logParams: {
        // 日志参数
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      groupParams: {
        // 会员请求参数
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      qrcode: "", // 二维码
      qrcodeH5: "",//H5二维码
      qrcodeShow: false, // 显示二维码
      base64Img: "", // base64编码
      base64ImgH5: "", // base64H5编码
      goodsNameCurr: "", // 当前分销商品名称
    };
  },
  mounted() {
    this.distribution();
  },
  methods: {
    apply() {
      // 申请成为分销商
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.applyLoading = true;
          applyDistribution(this.form).then((res) => {
            this.applyLoading = false;
            if (res.success) {
              this.$Message.success("申请已提交，请等待管理员审核");
              this.status = 1;
            }
          });
        }
      });
    },
    withdraw() {
      // 申请提现
      distCash({price: this.withdrawPrice}).then((res) => {
        this.withdrawApplyModal = false;
        this.price = 0;
        if (res.success) {
          this.$Message.success("申请已提交，请等待审核");
          this.distribution();
          this.getLog();
        } else {
          this.$Message.error(res.message);
        }
      });
    },
    qrcodeData(data64) {
      // 二维码base64地址
      this.base64Img = data64;
    },
    qrcodeDataH5(data64) {
      // 二维码H5端base64地址
      this.base64ImgH5 = data64;
    },
    copyUrlLink(){
      navigator.clipboard.writeText(this.qrcode)
        .then(() => {
          this.$Message.success("复制成功！");
        })
        .catch(err => {
          this.$Message.error("复制失败！");
        });
    },
    downloadQrcode() {
      // 下载二维码
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = this.goodsNameCurr || "photo";
      a.href = this.base64Img; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    },
    downloadQrcodeH5() {
      // 下载H5二维码
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = this.goodsNameCurr || "photo";
      a.href = this.base64ImgH5; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    },
    tabPaneChange(tab) {
      // tab栏切换
      if (tab === "goods") {
        this.params.checked = false;
        this.getGoodsData();
      }else if (tab === "order") {
        this.orderParams.checked = false;
        this.getOrderData();
      }else if (tab === "member") {
        this.memberParams.checked = false;
        this.getMemberData();
      } else if (tab === "log") {
        this.logParams.pageNumber = 1;
        this.getLog();
      }else if (tab === "group") {
        this.groupParams.pageNumber = 1;
        this.getGroupData();
      }
    },
    changeOrderPage(val) {
      // 修改页码
      this.orderParams.pageNumber = val;
      this.getOrderData();
    },
    changeMemberPage(val) {
      // 修改页码
      this.memberParams.pageNumber = val;
      this.getMemberData();
    },
    changePage(val) {
      // 修改页码
      this.params.pageNumber = val;
      this.getGoodsData();
    },
    changePageLog(val) {
      // 修改页码 日志
      this.logParams.pageNumber = val;
      this.getLog();
    },
    fenxiao(row) {
      // 分销商品
      this.qrcode = `${this.config.PC_DOMAIN}/goodsDetail?skuId=${row.skuId}&goodsId=${row.goodsId}&distributionId=${this.result.id}`;
      this.qrcodeH5 = `${this.config.WAP_DOMAIN}/pages/product/goods?skuId=${row.skuId}&goodsId=${row.goodsId}&distributionId=${this.result.id}`;
      this.goodsNameCurr = row.goodsName;
      this.qrcodeShow = true;
    },
    getOrderData(){
      // 订单数据
      getDistOrderList(this.orderParams).then((res) => {
        if (res.success) this.orderData = res.result;
      });
    },
    getMemberData(){
      // 订单数据
      getDistMemberList(this.memberParams).then((res) => {
        if (res.success) this.memberData = res.result;
      });
    },
    getGoodsData() {
      // 商品数据
      getDistGoodsList(this.params).then((res) => {
        if (res.success) this.goodsData = res.result;
      });
    },
    getLog() {
      // 提现历史
      distCashHistory(this.logParams).then((res) => {
        if (res.success) this.logData = res.result;
      });
    },
    getGroupData() {
      // 团队列表
      getDistGroupList(this.groupParams).then((res) => {
        if (res.success) this.groupData = res.result;
      });
    },
    //申诉
    repaying() {
      applyDistribution().then((res) => {
        this.applyLoading = false;
        if (res.success) {
          this.$Message.success("申诉已提交，请等待管理员审核");
          // this.status = 1;
        }
      });
    },
    distribution() {
      // 获取分销商信息
      distribution().then((res) => {
        if (res.result) {
          this.result = res.result;
          let type = res.result.distributionStatus;
          if (type === "PASS") {
            this.status = 2;
            this.getOrderData();
          } else if (type === "REFUSE") {
            this.status = 0;
          } else if (type === "RETREAT") {
            this.status = 4;
          } else if (type === "APPEAL") {
            this.status = 5;
          } else {
            this.status = 1;
          }
        } else if (!res.data.success && res.data.code === 22000) {
          this.status = 3;
        } else {
          // 没有资格申请 先去实名认证
          this.status = 0;
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
.box {
  margin: 20px 0;
}

.page-size {
  margin: 15px 0px;
  text-align: right;
}

.account-price {
  font-weight: bold;
}

.subTips {
  margin-left: 10px;
}

.fontsize_48 {
  font-size: 48px;
}

.goods-msg {
  display: flex;
  align-items: center;
  padding: 3px;

  &:hover {
    color: $theme_color;
    cursor: pointer;
  }
}

.download-btn {
  // position: relative;
  // top: -200px;
  // left: 200px;
  margin-left: 25px;
  margin-top: 5px
}

/deep/ .ivu-alert-message {
  p {
    margin: 4px 0;
  }
}

.tips {
  background: #f7f7f7;
  padding: 16px;
  border-radius: .4em;

  > p {
    margin: 6px 0;
  }
}

.qrcode {
  display: flex;
  justify-content: space-evenly;
  padding-top: 10px

}

.qrcode-platform {
  text-align: center;
  font-size: 14px;
  margin: 5px;
}
</style>
