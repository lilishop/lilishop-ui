<template>
  <div class="flex" v-if="data.options.right.model == 'brand'">
    <div class="left-side" >
      <img :src="data.options.right.data.image.src" alt="">
    </div>
    <div>
      <div class="badge-box flex">
        <div class="round">
          <Icon type="ios-arrow-forward" />
        </div>


      </div>
      <div class="flex goods-list">
        <div class="goods-item flex" :key="index" v-for="(item,index) in data.options.right.data.list">
          <div class="goods-thumbnail">
            <img :src="item.img" alt="">
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
  margin-top: 33px;
  justify-content:right;
  >.round{
    width: 17.5px;
    height: 17.5px;
    opacity: 1;
    border-radius: 50%;
    text-align: center;
    line-height: 17.5px;
    border: 0.7px solid #333333;
    margin-right: 17.5px;
  }
}
.goods-list{
  flex-wrap: wrap;
  justify-content:space-between;
  padding: 0 16px;
}
.goods-item{
  display: flex;
  align-items: center;
  justify-content: center;
  width:50%;
  height: 85px;
  border-radius: 9.8px;
  opacity: 1;
  transition: .35s;
  background: #FFFFFF;
  margin-bottom:9px;


}
.left-side {
  >img{
    width: 254px;
    height: 344px;
    border-radius: 9.8px 0px 0px 9.8px;
    opacity: 1;
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
