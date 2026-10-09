<template>
  <div class="coupon-center">
    <BaseHeader></BaseHeader>
    <div class="content">
      <h2 class="coupon-page-title">领券中心</h2>

      <empty v-if="!loading && list.length === 0" />
      <ul class="coupon-list" v-else-if="list.length > 0">
        <li v-for="item in list" class="coupon-item" :key="item.id">
          <div class="c-left">
            <div class="coupon-amount">
              <span v-if="item.couponType === 'PRICE'" class="global_color">
                ￥<span class="price">{{ $filters.unitPrice(item.price) }}</span>
              </span>
              <span v-if="item.couponType === 'DISCOUNT'" class="global_color">
                <span class="price">{{ item.couponDiscount || item.discount }}</span>折
              </span>
              <span class="describe">{{ thresholdText(item) }}</span>
            </div>
            <p class="coupon-name">
              <span class="scope-tag">{{ scopeTag(item.scopeType, item.storeName) }}</span>
              <span>{{ item.couponName }}</span>
            </p>
            <p class="coupon-time">有效期：{{ item.endTime }}</p>
          </div>
          <a
            class="c-right"
            :class="{ 'is-finished': isFinished(item) }"
            @click="receive(item)"
          >{{ isFinished(item) ? "已领完" : "立即领取" }}</a>
        </li>
      </ul>
      <el-pagination
        v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        :total="total"
        @current-change="changePageNum"
        class="pageration"
        @size-change="changePageSize"
        layout="total, sizes, prev, pager, next"
      ></el-pagination>
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
      params: {
        // 请求参数
        getType: "FREE",
        pageNumber: 1,
        pageSize: 20,
      },
    };
  },
  methods: {
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
      if (this.isFinished(item)) return;
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
        .catch((err) => {
          console.warn('领取优惠券失败', err);
        });
    },
    // 发行量已领完
    isFinished(item) {
      return Number(item.publishNum) > 0 && Number(item.receivedNum) >= Number(item.publishNum);
    },
    // 使用门槛文案
    thresholdText(item) {
      const threshold = Number(item.consumeThreshold);
      if (!threshold) return "无使用门槛";
      return `满${item.consumeThreshold}元可用`;
    },
    // 券范围。店铺名为 platform 时是平台通用券
    scopeTag(type, storeName) {
      if (type === "PORTION_GOODS") return "商品券";
      if (type === "PORTION_GOODS_CATEGORY") return "分类券";
      if (storeName && storeName !== "platform") return "店铺券";
      return "通用券";
    },
  },
  mounted() {
    this.getList();
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/styles/coupon.scss";

.coupon-center {
  background: #f5f5f5;
}

.content {
  width: 1200px;
  margin: 0 auto 48px;
  background: transparent;
}

.coupon-page-title {
  margin: 28px 0 20px;
  color: #171A26;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
}

.coupon-list {
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.coupon-item {
  width: calc((100% - 32px) / 3);
  height: auto;
  min-height: 132px;
  margin: 0;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border: none;
  border-radius: 8px;
  background: #fff;

  b,
  i.circle-top,
  i.circle-bottom {
    display: none;
  }

  .c-left {
    flex: 1;
    width: auto;
    min-width: 0;
    padding: 16px 16px 14px;
    box-sizing: border-box;

    .coupon-amount {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }

    .price {
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
    }

    .describe {
      margin-left: 0;
      padding: 0;
      background: transparent;
      font-size: 13px;
      line-height: 20px;
    }

    .coupon-name {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 0 8px;
      color: #171A26;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
    }

    .scope-tag {
      flex-shrink: 0;
      padding: 0 6px;
      border-radius: 2px;
      background: #fff5f4;
      color: $theme_color;
      font-size: 12px;
      line-height: 20px;
    }

    .coupon-name span:last-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .coupon-time {
      margin: 0;
      color: #999;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }
  }

  .c-right {
    position: relative;
    right: auto;
    top: auto;
    flex-shrink: 0;
    box-sizing: border-box;
    width: 48px;
    height: auto;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    letter-spacing: 4px;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    text-decoration: none;
    user-select: none;

    &:hover {
      opacity: 0.92;
    }

    &.is-finished {
      background: #c8c8c8;
      cursor: default;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.pageration {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-bottom: 0;
}
</style>
