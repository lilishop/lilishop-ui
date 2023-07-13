<template>
  <div class="navbar" :class="{'small-search-box':useClass == 'fixed-show'}">
    <div class="container width_1200_auto flex flex-a-c">
      <img
        :src="$store.state.logoImg"
        v-if="showLogo"
        class="logo-img"
        alt=""
        @click="$router.push('/')"
      />
      <div :class="{'small-search-box':useClass == 'fixed-show'}" class="search-box">
        <i-input
          v-model="searchData"
          size="large"
          class="search "
          placeholder="输入你想查找的商品"
          @keyup.enter.native="search"
        >

          <div class="search-icon" slot="append" @click="search">
            <Icon type="ios-search" size="21"/>
          </div>
        </i-input>
        <template v-if="showTag">
          <div class="only-store" v-if="storeId" @click="research()">
            切换为{{!onlyStore ? '店铺内' : '平台'}}搜索

          </div>
          <div v-if="promotionTags.length === 0"></div>
          <div v-else class="history-list flex">
            <div
              v-for="(item, index) in promotionTags"
              :key="index"
              class="mr_10"
            >
              <span class="history-item" @click="selectTags(item)">{{ item }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import storage from '@/plugins/storage.js'
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
    storeId: { // 是否为店铺页面
      type: String,
      default: ""
    },
    hover: {
      type: Boolean,
      default: false
    },
    useClass:{
      type:null,
      default:''
    }
  },
  watch:{
    storeId(val){
      this.onlyStore = val ? true : false
    }
  },
  data() {
    return {
      searchData: '', // 搜索内容
      onlyStore:false,
    };
  },
  methods: {
    selectTags(item) { // 选择热门标签
      this.searchData = item;
      this.search();
    },
    research(){
      this.onlyStore = !this.onlyStore
    },
    search () { // 全平台搜索商品
      const url = this.$route.path;
      if(url == '/goodsList'){
        this.$emit('search', this.searchData)
      }else{
        const pushData = {
          path:'/goodsList',
          query: { keyword: this.searchData },
        }
        if(this.storeId && this.onlyStore) pushData.query.storeId = this.storeId


        this.$router.push(pushData);
      }
    },
    searchStore() { // 店铺搜索商品
      this.$emit('search', this.searchData)
    }
  },
  computed: {
    promotionTags() {
      if (this.$store.state.hotWordsList) {
        return JSON.parse(this.$store.state.hotWordsList)
      } else {
        return []
      }
    }
  },
  created() {
    this.searchData = this.$route.query.keyword

    if (!this.hover) { // 首页顶部固定搜索栏不调用热词接口
      // 搜索热词每5分钟请求一次
      const reloadTime = storage.getItem('hotWordsReloadTime')
      const time = new Date().getTime() - 5 * 60 * 1000
      if (!reloadTime) {
        hotWords({count: 5}).then(res => {
          if (res.success && res.result) storage.setItem('hotWordsList', res.result)
        })
        storage.setItem('hotWordsReloadTime', new Date().getTime())
      } else if (reloadTime && time > reloadTime) {
        hotWords({count: 5}).then(res => {
          if (res.success && res.result) storage.setItem('hotWordsList', res.result)
        })
        storage.setItem('hotWordsReloadTime', new Date().getTime())
      }
    }
  }
};
</script>
<style scoped lang="scss">
.only-store{
  text-align: right;
  color:$theme_color;
  cursor: pointer;
}
.navbar {
  height: 113px;
  background: #fff;
}
.search-icon{
  width: 100%;
  height: 100%;
}
.small-search-box{
  height: 60px;

  margin: 0 !important;
}

.container {
  position: relative;

  height: 100%;
}

.search {
  width: 778.4px;
  margin: 10px 0px 5px 0;

  border-radius: 18.9px;


  /deep/ .ivu-input.ivu-input-large {
    border: 1.4px solid $theme_color;
    box-sizing: border-box;
    border-radius: 19.6px;
    position: relative;
    padding-left: 26px;
    font-size: 14px;
    font-weight: normal;
    height: 37.8px;
    color: #999;
    &:focus {
      box-shadow: none;
    }
  }

  /deep/ .ivu-input-group-append {
    border-radius: 19.6px !important;
    cursor: pointer;
    box-sizing: border-box;
    border: 1.4px solid $theme_color;
    width: 67.2px;
    height: 37.8px;
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    z-index: 99;
    background-color: $theme_color;
    color: #ffffff;

    button {
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
    }
  }
}
.search-box{
  margin-left: 28px;
}
.logo-img {
  max-width: 150px;
  cursor: pointer;
}

.store-search {
  width: 55.6px;
  padding: 0 9px;
  border-radius: 0;
  border-radius: 3px;

  &:nth-child(2) {
    width: 55px;
    margin-left: -2px;
    border-radius: 3px;
  }
}

.btn-div {
  position: relative;
  height: 0px;
  top: -38px;
  left: 352px;
}

.history-list {

  margin-left: 28px;
}

.history-item {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;
  margin-right: 17px;
  color: #666666;
  cursor: pointer;
}
</style>
