<template>
  <div>
    <el-dialog v-model="noticeFlage" :title="noticesDetail.title">
      <div v-if="noticesDetail" class="noticesDetail" v-html="noticesDetail.content"></div>
    </el-dialog>
    <div class="box flex">
      <div class="box-left">
        <div class="card shop flex">
          <div>
            <h4>Hi,<span style="margin-left: 5px">{{ userData.nickName }}</span></h4>
            <img
              class="shop-logo"
              :src="userData.storeLogo || defaultLogo"
              alt=""
            />
          </div>
          <div class="shop-box">
            <div class="box-item">
              <div>店铺名称：{{ userData.storeName || "暂无" }}</div>
            </div>
            <div class="box-item">
              <div>店铺状态：{{ userData.storeDisable == "OPEN" ? "开启中" : "关闭" }}</div>
            </div>
            <div class="box-item" @click="im()">
              <el-button type="warning" :loading="load">点击登录客服</el-button>
            </div>
          </div>

          <div class="rate-box">
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.serviceScore * 20"
                color="#fecb89"
              >
                <template #default>
                  <p class="bold">{{ userData.serviceScore }}分</p>
                </template>
              </el-progress>
              <h5>服务得分</h5>
            </div>
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.deliveryScore * 20"
                color="#a7c5eb"
              >
                <template #default>
                  <p class="bold">{{ userData.deliveryScore }}分</p>
                </template>
              </el-progress>
              <h5>交货得分</h5>
            </div>
            <div>
              <el-progress
                type="circle"
                :width="120"
                :stroke-width="5"
                :percentage="userData.descriptionScore * 20"
                color="#848ccf"
              >
                <template #default>
                  <p class="bold">{{ userData.descriptionScore }}分</p>
                </template>
              </el-progress>
              <h5>评价得分</h5>
            </div>
          </div>
        </div>
        <div class="card">
          <h4>待办事项</h4>

          <div class="detail-list">
            <div class="detail-item" @click="navigateTo('orderList')">
              <div>
                <span>{{ homeData.unPaidOrder || 0 }}</span>
                <div>待付款</div>
              </div>
              <div class="detail-title">交易前</div>
            </div>

            <div class="detail-item" @click="navigateTo('orderList')">
              <div>
                <span>{{ homeData.unDeliveredOrder || 0 }}</span>
                <div>待发货</div>
              </div>
              <div>
                <span>{{ homeData.deliveredOrder || 0 }}</span>
                <div>待收货</div>
              </div>
              <div class="detail-title">交易中</div>
            </div>
            <div class="detail-item">
              <div @click="navigateTo('returnMoneyOrder')">
                <span>{{ homeData.returnMoney || 0 }}</span>
                <div>退款</div>
              </div>
              <div @click="navigateTo('returnGoodsOrder')">
                <span>{{ homeData.returnGoods || 0 }}</span>
                <div>退货</div>
              </div>
              <div @click="navigateTo('memberComment')">
                <span>{{ homeData.memberEvaluation || 0 }}</span>
                <div>待评价</div>
              </div>
              <div class="detail-title">交易后</div>
            </div>
            <div class="detail-item" @click="navigateTo('orderComplaint')">
              <div>
                <span>{{ homeData.complaint || 0 }}</span>
                <div>待处理</div>
              </div>
              <div class="detail-title">投诉</div>
            </div>
            <div class="detail-item">
              <div @click="navigateTo('alert-goods-quantity')">
                <span>{{ homeData.alertQuantityNum || 0 }}</span>
                <div>库存预警</div>
              </div>
              <div @click="navigateTo('goods')">
                <span>{{ homeData.waitAuth || 0 }}</span>
                <div>审核中</div>
              </div>
              <div class="detail-title">商品</div>
            </div>

            <div class="detail-item">
              <div @click="navigateTo('seckill')">
                <span>{{ homeData.seckillNum || 0 }}</span>
                <div>秒杀活动</div>
              </div>
              <div @click="navigateTo('accountStatementBill')">
                <span>{{ homeData.waitPayBill || 0 }}</span>
                <div>等待对账</div>
              </div>
              <div class="detail-title">其他</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card box-right">
        <h4>平台公告</h4>
        <div>
          <div class="notice-title" v-for="(item, index) in notices" :key="index">
            <a @click="clickLinkNotices(item)">{{ item.title }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h4>统计数据</h4>
      <div class="count-list flex">
        <div class="count-item" @click="navigateTo('goods')">
          <div>
            <el-icon class="icon" :size="31"><Picture /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.goodsNum || 0 }}</div>
            <div>上架商品数量</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('orderStatistics')">
          <div>
            <el-icon class="icon" :size="31"><CreditCard /></el-icon>
          </div>
          <div>
            <div class="counts">
              {{ $filters.unitPrice(homeData.orderPrice || 0, "￥") }}
            </div>
            <div>今日订单总额</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('orderList')">
          <div>
            <el-icon class="icon" :size="31"><List /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.orderNum || 0 }}</div>
            <div>今日订单数量</div>
          </div>
        </div>
        <div class="count-item" @click="navigateTo('trafficStatistics')">
          <div>
            <el-icon class="icon" :size="31"><User /></el-icon>
          </div>
          <div>
            <div class="counts">{{ homeData.storeUV || 0 }}</div>
            <div>今日访客数量</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import defaultLogo from "@/assets/logo1.png";
import { Picture, CreditCard, List, User } from "@element-plus/icons-vue";
import { getSellerHomeData, getHomeNotice } from "@/api/index";
import { getIMDetail } from "@/api/common";
import { seeArticle } from "@/api/pages";
import Cookies from "js-cookie";
import { userMsg } from "@/api/index";

export default {
  name: "home",
  components: {
    Picture,
    CreditCard,
    List,
    User,
  },
  data() {
    return {
      defaultLogo,
      noticeFlage: false,
      homeData: {},
      userData: "",
      notices: "",
      noticesDetail: {
        title: "",
      },
      IMLink: "",
      load: false,
    };
  },
  methods: {
    navigateTo(name) {
      this.$router.push({ name });
    },
    async init() {
      const userInfo = JSON.parse(Cookies.get("userInfoSeller"));
      this.userData = userInfo;

      const res = await getHomeNotice();
      if (res.success) {
        this.notices = res.result.records;
      }
    },
    async clickLinkNotices(val) {
      const res = await seeArticle(val.id);
      if (res.success) {
        this.noticesDetail = res.result;
        this.noticeFlage = true;
      }
    },
    async im() {
      const accessToken = this.getStore("accessToken");
      this.load = true;
      await this.getIMDetailMethods();
      const userInfo = await userMsg();
      this.load = false;
      if (userInfo.success && this.IMLink) {
        window.open(`${this.IMLink}?token=` + accessToken);
      } else {
        this.$Message.error("请登录后再联系客服");
      }
    },
    async getIMDetailMethods() {
      const res = await getIMDetail();
      if (res.success) {
        this.IMLink = res.result;
      }
    },
    async getHomeData() {
      const res = await getSellerHomeData();
      if (res.success) {
        this.homeData = res.result;
      }
    },
  },
  mounted() {
    this.init();
    this.getHomeData();
  },
};
</script>

<style lang="scss" scoped>
@import "./home.scss";
.noticesDetail {
  :deep(img) {
    max-width: 100%;
    max-height: 200px;
  }
}
</style>
