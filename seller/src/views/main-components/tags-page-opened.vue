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

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

defineOptions({ name: "tagsPageOpened" });

const props = defineProps({
  pageTagsList: Array,
  beforePush: {
    type: Function,
    default: () => true,
  },
});

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const currentPageName = ref(route.name);
const tagBodyLeft = ref(0);
const visible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const actionList = {
  others: "关闭其他",
  clearAll: "关闭所有",
};

const scrollCon = ref(null);
const scrollBody = ref(null);

const tagsList = computed(() => appStore.storeOpenedList);

const isActive = (item) => {
  return item.children
    ? item.children[0].name === currentPageName.value
    : item.name === currentPageName.value;
};

const tagType = (item) => {
  return isActive(item) ? "primary" : "info";
};

const itemTitle = (item) => {
  if (typeof item.title === "object") {
    return item.title;
  }
  return item.title;
};

const closePage = (event, name) => {
  let storeOpenedList = appStore.storeOpenedList;
  let lastPageObj = storeOpenedList[0];
  if (currentPageName.value === name) {
    const len = storeOpenedList.length;
    for (let i = 1; i < len; i++) {
      if (storeOpenedList[i].name === name) {
        lastPageObj =
          i < len - 1 ? storeOpenedList[i + 1] : storeOpenedList[i - 1];
        break;
      }
    }
  } else if (event && event.target) {
    const tagWidth = event.target.parentNode?.offsetWidth || 0;
    tagBodyLeft.value = Math.min(tagBodyLeft.value + tagWidth, 0);
  }
  appStore.removeTag(name);
  appStore.closePage(name);
  storeOpenedList = appStore.storeOpenedList;
  localStorage.storeOpenedList = JSON.stringify(storeOpenedList);
  if (currentPageName.value === name) {
    linkTo(lastPageObj);
  }
};

const linkTo = (item) => {
  if (route.name === item.name) return;
  const routerObj = { name: item.name };
  if (item.argu) routerObj.params = item.argu;
  if (item.query) routerObj.query = item.query;
  if (props.beforePush(item)) {
    router.push(routerObj);
  }
};

const handlescroll = (e) => {
  const type = e.type;
  let delta = 0;
  if (type === "DOMMouseScroll" || type === "mousewheel") {
    delta = e.wheelDelta ? e.wheelDelta : -(e.detail || 0) * 40;
  }
  let left = 0;
  if (delta > 0) {
    left = Math.min(0, tagBodyLeft.value + delta);
  } else if (
    scrollCon.value.offsetWidth - 100 <
    scrollBody.value.offsetWidth
  ) {
    if (
      tagBodyLeft.value <
      -(scrollBody.value.offsetWidth - scrollCon.value.offsetWidth + 100)
    ) {
      left = tagBodyLeft.value;
    } else {
      left = Math.max(
        tagBodyLeft.value + delta,
        scrollCon.value.offsetWidth -
          scrollBody.value.offsetWidth -
          100
      );
    }
  } else {
    tagBodyLeft.value = 0;
  }
  tagBodyLeft.value = left;
};

const handleTagsOption = (type) => {
  if (type === "clearAll") {
    appStore.clearAllTags();
    router.push({ name: "home_index" });
  } else {
    appStore.clearOtherTags(route.name);
  }
  tagBodyLeft.value = 0;
};

const contextMenu = (item, e) => {
  visible.value = true;
  const offsetLeft = scrollCon.value.getBoundingClientRect().left;
  contextMenuLeft.value = e.clientX - offsetLeft + 10;
  contextMenuTop.value = e.clientY - 64;
};

const closeMenu = () => {
  visible.value = false;
};

watch(
  () => route.name,
  (name) => {
    currentPageName.value = name;
  }
);

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeMenu);
  } else {
    document.body.removeEventListener("click", closeMenu);
  }
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", closeMenu);
});
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
