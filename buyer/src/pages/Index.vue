<template>
  <div class="container">
    <drawer></drawer>
    <!-- 固定头部 -->
    <hover-search class="hover-search" :class="{show: topSearchShow}"></hover-search>

    <!-- 顶部广告 -->
    <FixedTopPage :data="topAdvert"></FixedTopPage>
    <!-- 头部 包括登录，我的订单等 -->
    <BaseHeader></BaseHeader>
    <!-- 搜索框、logo -->
    <Search></Search>
    <!-- 商品分类 -->
    <cateNav :showAlways="true" v-if="showNav"></cateNav>
    <!-- 楼层装修部分 -->
    <model-form ref="modelForm" :data="modelForm"></model-form>
    <!-- 底部栏 -->
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import Search from '@/components/Search';
import ModelForm from '@/components/indexDecorate/modelForm';
import HoverSearch from '@/components/header/hoverSearch';
import storage from '@/plugins/storage';
import { indexData } from '@/api/index.js';
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
  },
  data () {
    return {
      modelForm: { list: [] }, // 楼层装修数据
      topAdvert: {}, // 顶部广告
      showNav: false, // 是否展示分类栏
      topSearchShow: false // 滚动后顶部搜索栏展示
    };
  },
  methods: {
    getIndexData () {
      // 获取首页装修数据
      indexData({ clientType: 'PC' }).then((res) => {
        if (res.success) {
          let dataJson = JSON.parse(res.result.pageData);
          this.modelForm = dataJson;
          storage.setItem('navList', dataJson.list[1])
          this.showNav = true
          this.topAdvert = dataJson.list[0];
        }
      });
    }
  },
  components: {
    Search,
    ModelForm,
    HoverSearch
  }
};
</script>

<style scoped lang="scss">
.container {
  @include sub_background_color($light_background_color);
}
/** 商品分类 */
.nav-con {
  width: 1200px;
  height: 40px;
  background: #eee;
  margin: 0 auto;
  display: flex;
  .all-categories {
    width: 200px;
    line-height: 40px;
    color: #fff;
    background-color: $theme_color;
    text-align: center;
    font-size: 16px;
  }
  .nav-item {
    width: 1000px;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    list-style: none;
    background-color: #eee;
    display: flex;
    li {
      width: 50px;
      font-size: 16px;
      font-weight: bold;
      margin-left: 15px;
      color: rgb(89, 88, 88);
      font-size: 15px;
      &:hover {
        color: $theme_color;
      }
    }
  }
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
  z-index: 3000;
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
</style>
