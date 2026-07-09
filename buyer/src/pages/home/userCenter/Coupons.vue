<template>
  <div class="wrapper">
    <UserCenterLayout
      title="优惠券列表"
      :tabs="statusNameList"
      :active-tab="activeStatusIndex"
      @tab-change="change"
    >
      <empty v-if="list.length == 0" />
      <ul class="coupon-list" v-else>
      <li v-for="(item, index) in list" class="coupon-item" :key="index">
        <div class="c-left">
          <div>
            <span
              v-if="item.couponType === 'PRICE'"
              class="fontsize_12 global_color"
              >￥<span class="price">{{ $filters.unitPrice(item.price) }}</span></span>
            <span
              v-if="item.couponType === 'DISCOUNT'"
              class="fontsize_12 global_color"
              ><span class="price">{{ item.discount }}</span>折</span>
            <span class="describe">满{{ item.consumeThreshold }}元可用</span>
          </div>
          <p>使用范围：{{ useScope(item.scopeType, item.storeName) }}</p>
          <p>有效期：{{ item.endTime }}</p>
        </div>
        <b></b>
        <a
          class="c-right"
          :class="{ 'canot-use': params.memberCouponStatus !== 'NEW' }"
          @click="go(item)"
          >立即使用</a
        >
        <i class="circle-top"></i>
        <i class="circle-bottom"></i>
      </li>
      </ul>
      <div class="pageration">
        <el-pagination
          v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          @current-change="changePageNum"
          @size-change="changePageSize"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
      <el-skeleton v-if="loading" fix></el-skeleton>
    </UserCenterLayout>
  </div>
</template>

<script>
import { memberCouponList } from "@/api/member.js";
export default {
  name: "Coupons",
  data() {
    return {
      statusNameList: [
        // 优惠券状态
        "未使用",
        "已使用",
        "已过期",
      ],
      statusList: ["NEW", "USED", "EXPIRE"], // 优惠券状态
      loading: false, // 列表加载状态
      params: {
        // 请求参数
        pageNumber: 1,
        pageSize: 10,
        memberCouponStatus: "NEW",
      },
      total: 0, // 优惠券总数
      list: [], // 优惠券列表
    };
  },
  computed: {
    activeStatusIndex() {
      const index = this.statusList.indexOf(this.params.memberCouponStatus);
      return index > -1 ? index : 0;
    },
  },
  methods: {
    getList() {
      // 获取优惠券列表
      this.loading = true;
      memberCouponList(this.params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.list = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 切换优惠券状态
    change(index) {
      this.params.memberCouponStatus = this.statusList[index];
      this.params.pageNumber = 1;
      this.getList();
    },
    go(item) {
      // 根据使用条件跳转商品列表页面
      if (this.params.memberCouponStatus !== "NEW") return;

      this.$router.push({
        path: "/goodsList",
        query: { promotionsId: item.couponId, promotionType: "COUPON" },
      });
    },

    changePageNum(val) {
      // 分页改变页码
      this.params.pageNumber = val;
      this.getList();
    },

    changePageSize(val) {
      // 分页改变页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList();
    },

    useScope(type, storeName) {
      // 根据字段返回 优惠券适用范围
      let shop = "平台";
      let goods = "全部商品";
      if (storeName !== "platform") shop = storeName;
      switch (type) {
        case "ALL":
          goods = "全部商品";
          break;
        case "PORTION_GOODS":
          goods = "部分商品";
          break;
        case "PORTION_GOODS_CATEGORY":
          goods = "部分分类商品";
          break;
      }
      return `${shop}${goods}可用`;
    },
  },
  mounted() {
    this.getList();
  },
};
</script>

<style scoped lang="scss">
@import "../../../assets/styles/coupon.scss";
.coupon-item {
  overflow: hidden;
  height: 145px;
  margin-left: 0;
  $claim-width: 55px;

  .c-left {
    width: calc(100% - #{$claim-width});
    box-sizing: border-box;
    padding: 20px;

    p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  b {
    right: $claim-width;
    width: 0;
    background: none;
    border-right: 1px dashed #e0e0e0;
  }

  .c-right {
    width: $claim-width;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 4px;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    text-decoration: none;
    user-select: none;

    &:hover {
      opacity: 0.9;
    }
  }

  .canot-use {
    color: #999;
    background-color: #eee;
    cursor: not-allowed;

    &:hover {
      opacity: 1;
    }
  }

  i.circle-top,
  i.circle-bottom {
    right: calc(#{$claim-width} - 9px);
    width: 18px;
    height: 18px;
  }

  i.circle-top {
    top: -9px;
  }

  i.circle-bottom {
    bottom: -9px;
  }
}

.pageration {
  display: flex;
  justify-content: flex-end;
}
</style>
