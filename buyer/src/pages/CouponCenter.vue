<template>
  <div class="coupon-center">
    <BaseHeader></BaseHeader>
    <div class="content">
      <div>
        <div class="coupon-title">
          <router-link to="/">
            <img src="../assets/images/logo.png" width="120" alt="" />
          </router-link>
          <p>领券中心</p>
          <el-input
            v-model="keyword"
            style="width: 400px"
            @keyup.enter="search"
            placeholder="搜索优惠券"
          />
        </div>

        <div class="fontsize_18 recommend">推荐好券</div>

        <empty v-if="!loading && list.length === 0" />
        <ul class="coupon-list" v-else-if="list.length > 0">
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
                  ><span class="price">{{ item.couponDiscount || item.discount }}</span>折</span>
                <span class="describe"
                  >满{{ item.consumeThreshold }}元可用</span>
              </div>
              <p>使用范围：{{ useScope(item.scopeType, item.storeName) }}</p>
              <p>有效期：{{ item.endTime }}</p>
            </div>
            <b></b>
            <a class="c-right" @click="receive(item)">立即领取</a>
            <i class="circle-top"></i>
            <i class="circle-bottom"></i>
          </li>
        </ul>
        <el-pagination           v-model:current-page="params.pageNumber"
          v-model:page-size="params.pageSize"
          :total="total"
          @current-change="changePageNum"
          class="pageration"
          @size-change="changePageSize"
         layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script>
import { Modal } from "@/utils/message";
import storage from "@/plugins/storage";
import { couponList, receiveCoupon } from "@/api/member.js";
export default {
  data() {
    return {
      list: [], // 优惠券列表
      total: 0, // 优惠券总数
      loading: false,
      keyword: "",
      params: {
        // 请求参数
        getType: "FREE",
        pageNumber: 1,
        pageSize: 20,
      },
    };
  },
  methods: {
    // 搜索优惠券
    search() {
      this.params.couponName = this.keyword.trim();
      this.params.pageNumber = 1;
      this.getList();
    },
    // 获取优惠券列表
    getList() {
      if (this.loading) return;
      this.loading = true;
      couponList(this.params)
        .then((res) => {
          if (res && res.success && res.result) {
            this.list = res.result.records || [];
            this.total = res.result.total || 0;
          } else {
            this.list = [];
            this.total = 0;
          }
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 分页 改变页码
    changePageNum(val) {
      this.params.pageNumber = val;
      this.getList();
    },
    // 分页 改变每页数
    changePageSize(val) {
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList();
    },
    // 领取优惠券
    receive(item) {
      const userInfo = storage.getItem("userInfo");
      const isLogin = userInfo && JSON.parse(userInfo).username;
      if (!isLogin) {
        Modal.confirm({
          title: "温馨提示",
          content: "请登录后执行此操作",
          okText: "立即登录",
          cancelText: "取消",
          onOk: () => {
            this.$router.push({
              path: "/login",
              query: {
                rePath: this.$route.path,
                query: JSON.stringify(this.$route.query),
              },
            });
          },
        });
        return;
      }
      receiveCoupon(item.id)
        .then((res) => {
          if (!res || !res.success) return;
          Modal.confirm({
            title: "领取优惠券",
            content: "优惠券领取成功，可到我的优惠券页面查看",
            okText: "我的优惠券",
            cancelText: "立即使用",
            closable: true,
            onOk: () => {
              this.$router.push("/home/Coupons");
            },
            onCancel: () => {
              this.$router.push({
                path: "/goodsList",
                query: { promotionsId: item.id, promotionType: "COUPON" },
              });
            },
          });
        })
        .catch(() => {});
    },
    // 优惠券可用范围
    useScope(type, storeName) {
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
<style lang="scss" scoped>
@import "../assets/styles/coupon.scss";
.content {
  width: 100%;
  background-color: #fff;

  > div {
    margin: 10px auto;
    width: 1200px;
  }
}
.coupon-title {
  display: flex;
  align-items: center;

  p {
    font-size: 18px;
    margin-right: 500px;
  }
  border-bottom: 2px solid $theme_color;
}
.recommend {
  margin: 20px auto;
  font-weight: bold;
  width: 200px;
  text-align: center;
}
.coupon-item {
  overflow: hidden;
  $claim-width: 55px;

  .c-left {
    width: calc(100% - #{$claim-width});
    box-sizing: border-box;
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
  text-align: right;
  padding-bottom: 10px;
}
</style>
