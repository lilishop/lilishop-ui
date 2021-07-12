<template>
  <div>
    <footer class="footer">
      <div class="clearfix"></div>
      <div class="icon-row">
        <div class="footer-icon">
          <h5 class="footer-icon-child"></h5>
          <span class="footer-icon-text">品类齐全，轻松购物</span>
        </div>
        <div class="footer-icon">
          <h5 class="footer-icon-child footer-icon-child-2"></h5>
          <span class="footer-icon-text">多仓直发，极速配送</span>
        </div>
        <div class="footer-icon">
          <h5 class="footer-icon-child footer-icon-child-3"></h5>
          <span class="footer-icon-text">正品行货，精致服务</span>
        </div>
        <div class="footer-icon">
          <h5 class="footer-icon-child footer-icon-child-4"></h5>
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
        <div class="friend-link">
          <div class="friend-link-item">
            <ul>
              <li v-for="(link, index) in moreLink" :key="index" @click="goArticle">
                <span class="link-item" :class="{'link-last-item': index === 4}">{{link}}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="clearfix"></div>
        <div class="copyright">
          <p>Copyright © {{year}} LILI</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      guideArr: [ // 导航链接
        [ '购物指南', '购物流程', '会员介绍', '生活旅行', '常见问题', '大家电', '联系客服' ],
        [ '配送方式', '上门自提', '211限时达', '配送服务查询', '收取标准', '海外配送' ],
        [ '支付方式', '货到付款', '在线支付', '分期付款', '邮局汇款', '公司转账' ],
        [ '售后服务', '售后政策', '价格保护', '退款说明', '返修/退换货', '取消订单' ]
      ],
      moreLink: ['关于我们', '联系我们', '联系客服', '商家帮助', '隐私政策'], // 更多链接
      year: new Date().getFullYear() // 当前年份
    };
  },
  methods: {
    goArticle () { // 跳转文章页
      let routeUrl = this.$router.resolve({
        path: '/article'
      })
      window.open(routeUrl.href, '_blank')
    }
  }
};
</script>

<style scoped lang="scss">
/*****************************底 部 开 始*****************************/
.footer {
  width: 100%;
  height: 450px;
  padding-top: 30px;

  @include background_color($light_background_color);

}
.icon-row {
  margin: 15px auto;
  padding-top: 8px;
  width: 1000px;
  height: 64px;
}
.footer-icon {
  margin-left: 17px;
  margin-right: 17px;
  float: left;
}
.footer-icon-child {
  margin-top: 10px;
  overflow: hidden;
  position: absolute;
  width: 36px;
  height: 42px;
  background-image: url("../../assets/images/footer/ico_service.png");
  text-indent: -999px;
}
.footer-icon-child-2 {
  background-position: 0 -43px;
}
.footer-icon-child-3 {
  background-position: 0 -86px;
}
.footer-icon-child-4 {
  background-position: 0 -129px;
}
 .footer-icon-text{
  margin-left: 45px;
  font-size: 18px;
  font-weight: bold;
  line-height: 64px;
}
.service-intro {
  width: 100%;
  border-top: 1px solid $border_color;
}
.servece-type {
  margin: 15px auto;
  height: 200px;
  width: 800px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.servece-type-info ul {
  list-style: none;
}
.servece-type-info li {
  font-size: 14px;
  cursor: pointer;
  line-height: 26px;
}
.servece-type-info li:first-child {
  font-size: 16px;
  line-height: 28px;
  font-weight: bold;
}

.friend-link {
  display: flex;
  align-items: center;
  width: 908px;
  height: 30px;
  margin: 0px auto;
  border-top: 1px solid $border_color;
}
.friend-link-item {
  margin: 0px auto;
}
.friend-link-item ul {
  list-style: none;
}
.friend-link-item li {
  padding: 5px 0px;
  float: left;
}
.link-item {
  padding: 0px 8px;
  cursor: pointer;
  border-right: 1px solid $border_color;
}
.link-last-item {
  border: none;
}
.copyright {
  width: 100%;
  line-height: 30px;
  text-align: center;
}
.copyright a{
  color: #232323;
  font-size: 20px;
}
.footer-icon-text{
  @include title_color($light_title_color)
}
.copyright,.friend-link,.servece-type-info {
  @include sub_color($light_sub_color)
}
/*****************************底 部 结 束*****************************/
</style>
