<template>
  <div class="wrapper">
    <div class="orderBox">
      <!-- <ul class="orderUl">
        <li>
          <div class="circle">
            <Icon size="50" type="ios-card" />
          </div>
          <div class="info">
            <Badge :count="0"> 代付款 </Badge>
          </div>
        </li>
        <li>
          <div class="circle">
            <Icon size="50" type="ios-card" />
          </div>
          <div class="info">
            <Badge :count="0"> 待收货 </Badge>
          </div>
        </li>
        <li>
          <div class="circle">
            <Icon size="50" type="ios-card" />
          </div>
          <div class="info">
            <Badge :count="0"> 待评价 </Badge>
          </div>
        </li>
      </ul> -->
      <div class="userBox">
        <div class="box">
          <!-- 我的订单组件 -->
          <myOrderPage :paging="false" :homePage="true" />
        </div>
        <div class="box">
          <!-- 近期收藏 -->
          <myFavorites :paging="false" :homePage="true" />
        </div>
        <div class="box">
          <!-- 猜你喜欢 -->
          <!-- <myLike /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import myOrderPage from '@/pages/home/orderCenter/MyOrder'
import myFavorites from '@/pages/home/memberCenter/Favorites'
// import myLike from '@/components/like'

export default {
  name: 'main',
  components: {
    myOrderPage,
    myFavorites
  }
}
</script>

<style scoped lang="scss">
.circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  background: $success_color;
  margin: 0 auto;
  text-align: center;
  color: #fff;

  > i {
    line-height: 70px;
  }
}

.info {
  text-align: center;
  font-size: 18px;
  margin: 10px 0;
}

.orderUl {
  overflow: hidden;

  > li {
    cursor: pointer;
    border-radius: 0.4em;
    float: left;
    padding: 10px 0;
    margin: 0 11px;
    width: 200px;
    text-align: center;

    @include background_color($light_background_color);
  }
}
.userBox {
  padding: 0 0 20px 0;
}
</style>
