<template>
  <div class="cate-nav width_1200_auto" :class="{'fixed-show':useClass == 'fixed-show'}">
    <div class="nav-con" :class="{'background-white':useClass == 'background-white'}">
      <div
        class="all-categories hover-pointer"
        @mouseenter="showFirstLists"
        @mouseleave="showFirstList = false"
      >
        商品分类
      </div>
      <ul class="nav-item " v-if="showNavBar">
        <li
          class="nav-lis flex flex-a-c flex-j-c"
          v-for="(item, index) in navList.list"
          :key="index"
          @click="linkTo(item.url)"
        >
          {{ item.name }}
          <div class="colum" v-if="index !== navList.list.length - 1"></div>
        </li>
      </ul>
    </div>
    <!-- 全部商品分类 -->
    <div
      class="cate-list"
      :style="{'top':!showNavBar ?'60px':'46px'}"
      v-show="showAlways || showFirstList"
      @mouseenter="showFirstList = true"
      @mouseleave="showFirstList = false"
    >
      <!-- 第一级分类 -->
      <div
        class="nav-side"
        :class="{ 'large-nav': large, 'opacity-nav': opacity }"
        @mouseleave="panel = false"
      >
        <ul>
          <li
            v-for="(item, index) in cateList"
            :key="index"
            @mouseenter="showDetail(index)"
          >
            <span class="nav-side-item" @click="goGoodsList(item.id)">{{
              item.name
            }}</span>
            <span v-for="(second, secIndex) in item.children" :key="secIndex">
              <span v-if="secIndex < 2"> / </span>
              <span
                @click="goGoodsList(second.id, second.parentId)"
                class="nav-side-item"
                v-if="secIndex < 2"
                >{{ second.name }}</span
              >
            </span>
          </li>
        </ul>
      </div>
      <!-- 展开分类 -->
      <div
        class="detail-item-panel"
        :style="{ minHeight: large ? '470px' : '340px' }"
        v-show="panel"
        @mouseenter="panel = true"
        @mouseleave="panel = false"
      >
        <div class="nav-detail-item">
          <template v-for="(item,index) in panelData">
            <span
              @click="goGoodsList(item.id,item.parentId)"
              v-if="index < 8"
              :key="index"
              >{{ item.name }}<Icon type="ios-arrow-forward"
            /></span>
          </template>
        </div>
        <ul>
          <li
            v-for="(items, index) in panelData"
            :key="index"
            class="detail-item-row"
          >
            <span
              class="detail-item-title"
              @click="goGoodsList(items.id, items.parentId)"
            >
              {{ items.name }} <Icon type="ios-arrow-forward" />
              <span class="glyphicon glyphicon-menu-right"></span>
            </span>
            <div>
              <span
                v-for="(item, subIndex) in items.children"
                @click="goGoodsList(item.id, items.id, items.parentId)"
                :key="subIndex"
                class="detail-item"
                >{{ item.name }}</span
              >
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategory } from "@/api/goods";
import storage from "@/plugins/storage.js";
export default {
  name: "GoodsListNav",
  props: {
    showAlways: {
      // 总是显示下拉分类
      default: false,
      type: Boolean,
    },
    showNavBar: {
      // 显示全部商品分类右侧导航条
      default: true,
      type: Boolean,
    },
    hover: {
      default: false,
      type: Boolean,
    },
    large: {
      // 是否更高的高度
      default: false,
      type: Boolean,
    },
    opacity: {
      // 是否背景透明
      default: false,
      type: Boolean,
    },
    useClass:{
      type:null,
      default:''
    }
  },
  data() {
    return {
      panel: false, // 二级分类展示
      panelData: [], // 二级分类数据
      showFirstList: false, // 始终展示一级列表
      cateList: [], // 商品分类
    };
  },
  computed: {
    navList() {
      // 导航列表
      if (storage.getItem("navList")) {
        return JSON.parse(storage.getItem("navList"));
      } else {
        return [];
      }
    },
  },
  methods: {
    showFirstLists(){
      this.showFirstList = true;
      if(
      localStorage.getItem("category") &&
      localStorage.getItem("category_expiration_time")
    ) {
      // this.getCate();
      // 如果缓存过期，则获取最新的信息
      if (new Date() > localStorage.getItem("category_expiration_time")) {
        this.getCate();
        return;
      }
      this.cateList = JSON.parse(localStorage.getItem("category"));
      // this.$Message.info(cateList)
      }
    },
    getCate() {
      // 获取分类数据
      if (this.hover) return false;
      getCategory(0).then((res) => {
        if (res.success) {
          this.cateList = res.result;
          this.$store.commit("SET_CATEGORY", res.result);
          // 过期时间
          var expirationTime = new Date().setHours(new Date().getHours() + 1);
          // 存放过期时间
          localStorage.setItem("category_expiration_time", expirationTime);
          // 存放分类信息
          localStorage.setItem("category", JSON.stringify(res.result));
        }
      });
    },
    showDetail(index) {
      // 展示全部分类
      this.panel = true;
      this.panelData = this.cateList[index].children;
    },
    goGoodsList(id, secondId, firstId) {
      // 分类共有三级，传全部分类过去
      const arr = [firstId, secondId, id];
      if (!arr[1]) {
        arr.splice(0, 2);
      }
      if (!arr[0]) {
        arr.shift();
      }
      let routerUrl = this.$router.resolve({
        path: "/goodsList",
        query: { categoryId: arr.toString() },
      });
      window.open(routerUrl.href, "_blank");
    },
  },
  mounted() {
    if (
      localStorage.getItem("category") &&
      localStorage.getItem("category_expiration_time")
    ) {
      // 如果缓存过期，则获取最新的信息
      if (new Date() > localStorage.getItem("category_expiration_time")) {
        this.getCate();
        return;
      }
      this.cateList = JSON.parse(localStorage.getItem("category"));
    } else {
      this.getCate();
    }
  },
};
</script>

<style scoped lang="scss">
.background-white{
  background: #fff;
}
.nav-lis:hover {
  color: $theme_color !important;
  cursor: pointer;

}
.nav-lis{
  width: 103px;
  text-align: center;
  position: relative;
}
.fixed-show{
  margin-top: 0 !important;
  >.nav-con{
  >.all-categories{
    align-items: center !important;
    height: 60px;
    display: inherit;
    justify-content: center;
    padding: 0 !important;
  }
  }
}
.colum{
  height: 14.7px;
  opacity: 1;
  border: 0.7px solid #CBC8C8;
  position: absolute;
  right: 0;
}
.cate-nav {
  position: relative;
  margin: 14px auto 0 auto;
}
/** 商品分类 */
.nav-con {
  height: 46px;
  margin: 0 auto;
  display: flex;
  .all-categories {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding-left: 37.4px;
    background: #FFFFFF;
    width: 263.2px;
    padding-top: 15.4px;
    line-height: 20px;
    border-bottom: none;
    font-size: 16.8px;
    font-weight: normal;
    color: #333333;
    letter-spacing: 0px;
  }
  .nav-item {
    width: 914px;
    height: 46px;
    border-radius: 10px;
    background: #FFFFFF;
    margin-left: 10px;
    line-height: 46px;
    overflow: hidden;
    list-style: none;
    // background-color: #eee;
    display: flex;
    li {
      float: left;
      font-size: 17px;
      font-weight: normal;
      color: #333333;


      &:hover {
        color: $theme_color;
      }
    }
  }
}
// 分类列表
.cate-list {
  margin: 0 auto;
  position: absolute;

  z-index: 1000;
}

.nav-side {
  width: 263.2px;
  color: #666;
  float: left;
  overflow:hidden;

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: #fff;
  height: 340px;
  ////自动移滚动条样式
  //&::-webkit-scrollbar {
  //  width: 1px;
  //  height: 5px;
  //}
  //&::-webkit-scrollbar-thumb {
  //  border-radius: 1em;
  //  background-color: rgba(50, 50, 50, 0.3);
  //}
  //&::-webkit-scrollbar-track {
  //  border-radius: 1em;
  //  background-color: rgba(50, 50, 50, 0.1);
  //}
}
.large-nav {
  height: 470px;
  ul > li {
    line-height: 20px;
  }
}
.opacity-nav {
  background-color: rgba(0, 0, 0, 0.5);
}
.nav-side ul {
  width: 100%;
  list-style: none;
}
.nav-side li {
  padding: 0 0 16.2px 37.4px;
  font-size: 13px;
  line-height: 18px;
}
.nav-side-item:hover {
  cursor: pointer;
  color: $theme_color;
}

/*显示商品详细信息*/
.detail-item-panel {
  width: 1000px;
  min-height: 340px;
  background-color: #fff;
  box-shadow: 0px 0px 15px #ccc;
  position: absolute;
  top: 0;
  left: 200px;
  z-index: 1000;
  padding: 15px;
}
.nav-detail-item {
  margin-top: 5px;
  margin-bottom: 15px;
  cursor: pointer;
  color: #eee;
}
.nav-detail-item span {
  padding: 6px;
  padding-left: 12px;
  margin-right: 15px;
  font-size: 12px;
  color: #333;
}
.nav-detail-item span:hover {
  background-color: $theme_color;
  color: #fff;
}
.detail-item-panel li {
  line-height: 30px;
}
.detail-item-title {
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  color: #555555;
  padding-right: 10px;
  width: 81px;
  text-align: right;
}
.detail-item-title:hover {
  color: $theme_color;
}
.detail-item-row {
  display: flex;
  > div {
    flex: 1;
  }
}
.detail-item {
  font-size: 12px;
  padding-left: 8px;
  padding-right: 8px;
  cursor: pointer;
  border-left: 1px solid #ccc;
  &:first-child {
    border: none;
    padding-left: 0;
  }
}
.detail-item:hover {
  color: $theme_color;
}
</style>
