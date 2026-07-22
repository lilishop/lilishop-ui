<template>
  <div class="wrapper">
    <UserCenterLayout
      v-if="!homePage"
      title="近期收藏"
      :tabs="favoriteWay"
      :active-tab="activeTabIndex"
      @tab-change="change"
    >
      <div v-if="list.length">
        <div v-for="(item, index) in list" :key="index">
          <div class="goodsItem" :key="item.skuId">
            <div class="goodsImg hover-pointer" v-if="params.type === 'GOODS'">
              <img :src="item.image" />
            </div>
            <div class="goodsImg hover-pointer" v-else>
              <img :src="item.storeLogo" />
            </div>
            <div class="goodsTitle hover-color" v-if="params.type === 'GOODS'" @click="buynow(item.skuId, item.goodsId,item.id)">
              {{ item.goodsName }}
            </div>
            <div v-else class="goodsTitle  hover-pointer" @click="buynow(item.skuId, item.goodsId,item.id)" >
              {{ item.storeName }}
              <el-tag color="error" class="operated" v-if="item.selfOperated">商家自营</el-tag>
            </div>
            <div class="goodsPrice">
              <span v-if="params.type === 'GOODS'">{{ $filters.unitPrice(item.price, '￥') }}</span>

            </div>
            <div class="goodsBuy">
              <el-button size="small" type="primary" @click="buynow(item.skuId, item.goodsId)"
                v-if="params.type === 'GOODS'">立即购买</el-button>
              <el-button size="small" type="primary" @click="goShop(item.id)" v-else>店铺购买</el-button>
              <el-button size="small" v-if="params.type === 'GOODS'" @click="cancel(item.skuId)">取消收藏</el-button>
              <el-button size="small" v-if="params.type === 'STORE'" @click="cancelStore(item.id)">取消收藏</el-button>
            </div>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
      <empty v-else />
    </UserCenterLayout>

    <template v-else>
      <card _Title="近期收藏" :_Size="16" :_Tabs="favoriteWay" :_ActiveTab="activeTabIndex" @_Change="change" _More="全部收藏" _Src="/home/Favorites"></card>
      <div v-if="list.length">
        <div v-for="(item, index) in list" :key="index">
          <div class="goodsItem" :key="item.skuId">
            <div class="goodsImg hover-pointer" v-if="params.type === 'GOODS'">
              <img :src="item.image" />
            </div>
            <div class="goodsImg hover-pointer" v-else>
              <img :src="item.storeLogo" />
            </div>
            <div class="goodsTitle hover-color" v-if="params.type === 'GOODS'" @click="buynow(item.skuId, item.goodsId,item.id)">
              {{ item.goodsName }}
            </div>
            <div v-else class="goodsTitle  hover-pointer" @click="buynow(item.skuId, item.goodsId,item.id)" >
              {{ item.storeName }}
              <el-tag color="error" class="operated" v-if="item.selfOperated">商家自营</el-tag>
            </div>
            <div class="goodsPrice">
              <span v-if="params.type === 'GOODS'">{{ $filters.unitPrice(item.price, '￥') }}</span>
            </div>
            <div class="goodsBuy">
              <el-button size="small" type="primary" @click="buynow(item.skuId, item.goodsId)"
                v-if="params.type === 'GOODS'">立即购买</el-button>
              <el-button size="small" type="primary" @click="goShop(item.id)" v-else>店铺购买</el-button>
              <el-button size="small" v-if="params.type === 'GOODS'" @click="cancel(item.skuId)">取消收藏</el-button>
              <el-button size="small" v-if="params.type === 'STORE'" @click="cancelStore(item.id)">取消收藏</el-button>
            </div>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
      <empty v-else />
    </template>
  </div>
</template>

<script>
import { Modal } from "@/utils/message";
import { collectList, cancelCollect, storeCollectList, cancelStoreCollect } from '@/api/member.js'
export default {
  name: 'Favorites',
  props: {
    homePage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      favoriteWay: ['收藏商品', '收藏店铺'], // 收藏分类
      list: [], // 收藏列表
      total: 0, // 收藏总数
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 100,
        type: this.$route.query.type || 'GOODS'
      },
      spinShow: false // 加载状态
    };
  },
  computed: {
    activeTabIndex() {
      return this.params.type === 'STORE' ? 1 : 0;
    },
  },

  methods: {
    loadFavorites() {
      if (this.params.type === 'STORE') {
        this.getStoreList();
      } else {
        this.getList();
      }
    },
    getList() { // 获取商品收藏列表
      this.spinShow = true
      collectList(this.params).then(res => {
        if (res.success && res.result) {
          this.list = res.result.records || [];
        }
      }).catch(() => {
        this.list = [];
      }).finally(() => {
        this.spinShow = false
      })
    },
    getStoreList() { // 获取店铺收藏列表
      this.spinShow = true
      storeCollectList(this.params).then(res => {
        if (res.success && res.result) {
          this.list = res.result.records || [];
        }
      }).catch(() => {
        this.list = [];
      }).finally(() => {
        this.spinShow = false
      })
    },
    change(index) { // tab栏切换
      if (index === 0) { this.params.type = 'GOODS', this.getList() }
      if (index === 1) { this.params.type = 'STORE', this.getStoreList() }
    },
    cancel(id) { // 取消收藏
      let typeName = this.params.type === 'GOODS' ? '商品' : '店铺'
      Modal.confirm({
        title: '取消收藏',
        content: `确定取消收藏该${typeName}吗？`,
        onOk: () => {
          cancelCollect(this.params.type, id).then(res => {
            if (res.success) {
              this.getList();
            }
          })
        }
      });
    },
    cancelStore(id) { // 取消收藏
      let typeName = this.params.type === 'GOODS' ? '商品' : '店铺'
      Modal.confirm({
        title: '取消收藏',
        content: `确定取消收藏该${typeName}吗？`,
        onOk: () => {
          cancelStoreCollect(this.params.type, id).then(res => {
            if (res.success) {
              this.getStoreList();
            }
          })
        }
      });
    },
    buynow(skuId, goodsId,storeId) { // 跳转详情
      console.log(this.params.type)
      let url
      if (this.params.type === 'STORE') {
        url = this.$router.resolve({
          path: '/merchant',
          query: { 'id': storeId }
        })
      } else {
        url = this.$router.resolve({
          path: '/goodsDetail',
          query: { skuId, goodsId }
        })

      }
      window.open(url.href, '_blank')

    },
    goShop(id) { // 跳转店铺页面
      let url = this.$router.resolve({
        path: '/merchant',
        query: { id }
      })
      window.open(url.href, '_blank')
    }
  },
  mounted() {
    if (this.homePage) this.params.pageSize = 5;
    this.loadFavorites();
  }
};
</script>

<style scoped lang="scss">
.goodsShop,
.goodsImg,
.goodsPrice,
.goodsShop,
.goodsTitle {
  margin: 0 6px;
}

.operated {
  margin-left: 10px;
}

.wrapper {
  margin-bottom: 40px;
}

.goodsItem {
  display: flex;
  align-items: center;
  height: 60px;
  margin-bottom: 10px;

  >.goodsImg {
    width: 60px;
    height: 60px;
    overflow: hidden;
    flex-shrink: 0;

    >img {
      width: 100%;
      height: 100%;
    }
  }

  >.goodsPrice,
  .goodsShop {
    width: 120px;
    flex-shrink: 0;
    text-align: center;
  }

  >.goodsTitle {
    flex: 1;
    min-width: 0;
    line-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.goodsBuy {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 8px;
  width: 170px;
  margin-left: 16px;
  line-height: normal;

  :deep(.el-button) {
    margin: 0;
  }
}

.page-size {
  text-align: right;
}
</style>
