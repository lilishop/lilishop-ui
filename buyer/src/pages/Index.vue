<template>
  <div class="container">
    <Modal v-model="showCpmodel" width="350">
            <template #header>
                <p style="color:black;text-align:left">
                    <!-- <Icon type="ios-information-circle"></Icon> -->
                    <span>活动优惠券</span>
                </p>
            </template>
              <template>
                  <Scroll :on-reach-bottom="handleReachBottom">
                      <Card dis-hover v-for="(item, index) in autoCoupList" :key="index" style="margin: 10px 15px">
                            <span v-if="item.couponType === 'PRICE'" class="fontsize_12 global_color" style="font-size: 15px;">￥<span class="price">{{item.price | unitPrice}}</span></span>
                            <span v-if="item.couponType === 'DISCOUNT'" class="fontsize_12 global_color" style="font-size: 15px;"><span class="price">{{item.discount}}</span>折</span>
                            <span class="describe" style="font-size: 15px;margin-left: 5px;">满{{item.consumeThreshold}}元可用</span>
                            <p style="font-size: 10px;">使用范围：{{useScope(item.scopeType, item.storeName)}}</p>
                            <p style="font-size: 10px;">有效期：{{item.endTime}}</p>
                      </Card>
                  </Scroll>
              </template>
            <template #footer>
                <Button type="error" @click="showCpmodel=false">确定</Button>
            </template>
        </Modal>

    <!-- 固定头部 -->
    <hover-search class="hover-search" :class="{show: topSearchShow}"></hover-search>
    <!-- 顶部广告 -->
    <FixedTopPage :data="topAdvert"></FixedTopPage>
    <!-- 头部 包括登录，我的订单等 -->
    <BaseHeader></BaseHeader>
    <!-- 搜索框、logo -->
    <Search></Search>
    <!-- 商品分类 -->
    <cateNav :showAlways="true" v-if="showNav" :large="carouselLarge" :opacity="carouselOpacity"></cateNav>
    <!-- 楼层装修部分 -->
    <model-form ref="modelForm" :data="modelForm"></model-form>
    <!-- 底部栏 -->
    <BaseFooter></BaseFooter>
    <!-- 侧边栏 -->
    <fixedBar class="fixed-bar" :class="{'show-fixed': topSearchShow}"></fixedBar>
  </div>
</template>

<script>
import Search from '@/components/Search';
import ModelForm from '@/components/indexDecorate/ModelForm';
import HoverSearch from '@/components/header/hoverSearch';
import fixedBar from '@/components/fixed/index';
import storage from "@/plugins/storage";
import { indexData,getAutoCoup } from '@/api/index.js';
import {seckillByDay} from '@/api/promotion'
export default {
  name: 'Index',
  mounted () {
    this.getIndexData();
    let that = this;
    window.onscroll = function () {
      let top = document.documentElement.scrollTop || document.body.scrollTop;
      if (top > 300) {
        that.topSearchShow = true;
      } else {
        that.topSearchShow = false;
      }
    };
    if(storage.getItem('userInfo')){
      this.getAutoCoup()
    }
  },
  data () {
    return {
      autoCoupList:[],
      showCpmodel:false,
      modelForm: { list: [] }, // 楼层装修数据
      topAdvert: {}, // 顶部广告
      showNav: false, // 是否展示分类栏
      topSearchShow: false, // 滚动后顶部搜索栏展示
      carouselLarge: false, // 不同轮播分类尺寸
      carouselOpacity: false // 不同轮播分类样式
    };
  },
  props:{
    pageData:{
      type:null,
      default:""
    }
  },
  // created(){

  // },
  methods: {
    // 优惠券可用范围
    useScope (type, storeName) {
      let shop = '平台';
      let goods = '全部商品'
      if (storeName !== 'platform') shop = storeName
      switch (type) {
        case 'ALL':
          goods = '全部商品'
          break;
        case 'PORTION_GOODS':
          goods = '部分商品'
          break;
        case 'PORTION_GOODS_CATEGORY':
          goods = '部分分类商品'
          break;
      }
      return `${shop}${goods}可用`
    },
    getAutoCoup(){
      let data = new Date()
      let datas = data.getDate()
      let hours = data.getHours()
      let flagCoup = storage.getItem('getTimes') //缓存
      if(flagCoup && flagCoup != undefined && flagCoup != null){  //判断当前是否有缓存
        if(Number(datas) > Number(flagCoup)){ //判断缓存是否小于当前天数
          if(Number(hours) >= 6){//超过或等于6时清楚缓存
            storage.setItem('getTimes',datas)//存储缓存
            this.getcps()
          }
        }
      }else{
        // window.localStorage.setItem('getTimes',datas)//存储缓存
        this.getcps()
      }
    },
    getcps(){
      console.log(123123)
      let data = new Date()
      let datas = data.getDate()
      getAutoCoup().then(res=>{ //调用自动发券
            if(res.success){
              this.autoCoupList.push(...res.result);
              let objs = {};
              this.autoCoupList = this.autoCoupList.reduce((cur, next) => {
                //对象去重
                if (next.id != undefined) {
                  objs[next.id]
                    ? ""
                    : (objs[next.id] = true && cur.push(next));
                }
                return cur;
              }, []);
              if(this.autoCoupList != '' && this.autoCoupList.length > 0){
                this.showCpmodel = true;
              }
              storage.setItem('getTimes',datas)//存储缓存
            }
      })
    },
    handleReachBottom(){

    } ,
    getIndexData () {
      if(this.pageData){
        this.parsePageData(JSON.stringify(this.pageData))
      }
      else{
        // 获取首页装修数据
        indexData({ clientType: 'PC' }).then(async (res) => {
          if (res.success && res.result) {
            this.parsePageData(res.result.pageData)
          }
        });
      }
    },

    async parsePageData(pageData){
      let dataJson = JSON.parse(pageData);
      // 秒杀活动不是装修的数据，需要调用接口判断是否有秒杀商品
      // 轮播图根据不同轮播，样式不同
      for (let i = 0; i < dataJson.list.length; i++) {
        let type = dataJson.list[i].type
        if (type === 'carousel2') {
          this.carouselLarge = true;
        } else if (type === 'carousel1') {
          this.carouselLarge = true
          this.carouselOpacity = true
        } else if (type === 'seckill') {
          let seckill = await this.getListByDay()
          dataJson.list[i].options.list = seckill
        }
      }
      this.modelForm = dataJson;
      storage.setItem('navList', dataJson.list[1])
      this.showNav = true
      this.topAdvert = dataJson.list[0];
    },

    async getListByDay () { // 当天秒杀活动
      const res = await seckillByDay()
      if (res.success && res.result.length) {
        return res.result
      } else {
        return []
      }
    }
  },
  components: {
    Search,
    ModelForm,
    HoverSearch,
    fixedBar
  }
};
</script>

<style scoped lang="scss">
 @import '../assets/styles/coupon.scss';
.container {
  @include sub_background_color($light_background_color);
}
</style>
<style>
.hover-search {
  width: 100%;
  height: 60px;
  transform: translateY(-200px);
  background-color: #fff;
  position: fixed;
  top: 0;
  z-index: 9999;
  box-shadow:0 0 10px 2px rgb(90 90 90 / 60%);
  transition: 0.35s;
}
.show {
  transform: translateY(0);
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  top: 0;
}
.fixed-bar{
  opacity: 0 !important;
  transform: translateY(-10px);
  transition: .35s;
  z-index: 999999;
  height: 0px !important;
  overflow: hidden;
}
.show-fixed{
  height: 354px !important;
  opacity: 1 !important;
  transform: translateY(0);
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
}


/* 2K */
@media screen and (min-width: 2561px) and (max-width: 3840px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:900px;
    top: 500px;
  }
}

/* 1080p */
@media screen and (max-width: 2560px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:300px;
    top: 500px;
  }
}



@media screen and (max-width: 2025px) {
  /* 样式 */
  .fixed-bar{
    position: fixed;
    right:150px;
    top: 300px;
  }
}

</style>
