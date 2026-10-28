<template>
  <div class="link-list">
    <template v-for="(item, index) in linkList" :key="index">
      <div
        v-if="showLinkItem(item)"
        class="card"
        :class="{ active: selectedIndex == index }"
        @click="handleLink(item, index)"
      >
        <span class="link-icon">
          <el-icon :size="18">
            <component :is="item.icon" />
          </el-icon>
        </span>
        <p>{{ item.title }}</p>
        <el-icon v-if="selectedIndex == index" class="selected-icon" :size="18">
          <Check />
        </el-icon>
        <el-icon v-else class="arrow-icon" :size="16">
          <ArrowRight />
        </el-icon>
      </div>
    </template>
    <div
      v-if="linkVisible"
      class="card"
      :class="{ active: selectedIndex == linkList.length }"
      @click="handleLink(linkItem, linkList.length)"
    >
      <span class="link-icon">
        <el-icon :size="18">
          <component :is="linkItem.icon" />
        </el-icon>
      </span>
      <p>{{ linkItem.title }}</p>
      <el-icon v-if="selectedIndex == linkList.length" class="selected-icon" :size="18">
        <Check />
      </el-icon>
      <el-icon v-else class="arrow-icon" :size="16">
        <ArrowRight />
      </el-icon>
    </div>
  </div>
</template>
<script setup>
import { markRaw, ref } from "vue";
import { useRoute } from "vue-router";
import {
  House,
  ShoppingCart,
  Star,
  Document,
  User,
  UserFilled,
  Service,
  Ticket,
  Bell,
  OfficeBuilding,
  Promotion,
  PriceTag,
  Sunny,
  VideoCamera,
  Share,
  ShoppingBag,
  Link,
  ArrowRight,
  Check,
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const emit = defineEmits(["selected"]);

const route = useRoute();

const linkList = ref([
  { title: "首页", icon: markRaw(House), url: "/", ___type: "home" },
  { title: "购物车", icon: markRaw(ShoppingCart), url: "/cart", ___type: "cart" },
  { title: "我的订单", icon: markRaw(Document), url: "/home/MyOrder", ___type: "order" },
  { title: "个人中心", icon: markRaw(User), url: "/home", ___type: "user" },
  { title: "基本信息", icon: markRaw(UserFilled), url: "/home/Profile", ___type: "userInfo" },
  { title: "我的售后", icon: markRaw(Service), url: "/home/AfterSale", ___type: "afterSale" },
  { title: "我的优惠券", icon: markRaw(Ticket), url: "/home/Coupons", ___type: "myCoupons" },
  { title: "收藏商品", icon: markRaw(Star), url: "/home/Favorites", ___type: "collection" },
  { title: "消息中心", icon: markRaw(Bell), url: "/home/MsgList", ___type: "msg" },
  { title: "商家入驻", icon: markRaw(OfficeBuilding), url: "/shopEntry", ___type: "merchantEntry" },
  { title: "领券中心", icon: markRaw(PriceTag), url: "/coupon", ___type: "coupon" },
  { title: "秒杀频道", icon: markRaw(Promotion), url: "/seckill", ___type: "seckill" },
  { title: "拼团频道", icon: markRaw(Promotion), url: "/group", ___type: "group" },
  { title: "签到", icon: markRaw(Sunny), url: "/sign", ___type: "sign" },
  { title: "小程序直播", icon: markRaw(VideoCamera), url: "/live", ___type: "live" },
  { title: "砍价", icon: markRaw(Share), url: "/kanjia", ___type: "kanjia" },
  { title: "积分商城", icon: markRaw(ShoppingBag), url: "/point", ___type: "point" },
]);
const linkItem = ref({
  title: "自定义链接",
  icon: markRaw(Link),
  ___type: "link",
  url: "",
});
const linkVisible = ref(true);
const selectedIndex = ref(9999999);

// 原 created 钩子
const urls = window.location.href;
if (urls.indexOf("/floorList/renovation") != -1) {
  linkList.value = linkList.value.filter(
    (item) =>
      item.title !== "砍价" &&
      item.title !== "小程序直播" &&
      item.title !== "积分商城"
  );
  linkVisible.value = true;
} else {
  linkVisible.value = false;
}

function showLinkItem(item) {
  return (
    (item.title !== "拼团频道" && item.title !== "签到") ||
    route.name !== "renovation"
  );
}
function handleLink(val, index) {
  if (val.title === "自定义链接" || val.title === "外部链接") {
    ElMessageBox.prompt("请输入链接地址（支持站内相对路径如 /cart 或外部网址如 https://...）：", "自定义链接", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputValue: val.url || "",
      inputPlaceholder: "例如 /cart 或 https://...",
      inputPattern: /^\S+$/,
      inputErrorMessage: "链接地址不能为空",
    })
      .then(({ value }) => {
        const itemData = {
          ...val,
          title: "自定义链接",
          url: value,
          originalType: "link",
          ___type: "other",
        };
        selectedIndex.value = index;
        emit("selected", [itemData]);
      })
      .catch(() => {});
    return;
  }
  const itemData = {
    ...val,
    originalType: val.___type,
    ___type: "other",
  };
  selectedIndex.value = index;
  emit("selected", [itemData]);
}
</script>
<style lang="scss" scoped>
@import "../style.scss";
.link-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-height: calc(100vh - 170px);
  padding: 4px;
  overflow-y: auto;
}
.card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 104px;
  padding: 16px 10px 14px;
  margin: 0;
  cursor: pointer;
  text-align: center;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.2s ease;
  p {
    margin: 10px 0 0;
    color: #303133;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }
}
.card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}
.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 10px;
}
.arrow-icon {
  display: none;
}
.selected-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #409eff;
}
.active,
.active:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
  box-shadow: none;
  p {
    color: #409eff;
  }
  .link-icon {
    color: #fff;
    background: #409eff;
  }
}
</style>
