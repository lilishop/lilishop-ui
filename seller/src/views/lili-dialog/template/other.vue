<template>
  <div>
    <el-row :gutter="30">
      <template v-for="(item, index) in linkList" :key="index">
        <el-col v-if="showLinkItem(item)" :span="6">
          <div
            class="card"
            :class="{ active: selectedIndex == index }"
            @click="handleLink(item, index)"
          >
            <el-icon :size="24">
              <component :is="item.icon" />
            </el-icon>
            <p>{{ item.title }}</p>
          </div>
        </el-col>
      </template>
      <el-col v-if="linkVisible" :span="6">
        <div
          class="card"
          :class="{ active: selectedIndex == linkList.length }"
          @click="handleLink(linkItem, linkList.length)"
        >
          <el-popover v-model:visible="linkPopoverVisible" trigger="click" placement="top" :width="280">
            <template #reference>
              <div class="link-card-inner">
                <el-icon :size="24">
                  <component :is="linkItem.icon" />
                </el-icon>
                <p>{{ linkItem.title }}</p>
              </div>
            </template>
            <div>
              <div style="margin-bottom: 8px">链接地址</div>
              <el-input
                v-model="linkItem.url"
                placeholder="https://"
                @keyup.enter="handleLink(linkItem, linkList.length)"
              />
            </div>
          </el-popover>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { markRaw } from "vue";
import {
  House,
  ShoppingCart,
  Star,
  Document,
  User,
  Promotion,
  PriceTag,
  Sunny,
  Share,
  ShoppingBag,
  Link,
} from "@element-plus/icons-vue";

export default {
  data() {
    return {
      linkList: [
        { title: "首页", icon: markRaw(House), ___type: "home" },
        { title: "购物车", icon: markRaw(ShoppingCart), ___type: "cart" },
        { title: "收藏商品", icon: markRaw(Star), ___type: "collection" },
        { title: "我的订单", icon: markRaw(Document), ___type: "order" },
        { title: "个人中心", icon: markRaw(User), ___type: "user" },
        { title: "拼团频道", icon: markRaw(Promotion), ___type: "group" },
        { title: "秒杀频道", icon: markRaw(Promotion), ___type: "seckill" },
        { title: "领券中心", icon: markRaw(PriceTag), ___type: "coupon" },
        { title: "签到", icon: markRaw(Sunny), ___type: "sign" },
        { title: "砍价", icon: markRaw(Share), ___type: "kanjia" },
        { title: "积分商城", icon: markRaw(ShoppingBag), ___type: "point" },
      ],
      linkItem: {
        title: "外部链接",
        icon: markRaw(Link),
        ___type: "link",
        url: "",
      },
      linkVisible: false,
      linkPopoverVisible: false,
      selectedIndex: 9999999,
    };
  },
  methods: {
    showLinkItem(item) {
      return (
        (item.title !== "拼团频道" && item.title !== "签到") ||
        this.$route.name !== "renovation"
      );
    },
    handleLink(val, index) {
      val = { ...val, ___type: "other" };
      this.selectedIndex = index;
      if (index === this.linkList.length) {
        this.linkPopoverVisible = true;
      } else {
        this.linkPopoverVisible = false;
      }
      this.$emit("selected", [val]);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style.scss";
.card {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
  margin: 10px 0;
  text-align: center;
  transition: 0.35s;
  cursor: pointer;
  border: 1px solid #ededed;
  :deep(p) {
    margin: 10px 0;
  }
}
.link-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card:hover {
  background: #ededed;
}
.active {
  background: #ededed;
}
</style>
