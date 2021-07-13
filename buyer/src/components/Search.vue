<template>
  <div>
    <div class="container">
      <img
        :src="logoImg"
        v-if="showLogo"
        class="logo-img"
        alt=""
        @click="$router.push('/')"
      />
      <i-input
        v-model="searchData"
        size="large"
        class="search"
        placeholder="输入你想查找的商品"
        @keyup.enter.native="search"
      >
        <Button v-if="!store"  slot="append" @click="search">搜索</Button>
      </i-input>
      <div v-if="store" class="btn-div">
        <Button class="store-search" type="warning" @click="searchStore">搜本店</Button>
        <Button class="store-search" type="primary" @click="search">搜全站</Button>
      </div>
      <template v-if="showTag">
        <div style="height:12px" v-if="promotionTags.length === 0"></div>
        <div v-else>
          <Tag
            v-for="(item, index) in promotionTags"
            :key="index"
          >
            <span class="hover-color" @click="selectTags(item)">{{ item }}</span>
          </Tag>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {getLogo} from '@/api/common.js'
import {hotWords} from '@/api/goods.js'
export default {
  name: 'search',
  props: {
    showTag: { // 是否展示搜索栏下方热门搜索
      type: Boolean,
      default: true
    },
    showLogo: { // 是否展示左侧logo
      type: Boolean,
      default: true
    },
    store: { // 是否为店铺页面
      type: Boolean,
      default: false
    },
    hover: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      searchData: '', // 搜索内容
      logoImg: '', // pc端展示logo
      promotionTags: [] // 热门搜索列表
    };
  },
  methods: {
    selectTags (item) { // 选择热门标签
      this.searchData = item;
      this.search();
    },
    search () { // 全平台搜索商品
      this.$router.push({
        path: '/goodsList',
        query: { keyword: this.searchData }
      });
    },
    searchStore () { // 店铺搜索商品
      this.$emit('search', this.searchData)
    }
  },
  mounted () {
    if (!this.Cookies.getItem('logo')) {
      getLogo().then(res => {
        if (res.success) {
          let logoObj = JSON.parse(res.result.settingValue)
          this.Cookies.setItem('logo', logoObj.buyerSideLogo)
          this.logoImg = logoObj.buyerSideLogo
        }
      })
    } else {
      this.logoImg = this.Cookies.getItem('logo')
    }

    this.searchData = this.$route.query.keyword

    if (!this.hover) { // 首页顶部固定搜索栏不调用热词接口
      hotWords({start: 1, end: 5}).then(res => {
        if (res.success) this.promotionTags = res.result
      })
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  margin: 30px auto;
  width: 460px;
  position: relative;
}
.search {
  margin: 10px 0px 5px 0;
  /deep/ .ivu-input.ivu-input-large {
    border: 2px solid $theme_color;
    font-size: 12px;
    height: 34px;
    &:focus {
      box-shadow: none;
    }
  }
  /deep/ .ivu-input-group-append {
    border: 1px solid $theme_color;
    border-left: none;
    height: 30px;
    background-color: $theme_color;
    color: #ffffff;
    button {
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
    }
  }
}
.logo-img {
  position: absolute;
  left: -360px;
  top: -9px;
  width: 150px;
  cursor: pointer;
}
.store-search{
  padding: 0 9px;
  border-radius: 0;
  &:nth-child(2){
    margin-left: -5px;
  }
}
.btn-div{
  position: relative;
  height: 0px;
  top: -38px;
  left: 336px;
}
</style>
