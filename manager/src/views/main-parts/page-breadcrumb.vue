<template>
  <el-breadcrumb separator=">" class="page-breadcrumb">
    <el-breadcrumb-item
      v-for="(item, idx) in items"
      :key="idx"
    >
      <a
        v-if="idx < items.length - 1 && item.target"
        class="bc-link"
        @click.prevent="go(item.target)"
      >
        {{ item.title }}
      </a>
      <span v-else :class="{ 'is-current': idx === items.length - 1 }">
        {{ item.title }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { otherRouter } from "@/router/router";

const stripLayout = (name) => (name || "").replace(/__layout$/, "");

// 详情/二级页面归属的「列表/父页面」name 映射
const PARENT_MAP = {
  "member-detail": "memberList",
  "order-detail": "orderList",
  "after-order-detail": "afterSale",
  "order-complaint-detail": "orderComplaint",
  "shop-detail": "shopList",
  "shop-operation": "shopList",
  "bill-detail": "bill",
  "goods-detail": "manager-goods",
  "goods-parameter-edit": "goods-parameter",
  "add-points-goods": "manager-points-goods",
  "edit-points-goods": "manager-points-goods",
  "coupon-receive": "manager-coupon",
  "add-platform-coupon": "manager-coupon",
  "edit-platform-coupon": "manager-coupon",
  "add-coupon-activity": "manager-coupon-activity",
  "edit-coupon-activity": "manager-coupon-activity",
  "coupon-activity-info": "manager-coupon-activity",
  "pintuan-goods": "manager-pintuan",
  "full-discount-detail": "manager-full-discount",
  "manager-seckill-add": "manager-seckill",
  "add-kanJia-activity-goods": "manager-kanjia",
  "edit-kanJia-activity-goods": "manager-kanjia",
  "add-gift-card-cash-activity": "manager-gift-card-cash",
  "edit-gift-card-cash-activity": "manager-gift-card-cash",
  "gift-card-cash-records": "manager-gift-card-cash",
  "gift-card-cash-batch-credentials": "manager-gift-card-cash",
};

const findFirstLeaf = (group) => {
  if (!group || !Array.isArray(group.children) || !group.children.length) {
    return null;
  }
  const first = group.children.find((c) => c && c.name) || group.children[0];
  return stripLayout(first?.name) || null;
};

export default {
  name: "pageBreadcrumb",
  computed: {
    items() {
      const route = this.$route;
      if (!route || !route.name || route.name === "home_index") {
        return [{ title: "首页" }];
      }
      return this.buildChain(stripLayout(route.name));
    },
  },
  methods: {
    go(target) {
      if (!target || !target.name) return;
      if (this.$route.name === target.name) return;
      this.$router.push(target);
    },
    findInMenu(name) {
      const menuList = this.$store.state.app.menuList || [];
      for (const grp of menuList) {
        for (const child of grp.children || []) {
          if (stripLayout(child.name) === name) {
            return { group: grp, child };
          }
        }
      }
      return null;
    },
    routerEntry(name) {
      if (Array.isArray(otherRouter.children)) {
        return otherRouter.children.find((c) => c.name === name);
      }
      return null;
    },
    topItem() {
      const navList = this.$store.state.app.navList || [];
      const menuList = this.$store.state.app.menuList || [];
      const currNavTitle = this.$store.state.app.currNavTitle;
      const firstName =
        this.$route.meta && this.$route.meta.firstRouterName;

      let topTitle = currNavTitle;
      if (firstName) {
        const top = navList.find((n) => n.name === firstName);
        if (top) topTitle = top.title;
      }
      if (!topTitle) return null;

      let target = null;
      if (menuList && menuList.length) {
        const leafName = findFirstLeaf(menuList[0]);
        if (leafName) target = { name: leafName };
      }
      return { title: topTitle, target };
    },
    buildChain(name, depth = 0) {
      if (depth > 6) return [];

      const inMenu = this.findInMenu(name);
      if (inMenu) {
        const list = [];
        const top = this.topItem();
        if (top) list.push(top);
        const groupLeaf = findFirstLeaf(inMenu.group);
        list.push({
          title: inMenu.group.title,
          target: groupLeaf ? { name: groupLeaf } : null,
        });
        list.push({ title: inMenu.child.title });
        return list;
      }

      const parentName = PARENT_MAP[name];
      const entry = this.routerEntry(name);
      const selfTitle = entry?.title
        ? entry.title
        : (this.$route.meta && this.$route.meta.title
            ? String(this.$route.meta.title).replace(/\s*-\s*.+$/, "")
            : "");

      if (parentName) {
        const parentChain = this.buildChain(parentName, depth + 1).map(
          (it, idx, arr) =>
            idx === arr.length - 1
              ? { title: it.title, target: { name: parentName } }
              : it
        );
        if (selfTitle) parentChain.push({ title: selfTitle });
        return parentChain;
      }

      const list = [];
      const top = this.topItem();
      if (top) list.push(top);
      if (selfTitle) list.push({ title: selfTitle });
      return list;
    },
  },
};
</script>

<style lang="scss" scoped>
.page-breadcrumb {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 44px;
  font-size: 14px;
  display: flex;
  align-items: center;

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #606266;
      font-weight: 400;
    }

    &:first-child {
      margin-left: 0 !important;
      padding-left: 0 !important;
    }
  }

  .bc-link {
    color: #606266;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: $theme_color;
    }
  }

  .is-current {
    color: $theme_color;
    font-weight: 500;
  }
}
</style>
