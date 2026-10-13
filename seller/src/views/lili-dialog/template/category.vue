<template>
  <div class="wrapper">
    <!-- 一级分类 -->
    <div class="list">
      <div class="list-item" :class="{active:parentIndex === cateIndex}" @click="handleClickChild(cate,cateIndex)" v-for="(cate,cateIndex) in categoryList" :key="cateIndex">
        {{cate.name}}
      </div>
    </div>
    <!-- 二级分类 -->
    <div class="list">
      <template v-if="secondLevel.length != 0">
        <div class="list-item" :class="{active:secondIndex === secondI}" @click="handleClickSecondChild(second,secondI)" v-for="(second,secondI) in secondLevel"
          :key="secondI">
          {{second.name}}
        </div>
      </template>
    </div>
    <!--三级分类 -->
    <div class="list">
      <template v-if="thirdLevel.length != 0">
        <div class="list-item" :class="{active:thirdIndex === thirdI}" @click="handleClickthirdChild(third,thirdI)" v-for="(third,thirdI) in thirdLevel" :key="thirdI">
          {{third.name}}
        </div>
      </template>
    </div>
  </div>

</template>
<script setup>
import { onMounted, ref } from "vue";
import { getCategoryTree } from "@/api/goods.js";

const emit = defineEmits(["selected"]);

// 无 defineExpose：grep seller/src 全量确认无外部 ref/$refs/$parent 访问本组件成员
// （link-dialog.vue 的 $refs["lili-component"][0].type 写入指向首个 tab 的 goods-dialog，与本组件无关；
//   shop/wap/decorate.vue 仅通过 @selected 事件交互）
const parentIndex = ref(''); // 分类父级下标
const secondIndex = ref(''); // 分类二级下标
const thirdIndex = ref(''); // 分类三级下标
const categoryList = ref([]); // 分类列表一级数据
const secondLevel = ref([]); // 分类列表二级数据
const thirdLevel = ref([]); // 分类列表三级数据
const selectedData = ref(""); // 已选分类数据

function loadCategoryFromCache() {
  try {
    const raw = localStorage.getItem("category");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function applyCategoryList(category) {
  if (!Array.isArray(category)) {
    categoryList.value = [];
    return;
  }
  category.forEach((item) => {
    item.___type = "category";
  });
  categoryList.value = category;
}
// 点击一级
function handleClickChild(item, index) {
  parentIndex.value = index;
  secondLevel.value = item.children || [];
  item.___type = "category";
  item.allId = item.id;

  secondIndex.value = '';
  thirdIndex.value = '';
  thirdLevel.value = []
  emit("selected", [item]);
}
// 点击二级
function handleClickSecondChild(second, index) {
  second.___type = "category";
  second.allId = `${second.parentId},${second.id}`

  secondIndex.value = index;
  thirdLevel.value = second.children || [];
  thirdIndex.value = '';
  emit("selected", [second]);
}
// 点击三级
function handleClickthirdChild(item, index) {
  item.___type = "category";
  item.allId = `${categoryList.value[parentIndex.value].id},${item.parentId},${item.id}`
  emit("selected", [item]);
  thirdIndex.value = index;
}
function init() {
  const cached = loadCategoryFromCache();
  if (cached) {
    applyCategoryList(cached);
    return;
  }
  getCategoryTree().then((res) => {
    if (res.success && Array.isArray(res.result)) {
      localStorage.setItem("category", JSON.stringify(res.result));
      applyCategoryList(res.result);
    }
  });
}

onMounted(() => {
  init();
});
</script>
<style lang="scss" scoped>
.list {
  width: 30%;
  margin: 0 1.5%;
  height: 400px;
  overflow: auto;
  > .list-item {
    padding: 10px;
    transition: 0.35s;
    cursor: pointer;
  }
  .list-item:hover {
    background: #ededed;
  }
}
.active {
  background: #ededed;
}
.wrapper {
  overflow: hidden;
  display: flex;
}
</style>
