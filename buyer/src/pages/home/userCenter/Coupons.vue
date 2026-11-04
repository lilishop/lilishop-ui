<template>
  <div class="wrapper">
    <UserCenterLayout
      :tabs="statusNameList"
      :active-tab="activeStatusIndex"
      @tab-change="change"
    >
      <empty v-if="list.length == 0" />
      <ul class="coupon-list" v-else>
      <li
        v-for="(item, index) in list"
        class="coupon-item"
        :class="{ 'is-disabled': params.memberCouponStatus !== 'NEW' }"
        :key="index"
      >
        <div class="c-left">
          <div>
            <span
              v-if="item.couponType === 'PRICE'"
              class="global_color coupon-amount"
              >￥<span class="price">{{ $filters.unitPrice(item.price) }}</span></span>
            <span
              v-if="item.couponType === 'DISCOUNT'"
              class="global_color coupon-amount"
              ><span class="price">{{ item.discount }}</span>折</span>
            <span class="describe">{{ item.consumeThreshold > 0 ? '满' + item.consumeThreshold + '元可用' : '无门槛使用' }}</span>
          </div>
          <p>使用范围：{{ useScope(item.scopeType, item.storeName) }}</p>
          <p class="coupon-expire">有效期：{{ formatValidity(item) }}</p>
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
          :page-sizes="[20, 50, 100]"
          @current-change="changePageNum"
          @size-change="changePageSize"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
      <el-skeleton v-if="loading" fix></el-skeleton>
    </UserCenterLayout>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { memberCouponList } from "@/api/member.js";

defineOptions({ name: "Coupons" });

const router = useRouter();

const statusNameList = ref([
  // 优惠券状态
  "未使用",
  "已使用",
  "已过期",
]);
const statusList = ref(["NEW", "USED", "EXPIRE"]); // 优惠券状态
const loading = ref(false); // 列表加载状态
const params = reactive({
  // 请求参数
  pageNumber: 1,
  pageSize: 20,
  memberCouponStatus: "NEW",
});
const total = ref(0); // 优惠券总数
const list = ref([]); // 优惠券列表

const activeStatusIndex = computed(() => {
  const index = statusList.value.indexOf(params.memberCouponStatus);
  return index > -1 ? index : 0;
});

// 获取优惠券列表
function getList() {
  loading.value = true;
  memberCouponList(params)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        list.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
      list.value = [];
      total.value = 0;
    });
}

// 切换优惠券状态
function change(index) {
  params.memberCouponStatus = statusList.value[index];
  params.pageNumber = 1;
  getList();
}

// 根据使用条件跳转商品列表页面
function go(item) {
  if (params.memberCouponStatus !== "NEW") return;

  router.push({
    path: "/goodsList",
    query: { promotionsId: item.couponId, promotionType: "COUPON" },
  });
}

// 分页改变页码
function changePageNum(val) {
  params.pageNumber = val;
  getList();
}

// 分页改变页数
function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  getList();
}

// 根据字段返回 优惠券适用范围
function useScope(type, storeName) {
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
}

function formatValidity(item) {
  const start = formatCouponTime(item && item.startTime);
  const end = formatCouponTime(item && item.endTime);
  if (start && end) return `${start} 至 ${end}`;
  if (end) return `至 ${end}`;
  if (start) return `${start} 起`;
  return "长期有效";
}

function formatCouponTime(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 16);
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
@import "../../../assets/styles/coupon.scss";

.coupon-list {
  gap: 16px;
}

.coupon-item {
  overflow: hidden;
  height: auto;
  min-height: 140px;
  margin: 0;
  border-radius: 8px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  $claim-width: 55px;

  &:not(.is-disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  .c-left {
    width: calc(100% - #{$claim-width});
    box-sizing: border-box;
    padding: 16px 16px 14px;
    background: #fff8f5;

    .coupon-amount {
      font-size: 14px;

      .price {
        font-size: 28px;
        font-weight: 700;
      }
    }

    .describe {
      font-size: 12px;
    }

    p {
      font-size: 13px;
      overflow: visible;
      text-overflow: unset;
      white-space: normal;
      word-break: normal;
      line-height: 20px;
    }

    p:nth-of-type(1) {
      font-weight: 500;
      color: #333;
    }

    .coupon-expire {
      font-size: 12px;
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
    border-color: #eee;
  }

  i.circle-top {
    top: -9px;
  }

  i.circle-bottom {
    bottom: -9px;
  }

  &.is-disabled {
    .c-left {
      background: #fafafa;

      .coupon-amount,
      .price {
        color: #999;
      }

      .describe {
        background: #f0f0f0;
        color: #999;
      }

      p {
        color: #999 !important;
      }
    }
  }
}

.pageration {
  display: flex;
  justify-content: flex-end;
}
</style>
