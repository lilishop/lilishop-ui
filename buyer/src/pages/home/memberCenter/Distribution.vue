<template>
  <div class="wrapper">
    <UserCenterLayout title="我的分销" :tabs="['我的分销']">
    <!-- 分销申请 -->

    <div v-if="status === 0">
      <el-alert type="warning">分销商申请</el-alert>
      <el-form ref="form" :model="applyForm" :rules="rules">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="applyForm.name"></el-input>
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="applyForm.idNumber"></el-input>
        </el-form-item>
        <el-form-item label="银行开户行" prop="settlementBankBranchName">
          <el-input v-model="applyForm.settlementBankBranchName"></el-input>
        </el-form-item>
        <el-form-item label="银行开户名" prop="settlementBankAccountName">
          <el-input v-model="applyForm.settlementBankAccountName"></el-input>
        </el-form-item>
        <el-form-item label="银行账号" prop="settlementBankAccountNum">
          <el-input v-model="applyForm.settlementBankAccountNum"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="applyLoading" @click="apply"
          >提交申请</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 分销审核 -->
    <div v-if="status === 1">
      <el-alert
        type="success"
        title="您提交的信息正在审核"
        description="提交认证申请后，工作人员将在三个工作日进行核对完成审核"
      />
    </div>
    <!-- 分销提现、商品、订单 -->
    <div v-if="status === 2">
      <div class="tips">

        <p>分销下线付款之后会生成分销订单。</p>
        <p>
          冻结金额：用户提现金额即为冻结金额，审核通过后扣除冻结金额，审核拒绝之后冻结金额返回可提现金额。
        </p>
        <p>可提现金额：分销订单佣金T+1解冻后可变为可提现金额。</p>

      </div>

      <div class="box">
        <div class="mb_20 account-price">
          <span class="subTips">可提现金额：</span>
          <span class="fontsize_48 global_color"
          >￥{{ $filters.unitPrice(result.canRebate) }}</span>
          <span class="subTips">冻结金额：</span>
          <span class="">￥{{ $filters.unitPrice(result.commissionFrozen) }}</span>
          <span class="subTips">返利总金额：</span>
          <span class="">￥{{ $filters.unitPrice(result.rebateTotal) }}</span>
          <el-button
            type="primary"
            size="small"
            class="ml_20"
            @click="withdrawApplyModal = true"
          >申请提现</el-button
          >
        </div>
      </div>
      <el-tabs v-model="tabName" @tab-click="(tab) => tabPaneChange(tab.paneName)">
        <el-tab-pane label="已选商品" name="goodsChecked">
          <el-table stripe :data="goodsData.records || []">
            <el-table-column label="商品名称" width="400">
              <template #default="{ row }">
                <div
                  class="goods-msg"
                  @click="linkTo(`/goodsDetail?skuId=${row.skuId}&goodsId=${row.goodsId}`)"
                >
                  <img style="vertical-align: top" :src="row.thumbnail" width="60" height="60" alt="" />
                  &nbsp; {{ row.goodsName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品价格">
              <template #default="{ row }">
                <span> ￥{{ $filters.unitPrice(row.price) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="佣金">
              <template #default="{ row }">
                <span> ￥{{ $filters.unitPrice(row.commission) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120">
              <template #default="{ row }">
                <el-button type="success" size="small" style="margin-right: 5px" @click="fenxiao(row)">分销商品</el-button>
                <el-button type="danger" size="small" @click="selectGoods(row.id, false)">取消选择</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="page-size">
            <el-pagination               v-model:current-page="params.pageNumber"
              :total="goodsData.total"
              v-model:page-size="params.pageSize"
              :page-sizes="[10, 20, 50]"
              @current-change="changePage"
              @size-change="changePageSize"
             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="未选商品" name="goodsUncheck">
          <el-table stripe :data="goodsData.records || []">
            <el-table-column label="商品名称" width="400">
              <template #default="{ row }">
                <div
                  class="goods-msg"
                  @click="linkTo(`/goodsDetail?skuId=${row.skuId}&goodsId=${row.goodsId}`)"
                >
                  <img style="vertical-align: top" :src="row.thumbnail" width="60" height="60" alt="" />
                  &nbsp; {{ row.goodsName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品价格">
              <template #default="{ row }">
                <span> ￥{{ $filters.unitPrice(row.price) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="佣金">
              <template #default="{ row }">
                <span> ￥{{ $filters.unitPrice(row.commission) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" style="margin-right: 5px" @click="selectGoods(row.id, true)">选择商品</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="page-size">
            <el-pagination               v-model:current-page="params.pageNumber"
              :total="goodsData.total"
              v-model:page-size="params.pageSize"
              :page-sizes="[10, 20, 50]"
              @current-change="changePage"
              @size-change="changePageSize"
             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="提现记录" name="log">
          <el-table stripe :data="logData.records || []">
            <el-table-column prop="sn" label="编号" />
            <el-table-column prop="createTime" label="申请时间" />
            <el-table-column label="提现金额">
              <template #default="{ row }">
                <span v-if="row.distributionCashStatus == 'VIA_AUDITING'" style="color: green">
                  +￥{{ $filters.unitPrice(row.price) }}
                </span>
                <span v-else style="color: red">
                  -￥{{ $filters.unitPrice(row.price) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="提现状态">
              <template #default="{ row }">
                <span>
                  {{
                    row.distributionCashStatus == "APPLY"
                      ? "待处理"
                      : row.distributionCashStatus == "VIA_AUDITING"
                        ? "通过"
                        : "拒绝"
                  }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="page-size">
            <el-pagination               v-model:current-page="logParams.pageNumber"
              :total="logData.total"
              v-model:page-size="logParams.pageSize"
              :page-sizes="[10, 20, 50]"
              @current-change="changePageLog"
              @size-change="changePageSizeLog"
             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 未开放 -->
    <div v-if="status === 3">
      <el-alert type="danger" title="分销功能暂未开启" />
    </div>
    <!-- 分销资格被清退 -->
    <div v-if="status === 4">
      <el-alert type="danger">
        您的分销资格已被清退。请联系管理员或进行申诉

        <el-button style="margin-left: 50px;" type="warning" @click="repaying">申诉</el-button>
      </el-alert>
    </div>
    <!-- 分销申诉审核 -->
    <div v-if="status === 5">
      <el-alert
        type="success"
        title="您提交的申诉正在审核"
        description="提交认证申请后，工作人员将在三个工作日进行核对完成审核"
      />
    </div>
    <el-dialog v-model="withdrawApplyModal" width="530">
      <template #header><p>
        <el-icon><Edit /></el-icon>
        <span>提现金额</span>
      </p></template>
      <div>
        <el-input v-model="withdrawPrice" size="large" number maxlength="9"
        ><template #append><span>元</span></template></el-input
        >
      </div>
      <template #footer><div style="text-align: center">
        <el-button type="primary" size="large" @click="withdraw">提现</el-button>
      </div></template>
    </el-dialog>
    <el-dialog v-model="qrcodeShow" title="分销商品" width="800">
      <el-alert type="warning"> 下载二维码或者复制链接分享商品 </el-alert>
      <div class="qrcode">
        <div style="width: 150px; height: 150px; border: 1px solid #eee">
          <vue-qr
            :text="qrcode"
            :callback="qrcodeData"
            :margin="0"
            colorDark="#000"
            colorLight="#fff"
            :size="150"
          ></vue-qr>
          <div class="qrcode-platform">PC端</div>
          <el-button class="download-btn" type="success" @click="downloadQrcode"
          >下载二维码</el-button
          >
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
          <el-button class="download-btn" type="success" @click="downloadQrcodeH5"
          >下载二维码</el-button
          >
        </div>
      </div>

      <div class="mt_10" style="margin-top: 100px;">
        商品链接：<el-input style="width: 600px" v-model="qrcode"></el-input>
      </div></el-dialog>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import { Edit } from '@element-plus/icons-vue';
import {
  distribution,
  applyDistribution,
  distCash,
  distCashHistory,
  getDistGoodsList,
  selectDistGoods,
} from "@/api/member.js";
import { IDCard } from "@/plugins/RegExp.js";
import { checkBankno } from "@/plugins/Foundation";
import vueQr from "vue-qr";
import config from "@/config";
export default {
  name: "Distribution",
  components: { vueQr, Edit },
  data() {
    return {
      config,
      status: 0, // 申请状态，0为未申请 1 申请中 2 申请完成 3 功能暂未开启
      applyForm: {}, // 申请表单
      rules: {
        // 验证规则
        name: [{ required: true, message: "请输入真实姓名" }],
        idNumber: [
          { required: true, message: "请输入身份证号" },
          { pattern: IDCard, message: "请输入正确的身份证号" },
        ],
        settlementBankBranchName: [
          {
            required: true,
            message: "请输入银行开户行",
            // 可以单个或者同时写两个触发验证方式
            trigger: "blur",
          },
        ],
        settlementBankAccountName: [
          {
            required: true,
            message: "请输入银行开户名",
            // 可以单个或者同时写两个触发验证方式
            trigger: "blur",
          },
        ],
        //银行账号
        settlementBankAccountNum: [
          {
            required: true,
            message: "银行账号不正确",
            // 可以单个或者同时写两个触发验证方式
            trigger: "blur",
          },
        ],
      },
      tabName: "goodsChecked", // 当前所在tab
      result: {}, // 审核结果
      applyLoading: false, // 申请加载状态
      goodsLoading: false, // 列表加载状态
      withdrawApplyModal: false, // 提现表单显隐
      withdrawPrice: 0, // 提现金额
      goodsData: {}, // 商品数据
      logData: {}, // 日志数据
      params: {
        // 商品请求参数
        pageNumber: 1,
        pageSize: 10,
        checked: true,
      },
      orderParams: {
        // 订单商品请求参数
        pageNumber: 1,
        pageSize: 10,
      },
      logParams: {
        // 日志参数
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
      },
      qrcode: "", // 二维码
      qrcodeH5:"",//H5二维码
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
          applyDistribution(this.applyForm).then((res) => {
            this.applyLoading = false;
            if (res.success) {
              Message.success("申请已提交，请等待管理员审核");
              this.status = 1;
            }
          });
        }
      });
    },
    normalizeWithdrawError (message) {
      if (!message) return '提现失败，请稍后重试';
      const text = String(message);
      if (text.includes('最少提现金额为1元')) {
        return '提现金额单次最少提现金额为1元';
      }
      const colonIndex = text.indexOf(':');
      if (colonIndex > -1 && colonIndex < text.length - 1) {
        return text.slice(colonIndex + 1).trim();
      }
      return text;
    },
    withdraw() {
      const price = Number(this.withdrawPrice);
      if (!price || price < 1) {
        Message.error('提现金额单次最少提现金额为1元');
        return;
      }
      distCash({ price: this.withdrawPrice }).then((res) => {
        if (res.success) {
          this.withdrawApplyModal = false;
          this.withdrawPrice = 0;
          Message.success('申请已提交，请等待审核');
          this.distribution();
          this.getLog();
        } else {
          Message.error(this.normalizeWithdrawError(res.message));
        }
      }).catch((err) => {
        Message.error(this.normalizeWithdrawError(err?.message || err?.data?.message));
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
    downloadQrcode() {
      // 下载二维码
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = this.goodsNameCurr || "photo";
      a.href = this.base64Img; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    },
    downloadQrcodeH5(){
      // 下载H5二维码
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = this.goodsNameCurr || "photo";
      a.href = this.base64ImgH5; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    },
    tabPaneChange(tab) {
      // tab栏切换
      if (tab === "goodsChecked") {
        this.params.checked = true;
        this.params.pageNUmber = 1;
        this.getGoodsData();
      } else if (tab === "goodsUncheck") {
        this.params.checked = false;
        this.getGoodsData();
      } else if (tab === "log") {
        this.logParams.pageNumber = 1;
        this.getLog();
      }
    },
    changePage(val) {
      // 修改页码
      this.params.pageNumber = val;
      this.getGoodsData();
    },
    changePageSize(val) {
      // 修改每页条数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getGoodsData();
    },
    changePageLog(val) {
      // 修改页码 日志
      this.logParams.pageNumber = val;
      this.getLog();
    },
    changePageSizeLog(val) {
      // 修改每页条数 日志
      this.logParams.pageNumber = 1;
      this.logParams.pageSize = val;
      this.getLog();
    },
    selectGoods(id, checked) {
      // 选择商品
      let params = {
        distributionGoodsId: id,
        checked: checked,
      };
      selectDistGoods(params).then((res) => {
        if (res.success) {
          Message.success("操作成功！");
          this.getGoodsData();
        }
      });
    },
    fenxiao(row) {
      // 分销商品
      this.qrcode = `${this.config.PC_DOMAIN}/goodsDetail?skuId=${row.skuId}&goodsId=${row.goodsId}&distributionId=${this.result.id}`;
      this.qrcodeH5 = `${this.config.WAP_DOMAIN}/pages/product/goods?skuId=${row.skuId}&goodsId=${row.goodsId}&distributionId=${this.result.id}`;
      this.goodsNameCurr = row.goodsName;
      this.qrcodeShow = true;
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
    //申诉
    repaying(){
      applyDistribution().then((res) => {
        this.applyLoading = false;
        if (res.success) {
          Message.success("申诉已提交，请等待管理员审核");
          // this.status = 1;
        }
      });
    },
    distribution() {
      // 获取分销商信息
      distribution()
        .then((res) => {
          if (res?.result) {
            this.result = res.result;
            const type = res.result.distributionStatus;
            if (type === "PASS") {
              this.status = 2;
              this.getGoodsData();
            } else if (type === "REFUSE") {
              this.status = 0;
            } else if (type === "RETREAT") {
              this.status = 4;
            } else if (type === "APPEAL") {
              this.status = 5;
            } else {
              this.status = 1;
            }
          } else if (res?.code === 22000) {
            // 分销功能未开启
            this.status = 3;
          } else {
            // 没有资格申请，显示申请表单
            this.status = 0;
          }
        })
        .catch((err) => {
          if (err?.code === 22000) {
            this.status = 3;
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
  display: flex;
  justify-content: flex-end;
  margin: 15px 0px;
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
:deep(.el-alert__content) {
  p {
    margin: 4px 0;
  }
}
.tips{
  background:#f7f7f7;
  padding: 16px;
  border-radius: .4em;
  >p{
    margin: 6px 0;
  }
}
.qrcode{
  display: flex;
  justify-content: space-evenly;
  padding-top: 10px

}
.qrcode-platform{
  text-align: center;
  font-size: 14px;
  margin: 5px;
}
</style>
