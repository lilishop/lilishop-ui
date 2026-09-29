<template>
  <div class="wrapper">
    <UserCenterLayout
      v-if="!homePage"
      :tabs="favoriteWay"
      :active-tab="activeTabIndex"
      @tab-change="change"
    >
      <empty v-if="!list.length" />
      <div v-else class="fav-list" :class="{ 'is-store': params.type === 'STORE' }">
        <div class="fav-cols">
          <span>{{ params.type === 'GOODS' ? '商品' : '店铺' }}</span>
          <span v-if="params.type === 'GOODS'">金额</span>
          <span>操作</span>
        </div>
        <div class="fav-row" v-for="(item, index) in list" :key="item.id || item.skuId || index">
          <div class="fav-goods">
            <div class="fav-thumb" @click="openItem(item)">
              <img
                :src="params.type === 'GOODS' ? item.image : item.storeLogo"
                alt=""
                @error="$event.target.style.visibility = 'hidden'"
              />
            </div>
            <div class="fav-info">
              <div class="fav-name" @click="openItem(item)">
                {{ params.type === 'GOODS' ? item.goodsName : item.storeName }}
              </div>
              <span v-if="params.type === 'STORE' && item.selfOperated" class="self-tag">商家自营</span>
            </div>
          </div>
          <div v-if="params.type === 'GOODS'" class="fav-price">{{ $filters.unitPrice(item.price, '￥') }}</div>
          <div class="fav-ops">
            <button v-if="params.type === 'GOODS'" type="button" class="op-btn" @click="buynow(item.skuId, item.goodsId)">立即购买</button>
            <button v-else type="button" class="op-btn" @click="goShop(item.id)">查看店铺</button>
            <button v-if="params.type === 'GOODS'" type="button" class="text-link" @click="cancel(item.skuId)">取消收藏</button>
            <button v-else type="button" class="text-link" @click="cancelStore(item.id)">取消收藏</button>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
    </UserCenterLayout>

    <template v-else>
      <card _Title="近期收藏" :_Size="16" :_Tabs="favoriteWay" :_ActiveTab="activeTabIndex" @_Change="change" _More="全部收藏" _Src="/home/Favorites"></card>
      <empty v-if="!list.length" />
      <div v-else class="fav-list" :class="{ 'is-store': params.type === 'STORE' }">
        <div class="fav-cols">
          <span>{{ params.type === 'GOODS' ? '商品' : '店铺' }}</span>
          <span v-if="params.type === 'GOODS'">金额</span>
          <span>操作</span>
        </div>
        <div class="fav-row" v-for="(item, index) in list" :key="item.id || item.skuId || index">
          <div class="fav-goods">
            <div class="fav-thumb" @click="openItem(item)">
              <img
                :src="params.type === 'GOODS' ? item.image : item.storeLogo"
                alt=""
                @error="$event.target.style.visibility = 'hidden'"
              />
            </div>
            <div class="fav-info">
              <div class="fav-name" @click="openItem(item)">
                {{ params.type === 'GOODS' ? item.goodsName : item.storeName }}
              </div>
              <span v-if="params.type === 'STORE' && item.selfOperated" class="self-tag">商家自营</span>
            </div>
          </div>
          <div v-if="params.type === 'GOODS'" class="fav-price">{{ $filters.unitPrice(item.price, '￥') }}</div>
          <div class="fav-ops">
            <button v-if="params.type === 'GOODS'" type="button" class="op-btn" @click="buynow(item.skuId, item.goodsId)">立即购买</button>
            <button v-else type="button" class="op-btn" @click="goShop(item.id)">查看店铺</button>
            <button v-if="params.type === 'GOODS'" type="button" class="text-link" @click="cancel(item.skuId)">取消收藏</button>
            <button v-else type="button" class="text-link" @click="cancelStore(item.id)">取消收藏</button>
          </div>
        </div>
        <el-skeleton size="large" fix v-if="spinShow"></el-skeleton>
      </div>
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
    openItem (item) {
      if (this.params.type === 'STORE') {
        this.goShop(item.id)
        return
      }
      this.buynow(item.skuId, item.goodsId)
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
.wrapper {
  margin-bottom: 40px;
}

.fav-list {
  --fav-cols: minmax(0, 1fr) 140px 200px;
  --fav-gap: 12px;
  padding-top: 8px;

  &.is-store {
    --fav-cols: minmax(0, 1fr) 200px;
  }
}

.fav-cols,
.fav-row {
  display: grid;
  grid-template-columns: var(--fav-cols);
  column-gap: var(--fav-gap);
  align-items: center;
}

.fav-cols {
  padding: 0 8px 10px;
  color: #999;
  font-size: 13px;

  span:first-child {
    padding-left: 72px;
  }

  span:nth-child(n + 2) {
    text-align: center;
  }
}

.fav-row {
  padding: 14px 8px;
  border-top: 1px solid #f0f0f0;
}

.fav-goods {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  column-gap: 12px;
  align-items: center;
  min-width: 0;
}

.fav-thumb {
  width: 60px;
  height: 60px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.fav-info {
  min-width: 0;
}

.fav-name {
  color: #333;
  font-size: 16px;
  line-height: 22px;
  max-height: 44px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}

.self-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 0 6px;
  border-radius: 4px;
  background: #fff1f0;
  color: $theme_color;
  font-size: 12px;
  line-height: 20px;
}

.fav-price {
  text-align: center;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.fav-ops {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.op-btn {
  min-width: 96px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid $theme_color;
  border-radius: 4px;
  background: $theme_color;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
}

.text-link {
  border: none;
  background: none;
  padding: 0;
  color: #171A26;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &:hover {
    color: $theme_color;
  }
}
</style>
