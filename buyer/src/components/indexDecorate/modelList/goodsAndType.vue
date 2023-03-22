<template>
  <div class="goods-type-wrapper">
    <div class="flex goods-type-line">
      <div class="goods-type-title">{{data.options.title}}</div>
      <div class="flex goods-type-labels">
        <div :class="{'active':current === index}" class="goods-type-item" v-for="(item,index) in data.options.labels" :key="index">
          {{item.label}}
        </div>
      </div>
    </div>
    <!-- 商品部分 -->
    <div class="goods-list">
      <div class="goods-list-item" v-for="(item,index) in data.options.list" :key="index">
        <div class="goods-img">
          <img :src="item.img">
        </div>
        <div>
          <div class="goods-name wes-2">{{item.title}}</div>
          <div class="goods-desc">{{item.desc}}</div>

        </div>
        <div class="goods-price">
          {{item.price | unitPrice("￥")}}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "goods",
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data(){
    return{
      current:0
    }
  },
  methods:{

  }
}
</script>

<style scoped lang="scss">

.goods-list-item{
  width: 287px;
  height: 343.7px;
  border-radius: 9.8px;
  opacity: 1;
  cursor: pointer;
  background: #FFFFFF;
  transition: 0.35s;
  box-shadow: 0px 1px 13px 0px #E5E5E5;
  &:hover{
    box-shadow: 0px 1px 14px 0px #C5C5C5;
  }
}
.goods-img{
  text-align: center;
  >img{
    width: auto;
    max-height: 183px;
  }
}
.goods-name{
  font-size: 18px;

  font-weight: normal;
  line-height: 22px;
  text-align: center;
  letter-spacing: 0px;
  width: 200px;
  margin: 0 auto 12.4px auto;
  color: #333333;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-desc{
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 12.4px;
  color: #666666;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-price{
  font-size: 25.2px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #F31947;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-type-line{
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.goods-type-title{
  font-size: 31px;
  font-weight: normal;
  line-height: 37px;
  letter-spacing: 0px;

  color: #333333;
}
.active{
  color: #F31947;
}
.goods-type-labels{
  font-size: 21px;
  font-weight: normal;
  line-height: 25px;
  letter-spacing: 0px;

}
.goods-type-item{
  margin-left: 28px;
}
</style>
