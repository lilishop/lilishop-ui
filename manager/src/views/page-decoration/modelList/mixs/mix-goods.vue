<template>
    <div class="flex" v-if="data.options.left.model == 'goods'">
      <div class="left-side" >
        <img :src="data.options.left.data.image.src" alt="">
      </div>
      <div>
          <div class="badge-box flex">
            <div class="badge">
              {{data.options.left.data.badge.label}}
            </div>
          </div>
          <div class="flex goods-list">
            <div class="goods-item flex" :key="index" v-for="(item,index) in data.options.left.data.list">
              <div class="goods-thumbnail">
                <img :src="item.img" alt="">
              </div>
              <div class="goods-detail">
                <div class="goods-detail-title">{{item.title}}</div>
                <div class="goods-detail-price">{{item.price | unitPrice('¥')}}</div>
              </div>
            </div>
          </div>
      </div>
    </div>
</template>

<script>
export default {
  name: "mix-goods",
  data() {
    return {}
  },
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  components: {},
  mounted() {

  },
  methods: {}
}
</script>

<style scoped lang="scss">
.goods-detail{

}
.goods-detail-title{
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0px;
  color: #333333;
}
.goods-detail-price{
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  letter-spacing: 0px;
  color: #F31947;
  margin-top: 8px;
  margin-bottom:10px;
}
.goods-thumbnail{
  margin-left: 7px;
  display: flex;
  align-items: center;
  >img{
    width:90px;
    height: 90px;
  }
}
.badge-box{

  justify-content:right;
}
.goods-list{
  flex-wrap: wrap;
  justify-content:space-between;
  padding: 0 16px;
}
.goods-item{
  display: flex;
  align-items: center;
  width: 173.6px;
  height: 119px;
  border-radius: 9.8px;
  opacity: 1;
  transition: .35s;
  background: #FFFFFF;
  margin-bottom:9px;
  &:hover{
    box-shadow: 0px 1px 6px 0px #E5E5E5;
  }

}
.left-side {
  >img{
    border-radius: 10px 0px 0px 10px;
    display: block;
    width: 196.7px;
    height: 343.7px;
  }
}
.badge {
  width: 50px;
  height: 27px;
  line-height:27px;
  border-radius: 13.3px 0px 0px 13.3px;
  opacity: 1;
  background: #F31947;
  font-size: 12.6px;
  font-weight: normal;
  text-align: center;
  letter-spacing: 0px;
  color: #FFFFFF;
  margin-top: 26px;
  margin-bottom:17px;
}
</style>
