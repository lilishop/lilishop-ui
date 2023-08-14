<template>
  <div>
    <footer class="footer">
      <div class="clearfix"></div>
      <div class="icon-row">
        <div class="footer-icon flex flex-a-c">
          <h5 class="footer-icon-child">多</h5>
          <span class="footer-icon-text">品类齐全，轻松购物</span>
        </div>
        <div class="footer-icon flex flex-a-c">
          <h5 class="footer-icon-child footer-icon-child-2">快</h5>
          <span class="footer-icon-text">多仓直发，极速配送</span>
        </div>
        <div class="footer-icon flex flex-a-c">
          <h5 class="footer-icon-child footer-icon-child-3">好</h5>
          <span class="footer-icon-text">正品行货，精致服务</span>
        </div>
        <div class="footer-icon flex flex-a-c">
          <h5 class="footer-icon-child footer-icon-child-4">省</h5>
          <span class="footer-icon-text">天天低价，畅选无忧</span>
        </div>
      </div>
      <div class="service-intro">
        <div class="servece-type">
          <div class="servece-type-info" v-for="(guide, index) in guideArr" :key="index">
            <ul>
              <li v-for="(item, index) in guide" :key="index" @click="goArticle">{{item}}</li>
            </ul>
          </div>
        </div>
        <div class="clearfix"></div>
        <div class="friend-link flex">
          <div class="friend-link-item">
            <ul>
              <li v-for="(link, index) in moreLink" :key="index" @click="goArticle">
                <span class="link-item" :class="{'link-last-item': index === 4}">{{link}}</span>
              </li>

            </ul>

          </div>

          </div>
        <div class="information footer-bottmom">
          <div class="icp">
            <li v-if="config.icpCard">
              <a :href='"https://tsm.miit.gov.cn/dxxzsp/xkz/xkzgl/resource/qiyesearch.jsp?num="+config.icpCard+"&type=xuke"' target="_blank">
                {{config.icpCard}}
              </a>
            </li>
            <li v-if="config.icpMessage" class="footer-bottmom">
              <a href="https://beian.miit.gov.cn/" target="_blank">
                {{config.icpMessage}}
              </a>
            </li>
          </div>
          <a class="flex " :href="config.company.href">
            <img class="zhizhao" src="@/assets/images/zhizhao.jpg" mode="" />{{config.company.name}}
          </a>
        </div>

        <div class="clearfix"></div>
        <div class="copyright">
          <p>Copyright © {{year}} {{config.title}}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>

export default {
  name: "Footer",
  data() {
    return {
      config:require('@/config'),
      guideArr: [
        // 导航链接
        ["购物指南", "购物流程", "会员介绍", "生活旅行", "常见问题"],
        ["配送方式", "上门自提", "配送查询", "收取标准", "物流规则"],
        ["支付方式", "在线支付", "公司转账", "余额支付", "积分支付"],
        ["售后服务", "售后政策", "退款说明", "返修/退货", "取消订单"],
      ],
      moreLink: ["关于我们", "联系我们", "联系客服", "商家帮助", "隐私政策"], // 更多链接
      year: new Date().getFullYear(), // 当前年份
    };
  },
  methods: {
    goArticle() {
      // 跳转文章页
      let routeUrl = this.$router.resolve({
        path: "/article",
      });
      window.open(routeUrl.href, "_blank");
    },
  },
};
</script>

<style scoped lang="scss">
/*****************************底 部 开 始*****************************/
.footer {
  width: 100%;
  height: 370px;
  background: #FFFFFF;
}
.icon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 1056px;
  height: 71px;
  margin: 0 auto;
}
.footer-icon {
  float: left;
}
.footer-icon-child {
  overflow: hidden;
  width: 36.4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18.2px;
  font-weight: normal;
  color: #333;
  height: 36.4px;
  border: 1.4px solid #CECECE;
  border-radius: 50%;
}

.icp {
  margin-right: 30px !important;
  >*{
    margin: 0 4px;
  }
  flex-direction: column;
}
.flex{
  display: flex;
  align-items: center;
  >img{
    margin-right: 4px;
  }
}
.footer-icon-text {
  margin-left: 11px;
  font-size: 16px;

  font-weight: normal;

  text-align: center;
}
.service-intro {
  width: 100%;
  border-top: 1px solid $border_color;
}
.servece-type {
  width: 952px;
  margin: 22px auto 10px auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

}
.servece-type-info{

}
.servece-type-info ul {
  list-style: none;
}
.servece-type-info li {
  font-size: 12px;
  cursor: pointer;
  font-weight: normal;
  line-height: 15px;
  text-align: center;
  margin-bottom: 13px;
  color: #333;
}

.servece-type-info li:first-child {
  font-size: 14.82px;
  font-weight: normal;
  line-height: 18px;

  letter-spacing: 0px;
  margin-bottom: 17px;
  color: #333333;
}

.friend-link {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 908px;
  padding: 10px 0;
  margin: 0px auto;
  border-top: 1px solid $border_color;
}
.information {
  margin-top: 23px;
  margin-bottom: 21px;
  display: flex;
  justify-content: center;

}
a{
  color: #3457FF;
}
.zhizhao {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.friend-link-item ul {
  list-style: none;
}
.friend-link-item li {
  padding: 5px 0px;
  float: left;
  margin-right: 59px;
  font-weight: normal;
  line-height: 13px;
  color: #333333;
}



.link-item {
  padding: 0px 8px;
  cursor: pointer;

}
.link-last-item {
  border: none;
}
.copyright {
  width: 100%;
  cursor: pointer;
  text-align: center;
  height:25px;
  opacity: 1;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: normal;
  line-height: 13px;

  letter-spacing: 0px;

  color: #959595;
}

.footer-icon-text {
  @include title_color($light_title_color);
}
.copyright,
.friend-link,
.servece-type-info {
  @include sub_color($light_sub_color);
}
/*****************************底 部 结 束*****************************/
</style>
