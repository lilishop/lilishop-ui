<template>
  <div class="shop-box">
    <div class="shop-container">
      <div class="shop-title">
        <div class="shop-title-content">
          <p><router-link :to="`/merchant?id=${skuDetail.storeId}`">{{ skuDetail.storeName }}</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopHeader',
  props: {
    detail: {
      type: Object,
      default: null
    }
  },
  computed: {
    skuDetail () {
      return this.detail;
    }
  }
};
</script>

<style scoped>
/* 店铺介绍 */
.shop-box {
  width: 100%;
  height: 50px;
  background-color: #484848;
}

.shop-container {
  width: 1200px;
  height: 100%;
  margin: 0px auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.shop-title {
  display: flex;
  flex-direction: row;
}

.shop-title-icon {
  font-size: 46px;
}

.shop-title-content {
  padding-top: 8px;
  margin-left: 15px;
  display: flex;
}

.shop-title-content p {
  line-height: 26px;
  font-size: 20px;

}
.shop-title-content p:nth-child(2) {
  font-size: 16px;
  margin-left: 20px;
}
.shop-title-content a {
  color: #fff;
}

.shop-another-item {
  display: flex;
  flex-direction: row;
}

.shop-another-item-detail {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 15px;
}

.shop-another-item-img {
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
}

.shop-another-item-img img {
  width: 80px;
}

.shop-anoter-item-intro {
  margin-left: 15px;
}
</style>
