<template>
  <div
    ref="scrollCon"
    @DOMMouseScroll="handlescroll"
    @mousewheel="handlescroll"
    class="tags-outer-scroll-con"
  >
    <ul
      v-show="visible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="contextmenu"
    >
      <li
        v-for="(item, key) of actionList"
        :key="key"
        @click="handleTagsOption(key)"
      >
        {{ item }}
      </li>
    </ul>
    <div
      ref="scrollBody"
      class="tags-inner-scroll-body"
      :style="{ left: tagBodyLeft + 'px' }"
    >
      <el-tag
        v-for="item in pageTagsList"
        :key="item.name"
        :closable="item.name !== 'home_index'"
        :type="tagType(item)"
        :effect="isActive(item) ? 'dark' : 'plain'"
        class="page-tag"
        size="large"
        @close="closePage($event, item.name)"
        @click="linkTo(item)"
        @contextmenu.prevent="contextMenu(item, $event)"
      >
        {{ itemTitle(item) }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import util from "@/libs/util.js";

export default {
  name: "tagsPageOpened",
  props: {
    pageTagsList: Array,
    beforePush: {
      type: Function,
      default: () => true,
    },
  },
  data() {
    return {
      currentPageName: this.$route.name,
      tagBodyLeft: 0,
      visible: false,
      contextMenuLeft: 0,
      contextMenuTop: 0,
      actionList: {
        others: "关闭其他",
        clearAll: "关闭所有",
      },
    };
  },
  methods: {
    isActive(item) {
      const target = item.children ? item.children[0] : item;
      return util.isSameRoutePage(target, {
        name: this.currentPageName,
        path: this.$route.path,
      });
    },
    tagType(item) {
      return this.isActive(item) ? "primary" : "info";
    },
    itemTitle(item) {
      if (typeof item.title === "object") {
        return this.$t(item.title.i18n);
      }
      return item.title;
    },
    closePage(event, name) {
      let pageOpenedList = this.$store.state.app.pageOpenedList;
      let lastPageObj = pageOpenedList[0];
      if (this.currentPageName === name) {
        const len = pageOpenedList.length;
        for (let i = 1; i < len; i++) {
          if (pageOpenedList[i].name === name) {
            lastPageObj =
              i < len - 1 ? pageOpenedList[i + 1] : pageOpenedList[i - 1];
            break;
          }
        }
      } else if (event && event.target) {
        const tagWidth = event.target.parentNode?.offsetWidth || 0;
        this.tagBodyLeft = Math.min(this.tagBodyLeft + tagWidth, 0);
      }
      this.$store.commit("removeTag", name);
      this.$store.commit("closePage", name);
      pageOpenedList = this.$store.state.app.pageOpenedList;
      localStorage.pageOpenedList = JSON.stringify(pageOpenedList);
      if (this.currentPageName === name) {
        this.linkTo(lastPageObj);
      }
    },
    linkTo(item) {
      const target = item.children ? item.children[0] : item;
      if (util.isSameRoutePage(target, this.$route)) return;
      if (!this.beforePush(item)) return;

      const routerObj = { name: item.name };
      if (item.argu) routerObj.params = item.argu;
      if (item.query) routerObj.query = item.query;

      if (item.name && this.$router.hasRoute(item.name)) {
        this.$router.push(routerObj);
        return;
      }

      const path = target.path || item.path;
      if (path) {
        this.$router.push({
          path: path.startsWith("/") ? path : `/${path}`,
          query: item.query,
        });
      }
    },
    handlescroll(e) {
      const type = e.type;
      let delta = 0;
      if (type === "DOMMouseScroll" || type === "mousewheel") {
        delta = e.wheelDelta ? e.wheelDelta : -(e.detail || 0) * 40;
      }
      let left = 0;
      if (delta > 0) {
        left = Math.min(0, this.tagBodyLeft + delta);
      } else if (
        this.$refs.scrollCon.offsetWidth - 100 <
        this.$refs.scrollBody.offsetWidth
      ) {
        if (
          this.tagBodyLeft <
          -(this.$refs.scrollBody.offsetWidth - this.$refs.scrollCon.offsetWidth + 100)
        ) {
          left = this.tagBodyLeft;
        } else {
          left = Math.max(
            this.tagBodyLeft + delta,
            this.$refs.scrollCon.offsetWidth -
              this.$refs.scrollBody.offsetWidth -
              100
          );
        }
      } else {
        this.tagBodyLeft = 0;
      }
      this.tagBodyLeft = left;
    },
    handleTagsOption(type) {
      if (type === "clearAll") {
        this.$store.commit("clearAllTags");
        this.$router.push({ name: "home_index" });
      } else {
        this.$store.commit("clearOtherTags", this);
      }
      this.tagBodyLeft = 0;
    },
    contextMenu(item, e) {
      this.visible = true;
      const offsetLeft = this.$el.getBoundingClientRect().left;
      this.contextMenuLeft = e.clientX - offsetLeft + 10;
      this.contextMenuTop = e.clientY - 64;
    },
    closeMenu() {
      this.visible = false;
    },
  },
  watch: {
    $route(to) {
      this.currentPageName = to.name;
    },
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
  },
  beforeUnmount() {
    document.body.removeEventListener("click", this.closeMenu);
  },
};
</script>

<style lang="scss">
@import "@/views/main.scss";
.contextmenu {
  position: absolute;
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 11000;
  list-style-type: none;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  li {
    margin: 0;
    padding: 5px 15px;
    cursor: pointer;
    &:hover {
      background: rgba($color: $theme_color, $alpha: 0.1);
    }
  }
}
.page-tag {
  margin-right: 8px;
  cursor: pointer;
  height: 28px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s ease;

  &.el-tag--info.el-tag--plain {
    color: #606266;
    border-color: #dcdfe6;
    background-color: #fff;
  }

  &.el-tag--info.el-tag--plain .el-tag__close {
    color: #909399;

    &:hover {
      color: #606266;
      background-color: transparent;
    }
  }

  & + .page-tag {
    margin-left: 0;
  }

  &:hover {
    opacity: 0.85;
  }

  .el-tag__close {
    margin-left: 6px;
  }
}
</style>
