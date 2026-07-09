<template>
  <div class="decorate">
    <div class="decorate-title">
      {{ res.name }}

      <el-button
        style="margin-left: 20px"
        size="small"
        plain
        v-if="
          res.type == 'tpl_ad_list' ||
          res.type == 'tpl_activity_list' ||
          res.drawer
        "
        type="primary"
        @click="selectStyle()"
        >选择风格</el-button
      >
      <el-button
        style="margin-left: 20px"
        size="small"
        plain
        v-if="res.type == 'promotions' || res.drawerPromotions"
        type="primary"
        @click="selectPromotions()"
        >选择促销活动</el-button
      >
    </div>
    <el-alert
      v-if="res.name == '商品分类'"
      type="warning"
      title="装修提示"
      :closable="false"
    >
      <template #default>
        <div style="color: red">
          如果当前装修模块不是最后一项模块且模块内容绑定为分类，则会默认展示绑定分类的100条商品信息。
        </div>
        <div style="color: red">
          如果当前装修模块是最后一项模块且模块内容绑定为分类，则会默认会根据绑定分类触底加载商品信息。
        </div>
        <div style="color: red">
          如果当前装修内容不为分类，则会展示当前商品的静态信息。
        </div>
      </template>
    </el-alert>

    <!-- 右侧显示抽屉 -->
    <el-drawer
      title="选择风格"
      :show-close="false"
      size="400px"
      v-model="styleFlag"
      append-to-body
      destroy-on-close
    >
      <div class="drawer">
        <template v-for="(item, index) in modelData" :key="index">
          <div
            v-if="item.drawer"
            class="drawer-item"
            @click="clickDrawer(item, index)"
          >
            <img src alt />
            <span>{{ item.name }}</span>
          </div>
        </template>
      </div>
    </el-drawer>

    <!-- 右侧显示抽屉 -->
    <el-drawer
      title="选择促销活动(最多只能展示两个活动)"
      :show-close="false"
      size="400px"
      v-model="promotionsFlag"
      append-to-body
      destroy-on-close
    >
      <div class="drawer">
        <template v-for="(item, index) in modelData" :key="index">
          <div
            v-if="item.drawerPromotions"
            class="drawer-item"
            @click="clickDrawer(item, index)"
          >
            <img src alt />
            <span>{{ item.name }}</span>
          </div>
        </template>
      </div>
    </el-drawer>

    <!-- 卡片集合 -->
    <div
      class="decorate-list"
      v-if="
        (res.type != 'tpl_ad_list' &&
          res.type != 'tpl_activity_list' &&
          res.type != 'promotions') ||
        res.drawer ||
        res.drawerPromotions
      "
    >
      <div
        class="decorate-item"
        v-for="(item, index) in res.options.list"
        :key="index"
      >
        <div class="decorate-item-title" v-if="res.type != 'video'">
          <div>卡片</div>
          <el-icon
            v-if="res.close || res.type == 'promotionDetail'"
            @click="closeDecorate(index)"
            :size="20"
            color="#e1251b"
            class="close-icon"
          >
            <CircleClose />
          </el-icon>
        </div>

        <div class="decorate-item-box">
          <template v-if="item.titleWay">
          <div
            class="decorate-border"
            v-for="(title_item, title_index) in item.titleWay"
            :key="title_index"
          >
            <div class="decorate-view">
              <div class="decorate-view-title">标题{{ title_index + 1 }}</div>
              <div>
                <el-input v-model="title_item.title" />
              </div>
            </div>
            <div class="decorate-view">
              <div class="decorate-view-title">描述</div>
              <div>
                <el-input v-model="title_item.desc" />
              </div>
            </div>
            <div class="decorate-view">
              <div class="decorate-view-title">绑定</div>
              <div class="decorate-view-link">
                <div v-if="res.options.list[0].listWay.length != 0">
                  <!-- 绑定商品选择器回调已选择的商品 -->

                  <template
                    v-for="(bindGoods, bindGoodsIndex) in res.options.list[0].listWay"
                    :key="bindGoodsIndex"
                  >
                  <div
                    v-if="
                      title_item.___index == bindGoods.___index ||
                      title_item.title == bindGoods.type
                    "
                    class="title-item wes-2"
                  >
                    <el-tooltip placement="left" :content="bindGoods.title">
                      <div class="title-goodsName">
                        {{ bindGoods.title }}
                      </div>
                    </el-tooltip>
                    <div class="title-btn">
                      <el-button
                        @click="
                          slotGoods(
                            res.options.list[0].listWay,
                            title_item.___index,
                            bindGoods,
                            'up'
                          )
                        "
                        style="margin-right: 10px"
                        size="small"
                        >上移</el-button
                      >
                    </div>
                  </div>
                  </template>
                </div>
                <!-- 显示绑定分类 -->
                <div v-if="title_item.bindCategory">
                  绑定分类为：{{ title_item.bindCategory.name }}
                </div>
              </div>

              <div class="decorate-view-btn">
                <el-button
                  @click="bindGoodsId(title_item, title_index)"
                  size="small"
                  >选择商品</el-button
                >
                <el-button
                  @click="bindGoodsCategory(title_index)"
                  size="small"
                  >选择分类</el-button
                >
              </div>
            </div>
          </div>
          </template>
          <div class="decorate-view" v-if="res.type == 'carousel'">
            <div class="decorate-view-title">
              <el-button
                @click="slotBanner(res, item, index, 'up')"
                style="margin-right: 10px"
                size="small"
                >上移</el-button
              ><el-button
                @click="slotBanner(res, item, index, 'down')"
                size="small"
                >下移</el-button
              >
            </div>
          </div>
          <!-- 选择照片 -->
          <div class="decorate-view" v-if="!res.notImg">
            <div class="decorate-view-title">选择照片</div>
            <div>
              <img class="show-image" :src="item.img" alt />

              <div class="tips" v-if="!res.onlyImg">
                建议尺寸
                <span>{{ item.size }}</span>
              </div>
            </div>
            <div class="selectBtn">
              <el-button
                size="small"
                @click="handleClickFile(item, index)"
                plain
                type="primary"
                >选择照片</el-button
              >
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="item.title != void 0 && !res.notTitle && res.type == 'title'"
          >
            <div class="decorate-view-title">文字对齐方式</div>
            <div class="card-box">
              <div
                class="card"
                :class="{ active: textAlign == 'left' }"
                @click="changeTextAlign('left')"
              >
                <img
                  :src="alignTextLeft"
                  class="align-text"
                  alt=""
                />
              </div>
              <div
                class="card"
                :class="{ active: textAlign == 'center' }"
                @click="changeTextAlign('center')"
              >
                <img
                  :src="alignTextCenter"
                  class="align-text"
                  alt=""
                />
              </div>
              <!-- <div
                class="card"
                :class="{ active: textAlign == 'right' }"
                @click="changeTextAlign('right')"
              >
                <img
                  :src="alignTextRight"
                  class="align-text"
                  alt=""
                />
              </div> -->
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="
              item.title != void 0 &&
              !res.notTitle &&
              (res.type == 'title' ||
                res.type == 'notice' ||
                res.type == 'promotionDetail')
            "
          >
            <div class="decorate-view-title">背景颜色</div>
            <div class="decorate-view">
              <el-color-picker v-model="item.bk_color" />
              <el-input v-model="item.bk_color" />
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="item.title != void 0 && !res.notTitle && res.type == 'notice'"
          >
            <div class="decorate-view-title">方向</div>
            <div class="decorate-view">
              <el-select
                style="width: 200px"
                @change="changeDirection($event, item)"
                v-model="item.direction"
              >
                {{ item.direction }}
                <el-option label="横向" value="horizontal"></el-option>
                <el-option label="纵向" value="vertical"></el-option>
              </el-select>
            </div>
          </div>

          <!-- 填写标题 -->
          <div
            class="decorate-view"
            v-if="item.title != void 0 && !res.notTitle && res.type != 'notice'"
          >
            <div class="decorate-view-title">菜单标题</div>
            <div>
              <el-input v-model="item.title" style="width: 200px" />
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="
              item.title != void 0 &&
              !res.notTitle &&
              (res.type == 'title' || res.type == 'notice')
            "
          >
            <div class="decorate-view-title">标题颜色</div>
            <div class="decorate-view">
              <el-color-picker v-model="item.color" />
              <el-input v-model="item.color" />
            </div>
          </div>
          <!-- 填写小标题 -->
          <div
            class="decorate-view"
            v-if="item.title1 != void 0 && !res.notTitle"
          >
            <div class="decorate-view-title">小标题</div>
            <div>
              <el-input v-model="item.title1" style="width: 200px" />
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="item.title1 != void 0 && !res.notTitle"
          >
            <div class="decorate-view-title">小标题颜色</div>
            <div class="decorate-view">
              <el-color-picker v-model="item.color1" />
              <el-input v-model="item.color1" />
            </div>
          </div>
          <div
            class="decorate-view"
            v-if="res.type === 'notice' && !res.notTitle"
          >
            <div class="decorate-view-title">公告内容</div>
            <div>
              <div
                v-for="(t, tindex) in item.title"
                :key="tindex"
                class="decorate-notice"
              >
                <el-input v-model="t.context" style="width: 200px" />
                <el-icon @click="removeNotice(tindex)" :size="16" color="#e1251b">
                  <CircleClose />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 视频楼层配置 -->
          <video-config
            v-if="res.type == 'video'"
            :item="item"
            @select-file="(field) => handleClickFile(item, index, field)"
          />

          <!-- 填写链接 -->

          <div class="decorate-view" v-if="res.onlyImg">
            <div class="decorate-view-title">选择模式</div>

            <div>
              <el-radio-group v-model="item.model">
                <el-radio value="link">链接</el-radio>
                <el-radio value="hotzone">热区</el-radio>
              </el-radio-group>
            </div>
          </div>

          <div class="decorate-view" v-if="!res.notLink">
            <div class="decorate-view-title">选择链接</div>
            <div
              v-if="item.url && item.url.length != 0"
              class="decorate-view-link"
            >
              已选链接：

              <span>
                {{
                  ways.find((e) => {
                    return item.url.___type == e.name;
                  })
                    ? ways.find((e) => {
                        return item.url.___type == e.name;
                      }).title
                    : "发现"
                }}
                -
                <!-- 当选择完链接之后的专题名称 -->
                <span v-if="item.url.pageType == 'special'">
                  {{ item.url.name }}</span
                >
                <!-- 当选择完链接之后的商品名称 -->
                <span v-if="item.url.___type == 'goods'">
                  {{ item.url.goodsName }}</span
                >
                <!-- 当选择完链接之后的分类回调 -->
                <span v-if="item.url.___type == 'category'">
                  {{ item.url.name }}</span
                >
                <!-- 当选择完链接之后的店铺回调 -->
                <span v-if="item.url.___type == 'shops'">
                  {{ item.url.memberName }}</span
                >
                <!-- 当选择完链接之后的其他回调 -->
                <span v-if="item.url.___type == 'other'">
                  {{ item.url.title }}</span
                >

                <!-- 当选择完活动之后的其他回调 -->
                <span v-if="item.url.___type == 'marketing'">
                  <span v-if="item.url.___promotion == 'SECKILL'"> 秒杀 </span>
                  <span v-if="item.url.___promotion == 'FULL_DISCOUNT'">
                    满减
                  </span>
                  <span v-if="item.url.___promotion == 'PINTUAN'"> 拼团 </span>
                  {{ item.url.title || item.url.goodsName }}</span>
                <!-- 当选择完活动之后的其他回调 -->
                <span v-if="item.url.___type == 'pages'">
                  {{ item.url.title }}</span
                >
              </span>
            </div>
            <div>
              <el-button
                plain
                size="small"
                type="primary"
                @click="clickLink(item, index, res)"
              >
                {{ item.model === "hotzone" ? "绘制热区" : "选择链接" }}</el-button
              >
            </div>
          </div>
          <!-- 链接地址-->
          <div
            class="decorate-view"
            v-if="
              item.url &&
              item.url.url !== undefined &&
              item.url.___type == 'other'
            "
          >
            <div class="decorate-view-title">外部链接</div>
            <div>
              <el-input v-model="item.url.url" style="width: 200px" />
            </div>
          </div>

          <p
            v-if="
              item.url &&
              item.url.url !== undefined &&
              item.url.___type == 'other'
            "
          >
            (如非同域名下，则在小程序与公众号中无效)
          </p>
        </div>
      </div>
    </div>

    <el-button
      v-if="
        res.type != 'tpl_ad_list' &&
        res.type != 'tpl_activity_list' &&
        !res.notAdd &&
        res.direction != 'horizontal'
      "
      type="primary"
      @click="addDecorate(res.type, res)"
      plain
      >添加</el-button
    >

    <liliDialog
      ref="liliDialog"
      @selectedLink="selectedLink"
      @selectedGoodsData="selectedGoodsData"
    ></liliDialog>

    <el-dialog
      width="800px"
      title="选择分类"
      v-model="enableSelectCategory"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleCancelCategoryModal"
    >
      <categoryTemplate
        v-if="enableSelectCategory"
        @selected="onCategorySelected"
      />
      <template #footer>
        <el-button @click="handleCancelCategoryModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmCategoryModal">确定</el-button>
      </template>
    </el-dialog>

    <hotzone ref="hotzone" @changeZone="changeZone"></hotzone>

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
import { CircleClose } from "@element-plus/icons-vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { modelData } from "./config";
import hotzone from "@/components/hotzone";
import ways from "@/components/lili-dialog/wap.js";
import categoryTemplate from "@/components/lili-dialog/template/category";
import VideoConfig from "./video-config";
import alignTextLeft from "@/assets/align-text-left.png";
import alignTextCenter from "@/assets/align-text-center.png";
import alignTextRight from "@/assets/align-text-right.png";
export default {
  components: {
    ossManage,
    hotzone,
    categoryTemplate,
    CircleClose,
    VideoConfig,
  },
  data() {
    return {
      alignTextLeft,
      alignTextCenter,
      alignTextRight,
      ways, // 选择链接的类型
      picModelFlag: false, //图片选择器
      linkType: "goods", // dialog弹窗口类型
      styleFlag: false, //广告魔方开关
      textAlign: this.res.options.list[0]
        ? this.res.options.list[0].textAlign
        : "center", //文字对齐方式
      promotionsFlag: false, //广告魔方开关
      selectedLinkIndex: "", //选择链接的索引
      modelData, // 装修数据
      selectedGoods: "", // 已选商品
      selectedLinks: "", // 已选链接
      modelList: "", // 装修列表
      enableSelectCategory: false, //商品是否绑定分类
      pendingCategory: null, // 选择分类弹窗草稿
      goodsSelectedIndex: 0, //绑定商品分类的索引
      pictureField: "img", //图片选择器回写的字段
    };
  },
  watch: {
    res: {
      handler: (val) => {},
      deep: true,
    },
  },
  props: ["res"],
  methods: {
    // 选择分类（弹窗内暂存，确定后写回）
    onCategorySelected(val) {
      this.pendingCategory = val;
    },
    handleCancelCategoryModal() {
      this.pendingCategory = null;
      this.enableSelectCategory = false;
    },
    handleConfirmCategoryModal() {
      if (this.pendingCategory?.length) {
        this.confirmCategory(this.pendingCategory);
      }
      this.pendingCategory = null;
      this.enableSelectCategory = false;
    },
    confirmCategory(val) {
      let data = {
        ...this.res.options.list[0].titleWay[this.goodsSelectedIndex],
      };
      let callback = {
        id: val[0].id,
        name: val[0].name,
        categoryIdWay: val[0].id,
      };
      data = {
        ...data,
        bindCategory: callback,
      };
      this.res.options.list[0].listWay =
        this.res.options.list[0].listWay.filter((item) => {
          return item.___index != this.goodsSelectedIndex;
        });
      this.res.options.list[0].titleWay[this.goodsSelectedIndex] = data;

      console.log(this.res.options.list[0]);
    },
    // 商品排序
    slotGoods(list, key, val) {
      const newVal = [];
      let newValIndex = 0;
      // 给当前点击的商品分组
      list.forEach((item, index) => {
        if (item.___index == key) {
          newVal.push(item);
        }
      });
      // 获得当前点击商品的索引
      newVal.forEach((item, index) => {
        if (item.id == val.id) {
          newValIndex = index;
        }
      });
      // 进行商品排序
      this.upData(newVal, newValIndex);
      if (list.length == newVal.length) {
        list = newVal;
      } else {
        let newList;
        newVal.forEach((item, index) => {
          newList = list.filter((child) => {
            return child.id != item.id && child.___index != key;
          });
        });
        list = [...newList, ...newVal];
      }

      this.res.options.list[0]["listWay"] = list;
    },

    // 轮播图排序
    slotBanner(val, key, index, down) {
      console.log(val);
      if (down == "down") {
        this.downData(val.options.list, index);
      } else {
        this.upData(val.options.list, index);
      }
    },
    upData(arr, index) {
      let newArr = [];
      if (arr.length > 1 && index !== 0) {
        newArr = this.swapItems(arr, index, index - 1);
      }
      return newArr;
    },
    swapItems(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    downData(arr, index) {
      let newArr = [];
      if (arr.length > 1 && index !== arr.length - 1) {
        newArr = this.swapItems(arr, index, index + 1);
      }
      return newArr;
    },
    // 改变横纵切换title内容
    changeDirection(val, data) {
      if (val == "horizontal") {
        const props = { ...data };
        data.title = [];
        data.title.push(props.title[0]);
      }
    },
    // 选择风格
    selectStyle() {
      this.styleFlag = !this.styleFlag;
    },
    selectPromotions() {
      this.promotionsFlag = !this.promotionsFlag;
    },
    // 回调选择的链接
    selectedLink(val) {
      this.selectedLinks.zoneInfo = [];
      delete val.selected;
      delete val.intro;
      delete val.mobileIntro;
      this.selectedLinks.url = val;
    },
    // 回调的商品信息
    selectedGoodsData(val) {
      if (!val) return false;
      let data = val.map((item) => {
        delete item.selected;
        delete item.intro;
        delete item.mobileIntro;
        return {
          img: item.thumbnail,
          title: item.goodsName,
          type: this.selectedGoods.title,
          ___index: this.selectedGoods.___index,
          ...item,
        };
      });
      this.res.options.list[0].listWay.push(...data);
      // 清除已经绑定的分类
      this.res.options.list[0].titleWay[this.goodsSelectedIndex].bindCategory =
        "";
      this.linkType = "";
    },
    // 绑定商品
    bindGoodsId(val, index) {
      this.selectedGoods = val;
      this.goodsSelectedIndex = index;
      this.liliDialogFlag(true);
    },
    // 绑定分类
    bindGoodsCategory(index, key) {
      this.pendingCategory = null;
      this.enableSelectCategory = true;
      this.goodsSelectedIndex = index;
    },
    // 点击抽屉
    clickDrawer(item, index) {
      this.$emit("handleDrawer", item);
      this.styleFlag = false;
      this.promotionsFlag = false;
    },
    // 打开图片选择器
    liliDialogFlag(flag) {
      this.$refs.liliDialog.clearGoodsSelected();
      this.$refs.liliDialog.goodsFlag = flag;
      this.$refs.liliDialog.flag = true;
    },

    changeTextAlign(val) {
      this.res.options.list[0].textAlign = val;
      this.textAlign = val;
    },
    // 点击链接赋值一个唯一值，并将当前选择的模块赋值
    clickLink(val, index, oval) {
      this.selectedLinks = val;
      if (val.model === "hotzone") {
        if (!val.zoneInfo) {
          val.zoneInfo = [];
        }
        this.$refs.hotzone.open(val);
      } else {
        this.liliDialogFlag(false);
      }
    },
    addZone(zoneInfo) {
      this.selectedLinks.zoneInfo.push(zoneInfo);
    },
    changeZone(zoneInfo) {
      this.selectedLinks.zoneInfo = zoneInfo;
    },
    //点击图片解析成base64
    changeFile(item, index) {
      const file = document.getElementById("files" + index).files[0];
      if (file == void 0) return false;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.$nextTick((res) => {
        reader.onload = (e) => {
          item.img = e.target.result;
        };
      });
    },
    //添加设置
    addDecorate(type, data) {
      if (type === "notice") {
        if (data.options.list[0].direction == "vertical") {
          this.res.options.list[0].title.push({
            content: "",
          });
        } else {
          this.$Message.error("仅纵向支持多添加");
        }
      } else {
        let way = {
          img: "https://picsum.photos/id/264/200/200",
          title: "标题",
          link: "",
          url: "",
          size: this.res.options.list[0] ? this.res.options.list[0].size : "",
          model: "link",
        };
        this.res.options.list.push(way);
      }
    },
    addHotPoint() {
      let way = {
        img: "https://picsum.photos/id/264/200/200",
        text: "标题",
        link: "",
        url: "",
      };
      this.res.options.list[0].points.push(way);
    },
    // 图片选择器回显
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!val?.url) return;
      if (this.pictureField === "bgImage") {
        if (!this.selectedGoods.style) {
          this.selectedGoods.style = {};
        }
        this.selectedGoods.style.bgImage = val.url;
        return;
      }
      this.selectedGoods[this.pictureField] = val.url;
    },
    // 点击选择图片
    handleClickFile(item, index, field = "img") {
      this.pictureField = field;
      this.selectedGoods = item;
      this.picModelFlag = true;
      this.$nextTick(() => {
        const oss = this.$refs.ossManage;
        if (!oss) return;
        oss.selectImage = true;
        if (field === "videoUrl") {
          oss.fileType = "video";
        } else {
          oss.fileType = "pic";
        }
        oss.changeFileType();
      });
    },
    removeNotice(index) {
      this.$nextTick(() => {
        this.res.options.list[0].title.splice(index, 1);
      });
    },
    // 关闭
    closeDecorate(index) {
      this.$nextTick(() => {
        this.res.options.list.splice(index, 1);
      });
    },
  },
};
</script>
<style scoped lang="scss">
@import "./decorate.scss";
</style>
