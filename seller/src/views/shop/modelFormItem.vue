<template>
  <div class="model-item" v-if="element && element.key">
    <!-- 轮播图模块，包括个人信息，快捷导航模块 -->
    <template v-if="element.type == 'carousel'">
      <model-carousel :data="element"></model-carousel>
    </template>
    <!-- 轮播图模块，100%宽度，无个人信息栏 -->
    <template v-if="element.type == 'carousel1'">
      <model-carousel1 class="mb_20" :data="element"></model-carousel1>
    </template>
    <!-- 轮播图模块，包括个人信息，两个轮播模块 -->
    <template v-if="element.type == 'carousel2'">
      <model-carousel2 class="mb_20" :data="element"></model-carousel2>
    </template>
    <!-- 热门广告 -->
    <template v-if="element.type == 'hotAdvert'">
      <div class="hot-advert">
        <div class="hot-advert-banner setup-content">
          <img
            :src="element.options.list[0].img"
            @click="$router.push(element.options.list[0].url)"
            alt=""
          />
          <div class="setup-box">
            <div>
              <el-button
                size="small"
                @click.stop="handleSelectModel(element.options.list[0])"
                >编辑</el-button
              >
            </div>
          </div>
        </div>
        <ul class="advert-list">
          <template v-for="(item, index) in element.options.list">
            <li
              v-if="index !== 0"
              @click="$router.push(item.url)"
              class="setup-content"
              :key="index"
            >
              <img :src="item.img" alt="" />
              <div class="setup-box">
                <div>
                  <el-button size="small" @click.stop="handleSelectModel(item)"
                    >编辑</el-button
                  >
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </template>
    <!-- 限时秒杀 待完善 -->
    <template v-if="element.type == 'seckill'">
      <seckill :data="element"></seckill>
    </template>
    <!-- 限时秒杀 待完善 -->
    <template v-if="element.type == 'seckill-only-album'">
      <seckill-only-album :data="element"></seckill-only-album>
    </template>
    <!-- 折扣广告 -->
    <template v-if="element.type == 'discountAdvert'">
      <div class="discountAdvert-wrap">
        <div
          class="discountAdvert"
          :style="{
            'background-image':
              'url(' + decorateImg + ')',
          }"
        >
          <div>
            <div
              v-for="(item, index) in element.options.classification"
              :key="index"
              class="setup-content"
            >
              <img :src="item.img" width="190" height="210" alt="" />
              <div class="setup-box">
                <div>
                  <el-button size="small" @click.stop="handleSelectModel(item)"
                    >编辑</el-button
                  >
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              v-for="(item, index) in element.options.brandList"
              :key="index"
              class="setup-content"
            >
              <img :src="item.img" width="240" height="105" alt="" />
              <div class="setup-box">
                <div>
                  <el-button size="small" @click.stop="handleSelectModel(item)"
                    >编辑</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- 好货推荐 -->
    <template v-if="element.type == 'recommend'">
      <recommend :data="element" class="mb_20 width_1200_auto"></recommend>
    </template>
    <!-- 新品排行 -->
    <template v-if="element.type == 'newGoodsSort'">
      <new-goods-sort :data="element" class="mb_20 width_1200_auto"></new-goods-sort>
    </template>
    <!-- 首页广告 -->
    <template v-if="element.type == 'firstAdvert'">
      <first-page-advert :data="element" class="mb_20 width_1200_auto"></first-page-advert>
    </template>
    <!-- 商品模块 -->
    <template v-if="element.type == 'goodsType'">
      <goodsType :data="element" class="mb_20 width_1200_auto"></goodsType>
    </template>
    <!-- 商品模块2 -->
    <template v-if="element.type == 'onlyGoodsModel'">
      <onlyGoodsModel :data="element" class="mb_20 width_1200_auto"></onlyGoodsModel>
    </template>
    <!-- 混合模块 -->
    <template v-if="element.type == 'mixModel'">
      <mixModel :data="element" class="mb_20 width_1200_auto"></mixModel>
    </template>
    <!-- 为你推荐 -->
    <template v-if="element.type == 'forYour'">
      <forYour :data="element" class="mb_20 width_1200_auto"></forYour>
    </template>
    <!-- 一行三列 -->
    <template v-if="element.type == 'oneRowThreeColumns'">
      <oneRowThreeColumns :data="element" class="mb_20 width_1200_auto"></oneRowThreeColumns>
    </template>
    <!-- 横幅广告 -->
    <template v-if="element.type == 'bannerAdvert'">
      <div class="horizontal-advert setup-content">
        <img
          v-if="element.options.img"
          class="banner-ad-img"
          :src="element.options.img"
          alt=""
        />
        <div v-else class="default-con">
          <p>广告图片</p>
          <p>1200*自定义</p>
        </div>
        <div class="setup-box">
          <div>
            <el-button
              size="small"
              @click.stop="handleSelectModel(element.options)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
    </template>
    <template v-if="element.type == 'notEnough'">
      <not-enough :data="element" class="mb_20 width_1200_auto"></not-enough>
    </template>
    <div class="del-btn">
      <el-button size="small" type="danger" @click="handleModelDelete">删除</el-button>
    </div>
    <el-dialog
      v-model="showModal"
      title="装修"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <div class="modal-top-advert">
        <div class="modal-form-item modal-form-preview">
          <!-- 热门广告两种图片尺寸 -->
          <img
            class="show-image"
            width="600"
            height="40"
            v-if="selected.size && selected.size.indexOf('1200') >= 0 && selected.img"
            :src="selected.img"
            alt
          />
          <img
            class="show-image"
            width="230"
            height="190"
            v-if="selected.size && selected.size.indexOf('230*190') >= 0"
            :src="selected.img"
            alt
          />
          <!-- 折扣广告三种图片尺寸 -->
          <img
            class="show-image"
            width="600"
            height="270"
            v-if="selected.size && selected.size.indexOf('1300') >= 0"
            :src="selected.img"
            alt
          />
          <img
            class="show-image"
            width="190"
            height="210"
            v-if="selected.size && selected.size.indexOf('190*210') >= 0"
            :src="selected.img"
            alt
          />
          <img
            class="show-image"
            width="240"
            height="105"
            v-if="selected.size && selected.size.indexOf('240*105') >= 0"
            :src="selected.img"
            alt
          />
        </div>
        <div class="tips">建议尺寸：{{ selected.size }}</div>
        <div class="modal-form-item modal-form-link">
          <span class="modal-label">图片链接：</span>
          <div class="modal-link-field">
            <el-input
              class="outsideUrl"
              v-model="selected.url"
              :disabled="!!selected.type && selected.type !== 'link'"
              placeholder="https://"
            />
            <el-button size="small" type="primary" @click="handleSelectLink"
              >选择链接</el-button
            >
          </div>
        </div>
        <div class="modal-form-item">
          <span class="modal-label">选择图片：</span>
          <el-button size="small" type="primary" @click="handleSelectImg"
            >选择图片</el-button
          >
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal">确定</el-button>
      </template>
    </el-dialog>
    <!-- 选择商品。链接 -->
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <!-- 选择图片 -->
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
import ModelCarousel from "./modelList/carousel.vue";
import ModelCarousel1 from "./modelList/carousel1.vue";
import ModelCarousel2 from "./modelList/carousel2.vue";
import FirstPageAdvert from "./modelList/firstPageAdvert.vue";
import NewGoodsSort from "./modelList/newGoodsSort.vue";
import Recommend from "./modelList/recommend.vue";
import NotEnough from "./modelList/notEnough.vue";
import Seckill from "./modelList/seckill.vue";
import goodsType from "./modelList/goodsAndType.vue";
import ossManage from "@/views/sys/oss-manage/ossManage";

import mixModel from "./modelList/mixModel.vue";
import forYour from "./modelList/forYour.vue";
import onlyGoodsModel from "./modelList/onlyGoodsModel.vue";

import oneRowThreeColumns from "./modelList/oneRowThreeColumns.vue";
import seckillOnlyAlbum from "./modelList/seckill-only-album.vue";
import decorateImg from "@/assets/nav/decorate.png";
export default {
  name: "modelFormItem",
  props: ["element", "select", "index", "data"],
  components: {
    ModelCarousel,
    ModelCarousel1,
    ModelCarousel2,
    Recommend,
    NewGoodsSort,
    FirstPageAdvert,
    NotEnough,
    Seckill,
    goodsType,
    ossManage,
    oneRowThreeColumns,
    "seckill-only-album":seckillOnlyAlbum,
    onlyGoodsModel,
    mixModel,
    forYour
  },
  data() {
    return {
      decorateImg,
      showModal: false, // modal显隐
      selected: {}, // 弹窗编辑草稿
      editTarget: null, // 确定后写回的原数据
      picModelFlag: false, // 图片选择器
    };
  },
  methods: {
    cloneItem(item) {
      return JSON.parse(JSON.stringify(item || {}));
    },
    // 编辑模块
    handleSelectModel(item) {
      this.editTarget = item;
      this.selected = this.cloneItem(item);
      this.showModal = true;
    },
    // 删除模块
    handleModelDelete() {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确定删除当前模块吗？</p>",
        onOk: () => {
          this.$nextTick(() => {
            this.data.list.splice(this.index, 1);
          });
        },
      });
    },
    handleSelectLink(item, index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
    },
    // 确定选择链接
    selectedLink(val) {
      this.selected.url = this.$filters.formatLinkType(val);
      this.selected.type =
        val.___type === "other" && val.url === "" ? "link" : "other";
    },

    handleSelectImg() {
      // 选择图片
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    // 回显图片
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!val?.url) return;
      this.selected.img = val.url;
    },
    handleCancelModal() {
      this.editTarget = null;
      this.selected = {};
      this.showModal = false;
    },
    handleConfirmModal() {
      if (this.editTarget) {
        Object.assign(this.editTarget, this.cloneItem(this.selected));
      }
      this.editTarget = null;
      this.selected = {};
      this.showModal = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./modelList/setup-box.scss";
.model-item {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;

  &:hover {
    .del-btn {
      display: block;
    }
  }
}

.model-item :deep(.width_1200_auto) {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.del-btn {
  position: absolute;
  left: 100%;
  right: auto;
  top: 0;
  width: auto;
  white-space: nowrap;
  display: none;
  z-index: 100;

  &:hover {
    display: block;
  }
}
/** 横幅广告 */
.horizontal-advert {
  width: 100%;
  max-width: 1200px;
  overflow: hidden;
  line-height: 0;

  .banner-ad-img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 166px;
    object-fit: cover;
  }

  .default-con {
    height: 100px;
    padding-top: 30px;
    text-align: center;
    background: #ddd;
    line-height: normal;
  }
}
/** 热门广告 */
.hot-advert {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  .hot-advert-banner {
    line-height: 0;
    width: 100%;

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }
}
.advert-list {
  width: 100%;
  margin: 0;
  padding: 10px;
  list-style: none;
  box-sizing: border-box;
  background: $theme_color;
  height: 210px;
  display: flex;
  gap: 10px;
  align-items: center;
  > li {
    flex: 1 1 0;
    min-width: 0;
    img {
      display: block;
      width: 100%;
      height: 190px;
      object-fit: cover;
      cursor: pointer;
      border-radius: 10px;
      transition: all 150ms ease-in-out;
      &:hover {
        transform: translateY(-3px);
        box-shadow: rgba(0, 0, 0, 0.4) 0px 5px 20px 0px;
      }
    }
  }
}
/** 限时秒杀 */
.limit-img {
  display: flex;
  flex-direction: row;
  img {
    width: 300px;
    height: 100px;
  }
}
/** 折扣广告 */
.discountAdvert-wrap {
  width: 100%;
  position: relative;
  overflow: hidden;
}
.discountAdvert {
  width: 1300px;
  height: 596px;
  margin-left: -100px;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: 1300px 596px;
  position: relative;
  > div {
    padding-left: 295px;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    &:nth-child(1) img {
      margin: 10px 10px 0 0;
    }
    &:nth-child(2) {
      margin-top: 10px;
      img {
        margin: 0 10px 0 0;
      }
    }
  }
}
/** 首页品牌 */
.brand {
  .brand-view {
    display: flex;
    margin-top: 10px;
    .brand-view-content {
      width: 470px;
      margin-left: 10px;
      img {
        width: 100%;
        height: 316px;
      }
      .brand-view-title {
        height: 50px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    .brand-view-content:first-child {
      width: 240px;
      margin-left: 0;
    }
  }
  .brand-list {
    margin-top: 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    li {
      width: 121px;
      height: 112px;
      position: relative;
      overflow: hidden;
      border: 1px solid #f5f5f5;
      margin: -1px -1px 0 0;
      &:hover {
        .brand-mash {
          display: flex;
        }
      }
      .brand-img {
        text-align: center;
        margin-top: 30px;
        img {
          width: 100px;
          height: auto;
        }
      }
      .brand-mash {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        width: inherit;
        height: inherit;
        font-size: 12px;
        font-weight: bold;
        .el-icon {
          position: absolute;
          right: 10px;
          top: 10px;
          font-size: 15px;
        }
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #fff;
        cursor: pointer;
        div:last-child {
          background-color: $theme_color;
          border-radius: 9px;
          padding: 0 10px;
          margin-top: 5px;
        }
      }
    }
    .refresh {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      .el-icon {
        font-size: 18px;
        transition: all 0.3s ease-out;
      }
      &:hover {
        background-color: $theme_color;
        color: #fff;
        .el-icon {
          transform: rotateZ(360deg);
        }
      }
    }
  }
}

/** 装修模态框 内部样式start */
.modal-top-advert {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;

  .modal-form-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;

    .modal-label {
      flex-shrink: 0;
      width: 100px;
      text-align: right;
      padding-right: 12px;
    }

    .el-input {
      flex: 1;
    }
  }

  .modal-form-preview {
    justify-content: center;
    margin-bottom: 8px;
  }

  .modal-form-link {
    align-items: flex-start;

    .modal-label {
      padding-top: 8px;
    }

    .modal-link-field {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;

      .outsideUrl {
        flex: 1;
        min-width: 0;
      }
    }
  }

  .tips {
    padding-left: 112px;
    margin-bottom: 16px;
    color: #999;
    font-size: 12px;
  }
}
</style>

