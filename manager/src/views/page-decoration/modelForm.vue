<template>
  <div class="model-form">
    <div class="model-content">
      <div
        class="top-fixed-advert"
        :style="{ backgroundColor: topAdvert.bgColor }"
      >
        <img :src="topAdvert.img" width="1200" height="80" alt="" />
        <div class="setup-box">
          <el-button size="small" @click.stop="handleModel('topAdvert')">编辑</el-button>
        </div>
      </div>
      <div class="header-con">
        <div></div>
        <ul class="detail">
          <li>立即注册</li>
          <li>请登录</li>
          <li>我的订单</li>
          <li>我的足迹</li>
          <li>
            <el-icon :size="18"><ShoppingCart /></el-icon>
            购物车
          </li>
          <li>店铺入驻</li>
        </ul>
      </div>
      <div class="search-con">
        <img :src="logoImg" class="logo" alt="" />
        <div class="search">
          <el-input
            size="large"
            class="search-input"
            placeholder="输入你想查找的商品"
          />
          <div class="search-btn">搜索</div>
        </div>
      </div>
      <div class="nav-con" v-if="$route.query.pageType !== 'SPECIAL'">
        <div class="all-categories">全部商品分类</div>
        <ul class="nav-item">
          <li v-for="(item, index) in navList.list" :key="index">
            <a href="#">{{ item.name }}</a>
          </li>
        </ul>
        <div class="setup-box">
          <el-button size="small" @click.stop="handleModel('quickNav')">编辑</el-button>
        </div>
      </div>
      <div>
        <draggable
          class="model-form-list"
          v-model="data.list"
          :item-key="getModelItemKey"
          group="model"
          ghost-class="ghost"
          @end="handleMoveEnd"
          @add="handleModelAdd"
        >
          <template #item="{ element, index }">
            <model-form-item
              v-if="element && element.key"
              :element="element"
              :index="index"
              :data="data"
            />
          </template>
        </draggable>
      </div>
    </div>
    <el-dialog
      v-model="showModal"
      title="顶部广告"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      @close="handleCancelTopAdvertModal"
    >
      <div class="modal-top-advert" v-if="draftTopAdvert">
        <div>
          <img class="show-image" width="600" height="40" :src="draftTopAdvert.img" alt />
        </div>
        <div class="tips">建议尺寸：<span>{{ draftTopAdvert.size }}</span></div>
        <div>
          图片链接：<el-input
            class="outsideUrl"
            v-model="draftTopAdvert.url"
            :disabled="!!draftTopAdvert.type && draftTopAdvert.type !== 'link'"
            placeholder="https://"
          />
          <el-button size="small" type="primary" @click="handleSelectLink">选择链接</el-button>
        </div>
        <div>
          选择图片：<el-button size="small" type="primary" @click="handleSelectImg">选择图片</el-button>
        </div>
        <div>选择背景色：<el-color-picker v-model="draftTopAdvert.bgColor" /></div>
      </div>
      <template #footer>
        <el-button @click="handleCancelTopAdvertModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmTopAdvertModal">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showModalNav"
      title="快捷导航"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      @close="handleNavDialogClose"
    >
      <div class="modal-tab-bar">
        <el-button type="primary" size="small" @click="handleAddNav">添加分类</el-button>
        <table cellspacing="0">
          <thead>
            <tr>
              <th width="250">分类名称</th>
              <th width="250">链接地址</th>
              <th width="250">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in navList.list" :key="index">
              <td><el-input v-model="item.name" /></td>
              <td>
                <el-input
                  v-model="item.url"
                  :disabled="!item.title || item.title !== '外部链接'"
                />
              </td>
              <td>
                <el-button type="primary" size="small" @click="handleSelectLink(item, index)">选择链接</el-button>
                <el-button type="danger" size="small" @click="handleDelNav(index)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <el-button @click="handleCancelNavModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmNavModal">确定</el-button>
      </template>
    </el-dialog>
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        @callback="callbackSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        ref="ossManage"
      />
    </el-dialog>
  </div>
</template>
<script>
import { ShoppingCart } from "@element-plus/icons-vue";
import Draggable from "vuedraggable";
import ModelFormItem from "./modelFormItem.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import logoImg from "@/assets/logo.png";
export default {
  name: "modelForm",
  components: {
    Draggable,
    ModelFormItem,
    ossManage,
    ShoppingCart,
  },
  props: ["data"],
  data() {
    return {
      logoImg,
      picModelFlag: false,
      showModal: false,
      showModalNav: false,
      navListBackup: null,
      draftTopAdvert: null,
      selectedNav: null,
      promotionTags: ["买2免1", "领200神券", "199减100", "母婴5折抢", "充100送20"],
      topAdvert: {
        type: "topAdvert",
        img: "",
        url: "",
        bgColor: "#de000d",
        size: "1200*80",
      },
      currentIndex: 0,
      navList: {
        type: "navBar",
        list: [
          { name: "秒杀", url: "", title: "" },
          { name: "闪购", url: "", title: "" },
          { name: "优惠券", url: "", title: "" },
          { name: "拍卖", url: "", title: "" },
          { name: "服装城", url: "", title: "" },
        ],
      },
    };
  },
  mounted() {
    document.body.ondrop = function (event) {
      let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
      if (isFirefox) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
  },
  methods: {
    getModelItemKey(element) {
      return element.model || element.key || element.type;
    },
    handleSelectLink(item, index) {
      if (item) this.selectedNav = item;
      this.$refs.liliDialog.open("link");
      this.currentIndex = index;
    },
    selectedLink(val) {
      if (this.showModalNav) {
        this.selectedNav.url = this.$filters.formatLinkType(val);
        this.selectedNav.type = val.___type === "other" && val.url === "" ? "link" : "other";
        this.navList.list[this.currentIndex].title = val.title;
      } else if (this.showModal && this.draftTopAdvert) {
        this.draftTopAdvert.url = this.$filters.formatLinkType(val);
        this.draftTopAdvert.type = val.___type === "other" && val.url === "" ? "link" : "other";
      }
    },
    handleDelNav(index) {
      this.navList.list.splice(index, 1);
    },
    handleAddNav() {
      this.navList.list.push({ name: "", url: "", title: "" });
    },
    handleMoveEnd({ newIndex, oldIndex }) {
      console.log("index", newIndex, oldIndex);
    },
    handleModel(type) {
      if (type == "topAdvert") {
        this.draftTopAdvert = JSON.parse(JSON.stringify(this.topAdvert));
        this.showModal = true;
      } else {
        this.navListBackup = JSON.parse(JSON.stringify(this.navList));
        this.showModalNav = true;
      }
    },
    handleCancelTopAdvertModal() {
      this.draftTopAdvert = null;
      this.showModal = false;
    },
    handleConfirmTopAdvertModal() {
      if (this.draftTopAdvert) {
        Object.assign(this.topAdvert, JSON.parse(JSON.stringify(this.draftTopAdvert)));
      }
      this.draftTopAdvert = null;
      this.showModal = false;
    },
    handleCancelNavModal() {
      this.showModalNav = false;
    },
    handleConfirmNavModal() {
      this.navListBackup = null;
      this.showModalNav = false;
    },
    handleNavDialogClose() {
      if (this.navListBackup) {
        this.navList = JSON.parse(JSON.stringify(this.navListBackup));
        this.navListBackup = null;
      }
    },
    handleSelectImg() {
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    callbackSelected(item) {
      this.picModelFlag = false;
      if (!item?.url || !this.draftTopAdvert) return;
      this.draftTopAdvert.img = item.url;
    },
    handleModelAdd(evt) {
      const newIndex = evt.newIndex;
      const current = this.data.list[newIndex];
      if (!current || current.key) {
        return;
      }
      const key = Date.now() + "_" + Math.ceil(Math.random() * 99999);
      this.data.list[newIndex] = {
        ...JSON.parse(JSON.stringify(current)),
        options: {
          ...current.options,
        },
        key,
        model: current.type + "_" + key,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./modelList/setup-box.scss";
.model-form {
  width: 1500px;
  max-width: 100%;
}
.model-content {
  width: 1200px;
  margin: 0 auto;
  background: #fff;
  min-height: 1200px;
  overflow-x: visible;
}
.model-form-list {
  min-height: 500px;
  box-sizing: border-box;
}
.top-fixed-advert {
  display: flex;
  width: 1500px;
  margin-left: -150px;
  background: $theme_color;
  justify-content: center;
}

.header-con {
  display: flex;
  justify-content: space-between;
  height: 35px;
  padding: 0 15px;
  line-height: 35px;
  color: #999;
  font-weight: bold;
  div,
  li {
    &:hover {
      color: $theme_color;
      cursor: pointer;
    }
  }
  .detail {
    display: flex;
    > li {
      margin-left: 10px;
      &::after {
        content: "|";
        padding-left: 10px;
      }
      &:last-child::after {
        content: "";
        padding-left: 0;
      }
      &:hover::after {
        color: #999;
      }
    }
  }
}
.search-con {
  padding-top: 15px;
  margin: 0px auto;
  margin-bottom: 10px;
  width: 1200px;
  position: relative;
  .logo {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 150px;
    height: 50px;
  }
  .search {
    $search-height: 34px;
    $search-btn-width: 60px;
    $btn-gap: 3px;

    position: relative;
    width: 460px;
    height: $search-height;
    margin: 0 auto;

    .search-input {
      width: 100%;

      :deep(.el-input__wrapper) {
        border: 2px solid $theme_color;
        border-radius: calc($search-height / 2);
        box-sizing: border-box;
        padding-right: calc($search-btn-width + $btn-gap * 2);
        font-size: 12px;
        height: $search-height;
        box-shadow: none;
      }
    }

    .search-btn {
      position: absolute;
      top: $btn-gap;
      right: $btn-gap;
      bottom: $btn-gap;
      width: $search-btn-width;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border-radius: calc(($search-height - $btn-gap * 2) / 2);
      background-color: $theme_color;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      line-height: 1;
      cursor: default;
      user-select: none;
    }
  }
}
.nav-con {
  width: 1200px;
  height: 40px;
  background: #eee;
  display: flex;
  .all-categories {
    width: 200px;
    line-height: 40px;
    color: #fff;
    background-color: $theme_color;
    text-align: center;
    font-size: 16px;
  }
  .nav-item {
    width: 1000px;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    list-style: none;
    background-color: #eee;
    display: flex;
    li {
      font-size: 16px;
      font-weight: bold;
      margin-left: 20px;
      a {
        color: rgb(89, 88, 88);
        font-size: 15px;
        &:hover {
          color: $theme_color;
        }
      }
    }
  }
}

.top-fixed-advert,
.nav-con {
  position: relative;
  &:hover {
    .setup-box {
      display: block;
    }
  }
}
.modal-top-advert {
  align-items: start;
  padding: 0 30px;
}
</style>
