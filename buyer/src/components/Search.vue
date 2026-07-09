<template>
  <div class="navbar" :class="{'small-search-box': useClass == 'fixed-show'}">
    <template v-if="useClass == 'fixed-show'">
      <div class="search search-embedded">
        <el-input
          v-model="searchData"
          size="large"
          class="search-input"
          placeholder="输入你想查找的商品"
          @keyup.enter="search"
        />
        <div class="search-btn" @click="search">
          <el-icon :size="21"><SearchIcon /></el-icon>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="container width_1200_auto flex flex-a-c">
        <img
          :src="$store.state.logoImg"
          v-if="showLogo"
          class="logo-img"
          alt=""
          @click="$router.push('/')"
        />
        <div class="search-box">
          <div class="search">
            <el-input
              v-model="searchData"
              size="large"
              class="search-input"
              placeholder="输入你想查找的商品"
              @keyup.enter="search"
            />
            <div class="search-btn" @click="search">
              <el-icon :size="21"><SearchIcon /></el-icon>
            </div>
          </div>
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
    </template>
  </div>
</template>

<script>
import storage from '@/plugins/storage.js'
import {hotWords} from '@/api/goods.js'
import { Search as SearchIcon } from '@element-plus/icons-vue'

export default {
  name: 'search',
  components: { SearchIcon },
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
      const raw = this.$store.state.hotWordsList;
      if (!raw) {
        return [];
      }
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
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
        }).catch(() => {})
        storage.setItem('hotWordsReloadTime', new Date().getTime())
      } else if (reloadTime && time > reloadTime) {
        hotWords({count: 5}).then(res => {
          if (res.success && res.result) storage.setItem('hotWordsList', res.result)
        }).catch(() => {})
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

.navbar.small-search-box {
  height: 60px;
  width: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  background: transparent;
}

.search-embedded {
  width: 100%;
  margin: 0;
}

.container {
  position: relative;

  height: 100%;
}

.search {
  $btn-gap: 4px;
  $btn-width: 60px;
  $input-height: 37.8px;

  position: relative;
  width: 778.4px;
  height: $input-height;
  margin: 10px 0px 5px 0;

  .search-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      border: 1.4px solid $theme_color;
      box-sizing: border-box;
      border-radius: 19.6px;
      padding-left: 26px;
      padding-right: calc(#{$btn-gap * 2} + #{$btn-width});
      font-size: 14px;
      font-weight: normal;
      height: $input-height;
      color: #999;
      box-shadow: none;
    }
  }

  .search-btn {
    position: absolute;
    right: $btn-gap;
    top: $btn-gap;
    bottom: $btn-gap;
    width: $btn-width;
    border-radius: calc((#{$input-height} - #{$btn-gap * 2}) / 2);
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background-color: $theme_color;
    color: #ffffff;
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
