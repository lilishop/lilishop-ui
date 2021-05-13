<template>
  <div class="wrapper">
    <card _Title="优惠券列表"  />
    <Coupon/>
  </div>
</template>

<script>
import Coupon from '@/components/coupon/Coupon.vue'
export default {
  name: 'Coupons',
  data () {
    return {
      couponsList: [ // 优惠券状态
        '未使用',
        '已使用',
        '已过期',
        '即将到期'
      ]
    }
  },
  components: {Coupon},
  mounted () {

  },
  methods: {}
}
</script>

<style scoped lang="scss">

</style>
