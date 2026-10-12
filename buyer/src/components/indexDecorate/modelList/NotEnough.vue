<template>
  <div class="not-enough" ref="obtain" id="demo">
    <el-affix :offset-top="62" @change="change" class="nav-affix">
      <div class="nav-bar" v-show="topSearchShow">
        <ul class="nav-list">
          <li
            v-for="(item, index) in conData.options.navList"
            :class="currentIndex === index ? 'curr' : ''"
            @click="changeCurr(index)"
            :key="index"
          >
            <p @click="gotoDemo">{{ item.title }}</p>
            <p @click="gotoDemo">{{ item.desc }}</p>
          </li>
        </ul>
      </div>
    </el-affix>
    <div class="content" v-if="showContent">
      <div
        v-for="(item, index) in conData.options.list[currentIndex]"
        :key="index"
        class="hover-pointer"
        @click="linkTo(item.url)"
      >
        <img :src="item.img" loading="lazy" decoding="async" width="210" height="210" :alt="item.name" />
        <p>{{ item.name }}</p>
        <p>
          <span>{{ $filters.unitPrice(Number(item.price), "￥") }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['content']);

const router = useRouter();

const obtain = ref(null);
const screenHeight = ref(document.body.clientHeight);
const scrollHieght = ref(0);
const topSearchShow = ref(true); //展示 导航条
const topIndex = ref(0); // 当前滚动条位置 （取整）
const scrollTops = ref(0);
const open = ref('');
const currentIndex = ref(0); // 当前分类下标
const conData = ref(props.data); // 装修数据
const showContent = ref(true); // 是否展示内容

watch(
  () => props.data,
  (val) => {
    conData.value = val;
  }
);

watch(conData, (val) => {
  emit('content', val);
});

function handleScrollx() {
  // console.log('滚动高度',window.pageYOffset) // 获取滚动条的高度
  // console.log(obtain.value.getBoundingClientRect().top) //获取到距离顶部的距离
  // scrollHieght.value = Number(window.pageYOffset);//获取到距离顶部的距离
  // scrollTops.value = Number(obtain.value.getBoundingClientRect().top); // 获取到距离顶部的距离
  //    topSearchShow.value = true; // 展示图钉
  //     if(scrollTops.value < -660){ // 超过隐藏
  //       topSearchShow.value = false;
  // }
}

function toguid(path, id) {
  var path = path;
  var Id = id;
  localStorage.setItem('toId', Id);
  router.push(path);
}

function change(status) { //获取是否获取到图钉
  open.value = status
}

function gotoDemo() { // 跳转到demo的位置
  if (open.value) { // 获取到图钉之后在跳转当前位置
    document.querySelector("#demo").scrollIntoView(true);
  }
  //scrollIntoView()可以在所有的HTML元素上调用，通过滚动浏览器窗口或某个容器元素
}

function changeCurr(index) {
  // 选择分类
  currentIndex.value = index;
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollx, true)
});
</script>
<style lang="scss" scoped>
.not-enough {
  width: 100%;
  box-sizing: border-box;
}

:deep(.nav-affix.el-affix) {
  width: 100%;
}

.nav-bar {
  width: 100%;
  margin-bottom: 10px;
  background-color: #f8f8f8;
  height: 60px;
  box-sizing: border-box;
}

.nav-list {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;

  li {
    padding: 0 30px;
    text-align: center;
    p:nth-child(1) {
      font-size: 16px;
      border-radius: 50px;
      padding: 0 7px;
      margin: 0;
      line-height: 1.2;
    }

    p:nth-child(2) {
      font-size: 14px;
      color: #999;
      margin: 2px 0 0;
      line-height: 1.2;
    }

    &:hover {
      p {
        color: $theme_color;
      }
      cursor: pointer;
    }
    border-right: 1px solid #eee;
  }

  li:last-of-type {
    border: none;
  }

  .curr {
    p:nth-child(1) {
      background-color: $theme_color;
      color: #fff;
    }
    p:nth-child(2) {
      color: $theme_color;
    }
  }
}

.content {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  > div {
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #eee;
    margin-bottom: 10px;

    &:hover {
      border-color: $theme_color;
      color: $theme_color;
    }

    p:nth-of-type(1) {
      overflow: hidden;
      width: 210px;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 10px 0 5px 0;
    }
    p:nth-of-type(2) {
      color: $theme_color;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span:nth-child(2) {
        text-decoration: line-through;
        font-size: 12px;
        color: #999;
      }
    }
  }

}
</style>
